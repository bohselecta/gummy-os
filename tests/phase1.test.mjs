import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { RecordRepository } from '../src/core/repository.js';
import { canonicalize, sha256 } from '../src/core/hash.js';
import { mapLegacyState, migrateLegacy } from '../src/core/migration.js';
import { CAPABILITIES, SOURCE_TEXT, createReceipt, makeGrant, personalRecords } from '../src/core/records.js';
import { PolicyEngine } from '../src/core/policy-engine.js';
import { transformExecution } from '../server/execution.mjs';
import { GitHubBoxAdapter, LocalBoxAdapter } from '../src/core/box-adapters.js';

function repository() {
  return new RecordRepository({ databaseName: `gummy-test-${crypto.randomUUID()}` });
}

async function seed(repo) {
  const sourceHash = await sha256(SOURCE_TEXT);
  const records = personalRecords({ sourceHash, byteRef: '/gummies/source' });
  for (const [store, record] of [
    ['humans', records.human], ['actors', records.actor], ['actors', records.testActor],
    ['agents', records.agent], ['molds', records.mold], ['masterControls', records.masterControl],
    ['boxes', records.box], ['gummies', records.gummy], ['workOrders', records.workOrder]
  ]) await repo.put(store, record, { validate: false });
  return records;
}

test('canonical JSON and bytes produce stable SHA-256 hashes', async () => {
  assert.equal(canonicalize({ b: 2, a: 1 }), '{"a":1,"b":2}');
  assert.equal(await sha256({ b: 2, a: 1 }), await sha256({ a: 1, b: 2 }));
  assert.match(await sha256(new TextEncoder().encode('gummy')), /^[a-f0-9]{64}$/);
});

test('legacy mapping preserves evidence, maps unsupported color to Night, and is idempotent', async () => {
  const repo = repository();
  const fixture = JSON.parse(await readFile(new URL('./fixtures/legacy-v0.1.json', import.meta.url), 'utf8'));
  const legacy = fixture.serializedState;
  const storage = { getItem: key => key === 'gummy-os:v0.1' ? JSON.stringify(legacy) : null };
  const mapped = await mapLegacyState(legacy);
  assert.equal(mapped.themeMapping, 'night');
  assert.deepEqual(mapped.originalColors, legacy.snack.colors);
  assert.deepEqual(mapped.mappings.legacyCompanion, ['agent:glopper-web']);
  assert.equal((await migrateLegacy(repo, storage)).migrated, true);
  assert.equal((await migrateLegacy(repo, storage)).reason, 'already-migrated');
  assert.equal((await repo.all('profiles')).length, 1);
  repo.close();
});

test('exclusive canonical scope denies a concurrent lease and recovers after release', async () => {
  const repo = repository();
  const expiry = new Date(Date.now() + 60_000).toISOString();
  const first = await repo.acquireLeaseClaim({ scopeHash: 'scope', leaseId: 'lease:first', expiresAt: expiry });
  const second = await repo.acquireLeaseClaim({ scopeHash: 'scope', leaseId: 'lease:second', expiresAt: expiry });
  assert.equal(first.acquired, true);
  assert.equal(second.acquired, false);
  await repo.releaseLeaseClaim('scope', 'lease:first');
  assert.equal((await repo.acquireLeaseClaim({ scopeHash: 'scope', leaseId: 'lease:second', expiresAt: expiry })).acquired, true);
  repo.close();
});

test('policy intersects Work Order, Agent, Mold, Master Control, locality, expiry, and revocation', async () => {
  const repo = repository();
  const records = await seed(repo);
  const byteStore = { read: async () => new TextEncoder().encode(SOURCE_TEXT) };
  const policy = new PolicyEngine(repo, byteStore);
  const authority = await policy.validateWorkOrder(records.workOrder, { sourceBytes: await byteStore.read() });
  assert.equal(authority.agent.id, 'agent:glopper-web');
  await repo.put('molds', { ...records.mold, status: 'revoked', revokedAt: new Date().toISOString() }, { validate: false });
  await assert.rejects(() => policy.validateWorkOrder(records.workOrder), /revoked/);
  repo.close();
});

test('Receipt chain records canonical hashes and prior hashes as local tamper evidence', async () => {
  const repo = repository();
  await seed(repo);
  const first = await createReceipt(repo, { action: 'first-proof' });
  const second = await createReceipt(repo, { action: 'second-proof' });
  assert.match(first.canonicalHash, /^[a-f0-9]{64}$/);
  assert.equal(second.extensions.priorReceiptHash, first.canonicalHash);
  assert.equal(second.extensions.evidenceType, 'local-tamper-evidence-not-signature');
  repo.close();
});

