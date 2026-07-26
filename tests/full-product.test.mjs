import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { applicationLaunchState, loadProductCatalog, REQUIRED_APPLICATION_IDS } from '../src/core/product-registry.js';
import {
  adaptImageHossAcceptedAsset,
  adaptSpecialistArtifact,
  assertHandoffCapability,
  handoffToGummy,
  shareGummyWithBowl
} from '../src/integrations/app-handoff.js';
import {
  FairRoomQueue,
  LOCAL_OPERATOR_ID,
  LOCAL_OPERATOR_MODEL,
  localOperatorRecord,
  routeOperatorTask,
  sanitizeLocalOperatorCapabilitySnapshot
} from '../src/integrations/local-operator.js';
import { roomOperationReceiptInput, roomToBowl } from '../src/integrations/gummy-rooms.js';
import { ensureFullProductRecords, personalRecords } from '../src/core/records.js';

const hash = 'a'.repeat(64);

function registryFetch() {
  return async path => {
    const filename = path.endsWith('product-map.json')
      ? '../public/registry/product-map.json'
      : '../public/registry/first-party-applications.json';
    const body = await readFile(new URL(filename, import.meta.url), 'utf8');
    return new Response(body, { status: 200, headers: { 'content-type': 'application/json' } });
  };
}

test('full product map and first-party registry preserve every protected pillar', async () => {
  const catalog = await loadProductCatalog(registryFetch());
  assert.equal(catalog.productMap.pillars.length, 8);
  assert.ok(catalog.productMap.pillars.every(pillar => pillar.visibility === 'visible'));
  assert.deepEqual(
    new Set(catalog.applicationRegistry.applications.map(application => application.id)),
    new Set(REQUIRED_APPLICATION_IDS)
  );
  assert.throws(() => {
    catalog.applicationRegistry.applications[0].name = 'Flattened prompt box';
  }, TypeError);
});

test('application launch states are truthful and capability-gated', async () => {
  const { applicationRegistry } = await loadProductCatalog(registryFetch());
  const applications = new Map(applicationRegistry.applications.map(application => [application.id, application]));
  const videoBoss = applicationLaunchState(applications.get('app:videoboss'));
  assert.equal(videoBoss.available, true);
  assert.equal(new URL(videoBoss.route).protocol, 'https:');
  const imageHoss = applicationLaunchState(applications.get('app:imagehoss'));
  assert.equal(imageHoss.available, false);
  assert.match(imageHoss.reason, /authenticated local ImageHoss bridge/);
  const rooms = applicationLaunchState(applications.get('app:gummy-rooms'));
  assert.equal(rooms.available, false);
  assert.match(rooms.reason, /No authenticated Gummy Rooms service/);
});

test('ImageHoss accepted Asset becomes an immutable VideoBoss handoff without losing evidence', () => {
  const source = {
    schema: 'imagehoss.video-boss-handoff/r3',
    targetProjectId: 'project_video_boss',
    asset: {
      id: 'asset:imagehoss:accepted',
      role: 'hero-reference',
      revision: 7,
      hash: { algorithm: 'sha256', value: hash },
      provenance: { jobId: 'job:imagehoss:1', route: 'local-comfyui', real: true },
      rights: { use: 'project-only', ownerActorId: 'actor:hayden' }
    },
    evidenceRefs: ['receipt:imagehoss:1'],
    limitations: ['Consumer cannot rehash source bytes that remain in ImageHoss.']
  };
  const handoff = adaptImageHossAcceptedAsset(source, {
    id: 'handoff:imagehoss:videoboss:1',
    expectedAssetRevision: 7,
    createdAt: '2026-07-26T20:00:00.000Z'
  });
  assert.equal(handoff.sourceApplicationId, 'app:imagehoss');
  assert.equal(handoff.targetApplicationId, 'app:videoboss');
  assert.equal(handoff.hashes[0].value, hash);
  assert.deepEqual(handoff.rights, source.asset.rights);
  source.asset.provenance.real = false;
  assert.equal(handoff.sourceEnvelope.asset.provenance.real, true);
  assert.throws(() => {
    handoff.rights.use = 'anything';
  }, TypeError);
});

