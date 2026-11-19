import type { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import { VerticalHandler, ValidationResult, TransactionResult } from './types';

export const agricultureHandler: VerticalHandler = {
  validateProposal(payload: any): ValidationResult {
    const errors: string[] = [];
    if (!payload) return { valid: false, errors: ['Payload is required'] };
    if (!payload.workspaceId) errors.push('workspaceId is required');

    const action = payload.action || payload.intent || 'REGISTER_PROCUREMENT';

    if (action === 'UPDATE_PROCUREMENT_STATUS') {
      if (!payload.requestId) errors.push('requestId is required for status update');
      if (!payload.status) errors.push('status is required');
      return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
    }

    if (action === 'CANCEL_PROCUREMENT') {
      if (!payload.requestId) errors.push('requestId is required for cancellation');
      return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
    }

    if (!payload.farmerId && !payload.customerId) errors.push('farmerId is required');
    if (!payload.cropId && !payload.cropName && (!payload.items || payload.items.length === 0)) {
      errors.push('cropId, cropName, or items array is required');
    }

    const volume = payload.estimatedVolumeQuintals || payload.volumeQuintals || payload.quantity;
    if (payload.items && payload.items.length > 0) {
      // items array valid
    } else if (!volume || Number(volume) <= 0) {
      errors.push('estimatedVolumeQuintals must be greater than zero');
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

    const action = payload.action || payload.intent || 'REGISTER_PROCUREMENT';
    const now = new Date().toISOString();

    // Check voice submission foreign key
    let finalSubId: string | null = null;
    if (submissionId) {
      const validSub = db.prepare('SELECT id FROM voice_submissions WHERE id = ?').get(submissionId) as any;
      if (validSub) finalSubId = validSub.id;
    }

    // 1. UPDATE STATUS
    if (action === 'UPDATE_PROCUREMENT_STATUS') {
      const { requestId, status } = payload;
      const validStatuses = ['REGISTERED', 'VERIFIED', 'PICKUP_SCHEDULED', 'COLLECTED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid procurement status: ${status}. Expected one of: ${validStatuses.join(', ')}`);
      }

      db.prepare(`
        UPDATE agri_procurement_requests
        SET status = ?, request_status = ?
        WHERE id = ?
      `).run(status, status, requestId);

      if (status === 'COLLECTED' || status === 'PICKUP_SCHEDULED') {
        db.prepare(`
          UPDATE agri_pickup_schedules
          SET pickup_status = ?
          WHERE request_id = ?
        `).run(status === 'COLLECTED' ? 'COMPLETED' : 'SCHEDULED', requestId);
      }

      return {
        success: true,
        entityId: requestId,
        summary: `Procurement request ${requestId} status updated to ${status}`,
      };
    }

    // 2. CANCEL PROCUREMENT
    if (action === 'CANCEL_PROCUREMENT') {
      const { requestId } = payload;
      db.prepare(`
        UPDATE agri_procurement_requests
        SET status = 'CANCELLED', request_status = 'CANCELLED'
        WHERE id = ?
      `).run(requestId);

      db.prepare(`
        UPDATE agri_pickup_schedules
        SET pickup_status = 'CANCELLED'
        WHERE request_id = ?
      `).run(requestId);

      return {
        success: true,
        entityId: requestId,
        summary: `Procurement request ${requestId} cancelled successfully`,
      };
    }

    // 3. REGISTER PROCUREMENT
    const {
      workspaceId = 'ws_agri_01',
      farmerId = actorId,
      cropId,
      cropName,
      variety,
      estimatedVolumeQuintals,
      unit = 'quintals',
      pickupLocation = 'Farm Gate, Field 4',
      preferredDate = '2026-11-21',
      items,
    } = payload;

    const requestId = `agri_${crypto.randomUUID().slice(0, 8)}`;

    // Resolve volume to quintals
    let volumeQuintals = Number(estimatedVolumeQuintals || payload.volumeQuintals || payload.quantity || 0);
    if (unit.toLowerCase() === 'kg' || unit.toLowerCase() === 'kilos') {
      volumeQuintals = volumeQuintals / 100;
    } else if (unit.toLowerCase() === 'crates' || unit.toLowerCase() === 'crate') {
      volumeQuintals = (volumeQuintals * 25) / 100; // 25kg standard crate
    }

    // Resolve Crop
    let crop: any = null;
    if (cropId) {
      crop = db.prepare('SELECT * FROM agri_crop_catalog WHERE id = ?').get(cropId) as any;
    } else if (cropName) {
      crop = db.prepare(`
        SELECT * FROM agri_crop_catalog
        WHERE lower(crop_name) LIKE ? AND workspace_id = ?
      `).get(`%${cropName.trim().toLowerCase()}%`, workspaceId) as any;
    }

    if (!crop) {
      crop = db.prepare('SELECT * FROM agri_crop_catalog WHERE workspace_id = ? LIMIT 1').get(workspaceId) as any;
    }

    const finalCropId = crop ? crop.id : 'crop_01';
    const finalCropName = crop ? crop.crop_name : (cropName || 'Produce');
    const finalVariety = variety || (crop ? crop.variety : 'Standard A-Grade');
    const ratePaise = crop ? crop.indicative_rate_paise_per_quintal : 150000;
    const totalPayoutPaise = Math.round(ratePaise * volumeQuintals);

    // Insert into agri_procurement_requests
    db.prepare(`
      INSERT INTO agri_procurement_requests (
        id, workspace_id, farmer_id, crop_id, variety,
        estimated_volume_quintals, offered_rate_paise_per_quintal, total_estimated_payout_paise,
        total_indicative_value_paise, request_status, status, pickup_date,
        source_submission_id, voice_submission_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'REGISTERED', 'REGISTERED', ?, ?, ?, ?)
    `).run(
      requestId,
      workspaceId,
      farmerId,
      finalCropId,
      finalVariety,
      volumeQuintals,
      ratePaise,
      totalPayoutPaise,
      totalPayoutPaise,
      preferredDate,
      finalSubId,
      finalSubId,
      now
    );

    // Insert into agri_procurement_items
    const itemId = `agri_item_${crypto.randomUUID().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO agri_procurement_items (
        id, request_id, crop_id, crop_name, quantity_quintals,
        unit, grade_quality, rate_paise_per_quintal, subtotal_paise
      ) VALUES (?, ?, ?, ?, ?, 'quintal', ?, ?, ?)
    `).run(
      itemId,
      requestId,
      finalCropId,
      finalCropName,
      volumeQuintals,
      finalVariety,
      ratePaise,
      totalPayoutPaise
    );

    // Insert into agri_pickup_schedules
    const schedId = `sched_${crypto.randomUUID().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO agri_pickup_schedules (
        id, workspace_id, request_id, pickup_date, scheduled_pickup_date,
        pickup_location, pickup_status, logistics_notes
      ) VALUES (?, ?, ?, ?, ?, ?, 'SCHEDULED', ?)
    `).run(
      schedId,
      workspaceId,
      requestId,
      preferredDate,
      preferredDate,
      pickupLocation,
      'Scheduled via ZYVO Voice & Operator Platform'
    );

    const summary = `Registered procurement request for ${volumeQuintals} quintals of ${finalCropName} (${finalVariety}). Indicative payout: ₹${(totalPayoutPaise / 100).toLocaleString('en-IN')}`;

    return {
      success: true,
      entityId: requestId,
      summary,
      details: {
        requestId,
        cropId: finalCropId,
        cropName: finalCropName,
        variety: finalVariety,
        volumeQuintals,
        ratePaisePerQuintal: ratePaise,
        totalPayoutPaise,
        pickupLocation,
        pickupDate: preferredDate,
      },
    };
  },
};
