export interface CutoffCheckResult {
  allowed: boolean;
  earliestAllowedDate: string;
  isPastCutoff: boolean;
  cutoffTime: string;
  reason?: string;
}

export function checkCutoffCompliance(
  referenceNow: string, // ISO string e.g. 2026-11-19T20:15:00+05:30
  targetStartDate: string, // 'YYYY-MM-DD' e.g. 2026-11-20
  cutoffTime: string = '20:00:00' // 'HH:MM:SS'
): CutoffCheckResult {
  const refDateObj = new Date(referenceNow);
  const refDateStr = refDateObj.toISOString().split('T')[0];

  // Calculate next day date
  const nextDayObj = new Date(refDateObj);
  nextDayObj.setDate(nextDayObj.getDate() + 1);
  const nextDayStr = nextDayObj.toISOString().split('T')[0];

  // Calculate Day+2
  const day2Obj = new Date(refDateObj);
  day2Obj.setDate(day2Obj.getDate() + 2);
  const day2Str = day2Obj.toISOString().split('T')[0];

  // Extract hours and minutes in IST (UTC+5:30)
  // Let's compute local time components
  const utcHours = refDateObj.getUTCHours();
  const utcMinutes = refDateObj.getUTCMinutes();
  const istMinutesTotal = (utcHours * 60 + utcMinutes + 330) % 1440;
  const istHours = Math.floor(istMinutesTotal / 60);
  const istMins = istMinutesTotal % 60;
  const currentIstTimeStr = `${String(istHours).padStart(2, '0')}:${String(istMins).padStart(2, '0')}:00`;

  const [cutoffH, cutoffM] = cutoffTime.split(':').map(Number);
  const cutoffMinutesTotal = cutoffH * 60 + cutoffM;
  const isPastCutoff = istMinutesTotal >= cutoffMinutesTotal;

  // If modifying today or next day when past cutoff
  if (targetStartDate <= nextDayStr && isPastCutoff) {
    return {
      allowed: false,
      earliestAllowedDate: day2Str,
      isPastCutoff: true,
      cutoffTime,
      reason: `Daily delivery cutoff (${cutoffTime.slice(0, 5)} IST) has passed for ${targetStartDate}. Changes can take effect starting ${day2Str}.`,
    };
  }

  // Modifying past dates is always rejected
  if (targetStartDate < refDateStr) {
    return {
      allowed: false,
      earliestAllowedDate: nextDayStr,
      isPastCutoff: false,
      cutoffTime,
      reason: `Cannot modify historical delivery date ${targetStartDate}.`,
    };
  }

  return {
    allowed: true,
    earliestAllowedDate: isPastCutoff ? day2Str : nextDayStr,
    isPastCutoff,
    cutoffTime,
  };
}
