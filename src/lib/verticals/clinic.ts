import type { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import { VerticalHandler, ValidationResult, TransactionResult } from './types';

export const clinicHandler: VerticalHandler = {
  validateProposal(payload: any): ValidationResult {
    const errors: string[] = [];
    if (!payload) return { valid: false, errors: ['Payload is required'] };
    if (!payload.workspaceId) errors.push('workspaceId is required');
    if (!payload.patientId && !payload.customerId) errors.push('patientId is required');

    const action = payload.action || payload.intent;
    if (!['BOOK_APPOINTMENT', 'RESCHEDULE_APPOINTMENT', 'CANCEL_APPOINTMENT'].includes(action)) {
      errors.push(`Unsupported clinic action: ${action}`);
    }

    // Strict privacy boundary: Check if proposal attempts diagnostic data entry
    if (payload.medicalNotes || payload.symptoms || payload.prescription || payload.diagnosis) {
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

    const {
      workspaceId,
      patientId = actorId,
      doctorId = 'doc_01',
      slotId,
      appointmentDate,
      timeSlot,
      action = payload.intent,
    } = payload;

    const now = new Date().toISOString();

    // Verify foreign key for submissionId
    let finalSubId: string | null = null;
    if (submissionId) {
      const validSub = db.prepare('SELECT id FROM voice_submissions WHERE id = ?').get(submissionId) as any;
      if (validSub) finalSubId = validSub.id;
    }

    // 1. CANCEL APPOINTMENT
    if (action === 'CANCEL_APPOINTMENT') {
      const apptId = payload.appointmentId;
      if (!apptId) throw new Error('appointmentId required for cancellation');

      const existing = db.prepare('SELECT * FROM clinic_appointments WHERE id = ?').get(apptId) as any;
      if (!existing) throw new Error(`Appointment ${apptId} not found`);

      // Release slot if assigned
      if (existing.slot_id) {
        db.prepare('UPDATE clinic_appointment_slots SET is_booked = 0 WHERE id = ?').run(existing.slot_id);
      }

      db.prepare("UPDATE clinic_appointments SET status = 'CANCELLED' WHERE id = ?").run(apptId);

      return {
        success: true,
        entityId: apptId,
        summary: `Appointment ${apptId} has been successfully cancelled`,
      };
    }

    // 2. RESCHEDULE APPOINTMENT
    if (action === 'RESCHEDULE_APPOINTMENT') {
      const apptId = payload.appointmentId;
      if (!apptId) throw new Error('appointmentId required for reschedule');

      const existing = db.prepare('SELECT * FROM clinic_appointments WHERE id = ?').get(apptId) as any;
      if (!existing) throw new Error(`Appointment ${apptId} not found`);

      const newDate = appointmentDate || existing.appointment_date;
      let newSlotId = slotId;

      if (newSlotId) {
        const slot = db.prepare('SELECT * FROM clinic_appointment_slots WHERE id = ?').get(newSlotId) as any;
        if (!slot) throw new Error(`Requested slot ${newSlotId} not found`);
        if (slot.is_booked && slot.id !== existing.slot_id) {
          throw new Error(`Slot ${newSlotId} is already booked by another patient`);
        }
      } else {
        // Allocate next free slot for date/doctor
        const freeSlot = db.prepare(`
          SELECT * FROM clinic_appointment_slots
          WHERE workspace_id = ? AND doctor_id = ? AND slot_date = ? AND is_booked = 0
          LIMIT 1
        `).get(workspaceId, existing.doctor_id, newDate) as any;

        if (freeSlot) {
          newSlotId = freeSlot.id;
        } else {
          // Create on-demand slot
          newSlotId = `slot_${crypto.randomUUID().slice(0, 8)}`;
          db.prepare(`
            INSERT INTO clinic_appointment_slots (id, workspace_id, doctor_id, slot_date, start_time, end_time, is_booked, max_capacity)
            VALUES (?, ?, ?, ?, '15:00:00', '15:30:00', 0, 1)
          `).run(newSlotId, workspaceId, existing.doctor_id, newDate);
        }
      }

      // Free old slot
      if (existing.slot_id && existing.slot_id !== newSlotId) {
        db.prepare('UPDATE clinic_appointment_slots SET is_booked = 0 WHERE id = ?').run(existing.slot_id);
      }

      // Book new slot
      db.prepare('UPDATE clinic_appointment_slots SET is_booked = 1 WHERE id = ?').run(newSlotId);

      // Fetch slot time for display
      const slotRec = db.prepare('SELECT start_time FROM clinic_appointment_slots WHERE id = ?').get(newSlotId) as any;
      const formattedTime = slotRec ? slotRec.start_time.slice(0, 5) : '15:00';

      db.prepare(`
        UPDATE clinic_appointments
        SET appointment_date = ?, slot_id = ?, time_slot = ?, status = 'CONFIRMED'
        WHERE id = ?
      `).run(newDate, newSlotId, formattedTime, apptId);

      return {
        success: true,
        entityId: apptId,
        summary: `Appointment ${apptId} rescheduled to ${newDate} at ${formattedTime}`,
        details: { appointmentId: apptId, newDate, newSlotId, timeSlot: formattedTime },
      };
    }

    // 3. BOOK APPOINTMENT
    const targetDocId = doctorId || 'doc_01';
    const targetDate = appointmentDate || new Date().toISOString().split('T')[0];

    // Check doctor exists
    const doc = db.prepare('SELECT * FROM clinic_doctors WHERE id = ?').get(targetDocId) as any;
    if (!doc) throw new Error(`Doctor ${targetDocId} not found`);

    let targetSlotId = slotId;
    let targetTime = timeSlot || '10:00:00';

    if (targetSlotId) {
      const slot = db.prepare('SELECT * FROM clinic_appointment_slots WHERE id = ?').get(targetSlotId) as any;
      if (!slot) throw new Error(`Slot ${targetSlotId} not found`);
      if (slot.is_booked) throw new Error(`Selected slot ${targetSlotId} is already booked`);
      targetTime = slot.start_time;
    } else {
      // Find first available slot on targetDate
      const availableSlot = db.prepare(`
        SELECT * FROM clinic_appointment_slots
        WHERE workspace_id = ? AND doctor_id = ? AND slot_date = ? AND is_booked = 0
        ORDER BY start_time ASC
        LIMIT 1
      `).get(workspaceId, targetDocId, targetDate) as any;

      if (availableSlot) {
        targetSlotId = availableSlot.id;
        targetTime = availableSlot.start_time;
      } else {
        // Create an on-demand slot for demo simplicity
        targetSlotId = `slot_${crypto.randomUUID().slice(0, 8)}`;
        db.prepare(`
          INSERT INTO clinic_appointment_slots (id, workspace_id, doctor_id, slot_date, start_time, end_time, is_booked, max_capacity)
          VALUES (?, ?, ?, ?, '11:30:00', '12:00:00', 0, 1)
        `).run(targetSlotId, workspaceId, targetDocId, targetDate);
        targetTime = '11:30:00';
      }
    }

    // Double-booking check: Does this patient already have an active appointment with the same doctor on this date?
    const existingPatientAppt = db.prepare(`
      SELECT id FROM clinic_appointments
      WHERE workspace_id = ? AND patient_id = ? AND doctor_id = ? AND appointment_date = ? AND status != 'CANCELLED'
    `).get(workspaceId, patientId, targetDocId, targetDate) as any;

    if (existingPatientAppt) {
      throw new Error(`Patient already has an active appointment (${existingPatientAppt.id}) with ${doc.name} on ${targetDate}`);
    }

    // Mark slot booked
    db.prepare('UPDATE clinic_appointment_slots SET is_booked = 1 WHERE id = ?').run(targetSlotId);

    // Insert appointment
    const appointmentId = `appt_${crypto.randomUUID().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO clinic_appointments (id, workspace_id, patient_id, doctor_id, slot_id, appointment_date, time_slot, status, created_at, source_submission_id, voice_submission_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, ?, ?)
    `).run(appointmentId, workspaceId, patientId, targetDocId, targetSlotId, targetDate, targetTime.slice(0, 5), now, finalSubId, finalSubId);

    const summary = `Confirmed appointment with ${doc.name} (${doc.department}) on ${targetDate} at ${targetTime.slice(0, 5)}. Consultation fee: ₹${(doc.consultation_fee_paise / 100).toFixed(2)}`;

    return {
      success: true,
      entityId: appointmentId,
      summary,
      details: {
        appointmentId,
        doctorId: targetDocId,
        doctorName: doc.name,
        department: doc.department,
        feePaise: doc.consultation_fee_paise,
        slotId: targetSlotId,
        appointmentDate: targetDate,
        timeSlot: targetTime.slice(0, 5),
      },
    };
  },
};
