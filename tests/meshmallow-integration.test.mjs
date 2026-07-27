import assert from 'node:assert/strict';
import test from 'node:test';
import {
  compileMeshmallowPackage,
  GummyMeshmallowAdapter,
  MESHMALLOW_CONTRACT,
  migrateMeshmallowConfiguration,
  normalizeMeshmallowEngineHandoff
} from '../src/integrations/meshmallow.js';
import { assertSpecialistAdapter, SpecialistJobStore } from '../src/integrations/specialist-adapter.js';

const legacy = {
  schema: 'gummy.production-actor-configuration/v0',
  id: 'production-config:night-gummy-launch:3d-bee',
  productionId: 'production:night-gummy-launch',
  revision: '2',
  settings: {
    worldIntent: 'A contained stylized Night Gummy launch chamber with readable interface-safe space.',
    targetUse: 'Editable Blender source and declared engine handoff',
    locks: 'five-color Gummy palette; Gummy silhouette language',
    exploration: 'layout; lighting',
    outputs: 'blend-source; glb-package; preview; manifest',
    acceptance: 'contained editable scene; manifest hashes validate; Human role acceptance',
    route: 'deterministic-demonstration'
  },
  acceptedAssets: [{
    id: 'accepted-asset:night-gummy-launch:keyframe',
    sha256: 'a'.repeat(64),
    role: 'spatial-reference',
    rights: { audience: 'public', permittedUses: ['Gummy OS launch'] }
  }]
};

test('Gummy reconciles the exact Meshmallow Phase 6 head and shared adapter surface', () => {
  assert.equal(MESHMALLOW_CONTRACT.head, '0c911f7552739f2e0bdefaf863a78a53f04a04c0');
  assert.equal(MESHMALLOW_CONTRACT.applicationId, 'app:3d-bee');
  assert.equal(MESHMALLOW_CONTRACT.actorId, 'actor:3d-bee');
  assertSpecialistAdapter(new GummyMeshmallowAdapter());
});

test('migration adds public Meshmallow records without rewriting 3D Bee identity or source', async () => {
  const migrated = migrateMeshmallowConfiguration(legacy);
  assert.equal(migrated.migration.preservesSource, true);
  assert.equal(migrated.legacyIdentity.historicalRecordsRewritten, false);
  assert.ok(migrated.legacyIdentity.protocolsPreserved.includes('three-d-bee.scene-plan/1'));
  const compiled = await compileMeshmallowPackage(migrated);
  assert.equal(compiled.legacyScenePlan.schema, 'three-d-bee.scene-plan/1');
  assert.deepEqual(compiled, await compileMeshmallowPackage(migrated));
});

test('compile freezes plan digest and Gummy execution mapping without creating a Job', async () => {
  const store = new SpecialistJobStore();
  const adapter = new GummyMeshmallowAdapter({ store });
  const compiled = await adapter.compilePackage(migrateMeshmallowConfiguration(legacy));
  assert.match(compiled.planDigest, /^[a-f0-9]{64}$/);
  assert.equal(compiled.gummyExecution.workOrder.schema, 'gummy.work-order/v0');
  assert.equal(compiled.gummyExecution.contextEnvelope.schema, 'gummy.context-envelope/v0');
  assert.equal(compiled.gummyExecution.grant.planDigest, compiled.planDigest);
  assert.equal(store.byIdempotencyKey(compiled.digest), null);
});

test('Make Production runs deterministic named operations with distinct linked evidence', async () => {
  const adapter = new GummyMeshmallowAdapter();
  const compiled = await adapter.compilePackage(migrateMeshmallowConfiguration(legacy));
  const job = await adapter.execute({
    package: compiled,
    idempotencyKey: 'meshmallow:night-launch:1',
    authorization: {
      action: 'make-production',
      approvedBy: 'human:hayden',
      packageDigest: compiled.digest,
      planDigest: compiled.planDigest
    }
  });
  assert.equal(job.status, 'succeeded');
  assert.equal(job.simulation, true);
  assert.ok(job.runtimeEvidence.every(item => item.status === 'simulated' && item.artifacts.length === 0));
  const inspected = adapter.inspectResult(job.id);
  assert.equal(inspected.specialistReceipts[0].schema, 'meshmallow.production-receipt/v1');
  assert.equal(inspected.gummyEvidence[0].return.schema, 'gummy.work-return/v0');
  assert.notEqual(inspected.specialistReceipts[0].id, inspected.gummyEvidence[0].receipt.id);
  assert.deepEqual(inspected.gummyEvidence[0].receipt.linkedSpecialistReceiptIds, [inspected.specialistReceipts[0].id]);
  assert.throws(() => adapter.acceptCheckpoint({
    jobId: job.id,
    role: 'accepted-scene',
    acceptedBy: 'human:hayden'
  }), /Simulated Meshmallow output/);
});

