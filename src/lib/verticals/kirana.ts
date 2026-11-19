import type { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import { VerticalHandler, ValidationResult, TransactionResult } from './types';

export const kiranaHandler: VerticalHandler = {
  validateProposal(payload: any): ValidationResult {
    const errors: string[] = [];
    if (!payload) {
      return { valid: false, errors: ['Payload is required'] };
    }
    if (!payload.workspaceId) errors.push('workspaceId is required');

    if (payload.action === 'UPDATE_ORDER_STATUS') {
      if (!payload.orderId) errors.push('orderId is required for status update');
      if (!['CONFIRMED', 'PACKED', 'FULFILLED', 'CANCELLED'].includes(payload.newStatus)) {
        errors.push(`Invalid order status: ${payload.newStatus}`);
      }
      return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
    }

    if (!payload.customerId) errors.push('customerId is required');
    if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
      errors.push('At least one item is required in items array');
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

    // 1. Order Status Transition (Vendor Operation)
    if (payload.action === 'UPDATE_ORDER_STATUS') {
      const { orderId, newStatus, reason } = payload;
      db.prepare(`
        UPDATE kirana_grocery_orders
        SET order_status = ?
        WHERE id = ? AND workspace_id = ?
      `).run(newStatus, orderId, workspaceId);

      return {
        success: true,
        entityId: orderId,
        summary: `Kirana order ${orderId} marked as ${newStatus}${reason ? ` (${reason})` : ''}`,
        details: { orderId, newStatus, reason },
      };
    }

    // 2. Create Grocery Order (Customer Operation)
    const { items, deliveryAddress } = payload;
    const orderId = `kord_${crypto.randomUUID().slice(0, 8)}`;

    let totalAmountPaise = 0;
    const resolvedItems: any[] = [];

    // Resolve items against catalog
    for (const item of items) {
      const requestedName = (item.requestedItemName || item.name || '').trim();
      const quantity = Number(item.quantity) || 1;
      const unit = item.unit || 'packet';

      let catalogItem: any = null;
      if (item.catalogId) {
        catalogItem = db.prepare('SELECT * FROM kirana_product_catalog WHERE id = ?').get(item.catalogId);
      } else {
        const aliasMatch = db.prepare(`
          SELECT c.* FROM kirana_product_aliases a
          JOIN kirana_product_catalog c ON a.catalog_id = c.id
          WHERE lower(a.alias_term) = lower(?) AND c.workspace_id = ?
        `).get(requestedName, workspaceId) as any;

        if (aliasMatch) {
          catalogItem = aliasMatch;
        } else {
          catalogItem = db.prepare(`
            SELECT * FROM kirana_product_catalog
            WHERE lower(name) LIKE ? AND workspace_id = ?
          `).get(`%${requestedName.toLowerCase()}%`, workspaceId) as any;
        }
      }

      const unitPricePaise = catalogItem ? catalogItem.unit_price_paise : 5000; // fallback ₹50
      const subtotalPaise = Math.round(unitPricePaise * quantity);
      totalAmountPaise += subtotalPaise;

      resolvedItems.push({
        id: `kitem_${crypto.randomUUID().slice(0, 8)}`,
        orderId,
        catalogId: catalogItem ? catalogItem.id : null,
        itemName: catalogItem ? catalogItem.name : requestedName,
        requestedItemName: requestedName,
        quantity,
        unit: catalogItem ? catalogItem.unit : unit,
        unitPricePaise,
        subtotalPaise,
      });
    }

    // Check if submissionId exists in voice_submissions or pass null
    const validSub = db.prepare('SELECT id FROM voice_submissions WHERE id = ?').get(submissionId) as any;
    const finalSubId = validSub ? validSub.id : null;

    // Insert order header
    db.prepare(`
      INSERT INTO kirana_grocery_orders (
        id, workspace_id, customer_id, order_status, total_amount_paise,
        delivery_address, created_at, source_submission_id, voice_submission_id
      ) VALUES (?, ?, ?, 'CONFIRMED', ?, ?, ?, ?, ?)
    `).run(
      orderId, workspaceId, customerId, totalAmountPaise,
      deliveryAddress || 'Default Customer Address', now, finalSubId, finalSubId
    );

    // Insert line items
    const insertLineItem = db.prepare(`
      INSERT INTO kirana_grocery_order_items (
        id, order_id, catalog_id, item_name, requested_item_name, quantity, unit,
        unit_price_paise, subtotal_paise
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const ri of resolvedItems) {
      insertLineItem.run(
        ri.id, ri.orderId, ri.catalogId, ri.itemName, ri.requestedItemName,
        ri.quantity, ri.unit, ri.unitPricePaise, ri.subtotalPaise
      );
    }

    const summary = `Created Kirana order ${orderId} with ${resolvedItems.length} item(s) totalling ₹${(totalAmountPaise / 100).toFixed(2)}`;

    return {
      success: true,
      entityId: orderId,
      summary,
      details: {
        orderId,
        itemCount: resolvedItems.length,
        totalAmountPaise,
        items: resolvedItems,
      },
    };
  },
};
