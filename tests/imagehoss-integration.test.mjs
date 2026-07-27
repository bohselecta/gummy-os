import assert from 'node:assert/strict';
import test from 'node:test';
import {
  compileImageHossPackage,
  GummyImageHossAdapter,
  IMAGEHOSS_CONTRACT,
  migrateImageHossConfiguration
} from '../src/integrations/imagehoss.js';
import { assertSpecialistAdapter, SpecialistJobStore } from '../src/integrations/specialist-adapter.js';

const legacy = {
  schema: 'gummy.production-actor-configuration/v0',
  id: 'production-config:night-gummy-launch:imagehoss',
  productionId: 'production:night-gummy-launch',
  revision: '2',
  settings: {
    direction: 'A tactile Night Gummy launch frame with calm confident spatial depth.',
    deliverable: 'One 16:9 launch image with protected interface-safe space.',
    locks: 'exact five-color Gummy palette; right-side interface-safe region',
    creativeDirection: 'soft underground glow; physical materials',
    preferences: 'restrained camera; clear silhouette',
    exclusions: 'no private likeness; no third-party marks',
    exploration: '4 candidates',
    route: 'deterministic-demonstration',
    acceptance: 'exact palette; readable safe space'
  },
  references: [{
    id: 'reference:gummy-brand-kit',
    assetId: 'asset:gummy-brand-kit',
    role: 'brand',
    extraction: ['palette', 'silhouette language'],
    ignore: ['embedded layout'],
    strength: 0.9,
    locked: true,
    rights: { basis: 'owned', audience: 'public', permittedUses: ['Gummy OS launch'] },
    retention: 'accepted-asset'
  }]
};

test('Gummy reconciles the exact ImageHoss Phase 4 head and shared adapter surface', () => {
  assert.equal(IMAGEHOSS_CONTRACT.head, '340f819b20c5b6d7ea988459c9380759941c757f');
  assertSpecialistAdapter(new GummyImageHossAdapter());
});

test('legacy Production config migrates additively and compiles identically', async () => {
  const migrated = migrateImageHossConfiguration(legacy);
  assert.equal(migrated.migration.preservesSource, true);
  assert.equal(migrated.references[0].role, 'brand');
  assert.deepEqual(await compileImageHossPackage(migrated), await compileImageHossPackage(migrated));
});

test('compilation does not create a specialist Job', async () => {
  const store = new SpecialistJobStore();
  const adapter = new GummyImageHossAdapter({ store });
  const compiled = await adapter.compilePackage(migrateImageHossConfiguration(legacy));
  assert.equal(store.byIdempotencyKey(compiled.digest), null);
});

test('Make Production creates deterministic candidates and distinct linked evidence', async () => {
  const adapter = new GummyImageHossAdapter();
  const compiled = await adapter.compilePackage(migrateImageHossConfiguration(legacy));
  const job = await adapter.execute({
    package: compiled,
    idempotencyKey: 'imagehoss:night-launch:1',
    authorization: { action: 'make-production', approvedBy: 'human:hayden', packageDigest: compiled.digest }
  });
  assert.equal(job.status, 'succeeded');
  assert.equal(job.simulation, true);
  const inspected = adapter.inspectResult(job.id);
  assert.equal(inspected.candidates.length, 4);
  assert.equal(inspected.specialistReceipts[0].schema, 'imagehoss.production-receipt/v1');
  assert.equal(inspected.gummyEvidence[0].return.schema, 'gummy.work-return/v0');
  assert.equal(inspected.gummyEvidence[0].receipt.schema, 'gummy.action-receipt/v0');
  assert.notEqual(inspected.specialistReceipts[0].id, inspected.gummyEvidence[0].receipt.id);
  assert.deepEqual(inspected.gummyEvidence[0].receipt.linkedSpecialistReceiptIds, [inspected.specialistReceipts[0].id]);
});

test('live route fails truthfully when the authenticated runtime is unavailable', async () => {
  const adapter = new GummyImageHossAdapter();
  const configuration = migrateImageHossConfiguration(legacy);
  configuration.route = {
    ...configuration.route,
    id: 'comfyui',
    workflowId: 'approved:imagehoss-safe-v1',
    locality: 'desktop',
    privacy: 'approved-local-companion'
  };
  const compiled = await adapter.compilePackage(configuration);
  const job = await adapter.execute({
    package: compiled,
    idempotencyKey: 'imagehoss:night-launch:live',
    authorization: { action: 'make-production', approvedBy: 'human:hayden', packageDigest: compiled.digest }
  });
  assert.equal(job.status, 'failed');
  assert.equal(job.failure.code, 'IMAGEHOSS_RUNTIME_UNAVAILABLE');
  assert.equal(job.simulation, false);
});

test('idempotency, owned cancellation, and Production isolation fail closed', async () => {
  const store = new SpecialistJobStore();
  const transport = {
    discover: async () => ({ authenticated: true, ready: true, status: 'ready' }),
    execute: async ({ package: compiled }) => ({ id: `native:${compiled.productionId}`, status: 'running' }),
    recover: async () => ({ status: 'running' }),
    cancel: async () => ({ status: 'cancelled' })
  };
  const adapter = new GummyImageHossAdapter({ store, transport });
  const first = migrateImageHossConfiguration(legacy);
  first.route = { ...first.route, id: 'comfyui', locality: 'desktop', privacy: 'approved-local-companion' };
  const second = { ...migrateImageHossConfiguration(legacy, 'production:other'), productionId: 'production:other', id: 'imagehoss-config:production:other' };
  const firstPackage = await adapter.compilePackage(first);
  const secondPackage = await adapter.compilePackage(second);
  const authorization = { action: 'make-production', approvedBy: 'human:hayden', packageDigest: firstPackage.digest };
  const firstJob = await adapter.execute({ package: firstPackage, idempotencyKey: 'first', authorization });
  assert.deepEqual(await adapter.execute({ package: firstPackage, idempotencyKey: 'first', authorization }), firstJob);
  const secondJob = await adapter.execute({
    package: secondPackage,
    idempotencyKey: 'second',
    authorization: { ...authorization, packageDigest: secondPackage.digest }
  });
  const secondStatus = adapter.inspectResult(secondJob.id).job.status;
  await adapter.cancel(firstJob.id);
  assert.equal(adapter.inspectResult(secondJob.id).job.status, secondStatus);
  await assert.rejects(() => adapter.cancel('foreign-job'), /Owned ImageHoss Job required/);
});