test('VideoBoss and 3D Bee artifacts become separate provenance-preserving Gummies', () => {
  const source = { schema: 'videoboss.production-export/r3', packetId: 'shot-packet:1', revision: 2 };
  const handoff = adaptSpecialistArtifact(source, {
    id: 'handoff:videoboss:gummy:1',
    sourceApplicationId: 'app:videoboss',
    sourceProtocolVersion: source.schema,
    projectId: 'project:gummy-film',
    artifactType: 'shot-packet',
    assetRefs: [{ id: 'asset:take:1', role: 'reviewed-take', revision: 2 }],
    hashes: [{ algorithm: 'sha256', value: hash }],
    provenance: { reviewId: 'review:1' },
    rights: { ownerActorId: 'actor:hayden' },
    limitations: ['Render output remains simulated.'],
    evidenceRefs: ['receipt:videoboss:1'],
    expectedRevision: 2,
    createdAt: '2026-07-26T20:00:00.000Z'
  });
  const gummy = handoffToGummy(handoff, {
    id: 'gummy:shot-packet:1',
    title: 'Reviewed shot packet',
    ownerActorId: 'actor:hayden',
    creatorActorId: 'actor:hayden',
    byteRef: '/gummies/shot-packet/1',
    sizeBytes: 481,
    createdAt: '2026-07-26T20:00:00.000Z'
  });
  assert.equal(gummy.id, 'gummy:shot-packet:1');
  assert.equal(gummy.content.sizeBytes, 481);
  assert.equal(gummy.provenance.handoffId, handoff.id);
  assert.deepEqual(gummy.limitations, ['Render output remains simulated.']);
  assert.deepEqual(gummy.extensions.immutableSourceEnvelope, source);

  const threeDSource = {
    schema: '3d-bee.scene-package/r2d',
    worldSeedId: 'world-seed:night-water',
    revision: 1,
    exports: ['scene.blend', 'scene.glb', 'handoff.json']
  };
  const threeDHandoff = adaptSpecialistArtifact(threeDSource, {
    id: 'handoff:3d-bee:gummy:1',
    sourceApplicationId: 'app:3d-bee',
    sourceProtocolVersion: threeDSource.schema,
    projectId: 'project:gummy-world',
    artifactType: 'scene-package',
    assetRefs: [{ id: 'asset:scene:1', role: 'editable-blender-source', revision: 1 }],
    hashes: [{ algorithm: 'sha256', value: 'b'.repeat(64) }],
    provenance: { checkpointId: 'checkpoint:scene:1', supervisorAuthenticated: true },
    rights: { ownerActorId: 'actor:hayden', engineContinuation: ['unity', 'unreal'] },
    limitations: ['No live Blender artifact is claimed by this fixture.'],
    evidenceRefs: ['receipt:3d-bee:1'],
    expectedRevision: 1,
    createdAt: '2026-07-26T20:00:00.000Z'
  });
  const threeDGummy = handoffToGummy(threeDHandoff, {
    id: 'gummy:scene-package:1',
    title: 'World Seed scene package',
    ownerActorId: 'actor:hayden',
    creatorActorId: 'actor:hayden',
    byteRef: '/gummies/scene-package/1',
    createdAt: '2026-07-26T20:00:00.000Z'
  });
  assert.equal(threeDGummy.provenance.sourceApplicationId, 'app:3d-bee');
  assert.deepEqual(threeDGummy.extensions.immutableSourceEnvelope.exports, ['scene.blend', 'scene.glb', 'handoff.json']);
});

test('handoff Gummies and Bowl shares reject invalid record identities', () => {
  const handoff = adaptSpecialistArtifact({ schema: 'videoboss.production-export/r3' }, {
    id: 'handoff:videoboss:gummy:invalid-check',
    sourceApplicationId: 'app:videoboss',
    sourceProtocolVersion: 'videoboss.production-export/r3',
    projectId: 'project:gummy-film',
    artifactType: 'shot-packet',
    hashes: [{ algorithm: 'sha256', value: hash }],
    provenance: { source: 'reviewed-production-packet' },
    rights: { ownerActorId: 'actor:hayden' },
    createdAt: '2026-07-26T20:00:00.000Z'
  });

  assert.throws(() => handoffToGummy(handoff, {
    id: 'not-a-gummy',
    title: 'Invalid identity',
    ownerActorId: 'actor:hayden',
    creatorActorId: 'actor:hayden',
    byteRef: '/gummies/invalid'
  }), /gummy:/);

  assert.throws(() => shareGummyWithBowl({
    gummy: { id: 'gummy:result:1' },
    bowl: { id: 'bowl:project', gummyIds: [] },
    createdByActorId: 'actor:hayden',
    linkId: 'not-a-link'
  }), /link:/);
});

