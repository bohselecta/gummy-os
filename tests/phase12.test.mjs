import assert from 'node:assert/strict';
import test from 'node:test';
import 'fake-indexeddb/auto';
import {
  appendChatMessage,
  createLiveSessionContract,
  deleteChat,
  ensureLivingActorRecords,
  exportChatPackage,
  openPrivateChat,
  previewTesterFeedback,
  recordCohortEvent,
  resolvePresence,
  saveTesterFeedback,
  setActorPresence,
  setChatStatus,
  summarizeCohortEvents,
  updateChatMessage
} from '../src/core/living-actor.js';
import { RecordRepository } from '../src/core/repository.js';
import { RecordValidator } from '../src/core/schema-validator.js';
import { personalRecords } from '../src/core/records.js';
import { replyToPrivateChat } from '../server/chat.mjs';
import { submitTesterFeedback } from '../server/feedback.mjs';

async function repository(t) {
  const validator = new RecordValidator();
  validator.validate = async () => true;
  const repo = new RecordRepository({
    databaseName: `phase12-${crypto.randomUUID()}`,
    validator: (record, store, current) => validator.validate(record, store, current)
  });
  t.after(() => repo.close());
  const records = personalRecords({
    name: 'Tester',
    address: '@tester',
    sourceHash: 'a'.repeat(64),
    byteRef: '/test'
  });
  await repo.put('humans', records.human, { validate: false });
  await repo.put('actors', records.actor, { validate: false });
  await repo.put('actors', records.testActor, { validate: false });
  await repo.put('agents', records.agent, { validate: false });
  await repo.put('molds', records.mold, { validate: false });
  await repo.put('masterControls', records.masterControl, { validate: false });
  return repo;
}

test('Living Actor presence is typed, sourced, expiring, and keeps the service Actor separate from its Agent', async t => {
  const repo = await repository(t);
  await ensureLivingActorRecords(repo, {
    providerConfigured: true,
    clock: () => '2026-07-27T12:00:00.000Z'
  });
  const actor = await repo.get('actors', 'actor:glopper');
  assert.equal(actor.kind, 'service');
  assert.deepEqual(actor.agentIds, ['agent:glopper-web']);
  assert.notEqual(actor.id, actor.agentIds[0]);
  const fresh = resolvePresence(await repo.get('actorPresence', actor.id), '2026-07-27T12:04:59.000Z');
  assert.equal(fresh.state, 'available-for-chat');
  assert.equal(fresh.stale, false);
  const expired = resolvePresence(await repo.get('actorPresence', actor.id), '2026-07-27T12:05:01.000Z');
  assert.equal(expired.state, 'offline');
  assert.equal(expired.stale, true);
  await assert.rejects(
    () => setActorPresence(repo, {
      actorId: 'actor:hayden',
      state: 'available',
      source: 'service-derived'
    }),
    /Human-controlled/
  );
});

test('private chats create versioned transcript Gummies, close/reopen, edit/delete, export, and scoped deletion evidence', async t => {
  const repo = await repository(t);
  await ensureLivingActorRecords(repo, { providerConfigured: true });
  const chat = await openPrivateChat(repo, { participantActorId: 'actor:glopper' });
  const sent = await appendChatMessage(repo, {
    sessionId: chat.id,
    senderActorId: 'actor:hayden',
    text: 'Hello Glopper'
  });
  await updateChatMessage(repo, { messageId: sent.id, text: 'Hello, Glopper.' });
  const reply = await appendChatMessage(repo, {
    sessionId: chat.id,
    senderActorId: 'actor:glopper',
    text: 'Hello Human.',
    provider: { name: 'OpenAI (mocked)', model: 'gpt-5.6-sol' },
    cost: { amount: 0.0001, currency: 'USD' }
  });
  await updateChatMessage(repo, { messageId: reply.id, deleteMessage: true });
  await setChatStatus(repo, chat.id, 'closed');
  await assert.rejects(() => appendChatMessage(repo, {
    sessionId: chat.id,
    senderActorId: 'actor:hayden',
    text: 'closed'
  }), /Reopen/);
  await setChatStatus(repo, chat.id, 'open');
  const transcript = await repo.get('gummies', chat.transcriptGummyId);
  assert.equal(transcript.kind, 'conversation');
  assert.match(transcript.content.inlineText, /\[deleted\]/);
  assert.equal(transcript.extensions.actorAgentBoundary.actorIsAgent, false);
  const exported = exportChatPackage(
    await repo.get('chatSessions', chat.id),
    (await repo.all('chatMessages')).filter(item => item.sessionId === chat.id),
    transcript
  );
  assert.equal(exported.schema, 'gummy.chat-export/v1');
  const receipt = await deleteChat(repo, chat.id);
  assert.equal(await repo.get('chatSessions', chat.id), undefined);
  assert.equal(await repo.get('gummies', chat.transcriptGummyId), undefined);
  assert.match(receipt.evidence.deletionEvidence, /^[a-f0-9]{64}$/);
});

