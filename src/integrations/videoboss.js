import { sha256 } from '../core/hash.js';
import {
  assertMakeProductionAuthorization,
  assertSpecialistAdapter,
  SpecialistJobStore
} from './specialist-adapter.js';

export const VIDEOBOSS_CONTRACT = Object.freeze({
  repository: 'bohselecta/videoboss',
  head: '3fe1a8f8043086faaa98c938ad7f044ef2be6494',
  configurationSchema: 'gummy.videoboss-production-configuration/v1',
  sequenceSchema: 'videoboss.sequence-package/v1',
  shotSchema: 'videoboss.shot-packet/v1',
  takeSchema: 'videoboss.take/v1',
  acceptanceSchema: 'videoboss.take-acceptance/v1',
  jobSchema: 'videoboss.production-job/v1',
  receiptSchema: 'videoboss.production-receipt/v1'
});

const clone = value => structuredClone(value);
const now = () => new Date().toISOString();

function split(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value || '').split(/[;\n,]/).map(item => item.trim()).filter(Boolean);
}

export function migrateVideoBossConfiguration(input, productionId = input.productionId) {
  if (input?.schema === VIDEOBOSS_CONTRACT.configurationSchema) return clone(input);
  const settings = input?.settings || {};
  const project = input?.project || input || {};
  const shots = clone(project.shots || []).map((shot, index) => ({
    id: shot.id || `shot:${productionId}:${index + 1}`,
    title: shot.title || `Shot ${index + 1}`,
    purpose: shot.purpose || 'Advance the sequence',
    durationSeconds: Number(shot.durationSeconds || shot.duration || 2),
    framing: shot.framing || 'wide',
    subjectMotion: shot.subjectMotion || 'restrained reveal',
    cameraMotion: shot.cameraMotion || 'locked or slow push',
    environment: shot.environment || 'approved Production environment',
    lighting: shot.lighting || 'Night Gummy palette',
    constraints: split(shot.constraints),
    referenceAssetIds: clone(shot.references || []).map(item => item.id || item)
  }));
  if (!shots.length) {
    const totalDuration = Number(settings.durationSeconds || 8);
    for (const [index, title] of ['Reveal', 'Settle', 'Logo-safe hold'].entries()) {
      shots.push({
        id: `shot:${productionId}:${index + 1}`,
        title,
        purpose: index === 0 ? 'Introduce the launch world' : index === 1 ? 'Establish continuity' : 'Hold readable delivery space',
        durationSeconds: index === 2 ? 2 : Math.max(2, Math.round((totalDuration - 2) / 2)),
        framing: index === 0 ? 'wide reveal' : 'medium-wide',
        subjectMotion: index === 2 ? 'near-still' : 'calm environmental motion',
        cameraMotion: index === 0 ? 'slow reveal' : 'restrained settle',
        environment: 'stylized Night Gummy launch chamber',
        lighting: 'exact Gummy purple and warm gold',
        constraints: split(settings.continuityLocks),
        referenceAssetIds: []
      });
    }
  }
  return {
    schema: VIDEOBOSS_CONTRACT.configurationSchema,
    id: input?.id?.startsWith('videoboss-config:') ? input.id : `videoboss-config:${productionId}`,
    productionId,
    revision: Number(input?.revision || 1),
    purpose: settings.purpose || project.concept?.logline || 'Create a coherent Production video package.',
    audience: settings.audience || 'private',
    durationSeconds: Number(settings.durationSeconds || shots.reduce((sum, shot) => sum + shot.durationSeconds, 0)),
    aspectRatio: settings.aspectRatio || '16:9',
    format: settings.format || 'sequence-package',
    continuityLocks: split(settings.continuityLocks),
    imageHossAssets: clone(input?.imageHossAssets || project.assets || []).map(asset => ({
      id: asset.id,
      sha256: asset.sha256 || asset.hash?.value || '',
      role: asset.role || 'reference',
      protectedRegions: clone(asset.protectedRegions || []),
      movableRegions: clone(asset.movableRegions || []),
      rights: clone(asset.rights || { audience: 'private', permittedUses: ['this Production only'] })
    })),
    sequence: { title: settings.title || project.name || 'VideoBoss sequence', shots },
    route: {
      id: input?.route?.id || (settings.route === 'provider' ? 'broker' : 'simulator'),
      provider: input?.route?.provider || 'fal',
      model: input?.route?.model || 'configured-server-model',
      costCeilingUsd: Number(input?.route?.costCeilingUsd ?? 0),
      timeoutMs: Number(input?.route?.timeoutMs || 120000),
      locality: input?.route?.id === 'broker' ? 'server' : 'browser'
    },
    variationBudget: {
      takesPerShot: Number(input?.variationBudget?.takesPerShot || numberFrom(settings.variationBudget, 1)),
      maxTotalTakes: Number(input?.variationBudget?.maxTotalTakes || shots.length * numberFrom(settings.variationBudget, 1))
    },
    reviewDimensions: clone(input?.reviewDimensions || [
      'continuity', 'motion', 'camera', 'identity', 'prompt-adherence', 'artifacts', 'cost', 'downstream-usefulness'
    ]),
    acceptance: clone(input?.acceptance || {
      roles: ['accepted-take', 'delivery-take'],
      criteria: split(settings.acceptance || 'continuity locks hold; no blocking artifacts; Human role acceptance'),
      humanAcceptanceRequired: true
    }),
    delivery: clone(input?.delivery || {
      artifacts: ['sequence-package', 'shot-packets', 'reviewed-takes', 'continuity-bible', 'specialist-receipts'],
      downstreamConsumers: ['gummy-os']
    }),
    createdAt: input?.createdAt || now(),
    migration: { from: input?.schema || 'gummy.production-actor-configuration/v0', preservesSource: true }
  };
}

