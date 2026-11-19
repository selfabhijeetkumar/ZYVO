import assert from 'node:assert';
import { getAllVerticalModules, getVerticalModule, isValidVertical } from '../src/lib/vertical-registry';

console.log('--- RUNNING REGISTRY TEST SUITE ---');

// 1. Exactly 5 modules
const modules = getAllVerticalModules();
assert.strictEqual(modules.length, 5, 'Exactly 5 modules must be registered');
console.log('✓ Exactly 5 modules registered');

// 2. Expected Module IDs and Routes
const expectedModules = [
  { id: 'milk_delivery', route: '/milk', status: 'active_reference' },
  { id: 'kirana', route: '/kirana', status: 'foundation_ready' },
  { id: 'vegetable_vendor', route: '/vegetables', status: 'foundation_ready' },
  { id: 'clinic', route: '/clinic', status: 'foundation_ready' },
  { id: 'agriculture', route: '/agriculture', status: 'foundation_ready' },
];

for (const exp of expectedModules) {
  const mod = getVerticalModule(exp.id);
  assert(mod, `Module ${exp.id} must be retrievable`);
  assert.strictEqual(mod.routePath, exp.route, `Route path for ${exp.id} must be ${exp.route}`);
  assert.strictEqual(mod.status, exp.status, `Status for ${exp.id} must be ${exp.status}`);
  assert(mod.iconName && mod.iconName.length > 0, `Icon name must be non-empty for ${exp.id}`);
  assert(mod.supportedIntents.length > 0, `Supported intents must be non-empty for ${exp.id}`);
  assert(mod.sampleTranscripts.length > 0, `Sample transcripts must be non-empty for ${exp.id}`);
}
console.log('✓ All 5 module contracts, routes, and statuses verified');

// 3. Unknown module handling
assert.strictEqual(getVerticalModule('unknown_vertical'), null, 'Unknown vertical must return null');
assert.strictEqual(isValidVertical('unknown_vertical'), false, 'Unknown vertical is not valid');
assert.strictEqual(isValidVertical('milk_delivery'), true, 'milk_delivery is valid vertical');
console.log('✓ Boundary check: Unknown verticals properly rejected');

console.log('PASS: Registry test suite completed successfully.\n');
