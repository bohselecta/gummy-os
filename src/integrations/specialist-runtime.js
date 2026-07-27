import { sha256 } from '../core/hash.js';
import { SpecialistAdapterRegistry } from './specialist-adapter.js';

const IMAGEHOSS_BRIDGE_ROOT = 'http://127.0.0.1:5214';
const TERMINAL = new Set(['succeeded', 'failed', 'cancelled']);
const wait = milliseconds => new Promise(resolve => globalThis.setTimeout(resolve, milliseconds));
const clone = value => structuredClone(value);

export class ImageHossLoopbackTransport {
  constructor({
    root = IMAGEHOSS_BRIDGE_ROOT,
    fetchImpl = fetch,
    pollMs = 800,
  } = {}) {
    this.root = root;
    this.fetchImpl = fetchImpl;
    this.pollMs = pollMs;
    this.session = null;
  }

  async pair() {
    if (this.session && Date.parse(this.session.expiresAt) > Date.now() + 5_000) return this.session;
    const response = await this.fetchImpl(`${this.root}/pair`, {
      method: 'POST',
      headers: { accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`ImageHoss pairing returned HTTP ${response.status}`);
    const session = await response.json();
    if (!session.token || !session.expiresAt || session.persisted !== false) {
      throw new Error('ImageHoss bridge returned an invalid ephemeral pairing session');
    }
    this.session = session;
    return session;
  }

  async request(path, options = {}) {
    const session = await this.pair();
    const response = await this.fetchImpl(`${this.root}${path}`, {
      ...options,
      headers: {
        accept: 'application/json',
        'x-imagehoss-session': session.token,
        ...(options.body ? { 'content-type': 'application/json' } : {}),
        ...options.headers,
      },
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      throw new Error(detail.message || detail.error || `ImageHoss bridge returned HTTP ${response.status}`);
    }
    return response.json();
  }

  async discover() {
    try {
      const capability = await this.request('/capabilities');
      return {
        ...capability,
        authenticated: true,
        pairing: 'ephemeral-memory-only',
        bridgeRoot: this.root,
      };
    } catch (error) {
      return {
        adapter: 'comfyui-loopback-v1',
        status: 'bridge-offline',
        ready: false,
        authenticated: false,
        limitations: [error.message],
      };
    }
  }

  async execute({ package: compiled }) {
    const submitted = await this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify({
        brief: [compiled.visualDirectionSummary, ...compiled.positiveSemanticDirection].join('\n'),
        targetUse: compiled.deliverableContract,
        aspect: compiled.routeTranslation.width === compiled.routeTranslation.height ? '1:1' : '16:9',
        constraints: compiled.absoluteLocks.join('; '),
        negative: compiled.negativeSemanticDirection.join('; '),
        model: compiled.routeTranslation.model,
        seed: compiled.explorationBudget.baseSeed,
      }),
    });
    return this.normalize(await this.track(submitted), compiled);
  }

  async recover(jobId, compiled) {
    return this.normalize(await this.track(await this.request(`/jobs/${encodeURIComponent(jobId)}`)), compiled);
  }

  async cancel(jobId) {
    return this.request(`/jobs/${encodeURIComponent(jobId)}`, { method: 'DELETE' });
  }

  async track(initial) {
    let job = initial;
    while (!TERMINAL.has(job.status)) {
      await wait(this.pollMs);
      job = await this.request(`/jobs/${encodeURIComponent(job.id)}`);
    }
    return job;
  }

  normalize(job, compiled) {
    const candidate = job.status === 'succeeded' && job.asset ? {
      id: `candidate:${job.id}:original`,
      jobId: job.id,
      productionId: compiled.productionId,
      role: 'candidate',
      sha256: job.asset.original.sha256,
      simulation: false,
      eligibleAcceptanceRoles: clone(compiled.acceptanceContract.roles),
      original: clone(job.asset.original),
      proxy: clone(job.asset.proxy),
      nativeEvidence: {
        bridgeJobId: job.id,
        promptId: job.promptId,
        model: job.model,
        seed: job.seed,
        width: job.width,
        height: job.height,
      },
    } : null;
    return {
      id: job.id,
      status: job.status,
      candidates: candidate ? [candidate] : [],
      nativeEvidence: clone(job),
    };
  }
}

class BrowserImageHossAdapter {
  constructor(transport) {
    this.transport = transport;
    this.jobs = new Map();
    this.idempotency = new Map();
  }

  async discover() {
    const comfyui = await this.transport.discover();
    return {
      schema: 'imagehoss.discovery/v1',
      adapter: 'gummy-imagehoss-loopback-adapter/v1',
      authenticated: comfyui.authenticated === true,
      comfyui,
      checkedAt: new Date().toISOString(),
    };
  }

  validateConfiguration(configuration) {
    const blockers = [];
    if (configuration?.route?.id !== 'comfyui') blockers.push('comfyui-route-required');
    if (!configuration?.route?.model) blockers.push('reviewed-model-required');
    if (!configuration?.visualDirection?.summary) blockers.push('visual-direction-required');
    return { valid: blockers.length === 0, blockers, warnings: [] };
  }

  async compilePackage(configuration) {
    const compiled = {
      schema: 'imagehoss.prompt-package/v1',
      id: `prompt-package:${configuration.productionId}:r${configuration.revision}`,
      productionId: configuration.productionId,
      visualDirectionSummary: configuration.visualDirection.summary,
      deliverableContract: configuration.visualDirection.deliverable,
      absoluteLocks: clone(configuration.visualDirection.absoluteLocks),
      positiveSemanticDirection: clone(configuration.visualDirection.positiveDirection),
      negativeSemanticDirection: clone(configuration.visualDirection.negativeDirection),
      explorationBudget: clone(configuration.exploration),
      routeTranslation: clone(configuration.route),
      acceptanceContract: clone(configuration.acceptance),
    };
    return { ...compiled, digest: await sha256(compiled) };
  }

