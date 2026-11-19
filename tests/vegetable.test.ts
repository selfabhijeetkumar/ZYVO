import assert from 'node:assert';
import { getDb } from '../src/lib/db/index';
import { vegetableHandler } from '../src/lib/verticals/vegetable';
import { extractSlotsFromTranscript } from '../src/lib/voice/slot-extractor';

console.log('====================================================');
console.log('   RUNNING PHASE 5: VEGETABLE OPERATIONS TESTS');
console.log('====================================================\n');

async function runVegetableTests() {
  const db = getDb();
  const workspaceId = 'ws_veg_01';
  const customerId = 'user_customer_01';

  // 1. Voice Extraction with Regional Aliases & Fractional Units
  const transcript = 'Ek kilo aloo, aadha kilo tamatar aur do gaddi dhaniya bhej dena';
  const proposal = await extractSlotsFromTranscript(transcript, 'vegetable_vendor', {
    workspaceId,
    customerId,
  });

  assert.strictEqual(proposal.intent, 'CREATE_PRODUCE_ORDER');
  assert.strictEqual(proposal.needsClarification, false);
  assert(proposal.parsedFields.items.length >= 3, 'Must extract at least 3 produce items');
  console.log('✓ Test 1: Produce items and units extracted successfully');

  // 2. Fractional Pricing & Unit Calculation Test
  // Aloo: 2 kg @ ₹30/kg = 6000p
  // Tamatar: 0.5 kg @ ₹40/kg = 2000p
  // Dhaniya: 2 bundles @ ₹15 = 3000p
  // Adrak: 250 grams @ ₹120/kg = (120 * 250)/1000 = 3000p
  // Total: 6000 + 2000 + 3000 + 3000 = 14,000 paise (₹140.00)
  const orderRes = await vegetableHandler.applyTransaction(db, 'sub_test_veg', {
    workspaceId,
    customerId,
    items: [
      { requestedItemName: 'aloo', quantity: 2, unit: 'kg' },
      { requestedItemName: 'tamatar', quantity: 0.5, unit: 'kg' },
      { requestedItemName: 'dhaniya', quantity: 2, unit: 'bundles' },
      { requestedItemName: 'adrak', quantity: 250, unit: 'grams' },
    ],
    deliveryAddress: 'Doorstep Drop',
  }, customerId);

  assert.strictEqual(orderRes.success, true);
  const orderId = orderRes.entityId!;

  const order = db.prepare('SELECT * FROM vegetable_orders WHERE id = ?').get(orderId) as any;
  assert(order, 'Vegetable order must exist');
  assert.strictEqual(order.total_amount_paise, 14000, 'Subtotal must equal exactly 14,000 paise (₹140.00)');

  const items = db.prepare('SELECT * FROM vegetable_order_items WHERE order_id = ?').all(orderId) as any[];
  assert.strictEqual(items.length, 4, 'Must have exactly 4 produce line items');
  console.log('✓ Test 2: Fractional weights (grams/bundles/kg) & subtotal verified (₹140.00)');

  // 3. Vendor Status Update
  const statusRes = await vegetableHandler.applyTransaction(db, 'sub_test_vstat', {
    action: 'UPDATE_ORDER_STATUS',
    workspaceId,
    orderId,
    newStatus: 'WEIGHED_AND_PACKED',
    reason: 'Weighed on digital scale and bagged',
  }, 'user_operator_01');

  assert.strictEqual(statusRes.success, true);
  const updatedOrder = db.prepare('SELECT order_status FROM vegetable_orders WHERE id = ?').get(orderId) as any;
  assert.strictEqual(updatedOrder.order_status, 'WEIGHED_AND_PACKED');
  console.log('✓ Test 3: Vendor produce status update verified');

  console.log('\n====================================================');
  console.log('   ALL VEGETABLE OPERATIONS TESTS PASSED (100%)');
  console.log('====================================================\n');
}

runVegetableTests().catch((err) => {
  console.error('Vegetable tests failed:', err);
  process.exit(1);
});