function numberFrom(value, fallback) {
  const match = String(value || '').match(/\d+/);
  return match ? Number(match[0]) : fallback;
}

export function validateVideoBossConfiguration(configuration) {
  const blockers = [];
  const warnings = [];
  if (configuration?.schema !== VIDEOBOSS_CONTRACT.configurationSchema) blockers.push('unsupported-configuration-schema');
  if (!configuration?.productionId) blockers.push('production-id-required');
  if ((configuration?.purpose || '').trim().length < 12) blockers.push('purpose-required');
  if (!configuration?.sequence?.shots?.length) blockers.push('shot-required');
  if (configuration?.durationSeconds < 1 || configuration?.durationSeconds > 300) blockers.push('duration-out-of-range');
  const shotDuration = (configuration?.sequence?.shots || []).reduce((sum, shot) => sum + Number(shot.durationSeconds || 0), 0);
  if (shotDuration > Number(configuration?.durationSeconds || 0) + 2) blockers.push('shot-duration-exceeds-sequence');
  const totalTakes = (configuration?.variationBudget?.takesPerShot || 0) * (configuration?.sequence?.shots?.length || 0);
  if (configuration?.variationBudget?.takesPerShot < 1 || configuration?.variationBudget?.takesPerShot > 4) blockers.push('takes-per-shot-out-of-range');
  if (totalTakes > configuration?.variationBudget?.maxTotalTakes) blockers.push('variation-budget-exceeded');
  if (configuration?.route?.costCeilingUsd < 0) blockers.push('invalid-cost-ceiling');
  if (!configuration?.reviewDimensions?.length) blockers.push('review-dimensions-required');
  if (!configuration?.acceptance?.roles?.length) blockers.push('acceptance-roles-required');
  for (const asset of configuration?.imageHossAssets || []) {
    if (!/^[a-f0-9]{64}$/.test(asset.sha256)) warnings.push(`source-hash-unverified:${asset.id}`);
    if (asset.rights?.audience === 'private' && configuration.audience === 'public') blockers.push(`asset-audience-blocked:${asset.id}`);
  }
  return { valid: blockers.length === 0, blockers, warnings };
}

