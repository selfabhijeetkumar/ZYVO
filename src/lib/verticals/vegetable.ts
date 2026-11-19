import type { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import { VerticalHandler, ValidationResult, TransactionResult } from './types';

export const vegetableHandler: VerticalHandler = {
  validateProposal(payload: any): ValidationResult {
    const errors: string[] = [];
    if (!payload) return { valid: false, errors: ['Payload is required'] };
    if (!payload.workspaceId) errors.push('workspaceId is required');
    if (!payload.customerId) errors.push('customerId is required');
    if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
      errors.push('At least one item is required in produce items array');
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

    const { workspaceId, customerId, items } = payload;
    const orderId = `vord_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    let estimatedTotalPaise = 0;
    const resolvedItems: any[] = [];

    for (const item of items) {
      const requestedName = item.requestedItemName || item.name;
      const quantity = Number(item.quantity) || 1;
      const unit = (item.unit || 'kg').toLowerCase();

      // Alias or name match
      let produceItem: any = null;
      if (item.produceId) {
        produceItem = db.prepare('SELECT * FROM vegetable_produce_catalog WHERE id = ?').get(item.produceId);
      } else {
        const aliasMatch = db.prepare(`
          SELECT p.* FROM vegetable_produce_aliases a
          JOIN vegetable_produce_catalog p ON a.produce_id = p.id
          WHERE lower(a.alias_term) = lower(?) AND p.workspace_id = ?
        `).get(requestedName.trim(), workspaceId) as any;

        if (aliasMatch) {
          produceItem = aliasMatch;
        } else {
          produceItem = db.prepare(`
            SELECT * FROM vegetable_produce_catalog
            WHERE lower(name) LIKE ? AND workspace_id = ?
          `).get(`%${requestedName.trim().toLowerCase()}%`, workspaceId) as any;
        }
      }

      const dailyRatePaise = produceItem ? produceItem.daily_rate_paise : 3000; // fallback ₹30/kg
      let estimatedItemPaise = 0;

      if (unit === 'grams' || unit === 'gm' || unit === 'g') {
        estimatedItemPaise = Math.round((dailyRatePaise * quantity) / 1000);
      } else {
        estimatedItemPaise = Math.round(dailyRatePaise * quantity);
      }

      estimatedTotalPaise += estimatedItemPaise;

      resolvedItems.push({
        id: `vitem_${crypto.randomUUID().slice(0, 8)}`,
        orderId,
        produceId: produceItem ? produceItem.id : null,
        requestedItemName: requestedName,
        quantity,
        unit,
        unitRatePaise: dailyRatePaise,
        estimatedItemPaise,
      });
    }

    // Insert order header
    db.prepare(`
      INSERT INTO vegetable_orders (id, workspace_id, customer_id, status, estimated_total_paise, created_at, voice_submission_id)
      VALUES (?, ?, ?, 'PENDING_WEIGHING', ?, ?, ?)
    `).run(orderId, workspaceId, customerId, estimatedTotalPaise, now, submissionId);

    // Insert items
    const insertLineItem = db.prepare(`
      INSERT INTO vegetable_order_items (id, order_id, produce_id, requested_item_name, quantity, unit, unit_rate_paise, estimated_item_paise)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const ri of resolvedItems) {
      insertLineItem.run(ri.id, ri.orderId, ri.produceId, ri.requestedItemName, ri.quantity, ri.unit, ri.unitRatePaise, ri.estimatedItemPaise);
    }

    const summary = `Created Vegetable basket ${orderId} with ${resolvedItems.length} item(s) totalling approx ₹${(estimatedTotalPaise / 100).toFixed(2)}`;

    return {
      success: true,
      entityId: orderId,
      summary,
      details: {
        orderId,
        itemCount: resolvedItems.length,
        estimatedTotalPaise,
      },
    };
  },
};
