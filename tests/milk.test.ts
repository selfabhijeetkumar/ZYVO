import assert from 'node:assert';
import { getDb } from '../src/lib/db/index';
import { calculateMonthlyMilkBill } from '../src/lib/verticals/milk/billing';
import { checkCutoffCompliance } from '../src/lib/verticals/milk/temporal';
import { getVendorDailyManifest } from '../src/lib/verticals/milk/manifest';
import { milkHandler } from '../src/lib/verticals/milk';

console.log('====================================================');
console.log('   RUNNING PHASE 4: MILK DELIVERY OPERATIONS TESTS');
console.log('====================================================\n');

async function runMilkTests() {
  const db = getDb();
  const workspaceId = 'ws_milk_01';
  const customerId = 'user_customer_01';

  // Clean test calendar overrides before running
  db.prepare('DELETE FROM milk_delivery_calendar WHERE workspace_id = ?').run(workspaceId);
  db.prepare("DELETE FROM voice_submissions WHERE id LIKE 'sub_test%'").run();
  db.prepare('UPDATE milk_customer_subscriptions SET base_quantity_ml = 1000, unit_rate_paise = 7000 WHERE workspace_id = ?').run(workspaceId);

  // Insert valid parent voice submission for foreign key integrity
  db.prepare(`
    INSERT INTO voice_submissions (id, workspace_id, user_id, vertical_type, recorded_at, received_at, audio_file_path, audio_mime_type, state, status)
    VALUES ('sub_test_milk', 'ws_milk_01', 'user_customer_01', 'milk_delivery', '2026-11-19T00:00:00Z', '2026-11-19T00:00:00Z', 'dummy', 'audio/webm', 'AWAITING_CONFIRMATION', 'AWAITING_CONFIRMATION')
  `).run();

  // 1. Benchmark Calculation: Clean Month (30 days @ ₹70 = ₹2,100.00)
  const cleanBill = calculateMonthlyMilkBill(db, workspaceId, customerId, '2026-11');
  assert.strictEqual(cleanBill.totalDaysInMonth, 30);
  assert.strictEqual(cleanBill.baseContractAmountPaise, 210000, 'Base contract should be 210,000 paise');
  assert.strictEqual(cleanBill.pausedDays, 0);
  assert.strictEqual(cleanBill.totalBillPaise, 210000, 'Clean bill should be ₹2,100.00');
  console.log('✓ Test 1: Clean 30-day baseline bill verified (₹2,100.00)');

  // 2. The Phase 2 Benchmark Test: 30 days, 2 paused days, 0.5L extra on 1 day => Exactly ₹1,995.00
  // Pause Nov 20 and Nov 21
  db.prepare(`
    INSERT INTO milk_delivery_calendar (
      id, workspace_id, customer_id, delivery_date, product_name,
      scheduled_quantity_ml, quantity_ml, effective_rate_paise, status,
      source_submission_id, voice_submission_id, reason, updated_at
    ) VALUES
    ('cal_bench_20', 'ws_milk_01', 'user_customer_01', '2026-11-20', 'Cow Milk', 0, 0, 7000, 'PAUSED', 'sub_test_milk', 'sub_test_milk', 'Pause Day 1', '2026-11-19T00:00:00Z'),
    ('cal_bench_21', 'ws_milk_01', 'user_customer_01', '2026-11-21', 'Cow Milk', 0, 0, 7000, 'PAUSED', 'sub_test_milk', 'sub_test_milk', 'Pause Day 2', '2026-11-19T00:00:00Z'),
    ('cal_bench_22', 'ws_milk_01', 'user_customer_01', '2026-11-22', 'Cow Milk', 1500, 1500, 7000, 'MODIFIED', 'sub_test_milk', 'sub_test_milk', 'Extra 500ml', '2026-11-19T00:00:00Z')
  `).run();

  const benchBill = calculateMonthlyMilkBill(db, workspaceId, customerId, '2026-11');
  assert.strictEqual(benchBill.pausedDays, 2, 'Must have exactly 2 paused days');
  assert.strictEqual(benchBill.extraDeliveryDays, 1, 'Must have exactly 1 extra delivery day');
  assert.strictEqual(benchBill.pausedCreditDeductionPaise, 14000, 'Paused deduction must be 14,000 paise (2 * ₹70)');
  assert.strictEqual(benchBill.extraDeliveriesAmountPaise, 3500, 'Extra delivery must be 3,500 paise (0.5 * ₹70)');
  assert.strictEqual(benchBill.totalBillPaise, 199500, 'Benchmark bill total must be EXACTLY 199,500 paise (₹1,995.00)');
  assert.strictEqual(benchBill.totalBillRupees, '1995.00', 'Rupees display string must be 1995.00');
  console.log('✓ Test 2: Phase 2 Benchmark verified: 28 days + 0.5L extra = ₹1,995.00 (199,500 paise)');

  // 3. Cutoff Compliance Engine Tests
  // A: Submission at 14:00 (within cutoff) for tomorrow (Nov 20) -> Allowed
  const beforeCutoffCheck = checkCutoffCompliance('2026-11-19T14:00:00+05:30', '2026-11-20', '20:00:00');
  assert.strictEqual(beforeCutoffCheck.allowed, true, 'Submission before cutoff must be allowed');
  console.log('✓ Test 3A: Pre-cutoff request for next day permitted');

  // B: Submission at 20:15 (past 20:00 cutoff) for tomorrow (Nov 20) -> Blocked, earliest allowed is Nov 21
  const postCutoffCheck = checkCutoffCompliance('2026-11-19T20:15:00+05:30', '2026-11-20', '20:00:00');
  assert.strictEqual(postCutoffCheck.allowed, false, 'Submission post-cutoff for next day must be blocked');
  assert.strictEqual(postCutoffCheck.earliestAllowedDate, '2026-11-21', 'Earliest allowed date must shift to D+2');
  console.log('✓ Test 3B: Post-cutoff request for next day blocked; deferred to D+2');

  // 4. Milk Handler: Pause Operation
  const pauseRes = await milkHandler.applyTransaction(db, 'sub_test_milk', {
    action: 'PAUSE_DELIVERY',
    workspaceId,
    customerId,
    startDate: '2026-11-25',
    endDate: '2026-11-27',
    reason: 'Family trip',
  }, customerId);
  assert.strictEqual(pauseRes.success, true);
  const pausedRows = db.prepare(`
    SELECT * FROM milk_delivery_calendar
    WHERE workspace_id = ? AND customer_id = ? AND delivery_date >= '2026-11-25' AND delivery_date <= '2026-11-27'
  `).all(workspaceId, customerId) as any[];
  assert.strictEqual(pausedRows.length, 3, 'Must record 3 paused calendar days');
  assert.strictEqual(pausedRows[0].status, 'PAUSED');
  console.log('✓ Test 4: Pause date range applied atomically across 3 days');

  // 5. Milk Handler: Resume Delivery
  const resumeRes = await milkHandler.applyTransaction(db, 'sub_test_milk', {
    action: 'RESUME_DELIVERY',
    workspaceId,
    customerId,
    startDate: '2026-11-26',
  }, customerId);
  assert.strictEqual(resumeRes.success, true);
  const remainingPaused = db.prepare(`
    SELECT * FROM milk_delivery_calendar
    WHERE workspace_id = ? AND customer_id = ? AND delivery_date >= '2026-11-26' AND status = 'PAUSED'
  `).all(workspaceId, customerId);
  assert.strictEqual(remainingPaused.length, 0, 'Resumed dates must clear pause exceptions');
  console.log('✓ Test 5: Resume delivery cleared pause exceptions');

  // 6. Milk Handler: Add Extra Delivery
  const extraRes = await milkHandler.applyTransaction(db, 'sub_test_milk', {
    action: 'ADD_EXTRA_DELIVERY',
    workspaceId,
    customerId,
    targetDate: '2026-11-28',
    extraMl: 500,
  }, customerId);
  assert.strictEqual(extraRes.success, true);
  const extraRow = db.prepare('SELECT * FROM milk_delivery_calendar WHERE workspace_id = ? AND delivery_date = ?').get(workspaceId, '2026-11-28') as any;
  assert.strictEqual(extraRow.scheduled_quantity_ml, 1500, 'Scheduled quantity must be 1500ml');
  assert.strictEqual(extraRow.status, 'MODIFIED');
  console.log('✓ Test 6: Extra delivery (+500ml) recorded on calendar');

  // 7. Milk Handler: Permanent Base Quantity Change
  const permRes = await milkHandler.applyTransaction(db, 'sub_test_perm', {
    action: 'CHANGE_QUANTITY',
    workspaceId,
    customerId,
    quantityMl: 1500,
    isPermanent: true,
  }, customerId);
  assert.strictEqual(permRes.success, true);
  const updatedSub = db.prepare('SELECT base_quantity_ml FROM milk_customer_subscriptions WHERE workspace_id = ? AND customer_id = ?').get(workspaceId, customerId) as any;
  assert.strictEqual(updatedSub.base_quantity_ml, 1500, 'Subscription table base quantity must be updated to 1500ml');
  console.log('✓ Test 7: Permanent base subscription quantity changed to 1500ml');

  // Reset subscription back to 1000ml for manifest test
  db.prepare('UPDATE milk_customer_subscriptions SET base_quantity_ml = 1000 WHERE workspace_id = ?').run(workspaceId);

  // 8. Vendor Delivery Manifest Generation
  const manifest = getVendorDailyManifest(db, workspaceId, '2026-11-20');
  assert.strictEqual(manifest.manifestDate, '2026-11-20');
  assert(manifest.totalCustomers >= 1, 'Manifest must have at least 1 customer');
  assert.strictEqual(manifest.exceptions.paused.length, 1, 'Nov 20 must have 1 paused customer in exceptions');
  console.log('✓ Test 8: Vendor daily delivery manifest and exception lists generated');

  console.log('\n====================================================');
  console.log('   ALL PHASE 4 MILK OPERATIONS TESTS PASSED (100%)');
  console.log('====================================================\n');
}

runMilkTests().catch((err) => {
  console.error('Milk tests failed:', err);
  process.exit(1);
});