test('cross-app adapters fail closed with structured evidence', () => {
  const validInput = {
    id: 'handoff:videoboss:gummy:failure-check',
    sourceApplicationId: 'app:videoboss',
    sourceProtocolVersion: 'videoboss.production-export/r3',
    projectId: 'project:gummy-film',
    artifactType: 'shot-packet',
    assetRefs: [{ id: 'asset:take:1', role: 'reviewed-take', revision: 2 }],
    hashes: [{ algorithm: 'sha256', value: hash }],
    provenance: { reviewId: 'review:1' },
    rights: { ownerActorId: 'actor:hayden' },
    expectedRevision: 2,
    createdAt: '2026-07-26T20:00:00.000Z'
  };
  const source = { schema: 'videoboss.production-export/r3', revision: 2 };

  for (const [expectedCode, operation] of [
    ['unsupported-protocol', () => adaptSpecialistArtifact(source, { ...validInput, sourceProtocolVersion: 'videoboss.production-export/r99' })],
    ['missing-hash', () => adaptSpecialistArtifact(source, { ...validInput, hashes: [] })],
    ['missing-rights', () => adaptSpecialistArtifact(source, { ...validInput, rights: {} })],
    ['stale-revision', () => adaptSpecialistArtifact({ ...source, revision: 1 }, validInput)],
    ['capability-unavailable', () => assertHandoffCapability({ authenticated: false, status: 'offline', capabilities: [] }, 'scene-package.export')]
  ]) {
    assert.throws(operation, error => {
      assert.equal(error.evidence.status, 'blocked');
      assert.equal(error.evidence.code, expectedCode);
      assert.equal(Object.isFrozen(error.evidence), true);
      return true;
    });
  }
});

test('optional Bowl sharing creates a Link and never mutates the source Gummy or Bowl', () => {
  const gummy = { schema: 'gummy.gummy/v0', id: 'gummy:result:1', title: 'Result' };
  const bowl = {
    schema: 'gummy.bowl/v0',
    id: 'bowl:project',
    visibility: 'private',
    gummyIds: [],
    policy: { whoCanPublish: ['actor:hayden'] }
  };
  const shared = shareGummyWithBowl({
    gummy,
    bowl,
    createdByActorId: 'actor:hayden',
    linkId: 'link:shared-result',
    createdAt: '2026-07-26T20:00:00.000Z'
  });
  assert.deepEqual(bowl.gummyIds, []);
  assert.deepEqual(shared.bowl.gummyIds, ['gummy:result:1']);
  assert.equal(shared.link.type, 'shared-with');
  assert.deepEqual(shared.sourceGummy, gummy);
});

