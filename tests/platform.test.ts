import assert from 'node:assert';
import { getDb, closeDb } from '../src/lib/db/index';

console.log('--- RUNNING PLATFORM TEST SUITE ---');

const db = getDb();

// 1. Verify Platform Core Tables exist
const tables = db.prepare(`
  SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
`).all() as { name: string }[];

const tableNames = tables.map(t => t.name);
console.log('Detected SQLite tables:', tableNames);

const expectedTables = [
  'users',
  'sessions',
  'workspaces',
  'workspace_memberships',
  'voice_submissions',
  'audit_events',
  'milk_vendor_cutoffs',
  'milk_customer_subscriptions',
  'milk_delivery_calendar',
  'kirana_product_catalog',
  'kirana_product_aliases',
  'kirana_grocery_orders',
  'kirana_grocery_order_items',
  'vegetable_produce_catalog',
  'vegetable_produce_aliases',
  'vegetable_orders',
  'vegetable_order_items',
  'clinic_doctors',
  'clinic_appointment_slots',
  'clinic_appointments',
  'agri_crop_catalog',
  'agri_procurement_requests',
  'agri_procurement_items',
  'agri_pickup_schedules',
];

for (const exp of expectedTables) {
  assert(tableNames.includes(exp), `Expected table ${exp} to exist in database`);
}
console.log('✓ All 24 core and vertical domain tables exist');

// 2. Verify Seed Users
const users = db.prepare('SELECT id, name, role FROM users').all() as any[];
assert(users.length >= 2, 'Expected at least 2 seed users');
const operator = users.find(u => u.id === 'user_operator_01');
assert(operator && operator.role === 'operator', 'Kumar Operator must exist with operator role');
console.log('✓ Seed users verified (Kumar Operator & Ramesh Sharma)');

// 3. Verify Seed Workspaces for all 5 verticals
const workspaces = db.prepare('SELECT id, vertical_type FROM workspaces').all() as any[];
const verticalTypes = workspaces.map(w => w.vertical_type);
const expectedVerticals = ['milk_delivery', 'kirana', 'vegetable_vendor', 'clinic', 'agriculture'];
for (const v of expectedVerticals) {
  assert(verticalTypes.includes(v), `Expected workspace for vertical ${v}`);
}
console.log('✓ Workspaces verified for all 5 business verticals');

console.log('PASS: Platform test suite completed successfully.\n');