  async execute({ package: compiled, idempotencyKey, authorization }) {
    if (authorization?.action !== 'make-production' || !authorization.approvedBy) throw new Error('Make Production authorization required');
    if (authorization.packageDigest !== compiled.digest) throw new Error('Authorized package digest mismatch');
    const existingId = this.idempotency.get(idempotencyKey);
    if (existingId) return clone(this.jobs.get(existingId).job);
    const native = await this.transport.execute({ package: compiled, idempotencyKey });
    const job = {
      schema: 'imagehoss.production-job/v1',
      id: `imagehoss-job:${compiled.productionId}:${compiled.digest.slice(0, 12)}`,
      productionId: compiled.productionId,
      packageId: compiled.id,
      packageDigest: compiled.digest,
      idempotencyKey,
      owner: 'gummy-imagehoss-loopback-adapter',
      route: 'comfyui',
      status: native.status,
      simulation: false,
      nativeJobId: native.id,
      candidateIds: native.candidates.map(item => item.id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const receipt = {
      schema: 'imagehoss.production-receipt/v1',
      id: `imagehoss-receipt:${job.id}:1`,
      productionId: job.productionId,
      jobId: job.id,
      action: 'execute',
      outcome: job.status === 'succeeded' ? 'completed' : job.status,
      simulation: false,
      packageDigest: compiled.digest,
      nativeEvidence: native.nativeEvidence,
      evidence: native.candidates.map(item => ({ kind: 'original', ref: item.original.uri, sha256: item.sha256 })),
      createdAt: new Date().toISOString(),
    };
    const gummyReceipt = {
      schema: 'gummy.action-receipt/v0',
      id: `receipt:${job.id}:1`,
      productionId: job.productionId,
      action: `imagehoss.${receipt.outcome}`,
      outcome: receipt.outcome,
      linkedSpecialistReceiptIds: [receipt.id],
      resources: [job.id, receipt.id, compiled.digest],
      createdAt: new Date().toISOString(),
    };
    const evidence = {
      job,
      candidates: native.candidates,
      specialistReceipts: [receipt],
      gummyEvidence: [{
        return: {
          schema: 'gummy.work-return/v0',
          id: `return:${job.id}:1`,
          productionId: job.productionId,
          result: job.status === 'succeeded' ? 'completed' : job.status,
          gummyIds: native.candidates.map(item => `gummy:${item.id}`),
          specialistReceiptIds: [receipt.id],
        },
        receipt: gummyReceipt,
      }],
      compiled,
    };
    this.jobs.set(job.id, evidence);
    this.idempotency.set(idempotencyKey, job.id);
    return clone(job);
  }

  async recover(jobId) {
    const evidence = this.jobs.get(jobId);
    if (!evidence) throw new Error('Owned ImageHoss Job required');
    const native = await this.transport.recover(evidence.job.nativeJobId, evidence.compiled);
    evidence.job.status = native.status;
    evidence.candidates = native.candidates;
    return clone(evidence.job);
  }

  async cancel(jobId) {
    const evidence = this.jobs.get(jobId);
    if (!evidence) throw new Error('Owned ImageHoss Job required');
    const native = await this.transport.cancel(evidence.job.nativeJobId);
    evidence.job.status = native.status;
    return clone(evidence.job);
  }

  inspectResult(jobId) {
    const evidence = this.jobs.get(jobId);
    if (!evidence) throw new Error('Owned ImageHoss Job required');
    return clone(evidence);
  }
}

class UnavailableBrowserSpecialistAdapter {
  constructor(kind) {
    this.kind = kind;
  }
  async discover() {
    if (this.kind === 'videoboss') {
      return {
        schema: 'videoboss.discovery/v1',
        provider: {
          authenticated: false,
          ready: false,
          status: 'server-boundary-required',
          limitations: ['Provider credentials and provider submission are forbidden in the browser bundle'],
        },
      };
    }
    return {
      schema: 'meshmallow.discovery/v1',
      blender: {
        authenticated: false,
        ready: false,
        status: 'supervisor-boundary-required',
        limitations: ['The authenticated Blender supervisor is not reachable from this browser origin'],
      },
    };
  }
  validateConfiguration() { return { valid: true, blockers: [], warnings: [] }; }
  async compilePackage(configuration) {
    return {
      id: `${this.kind}-package:${configuration.productionId}`,
      productionId: configuration.productionId,
      digest: await sha256(configuration),
    };
  }
  async execute() { throw new Error(`${this.kind} trusted specialist boundary is unavailable`); }
  async recover() { throw new Error(`${this.kind} trusted specialist boundary is unavailable`); }
  async cancel() { throw new Error(`${this.kind} trusted specialist boundary is unavailable`); }
  inspectResult() { throw new Error(`${this.kind} trusted specialist boundary is unavailable`); }
}

export function createBrowserSpecialistRegistry({
  imageHossTransport = new ImageHossLoopbackTransport(),
} = {}) {
  return new SpecialistAdapterRegistry([
    ['actor:imagehoss', new BrowserImageHossAdapter(imageHossTransport)],
    ['actor:videoboss', new UnavailableBrowserSpecialistAdapter('videoboss')],
    ['actor:3d-bee', new UnavailableBrowserSpecialistAdapter('meshmallow')],
  ]);
}
