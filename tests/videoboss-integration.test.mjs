import assert from 'node:assert/strict';
import test from 'node:test';
import {
  compileVideoBossPackage,
  createImageHossRepairHandoff,
  createMeshmallowSpatialHandoff,
  GummyVideoBossAdapter,
  keepEverythingExceptVideoBoss,
  migrateVideoBossConfiguration,
  VIDEOBOSS_CONTRACT
} from '../src/integrations/videoboss.js';
import { assertSpecialistAdapter, SpecialistJobStore } from '../src/integrations/specialist-adapter.js';

const legacy = {
  schema: 'gummy.production-actor-configuration/v0',
  id: 'production-config:night-gummy-launch:videoboss',
  productionId: 'production:night-gummy-launch',
  revision: '3',
  settings: {
    purpose: 'Create an eight-second Night Gummy launch motion package.',
    audience: 'public',
    durationSeconds: 8,
    aspectRatio: '16:9',
    continuityLocks: 'accepted launch image; exact palette; readable safe space',
    sequence: 'reveal, settle, logo-safe hold',
    route: 'deterministic-demonstration',
    variationBudget: '1 take per shot',
    acceptance: 'continuity; motion clarity; camera restraint; Human role acceptance'
  },
  imageHossAssets: [{
    id: 'accepted-asset:night-gummy-launch:keyframe',
    sha256: 'a'.repeat(64),
    role: 'video-first-frame',
    protectedRegions: ['right-side-interface-safe-space'],
    movableRegions: ['ambient-gummy-lights'],
    rights: { audience: 'public', permittedUses: ['Gummy OS launch'] }
  }]
};

test('Gummy reconciles the exact VideoBoss Phase 5 head and shared adapter surface', () => {
  assert.equal(VIDEOBOSS_CONTRACT.head, '3fe1a8f8043086faaa98c938ad7f044ef2be6494');
  assertSpecialistAdapter(new GummyVideoBossAdapter());
});

test('legacy config migrates additively and preserves accepted ImageHoss regions and rights', async () => {
  const migrated = migrateVideoBossConfiguration(legacy);
  assert.equal(migrated.migration.preservesSource, true);
  assert.deepEqual(migrated.imageHossAssets[0].protectedRegions, ['right-side-interface-safe-space']);
  assert.equal(migrated.imageHossAssets[0].rights.audience, 'public');
  assert.deepEqual(await compileVideoBossPackage(migrated), await compileVideoBossPackage(migrated));
});

test('compile creates editable shot packets without creating a Job or render call', async () => {
  const store = new SpecialistJobStore();
  const adapter = new GummyVideoBossAdapter({ store });
  const compiled = await adapter.compilePackage(migrateVideoBossConfiguration(legacy));
  assert.equal(compiled.shotPackets.length, 3);
  assert.equal(compiled.estimatedCostUsd, 0);
  assert.equal(store.byIdempotencyKey(compiled.digest), null);
});

test('Make Production runs deterministic takes, review, acceptance, and distinct linked evidence', async () => {
  const adapter = new GummyVideoBossAdapter();
  const compiled = await adapter.compilePackage(migrateVideoBossConfiguration(legacy));
  const job = await adapter.execute({
    package: compiled,
    idempotencyKey: 'videoboss:night-launch:1',
    authorization: { action: 'make-production', approvedBy: 'human:hayden', packageDigest: compiled.digest }
  });
  assert.equal(job.status, 'succeeded');
  assert.equal(job.simulation, true);
  const inspected = adapter.inspectResult(job.id);
  assert.equal(inspected.takes.length, 3);
  assert.ok(Object.hasOwn(inspected.takes[0].review, 'continuity'));
  assert.equal(inspected.specialistReceipts[0].schema, 'videoboss.production-receipt/v1');
  assert.equal(inspected.gummyEvidence[0].return.schema, 'gummy.work-return/v0');
  assert.equal(inspected.gummyEvidence[0].receipt.schema, 'gummy.action-receipt/v0');
  assert.notEqual(inspected.specialistReceipts[0].id, inspected.gummyEvidence[0].receipt.id);
  assert.deepEqual(inspected.gummyEvidence[0].receipt.linkedSpecialistReceiptIds, [inspected.specialistReceipts[0].id]);
  const accepted = adapter.acceptTake({
    jobId: job.id,
    takeId: inspected.takes[0].id,
    role: 'accepted-take',
    acceptedBy: 'human:hayden'
  });
  assert.equal(accepted.takeHash, inspected.takes[0].sha256);
});

