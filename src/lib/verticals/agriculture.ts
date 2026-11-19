import type { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import { VerticalHandler, ValidationResult, TransactionResult } from './types';

export const agricultureHandler: VerticalHandler = {
  validateProposal(payload: any): ValidationResult {
    const errors: string[] = [];
    if (!payload) return { valid: false, errors: ['Payload is required'] };
    if (!payload.workspaceId) errors.push('workspaceId is required');
    if (!payload.farmerId) errors.push('farmerId is required');
    if (!payload.cropId && !payload.cropName) errors.push('cropId or cropName is required');
    if (!payload.estimatedVolumeQuintals || payload.estimatedVolumeQuintals <= 0) {
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

    const { workspaceId, farmerId, cropId, cropName, variety, estimatedVolumeQuintals, pickupLocation, preferredDate } = payload;
    const requestId = `agri_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    // Find crop
    let crop: any = null;
    if (cropId) {
      crop = db.prepare('SELECT * FROM agri_crop_catalog WHERE id = ?').get(cropId);
    } else if (cropName) {
      crop = db.prepare(`
        SELECT * FROM agri_crop_catalog
        WHERE lower(crop_name) LIKE ? AND workspace_id = ?
      `).get(`%${cropName.trim().toLowerCase()}%`, workspaceId) as any;
    }

    const finalCropId = crop ? crop.id : 'crop_01';
    const finalCropName = crop ? crop.crop_name : (cropName || 'Produce');
    const ratePaise = crop ? crop.indicative_rate_paise_per_quintal : 150000; // ₹1,500/quintal
    const totalPayoutPaise = Math.round(ratePaise * Number(estimatedVolumeQuintals));

    // Insert procurement request
    db.prepare(`
      INSERT INTO agri_procurement_requests (id, workspace_id, farmer_id, crop_id, variety, estimated_volume_quintals, offered_rate_paise_per_quintal, total_estimated_payout_paise, status, created_at, voice_submission_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OFFER_SUBMITTED', ?, ?)
    `).run(
      requestId,
      workspaceId,
      farmerId,
      finalCropId,
      variety || (crop ? crop.variety : 'Standard'),
      Number(estimatedVolumeQuintals),
      ratePaise,
      totalPayoutPaise,
      now,
      submissionId
    );

    // Insert pickup schedule if location/date provided
    if (pickupLocation || preferredDate) {
      const scheduleId = `sched_${crypto.randomUUID().slice(0, 8)}`;
      db.prepare(`
        INSERT INTO agri_pickup_schedules (id, request_id, scheduled_pickup_date, pickup_location, logistics_notes)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        scheduleId,
        requestId,
        preferredDate || now.split('T')[0],
        pickupLocation || 'Farm Gate',
        'Pickup scheduled via ZYVO voice workflow'
      );
    }

    const summary = `Registered Agri procurement offer for ${estimatedVolumeQuintals} quintals of ${finalCropName} (Est. payout: ₹${(totalPayoutPaise / 100).toLocaleString('en-IN')})`;

    return {
      success: true,
      entityId: requestId,
      summary,
      details: {
        requestId,
        cropName: finalCropName,
        volumeQuintals: estimatedVolumeQuintals,
        ratePaise,
        totalPayoutPaise,
      },
    };
  },
};
