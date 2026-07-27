import { sha256 } from '../core/hash.js';
import {
  assertMakeProductionAuthorization,
  assertSpecialistAdapter,
  SpecialistJobStore
} from './specialist-adapter.js';

export const IMAGEHOSS_CONTRACT = Object.freeze({
  repository: 'bohselecta/imagehoss',
  head: '384109c8136b24f9f1843727020d92dee213bfba',
  configurationSchema: 'gummy.imagehoss-production-configuration/v1',
  referenceSchema: 'imagehoss.reference-assignment/v1',
  packageSchema: 'imagehoss.prompt-package/v1',
  jobSchema: 'imagehoss.production-job/v1',
  receiptSchema: 'imagehoss.production-receipt/v1',
  acceptedAssetSchema: 'imagehoss.accepted-asset/v1'
});

const now = () => new Date().toISOString();
const clone = value => structuredClone(value);

export function migrateImageHossConfiguration(input, productionId = input.productionId) {
  if (input?.schema === IMAGEHOSS_CONTRACT.configurationSchema) return clone(input);
  const settings = input?.settings || input || {};
  return {
    schema: IMAGEHOSS_CONTRACT.configurationSchema,
    id: input?.id?.startsWith('imagehoss-config:')
      ? input.id
      : `imagehoss-config:${productionId}`,
    productionId,
    revision: Number(input?.revision || 1),
    visualDirection: {
      summary: settings.direction || settings.brief || 'Define the ImageHoss visual direction for this Production.',
      deliverable: settings.deliverable || settings.targetUse || 'Accepted Production image Asset',
      absoluteLocks: split(settings.locks || settings.constraints),
      creativeDirection: split(settings.creativeDirection),
      preferences: split(settings.preferences),
      positiveDirection: split(settings.positiveDirection || settings.direction),
      negativeDirection: split(settings.exclusions || settings.negative)
    },
    references: (input?.references || []).map((reference, index) => ({
      schema: IMAGEHOSS_CONTRACT.referenceSchema,
      id: reference.id || `imagehoss-reference:${productionId}:${index + 1}`,
      assetId: reference.assetId || reference.id,
      role: reference.role || 'composition',
      extraction: clone(reference.extraction || split(reference.note)),
      ignore: clone(reference.ignore || []),
      strength: reference.strength ?? 0.5,
      locked: reference.locked ?? false,
      rights: clone(reference.rights || {
        basis: 'unknown',
        audience: 'private',
        permittedUses: ['this Production only']
      }),
      retention: reference.retention || 'production'
    })),
    exploration: {
      candidateCount: Number(input?.exploration?.candidateCount || numberFrom(settings.exploration, 4)),
      variationAxes: clone(input?.exploration?.variationAxes || ['composition', 'lighting']),
      seedPolicy: input?.exploration?.seedPolicy || 'derived-per-candidate',
      baseSeed: Number(input?.exploration?.baseSeed || 240727)
    },
    route: {
      id: input?.route?.id || (settings.route === 'comfyui' ? 'comfyui' : 'simulator'),
      workflowId: input?.route?.workflowId || (settings.route === 'comfyui' ? 'approved:imagehoss-safe-v1' : 'deterministic-study-v1'),
      model: input?.route?.model,
      width: Number(input?.route?.width || 1024),
      height: Number(input?.route?.height || 576),
      locality: input?.route?.locality || (settings.route === 'comfyui' ? 'desktop' : 'browser'),
      privacy: input?.route?.privacy || (settings.route === 'comfyui' ? 'approved-local-companion' : 'local-only'),
      costCeilingUsd: Number(input?.route?.costCeilingUsd || 0)
    },
    acceptance: {
      roles: clone(input?.acceptance?.roles || ['production-image', 'video-first-frame']),
      criteria: clone(input?.acceptance?.criteria || split(settings.acceptance || 'Human role acceptance required')),
      humanAcceptanceRequired: true
    },
    downstream: {
      consumers: clone(input?.downstream?.consumers || ['gummy-os', 'videoboss']),
      requiredArtifacts: clone(input?.downstream?.requiredArtifacts || ['accepted-original', 'display-proxy', 'provenance', 'specialist-receipt'])
    },
    createdAt: input?.createdAt || now(),
    migration: input?.schema ? {
      from: input.schema,
      preservesSource: true
    } : {
      from: 'gummy.production-actor-configuration/v0',
      preservesSource: true
    }
  };
}

function split(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (!value) return [];
  return String(value).split(/[;\n]/).map(item => item.trim()).filter(Boolean);
}

function numberFrom(value, fallback) {
  const match = String(value || '').match(/\d+/);
  return match ? Number(match[0]) : fallback;
}

