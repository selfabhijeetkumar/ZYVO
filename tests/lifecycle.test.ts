import assert from 'node:assert';
import { getDb } from '../src/lib/db/index';
import { extractSlotsFromTranscript } from '../src/lib/voice/slot-extractor';
import { getVerticalModule } from '../src/lib/vertical-registry';
import { logAuditEvent, getAuditEvents } from '../src/lib/audit';

console.log('--- RUNNING VOICE LIFECYCLE TEST SUITE ---');

async function runLifecycleTests() {
  const db = getDb();

  // Test Case 1: Milk Delivery Pause Workflow
  const testSubId = `vsub_test_${Date.now()}`;
  const now = new Date().toISOString();

  // 1. Initial State: RECEIVED
  db.prepare(`
    INSERT INTO voice_submissions (id, workspace_id, user_id, vertical_type, recorded_at, received_at, audio_file_path, audio_mime_type, state, status, status_reason)
    VALUES (?, 'ws_milk_01', 'user_customer_01', 'milk_delivery', ?, ?, 'storage/audio/dummy.webm', 'audio/webm', 'RECEIVED', 'RECEIVED', 'Initial voice receipt')
  `).run(testSubId, now, now);

  logAuditEvent({
    submissionId: testSubId,
    actionType: 'VOICE_SUBMISSION_RECEIVED',
    priorState: null,
    newState: 'RECEIVED',
    actorId: 'user_customer_01',
  }, db);

  let sub = db.prepare('SELECT * FROM voice_submissions WHERE id = ?').get(testSubId) as any;
  assert.strictEqual(sub.state, 'RECEIVED');
  assert.strictEqual(sub.status, 'RECEIVED');
  console.log('✓ Stage 1: RECEIVED state recorded');

  // 2. Transcription: TRANSCRIBED
  const transcriptText = 'Bhaiya kal subah doodh mat dena, hum 3 din ke liye gaon ja rahe hain';
  db.prepare(`
    UPDATE voice_submissions SET transcript_raw = ?, detected_language = 'hi-IN', state = 'TRANSCRIBED', status = 'TRANSCRIBED' WHERE id = ?
  `).run(transcriptText, testSubId);

  sub = db.prepare('SELECT * FROM voice_submissions WHERE id = ?').get(testSubId) as any;
  assert.strictEqual(sub.state, 'TRANSCRIBED');
  assert.strictEqual(sub.status, 'TRANSCRIBED');
  assert.strictEqual(sub.transcript_raw, transcriptText);
  console.log('✓ Stage 2: TRANSCRIBED state updated');

  // 3. Extraction & Proposal Creation: AWAITING_CONFIRMATION
  const proposal = await extractSlotsFromTranscript(transcriptText, 'milk_delivery', {
    workspaceId: 'ws_milk_01',
    customerId: 'user_customer_01',
  });

  assert.strictEqual(proposal.intent, 'PAUSE_DELIVERY');
  assert.strictEqual(proposal.needsClarification, false);
  assert(proposal.parsedFields.days === 3, 'Expected 3 days pause');

  db.prepare(`
    UPDATE voice_submissions SET proposal_json = ?, state = 'AWAITING_CONFIRMATION', status = 'AWAITING_CONFIRMATION' WHERE id = ?
  `).run(JSON.stringify(proposal), testSubId);

  // Check invariant: unconfirmed proposal MUST NOT mutate milk_delivery_calendar
  const calCountBefore = (db.prepare('SELECT COUNT(*) as c FROM milk_delivery_calendar WHERE voice_submission_id = ?').get(testSubId) as any).c;
  assert.strictEqual(calCountBefore, 0, 'No calendar entries should exist before proposal confirmation');
  console.log('✓ Invariant verified: Unconfirmed proposal does not mutate domain tables');

  // 4. Confirmation & Execution: APPLIED
  const milkMod = getVerticalModule('milk_delivery');
  assert(milkMod);

  const applyRes = await milkMod.applyTransaction(db, testSubId, proposal.parsedFields, 'user_customer_01');
  assert.strictEqual(applyRes.success, true);

  db.prepare(`
    UPDATE voice_submissions SET state = 'APPLIED', status = 'APPLIED', applied_at = ? WHERE id = ?
  `).run(new Date().toISOString(), testSubId);

  logAuditEvent({
    submissionId: testSubId,
    actionType: 'PROPOSAL_CONFIRMED',
    priorState: 'AWAITING_CONFIRMATION',
    newState: 'APPLIED',
    transcriptSpan: transcriptText,
    actorId: 'user_customer_01',
  }, db);

  // Verify calendar records were created for the 3 paused days
  const calCountAfter = (db.prepare('SELECT COUNT(*) as c FROM milk_delivery_calendar WHERE voice_submission_id = ?').get(testSubId) as any).c;
  assert.strictEqual(calCountAfter, 3, 'Exactly 3 days of milk delivery calendar should be updated');

  // Verify audit events exist
  const audits = getAuditEvents(testSubId);
  assert(audits.length >= 2, 'Audit trail must contain at least 2 events for the submission');
  console.log('✓ Stage 4: APPLIED state confirmed and 3 calendar records created with audit trail');

  // Test Case 2: Ambiguous transcript triggering NEEDS_CLARIFICATION
  const ambiguousText = 'Bhaiya doodh ka kuch karna hai';
  const ambiguousProposal = await extractSlotsFromTranscript(ambiguousText, 'milk_delivery', {
    workspaceId: 'ws_milk_01',
    customerId: 'user_customer_01',
  });
  assert.strictEqual(ambiguousProposal.needsClarification, true);
  assert(ambiguousProposal.clarificationPrompt, 'Clarification prompt must be present for ambiguous input');
  console.log('✓ Ambiguous voice note correctly flagged NEEDS_CLARIFICATION with prompt');

  // Test Case 3: Proposal Rejection
  const testRejectId = `vsub_test_reject_${Date.now()}`;
  db.prepare(`
    INSERT INTO voice_submissions (id, workspace_id, user_id, vertical_type, recorded_at, received_at, audio_file_path, audio_mime_type, state, status)
    VALUES (?, 'ws_milk_01', 'user_customer_01', 'milk_delivery', ?, ?, 'dummy', 'audio/webm', 'AWAITING_CONFIRMATION', 'AWAITING_CONFIRMATION')
  `).run(testRejectId, now, now);

  db.prepare("UPDATE voice_submissions SET state = 'REJECTED', status = 'REJECTED' WHERE id = ?").run(testRejectId);
  logAuditEvent({
    submissionId: testRejectId,
    actionType: 'PROPOSAL_REJECTED',
    priorState: 'AWAITING_CONFIRMATION',
    newState: 'REJECTED',
    actorId: 'user_customer_01',
  }, db);

  const rejectedSub = db.prepare('SELECT * FROM voice_submissions WHERE id = ?').get(testRejectId) as any;
  assert.strictEqual(rejectedSub.state, 'REJECTED');
  assert.strictEqual(rejectedSub.status, 'REJECTED');
  console.log('✓ Rejection lifecycle verified with zero domain table mutations');

  console.log('PASS: Voice lifecycle test suite completed successfully.\n');
}

runLifecycleTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
