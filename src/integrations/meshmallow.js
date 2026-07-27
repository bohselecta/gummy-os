import { sha256 } from '../core/hash.js';
import {
  assertMakeProductionAuthorization,
  assertSpecialistAdapter,
  SpecialistJobStore
} from './specialist-adapter.js';

export const MESHMALLOW_CONTRACT = Object.freeze({
  repository: 'bohselecta/3d-bee',
  head: '0c911f7552739f2e0bdefaf863a78a53f04a04c0',
  applicationId: 'app:3d-bee',
  actorId: 'actor:3d-bee',
  configurationSchema: 'gummy.meshmallow-production-configuration/v1',
  worldIntentSchema: 'meshmallow.world-intent/v1',
  scenePackageSchema: 'meshmallow.scene-package/v1',
  checkpointSchema: 'meshmallow.checkpoint/v1',
  engineHandoffSchema: 'meshmallow.engine-handoff/v1',
  jobSchema: 'meshmallow.production-job/v1',
  receiptSchema: 'meshmallow.production-receipt/v1',
  legacyScenePlanSchema: 'three-d-bee.scene-plan/1'
});

const allowedCapabilities = new Set([
  'bridge.health',
  'scene.describe',
  'scene.reset',
  'object.add_primitive',
  'object.transform',
  'material.apply_recipe',
  'light.apply_rig',
  'camera.apply',
  'checkpoint.save',
  'preview.render',
  'bundle.export',
  'job.cancel'
]);
const clone = value => structuredClone(value);
const now = () => new Date().toISOString();

function split(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value || '').split(/[;\n,]/).map(item => item.trim()).filter(Boolean);
}

function defaultOperations(productionId) {
  const slug = productionId.replace(/^production:/, '');
  return [
    {
      id: 'reset-scene',
      capability: 'scene.reset',
      arguments: { preserve_imports: false },
      requires_approval: true
    },
    {
      id: 'add-stage',
      capability: 'object.add_primitive',
      arguments: {
        primitive: 'cube',
        name: 'GUMMY_Stage',
        dimensions_m: [12, 8, 0.3],
        location_m: [0, 0, -0.15]
      },
      requires_approval: true
    },
    {
      id: 'save-checkpoint',
      capability: 'checkpoint.save',
      arguments: { output_path: `checkpoints/${slug}-r1.blend` },
      requires_approval: true
    },
    {
      id: 'render-preview',
      capability: 'preview.render',
      arguments: { output_path: `previews/${slug}-r1.png`, width: 1280, height: 720 },
      requires_approval: true
    }
  ];
}

export function migrateMeshmallowConfiguration(input, productionId = input.productionId) {
  if (input?.schema === MESHMALLOW_CONTRACT.configurationSchema) return clone(input);
  const settings = input?.settings || input || {};
  return {
    schema: MESHMALLOW_CONTRACT.configurationSchema,
    id: input?.id?.startsWith('meshmallow-config:')
      ? input.id
      : `meshmallow-config:${productionId}`,
    productionId,
    revision: Number(input?.revision || 1),
    worldIntent: settings.worldIntent || 'Create a contained, editable world for this Gummy Production.',
    targetUse: settings.targetUse || 'Editable Blender source and declared engine handoff',
    dimensions: {
      metersPerUnit: Number(input?.dimensions?.metersPerUnit || 1),
      upAxis: input?.dimensions?.upAxis || 'Z',
      forwardAxis: input?.dimensions?.forwardAxis || '-Y',
      boundsMeters: clone(input?.dimensions?.boundsMeters || [12, 8, 6])
    },
    acceptedAssets: clone(input?.acceptedAssets || input?.references || []).map((asset, index) => ({
      id: asset.id || `accepted-asset:${productionId}:${index + 1}`,
      sha256: asset.sha256 || asset.hash?.value || '',
      role: asset.role || 'spatial-reference',
      rights: clone(asset.rights || { audience: 'private', permittedUses: ['this Production only'] })
    })),
    exactLocks: split(settings.locks || input?.exactLocks),
    allowedExploration: split(settings.exploration || input?.allowedExploration),
    engineTarget: input?.engineTarget || settings.engineTarget || 'both',
    outputFormats: split(settings.outputs || input?.outputFormats || ['blend-source', 'glb-package', 'preview', 'manifest']),
    operations: clone(input?.operations || defaultOperations(productionId)),
    route: {
      id: input?.route?.id || (settings.route === 'supervisor' ? 'supervisor' : 'simulator'),
      locality: input?.route?.locality || (settings.route === 'supervisor' ? 'desktop' : 'browser'),
      blenderTarget: '4.5 LTS',
      timeoutMs: Number(input?.route?.timeoutMs || 60000)
    },
    acceptance: clone(input?.acceptance || {
      roles: ['accepted-scene', 'engine-handoff'],
      criteria: split(settings.acceptance || 'contained editable scene; manifest hashes validate; Human role acceptance'),
      humanAcceptanceRequired: true
    }),
    legacyIdentity: {
      repository: MESHMALLOW_CONTRACT.repository,
      applicationId: MESHMALLOW_CONTRACT.applicationId,
      actorId: MESHMALLOW_CONTRACT.actorId,
      protocolsPreserved: [
        'three-d-bee.scene-plan/1',
        'three-d-bee.bridge-request/2',
        'three-d-bee.blender-return/1',
        'three-d-bee.handoff/1'
      ],
      historicalRecordsRewritten: false
    },
    migration: {
      from: input?.schema || 'gummy.production-actor-configuration/v0',
      preservesSource: true
    }
  };
}

