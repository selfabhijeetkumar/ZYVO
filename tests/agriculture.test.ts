import assert from 'node:assert';
import { getDb } from '../src/lib/db/index';
import { agricultureHandler } from '../src/lib/verticals/agriculture';

async function runTests() {
  console.log('====================================================');
  console.log('   RUNNING PHASE 5: AGRICULTURE OPERATIONS TESTS');
  console.log('====================================================\n');

  const db = getDb();

  // Test 1: Volume conversion & crop rate calculation (e.g. kg to quintals)
  console.log('Running Test 1: Volume Conversion (kg -> Quintals) & Indicative Payout Calculation');
  const kgPayload = {
    action: 'REGISTER_PROCUREMENT',
    workspaceId: 'ws_agri_01',
    farmerId: 'user_customer_01',
    cropName: 'Tomato',
    quantity: 500, // 500 kg = 5 quintals
    unit: 'kg',
    preferredDate: '2026-11-22',
    pickupLocation: 'Rampur Farm Sector 7',
  };

  const kgResult = await agricultureHandler.applyTransaction(db, 'sub_test_agri_kg', kgPayload, 'user_customer_01');
  assert.strictEqual(kgResult.success, true, 'Procurement transaction must succeed');
  assert.ok(kgResult.details, 'Transaction details must be defined');
  assert.strictEqual(kgResult.details.volumeQuintals, 5, '500 kg should convert to 5 quintals');
  // Tomato is ₹1,200/quintal (120,000 paise) -> 5 quintals * 120,000 paise = 600,000 paise (₹6,000.00)
  assert.strictEqual(kgResult.details.totalPayoutPaise, 600000, '5 quintals of tomato should equal 600,000 paise (₹6,000.00)');
  console.log(`✓ Test 1: Volume conversion verified: 500 kg -> 5 quintals @ ₹1,200/quintal = ₹6,000.00 (600,000 paise)`);

  // Test 2: Direct Quintal Procurement & Pickup Schedule Persistence
  console.log('\nRunning Test 2: Direct Quintal Procurement & Relational Table Persistence');
  const wheatPayload = {
    action: 'REGISTER_PROCUREMENT',
    workspaceId: 'ws_agri_01',
    farmerId: 'user_customer_01',
    cropName: 'Wheat',
    estimatedVolumeQuintals: 20,
    unit: 'quintals',
    variety: 'Sharbati A-Grade',
    preferredDate: '2026-11-23',
    pickupLocation: 'Warehouse Gate 3',
  };

  const wheatResult = await agricultureHandler.applyTransaction(db, 'sub_test_agri_wheat', wheatPayload, 'user_customer_01');
  assert.strictEqual(wheatResult.success, true);
  assert.ok(wheatResult.details, 'Transaction details must be defined');
  // Wheat is ₹2,425/quintal (242,500 paise, PIB official MSP) -> 20 quintals * 242,500 = 4,850,000 paise (₹48,500.00)
  assert.strictEqual(wheatResult.details.totalPayoutPaise, 4850000, '20 quintals of wheat should equal 4,850,000 paise');

  // Verify DB entities
  const reqRecord = db.prepare('SELECT * FROM agri_procurement_requests WHERE id = ?').get(wheatResult.entityId) as any;
  assert.strictEqual(reqRecord.status, 'REGISTERED');
  assert.strictEqual(reqRecord.estimated_volume_quintals, 20);

  const itemRecord = db.prepare('SELECT * FROM agri_procurement_items WHERE request_id = ?').get(wheatResult.entityId) as any;
  assert.strictEqual(itemRecord.crop_name, 'Wheat');
  assert.strictEqual(itemRecord.quantity_quintals, 20);
  assert.strictEqual(itemRecord.subtotal_paise, 4850000);

  const schedRecord = db.prepare('SELECT * FROM agri_pickup_schedules WHERE request_id = ?').get(wheatResult.entityId) as any;
  assert.strictEqual(schedRecord.pickup_location, 'Warehouse Gate 3');
  assert.strictEqual(schedRecord.pickup_status, 'SCHEDULED');
  console.log(`✓ Test 2: Wheat procurement (${wheatResult.entityId}) and relational entities successfully persisted`);

  // Test 3: Status Transition Workflow (REGISTERED -> VERIFIED -> COLLECTED)
  console.log('\nRunning Test 3: Procurement Lifecycle Transitions');
  await agricultureHandler.applyTransaction(db, 'sub_test_agri_status1', {
    action: 'UPDATE_PROCUREMENT_STATUS',
    workspaceId: 'ws_agri_01',
    requestId: wheatResult.entityId,
    status: 'VERIFIED',
  }, 'user_operator_01');

  let updatedReq = db.prepare('SELECT status FROM agri_procurement_requests WHERE id = ?').get(wheatResult.entityId) as any;
  assert.strictEqual(updatedReq.status, 'VERIFIED');

  await agricultureHandler.applyTransaction(db, 'sub_test_agri_status2', {
    action: 'UPDATE_PROCUREMENT_STATUS',
    workspaceId: 'ws_agri_01',
    requestId: wheatResult.entityId,
    status: 'COLLECTED',
  }, 'user_operator_01');

  updatedReq = db.prepare('SELECT status FROM agri_procurement_requests WHERE id = ?').get(wheatResult.entityId) as any;
  assert.strictEqual(updatedReq.status, 'COLLECTED');

  const completedSched = db.prepare('SELECT pickup_status FROM agri_pickup_schedules WHERE request_id = ?').get(wheatResult.entityId) as any;
  assert.strictEqual(completedSched.pickup_status, 'COMPLETED');
  console.log('✓ Test 3: Status transition workflow verified (REGISTERED -> VERIFIED -> COLLECTED / COMPLETED)');

  // Test 4: Cancellation Workflow
  console.log('\nRunning Test 4: Procurement Cancellation');
  await agricultureHandler.applyTransaction(db, 'sub_test_agri_cancel', {
    action: 'CANCEL_PROCUREMENT',
    workspaceId: 'ws_agri_01',
    requestId: kgResult.entityId,
  }, 'user_customer_01');

  const cancelledReq = db.prepare('SELECT status FROM agri_procurement_requests WHERE id = ?').get(kgResult.entityId) as any;
  assert.strictEqual(cancelledReq.status, 'CANCELLED');

  const cancelledSched = db.prepare('SELECT pickup_status FROM agri_pickup_schedules WHERE request_id = ?').get(kgResult.entityId) as any;
  assert.strictEqual(cancelledSched.pickup_status, 'CANCELLED');
  console.log('✓ Test 4: Procurement request and pickup schedule cancelled successfully');

  console.log('\n====================================================');
  console.log('   ALL AGRICULTURE OPERATIONS TESTS PASSED (100%)');
  console.log('====================================================\n');
}

runTests().catch((e) => {
  console.error('Test run failed:', e);
  process.exit(1);
});