export async function compileVideoBossPackage(configuration) {
  const validation = validateVideoBossConfiguration(configuration);
  if (!validation.valid) throw new Error(`VideoBoss configuration invalid: ${validation.blockers.join(', ')}`);
  const shotPackets = await Promise.all(configuration.sequence.shots.map(async (shot, index) => {
    const packet = {
      schema: VIDEOBOSS_CONTRACT.shotSchema,
      id: `shot-packet:${configuration.productionId}:${index + 1}:r${configuration.revision}`,
      productionId: configuration.productionId,
      configurationRevision: configuration.revision,
      shot: clone(shot),
      continuityLocks: clone(configuration.continuityLocks),
      acceptedImageHossAssets: clone(configuration.imageHossAssets),
      route: clone(configuration.route),
      takeBudget: configuration.variationBudget.takesPerShot,
      reviewDimensions: clone(configuration.reviewDimensions),
      acceptance: clone(configuration.acceptance)
    };
    return { ...packet, digest: await sha256(packet) };
  }));
  const estimatedCostUsd = configuration.route.id === 'simulator'
    ? 0
    : Number((configuration.durationSeconds * configuration.variationBudget.takesPerShot * 0.25).toFixed(2));
  if (estimatedCostUsd > configuration.route.costCeilingUsd) {
    throw new Error(`VideoBoss cost ceiling exceeded: ${estimatedCostUsd} > ${configuration.route.costCeilingUsd}`);
  }
  const sequence = {
    schema: VIDEOBOSS_CONTRACT.sequenceSchema,
    id: `sequence-package:${configuration.productionId}:r${configuration.revision}`,
    productionId: configuration.productionId,
    configurationId: configuration.id,
    configurationRevision: configuration.revision,
    purpose: configuration.purpose,
    audience: configuration.audience,
    durationSeconds: configuration.durationSeconds,
    aspectRatio: configuration.aspectRatio,
    format: configuration.format,
    continuityLocks: clone(configuration.continuityLocks),
    imageHossAssets: clone(configuration.imageHossAssets),
    shotPackets,
    route: clone(configuration.route),
    variationBudget: clone(configuration.variationBudget),
    estimatedCostUsd,
    reviewDimensions: clone(configuration.reviewDimensions),
    acceptance: clone(configuration.acceptance),
    delivery: clone(configuration.delivery),
    unresolvedRisks: validation.warnings,
    limitations: configuration.route.id === 'simulator'
      ? ['Deterministic VideoBoss simulation; no video provider is called and no real video bytes are produced.']
      : []
  };
  return Object.freeze({ ...sequence, digest: await sha256(sequence) });
}

function reviewTake(packet, seed) {
  return Object.fromEntries(packet.reviewDimensions.map((dimension, index) => [
    dimension, 72 + ((seed + index * 7) % 25)
  ]));
}

export class GummyVideoBossAdapter {
  constructor({ broker = null, store = new SpecialistJobStore(), clock = now } = {}) {
    this.broker = broker;
    this.store = store;
    this.clock = clock;
    assertSpecialistAdapter(this);
  }

  async discover() {
    const provider = this.broker
      ? await this.broker.discover()
      : {
          authenticated: false,
          ready: false,
          status: 'not-configured',
          provider: 'fal',
          credentialLocation: 'server-only',
          limitations: ['Server-side provider credential is not configured']
        };
    return {
      schema: 'videoboss.discovery/v1',
      deterministic: { available: true, simulation: true },
      provider,
      checkedAt: this.clock()
    };
  }

  validateConfiguration(configuration) {
    return validateVideoBossConfiguration(configuration);
  }

  compilePackage(configuration) {
    return compileVideoBossPackage(configuration);
  }

