import type { DatabaseSync } from 'node:sqlite';
import { VerticalHandler, ValidationResult, TransactionResult } from './types';
import { checkCutoffCompliance } from './milk/temporal';

export const milkHandler: VerticalHandler = {
  validateProposal(payload: any): ValidationResult {
    const errors: string[] = [];
    if (!payload) {
      return { valid: false, errors: ['Payload is required'] };
    }

    const supportedActions = [
      'PAUSE_DELIVERY',
      'RESUME_DELIVERY',
      'CHANGE_QUANTITY',
      'ADD_EXTRA_DELIVERY',
      'SKIP_DELIVERY',
      'UPDATE_QUANTITY', // backward compat alias
    ];

    if (!supportedActions.includes(payload.action)) {
      errors.push(`Unsupported milk action: ${payload.action}`);
    }

    if (!payload.workspaceId) errors.push('workspaceId is required');
    if (!payload.customerId) errors.push('customerId is required');

    if (payload.action === 'CHANGE_QUANTITY' && (!payload.quantityMl || payload.quantityMl <= 0)) {
      errors.push('Positive quantity in ml is required for CHANGE_QUANTITY');
    }
    if (payload.action === 'ADD_EXTRA_DELIVERY' && (!payload.extraMl || payload.extraMl <= 0)) {
      errors.push('Positive extra quantity in ml is required for ADD_EXTRA_DELIVERY');
    }

    // Cutoff check for next-day actions
    if (payload.targetDate || payload.startDate) {
      const targetDate = payload.startDate || payload.targetDate;
      const refNow = payload.referenceNow || new Date().toISOString();
      const cutoffCheck = checkCutoffCompliance(refNow, targetDate);
      if (!cutoffCheck.allowed) {
        errors.push(cutoffCheck.reason || 'Cutoff validation failed');
      }
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
    const now = new Date().toISOString();

    // 1. Permanent Subscription Quantity Change
    if (action === 'CHANGE_QUANTITY' && payload.isPermanent) {
      const quantityMl = payload.quantityMl;
      db.prepare(`
        UPDATE milk_customer_subscriptions
        SET base_quantity_ml = ?
        WHERE workspace_id = ? AND customer_id = ?
      `).run(quantityMl, workspaceId, customerId);

      const summary = `Permanently updated regular daily subscription to ${quantityMl}ml`;
      return {
        success: true,
        entityId: `sub_${customerId}`,
        summary,
        details: { customerId, action, baseQuantityMl: quantityMl },
      };
    }

    // 2. Add Extra Milk for a Specific Date
    if (action === 'ADD_EXTRA_DELIVERY') {
      const targetDate = payload.targetDate || payload.startDate;
      const extraMl = Number(payload.extraMl) || 500;

      // Find current subscription base or existing calendar scheduled
      const sub = db.prepare('SELECT base_quantity_ml, unit_rate_paise FROM milk_customer_subscriptions WHERE workspace_id = ? AND customer_id = ?').get(workspaceId, customerId) as any;
      const baseMl = sub ? sub.base_quantity_ml : 1000;
      const ratePaise = sub ? sub.unit_rate_paise : 7000;
      const totalMl = baseMl + extraMl;
      const calId = `cal_${customerId}_${targetDate}`;

      db.prepare(`
        INSERT INTO milk_delivery_calendar (
          id, workspace_id, customer_id, delivery_date, product_name,
          scheduled_quantity_ml, quantity_ml, effective_rate_paise, status,
          source_submission_id, voice_submission_id, reason, updated_at
        ) VALUES (?, ?, ?, ?, 'Cow Milk', ?, ?, ?, 'MODIFIED', ?, ?, ?, ?)
        ON CONFLICT(workspace_id, customer_id, delivery_date) DO UPDATE SET
          status = excluded.status,
          scheduled_quantity_ml = excluded.scheduled_quantity_ml,
          quantity_ml = excluded.quantity_ml,
          reason = excluded.reason,
          updated_at = excluded.updated_at,
          source_submission_id = excluded.source_submission_id,
          voice_submission_id = excluded.voice_submission_id
      `).run(
        calId, workspaceId, customerId, targetDate, totalMl, totalMl, ratePaise,
        submissionId, submissionId, `Added +${extraMl}ml extra milk via voice`, now
      );

      return {
        success: true,
        entityId: calId,
        summary: `Added ${extraMl}ml extra milk for ${targetDate} (Total: ${totalMl}ml)`,
        details: { targetDate, extraMl, totalScheduledMl: totalMl },
      };
    }

    // 3. Resume Delivery
    if (action === 'RESUME_DELIVERY') {
      const startDate = payload.startDate || payload.targetDate;
      // Remove any paused calendar exceptions from startDate onward or set to SCHEDULED
      const sub = db.prepare('SELECT base_quantity_ml, unit_rate_paise FROM milk_customer_subscriptions WHERE workspace_id = ? AND customer_id = ?').get(workspaceId, customerId) as any;
      const baseMl = sub ? sub.base_quantity_ml : 1000;
      const ratePaise = sub ? sub.unit_rate_paise : 7000;

      db.prepare(`
        DELETE FROM milk_delivery_calendar
        WHERE workspace_id = ? AND customer_id = ? AND delivery_date >= ? AND status = 'PAUSED'
      `).run(workspaceId, customerId, startDate);

      const summary = `Resumed regular milk delivery (${baseMl}ml/day) starting ${startDate}`;
      return {
        success: true,
        entityId: `cal_${customerId}_${startDate}`,
        summary,
        details: { startDate, status: 'RESUMED', baseMl },
      };
    }

    // 4. Pause or Skip Delivery (Date or Date Range)
    const startDate = payload.startDate || payload.targetDate;
    const endDate = payload.endDate || startDate;
    const quantityMl = (action === 'PAUSE_DELIVERY' || action === 'SKIP_DELIVERY') ? 0 : (payload.quantityMl || 1000);
    const status = quantityMl === 0 ? 'PAUSED' : 'MODIFIED';
    const reason = payload.reason || (action === 'SKIP_DELIVERY' ? 'Customer skipped delivery' : 'Customer requested pause via voice');

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

    const summary = status === 'PAUSED'
      ? `Paused milk delivery from ${startDate} to ${endDate}`
      : `Updated milk delivery quantity to ${quantityMl}ml from ${startDate} to ${endDate}`;

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
