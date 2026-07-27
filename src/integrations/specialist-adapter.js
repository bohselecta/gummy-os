export const SPECIALIST_ADAPTER_METHODS = Object.freeze([
  'discover',
  'validateConfiguration',
  'compilePackage',
  'execute',
  'recover',
  'cancel',
  'inspectResult'
]);

export function assertSpecialistAdapter(adapter) {
  const missing = SPECIALIST_ADAPTER_METHODS.filter(method => typeof adapter?.[method] !== 'function');
  if (missing.length) throw new Error(`Specialist adapter contract incomplete: ${missing.join(', ')}`);
  return adapter;
}

export class SpecialistJobStore {
  constructor() {
    this.jobs = new Map();
    this.idempotency = new Map();
  }

  put(job) {
    const snapshot = structuredClone(job);
    this.jobs.set(snapshot.id, snapshot);
    if (snapshot.idempotencyKey) this.idempotency.set(snapshot.idempotencyKey, snapshot.id);
    return structuredClone(snapshot);
  }

  get(id) {
    const value = this.jobs.get(id);
    return value ? structuredClone(value) : null;
  }

  byIdempotencyKey(key) {
    const id = this.idempotency.get(key);
    return id ? this.get(id) : null;
  }
}

export class SpecialistAdapterRegistry {
  constructor(entries = []) {
    this.adapters = new Map();
    for (const [actorId, adapter] of entries) this.register(actorId, adapter);
  }

  register(actorId, adapter) {
    if (!actorId?.startsWith('actor:')) throw new Error('Specialist Actor ID required');
    this.adapters.set(actorId, assertSpecialistAdapter(adapter));
    return this;
  }

  resolve(actorId) {
    return this.adapters.get(actorId) || null;
  }

  has(actorId) {
    return this.adapters.has(actorId);
  }
}

export function assertMakeProductionAuthorization(authorization, packageDigest) {
  if (authorization?.action !== 'make-production' || !authorization.approvedBy) {
    throw new Error('Make Production authorization required');
  }
  if (authorization.packageDigest !== packageDigest) {
    throw new Error('Authorized package digest mismatch');
  }
}
