import type { DatabaseSync } from 'node:sqlite';

export interface CustomerManifestItem {
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  productName: string;
  baseQuantityMl: number;
  scheduledQuantityMl: number;
  effectiveRatePaise: number;
  status: 'SCHEDULED' | 'PAUSED' | 'MODIFIED';
  notes?: string;
  calendarId?: string;
}

export interface VendorDailyManifest {
  workspaceId: string;
  manifestDate: string;
  cutoffTime: string;
  totalCustomers: number;
  activeDeliveries: number;
  pausedDeliveries: number;
  extraDeliveries: number;
  totalVolumeLitres: number;
  totalValuePaise: number;
  items: CustomerManifestItem[];
  exceptions: {
    paused: CustomerManifestItem[];
    extra: CustomerManifestItem[];
  };
}

export function getVendorDailyManifest(
  db: DatabaseSync,
  workspaceId: string,
  manifestDate: string // 'YYYY-MM-DD'
): VendorDailyManifest {
  // 1. Get vendor cutoff settings
  const cutoffRow = db.prepare('SELECT cutoff_time FROM milk_vendor_cutoffs WHERE vendor_id = ?').get(workspaceId) as any;
  const cutoffTime = cutoffRow ? cutoffRow.cutoff_time : '20:00:00';

  // 2. Get all active subscriptions for this vendor workspace
  const subscriptions = db.prepare(`
    SELECT s.*, u.name as customer_name, u.phone as customer_phone
    FROM milk_customer_subscriptions s
    JOIN users u ON s.customer_id = u.id
    WHERE s.workspace_id = ? AND s.is_active = 1
    ORDER BY u.name ASC
  `).all(workspaceId) as any[];

  // 3. Get all calendar overrides for this date
  const calendarRows = db.prepare(`
    SELECT * FROM milk_delivery_calendar
    WHERE workspace_id = ? AND delivery_date = ?
  `).all(workspaceId, manifestDate) as any[];

  const calendarMap = new Map<string, any>();
  for (const cal of calendarRows) {
    calendarMap.set(cal.customer_id, cal);
  }

  const items: CustomerManifestItem[] = [];
  const paused: CustomerManifestItem[] = [];
  const extra: CustomerManifestItem[] = [];

  let totalVolumeMl = 0;
  let totalValuePaise = 0;

  for (const sub of subscriptions) {
    const override = calendarMap.get(sub.customer_id);
    let status: CustomerManifestItem['status'] = 'SCHEDULED';
    let scheduledMl = sub.base_quantity_ml;
    let notes: string | undefined;

    if (override) {
      status = override.status;
      scheduledMl = override.scheduled_quantity_ml ?? override.quantity_ml ?? sub.base_quantity_ml;
      notes = override.reason;
    }

    if (status === 'PAUSED' || scheduledMl === 0) {
      status = 'PAUSED';
      scheduledMl = 0;
    } else if (scheduledMl !== sub.base_quantity_ml) {
      status = 'MODIFIED';
    }

    const item: CustomerManifestItem = {
      customerId: sub.customer_id,
      customerName: sub.customer_name,
      customerPhone: sub.customer_phone,
      deliveryAddress: 'Doorstep Morning Drop',
      productName: sub.product_name,
      baseQuantityMl: sub.base_quantity_ml,
      scheduledQuantityMl: scheduledMl,
      effectiveRatePaise: sub.unit_rate_paise,
      status,
      notes,
      calendarId: override?.id,
    };

    items.push(item);

    if (status === 'PAUSED') {
      paused.push(item);
    } else {
      totalVolumeMl += scheduledMl;
      totalValuePaise += Math.round((scheduledMl / 1000) * sub.unit_rate_paise);
      if (scheduledMl > sub.base_quantity_ml) {
        extra.push(item);
      }
    }
  }

  return {
    workspaceId,
    manifestDate,
    cutoffTime,
    totalCustomers: subscriptions.length,
    activeDeliveries: items.length - paused.length,
    pausedDeliveries: paused.length,
    extraDeliveries: extra.length,
    totalVolumeLitres: totalVolumeMl / 1000,
    totalValuePaise,
    items,
    exceptions: {
      paused,
      extra,
    },
  };
}