function containsUnsafePath(value) {
  if (Array.isArray(value)) return value.some(containsUnsafePath);
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(([key, nested]) => {
    if ((key === 'path' || key.endsWith('_path') || key.endsWith('_dir')) && typeof nested === 'string') {
      return nested.startsWith('/') || nested.split('/').includes('..') || nested.trim() === '';
    }
    return containsUnsafePath(nested);
  });
}

export function validateMeshmallowConfiguration(configuration) {
  const blockers = [];
  const warnings = [];
  if (configuration?.schema !== MESHMALLOW_CONTRACT.configurationSchema) blockers.push('unsupported-configuration-schema');
  if (!configuration?.productionId) blockers.push('production-id-required');
  if ((configuration?.worldIntent || '').trim().length < 20) blockers.push('meaningful-world-intent-required');
  if (!configuration?.targetUse?.trim()) blockers.push('target-use-required');
  if (!Number.isFinite(configuration?.dimensions?.metersPerUnit) || configuration.dimensions.metersPerUnit <= 0) blockers.push('invalid-unit-scale');
  if (configuration?.dimensions?.upAxis !== 'Z') blockers.push('blender-z-up-required');
  if (!['X', '-X', 'Y', '-Y'].includes(configuration?.dimensions?.forwardAxis)) blockers.push('horizontal-forward-axis-required');
  if (!configuration?.operations?.length) blockers.push('reviewed-operation-required');
  for (const operation of configuration?.operations || []) {
    if (!allowedCapabilities.has(operation.capability)) blockers.push(`unknown-capability:${operation.capability}`);
    if (operation.requires_approval !== true) blockers.push(`operation-not-approval-bound:${operation.id}`);
    if (!operation.arguments || Array.isArray(operation.arguments) || typeof operation.arguments !== 'object') blockers.push(`invalid-arguments:${operation.id}`);
    if (containsUnsafePath(operation.arguments)) blockers.push(`unsafe-workspace-path:${operation.id}`);
  }
  for (const asset of configuration?.acceptedAssets || []) {
    if (!/^[a-f0-9]{64}$/.test(asset.sha256)) warnings.push(`source-hash-unverified:${asset.id}`);
  }
  if (!configuration?.acceptance?.humanAcceptanceRequired || !configuration?.acceptance?.roles?.length) blockers.push('human-acceptance-contract-required');
  if (!configuration?.acceptedAssets?.length) warnings.push('no-accepted-source-assets');
  return { valid: blockers.length === 0, blockers, warnings };
}

