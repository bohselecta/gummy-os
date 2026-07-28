import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { RecordRepository } from '../src/core/repository.js';
import {
  PlaceProjectionStore,
  PlaceSystemError,
  approvePlaceHandoff,
  assertAllowlistedRoute,
  createPlaceAdapter,
  createPlaceBinding,
  createPlaceHandoffPreview,
  createSourcePackage,
  placeWindowId,
  validatePlaceRegistry
} from '../src/core/place-system.js';
import {
  PLACE_FIXTURES,
  WORLD_TOOLS,
  buildCrossPlaceJourney,
  chooseWardrobeOutfit,
  commitHouseIntent,
  createRadioEpisode,
  estimateWorld,
  makeWorld,
  prepareRadioExport,
  previewHouseIntent,
  releaseTableAddress,
  reviseRadioScript,
  stageChannelPremiere,
  validateWorldPlan
} from '../src/places/place-doctrines.js';

const hash = 'a'.repeat(64);

function sourcePackage(overrides = {}) {
  return createSourcePackage({
    id: 'source-package:test',
    sources: [{ id: 'gummy:test', revision: 1, hash }],
    includedFields: ['title'],
    explicitExclusions: ['private-notes'],
    purpose: 'Test a bounded Place handoff',
    targetPlaceId: 'app:gummy-radio',
    privacy: 'private',
    audience: 'Test participant',
    quotePermission: false,
    voiceLikenessPermission: false,
    rights: { ownerApproved: true },
    provenance: { record: 'test fixture' },
    retention: 'test-only',
    costCeiling: 0,
    limitations: [],
    humanApproval: { approved: false, approvedBy: null, approvedAt: null },
    createdAt: '2026-07-28T12:00:00.000Z',
    ...overrides
  });
}

function worldPlan(overrides = {}) {
  return {
    schema: 'gummy.world-plan/v1',
    id: 'world-plan:test',
    revision: 1,
    title: 'Listening room',
    intent: 'A quiet sit-first premiere room',
    starterId: 'starter:listening-room',
    experience: 'sit',
    sources: [{ id: 'asset:room', revision: 1, hash, verified: true, rights: 'owner-created' }],
    typedOperations: [{ type: 'scene.configure', parameters: { mood: 'warm' } }],
    constraints: { maxCost: 4, maxMinutes: 20, arbitraryCodeAllowed: false },
    createdAt: '2026-07-28T12:00:00.000Z',
    ...overrides
  };
}

test('Place registry validates the migration and all six Phase 14 identities', async () => {
  const [registry, applications, descriptorSchema, registrySchema] = await Promise.all([
    readFile('public/registry/gummy-places.json', 'utf8').then(JSON.parse),
    readFile('public/registry/first-party-applications.json', 'utf8').then(JSON.parse),
    readFile('schemas/place-descriptor.schema.json', 'utf8').then(JSON.parse),
    readFile('schemas/place-registry.schema.json', 'utf8').then(JSON.parse)
  ]);
  const ajv = new Ajv2020({ strict: false, allErrors: true });
  addFormats(ajv);
  ajv.addSchema(descriptorSchema);
  const validate = ajv.compile(registrySchema);
  assert.equal(validate(registry), true, ajv.errorsText(validate.errors));
  assert.equal(validatePlaceRegistry(registry, applications), true);
  assert.deepEqual(
    registry.places.slice(4).map(place => [place.name, place.actorAddress]),
    [
      ['Gummy Channels', '@channels'],
      ['Wardrobe', '@wardrobe'],
      ['House', '@house'],
      ['Worlds', '@worlds'],
      ['Table', '@table'],
      ['Radio', '@radio']
    ]
  );
});

test('context-aware window IDs are stable and never collapse personal, Production, and session contexts', () => {
  const ids = [
    placeWindowId('app:gummy-house', { type: 'personal', id: 'actor:hayden' }),
    placeWindowId('app:gummy-house', { type: 'production', id: 'production:home' }),
    placeWindowId('app:gummy-house', { type: 'session', id: 'session:visit' })
  ];
  assert.equal(new Set(ids).size, 3);
  assert.match(ids[0], /^place-window:gummy-house:personal:/);
});

