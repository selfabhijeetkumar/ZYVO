import type { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import { VerticalHandler, ValidationResult, TransactionResult } from './types';

export const vegetableHandler: VerticalHandler = {
  validateProposal(payload: any): ValidationResult {
    const errors: string[] = [];
    if (!payload) return { valid: false, errors: ['Payload is required'] };
    if (!payload.workspaceId) errors.push('workspaceId is required');

    if (payload.action === 'UPDATE_ORDER_STATUS') {
      if (!payload.orderId) errors.push('orderId is required for status update');
      if (!['PENDING_WEIGHING', 'WEIGHED_AND_PACKED', 'OUT_FOR_DELIVERY', 'FULFILLED', 'CANCELLED'].includes(payload.newStatus)) {
        errors.push(`Invalid vegetable order status: ${payload.newStatus}`);
      }
      return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
    }

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

    const { workspaceId, customerId } = payload;
    const now = new Date().toISOString();

    // 1. Vendor Status Update
    if (payload.action === 'UPDATE_ORDER_STATUS') {
      const { orderId, newStatus, reason } = payload;
      db.prepare(`
        UPDATE vegetable_orders
        SET order_status = ?, status = ?
        WHERE id = ? AND workspace_id = ?
      `).run(newStatus, newStatus, orderId, workspaceId);

      return {
        success: true,
        entityId: orderId,
        summary: `Vegetable order ${orderId} marked as ${newStatus}${reason ? ` (${reason})` : ''}`,
        details: { orderId, newStatus, reason },
      };
    }

    // 2. Customer Basket Creation
    const { items, deliveryAddress } = payload;
    const orderId = `vord_${crypto.randomUUID().slice(0, 8)}`;

    let estimatedTotalPaise = 0;
    const resolvedItems: any[] = [];

    for (const item of items) {
      const requestedName = (item.requestedItemName || item.name || '').trim();
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
        `).get(requestedName, workspaceId) as any;

        if (aliasMatch) {
          produceItem = aliasMatch;
        } else {
          produceItem = db.prepare(`
            SELECT * FROM vegetable_produce_catalog
            WHERE lower(name) LIKE ? AND workspace_id = ?
          `).get(`%${requestedName.toLowerCase()}%`, workspaceId) as any;
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
        produceName: produceItem ? produceItem.name : requestedName,
        requestedItemName: requestedName,
        quantity,
        unit,
        unitRatePaise: dailyRatePaise,
        estimatedItemPaise,
      });
    }

    // Check if submissionId exists in voice_submissions or pass null
    const validSub = db.prepare('SELECT id FROM voice_submissions WHERE id = ?').get(submissionId) as any;
    const finalSubId = validSub ? validSub.id : null;

    // Insert order header
    db.prepare(`
      INSERT INTO vegetable_orders (
        id, workspace_id, customer_id, order_status, status, total_amount_paise,
        estimated_total_paise, delivery_date, delivery_address, created_at,
        source_submission_id, voice_submission_id
      ) VALUES (?, ?, ?, 'CONFIRMED', 'CONFIRMED', ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId, workspaceId, customerId, estimatedTotalPaise, estimatedTotalPaise,
      now.split('T')[0], deliveryAddress || 'Doorstep Morning Drop', now, finalSubId, finalSubId
    );

    // Insert items
    const insertLineItem = db.prepare(`
      INSERT INTO vegetable_order_items (
        id, order_id, produce_id, produce_name, requested_item_name,
        quantity, unit, unit_price_paise, unit_rate_paise, subtotal_paise, estimated_item_paise
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const ri of resolvedItems) {
      insertLineItem.run(
        ri.id, ri.orderId, ri.produceId, ri.produceName, ri.requestedItemName,
        ri.quantity, ri.unit, ri.unitRatePaise, ri.unitRatePaise, ri.estimatedItemPaise, ri.estimatedItemPaise
      );
    }

    const summary = `Created Vegetable basket ${orderId} with ${resolvedItems.length} item(s) totalling ₹${(estimatedTotalPaise / 100).toFixed(2)}`;

    return {
      success: true,
      entityId: orderId,
      summary,
      details: {
        orderId,
        itemCount: resolvedItems.length,
        estimatedTotalPaise,
        items: resolvedItems,
      },
    };
  },
};