export async function compileMeshmallowPackage(configuration) {
  const validation = validateMeshmallowConfiguration(configuration);
  if (!validation.valid) throw new Error(`Meshmallow configuration invalid: ${validation.blockers.join(', ')}`);
  const scenePlan = {
    schema: MESHMALLOW_CONTRACT.legacyScenePlanSchema,
    id: `scene-plan:${configuration.productionId}:r${configuration.revision}`,
    revision: configuration.revision,
    title: configuration.worldIntent,
    target: configuration.engineTarget,
    meters_per_unit: configuration.dimensions.metersPerUnit,
    operations: clone(configuration.operations)
  };
  const planDigest = await sha256(scenePlan);
  const unsigned = {
    schema: MESHMALLOW_CONTRACT.scenePackageSchema,
    id: `scene-package:${configuration.productionId}:r${configuration.revision}`,
    productionId: configuration.productionId,
    configurationId: configuration.id,
    configurationRevision: configuration.revision,
    worldIntent: {
      schema: MESHMALLOW_CONTRACT.worldIntentSchema,
      summary: configuration.worldIntent,
      targetUse: configuration.targetUse,
      units: clone(configuration.dimensions),
      engineTarget: configuration.engineTarget
    },
    acceptedAssets: clone(configuration.acceptedAssets),
    exactLocks: clone(configuration.exactLocks),
    allowedExploration: clone(configuration.allowedExploration),
    legacyScenePlan: scenePlan,
    planDigest,
    gummyExecution: {
      workOrder: {
        schema: 'gummy.work-order/v0',
        id: `work-order:scene-package:${configuration.productionId}:r${configuration.revision}`,
        targetActorId: MESHMALLOW_CONTRACT.actorId,
        action: 'make-production'
      },
      contextEnvelope: {
        schema: 'gummy.context-envelope/v0',
        productionId: configuration.productionId,
        includes: ['world-intent', 'accepted-assets', 'exact-locks'],
        excludes: ['complete-actor-memory', 'provider-credentials', 'ambient-filesystem']
      },
      mold: { id: 'mold:3d-bee:production-scene' },
      lease: { schema: 'gummy.task-lease/v0', scope: planDigest },
      grant: {
        schema: 'gummy.grant/v0',
        planDigest,
        capabilities: configuration.operations.map(operation => operation.capability)
      }
    },
    route: clone(configuration.route),
    expectedArtifacts: clone(configuration.outputFormats),
    acceptance: clone(configuration.acceptance),
    legacyIdentity: clone(configuration.legacyIdentity),
    limitations: configuration.route.id === 'simulator'
      ? ['Deterministic Meshmallow simulation; no Blender process runs and no scene artifacts are written.']
      : validation.warnings
  };
  return Object.freeze({ ...unsigned, digest: await sha256(unsigned) });
}

export class GummyMeshmallowAdapter {
  constructor({ transport = null, store = new SpecialistJobStore(), clock = now } = {}) {
    this.transport = transport;
    this.store = store;
    this.clock = clock;
    assertSpecialistAdapter(this);
  }

  async discover() {
    const blender = this.transport
      ? await this.transport.discover()
      : { ready: false, status: 'not-available', target: 'Blender 4.5 LTS', limitations: ['Supported Blender runtime is unavailable'] };
    return {
      schema: 'meshmallow.discovery/v1',
      publicName: 'Meshmallow',
      legacyIdentity: {
        repository: MESHMALLOW_CONTRACT.repository,
        applicationId: MESHMALLOW_CONTRACT.applicationId,
        actorId: MESHMALLOW_CONTRACT.actorId
      },
      deterministic: { available: true, simulation: true },
      blender,
      checkedAt: this.clock()
    };
  }

  validateConfiguration(configuration) {
    return validateMeshmallowConfiguration(configuration);
  }

  compilePackage(configuration) {
    return compileMeshmallowPackage(configuration);
  }

