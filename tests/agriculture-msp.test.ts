import assert from 'node:assert';
import { getDb } from '../src/lib/db/index';

async function runTests() {
  console.log('====================================================');
  console.log('   RUNNING MSP COMPLIANCE REGRESSION TEST SUITE');
  console.log('====================================================\n');

  const db = getDb();

  // Test 1: Verify Tomato is NOT marked as MSP mandated
  console.log('Running Test 1: Verify Tomato has NO Government MSP label');
  const tomato = db.prepare('SELECT * FROM agri_crop_catalog WHERE crop_name = ?').get('Tomato') as any;
  assert.ok(tomato, 'Tomato record must exist');
  assert.strictEqual(tomato.is_msp_mandated, 0, 'Tomato MUST NOT be marked as is_msp_mandated');
  assert.strictEqual(tomato.price_type, 'indicative_market', 'Tomato price_type must be indicative_market');
  assert.strictEqual(tomato.source_url, null, 'Tomato must not have government MSP source_url');
  console.log('✓ Test 1: Tomato is strictly categorized as Non-MSP produce with indicative spot rate');

  // Test 2: Verify Potato is NOT marked as MSP mandated
  console.log('\nRunning Test 2: Verify Potato has NO Government MSP label');
  const potato = db.prepare('SELECT * FROM agri_crop_catalog WHERE crop_name = ?').get('Potato') as any;
  assert.ok(potato, 'Potato record must exist');
  assert.strictEqual(potato.is_msp_mandated, 0, 'Potato MUST NOT be marked as is_msp_mandated');
  assert.strictEqual(potato.price_type, 'indicative_market', 'Potato price_type must be indicative_market');
  assert.strictEqual(potato.source_url, null, 'Potato must not have government MSP source_url');
  console.log('✓ Test 2: Potato is strictly categorized as Non-MSP produce with indicative spot rate');

  // Test 3: Verify Wheat has official PIB CCEA MSP metadata
  console.log('\nRunning Test 3: Verify Wheat official MSP metadata & PIB reference');
  const wheat = db.prepare('SELECT * FROM agri_crop_catalog WHERE crop_name = ?').get('Wheat') as any;
  assert.ok(wheat, 'Wheat record must exist');
  assert.strictEqual(wheat.is_msp_mandated, 1, 'Wheat MUST be marked as is_msp_mandated=1');
  assert.strictEqual(wheat.price_type, 'msp_benchmark', 'Wheat price_type must be msp_benchmark');
  assert.strictEqual(wheat.price_value, 242500, 'Wheat RMS 2025-26 MSP must be 242,500 paise (₹2,425/quintal)');
  assert.ok(wheat.source_url.includes('pib.gov.in'), 'Wheat must have official PIB source_url');
  assert.ok(wheat.marketing_season.includes('2025-26'), 'Wheat must have valid marketing season');
  console.log('✓ Test 3: Wheat contains authentic PIB CCEA MSP benchmark metadata (₹2,425/q)');

  // Test 4: Verify Mustard Seed has official PIB CCEA MSP metadata
  console.log('\nRunning Test 4: Verify Mustard Seed official MSP metadata & PIB reference');
  const mustard = db.prepare("SELECT * FROM agri_crop_catalog WHERE crop_name LIKE '%Mustard%'").get() as any;
  assert.ok(mustard, 'Mustard record must exist');
  assert.strictEqual(mustard.is_msp_mandated, 1, 'Mustard MUST be marked as is_msp_mandated=1');
  assert.strictEqual(mustard.price_type, 'msp_benchmark', 'Mustard price_type must be msp_benchmark');
  assert.strictEqual(mustard.price_value, 595000, 'Mustard RMS 2025-26 MSP must be 595,000 paise (₹5,950/quintal)');
  assert.ok(mustard.source_url.includes('pib.gov.in'), 'Mustard must have official PIB source_url');
  console.log('✓ Test 4: Mustard Seed contains authentic PIB CCEA MSP benchmark metadata (₹5,950/q)');

  // Test 5: Verify MSP query boundary (Only mandated crops returned)
  console.log('\nRunning Test 5: Verify MSP query boundary filter');
  const mspCrops = db.prepare("SELECT crop_name FROM agri_crop_catalog WHERE is_msp_mandated = 1").all() as any[];
  const cropNames = mspCrops.map(c => c.crop_name);
  assert.ok(cropNames.includes('Wheat'), 'Wheat must be in MSP crops');
  assert.ok(cropNames.some(n => n.includes('Mustard')), 'Mustard must be in MSP crops');
  assert.ok(!cropNames.includes('Tomato'), 'Tomato MUST NEVER appear in MSP crops');
  assert.ok(!cropNames.includes('Potato'), 'Potato MUST NEVER appear in MSP crops');
  console.log('✓ Test 5: MSP boundary strictly verified: Only genuine mandated crops returned');

  console.log('\n====================================================');
  console.log('   ALL MSP COMPLIANCE REGRESSION TESTS PASSED (100%)');
  console.log('====================================================\n');
  process.exit(0);
}

runTests().catch((e) => {
  console.error('Test run failed:', e);
  process.exit(1);
});