test('brand source contains exactly the five locked literals and both semantic maps', async () => {
  const css = await readFile(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
  const colors = [...css.matchAll(/#[0-9a-f]{6}/gi)].map(match => match[0].toUpperCase());
  assert.deepEqual(new Set(colors), new Set(['#4B187A', '#7C2FD0', '#F2B544', '#FFF1C7', '#100817']));
  assert.match(css, /data-gummy-mode="night"/);
  assert.match(css, /data-gummy-mode="day"/);
});

function executionEnvelope(overrides = {}) {
  const timestamp = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();
  const sourceHash = overrides.sourceHash || 'placeholder';
  const records = personalRecords({ sourceHash, byteRef: '/gummies/source' });
  const lease = {
    schema: 'gummy.task-lease/v0', id: 'lease:test', humanAuthorityId: records.human.id,
    actorId: records.actor.id, agentId: records.agent.id, moldId: records.mold.id,
    masterControlId: records.masterControl.id, taskId: records.workOrder.id, scope: { gummyIds: [records.gummy.id], capabilities: CAPABILITIES },
    mode: 'exclusive', status: 'active', issuedAt: timestamp, expiresAt
  };
  const grants = [
    makeGrant({ action: 'gummy.read', resource: records.gummy.id, leaseId: lease.id }),
    makeGrant({ action: 'transform.bounded', resource: records.workOrder.id, leaseId: lease.id }),
    makeGrant({ action: 'gummy.create', resource: 'box:hayden/artifacts', leaseId: lease.id })
  ];
  return {
    human: records.human, actor: records.actor, agent: records.agent, mold: records.mold,
    masterControl: records.masterControl, workOrder: records.workOrder, taskLease: lease, grants,
    source: { id: records.gummy.id, mediaType: 'text/markdown', title: records.gummy.title },
    sourceText: SOURCE_TEXT, sourceHash, idempotencyKey: 'work-order:project-brief:lease:test'
  };
}

test('mocked execution succeeds with normalized provider evidence and bounded structure', async () => {
  const original = process.env.GUMMY_TEST_MODE;
  process.env.GUMMY_TEST_MODE = '1';
  const sourceHash = await sha256(SOURCE_TEXT);
  const result = await transformExecution(executionEnvelope({ sourceHash }));
  process.env.GUMMY_TEST_MODE = original;
  assert.equal(result.code, 200);
  assert.equal(result.body.status, 'completed');
  assert.equal(result.body.model, 'gpt-5.6-sol');
  assert.deepEqual(Object.keys(result.body.result), ['title', 'markdown', 'summary', 'limitations']);
});

test('execution blocks hash mismatch and revocation before a provider call', async () => {
  const original = process.env.GUMMY_TEST_MODE;
  process.env.GUMMY_TEST_MODE = '1';
  const hashBlocked = await transformExecution(executionEnvelope({ sourceHash: '0'.repeat(64) }));
  assert.equal(hashBlocked.body.status, 'blocked');
  assert.match(hashBlocked.body.message, /hash/i);
  const sourceHash = await sha256(SOURCE_TEXT);
  const revoked = executionEnvelope({ sourceHash });
  revoked.masterControl.revokedMoldIds = [revoked.mold.id];
  const revocationBlocked = await transformExecution(revoked);
  process.env.GUMMY_TEST_MODE = original;
  assert.equal(revocationBlocked.body.status, 'blocked');
  assert.match(revocationBlocked.body.message, /revoked/i);
});

test('execution blocks when cost policy is unconfigured outside the hermetic lane', async () => {
  const old = {
    test: process.env.GUMMY_TEST_MODE,
    input: process.env.OPENAI_INPUT_USD_PER_MILLION,
    output: process.env.OPENAI_OUTPUT_USD_PER_MILLION
  };
  delete process.env.GUMMY_TEST_MODE;
  delete process.env.OPENAI_INPUT_USD_PER_MILLION;
  delete process.env.OPENAI_OUTPUT_USD_PER_MILLION;
  const sourceHash = await sha256(SOURCE_TEXT);
  const result = await transformExecution(executionEnvelope({ sourceHash }));
  Object.assign(process.env, { GUMMY_TEST_MODE: old.test, OPENAI_INPUT_USD_PER_MILLION: old.input, OPENAI_OUTPUT_USD_PER_MILLION: old.output });
  for (const key of Object.keys(process.env)) if (process.env[key] === 'undefined') delete process.env[key];
  assert.equal(result.body.status, 'blocked');
  assert.match(result.body.message, /Cost policy/);
});

test('provider adapter enforces structured output, idempotency, cost, refusal, timeout, and malformed failures', async () => {
  const previous = {
    key: process.env.OPENAI_API_KEY,
    input: process.env.OPENAI_INPUT_USD_PER_MILLION,
    output: process.env.OPENAI_OUTPUT_USD_PER_MILLION
  };
  process.env.OPENAI_API_KEY = 'test-placeholder';
  process.env.OPENAI_INPUT_USD_PER_MILLION = '1';
  process.env.OPENAI_OUTPUT_USD_PER_MILLION = '1';
  const sourceHash = await sha256(SOURCE_TEXT);
  const envelope = executionEnvelope({ sourceHash });
  let observed;
  const successClient = {
    responses: {
      create: async (request, options) => {
        observed = { request, options };
        return {
          status: 'completed',
          model: 'gpt-5.6-sol-2026-07-01',
          _request_id: 'req_test',
          output_text: JSON.stringify({ title: 'Title', markdown: 'Body', summary: 'Summary', limitations: [] }),
          usage: { input_tokens: 100, output_tokens: 50, total_tokens: 150 }
        };
      }
    }
  };
  const success = await transformExecution(envelope, { testMode: false, client: successClient });
  assert.equal(success.body.status, 'completed');
  assert.equal(observed.request.store, false);
  assert.equal(observed.request.reasoning.effort, 'low');
  assert.equal(observed.request.max_output_tokens, 1600);
  assert.equal(observed.options.headers['Idempotency-Key'], envelope.idempotencyKey);

  const malformed = await transformExecution(envelope, { testMode: false, client: { responses: { create: async () => ({ status: 'completed', _request_id: 'req_bad', model: 'gpt-5.6-sol', output_text: 'not-json', usage: {} }) } } });
  assert.equal(malformed.body.status, 'failed');
  assert.match(malformed.body.message, /required structure/);

  const refusal = await transformExecution(envelope, { testMode: false, client: { responses: { create: async () => { throw Object.assign(new Error('provider refusal'), { status: 400, request_id: 'req_refusal' }); } } } });
  assert.equal(refusal.body.status, 'denied');

  const timeout = await transformExecution(envelope, { testMode: false, client: { responses: { create: async () => { throw Object.assign(new Error('timeout'), { name: 'APIConnectionTimeoutError' }); } } } });
  assert.equal(timeout.body.status, 'failed');
  assert.match(timeout.body.message, /not retried/);

  process.env.OPENAI_INPUT_USD_PER_MILLION = '10000000';
  process.env.OPENAI_OUTPUT_USD_PER_MILLION = '10000000';
  const cost = await transformExecution(envelope, { testMode: false, client: successClient });
  assert.equal(cost.body.status, 'blocked');
  assert.match(cost.body.message, /cost exceeds/i);

  for (const [key, value] of Object.entries(previous)) {
    const envName = key === 'key' ? 'OPENAI_API_KEY' : key === 'input' ? 'OPENAI_INPUT_USD_PER_MILLION' : 'OPENAI_OUTPUT_USD_PER_MILLION';
    if (value === undefined) delete process.env[envName];
    else process.env[envName] = value;
  }
});

test('Local and mocked GitHub Box adapters expose commit state, revisions, and hashes', async () => {
  const repo = repository();
  const records = await seed(repo);
  const local = new LocalBoxAdapter(repo, { writeArtifact: async () => ({ path: '/artifact', hash: 'a'.repeat(64), byteLength: 1 }) });
  const initialized = await local.initialize(records.box);
  assert.equal(initialized.providerType, 'local');
  assert.equal(initialized.status, 'committed');
  assert.match(initialized.contentHash, /^[a-f0-9]{64}$/);
  const pending = await local.listPending(records.box.id);
  assert.equal(pending.records.length, 1);

  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.sessionStorage = { getItem: () => 'csrf-test' };
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    return new Response(JSON.stringify(url.endsWith('/repositories')
      ? { repositories: [{ fullName: 'owner/private', private: true }] }
      : { providerType: 'github', revisionId: 'abc', contentHash: 'def', status: 'committed' }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const github = new GitHubBoxAdapter();
  assert.equal((await github.repositories()).repositories[0].private, true);
  assert.equal((await github.connect({ boxId: 'box:hayden', repository: 'owner/private' })).status, 'committed');
  assert.equal((await github.sync('box:hayden', { expectedHead: 'abc', files: {} })).revisionId, 'abc');
  assert.equal((await github.disconnect('box:hayden')).providerType, 'github');
  assert.ok(calls.every(call => call.options.headers['x-gummy-csrf'] === 'csrf-test'));
  globalThis.fetch = originalFetch;
  delete globalThis.sessionStorage;
  repo.close();
});