  async execute({ package: compiled, idempotencyKey, authorization }) {
    assertMakeProductionAuthorization(authorization, compiled.digest);
    if (authorization.planDigest !== compiled.planDigest) throw new Error('Approved Meshmallow plan digest mismatch');
    const prior = this.store.byIdempotencyKey(idempotencyKey);
    if (prior) return prior;
    let job = {
      schema: MESHMALLOW_CONTRACT.jobSchema,
      id: `meshmallow-job:${compiled.productionId}:${compiled.digest.slice(0, 12)}`,
      productionId: compiled.productionId,
      packageId: compiled.id,
      packageDigest: compiled.digest,
      planDigest: compiled.planDigest,
      idempotencyKey,
      owner: 'gummy-meshmallow-adapter',
      route: compiled.route.id,
      status: 'running',
      simulation: compiled.route.id === 'simulator',
      nativeJobId: null,
      runtimeEvidence: [],
      artifacts: [],
      specialistReceipts: [],
      gummyEvidence: [],
      createdAt: this.clock(),
      updatedAt: this.clock()
    };
    this.store.put(job);
    if (job.simulation) {
      job.status = 'succeeded';
      job.runtimeEvidence = compiled.legacyScenePlan.operations.map(operation => ({
        schema: 'three-d-bee.operation-evidence/1',
        operationId: operation.id,
        capability: operation.capability,
        status: 'simulated',
        summary: `Simulated ${operation.capability} without writing files`,
        artifacts: []
      }));
      job.updatedAt = this.clock();
      return this.withEvidence(job, compiled, 'completed');
    }
    const discovery = await this.discover();
    if (!this.transport || discovery.blender.ready !== true) {
      job.status = 'failed';
      job.failure = {
        code: 'MESHMALLOW_RUNTIME_UNAVAILABLE',
        message: 'Install or select supported Blender 4.5 LTS and start the project-scoped authenticated supervisor.',
        retryable: true
      };
      job.updatedAt = this.clock();
      return this.withEvidence(job, compiled, 'failed');
    }
    try {
      const result = await this.transport.execute({
        package: clone(compiled),
        plan: clone(compiled.legacyScenePlan),
        planDigest: compiled.planDigest,
        idempotencyKey
      });
      job.nativeJobId = result.id;
      job.status = result.status;
      job.runtimeEvidence = clone(result.evidence || []);
      job.artifacts = clone(result.artifacts || []);
      job.updatedAt = this.clock();
      if (result.status === 'succeeded') return this.withEvidence(job, compiled, 'completed');
      return this.store.put(job);
    } catch (error) {
      job.status = error?.ambiguous === true ? 'recovery-required' : 'failed';
      job.failure = {
        code: error?.ambiguous === true ? 'AMBIGUOUS_SUPERVISOR_STATE' : 'MESHMALLOW_EXECUTION_FAILED',
        message: error?.message || 'Meshmallow supervisor execution failed',
        retryable: false
      };
      job.updatedAt = this.clock();
      return job.status === 'failed' ? this.withEvidence(job, compiled, 'failed') : this.store.put(job);
    }
  }

  async recover(jobId, compiled) {
    let job = this.owned(jobId);
    if (['succeeded', 'failed', 'cancelled'].includes(job.status)) return job;
    if (!this.transport || !job.nativeJobId) {
      job.status = 'recovery-required';
      job.updatedAt = this.clock();
      return this.store.put(job);
    }
    const result = await this.transport.recover(job.nativeJobId);
    job.status = result.status;
    job.runtimeEvidence = clone(result.evidence || job.runtimeEvidence);
    job.artifacts = clone(result.artifacts || job.artifacts);
    job.updatedAt = this.clock();
    return result.status === 'succeeded'
      ? this.withEvidence(job, compiled, 'recovered')
      : this.store.put(job);
  }

  async cancel(jobId) {
    let job = this.owned(jobId);
    if (['succeeded', 'failed', 'cancelled'].includes(job.status)) return job;
    if (this.transport && job.nativeJobId) await this.transport.cancel(job.nativeJobId);
    job.status = 'cancelled';
    job.updatedAt = this.clock();
    return this.withEvidence(job, { digest: job.packageDigest, planDigest: job.planDigest }, 'cancelled');
  }

  inspectResult(jobId) {
    const job = this.owned(jobId);
    return Object.freeze({
      job,
      artifacts: clone(job.artifacts),
      runtimeEvidence: clone(job.runtimeEvidence),
      specialistReceipts: clone(job.specialistReceipts),
      gummyEvidence: clone(job.gummyEvidence)
    });
  }

