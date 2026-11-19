import { execSync } from 'node:child_process';

console.log('====================================================');
console.log('   ZYVO PLATFORM TEST RUNNER — ALL 11 SUITES');
console.log('====================================================\n');

const suites = [
  'tests/platform.test.ts',
  'tests/registry.test.ts',
  'tests/database.test.ts',
  'tests/lifecycle.test.ts',
  'tests/milk.test.ts',
  'tests/kirana.test.ts',
  'tests/vegetable.test.ts',
  'tests/clinic.test.ts',
  'tests/clinic-privacy.test.ts',
  'tests/agriculture.test.ts',
  'tests/agriculture-msp.test.ts',
];

let passed = 0;
for (const suite of suites) {
  try {
    const out = execSync(`npx tsx ${suite}`, { encoding: 'utf-8' });
    console.log(out);
    passed++;
  } catch (err: any) {
    console.error(`FAILED: ${suite}`);
    console.error(err.stdout || err.message);
    process.exit(1);
  }
}

console.log('====================================================');
console.log(`   ALL ${passed} / ${suites.length} TEST SUITES PASSED EMPIRICALLY (100%)`);
console.log('====================================================');