  async execute({ package: sequence, idempotencyKey, authorization }) {
    assertMakeProductionAuthorization(authorization, sequence.digest);
    const prior = this.store.byIdempotencyKey(idempotencyKey);
    if (prior) return prior;
    let job = {
      schema: VIDEOBOSS_CONTRACT.jobSchema,
      id: `videoboss-job:${sequence.productionId}:${sequence.digest.slice(0, 12)}`,
      productionId: sequence.productionId,
      packageId: sequence.id,
      packageDigest: sequence.digest,
      idempotencyKey,
      owner: 'gummy-videoboss-adapter',
      route: sequence.route.id,
      provider: sequence.route.id === 'broker' ? sequence.route.provider : 'videoboss-simulator',
      model: sequence.route.id === 'broker' ? sequence.route.model : 'deterministic-take-v1',
      status: 'running',
      simulation: sequence.route.id === 'simulator',
      nativeJobIds: [],
      takes: [],
      specialistReceipts: [],
      gummyEvidence: [],
      createdAt: this.clock(),
      updatedAt: this.clock()
    };
    this.store.put(job);
    if (job.simulation) {
      const takes = [];
      for (const packet of sequence.shotPackets) {
        for (let index = 0; index < packet.takeBudget; index += 1) {
          const seed = Number.parseInt((await sha256({ packet: packet.digest, take: index + 1 })).slice(0, 8), 16);
          const output = { packetDigest: packet.digest, take: index + 1, seed, abstractPoster: true };
          takes.push({
            schema: VIDEOBOSS_CONTRACT.takeSchema,
            id: `take:${packet.id}:${index + 1}`,
            productionId: sequence.productionId,
            shotPacketId: packet.id,
            jobId: job.id,
            simulation: true,
            provider: job.provider,
            model: job.model,
            sha256: await sha256(output),
            bytes: null,
            review: reviewTake(packet, seed),
            eligibleAcceptanceRoles: clone(sequence.acceptance.roles),
            costUsd: 0,
            createdAt: this.clock()
          });
        }
      }
      return this.finish(job, sequence, takes, 'completed');
    }
    const discovery = await this.discover();
    if (!discovery.provider.authenticated || !discovery.provider.ready || !this.broker) {
      job.status = 'failed';
      job.failure = {
        code: 'VIDEO_PROVIDER_UNAVAILABLE',
        message: 'Configure the trusted server-side render broker and provider credential.',
        retryable: true
      };
      return this.withEvidence(job, sequence, 'failed');
    }
    try {
      const submitted = await this.broker.submit({
        sequence: clone(sequence),
        idempotencyKey,
        costCeilingUsd: sequence.route.costCeilingUsd,
        timeoutMs: sequence.route.timeoutMs
      });
      job.nativeJobIds = clone(submitted.jobIds || [submitted.id]);
      if (submitted.status === 'succeeded') return this.finish(job, sequence, clone(submitted.takes || []), 'completed');
      job.status = submitted.status;
      job.updatedAt = this.clock();
      return this.store.put(job);
    } catch (error) {
      job.status = error?.ambiguous === true ? 'recovery-required' : 'failed';
      job.failure = {
        code: error?.ambiguous === true ? 'AMBIGUOUS_PROVIDER_CALL' : error?.code || 'PROVIDER_SUBMISSION_FAILED',
        message: error?.message || 'Provider submission failed',
        retryable: false
      };
      job.updatedAt = this.clock();
      return job.status === 'failed' ? this.withEvidence(job, sequence, 'failed') : this.store.put(job);
    }
  }

  async recover(jobId, sequence) {
    let job = this.owned(jobId);
    if (['succeeded', 'failed', 'cancelled'].includes(job.status)) return job;
    if (!this.broker || !job.nativeJobIds.length) {
      job.status = 'recovery-required';
      job.updatedAt = this.clock();
      return this.store.put(job);
    }
    const result = await this.broker.recover({
      jobIds: clone(job.nativeJobIds),
      idempotencyKey: job.idempotencyKey
    });
    if (result.status === 'succeeded') return this.finish(job, sequence, clone(result.takes || []), 'recovered');
    job.status = result.status;
    job.updatedAt = this.clock();
    return this.store.put(job);
  }

  async cancel(jobId) {
    let job = this.owned(jobId);
    if (['succeeded', 'failed', 'cancelled'].includes(job.status)) return job;
    if (this.broker && job.nativeJobIds.length) await this.broker.cancel({ jobIds: clone(job.nativeJobIds) });
    job.status = 'cancelled';
    job.updatedAt = this.clock();
    return this.withEvidence(job, { digest: job.packageDigest }, 'cancelled');
  }

  inspectResult(jobId) {
    const job = this.owned(jobId);
    return Object.freeze({
      job,
      takes: clone(job.takes),
      specialistReceipts: clone(job.specialistReceipts),
      gummyEvidence: clone(job.gummyEvidence)
    });
  }

