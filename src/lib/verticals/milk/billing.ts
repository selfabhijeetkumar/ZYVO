import type { DatabaseSync } from 'node:sqlite';

export interface DailyBillEntry {
  date: string;
  isPast: boolean;
  status: 'SCHEDULED' | 'DELIVERED' | 'PAUSED' | 'MODIFIED' | 'CANCELLED';
  baseQuantityMl: number;
  deliveredQuantityMl: number;
  ratePaise: number;
  dayAmountPaise: number;
  reason?: string;
}

export interface MonthBillSummary {
  workspaceId: string;
  customerId: string;
  yearMonth: string; // 'YYYY-MM'
  totalDaysInMonth: number;
  baseDailyQuantityMl: number;
  unitRatePaisePerLitre: number;
  
  // Breakdown
  activeDeliveryDays: number;
  pausedDays: number;
  extraDeliveryDays: number;
  totalVolumeDeliveredMl: number;
  
  // Financials in Integer Paise
  baseContractAmountPaise: number;
  pausedCreditDeductionPaise: number;
  extraDeliveriesAmountPaise: number;
  totalBillPaise: number;
  totalBillRupees: string;

  // Actual vs Projected
  actualBilledToDatePaise: number;
  projectedFuturePaise: number;

  dailyEntries: DailyBillEntry[];
}

export function calculateMonthlyMilkBill(
  db: DatabaseSync,
  workspaceId: string,
  customerId: string,
  yearMonth: string, // e.g. '2026-11'
  referenceNow: string = new Date().toISOString()
): MonthBillSummary {
  // 1. Retrieve customer subscription
  const sub = db.prepare(`
    SELECT * FROM milk_customer_subscriptions
    WHERE workspace_id = ? AND customer_id = ?
  `).get(workspaceId, customerId) as any;

  const baseDailyQuantityMl = sub ? sub.base_quantity_ml : 1000;
  const unitRatePaise = sub ? sub.unit_rate_paise : 7000; // ₹70/L default

  // 2. Parse year & month to determine days
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const totalDaysInMonth = new Date(year, month, 0).getDate();

  // 3. Retrieve all calendar records for this month
  const startDate = `${yearMonth}-01`;
  const endDate = `${yearMonth}-${String(totalDaysInMonth).padStart(2, '0')}`;

  const calendarRows = db.prepare(`
    SELECT * FROM milk_delivery_calendar
    WHERE workspace_id = ? AND customer_id = ? AND delivery_date >= ? AND delivery_date <= ?
  `).all(workspaceId, customerId, startDate, endDate) as any[];

  const calendarMap = new Map<string, any>();
  for (const row of calendarRows) {
    calendarMap.set(row.delivery_date, row);
  }

  const todayStr = referenceNow.split('T')[0];
  const dailyEntries: DailyBillEntry[] = [];

  let activeDeliveryDays = 0;
  let pausedDays = 0;
  let extraDeliveryDays = 0;
  let totalVolumeDeliveredMl = 0;
  let pausedCreditDeductionPaise = 0;
  let extraDeliveriesAmountPaise = 0;
  let actualBilledToDatePaise = 0;
  let projectedFuturePaise = 0;

  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dayStr = String(day).padStart(2, '0');
    const date = `${yearMonth}-${dayStr}`;
    const isPast = date < todayStr;
    const isToday = date === todayStr;

    const calOverride = calendarMap.get(date);
    let status: DailyBillEntry['status'] = 'SCHEDULED';
    let deliveredMl = baseDailyQuantityMl;
    let reason: string | undefined;

    if (calOverride) {
      status = calOverride.status;
      deliveredMl = calOverride.scheduled_quantity_ml ?? calOverride.quantity_ml ?? baseDailyQuantityMl;
      reason = calOverride.reason;
    }

    if (status === 'PAUSED' || deliveredMl === 0) {
      pausedDays += 1;
      deliveredMl = 0;
      // Pause credit equals the base daily charge deducted
      const deduction = Math.round((baseDailyQuantityMl / 1000) * unitRatePaise);
      pausedCreditDeductionPaise += deduction;
    } else {
      activeDeliveryDays += 1;
      if (deliveredMl > baseDailyQuantityMl) {
        extraDeliveryDays += 1;
        const extraMl = deliveredMl - baseDailyQuantityMl;
        extraDeliveriesAmountPaise += Math.round((extraMl / 1000) * unitRatePaise);
      } else if (deliveredMl < baseDailyQuantityMl) {
        const reducedMl = baseDailyQuantityMl - deliveredMl;
        pausedCreditDeductionPaise += Math.round((reducedMl / 1000) * unitRatePaise);
      }
    }

    totalVolumeDeliveredMl += deliveredMl;
    const dayPaise = Math.round((deliveredMl / 1000) * unitRatePaise);

    if (isPast || isToday) {
      actualBilledToDatePaise += dayPaise;
    } else {
      projectedFuturePaise += dayPaise;
    }

    dailyEntries.push({
      date,
      isPast: isPast || isToday,
      status,
      baseQuantityMl: baseDailyQuantityMl,
      deliveredQuantityMl: deliveredMl,
      ratePaise: unitRatePaise,
      dayAmountPaise: dayPaise,
      reason,
    });
  }

  // Base contract amount: total days * regular daily rate
  const baseContractAmountPaise = Math.round(totalDaysInMonth * (baseDailyQuantityMl / 1000) * unitRatePaise);
  
  // Total bill = base contract - paused credits + extra deliveries
  const totalBillPaise = baseContractAmountPaise - pausedCreditDeductionPaise + extraDeliveriesAmountPaise;
  const totalBillRupees = (totalBillPaise / 100).toFixed(2);

  return {
    workspaceId,
    customerId,
    yearMonth,
    totalDaysInMonth,
    baseDailyQuantityMl,
    unitRatePaisePerLitre: unitRatePaise,
    activeDeliveryDays,
    pausedDays,
    extraDeliveryDays,
    totalVolumeDeliveredMl,
    baseContractAmountPaise,
    pausedCreditDeductionPaise,
    extraDeliveriesAmountPaise,
    totalBillPaise,
    totalBillRupees,
    actualBilledToDatePaise,
    projectedFuturePaise,
    dailyEntries,
  };
}
