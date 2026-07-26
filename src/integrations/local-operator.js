export const LOCAL_OPERATOR_ID = 'agent:gummy-operator-local';
export const LOCAL_OPERATOR_MODEL = 'gemma3:4b';
export const LOCAL_OPERATOR_CAPABILITIES = Object.freeze([
  'context.summarize',
  'work-order.prepare',
  'route.select',
  'queue.manage',
  'continuity.update',
  'room.coordinate'
]);
const OPERATOR_STATUS = new Set(['available', 'offline', 'unavailable']);

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

export function localOperatorRecord({ humanId = 'human:hayden', actorId = 'actor:hayden', now = new Date().toISOString() } = {}) {
  return {
    schema: 'gummy.agent/v0',
    id: LOCAL_OPERATOR_ID,
    name: 'Gummy Operator Local',
    version: 'reference-gemma3-4b',
    providerClass: 'Ollama-compatible local supervisor',
    model: LOCAL_OPERATOR_MODEL,
    runtimeClass: 'other',
    locality: 'local',
    status: 'offline',
    humanAuthorityIds: [humanId],
    actorIds: [actorId],
    moldIds: [],
    activeTaskLeaseIds: [],
    capabilityCeiling: [...LOCAL_OPERATOR_CAPABILITIES],
    memoryBoundary: {
      privateLocal: true,
      portableProfileAllowed: true,
      currentTaskContextOnly: true
    },
    disclosure: {
      operator: 'Human-paired local compact-model supervisor',
      autonomy: 'human-directed',
      providerDisclosure: `${LOCAL_OPERATOR_MODEL} reference lane; unavailable until paired`
    },
    createdAt: now,
    updatedAt: now,
    extensions: {
      referenceLineage: 'bohselecta/gummy2',
      activeAuthority: false,
      cloudEscalationRequiresHumanApproval: true
    }
  };
}

export function sanitizeLocalOperatorCapabilitySnapshot(snapshot = {}) {
  const advertised = Array.isArray(snapshot.capabilities) ? snapshot.capabilities : [];
  const status = OPERATOR_STATUS.has(snapshot.status) ? snapshot.status : 'unavailable';
  return deepFreeze({
    authenticated: snapshot.authenticated === true,
    status,
    model: typeof snapshot.model === 'string' && snapshot.model.trim() ? snapshot.model : LOCAL_OPERATOR_MODEL,
    capabilities: advertised.filter(capability => LOCAL_OPERATOR_CAPABILITIES.includes(capability)),
    observedAt: typeof snapshot.observedAt === 'string' ? snapshot.observedAt : null,
    evidenceRef: typeof snapshot.evidenceRef === 'string' ? snapshot.evidenceRef : null
  });
}

export function routeOperatorTask({
  requestedCapability,
  localSnapshot,
  privacy = 'local-preferred',
  cloudAllowed = false,
  policyAllowsCloud = cloudAllowed,
  privacyApproved = false,
  costApproved = false,
  humanApprovedCloudEscalation = false
}) {
  const sanitizedSnapshot = sanitizeLocalOperatorCapabilitySnapshot(localSnapshot);
  const localCapabilities = new Set(sanitizedSnapshot.capabilities);
  if (sanitizedSnapshot.authenticated && sanitizedSnapshot.status === 'available' && localCapabilities.has(requestedCapability)) {
    return Object.freeze({
      status: 'routed',
      executorId: LOCAL_OPERATOR_ID,
      model: sanitizedSnapshot.model,
      locality: 'local',
      approvalRequired: false,
      capabilityEvidenceRef: sanitizedSnapshot.evidenceRef,
      reason: 'Authenticated local Operator advertises the requested bounded capability.'
    });
  }
  if (privacy === 'local-only') {
    return Object.freeze({
      status: 'blocked',
      executorId: null,
      locality: 'local',
      approvalRequired: false,
      reason: 'The required local capability is unavailable and policy forbids cloud escalation.'
    });
  }
  const cloudApprovals = {
    policy: policyAllowsCloud === true,
    privacy: privacyApproved === true,
    cost: costApproved === true,
    human: humanApprovedCloudEscalation === true
  };
  const missingApprovals = Object.entries(cloudApprovals)
    .filter(([, approved]) => !approved)
    .map(([approval]) => approval);
  if (!missingApprovals.length) {
    return Object.freeze({
      status: 'escalation-approved',
      executorId: 'agent:glopper-cloud',
      locality: 'cloud',
      approvalRequired: false,
      approvals: Object.freeze(cloudApprovals),
      reason: 'Policy, privacy, cost, and Human approval permit cloud escalation after the local route was unavailable.'
    });
  }
  return Object.freeze({
    status: 'approval-required',
    executorId: null,
    locality: 'cloud',
    approvalRequired: true,
    missingApprovals: Object.freeze(missingApprovals),
    reason: 'Cloud escalation requires policy, privacy, cost, and explicit Human approval.'
  });
}

export class FairRoomQueue {
  constructor() {
    this.actors = [];
    this.pending = new Map();
    this.cursor = 0;
  }

  enqueue(actorId, item) {
    if (!actorId?.startsWith('actor:')) throw new Error('Room queue requires an Actor ID');
    if (!this.pending.has(actorId)) {
      this.pending.set(actorId, []);
      this.actors.push(actorId);
    }
    this.pending.get(actorId).push(structuredClone(item));
  }

  next() {
    if (!this.actors.length) return null;
    for (let offset = 0; offset < this.actors.length; offset += 1) {
      const index = (this.cursor + offset) % this.actors.length;
      const actorId = this.actors[index];
      const queue = this.pending.get(actorId);
      if (!queue?.length) continue;
      const item = queue.shift();
      this.cursor = (index + 1) % this.actors.length;
      return Object.freeze({ actorId, item, threadKey: `thread:${actorId}` });
    }
    return null;
  }
}
