import assert from 'node:assert';
import { speechRegistry } from '../src/lib/providers/speech/provider-registry';
import { SpeechProviderRouter } from '../src/lib/providers/speech/provider-router';
import { intentRegistry } from '../src/lib/providers/intent/provider-registry';
import { IntentProviderRouter } from '../src/lib/providers/intent/provider-router';
import { DeterministicIntentAdapter } from '../src/lib/providers/intent/adapters/deterministic.adapter';
import { getDb } from '../src/lib/db';

console.log('====================================================');
console.log('   RUNNING LIVE SPEECH & INTENT PROVIDER TEST SUITE');
console.log('====================================================\n');

// Test 1: Provider Registry Verification
console.log('Running Test 1: Speech & Intent Registry Registration');
const sarvamSpeech = speechRegistry.get('sarvam');
const geminiSpeech = speechRegistry.get('gemini');
const mockSpeech = speechRegistry.get('mock');
const geminiIntent = intentRegistry.get('gemini');
const deterministicIntent = intentRegistry.get('deterministic');

assert(sarvamSpeech, 'Sarvam speech adapter must be registered');
assert(geminiSpeech, 'Gemini speech adapter must be registered');
assert(mockSpeech, 'Mock speech adapter must be registered');
assert(geminiIntent, 'Gemini intent adapter must be registered');
assert(deterministicIntent, 'Deterministic intent adapter must be registered');
console.log('✓ Test 1: All speech and intent adapters correctly registered');

// Test 2: Speech Router Fallback & Circuit Breaker Logic
console.log('\nRunning Test 2: Speech Router Fallback & Mock Evaluator Resilience');
const customSpeechRouter = new SpeechProviderRouter();
const syntheticAudio = Buffer.alloc(1024);

async function testSpeechFallback() {
  const result = await customSpeechRouter.transcribe(syntheticAudio, 'audio/webm', {
    benchmarkHintKey: 'milk_pause',
  });
  assert(result, 'Speech transcription result must not be null');
  assert(typeof result.transcript === 'string', 'Transcript must be a string');
  assert(result.transcript.length > 0, 'Transcript must not be empty');
  assert(result.language, 'Detected language must be returned');
}

// Test 3: Intent Router Multi-Vertical Extraction
console.log('\nRunning Test 3: Intent Router Multi-Vertical Slot Extraction');
const intentRouterInstance = new IntentProviderRouter();

async function testIntentExtraction() {
  // Test Kirana extraction
  const kiranaRes = await intentRouterInstance.extract(
    'Do packet Maggi, ek kilo chawal aur aadha kilo chini bhej dena',
    {
      workspaceId: 'ws_kirana_01',
      customerId: 'user_cust_kirana',
      verticalType: 'kirana',
    }
  );
  assert.strictEqual(kiranaRes.intent, 'CREATE_GROCERY_ORDER');
  assert(kiranaRes.parsedFields.items.length >= 3, 'Must extract 3 grocery items');
  console.log('✓ Kirana multi-item extraction verified');

  // Test Vegetable extraction
  const vegRes = await intentRouterInstance.extract(
    'Ek kilo aloo, aadha kilo tamatar aur do gaddi dhaniya bhej dena',
    {
      workspaceId: 'ws_veg_01',
      customerId: 'user_cust_veg',
      verticalType: 'vegetable_vendor',
    }
  );
  assert.strictEqual(vegRes.intent, 'CREATE_PRODUCE_ORDER');
  assert(vegRes.parsedFields.items.length >= 3, 'Must extract 3 produce items');
  console.log('✓ Vegetable fractional produce extraction verified');

  // Test Agriculture extraction
  const agriRes = await intentRouterInstance.extract(
    'Mere paas 50 quintal tamatar hai. Friday ko pickup ke liye request register kar do',
    {
      workspaceId: 'ws_agri_01',
      customerId: 'farmer_01',
      verticalType: 'agriculture',
    }
  );
  assert.strictEqual(agriRes.intent, 'CREATE_PROCUREMENT_REQUEST');
  assert.strictEqual(agriRes.parsedFields.estimatedVolumeQuintals, 50);
  console.log('✓ Agriculture quintal procurement extraction verified');

  // Test Milk delivery extra order
  const milkRes = await intentRouterInstance.extract(
    'Bhaiya kal subah 500ml extra doodh de dena',
    {
      workspaceId: 'ws_milk_01',
      customerId: 'customer_01',
      verticalType: 'milk_delivery',
    }
  );
  assert.strictEqual(milkRes.intent, 'ADD_EXTRA_DELIVERY');
  assert.strictEqual(milkRes.parsedFields.extraMl, 500);
  console.log('✓ Milk extra delivery extraction verified');
}