test('local 4B Operator remains offline and unauthorized until paired', () => {
  const record = localOperatorRecord({ now: '2026-07-26T20:00:00.000Z' });
  assert.equal(record.id, LOCAL_OPERATOR_ID);
  assert.equal(record.model, LOCAL_OPERATOR_MODEL);
  assert.equal(record.status, 'offline');
  assert.equal(record.extensions.activeAuthority, false);
  const personal = personalRecords({ sourceHash: hash, byteRef: '/gummies/source' });
  assert.equal(personal.human.authorizedAgentIds.includes(LOCAL_OPERATOR_ID), false);
  assert.equal(personal.actor.agentIds.includes(LOCAL_OPERATOR_ID), false);
  assert.equal(personal.masterControl.executorPolicy.allowedAgentIds.includes(LOCAL_OPERATOR_ID), false);
  const blocked = routeOperatorTask({
    requestedCapability: 'context.summarize',
    localSnapshot: { authenticated: false, status: 'offline', capabilities: [] },
    privacy: 'local-only'
  });
  assert.equal(blocked.status, 'blocked');
  const approval = routeOperatorTask({
    requestedCapability: 'context.summarize',
    localSnapshot: { authenticated: false, status: 'offline', capabilities: [] },
    cloudAllowed: true,
    humanApprovedCloudEscalation: true
  });
  assert.equal(approval.status, 'approval-required');
  assert.deepEqual(approval.missingApprovals, ['privacy', 'cost']);
  const local = routeOperatorTask({
    requestedCapability: 'context.summarize',
    localSnapshot: {
      authenticated: true,
      status: 'available',
      model: LOCAL_OPERATOR_MODEL,
      capabilities: ['context.summarize'],
      token: 'must-not-leak'
    }
  });
  assert.equal(local.executorId, LOCAL_OPERATOR_ID);
  assert.equal(local.locality, 'local');
  const escalated = routeOperatorTask({
    requestedCapability: 'context.summarize',
    localSnapshot: { authenticated: false, status: 'offline', capabilities: [] },
    cloudAllowed: true,
    privacyApproved: true,
    costApproved: true,
    humanApprovedCloudEscalation: true
  });
  assert.equal(escalated.status, 'escalation-approved');
  assert.equal(escalated.executorId, 'agent:glopper-cloud');
  assert.deepEqual(escalated.approvals, {
    policy: true,
    privacy: true,
    cost: true,
    human: true
  });

  const sanitized = sanitizeLocalOperatorCapabilitySnapshot({
    authenticated: true,
    status: 'available',
    model: LOCAL_OPERATOR_MODEL,
    capabilities: ['context.summarize', 'shell.execute'],
    token: 'must-not-leak',
    endpoint: 'http://127.0.0.1:11434'
  });
  assert.deepEqual(sanitized.capabilities, ['context.summarize']);
  assert.equal('token' in sanitized, false);
  assert.equal('endpoint' in sanitized, false);
  assert.equal(Object.isFrozen(sanitized.capabilities), true);
});

test('existing personal state receives the offline Operator record through an idempotent additive migration', async () => {
  const records = new Map([
    ['humans:human:hayden', { id: 'human:hayden' }],
    ['actors:actor:hayden', { id: 'actor:hayden' }]
  ]);
  const repository = {
    get: async (store, id) => records.get(`${store}:${id}`),
    putValidated: async (store, record) => records.set(`${store}:${record.id}`, structuredClone(record))
  };
  assert.equal(await ensureFullProductRecords(repository), true);
  assert.equal(await ensureFullProductRecords(repository), false);
  assert.equal(records.get(`agents:${LOCAL_OPERATOR_ID}`).status, 'offline');
});

test('Gummy Rooms fair queue preserves round-robin order and isolated thread keys', () => {
  const queue = new FairRoomQueue();
  queue.enqueue('actor:alice', { prompt: 'a1' });
  queue.enqueue('actor:alice', { prompt: 'a2' });
  queue.enqueue('actor:bob', { prompt: 'b1' });
  assert.deepEqual(
    [queue.next(), queue.next(), queue.next()].map(item => [item.actorId, item.item.prompt, item.threadKey]),
    [
      ['actor:alice', 'a1', 'thread:actor:alice'],
      ['actor:bob', 'b1', 'thread:actor:bob'],
      ['actor:alice', 'a2', 'thread:actor:alice']
    ]
  );
});

test('Gummy Rooms maps members to Actors, rooms to Bowls, and operations to explicit receipts', () => {
  const bowl = roomToBowl({
    id: 'night-water',
    name: 'Night Water Room',
    members: [{ actorId: 'actor:hayden', role: 'owner' }, { actorId: 'actor:studio-test' }],
    agentActorsAllowed: false
  }, {
    ownerActorId: 'actor:hayden',
    createdAt: '2026-07-26T20:00:00.000Z'
  });
  assert.equal(bowl.id, 'bowl:room:night-water');
  assert.equal(bowl.members.length, 2);
  assert.equal(bowl.extensions.queuePolicy, 'fair-round-robin');
  assert.equal(Object.isFrozen(bowl.members), true);
  assert.equal(Object.isFrozen(bowl.extensions), true);
  const receipt = roomOperationReceiptInput({
    action: 'stream-room-result',
    actorId: 'actor:hayden',
    agentId: LOCAL_OPERATOR_ID,
    bowlId: bowl.id,
    detail: 'Streamed through a fair queue with an isolated Actor thread.'
  });
  assert.equal(receipt.operatorId, LOCAL_OPERATOR_ID);
  assert.equal(receipt.extensions.actorId, 'actor:hayden');
});