  acceptTake({ jobId, takeId, role, acceptedBy }) {
    const job = this.owned(jobId);
    const take = job.takes.find(item => item.id === takeId);
    if (!take) throw new Error('Owned VideoBoss take required');
    if (!take.eligibleAcceptanceRoles.includes(role)) throw new Error('Acceptance role is not eligible');
    if (!acceptedBy) throw new Error('Human acceptance required');
    return {
      schema: VIDEOBOSS_CONTRACT.acceptanceSchema,
      id: `take-acceptance:${take.id}:${role}`,
      productionId: job.productionId,
      jobId,
      takeId,
      role,
      takeHash: take.sha256,
      acceptedBy,
      acceptedAt: this.clock()
    };
  }

  owned(jobId) {
    const job = this.store.get(jobId);
    if (!job || job.owner !== 'gummy-videoboss-adapter') throw new Error('Owned VideoBoss Job required');
    return job;
  }

  finish(job, sequence, takes, outcome) {
    job.status = 'succeeded';
    job.takes = takes;
    job.updatedAt = this.clock();
    return this.withEvidence(job, sequence, outcome);
  }

  withEvidence(job, sequence, outcome) {
    const index = job.specialistReceipts.length + 1;
    const specialist = {
      schema: VIDEOBOSS_CONTRACT.receiptSchema,
      id: `videoboss-receipt:${job.id}:${index}`,
      productionId: job.productionId,
      jobId: job.id,
      outcome,
      simulation: job.simulation,
      provider: job.provider,
      model: job.model,
      packageDigest: sequence.digest,
      takeEvidence: job.takes.map(take => ({ takeId: take.id, sha256: take.sha256 })),
      costUsd: job.takes.reduce((sum, take) => sum + Number(take.costUsd || 0), 0),
      createdAt: this.clock()
    };
    const receipt = {
      schema: 'gummy.action-receipt/v0',
      id: `receipt:${job.id}:${index}`,
      productionId: job.productionId,
      action: `videoboss.${outcome}`,
      outcome,
      resources: [job.id, specialist.id, sequence.digest],
      linkedSpecialistReceiptIds: [specialist.id],
      createdAt: this.clock()
    };
    const returned = {
      schema: 'gummy.work-return/v0',
      id: `return:${job.id}:${index}`,
      productionId: job.productionId,
      result: outcome === 'cancelled' ? 'cancelled' : outcome === 'failed' ? 'failed' : 'completed',
      gummyIds: job.takes.map(take => `gummy:${take.id}`),
      specialistReceiptIds: [specialist.id],
      createdAt: this.clock()
    };
    job.specialistReceipts.push(specialist);
    job.gummyEvidence.push({ return: returned, receipt });
    return this.store.put(job);
  }
}

export function keepEverythingExceptVideoBoss(configuration, { except, note = '' }) {
  if (!except) throw new Error('Delta revision exception required');
  const next = clone(configuration);
  next.revision += 1;
  next.delta = {
    schema: 'videoboss.delta-revision/v1',
    instruction: `Keep everything except ${except}.`,
    note,
    carryForwardLocks: clone(configuration.continuityLocks),
    acceptedTakeLocks: clone(configuration.acceptedTakeLocks || []),
    createdAt: now()
  };
  return next;
}

export function createImageHossRepairHandoff({ productionId, shotPacketId, failedTakeId, issue }) {
  return {
    schema: 'videoboss.imagehoss-repair-handoff/v1',
    productionId,
    shotPacketId,
    failedTakeId,
    requestedAssetRole: 'shot-repair-reference',
    issue,
    authority: { actions: ['artifact.read', 'candidate.propose'], repositoryWrite: false },
    createdAt: now()
  };
}

export function createMeshmallowSpatialHandoff({ productionId, shotPacketId, spatialNeed }) {
  return {
    schema: 'videoboss.meshmallow-spatial-handoff/v1',
    productionId,
    shotPacketId,
    spatialNeed,
    requestedArtifacts: ['scene-plan', 'camera-reference', 'editable-scene-package'],
    authority: { actions: ['artifact.read'], nativeExecution: false, repositoryWrite: false },
    createdAt: now()
  };
}