export function validateImageHossConfiguration(configuration) {
  const blockers = [];
  const warnings = [];
  if (configuration?.schema !== IMAGEHOSS_CONTRACT.configurationSchema) blockers.push('unsupported-configuration-schema');
  if (!configuration?.productionId) blockers.push('production-id-required');
  if ((configuration?.visualDirection?.summary || '').trim().length < 20) blockers.push('meaningful-visual-direction-required');
  if (!configuration?.visualDirection?.deliverable?.trim()) blockers.push('deliverable-required');
  if (configuration?.exploration?.candidateCount < 1 || configuration?.exploration?.candidateCount > 8) blockers.push('candidate-count-out-of-range');
  if (!configuration?.acceptance?.roles?.length || !configuration?.acceptance?.criteria?.length) blockers.push('acceptance-contract-required');
  for (const reference of configuration?.references || []) {
    if (reference.strength < 0 || reference.strength > 1) blockers.push(`invalid-reference-strength:${reference.id}`);
    if (reference.rights?.basis === 'unknown' && reference.rights?.audience === 'public') blockers.push(`public-rights-unresolved:${reference.id}`);
    if (!reference.extraction?.length) warnings.push(`reference-extraction-empty:${reference.id}`);
  }
  if (!configuration?.references?.length) warnings.push('no-references-assigned');
  return { valid: blockers.length === 0, blockers, warnings };
}

export async function compileImageHossPackage(configuration) {
  const validation = validateImageHossConfiguration(configuration);
  if (!validation.valid) throw new Error(`ImageHoss configuration invalid: ${validation.blockers.join(', ')}`);
  const unsigned = {
    schema: IMAGEHOSS_CONTRACT.packageSchema,
    id: `prompt-package:${configuration.id}:r${configuration.revision}`,
    configurationId: configuration.id,
    productionId: configuration.productionId,
    configurationRevision: configuration.revision,
    visualDirectionSummary: configuration.visualDirection.summary,
    deliverableContract: configuration.visualDirection.deliverable,
    absoluteLocks: clone(configuration.visualDirection.absoluteLocks),
    creativeDirection: clone(configuration.visualDirection.creativeDirection),
    preferences: clone(configuration.visualDirection.preferences),
    referenceInfluenceMap: clone(configuration.references),
    explorationBudget: clone(configuration.exploration),
    positiveSemanticDirection: clone(configuration.visualDirection.positiveDirection),
    negativeSemanticDirection: clone(configuration.visualDirection.negativeDirection),
    routeTranslation: clone(configuration.route),
    acceptanceContract: clone(configuration.acceptance),
    downstreamRequirements: clone(configuration.downstream),
    unresolvedRisks: validation.warnings,
    limitations: configuration.route.id === 'simulator'
      ? ['Deterministic study route; no image generation model or provider is called.']
      : []
  };
  return Object.freeze({ ...unsigned, digest: await sha256(unsigned) });
}

export class GummyImageHossAdapter {
  constructor({
    transport = null,
    store = new SpecialistJobStore(),
    clock = now
  } = {}) {
    this.transport = transport;
    this.store = store;
    this.clock = clock;
    assertSpecialistAdapter(this);
  }

  async discover() {
    const capability = this.transport
      ? await this.transport.discover()
      : { status: 'bridge-offline', ready: false, limitations: ['Capability bridge is offline'] };
    return {
      schema: 'imagehoss.discovery/v1',
      adapter: 'gummy-imagehoss-adapter/v1',
      authenticated: capability.authenticated === true,
      deterministic: { available: true, simulation: true },
      comfyui: capability,
      checkedAt: this.clock()
    };
  }

  validateConfiguration(configuration) {
    return validateImageHossConfiguration(configuration);
  }

  compilePackage(configuration) {
    return compileImageHossPackage(configuration);
  }

