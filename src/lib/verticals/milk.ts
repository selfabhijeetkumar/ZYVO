import type { DatabaseSync } from 'node:sqlite';
import { VerticalHandler, ValidationResult, TransactionResult } from './types';

export const milkHandler: VerticalHandler = {
  validateProposal(payload: any): ValidationResult {
    const errors: string[] = [];
    if (!payload) {
      return { valid: false, errors: ['Payload is required'] };
    }
    if (!['PAUSE_DELIVERY', 'RESUME_DELIVERY', 'UPDATE_QUANTITY'].includes(payload.action)) {
      errors.push(`Unsupported milk action: ${payload.action}`);
    }
    if (!payload.targetDate && !payload.startDate) {
      errors.push('Target date or start date is required');
    }
    if (payload.action === 'UPDATE_QUANTITY' && (!payload.quantityMl || payload.quantityMl <= 0)) {
      errors.push('Positive quantity in ml is required for UPDATE_QUANTITY');
    }
    if (!payload.workspaceId) {
      errors.push('workspaceId is required');
    }
    if (!payload.customerId) {
      errors.push('customerId is required');
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

    const { workspaceId, customerId, action } = payload;
    const startDate = payload.startDate || payload.targetDate;
    const endDate = payload.endDate || startDate;
    const quantityMl = payload.quantityMl || (action === 'PAUSE_DELIVERY' ? 0 : 1000);
    const status = action === 'PAUSE_DELIVERY' ? 'PAUSED' : 'ACTIVE';
    const reason = payload.reason || (action === 'PAUSE_DELIVERY' ? 'Customer requested pause via voice' : 'Voice update');
    const now = new Date().toISOString();

    // Iterate through dates from startDate to endDate
    const start = new Date(startDate);
    const end = new Date(endDate);
    const createdIds: string[] = [];

    const upsertStmt = db.prepare(`
      INSERT INTO milk_delivery_calendar (
        id, workspace_id, customer_id, delivery_date, product_name,
        scheduled_quantity_ml, quantity_ml, effective_rate_paise, status,
        source_submission_id, voice_submission_id, reason, updated_at
      )
      VALUES (?, ?, ?, ?, 'Cow Milk', ?, ?, 7000, ?, ?, ?, ?, ?)
      ON CONFLICT(workspace_id, customer_id, delivery_date) DO UPDATE SET
        status = excluded.status,
        scheduled_quantity_ml = excluded.scheduled_quantity_ml,
        quantity_ml = excluded.quantity_ml,
        reason = excluded.reason,
        updated_at = excluded.updated_at,
        source_submission_id = excluded.source_submission_id,
        voice_submission_id = excluded.voice_submission_id
    `);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const calId = `cal_${customerId}_${dateStr}`;
      upsertStmt.run(calId, workspaceId, customerId, dateStr, quantityMl, quantityMl, status, submissionId, submissionId, reason, now);
      createdIds.push(calId);
    }

    const summary = action === 'PAUSE_DELIVERY'
      ? `Paused milk delivery from ${startDate} to ${endDate}`
      : action === 'UPDATE_QUANTITY'
      ? `Updated milk delivery quantity to ${quantityMl}ml for ${startDate}`
      : `Resumed milk delivery from ${startDate} to ${endDate}`;

    return {
      success: true,
      entityId: createdIds[0],
      summary,
      details: {
        affectedDates: createdIds.length,
        startDate,
        endDate,
        status,
        quantityMl,
      },
    };
  },
};