test('Place bindings and projections are exact-scope, durable, revocable, and reject secret fields', async () => {
  const repository = new RecordRepository({ databaseName: `phase14-${crypto.randomUUID()}` });
  const store = new PlaceProjectionStore(repository);
  const binding = createPlaceBinding({
    id: 'place-binding:house-personal',
    placeId: 'app:gummy-house',
    ownerActorId: 'actor:hayden',
    contextType: 'personal',
    contextId: 'actor:hayden',
    permissionScopes: ['home-graph.read-scoped'],
    connectionState: 'staged'
  });
  assert.equal(binding.revoked, false);
  await store.put({
    placeId: binding.placeId,
    ownerActorId: binding.ownerActorId,
    contextType: binding.contextType,
    contextId: binding.contextId,
    recordId: 'room:front-room',
    value: { title: 'Front room' }
  });
  assert.equal((await store.list(binding)).length, 1);
  assert.equal((await store.list({ ...binding, contextId: 'actor:someone-else' })).length, 0);
  assert.equal(await store.revoke(binding), 1);
  await assert.rejects(() => store.get({ ...binding, recordId: 'room:front-room' }), /missing or revoked/);
  assert.throws(() => createPlaceBinding({ ...binding, apiKey: 'forbidden' }), error => error.evidence.code === 'secret-field');
  repository.close();
});

test('Place handoff preview cannot execute and approval stays a separate immutable transition', () => {
  const source = sourcePackage();
  const preview = createPlaceHandoffPreview({
    id: 'place-handoff:test',
    sourcePackage: source,
    sourcePlaceId: 'app:gummy-os',
    targetPlaceId: 'app:gummy-radio',
    expectedOutput: 'Revisioned script',
    permissionScopes: ['script.prepare'],
    runtime: 'browser preview',
    createdAt: '2026-07-28T12:00:00.000Z'
  });
  assert.equal(preview.executionState, 'preview');
  assert.equal(preview.approval, null);
  const approved = approvePlaceHandoff(preview, {
    approved: true,
    approvedBy: 'actor:hayden',
    approvedAt: '2026-07-28T12:01:00.000Z'
  });
  assert.equal(approved.executionState, 'approved');
  assert.equal(preview.executionState, 'preview');
  assert.ok(Object.isFrozen(source) && Object.isFrozen(preview) && Object.isFrozen(approved));
});

test('unavailable adapters never simulate execution and remote routes are HTTPS allowlisted', async () => {
  const registry = JSON.parse(await readFile('public/registry/gummy-places.json', 'utf8'));
  const worlds = registry.places.find(place => place.id === 'app:gummy-worlds');
  const adapter = createPlaceAdapter({ descriptor: worlds, allowedOrigins: ['https://worlds.example'] });
  const preview = createPlaceHandoffPreview({
    id: 'place-handoff:worlds',
    sourcePackage: sourcePackage({ targetPlaceId: worlds.id }),
    sourcePlaceId: 'app:gummy-os',
    targetPlaceId: worlds.id,
    expectedOutput: 'World Plan',
    permissionScopes: ['world-plan.edit'],
    runtime: 'Meshmallow'
  });
  const approved = approvePlaceHandoff(preview, {
    approved: true,
    approvedBy: 'actor:hayden',
    approvedAt: '2026-07-28T12:01:00.000Z'
  });
  await assert.rejects(() => adapter.submitApprovedAction(approved), error => error.evidence.code === 'runtime-unavailable');
  assert.equal((await adapter.recover()).simulated, false);
  assert.equal(assertAllowlistedRoute('https://worlds.example/place', ['https://worlds.example']), 'https://worlds.example/place');
  assert.throws(() => assertAllowlistedRoute('http://worlds.example', ['https://worlds.example']), /HTTPS/);
  assert.throws(() => assertAllowlistedRoute('https://attacker.example', ['https://worlds.example']), /allowlisted/);
});

test('Worlds exposes exactly nine typed tools and gates sources, code, Walk, approval, and runtime', () => {
  assert.deepEqual(WORLD_TOOLS, [
    'validate_world', 'check_sources', 'estimate_world', 'make_world', 'world_status',
    'inspect_world', 'package_world', 'duplicate_world', 'list_starters'
  ]);
  assert.equal(validateWorldPlan(worldPlan()).valid, true);
  assert.equal(estimateWorld(worldPlan()).executing, false);
  assert.throws(() => validateWorldPlan(worldPlan({ experience: 'walk' })), error => error.evidence.code === 'walk-gated');
  assert.throws(() => validateWorldPlan(worldPlan({ shell: 'python build.py' })), error => error.evidence.code === 'arbitrary-access-forbidden');
  assert.throws(() => validateWorldPlan(worldPlan({ sources: [{ id: 'asset:x', revision: 1, hash, verified: false, rights: 'unknown' }] })), error => error.evidence.code === 'unverified-source');
  assert.throws(() => makeWorld(worldPlan(), { toolName: 'make_world', approved: true, runtimeEvidence: { status: 'unavailable' } }), error => error.evidence.code === 'runtime-required');
  assert.equal(makeWorld(worldPlan(), {
    toolName: 'make_world',
    approved: true,
    runtimeEvidence: { authenticated: true, status: 'available', receiptId: 'receipt:mesh' }
  }).simulated, false);
});

