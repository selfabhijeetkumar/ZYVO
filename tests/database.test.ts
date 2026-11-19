import assert from 'node:assert';
import { getDb } from '../src/lib/db/index';

console.log('--- RUNNING DATABASE INTEGRITY TEST SUITE ---');

const db = getDb();

// 1. Verify PRAGMA foreign_keys is ON
const fkStatus = db.prepare('PRAGMA foreign_keys;').get() as { foreign_keys: number };
assert.strictEqual(fkStatus.foreign_keys, 1, 'PRAGMA foreign_keys must be ON');
console.log('✓ PRAGMA foreign_keys = ON verified');

// 2. Verify Foreign Key Constraint Enforcement
let fkThrew = false;
try {
  // Try inserting a workspace membership for a nonexistent user
  db.prepare(`
    INSERT INTO workspace_memberships (id, workspace_id, user_id, role, created_at)
    VALUES ('test_mem_fk', 'ws_milk_01', 'nonexistent_user_999', 'member', '2026-11-19T00:00:00Z')
  `).run();
} catch (err: any) {
  fkThrew = true;
  assert(err.message.includes('FOREIGN KEY') || err.message.includes('foreign key'), `Error should mention foreign key: ${err.message}`);
}
assert(fkThrew, 'Inserting record with invalid foreign key must throw an error');
console.log('✓ Foreign key constraint enforcement verified');

// 3. Verify UNIQUE Constraint Enforcement
let uniqueThrew = false;
try {
  // Try inserting duplicate phone in users
  db.prepare(`
    INSERT INTO users (id, name, phone, role, created_at)
    VALUES ('test_user_dup', 'Duplicate Phone', '+919876543210', 'member', '2026-11-19T00:00:00Z')
  `).run();
} catch (err: any) {
  uniqueThrew = true;
  assert(err.message.includes('UNIQUE') || err.message.includes('unique'), `Error should mention UNIQUE: ${err.message}`);
}
assert(uniqueThrew, 'Inserting record with duplicate unique field must throw an error');
console.log('✓ UNIQUE constraint enforcement verified');

// 4. Verify Transaction Rollback Behavior
const beforeCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
let txThrew = false;
try {
  db.exec('BEGIN TRANSACTION;');
  db.prepare(`
    INSERT INTO users (id, name, phone, role, created_at)
    VALUES ('temp_user_tx', 'Temp User', '+919999999999', 'member', '2026-11-19T00:00:00Z')
  `).run();
  // Intentionally trigger FK error to force rollback
  db.prepare(`
    INSERT INTO workspace_memberships (id, workspace_id, user_id, role, created_at)
    VALUES ('temp_mem_bad', 'nonexistent_ws', 'temp_user_tx', 'member', '2026-11-19T00:00:00Z')
  `).run();
  db.exec('COMMIT;');
} catch (err) {
  txThrew = true;
  db.exec('ROLLBACK;');
}
assert(txThrew, 'Transaction should fail on error');
const afterCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
assert.strictEqual(afterCount, beforeCount, 'Rollback must revert all uncommitted changes');
console.log('✓ Transaction rollback integrity verified');

console.log('PASS: Database integrity test suite completed successfully.\n');