test('live route fails truthfully without a trusted server render broker', async () => {
  const adapter = new GummyVideoBossAdapter();
  const configuration = migrateVideoBossConfiguration(legacy);
  configuration.route = {
    ...configuration.route,
    id: 'broker',
    locality: 'server',
    costCeilingUsd: 10
  };
  const compiled = await adapter.compilePackage(configuration);
  const job = await adapter.execute({
    package: compiled,
    idempotencyKey: 'videoboss:night-launch:live',
    authorization: { action: 'make-production', approvedBy: 'human:hayden', packageDigest: compiled.digest }
  });
  assert.equal(job.status, 'failed');
  assert.equal(job.failure.code, 'VIDEO_PROVIDER_UNAVAILABLE');
  assert.equal(job.simulation, false);
});

test('provider transport ambiguity pauses for inspect-first recovery without duplicate submission', async () => {
  let calls = 0;
  const broker = {
    discover: async () => ({ authenticated: true, ready: true, status: 'ready' }),
    submit: async () => {
      calls += 1;
      throw Object.assign(new Error('provider response was ambiguous'), { ambiguous: true });
    }
  };
  const adapter = new GummyVideoBossAdapter({ broker });
  const configuration = migrateVideoBossConfiguration(legacy);
  configuration.route = { ...configuration.route, id: 'broker', locality: 'server', costCeilingUsd: 10 };
  const compiled = await adapter.compilePackage(configuration);
  const authorization = { action: 'make-production', approvedBy: 'human:hayden', packageDigest: compiled.digest };
  const first = await adapter.execute({ package: compiled, idempotencyKey: 'ambiguous', authorization });
  const second = await adapter.execute({ package: compiled, idempotencyKey: 'ambiguous', authorization });
  assert.equal(first.status, 'recovery-required');
  assert.deepEqual(second, first);
  assert.equal(calls, 1);
});

test('restart recovery, owned cancellation, and Production isolation fail closed', async () => {
  const store = new SpecialistJobStore();
  const broker = {
    discover: async () => ({ authenticated: true, ready: true, status: 'ready' }),
    submit: async ({ sequence }) => ({ id: `native:${sequence.productionId}`, status: 'running' }),
    recover: async () => ({ status: 'running' }),
    cancel: async () => ({ status: 'cancelled' })
  };
  const adapter = new GummyVideoBossAdapter({ store, broker });
  const first = migrateVideoBossConfiguration(legacy);
  first.route = { ...first.route, id: 'broker', locality: 'server', costCeilingUsd: 10 };
  const other = migrateVideoBossConfiguration({ ...legacy, id: 'legacy:other' }, 'production:other');
  other.productionId = 'production:other';
  other.id = 'videoboss-config:production:other';
  other.route = { ...other.route, id: 'broker', locality: 'server', costCeilingUsd: 10 };
  const firstPackage = await adapter.compilePackage(first);
  const otherPackage = await adapter.compilePackage(other);
  const firstJob = await adapter.execute({
    package: firstPackage,
    idempotencyKey: 'first',
    authorization: { action: 'make-production', approvedBy: 'human:hayden', packageDigest: firstPackage.digest }
  });
  const otherJob = await adapter.execute({
    package: otherPackage,
    idempotencyKey: 'other',
    authorization: { action: 'make-production', approvedBy: 'human:hayden', packageDigest: otherPackage.digest }
  });
  const restarted = new GummyVideoBossAdapter({ store, broker });
  assert.equal((await restarted.recover(firstJob.id, firstPackage)).status, 'running');
  await restarted.cancel(firstJob.id);
  assert.equal(restarted.inspectResult(otherJob.id).job.status, 'running');
  await assert.rejects(() => restarted.cancel('foreign-job'), /Owned VideoBoss Job required/);
});

test('delta revisions and typed repair/spatial handoffs preserve bounded authority', () => {
  const configuration = migrateVideoBossConfiguration(legacy);
  configuration.acceptedTakeLocks = ['take:accepted'];
  const revised = keepEverythingExceptVideoBoss(configuration, { except: 'camera speed', note: 'slower' });
  assert.equal(revised.revision, configuration.revision + 1);
  assert.deepEqual(revised.delta.acceptedTakeLocks, ['take:accepted']);
  const repair = createImageHossRepairHandoff({
    productionId: configuration.productionId,
    shotPacketId: 'shot-packet:1',
    failedTakeId: 'take:1',
    issue: 'protect title-safe region'
  });
  const spatial = createMeshmallowSpatialHandoff({
    productionId: configuration.productionId,
    shotPacketId: 'shot-packet:1',
    spatialNeed: 'camera reference'
  });
  assert.equal(repair.authority.repositoryWrite, false);
  assert.equal(spatial.authority.nativeExecution, false);
});