  acceptCheckpoint({ jobId, role, acceptedBy }) {
    const job = this.owned(jobId);
    if (job.simulation) throw new Error('Simulated Meshmallow output cannot be accepted as a real checkpoint');
    if (job.status !== 'succeeded') throw new Error('Succeeded Meshmallow Job required');
    if (!['accepted-scene', 'engine-handoff'].includes(role) || !acceptedBy) throw new Error('Human checkpoint acceptance role required');
    const blend = job.artifacts.find(artifact => artifact.role === 'blend-source');
    const preview = job.artifacts.find(artifact => artifact.role === 'preview');
    if (!blend?.sha256 || !preview?.sha256) throw new Error('Validated .blend and preview evidence required');
    return {
      schema: MESHMALLOW_CONTRACT.checkpointSchema,
      id: `meshmallow-checkpoint:${job.id}:${role}`,
      productionId: job.productionId,
      jobId: job.id,
      planDigest: job.planDigest,
      blend: clone(blend),
      preview: clone(preview),
      acceptedRole: role,
      acceptedBy,
      acceptedAt: this.clock()
    };
  }

  owned(jobId) {
    const job = this.store.get(jobId);
    if (!job || job.owner !== 'gummy-meshmallow-adapter') throw new Error('Owned Meshmallow Job required');
    return job;
  }

  withEvidence(job, compiled, outcome) {
    const index = job.specialistReceipts.length + 1;
    const specialist = {
      schema: MESHMALLOW_CONTRACT.receiptSchema,
      id: `meshmallow-receipt:${job.id}:${index}`,
      productionId: job.productionId,
      jobId: job.id,
      outcome,
      simulation: job.simulation,
      packageDigest: compiled.digest,
      planDigest: compiled.planDigest,
      runtimeEvidence: clone(job.runtimeEvidence),
      artifactEvidence: clone(job.artifacts),
      legacyIdentity: {
        applicationId: MESHMALLOW_CONTRACT.applicationId,
        actorId: MESHMALLOW_CONTRACT.actorId
      },
      createdAt: this.clock()
    };
    const receipt = {
      schema: 'gummy.action-receipt/v0',
      id: `receipt:${job.id}:${index}`,
      productionId: job.productionId,
      action: `meshmallow.${outcome}`,
      outcome,
      resources: [job.id, specialist.id, compiled.digest],
      linkedSpecialistReceiptIds: [specialist.id],
      createdAt: this.clock()
    };
    const returned = {
      schema: 'gummy.work-return/v0',
      id: `return:${job.id}:${index}`,
      productionId: job.productionId,
      result: outcome === 'failed' ? 'failed' : outcome === 'cancelled' ? 'cancelled' : 'completed',
      specialistReceiptIds: [specialist.id],
      createdAt: this.clock()
    };
    job.specialistReceipts.push(specialist);
    job.gummyEvidence.push({ return: returned, receipt });
    return this.store.put(job);
  }
}

export function normalizeMeshmallowEngineHandoff({ checkpoint, legacyHandoff, artifacts, validation, acceptedRole }) {
  if (checkpoint?.schema !== MESHMALLOW_CONTRACT.checkpointSchema) throw new Error('Accepted Meshmallow checkpoint required');
  if (legacyHandoff?.schema !== 'three-d-bee.handoff/1') throw new Error('Legacy 3D Bee handoff required');
  if (validation?.status !== 'passed') throw new Error('Passed engine handoff validation required');
  return {
    schema: MESHMALLOW_CONTRACT.engineHandoffSchema,
    id: `meshmallow-engine-handoff:${checkpoint.id}`,
    productionId: checkpoint.productionId,
    checkpointId: checkpoint.id,
    legacyHandoff: clone(legacyHandoff),
    artifacts: clone(artifacts),
    units: clone(legacyHandoff.units),
    validation: clone(validation),
    acceptedRole,
    knownLimitations: clone(legacyHandoff.known_limitations || [])
  };
}