test('tester feedback preview redacts secrets and local cohort summaries contain no message text or network telemetry', async t => {
  const repo = await repository(t);
  const preview = previewTesterFeedback({
    category: 'trust-privacy',
    note: 'Please hide sk-abcdefghijklmnop and Bearer abcdefghijklmnopqrstuvwxyz.',
    context: { buildCommit: 'abc', buildEnvironment: 'preview', surface: 'About' },
    chatTranscript: 'must not pass'
  });
  assert.equal(preview.redactionCount, 2);
  assert.doesNotMatch(preview.note, /abcdefghijklmnop/);
  assert.ok(preview.excluded.includes('chat transcripts'));
  const saved = await saveTesterFeedback(repo, preview);
  assert.equal(saved.record.status, 'local-only');
  await recordCohortEvent(repo, 'session-started', { reason: 'private note must not be accepted as freeform data' });
  await recordCohortEvent(repo, 'feedback-submitted', { surface: 'About' });
  const summary = summarizeCohortEvents(await repo.all('cohortEvents'));
  assert.equal(summary.totalEvents, 2);
  assert.equal(summary.counts['feedback-submitted'], 1);
  assert.equal(summary.locality, 'this-browser-only');
});

test('live capability contract is private, recording-off, and never fakes remote signaling', () => {
  const contract = createLiveSessionContract({ chatSessionId: 'chat:test', signalingConfigured: false });
  assert.equal(contract.visibility, 'private');
  assert.equal(contract.recording, false);
  assert.equal(contract.capabilities.video.mode, 'local-preview-only');
  assert.equal(contract.signaling.configured, false);
  assert.match(contract.signaling.claim, /unavailable/);
});

function chatEnvelope(overrides = {}) {
  const expiresAt = new Date(Date.now() + 60_000).toISOString();
  return {
    chat: { id: 'chat:test', participantActorIds: ['actor:hayden', 'actor:glopper'], visibility: 'private' },
    actor: { id: 'actor:glopper', status: 'active' },
    agent: { id: 'agent:glopper-web', status: 'available' },
    mold: { id: 'mold:glopper:private-chat-v1', status: 'active', capability: 'chat.reply' },
    lease: { id: 'lease:chat:test', status: 'active', chatId: 'chat:test', agentId: 'agent:glopper-web', expiresAt },
    grant: {
      id: 'grant:chat:test',
      capability: 'chat.reply',
      approvedBy: 'human:hayden',
      approvedAt: new Date().toISOString(),
      expiresAt,
      revoked: false,
      maxCostUsd: 0.05
    },
    messages: [{ senderActorId: 'actor:hayden', text: 'Hello' }],
    context: { selectedGummyIds: [], previewed: true, excluded: ['private Actor memory', 'credentials'] },
    idempotencyKey: 'chat-test-idempotency',
    ...overrides
  };
}

test('governed chat server validates Actor/Agent/Mold/Lease/Grant and returns a deterministic disclosed test reply', async () => {
  const ok = await replyToPrivateChat(chatEnvelope(), { testMode: true, sessionId: 'session-test' });
  assert.equal(ok.code, 200);
  assert.equal(ok.body.status, 'completed');
  assert.equal(ok.body.provider, 'OpenAI (mocked)');
  const badLease = await replyToPrivateChat(chatEnvelope({
    lease: { ...chatEnvelope().lease, chatId: 'chat:other' }
  }), { testMode: true, sessionId: 'session-test' });
  assert.equal(badLease.code, 422);
  assert.match(badLease.body.message, /lease/);
});

test('live chat provider call is non-stored, safety-identified, idempotent, bounded, and does not auto-retry', async () => {
  const previous = {
    key: process.env.OPENAI_API_KEY,
    input: process.env.OPENAI_INPUT_USD_PER_MILLION,
    output: process.env.OPENAI_OUTPUT_USD_PER_MILLION
  };
  process.env.OPENAI_API_KEY = 'test-placeholder';
  process.env.OPENAI_INPUT_USD_PER_MILLION = '1';
  process.env.OPENAI_OUTPUT_USD_PER_MILLION = '1';
  let observed;
  const client = {
    responses: {
      create: async (request, options) => {
        observed = { request, options };
        return {
          status: 'completed',
          model: 'gpt-5.6-sol-2026-07-01',
          _request_id: 'req_chat',
          output_text: 'A bounded private reply.',
          usage: { input_tokens: 100, output_tokens: 30, total_tokens: 130 }
        };
      }
    }
  };
  try {
    const reply = await replyToPrivateChat(chatEnvelope(), {
      testMode: false,
      sessionId: 'private-session-identifier',
      client
    });
    assert.equal(reply.body.status, 'completed');
    assert.equal(observed.request.store, false);
    assert.match(observed.request.safety_identifier, /^gmy_[a-f0-9]{32}$/);
    assert.equal(observed.request.max_output_tokens, 900);
    assert.equal(observed.options.headers['Idempotency-Key'], 'chat-test-idempotency');
    assert.ok(observed.request.input.every(item => item.content.includes('sk-') === false));
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      const name = key === 'key'
        ? 'OPENAI_API_KEY'
        : key === 'input'
          ? 'OPENAI_INPUT_USD_PER_MILLION'
          : 'OPENAI_OUTPUT_USD_PER_MILLION';
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

test('feedback remote submission remains explicit and private-destination gated', async () => {
  const envelope = {
    id: 'feedback:test',
    category: 'bug',
    note: 'The close button was hard to reach.',
    context: { buildCommit: 'abc', buildEnvironment: 'preview', surface: 'About' },
    excluded: ['credentials'],
    localReceiptId: 'receipt:test',
    approvedAt: new Date().toISOString()
  };
  const mocked = await submitTesterFeedback(envelope, { testMode: true });
  assert.equal(mocked.body.status, 'submitted');
  const blocked = await submitTesterFeedback(envelope, { testMode: false });
  assert.equal(blocked.code, 503);
  assert.match(blocked.body.message, /not configured/);
});
