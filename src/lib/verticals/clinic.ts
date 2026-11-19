import type { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import { VerticalHandler, ValidationResult, TransactionResult } from './types';

export const clinicHandler: VerticalHandler = {
  validateProposal(payload: any): ValidationResult {
    const errors: string[] = [];
    if (!payload) return { valid: false, errors: ['Payload is required'] };
    if (!payload.workspaceId) errors.push('workspaceId is required');
    if (!payload.patientId) errors.push('patientId is required');
    if (!['BOOK_APPOINTMENT', 'RESCHEDULE_APPOINTMENT', 'CANCEL_APPOINTMENT'].includes(payload.action)) {
      errors.push(`Unsupported clinic action: ${payload.action}`);
    }

    // Strict privacy boundary: Check if proposal attempts diagnostic data entry
    if (payload.medicalNotes || payload.symptoms || payload.prescription) {
      errors.push('Privacy violation: ZYVO handles non-diagnostic appointment scheduling only. Clinical data must not be stored.');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  },

  async applyTransaction(db: DatabaseSync, submissionId: string, payload: any, actorId: string): Promise<TransactionResult> {
    const validation = this.validateProposal(payload);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors?.join(', ')}`);
    }

    const { workspaceId, patientId, doctorId, slotId, appointmentDate, action } = payload;
    const now = new Date().toISOString();

    if (action === 'CANCEL_APPOINTMENT') {
      const apptId = payload.appointmentId;
      if (!apptId) throw new Error('appointmentId required for cancellation');
      db.prepare("UPDATE clinic_appointments SET status = 'CANCELLED' WHERE id = ?").run(apptId);
      return {
        success: true,
        entityId: apptId,
        summary: `Appointment ${apptId} cancelled successfully`,
      };
    }

    // For booking:
    const appointmentId = `appt_${crypto.randomUUID().slice(0, 8)}`;
    const targetDocId = doctorId || 'doc_01';
    const targetDate = appointmentDate || new Date().toISOString().split('T')[0];

    // Find or assign slot
    let targetSlotId = slotId;
    if (!targetSlotId) {
      const availableSlot = db.prepare(`
        SELECT id FROM clinic_appointment_slots
        WHERE workspace_id = ? AND doctor_id = ? AND is_booked = 0
        LIMIT 1
      `).get(workspaceId, targetDocId) as any;

      if (availableSlot) {
        targetSlotId = availableSlot.id;
      } else {
        // Create an on-demand slot for demo simplicity
        targetSlotId = `slot_${crypto.randomUUID().slice(0, 8)}`;
        db.prepare(`
          INSERT INTO clinic_appointment_slots (id, workspace_id, doctor_id, slot_date, start_time, end_time, is_booked, max_capacity)
          VALUES (?, ?, ?, ?, '11:30:00', '12:00:00', 1, 1)
        `).run(targetSlotId, workspaceId, targetDocId, targetDate);
      }
    }

    // Mark slot booked
    db.prepare('UPDATE clinic_appointment_slots SET is_booked = 1 WHERE id = ?').run(targetSlotId);

    // Insert appointment
    db.prepare(`
      INSERT INTO clinic_appointments (id, workspace_id, patient_id, doctor_id, slot_id, appointment_date, status, created_at, voice_submission_id)
      VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, ?)
    `).run(appointmentId, workspaceId, patientId, targetDocId, targetSlotId, targetDate, now, submissionId);

    // Get doctor name for summary
    const doc = db.prepare('SELECT name FROM clinic_doctors WHERE id = ?').get(targetDocId) as any;
    const docName = doc ? doc.name : 'Doctor';

    const summary = `Booked appointment ${appointmentId} with ${docName} on ${targetDate}`;

    return {
      success: true,
      entityId: appointmentId,
      summary,
      details: {
        appointmentId,
        doctorId: targetDocId,
        slotId: targetSlotId,
        appointmentDate: targetDate,
      },
    };
  },
};
