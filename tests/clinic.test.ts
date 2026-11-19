import assert from 'node:assert';
import { getDb } from '../src/lib/db/index';
import { clinicHandler } from '../src/lib/verticals/clinic';

async function runTests() {
  console.log('====================================================');
  console.log('   RUNNING PHASE 5: CLINIC OPERATIONS TESTS');
  console.log('====================================================\n');

  const db = getDb();

  // Test 1: Privacy Boundary Enforcement
  console.log('Running Test 1: Privacy Boundary Enforcement (Non-Diagnostic)');
  const privacyProposal = {
    action: 'BOOK_APPOINTMENT',
    workspaceId: 'ws_clinic_01',
    patientId: 'user_customer_01',
    doctorId: 'doc_01',
    symptoms: 'Patient has high fever 102F and dry cough for 3 days',
  };

  const validation = clinicHandler.validateProposal(privacyProposal);
  assert.strictEqual(validation.valid, false, 'Validation should fail when symptoms are provided');
  assert.ok(
    validation.errors?.[0].includes('Privacy violation'),
    'Error should state privacy violation for diagnostic data'
  );
  console.log('✓ Test 1: Privacy boundary strictly enforced (clinical data rejected)');

  // Test 2: Booking an appointment with doctor & slot
  console.log('\nRunning Test 2: Appointment Booking & Slot Reservation');
  const bookingPayload = {
    action: 'BOOK_APPOINTMENT',
    workspaceId: 'ws_clinic_01',
    patientId: 'user_customer_01',
    doctorId: 'doc_01',
    slotId: 'slot_01',
    appointmentDate: '2026-11-20',
  };

  const bookingResult = await clinicHandler.applyTransaction(db, 'sub_test_clinic', bookingPayload, 'user_customer_01');
  assert.strictEqual(bookingResult.success, true, 'Booking transaction must succeed');
  assert.ok(bookingResult.entityId, 'Should return appointment entity ID');

  const bookedSlot = db.prepare('SELECT is_booked FROM clinic_appointment_slots WHERE id = ?').get('slot_01') as any;
  assert.strictEqual(bookedSlot.is_booked, 1, 'Slot 01 should be marked as booked');

  const apptRecord = db.prepare('SELECT * FROM clinic_appointments WHERE id = ?').get(bookingResult.entityId) as any;
  assert.strictEqual(apptRecord.status, 'CONFIRMED', 'Appointment status must be CONFIRMED');
  assert.strictEqual(apptRecord.doctor_id, 'doc_01', 'Doctor must match doc_01');
  console.log(`✓ Test 2: Appointment ${bookingResult.entityId} booked and slot marked booked`);

  // Test 3: Double-booking prevention
  console.log('\nRunning Test 3: Double-Booking Prevention');
  try {
    await clinicHandler.applyTransaction(db, 'sub_test_clinic_dup', bookingPayload, 'user_customer_01');
    assert.fail('Should have thrown double-booking error');
  } catch (err: any) {
    assert.ok(
      err.message.includes('already has an active appointment') || err.message.includes('already booked'),
      `Expected double booking prevention, got: ${err.message}`
    );
    console.log('✓ Test 3: Double-booking correctly prevented');
  }

  // Test 4: Rescheduling Appointment & Slot Transition
  console.log('\nRunning Test 4: Appointment Rescheduling');
  const reschedulePayload = {
    action: 'RESCHEDULE_APPOINTMENT',
    workspaceId: 'ws_clinic_01',
    patientId: 'user_customer_01',
    appointmentId: bookingResult.entityId,
    appointmentDate: '2026-11-20',
    slotId: 'slot_02',
  };

  const rescheduleResult = await clinicHandler.applyTransaction(db, 'sub_test_clinic_resched', reschedulePayload, 'user_customer_01');
  assert.strictEqual(rescheduleResult.success, true, 'Reschedule must succeed');

  const oldSlot = db.prepare('SELECT is_booked FROM clinic_appointment_slots WHERE id = ?').get('slot_01') as any;
  assert.strictEqual(oldSlot.is_booked, 0, 'Old slot slot_01 must be freed (is_booked=0)');

  const newSlot = db.prepare('SELECT is_booked FROM clinic_appointment_slots WHERE id = ?').get('slot_02') as any;
  assert.strictEqual(newSlot.is_booked, 1, 'New slot slot_02 must be booked (is_booked=1)');
  console.log('✓ Test 4: Appointment rescheduled, old slot freed, new slot reserved');

  // Test 5: Cancellation & Complete Slot Release
  console.log('\nRunning Test 5: Appointment Cancellation');
  const cancelPayload = {
    action: 'CANCEL_APPOINTMENT',
    workspaceId: 'ws_clinic_01',
    patientId: 'user_customer_01',
    appointmentId: bookingResult.entityId,
  };

  const cancelResult = await clinicHandler.applyTransaction(db, 'sub_test_clinic_cancel', cancelPayload, 'user_customer_01');
  assert.strictEqual(cancelResult.success, true, 'Cancellation must succeed');

  const releasedSlot = db.prepare('SELECT is_booked FROM clinic_appointment_slots WHERE id = ?').get('slot_02') as any;
  assert.strictEqual(releasedSlot.is_booked, 0, 'Cancelled slot slot_02 must be freed (is_booked=0)');

  const cancelledAppt = db.prepare('SELECT status FROM clinic_appointments WHERE id = ?').get(bookingResult.entityId) as any;
  assert.strictEqual(cancelledAppt.status, 'CANCELLED', 'Appointment must be marked CANCELLED');
  console.log('✓ Test 5: Appointment cancelled and slot successfully released');

  console.log('\n====================================================');
  console.log('   ALL CLINIC OPERATIONS TESTS PASSED (100%)');
  console.log('====================================================\n');
}

runTests().catch((e) => {
  console.error('Test run failed:', e);
  process.exit(1);
});