  async execute({ package: compiled, idempotencyKey, authorization }) {
    assertMakeProductionAuthorization(authorization, compiled.digest);
    const existing = this.store.byIdempotencyKey(idempotencyKey);
    if (existing) return existing;
    let job = {
      schema: IMAGEHOSS_CONTRACT.jobSchema,
      id: `imagehoss-job:${compiled.productionId}:${compiled.digest.slice(0, 12)}`,
      productionId: compiled.productionId,
      packageId: compiled.id,
      packageDigest: compiled.digest,
      idempotencyKey,
      owner: 'gummy-imagehoss-adapter',
      route: compiled.routeTranslation.id,
      status: 'running',
      simulation: compiled.routeTranslation.id === 'simulator',
      candidateIds: [],
      createdAt: this.clock(),
      updatedAt: this.clock(),
      specialistReceipts: [],
      gummyEvidence: []
    };
    this.store.put(job);
    if (job.route === 'simulator') {
      const candidates = await Promise.all(Array.from(
        { length: compiled.explorationBudget.candidateCount },
        async (_, index) => {
          const study = {
            packageDigest: compiled.digest,
            seed: compiled.explorationBudget.baseSeed + index,
            variation: index + 1,
            locks: compiled.absoluteLocks
          };
          return {
            id: `candidate:${job.id}:${index + 1}`,
            jobId: job.id,
            productionId: job.productionId,
            sha256: await sha256(study),
            simulation: true,
            eligibleAcceptanceRoles: clone(compiled.acceptanceContract.roles),
            study
          };
        }
      ));
      job = this.complete(job, compiled, candidates);
      return this.store.put(job);
    }
    const discovery = await this.discover();
    if (!discovery.authenticated || !discovery.comfyui.ready || !this.transport) {
      job.status = 'failed';
      job.failure = {
        code: 'IMAGEHOSS_RUNTIME_UNAVAILABLE',
        message: 'Start the authenticated ImageHoss bridge and its project-scoped ComfyUI runtime.',
        retryable: true
      };
      job.updatedAt = this.clock();
      job = this.withEvidence(job, compiled, 'failed', []);
      return this.store.put(job);
    }
    const native = await this.transport.execute({
      package: clone(compiled),
      idempotencyKey,
      authorization: clone(authorization)
    });
    job.nativeJobId = native.id;
    if (native.status === 'succeeded') {
      job = this.complete(job, compiled, clone(native.candidates || []));
    } else {
      job.status = native.status;
      job.updatedAt = this.clock();
    }
    return this.store.put(job);
  }

  async recover(jobId, compiled) {
    let job = this.owned(jobId);
    if (['succeeded', 'failed', 'cancelled'].includes(job.status)) return job;
    if (!job.nativeJobId || !this.transport) {
      job.status = 'recovery-required';
      job.updatedAt = this.clock();
      return this.store.put(job);
    }
    const recovered = await this.transport.recover(job.nativeJobId);
    if (recovered.status === 'succeeded') {
      job = this.complete(job, compiled, clone(recovered.candidates || []), 'recovered');
    } else {
      job.status = recovered.status;
      job.updatedAt = this.clock();
    }
    return this.store.put(job);
  }

  async cancel(jobId) {
    let job = this.owned(jobId);
    if (['succeeded', 'failed', 'cancelled'].includes(job.status)) return job;
    if (job.nativeJobId && this.transport) await this.transport.cancel(job.nativeJobId);
    job.status = 'cancelled';
    job.updatedAt = this.clock();
    job = this.withEvidence(job, { digest: job.packageDigest }, 'cancelled', []);
    return this.store.put(job);
  }

  inspectResult(jobId) {
    const job = this.owned(jobId);
    return Object.freeze({
      job,
      candidates: clone(job.candidates || []),
      specialistReceipts: clone(job.specialistReceipts || []),
      gummyEvidence: clone(job.gummyEvidence || [])
    });
  }

  owned(jobId) {
    const job = this.store.get(jobId);
    if (!job || job.owner !== 'gummy-imagehoss-adapter') throw new Error('Owned ImageHoss Job required');
    return job;
  }

  complete(job, compiled, candidates, outcome = 'completed') {
    job.status = 'succeeded';
    job.candidates = candidates;
    job.candidateIds = candidates.map(candidate => candidate.id);
    job.updatedAt = this.clock();
    return this.withEvidence(job, compiled, outcome, candidates.map(candidate => ({
      kind: 'candidate',
      ref: candidate.id,
      sha256: candidate.sha256
    })));
  }

  withEvidence(job, compiled, outcome, evidence) {
    const index = (job.specialistReceipts?.length || 0) + 1;
    const specialistReceipt = {
      schema: IMAGEHOSS_CONTRACT.receiptSchema,
      id: `imagehoss-receipt:${job.id}:${index}`,
      productionId: job.productionId,
      jobId: job.id,
      outcome,
      simulation: job.simulation,
      packageDigest: compiled.digest,
      evidence,
      createdAt: this.clock()
    };
    const gummyReturn = {
      schema: 'gummy.work-return/v0',
      id: `return:${job.id}:${index}`,
      productionId: job.productionId,
      result: outcome === 'cancelled' ? 'cancelled' : outcome === 'failed' ? 'failed' : 'completed',
      gummyIds: (job.candidateIds || []).map(id => `gummy:${id}`),
      specialistReceiptIds: [specialistReceipt.id],
      createdAt: this.clock()
    };
    const gummyReceipt = {
      schema: 'gummy.action-receipt/v0',
      id: `receipt:${job.id}:${index}`,
      action: `imagehoss.${outcome}`,
      outcome,
      productionId: job.productionId,
      resources: [job.id, specialistReceipt.id, compiled.digest],
      linkedSpecialistReceiptIds: [specialistReceipt.id],
      createdAt: this.clock()
    };
    job.specialistReceipts = [...(job.specialistReceipts || []), specialistReceipt];
    job.gummyEvidence = [...(job.gummyEvidence || []), { return: gummyReturn, receipt: gummyReceipt }];
    return job;
  }
}