test('Wardrobe treats temporary unavailability as replacement, never dislike, and has no checkout', () => {
  const result = chooseWardrobeOutfit(PLACE_FIXTURES.wardrobe.items, [
    'item:gold-jacket',
    'item:canvas-trousers'
  ]);
  assert.deepEqual(result.temporaryUnavailable, ['item:canvas-trousers']);
  assert.deepEqual(result.disliked, []);
  assert.equal(result.checkoutAvailable, false);
  assert.ok(result.outfit.some(item => item.id !== 'item:canvas-trousers'));
});

test('House Scope Wall withholds ambient nodes and the Intent Gate requires a two-note commit', () => {
  const graph = [
    { id: 'room:front-room' },
    { id: 'home:exact-address' },
    { id: 'photo:family-wall' }
  ];
  const preview = previewHouseIntent({ intent: 'Plan lighting', selectedNodes: ['room:front-room'], homeGraph: graph });
  assert.deepEqual(preview.sentFields, ['room:front-room']);
  assert.deepEqual(preview.withheldFields, ['home:exact-address', 'photo:family-wall']);
  assert.equal(preview.executing, false);
  assert.throws(() => commitHouseIntent(preview, { intentNote: 'Lighting', consequenceNote: '', approvedBy: 'actor:hayden' }), error => error.evidence.code === 'two-note-commit');
  assert.equal(commitHouseIntent(preview, {
    intentNote: 'Try a warmer reading light.',
    consequenceNote: 'Only the local room plan changes.',
    approvedBy: 'actor:hayden'
  }).externalExecution, false);
});

test('Table is invite-only and releases an exact address only for approved person and service scope', () => {
  assert.throws(() => releaseTableAddress({ invited: false }), error => error.evidence.code === 'invite-required');
  assert.throws(() => releaseTableAddress({ invited: true, purposeApproved: true, serviceApproved: false, exactAddress: '1 Private Way' }), error => error.evidence.code === 'address-withheld');
  const grant = releaseTableAddress({
    invited: true,
    purposeApproved: true,
    serviceApproved: true,
    exactAddress: '1 Private Way'
  });
  assert.equal(grant.scope, 'this-gathering-only');
  assert.equal(grant.discoverable, false);
  assert.equal(grant.retainedBalance, false);
});

test('Channels never auto-publishes and Radio separates source, revision, voice, export, and publish approvals', () => {
  assert.throws(() => stageChannelPremiere({ sourcePackage: sourcePackage({ targetPlaceId: 'app:gummy-channels' }), autoPublish: true }), error => error.evidence.code === 'auto-publish-forbidden');
  assert.equal(stageChannelPremiere({ sourcePackage: sourcePackage({ targetPlaceId: 'app:gummy-channels' }) }).published, false);
  const episode = createRadioEpisode({ id: 'radio-episode:test', title: 'Test', sourcePackage: sourcePackage() });
  const revised = reviseRadioScript(episode, 'A bounded script.');
  assert.equal(revised.script.revision, 2);
  assert.equal(revised.exportApproval.approved, false);
  assert.throws(() => prepareRadioExport(revised, { visibility: 'public', browserSpeech: true }), error => error.evidence.code === 'script-approval-required');
  const approvedPrivate = {
    ...structuredClone(revised),
    script: { ...revised.script, approved: true }
  };
  assert.throws(() => prepareRadioExport(approvedPrivate, { visibility: 'public', browserSpeech: true }), error => error.evidence.code === 'private-source');
  const demo = prepareRadioExport(approvedPrivate, { visibility: 'participants', browserSpeech: true });
  assert.equal(demo.mode, 'browser-speech-demonstration');
  assert.equal(demo.finalAudio, false);
  assert.equal(demo.published, false);
});

test('all four cross-Place journeys produce linked immutable previews with explicit exclusions', () => {
  for (const kind of ['creator-premiere', 'home-project', 'real-world-gathering', 'world-premiere']) {
    const journey = buildCrossPlaceJourney(kind);
    assert.equal(journey.preview.executionState, 'preview');
    assert.equal(journey.preview.sourcePackageId, journey.sourcePackage.id);
    assert.ok(journey.preview.withheldFields.includes('credentials'));
    assert.ok(Object.isFrozen(journey.preview));
  }
});
