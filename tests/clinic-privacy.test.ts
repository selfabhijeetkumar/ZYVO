import assert from 'node:assert';
import { clinicHandler } from '../src/lib/verticals/clinic';

async function runTests() {
  console.log('====================================================');
  console.log('   RUNNING CLINIC PRIVACY & SAFETY REGRESSION SUITE');
  console.log('====================================================\n');

  // Test 1: Valid administrative scheduling proposal
  console.log('Running Test 1: Valid administrative appointment scheduling');
  const validProposal = {
    action: 'BOOK_APPOINTMENT',
    workspaceId: 'ws_clinic_01',
    patientId: 'user_customer_01',
    doctorId: 'doc_01',
    appointmentDate: '2026-11-20',
    administrativeNote: 'Routine General Consultation',
  };

  const validResult = clinicHandler.validateProposal(validProposal);
  assert.strictEqual(validResult.valid, true, 'Valid administrative proposal must pass');
  console.log('✓ Test 1: Legitimate administrative scheduling proposal accepted');

  // Test 2: Direct symptoms field rejection
  console.log('\nRunning Test 2: Direct symptoms field rejection');
  const symptomsProposal = {
    ...validProposal,
    symptoms: 'High fever 102F and dry cough for 3 days',
  };
  const sympResult = clinicHandler.validateProposal(symptomsProposal);
  assert.strictEqual(sympResult.valid, false);
  assert.ok(sympResult.errors?.[0].includes('Privacy violation'), 'Must reject with privacy violation');
  console.log('✓ Test 2: Direct symptoms field explicitly blocked');

  // Test 3: Prescription field rejection
  console.log('\nRunning Test 3: Prescription field rejection');
  const rxProposal = {
    ...validProposal,
    prescription: 'Paracetamol 500mg twice daily',
  };
  const rxResult = clinicHandler.validateProposal(rxProposal);
  assert.strictEqual(rxResult.valid, false);
  console.log('✓ Test 3: Prescription field explicitly blocked');

  // Test 4: Embedded clinical terms in administrative note field
  console.log('\nRunning Test 4: Embedded symptoms in freeform text rejection');
  const sneakyProposal = {
    ...validProposal,
    notes: 'Booking appointment because patient has severe headache and vomit',
  };
  const sneakyResult = clinicHandler.validateProposal(sneakyProposal);
  assert.strictEqual(sneakyResult.valid, false);
  assert.ok(sneakyResult.errors?.some(e => e.includes('headache') || e.includes('vomit')));
  console.log('✓ Test 4: Freeform text with clinical keywords blocked server-side');

  // Test 5: Antibiotic/medicine mention in comments rejection
  console.log('\nRunning Test 5: Medicine mention in comments rejection');
  const medProposal = {
    ...validProposal,
    comment: 'Need renewal of antibiotic medicine tablet',
  };
  const medResult = clinicHandler.validateProposal(medProposal);
  assert.strictEqual(medResult.valid, false);
  console.log('✓ Test 5: Pharmaceutical terms in payload blocked server-side');

  console.log('\n====================================================');
  console.log('   ALL CLINIC PRIVACY TESTS PASSED (100%)');
  console.log('====================================================\n');
  process.exit(0);
}

runTests().catch((e) => {
  console.error('Test run failed:', e);
  process.exit(1);
});
