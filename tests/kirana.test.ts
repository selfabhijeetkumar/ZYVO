import assert from 'node:assert';
import { getDb } from '../src/lib/db/index';
import { kiranaHandler } from '../src/lib/verticals/kirana';
import { extractSlotsFromTranscript } from '../src/lib/voice/slot-extractor';

console.log('====================================================');
console.log('   RUNNING PHASE 5: KIRANA STORE OPERATIONS TESTS');
console.log('====================================================\n');

async function runKiranaTests() {
  const db = getDb();
  const workspaceId = 'ws_kirana_01';
  const customerId = 'user_customer_01';

  // 1. Voice Intent & Slot Extraction Test
  const transcript = 'Do packet Maggi, ek kilo chawal aur aadha kilo chini bhej dena';
  const proposal = await extractSlotsFromTranscript(transcript, 'kirana', {
    workspaceId,
    customerId,
  });

  assert.strictEqual(proposal.intent, 'CREATE_GROCERY_ORDER');
  assert.strictEqual(proposal.needsClarification, false);
  assert(proposal.parsedFields.items.length >= 3, 'Must extract at least 3 grocery items');
  console.log('✓ Test 1: Multilingual transcript slot extraction verified');

  // 2. Multilingual Alias Resolution & Order Creation
  const orderRes = await kiranaHandler.applyTransaction(db, 'sub_test_kirana', {
    workspaceId,
    customerId,
    items: [
      { requestedItemName: 'maggi', quantity: 2, unit: 'packet' }, // Maggi: ₹14 * 2 = ₹28 (2800p)
      { requestedItemName: 'chawal', quantity: 1, unit: 'kg' },    // Rice: ₹60 * 1 = ₹60 (6000p)
      { requestedItemName: 'shakkar', quantity: 0.5, unit: 'kg' }, // Sugar: ₹44 * 0.5 = ₹22 (2200p)
    ],
    deliveryAddress: 'House 42, Civil Lines',
  }, customerId);

  assert.strictEqual(orderRes.success, true);
  const orderId = orderRes.entityId!;
  
  // Verify order in database
  const order = db.prepare('SELECT * FROM kirana_grocery_orders WHERE id = ?').get(orderId) as any;
  assert(order, 'Order record must exist');
  assert.strictEqual(order.order_status, 'CONFIRMED');
  // Total: 2800 + 6000 + 2200 = 11000 paise (₹110.00)
  assert.strictEqual(order.total_amount_paise, 11000, 'Subtotal must equal exactly 11,000 paise (₹110.00)');

  // Verify line items
  const items = db.prepare('SELECT * FROM kirana_grocery_order_items WHERE order_id = ?').all(orderId) as any[];
  assert.strictEqual(items.length, 3, 'Must insert exactly 3 line items');
  console.log('✓ Test 2: Alias resolution & integer paise subtotal verified (₹110.00)');

  // 3. Vendor Status Update (PACKED -> FULFILLED)
  const statusRes = await kiranaHandler.applyTransaction(db, 'sub_test_kstat', {
    action: 'UPDATE_ORDER_STATUS',
    workspaceId,
    orderId,
    newStatus: 'PACKED',
    reason: 'Vendor completed bagging',
  }, 'user_operator_01');

  assert.strictEqual(statusRes.success, true);
  const updatedOrder = db.prepare('SELECT order_status FROM kirana_grocery_orders WHERE id = ?').get(orderId) as any;
  assert.strictEqual(updatedOrder.order_status, 'PACKED', 'Order status must be updated to PACKED');
  console.log('✓ Test 3: Vendor fulfillment status transition verified');

  console.log('\n====================================================');
  console.log('   ALL KIRANA OPERATIONS TESTS PASSED (100%)');
  console.log('====================================================\n');
}

runKiranaTests().catch((err) => {
  console.error('Kirana tests failed:', err);
  process.exit(1);
});