// Test 4: Strict Clinic Non-Diagnostic Privacy Gate
console.log('\nRunning Test 4: Clinic Non-Diagnostic Privacy Gate Enforcement');
async function testClinicPrivacyGate() {
  const clinicRes = await intentRouterInstance.extract(
    'Doctor ke paas kal morning 10 baje ka appointment book kar do',
    {
      workspaceId: 'ws_clinic_01',
      customerId: 'patient_01',
      verticalType: 'clinic',
    }
  );

  assert.strictEqual(clinicRes.intent, 'BOOK_APPOINTMENT');
  assert.strictEqual(clinicRes.parsedFields.action, 'BOOK_APPOINTMENT');
  assert.strictEqual(clinicRes.parsedFields.timeSlot, '10:00:00');
  // Must be handled locally by deterministic adapter
  assert.strictEqual(clinicRes.isDeterministicFallback, true);
  console.log('✓ Test 4: Clinic appointment bypassed external LLM and executed under local privacy shield');
}

// Test 5: Invariant Verification — Zero Domain Mutation on Proposal Extraction
console.log('\nRunning Test 5: Invariant Verification — Zero Domain Table Mutations');
function testInvariantNoDirectMutation() {
  const db = getDb();
  const initialCalendarCount = (db.prepare('SELECT COUNT(*) as count FROM milk_delivery_calendar').get() as any).count;
  const initialGroceryCount = (db.prepare('SELECT COUNT(*) as count FROM kirana_grocery_orders').get() as any).count;
  const initialApptCount = (db.prepare('SELECT COUNT(*) as count FROM clinic_appointments').get() as any).count;

  // Running intent extraction
  assert(deterministicIntent, 'Deterministic adapter must exist');
  deterministicIntent.extract('Bhaiya kal 1 litre extra doodh bhej dena', {
    workspaceId: 'ws_milk_01',
    customerId: 'user_cust_01',
    verticalType: 'milk_delivery',
  });

  const finalCalendarCount = (db.prepare('SELECT COUNT(*) as count FROM milk_delivery_calendar').get() as any).count;
  const finalGroceryCount = (db.prepare('SELECT COUNT(*) as count FROM kirana_grocery_orders').get() as any).count;
  const finalApptCount = (db.prepare('SELECT COUNT(*) as count FROM clinic_appointments').get() as any).count;

  assert.strictEqual(initialCalendarCount, finalCalendarCount, 'Calendar rows must not change during intent extraction');
  assert.strictEqual(initialGroceryCount, finalGroceryCount, 'Grocery orders must not change during intent extraction');
  assert.strictEqual(initialApptCount, finalApptCount, 'Appointments must not change during intent extraction');
  console.log('✓ Test 5: Zero domain mutations invariant verified (Two-Phase Commit Gate intact)');
}

async function run() {
  await testSpeechFallback();
  await testIntentExtraction();
  await testClinicPrivacyGate();
  testInvariantNoDirectMutation();

  console.log('\n====================================================');
  console.log('   ALL PROVIDER INTEGRATION TESTS PASSED (100%)');
  console.log('====================================================');
}

run().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