test('stale plan approval, unknown capability, and workspace path escape fail closed', async () => {
  const adapter = new GummyMeshmallowAdapter();
  const configuration = migrateMeshmallowConfiguration(legacy);
  const compiled = await adapter.compilePackage(configuration);
  await assert.rejects(() => adapter.execute({
    package: compiled,
    idempotencyKey: 'stale',
    authorization: {
      action: 'make-production',
      approvedBy: 'human:hayden',
      packageDigest: compiled.digest,
      planDigest: 'b'.repeat(64)
    }
  }), /plan digest mismatch/);
  const unknown = migrateMeshmallowConfiguration(legacy);
  unknown.operations[0].capability = 'python.execute';
  await assert.rejects(() => adapter.compilePackage(unknown), /unknown-capability/);
  const escaped = migrateMeshmallowConfiguration(legacy);
  escaped.operations[2].arguments.output_path = '../outside.blend';
  await assert.rejects(() => adapter.compilePackage(escaped), /unsafe-workspace-path/);
});

test('supervisor route fails truthfully when supported Blender is unavailable', async () => {
  const adapter = new GummyMeshmallowAdapter();
  const configuration = migrateMeshmallowConfiguration(legacy);
  configuration.route = { ...configuration.route, id: 'supervisor', locality: 'desktop' };
  const compiled = await adapter.compilePackage(configuration);
  const job = await adapter.execute({
    package: compiled,
    idempotencyKey: 'meshmallow:live',
    authorization: {
      action: 'make-production',
      approvedBy: 'human:hayden',
      packageDigest: compiled.digest,
      planDigest: compiled.planDigest
    }
  });
  assert.equal(job.status, 'failed');
  assert.equal(job.failure.code, 'MESHMALLOW_RUNTIME_UNAVAILABLE');
  assert.equal(job.simulation, false);
});

test('ambiguous supervisor state is inspect-first and idempotent', async () => {
  let calls = 0;
  const transport = {
    discover: async () => ({ ready: true, status: 'ready' }),
    execute: async () => {
      calls += 1;
      throw Object.assign(new Error('supervisor response ambiguous'), { ambiguous: true });
    }
  };
  const adapter = new GummyMeshmallowAdapter({ transport });
  const configuration = migrateMeshmallowConfiguration(legacy);
  configuration.route = { ...configuration.route, id: 'supervisor', locality: 'desktop' };
  const compiled = await adapter.compilePackage(configuration);
  const authorization = {
    action: 'make-production',
    approvedBy: 'human:hayden',
    packageDigest: compiled.digest,
    planDigest: compiled.planDigest
  };
  const first = await adapter.execute({ package: compiled, idempotencyKey: 'ambiguous', authorization });
  const second = await adapter.execute({ package: compiled, idempotencyKey: 'ambiguous', authorization });
  assert.equal(first.status, 'recovery-required');
  assert.deepEqual(second, first);
  assert.equal(calls, 1);
});

test('restart recovery, owned cancellation, and Production isolation remain bounded', async () => {
  const store = new SpecialistJobStore();
  const transport = {
    discover: async () => ({ ready: true, status: 'ready' }),
    execute: async ({ package: compiled }) => ({ id: `native:${compiled.productionId}`, status: 'running' }),
    recover: async () => ({ status: 'running' }),
    cancel: async () => ({ status: 'cancelled' })
  };
  const adapter = new GummyMeshmallowAdapter({ store, transport });
  const first = migrateMeshmallowConfiguration(legacy);
  first.route = { ...first.route, id: 'supervisor', locality: 'desktop' };
  const other = migrateMeshmallowConfiguration({ ...legacy, id: 'legacy:other' }, 'production:other');
  other.productionId = 'production:other';
  other.id = 'meshmallow-config:production:other';
  other.route = { ...other.route, id: 'supervisor', locality: 'desktop' };
  const firstPackage = await adapter.compilePackage(first);
  const otherPackage = await adapter.compilePackage(other);
  const run = async (compiled, key) => adapter.execute({
    package: compiled,
    idempotencyKey: key,
    authorization: {
      action: 'make-production',
      approvedBy: 'human:hayden',
      packageDigest: compiled.digest,
      planDigest: compiled.planDigest
    }
  });
  const firstJob = await run(firstPackage, 'first');
  const otherJob = await run(otherPackage, 'other');
  const restarted = new GummyMeshmallowAdapter({ store, transport });
  assert.equal((await restarted.recover(firstJob.id, firstPackage)).status, 'running');
  await restarted.cancel(firstJob.id);
  assert.equal(restarted.inspectResult(otherJob.id).job.status, 'running');
  await assert.rejects(() => restarted.cancel('foreign'), /Owned Meshmallow Job/);
});

test('real accepted checkpoint can normalize a validated legacy 3D Bee engine handoff', () => {
  const checkpoint = {
    schema: 'meshmallow.checkpoint/v1',
    id: 'checkpoint:1',
    productionId: 'production:night-gummy-launch'
  };
  const legacyHandoff = {
    schema: 'three-d-bee.handoff/1',
    units: { meters_per_unit: 1, up_axis: 'Z', forward_axis: '-Y' },
    known_limitations: ['No game-readiness claim']
  };
  const handoff = normalizeMeshmallowEngineHandoff({
    checkpoint,
    legacyHandoff,
    artifacts: [{ role: 'glb-package', sha256: 'a'.repeat(64) }],
    validation: { status: 'passed', checks: ['hashes', 'containment'] },
    acceptedRole: 'engine-handoff'
  });
  assert.equal(handoff.schema, 'meshmallow.engine-handoff/v1');
  assert.equal(handoff.legacyHandoff.schema, 'three-d-bee.handoff/1');
});
