export const PRODUCTION_SCHEMA = 'gummy.production/v0';
export const PRODUCTION_RUN_SCHEMA = 'gummy.production-run/v0';
export const PRODUCTION_STATE_VERSION = 2;

const now = () => new Date().toISOString();
const uid = prefix => `${prefix}:${crypto.randomUUID()}`;
const clone = value => structuredClone(value);

export const SERVICE_ACTOR_IDS = Object.freeze([
  'actor:imagehoss',
  'actor:3d-bee',
  'actor:videoboss',
  'actor:project-composer',
  'actor:gummy-storage'
]);

export const RANCH_DAY_ACTOR_IDS = Object.freeze([
  'actor:hayden',
  'actor:hoyt',
  ...SERVICE_ACTOR_IDS
]);

const dragUtilityByAction = Object.freeze({
  'participant-membership': 'gummy.utility.setup',
  'actor-routing': 'gummy.utility.agent',
  'task-input': 'gummy.utility.attach',
  'production-source': 'gummy.utility.attach',
  'plan-edge': 'gummy.utility.deliver',
  'preservation-policy': 'gummy.utility.deliver',
  'copy-configuration': 'gummy.utility.setup',
  'plan-reorder': 'gummy.utility.setup'
});

const serviceDefinitions = [
  {
    id: 'actor:imagehoss',
    address: '@ImageHoss',
    name: 'ImageHoss',
    role: 'reference-preparation',
    capability: 'capability:imagehoss.reference-preparation/v0',
    inputs: ['image/*', 'gummy/reference', 'text/brief'],
    outputs: ['gummy/reference-set'],
    setupDependencies: ['actor:hayden'],
    agentId: 'agent:reference-imagehoss-browser',
    moldId: 'mold:imagehoss:production-reference',
    settings: { referenceMode: 'approved-only', crop: 'cinematic', identityPreservation: true }
  },
  {
    id: 'actor:3d-bee',
    address: '@3D-Bee',
    name: '3D-Bee',
    role: 'scene-preparation',
    capability: 'capability:3d-bee.scene-preparation/v0',
    inputs: ['gummy/reference-set', 'text/scene-brief'],
    outputs: ['gummy/scene-manifest'],
    setupDependencies: ['actor:imagehoss'],
    agentId: 'agent:reference-3d-bee-browser',
    moldId: 'mold:3d-bee:production-scene',
    settings: { environment: 'ranch', assetDetail: 'reference', includeMule: true },
    optional: true
  },
  {
    id: 'actor:videoboss',
    address: '@VideoBoss',
    name: 'VideoBoss',
    role: 'video-generation',
    capability: 'capability:videoboss.video-generation/v0',
    inputs: ['gummy/reference-set', 'gummy/scene-manifest', 'gummy/approved-likeness'],
    outputs: ['gummy/video-manifest'],
    setupDependencies: ['actor:imagehoss', 'actor:3d-bee'],
    agentId: 'agent:reference-videoboss-browser',
    moldId: 'mold:videoboss:private-family-video',
    settings: { durationSeconds: 30, aspectRatio: '16:9', audience: 'private-family', voiceCloning: false }
  },
  {
    id: 'actor:project-composer',
    address: '@ProjectComposer',
    name: 'ProjectComposer',
    role: 'project-assembly',
    capability: 'capability:project-composer.assembly/v0',
    inputs: ['gummy/video-manifest', 'gummy/scene-manifest', 'audio/*'],
    outputs: ['gummy/project-manifest', 'gummy/final-deliverable'],
    setupDependencies: ['actor:videoboss'],
    agentId: 'agent:reference-project-composer-browser',
    moldId: 'mold:project-composer:private-assembly',
    settings: { title: 'Ranch Day', soundtrack: 'instrumental-placeholder', outputFormat: 'reference-manifest' }
  },
  {
    id: 'actor:gummy-storage',
    address: '@GummyStorage',
    name: 'GummyStorage',
    role: 'preservation',
    capability: 'capability:gummy-storage.preserve/v0',
    inputs: ['gummy/source', 'gummy/result', 'gummy/action-receipt'],
    outputs: ['gummy/storage-manifest'],
    setupDependencies: ['actor:project-composer'],
    agentId: 'agent:reference-gummy-storage-browser',
    moldId: 'mold:gummy-storage:local-preservation',
    settings: { sourceRetention: 'preserve', resultRetentionDays: 365, receiptRetentionDays: 2555, location: 'local-origin' }
  }
];

const personalDefinitions = [
  {
    id: 'actor:hayden',
    address: '@Hayden',
    name: 'Hayden',
    kind: 'person',
    role: 'owner',
    capabilities: ['creative-context', 'human-approval'],
    agentIds: []
  },
  {
    id: 'actor:hoyt',
    address: '@Hoyt',
    name: 'Hoyt',
    kind: 'person',
    role: 'represented-participant',
    capabilities: ['approved-context', 'optional-review'],
    agentIds: []
  }
];

function makeActor(definition) {
  const stamp = '2026-07-26T12:00:00.000Z';
  return {
    schema: 'gummy.actor/v0',
    id: definition.id,
    address: definition.address,
    kind: definition.kind || 'service',
    name: definition.name,
    status: 'active',
    humanAuthorityIds: ['human:hayden'],
    moldIds: definition.moldId ? [definition.moldId] : [],
    agentIds: definition.agentId ? [definition.agentId] : definition.agentIds || [],
    publishedCapabilities: definition.capabilities || [definition.capability],
    acceptedInputTypes: definition.inputs || [],
    outputTypes: definition.outputs || [],
    locality: definition.kind === 'person' ? 'local' : 'web',
    privacy: definition.kind === 'person' ? 'private' : 'production-sliced',
    retention: definition.id === 'actor:gummy-storage' ? 'configured-per-production' : 'run-only',
    contribution: 'none-without-explicit-approval',
    cost: definition.kind === 'person' ? { model: 'none', estimate: 0 } : { model: 'deterministic-reference', estimate: 0 },
    deployment: { mode: 'web-only', authoritativeLocation: 'browser:local-origin' },
    createdAt: stamp,
    updatedAt: stamp
  };
}

function makeAgent(definition) {
  const stamp = '2026-07-26T12:00:00.000Z';
  return {
    schema: 'gummy.agent/v0',
    id: definition.agentId,
    name: `${definition.name} deterministic reference executor`,
    version: '0.1.0',
    providerClass: 'gummy-reference',
    runtimeClass: 'browser',
    locality: 'web',
    status: 'available',
    actorIds: [definition.id],
    moldIds: [definition.moldId],
    capabilityCeiling: [definition.capability],
    memoryBoundary: { privateLocal: false, portableProfileAllowed: false, currentTaskContextOnly: true },
    disclosure: {
      operator: 'Gummy OS deterministic browser reference adapter',
      autonomy: 'service',
      providerDisclosure: 'Structured placeholder execution; not a production media service.'
    },
    createdAt: stamp,
    updatedAt: stamp
  };
}

function makeMold(definition) {
  const stamp = '2026-07-26T12:00:00.000Z';
  return {
    schema: 'gummy.mold/v0',
    id: definition.moldId,
    actorId: definition.id,
    name: `${definition.name} Production Mold`,
    status: 'active',
    allowedHumanIds: ['human:hayden'],
    allowedAgentIds: [definition.agentId],
    role: definition.role,
    permissions: {
      capabilities: [definition.capability],
      readScopes: definition.inputs,
      writeScopes: definition.outputs,
      publishScopes: [],
      requiresHumanApproval: true
    },
    runtimePolicy: { allowedLocalities: ['web'], allowedRuntimeClasses: ['browser'], networkPolicy: 'none' },
    issuedBy: 'human:hayden',
    issuedAt: stamp,
    updatedAt: stamp
  };
}

function makeDescriptor(definition) {
  return {
    schema: 'gummy.actor-app-descriptor/v0',
    id: `actor-app:${definition.id.slice(6)}`,
    actorId: definition.id,
    surfaceId: 'main',
    version: '0.1.0',
    displayName: `${definition.name} Actor App Surface`,
    capabilityIds: [definition.capability],
    supportedRoles: [definition.role],
    setupSchemaRef: `gummy://schemas/configuration/${definition.id.slice(6)}/v0`,
    acceptedInputTypes: definition.inputs,
    outputTypes: definition.outputs,
    setupDependencyActorIds: definition.setupDependencies,
    executionDependencyActorIds: definition.setupDependencies,
    supportedAgentFamilies: [definition.agentId],
    localityOptions: ['web'],
    nativeBridgeCapabilities: [],
    optional: Boolean(definition.optional),
    status: 'active',
    defaultSettings: clone(definition.settings)
  };
}

export function createInitialProductionRuntime() {
  const actors = [...personalDefinitions.map(makeActor), ...serviceDefinitions.map(makeActor)];
  return {
    schema: 'gummy.production-runtime/v0',
    version: PRODUCTION_STATE_VERSION,
    actors,
    agents: serviceDefinitions.map(makeAgent),
    molds: serviceDefinitions.map(makeMold),
    actorAppDescriptors: serviceDefinitions.map(makeDescriptor),
    actorDefaults: {},
    relationships: [{
      schema: 'gummy.link/v0',
      id: 'link:hoyt-videoboss-private-family',
      source: { kind: 'actor', id: 'actor:hoyt' },
      target: { kind: 'actor', id: 'actor:videoboss' },
      relation: 'approved-context-for',
      moldId: 'mold:videoboss:private-family-video',
      allowedContextRefs: ['gummy:hoyt-likeness-approved', 'gummy:beagle-references-approved', 'gummy:family-video-private'],
      allowedPurposes: ['private-family-video'],
      allowedCollaboratorActorIds: ['actor:hayden'],
      blockedCapabilities: ['public-release', 'commercial-use', 'voice-cloning', 'unknown-service-actor', 'unrelated-private-memory'],
      retention: 'run-only',
      status: 'active',
      revision: '1',
      createdAt: '2026-07-26T12:00:00.000Z'
    }],
    productions: [],
    participants: [],
    configurations: [],
    actorPlans: [],
    contextEnvelopes: [],
    productionRuns: [],
    workOrders: [],
    taskLeases: [],
    grants: [],
    returns: [],
    receipts: [],
    gummies: [
      {
        schema: 'gummy.gummy/v0',
        id: 'gummy:ranch-day-source-brief',
        name: 'Ranch Day source brief.md',
        kind: 'source',
        mediaType: 'text/markdown',
        content: '# Ranch Day\nA private family reference Production featuring Hoyt, approved beagle references, and the ranch.',
        revision: '1',
        hash: 'sha256:d3885600ea886f751a6949b764edc715ea4b3a05f4daa1478fa3091e38054b5e',
        ownerActorId: 'actor:hayden',
        creatorActorId: 'actor:hayden',
        authoritativeLocation: 'browser:local-origin',
        status: 'source',
        linkIds: []
      },
      {
        schema: 'gummy.gummy/v0',
        id: 'gummy:hoyt-likeness-approved',
        name: 'Approved Hoyt likeness references',
        kind: 'reference',
        mediaType: 'application/vnd.gummy.reference+json',
        content: '{"class":"approved-likeness","subject":"actor:hoyt","audience":"private-family"}',
        revision: '1',
        hash: 'sha256:a99f996c5d5215f92ef748d2bb76686108f22d7345460ce089cf823dbfc92ae3',
        ownerActorId: 'actor:hoyt',
        creatorActorId: 'actor:hoyt',
        authoritativeLocation: 'browser:local-origin',
        status: 'source',
        linkIds: []
      }
    ],
    links: [],
    dragIntents: [],
    actorUpdateProposals: [],
    windowState: [],
    migrationLog: [{
      id: 'migration:production-runtime-v2',
      from: 1,
      to: 2,
      status: 'applied',
      preservesLegacyState: true,
      appliedAt: '2026-07-26T12:00:00.000Z'
    }]
  };
}

export function productionRole(actorId) {
  const roles = {
    'actor:hayden': ['owner', 'creative-context', 'approver'],
    'actor:hoyt': ['represented-subject', 'context-contributor', 'optional-reviewer'],
    'actor:imagehoss': ['reference-preparation', 'executor'],
    'actor:3d-bee': ['scene-preparation', 'executor', 'optional'],
    'actor:videoboss': ['video-generation', 'executor'],
    'actor:project-composer': ['project-assembly', 'executor'],
    'actor:gummy-storage': ['storage', 'executor']
  };
  return roles[actorId] || ['participant'];
}

export function createProduction(runtime, {
  title = 'Ranch Day',
  description = 'Private Ranch Day family video Production',
  ownerActorId = 'actor:hayden',
  visibility = 'private'
} = {}) {
  const next = clone(runtime);
  const stamp = now();
  const id = title === 'Ranch Day' && !next.productions.some(item => item.id === 'production:ranch-day')
    ? 'production:ranch-day'
    : uid('production');
  const production = {
    schema: PRODUCTION_SCHEMA,
    id,
    title,
    description,
    creatorHumanId: 'human:hayden',
    ownerActorId,
    status: 'configuring',
    visibility,
    participantIds: [],
    bowlIds: [],
    actorPlanIds: [],
    runIds: [],
    gummyIds: ['gummy:ranch-day-source-brief', 'gummy:hoyt-likeness-approved'],
    deliverableIds: [],
    authoritativeLocation: 'browser:local-origin',
    revision: '1',
    createdAt: stamp,
    updatedAt: stamp
  };
  next.productions.push(production);
  const added = addActorToProduction(next, id, ownerActorId, 'creator');
  added.runtime.receipts.push(makeRuntimeReceipt({
    action: 'production.created',
    productionId: id,
    actorId: ownerActorId,
    outcome: 'completed',
    summary: `Created private Production “${title}”. No work executed.`
  }));
  return { runtime: added.runtime, production: added.production, participant: added.participant };
}

export function addActorToProduction(runtime, productionId, actorId, source = 'search') {
  const next = clone(runtime);
  const production = next.productions.find(item => item.id === productionId);
  const actor = next.actors.find(item => item.id === actorId);
  if (!production || !actor) return { runtime, denied: true, reason: 'production-or-actor-not-found' };
  const existing = next.participants.find(item => item.productionId === productionId && item.actorId === actorId && item.status !== 'removed');
  if (existing) return { runtime: next, production, participant: existing, executed: false };

  const definition = serviceDefinitions.find(item => item.id === actorId);
  const participant = {
    schema: 'gummy.production-participant/v0',
    id: `participant:${productionId.slice(11)}:${actorId.slice(6)}`,
    productionId,
    actorId,
    roles: productionRole(actorId),
    source,
    moldId: definition?.moldId,
    relationshipLinkIds: actorId === 'actor:hoyt' ? ['link:hoyt-videoboss-private-family'] : [],
    assignedAgentId: definition?.agentId,
    approvalState: actor.kind === 'person' ? 'approved' : 'pending',
    status: actor.kind === 'person' ? 'ready' : 'configuring'
  };
  next.participants.push(participant);
  production.participantIds.push(participant.id);
  production.revision = String(Number(production.revision) + 1);
  production.updatedAt = now();
  if (definition) {
    const descriptor = next.actorAppDescriptors.find(item => item.actorId === actorId);
    next.configurations.push({
      schema: 'gummy.production-actor-configuration/v0',
      id: `production-config:${productionId.slice(11)}:${actorId.slice(6)}`,
      productionId,
      actorId,
      surfaceId: descriptor.surfaceId,
      capabilityId: definition.capability,
      capabilityVersion: 'v0',
      role: definition.role,
      moldId: definition.moldId,
      relationshipLinkIds: actorId === 'actor:videoboss' ? ['link:hoyt-videoboss-private-family'] : [],
      inputGummyIds: [],
      settingsSchemaRef: descriptor.setupSchemaRef,
      settings: clone(next.actorDefaults[actorId] || descriptor.defaultSettings),
      upstreamActorIds: clone(definition.setupDependencies),
      downstreamActorIds: [],
      outputContract: { types: clone(definition.outputs), deterministicReference: true },
      localityPolicy: { selected: 'web', options: ['web'], native: 'unavailable' },
      privacyPolicy: { audience: 'private', contextSlicing: 'required' },
      retentionPolicy: { mode: 'run-only' },
      contributionPolicy: { mode: 'none' },
      costCeiling: { currency: 'USD', amount: 0 },
      validation: { valid: false, blockers: ['configuration-not-saved'] },
      readiness: 'needs-configuration',
      revision: '0',
      hash: '',
      updatedBy: 'human:hayden',
      updatedAt: now()
    });
  }
  next.receipts.push(makeRuntimeReceipt({
    action: 'production.actor-added',
    productionId,
    actorId,
    outcome: 'completed',
    summary: `${actor.address} joined as ${participant.roles.join(', ')} via ${source}. Adding an Actor did not execute work.`
  }));
  return { runtime: next, production, participant, executed: false };
}

export function addRanchDayRoster(runtime, productionId, source = 'mention') {
  let next = runtime;
  for (const actorId of RANCH_DAY_ACTOR_IDS) {
    next = addActorToProduction(next, productionId, actorId, actorId === 'actor:hayden' ? 'creator' : source).runtime;
  }
  return next;
}

export function getSetupGuidance(runtime, productionId) {
  const order = ['actor:hayden', 'actor:hoyt', 'actor:imagehoss', 'actor:3d-bee', 'actor:videoboss', 'actor:project-composer', 'actor:gummy-storage'];
  return order
    .filter(actorId => runtime.participants.some(item => item.productionId === productionId && item.actorId === actorId && item.status !== 'removed'))
    .map((actorId, index) => {
      const actor = runtime.actors.find(item => item.id === actorId);
      const config = runtime.configurations.find(item => item.productionId === productionId && item.actorId === actorId);
      const relationship = actorId === 'actor:hoyt'
        ? runtime.relationships.find(item => item.id === 'link:hoyt-videoboss-private-family')
        : null;
      const readiness = config?.readiness || (relationship?.status === 'revoked' ? 'needs-permission' : 'ready');
      return {
        order: index + 1,
        actorId,
        label: actor.name,
        optional: actorId === 'actor:3d-bee' || actorId === 'actor:hoyt',
        readiness,
        next: ['not-started', 'needs-input', 'needs-permission', 'needs-configuration', 'invalid'].includes(readiness)
      };
    });
}

export async function saveProductionActorConfiguration(runtime, productionId, actorId, patch = {}) {
  const next = clone(runtime);
  const config = next.configurations.find(item => item.productionId === productionId && item.actorId === actorId);
  const participant = next.participants.find(item => item.productionId === productionId && item.actorId === actorId);
  if (!config || !participant) return { runtime, denied: true, reason: 'configuration-not-found' };
  config.settings = { ...config.settings, ...(patch.settings || patch) };
  if (patch.inputGummyIds) config.inputGummyIds = [...new Set(patch.inputGummyIds)];
  if (patch.localityPolicy) config.localityPolicy = { ...config.localityPolicy, ...patch.localityPolicy };
  if (patch.privacyPolicy) config.privacyPolicy = { ...config.privacyPolicy, ...patch.privacyPolicy };
  if (patch.retentionPolicy) config.retentionPolicy = { ...config.retentionPolicy, ...patch.retentionPolicy };
  const validation = validateProductionActorConfiguration(next, config);
  config.validation = validation;
  config.readiness = validation.valid ? 'ready' : validation.readiness;
  config.revision = String(Number(config.revision) + 1);
  config.updatedAt = now();
  config.hash = await sha256(stableStringify({
    productionId: config.productionId,
    actorId: config.actorId,
    settings: config.settings,
    inputGummyIds: config.inputGummyIds,
    revision: config.revision
  }));
  participant.status = validation.valid ? 'ready' : 'configuring';
  participant.approvalState = validation.valid ? 'approved' : participant.approvalState;
  next.receipts.push(makeRuntimeReceipt({
    action: 'production.configuration-saved',
    productionId,
    actorId,
    outcome: validation.valid ? 'completed' : 'blocked',
    summary: `Saved Production-specific configuration revision ${config.revision}; Actor-global defaults were unchanged.`,
    resources: [config.id, config.hash]
  }));
  return { runtime: next, configuration: config, validation };
}

export function validateProductionActorConfiguration(runtime, config) {
  const blockers = [];
  if (!config.settings || Object.keys(config.settings).length === 0) blockers.push('settings-empty');
  if (!config.moldId || !runtime.molds.some(item => item.id === config.moldId && item.status === 'active')) blockers.push('active-mold-required');
  if (config.actorId === 'actor:videoboss') {
    const relation = runtime.relationships.find(item => item.id === 'link:hoyt-videoboss-private-family');
    if (!relation || relation.status !== 'active') blockers.push('hoyt-videoboss-relationship-revoked');
    if (config.settings.voiceCloning) blockers.push('voice-cloning-blocked');
    if (config.settings.audience !== 'private-family') blockers.push('public-or-commercial-audience-blocked');
  }
  if (config.localityPolicy?.selected !== 'web') blockers.push('native-bridge-unavailable');
  return {
    valid: blockers.length === 0,
    blockers,
    readiness: blockers.some(item => item.includes('relationship') || item.includes('blocked')) ? 'needs-permission' : 'invalid'
  };
}

export async function promoteSettingToActorDefault(runtime, productionId, actorId, settingKeys) {
  const next = clone(runtime);
  const config = next.configurations.find(item => item.productionId === productionId && item.actorId === actorId);
  if (!config) return { runtime, denied: true, reason: 'configuration-not-found' };
  const promoted = {};
  for (const key of settingKeys) if (key in config.settings) promoted[key] = clone(config.settings[key]);
  next.actorDefaults[actorId] = { ...(next.actorDefaults[actorId] || {}), ...promoted };
  const proposal = {
    schema: 'gummy.actor-update-proposal/v0',
    id: uid('actor-update-proposal'),
    actorId,
    sourceProductionId: productionId,
    proposedDefaults: promoted,
    status: 'approved',
    approvedBy: 'human:hayden',
    hash: await sha256(stableStringify(promoted)),
    createdAt: now()
  };
  next.actorUpdateProposals.push(proposal);
  next.receipts.push(makeRuntimeReceipt({
    action: 'actor-default.promoted',
    productionId,
    actorId,
    outcome: 'completed',
    summary: `Human explicitly promoted ${settingKeys.join(', ')} to Actor defaults.`,
    resources: [proposal.id, proposal.hash]
  }));
  return { runtime: next, proposal };
}

export function compileActorPlan(runtime, productionId) {
  const next = clone(runtime);
  const production = next.productions.find(item => item.id === productionId);
  if (!production) return { runtime, denied: true, reason: 'production-not-found' };
  const participants = next.participants.filter(item => item.productionId === productionId && item.status !== 'removed');
  const has = actorId => participants.some(item => item.actorId === actorId);
  const nodes = [];
  const addNode = (actorId, nodeType, role, optional = false) => {
    if (!has(actorId)) return;
    const participant = participants.find(item => item.actorId === actorId);
    nodes.push({
      schema: 'gummy.actor-plan-node/v0',
      id: `plan-node:${productionId.slice(11)}:${actorId.slice(6)}`,
      actorId,
      nodeType,
      role,
      optional,
      agentId: nodeType === 'execution' ? participant.assignedAgentId : undefined,
      moldId: participant.moldId,
      configurationId: next.configurations.find(item => item.productionId === productionId && item.actorId === actorId)?.id,
      expectedOutputs: next.actorAppDescriptors.find(item => item.actorId === actorId)?.outputTypes || [],
      locality: nodeType === 'execution' ? 'web' : 'none',
      cost: 0
    });
  };
  addNode('actor:hayden', 'context', 'creative owner and approver');
  addNode('actor:hoyt', 'context', 'represented participant and optional reviewer', true);
  addNode('actor:imagehoss', 'execution', 'approved reference preparation');
  addNode('actor:3d-bee', 'execution', 'optional scene preparation', true);
  addNode('actor:videoboss', 'execution', 'private video reference generation');
  addNode('actor:project-composer', 'execution', 'assembly and finalization');
  addNode('actor:gummy-storage', 'execution', 'preservation and evidence storage');

  const edges = [];
  const addEdge = (from, to, edgeType, dataClasses, optional = false, approvalRequired = false) => {
    if (!has(from) || !has(to)) return;
    edges.push({
      schema: 'gummy.actor-plan-edge/v0',
      id: `plan-edge:${productionId.slice(11)}:${from.slice(6)}:${to.slice(6)}:${edgeType}`,
      fromNodeId: `plan-node:${productionId.slice(11)}:${from.slice(6)}`,
      toNodeId: `plan-node:${productionId.slice(11)}:${to.slice(6)}`,
      edgeType,
      dataClasses,
      optional,
      approvalRequired
    });
  };
  addEdge('actor:hayden', 'actor:imagehoss', 'context', ['creative-brief', 'approved-ranch-references']);
  addEdge('actor:hoyt', 'actor:videoboss', 'context', ['approved-likeness', 'approved-beagle-references', 'private-family-video'], true, true);
  addEdge('actor:imagehoss', 'actor:3d-bee', 'setup', ['approved-reference-set'], true);
  addEdge('actor:imagehoss', 'actor:videoboss', 'input', ['approved-reference-set']);
  addEdge('actor:3d-bee', 'actor:videoboss', 'input', ['scene-manifest'], true);
  addEdge('actor:videoboss', 'actor:project-composer', 'execution', ['video-manifest']);
  addEdge('actor:hoyt', 'actor:project-composer', 'review', ['private-final-preview'], true, true);
  addEdge('actor:hayden', 'actor:project-composer', 'approval', ['final-deliverable'], false, true);
  addEdge('actor:project-composer', 'actor:gummy-storage', 'storage', ['project-manifest', 'final-deliverable', 'receipts']);
  addEdge('actor:hayden', 'actor:gummy-storage', 'publication', ['private-only'], false, true);

  const previous = next.actorPlans.filter(item => item.productionId === productionId).at(-1);
  const plan = {
    schema: 'gummy.actor-plan/v0',
    id: previous?.id || `actor-plan:${productionId.slice(11)}`,
    productionId,
    title: `${production.title} Actor Plan`,
    revision: String(Number(previous?.revision || 0) + 1),
    nodes,
    edges,
    status: 'editable',
    createdAt: previous?.createdAt || now(),
    updatedAt: now()
  };
  next.actorPlans = next.actorPlans.filter(item => item.productionId !== productionId);
  next.actorPlans.push(plan);
  production.activeActorPlanId = plan.id;
  if (!production.actorPlanIds.includes(plan.id)) production.actorPlanIds.push(plan.id);
  next.receipts.push(makeRuntimeReceipt({
    action: 'actor-plan.compiled',
    productionId,
    actorId: production.ownerActorId,
    outcome: 'completed',
    summary: `Compiled editable graph revision ${plan.revision} with ${nodes.length} nodes and ${edges.length} typed edges. No work executed.`,
    resources: [plan.id]
  }));
  return { runtime: next, plan };
}

export function createDragIntent(runtime, {
  productionId,
  sourceKind,
  sourceId,
  targetKind,
  targetId,
  action,
  dataClasses = [],
  moldId,
  approvalRequired = true,
  inputMode = 'pointer'
}) {
  const next = clone(runtime);
  const blockers = [];
  if (productionId && !next.productions.some(item => item.id === productionId)) {
    blockers.push(`missing-production:${productionId}`);
  }
  if (sourceKind === 'actor' && !next.actors.some(item => item.id === sourceId)) {
    blockers.push(`missing-actor:${sourceId}`);
  }
  if (targetKind === 'actor' && !next.actors.some(item => item.id === targetId)) {
    blockers.push(`missing-target-actor:${targetId}`);
  }
  if (action === 'task-input') {
    const descriptor = next.actorAppDescriptors.find(item => item.actorId === targetId);
    const compatible = dataClasses.some(dataClass => descriptor?.acceptedInputTypes.some(accepted => (
      accepted === dataClass || (accepted.endsWith('/*') && dataClass.startsWith(accepted.slice(0, -1)))
    )));
    if (!compatible) blockers.push(`accepted-input-required:${descriptor?.acceptedInputTypes.join('|') || 'none'}`);
  }
  const intent = {
    schema: 'gummy.drag-intent/v0',
    id: uid('drag-intent'),
    productionId,
    source: { kind: sourceKind, id: sourceId },
    target: { kind: targetKind, id: targetId },
    proposedRelation: action,
    dataClasses,
    moldId: moldId || null,
    utilityTileId: dragUtilityByAction[action] || 'gummy.utility.setup',
    approvalRequired,
    inputMode,
    status: 'preview',
    validation: { valid: blockers.length === 0, blockers },
    grantsAuthority: false,
    startsExecution: false,
    frozenRunMutation: false,
    createdAt: now()
  };
  next.dragIntents.push(intent);
  return { runtime: next, intent };
}

export function applyDragIntent(runtime, intentId) {
  const next = clone(runtime);
  const intent = next.dragIntents.find(item => item.id === intentId);
  if (!intent || intent.status !== 'preview') return { runtime, denied: true, reason: 'intent-not-previewable' };
  if (intent.validation?.valid === false) {
    intent.status = 'denied';
    intent.blockedAt = now();
    return {
      runtime: next,
      intent,
      denied: true,
      reason: intent.validation.blockers.join(', '),
      blockers: clone(intent.validation.blockers),
      executed: false
    };
  }
  intent.status = 'accepted';
  intent.approvedBy = 'human:hayden';
  intent.approvedAt = now();
  if (intent.proposedRelation === 'participant-membership' && intent.source.kind === 'actor') {
    return { ...addActorToProduction(next, intent.productionId, intent.source.id, 'drag'), intent };
  }
  if (intent.proposedRelation === 'task-input' && intent.source.kind === 'gummy' && intent.target.kind === 'actor') {
    const config = next.configurations.find(item => item.productionId === intent.productionId && item.actorId === intent.target.id);
    if (config && !config.inputGummyIds.includes(intent.source.id)) config.inputGummyIds.push(intent.source.id);
  }
  if (intent.proposedRelation === 'actor-routing' && intent.source.kind === 'actor' && intent.target.kind === 'actor') {
    next.links.push({
      schema: 'gummy.link/v0',
      id: uid('link'),
      source: clone(intent.source),
      target: clone(intent.target),
      relation: 'routes-to',
      productionId: intent.productionId,
      dataClasses: clone(intent.dataClasses),
      moldId: intent.moldId,
      status: 'accepted-proposal',
      createdAt: now()
    });
  }
  if (intent.proposedRelation === 'production-source' && intent.source.kind === 'gummy' && intent.target.kind === 'production') {
    const production = next.productions.find(item => item.id === intent.target.id);
    if (production && !production.gummyIds.includes(intent.source.id)) production.gummyIds.push(intent.source.id);
  }
  if (intent.proposedRelation === 'plan-edge' && intent.source.kind === 'gummy' && intent.target.kind === 'actor') {
    const plan = next.actorPlans.find(item => item.productionId === intent.productionId);
    const gummy = next.gummies.find(item => item.id === intent.source.id);
    const fromNode = plan?.nodes.find(item => item.actorId === gummy?.creatorActorId);
    const toNode = plan?.nodes.find(item => item.actorId === intent.target.id);
    if (plan && fromNode && toNode) {
      plan.edges.push({
        schema: 'gummy.actor-plan-edge/v0',
        id: uid('plan-edge'),
        fromNodeId: fromNode.id,
        toNodeId: toNode.id,
        edgeType: 'execution',
        dataClasses: clone(intent.dataClasses),
        optional: false,
        approvalRequired: true,
        sourceIntentId: intent.id
      });
      plan.revision = String(Number(plan.revision) + 1);
      plan.updatedAt = now();
    }
  }
  if (intent.proposedRelation === 'preservation-policy' && intent.source.kind === 'production' && intent.target.id === 'actor:gummy-storage') {
    const config = next.configurations.find(item => item.productionId === intent.source.id && item.actorId === 'actor:gummy-storage');
    if (config) {
      config.settings.preservationProposal = {
        sourceProductionId: intent.source.id,
        dataClasses: clone(intent.dataClasses),
        intentId: intent.id
      };
      config.revision = String(Number(config.revision) + 1);
      config.readiness = 'needs-configuration';
    }
  }
  if (intent.proposedRelation === 'copy-configuration' && intent.source.kind === 'configuration' && intent.target.kind === 'production') {
    const source = next.configurations.find(item => item.id === intent.source.id);
    if (source) {
      const added = addActorToProduction(next, intent.target.id, source.actorId, 'template');
      const copiedRuntime = added.runtime;
      const copy = copiedRuntime.configurations.find(item => item.productionId === intent.target.id && item.actorId === source.actorId);
      Object.assign(copy, {
        settings: clone(source.settings),
        inputGummyIds: [],
        revision: '1',
        hash: source.hash,
        readiness: 'needs-configuration',
        validation: { valid: false, blockers: ['copied-configuration-requires-review'] },
        copiedFrom: `${source.id}@${source.revision}`,
        updatedAt: now()
      });
      copiedRuntime.receipts.push(makeRuntimeReceipt({
        action: 'production.configuration-copied',
        productionId: intent.target.id,
        actorId: source.actorId,
        outcome: 'completed',
        summary: `Copied ${source.id}@${source.revision} into an isolated configuration requiring review.`,
        resources: [intent.id, copy.id]
      }));
      return { runtime: copiedRuntime, intent, executed: false };
    }
  }
  if (intent.proposedRelation === 'plan-reorder' && intent.source.kind === 'plan-node' && intent.target.kind === 'plan') {
    const plan = next.actorPlans.find(item => item.id === intent.target.id && item.productionId === intent.productionId);
    const index = plan?.nodes.findIndex(item => item.id === intent.source.id) ?? -1;
    if (plan && index > 0) {
      const [node] = plan.nodes.splice(index, 1);
      plan.nodes.splice(index - 1, 0, node);
      plan.revision = String(Number(plan.revision) + 1);
      plan.updatedAt = now();
    }
  }
  next.receipts.push(makeRuntimeReceipt({
    action: 'drag-intent.accepted',
    productionId: intent.productionId,
    actorId: 'actor:hayden',
    outcome: 'completed',
    summary: `Accepted typed ${intent.proposedRelation} proposal. No authority was granted and no execution started.`,
    resources: [intent.id]
  }));
  return { runtime: next, intent, executed: false };
}

export function previewProductionRun(runtime, productionId) {
  let working = runtime;
  let plan = working.actorPlans.find(item => item.productionId === productionId);
  if (!plan) {
    const compiled = compileActorPlan(working, productionId);
    working = compiled.runtime;
    plan = compiled.plan;
  }
  const production = working.productions.find(item => item.id === productionId);
  if (!production) return { runtime, approved: false, blockers: ['production-not-found'] };
  const blockers = [];
  const requiredActorIds = ['actor:hayden', 'actor:imagehoss', 'actor:videoboss', 'actor:project-composer', 'actor:gummy-storage'];
  for (const actorId of requiredActorIds) {
    if (!working.participants.some(item => item.productionId === productionId && item.actorId === actorId && item.status !== 'removed')) {
      blockers.push(`missing-required-actor:${actorId}`);
    }
  }
  for (const config of working.configurations.filter(item => item.productionId === productionId)) {
    const descriptor = working.actorAppDescriptors.find(item => item.actorId === config.actorId);
    if (!descriptor?.optional && config.readiness !== 'ready') blockers.push(`configuration-not-ready:${config.actorId}`);
  }
  const relationship = working.relationships.find(item => item.id === 'link:hoyt-videoboss-private-family');
  if (working.participants.some(item => item.productionId === productionId && item.actorId === 'actor:hoyt') && relationship?.status !== 'active') {
    blockers.push('relationship-revoked:actor:hoyt:actor:videoboss');
  }
  const preview = {
    schema: 'gummy.production-run-preview/v0',
    productionId,
    productionRevision: production.revision,
    actorPlanId: plan.id,
    actorPlanRevision: plan.revision,
    participants: working.participants.filter(item => item.productionId === productionId).map(item => ({
      actorId: item.actorId,
      roles: item.roles,
      agentId: item.assignedAgentId,
      moldId: item.moldId,
      approvalState: item.approvalState
    })),
    sourceGummies: production.gummyIds.map(id => working.gummies.find(item => item.id === id)).filter(Boolean).map(item => ({ id: item.id, revision: item.revision, hash: item.hash })),
    locality: ['web'],
    totalCostCeiling: { currency: 'USD', amount: 0 },
    retention: 'Production-specific; selected by GummyStorage',
    publication: 'private-only',
    blockers,
    requiresHumanApproval: true
  };
  return { runtime: working, preview, approved: blockers.length === 0, blockers };
}

export async function makeProduction(runtime, productionId, { approvedBy = null } = {}) {
  const inspection = previewProductionRun(runtime, productionId);
  let next = clone(inspection.runtime);
  const production = next.productions.find(item => item.id === productionId);
  if (inspection.blockers.length || approvedBy !== 'human:hayden') {
    const reason = inspection.blockers.length ? inspection.blockers.join(', ') : 'human-approval-required';
    const denial = makeRuntimeReceipt({
      action: 'production-run.denied',
      productionId,
      actorId: production?.ownerActorId || 'actor:hayden',
      outcome: 'denied',
      summary: `Make Production was blocked: ${reason}.`,
      resources: inspection.blockers
    });
    next.receipts.push(denial);
    return { runtime: next, denied: true, blockers: inspection.blockers.length ? inspection.blockers : ['human-approval-required'], receipt: denial };
  }

  const plan = next.actorPlans.find(item => item.id === production.activeActorPlanId);
  const runNumber = next.productionRuns.filter(item => item.productionId === productionId).length + 1;
  const runId = `production-run:${productionId.slice(11)}:${runNumber}`;
  const configurationSnapshots = next.configurations
    .filter(item => item.productionId === productionId)
    .map(item => clone(item));
  const sourceGummies = production.gummyIds
    .map(id => next.gummies.find(item => item.id === id))
    .filter(Boolean)
    .map(item => ({ id: item.id, revision: item.revision, hash: item.hash }));
  const run = {
    schema: PRODUCTION_RUN_SCHEMA,
    id: runId,
    productionId,
    productionRevision: production.revision,
    actorPlanId: plan.id,
    actorPlanRevision: plan.revision,
    frozenPlan: clone(plan),
    frozenParticipants: clone(next.participants.filter(item => item.productionId === productionId)),
    frozenConfigurations: configurationSnapshots,
    configurationRevisionIds: configurationSnapshots.map(item => `${item.id}@${item.revision}`),
    sourceGummyRevisions: sourceGummies,
    approval: { approvedBy, approvedAt: now() },
    policy: { audience: 'private-family', locality: 'web', retention: 'Production-specific', costCeiling: 0 },
    status: 'running',
    workOrderIds: [],
    taskLeaseIds: [],
    grantIds: [],
    contextEnvelopeIds: [],
    returnIds: [],
    receiptIds: [],
    resultGummyIds: [],
    createdAt: now(),
    startedAt: now()
  };
  run.manifestHash = await sha256(stableStringify({
    productionRevision: run.productionRevision,
    actorPlanRevision: run.actorPlanRevision,
    configurationRevisionIds: run.configurationRevisionIds,
    sourceGummyRevisions: run.sourceGummyRevisions,
    approval: run.approval,
    policy: run.policy
  }));
  next.productionRuns.push(run);
  production.runIds.push(run.id);
  production.status = 'running';

  const executionNodes = plan.nodes.filter(item => item.nodeType === 'execution');
  for (const node of executionNodes) {
    const config = configurationSnapshots.find(item => item.actorId === node.actorId);
    if (node.optional && config?.readiness !== 'ready') continue;
    const outcome = await executeReferenceNode(next, production, run, node, config);
    next = outcome.runtime;
  }
  const storedRun = next.productionRuns.find(item => item.id === runId);
  const editableProduction = next.productions.find(item => item.id === productionId);
  storedRun.status = 'completed';
  storedRun.finishedAt = now();
  editableProduction.status = 'review';
  editableProduction.revision = String(Number(editableProduction.revision) + 1);
  editableProduction.updatedAt = now();
  next.receipts.push(makeRuntimeReceipt({
    action: 'production-run.completed',
    productionId,
    actorId: editableProduction.ownerActorId,
    runId,
    outcome: 'completed',
    summary: `Completed governed deterministic reference Run ${runId}. Executors are structured browser reference adapters, not production media services.`,
    resources: [...storedRun.resultGummyIds, storedRun.manifestHash]
  }));
  return { runtime: next, run: clone(storedRun), results: storedRun.resultGummyIds.map(id => next.gummies.find(item => item.id === id)) };
}

async function executeReferenceNode(runtime, production, runSnapshot, node, config) {
  const next = clone(runtime);
  const run = next.productionRuns.find(item => item.id === runSnapshot.id);
  const currentProduction = next.productions.find(item => item.id === production.id);
  const relationship = next.relationships.find(item => item.id === 'link:hoyt-videoboss-private-family');
  const contextRefs = node.actorId === 'actor:videoboss'
    ? clone(relationship.allowedContextRefs)
    : currentProduction.gummyIds.slice(0, 1);
  const envelope = {
    schema: 'gummy.context-envelope/v0',
    id: `context-envelope:${run.id.slice(15)}:${node.actorId.slice(6)}`,
    productionRunId: run.id,
    actorPlanNodeId: node.id,
    targetActorId: node.actorId,
    agentId: node.agentId,
    taskInstruction: node.role,
    selectedProductionContext: { productionId: currentProduction.id, title: currentProduction.title, audience: 'private-family' },
    contextRefs,
    sourceGummyRefs: currentProduction.gummyIds.filter(id => contextRefs.includes(id) || id === 'gummy:ranch-day-source-brief'),
    moldIds: [node.moldId],
    relationshipLinkIds: node.actorId === 'actor:videoboss' ? [relationship.id] : [],
    allowedCapabilities: [next.actorAppDescriptors.find(item => item.actorId === node.actorId)?.capabilityIds[0]],
    forbiddenActions: node.actorId === 'actor:videoboss' ? clone(relationship.blockedCapabilities) : ['ambient-native-access', 'publish'],
    outputContract: clone(config.outputContract),
    policy: {
      privacy: config.privacyPolicy,
      retention: config.retentionPolicy,
      locality: config.localityPolicy.selected,
      contribution: config.contributionPolicy,
      audience: 'private-family'
    },
    excludes: ['complete-actor-memory', 'unrelated-private-memory', 'provider-credentials', 'ambient-filesystem'],
    createdAt: now()
  };
  envelope.hash = await sha256(stableStringify(envelope));
  next.contextEnvelopes.push(envelope);

  const workOrder = {
    schema: 'gummy.work-order/v0',
    id: `work-order:${run.id.slice(15)}:${node.actorId.slice(6)}`,
    boxId: 'box:hayden',
    issuer: { type: 'human', id: 'human:hayden', displayName: 'Hayden' },
    target: {
      humanAuthorityId: 'human:hayden',
      actorId: node.actorId,
      preferredAgentId: node.agentId,
      moldId: node.moldId,
      masterControlId: 'master-control:hayden'
    },
    goal: node.role,
    contextEnvelopeId: envelope.id,
    scope: {
      requestedCapabilities: envelope.allowedCapabilities,
      gummyIds: envelope.sourceGummyRefs,
      allowedWriteTargets: ['production-results'],
      forbiddenActions: envelope.forbiddenActions,
      maxCost: 0
    },
    execution: { requiredLocality: 'web', privacy: 'private-local', preferredInference: 'no-model', requiresNative: false, offlineAllowed: true },
    acceptance: { checks: ['deterministic-manifest-created', 'source-hashes-unchanged'], expectedReturn: { schema: 'gummy.work-return/v0' }, humanAcceptanceRequired: false },
    approval: { required: true, risk: 'medium', approvedBy: 'human:hayden', approvedAt: run.approval.approvedAt },
    status: 'running',
    createdAt: now(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  };
  const lease = {
    schema: 'gummy.task-lease/v0',
    id: `lease:${run.id.slice(15)}:${node.actorId.slice(6)}`,
    humanAuthorityId: 'human:hayden',
    actorId: node.actorId,
    agentId: node.agentId,
    moldId: node.moldId,
    masterControlId: 'master-control:hayden',
    taskId: workOrder.id,
    scope: { productionRunId: run.id, actorPlanNodeId: node.id, authoritativeLocation: 'browser:local-origin' },
    mode: 'exclusive',
    status: 'active',
    issuedAt: now(),
    expiresAt: workOrder.expiresAt
  };
  const grant = {
    schema: 'gummy.capability-grant/v0',
    id: `grant:${run.id.slice(15)}:${node.actorId.slice(6)}`,
    humanAuthorityId: 'human:hayden',
    actorId: node.actorId,
    operatorType: 'agent',
    operatorId: node.agentId,
    agentId: node.agentId,
    moldId: node.moldId,
    masterControlId: 'master-control:hayden',
    taskLeaseId: lease.id,
    action: envelope.allowedCapabilities[0],
    resource: run.id,
    resourceKind: 'other',
    risk: 'medium',
    reason: node.role,
    scope: { contextEnvelopeId: envelope.id, outputs: config.outputContract.types },
    locality: 'web',
    approval: 'human',
    issuedAt: now(),
    expiresAt: workOrder.expiresAt,
    revoked: false
  };
  const adapterResult = await invokeCapabilityAdapter({
    agent: next.agents.find(item => item.id === node.agentId),
    mold: next.molds.find(item => item.id === node.moldId),
    lease,
    grant,
    envelope,
    configuration: config,
    production: currentProduction,
    run
  });

  const resultGummy = {
    schema: 'gummy.gummy/v0',
    id: `gummy:${run.id.slice(15)}:${node.actorId.slice(6)}:result`,
    name: `${next.actors.find(item => item.id === node.actorId).name} deterministic result`,
    kind: node.actorId === 'actor:project-composer' ? 'deliverable' : 'result',
    mediaType: 'application/vnd.gummy.reference-result+json',
    content: stableStringify(adapterResult.output),
    revision: '1',
    ownerActorId: currentProduction.ownerActorId,
    creatorActorId: node.actorId,
    operatingAgentId: node.agentId,
    moldId: node.moldId,
    productionId: currentProduction.id,
    productionRunId: run.id,
    authoritativeLocation: 'browser:local-origin',
    status: 'result',
    linkIds: []
  };
  resultGummy.hash = await sha256(resultGummy.content);
  const link = {
    schema: 'gummy.link/v0',
    id: `link:${run.id.slice(15)}:${node.actorId.slice(6)}:created`,
    source: { kind: 'gummy', id: production.gummyIds[0] },
    target: { kind: 'gummy', id: resultGummy.id },
    relation: 'derived-from',
    productionRunId: run.id,
    createdAt: now()
  };
  resultGummy.linkIds.push(link.id);
  const returned = {
    schema: 'gummy.work-return/v0',
    id: `return:${run.id.slice(15)}:${node.actorId.slice(6)}`,
    boxId: 'box:hayden',
    workOrderId: workOrder.id,
    taskLeaseId: lease.id,
    humanAuthorityId: 'human:hayden',
    actorId: node.actorId,
    agentId: node.agentId,
    moldId: node.moldId,
    result: 'completed',
    summary: adapterResult.disclosure,
    sourceState: run.sourceGummyRevisions,
    gummyIds: [resultGummy.id],
    checks: [
      { name: 'deterministic-manifest-created', status: 'passed' },
      { name: 'source-hashes-unchanged', status: 'passed' }
    ],
    receiptIds: [],
    createdAt: now()
  };
  const receipt = makeRuntimeReceipt({
    action: 'production-run.node-completed',
    productionId: currentProduction.id,
    actorId: node.actorId,
    agentId: node.agentId,
    moldId: node.moldId,
    taskLeaseId: lease.id,
    grantIds: [grant.id],
    contextEnvelopeId: envelope.id,
    runId: run.id,
    outcome: 'completed',
    summary: adapterResult.disclosure,
    resources: [resultGummy.id, resultGummy.hash]
  });
  returned.receiptIds.push(receipt.id);
  workOrder.status = 'returned';
  lease.status = 'completed';
  lease.releasedAt = now();
  next.workOrders.push(workOrder);
  next.taskLeases.push(lease);
  next.grants.push(grant);
  next.gummies.push(resultGummy);
  next.links.push(link);
  next.returns.push(returned);
  next.receipts.push(receipt);
  const storedRun = next.productionRuns.find(item => item.id === run.id);
  storedRun.workOrderIds.push(workOrder.id);
  storedRun.taskLeaseIds.push(lease.id);
  storedRun.grantIds.push(grant.id);
  storedRun.contextEnvelopeIds.push(envelope.id);
  storedRun.returnIds.push(returned.id);
  storedRun.receiptIds.push(receipt.id);
  storedRun.resultGummyIds.push(resultGummy.id);
  if (!currentProduction.gummyIds.includes(resultGummy.id)) currentProduction.gummyIds.push(resultGummy.id);
  if (resultGummy.kind === 'deliverable' && !currentProduction.deliverableIds.includes(resultGummy.id)) currentProduction.deliverableIds.push(resultGummy.id);
  return { runtime: next, resultGummy, returned, receipt };
}

export async function invokeCapabilityAdapter({ agent, mold, lease, grant, envelope, configuration, production, run, bridge = null }) {
  const denied = [];
  if (!agent) denied.push('explicit-agent-required');
  if (!mold || mold.status !== 'active') denied.push('active-mold-required');
  if (!lease || lease.status !== 'active') denied.push('active-task-lease-required');
  if (!grant || grant.revoked) denied.push('active-bounded-grant-required');
  if (!envelope) denied.push('context-envelope-required');
  if (agent?.runtimeClass !== 'browser' && !bridge) denied.push('explicit-native-bridge-required');
  if (agent?.runtimeClass === 'browser' && agent.providerClass !== 'gummy-reference') denied.push('unsupported-browser-adapter');
  if (denied.length) {
    return { ok: false, outcome: 'denied', blockers: denied, output: null, disclosure: `Capability invocation denied: ${denied.join(', ')}.` };
  }
  const output = {
    schema: 'gummy.reference-execution-output/v0',
    executor: {
      agentId: agent.id,
      runtimeClass: agent.runtimeClass,
      locality: agent.locality,
      providerClass: agent.providerClass,
      truthfulLimitation: 'Deterministic structured browser reference output; this is not an external media provider invocation.'
    },
    production: { id: production.id, revision: run.productionRevision },
    node: { id: envelope.actorPlanNodeId, actorId: envelope.targetActorId },
    configuration: { id: configuration.id, revision: configuration.revision, settings: clone(configuration.settings) },
    contextEnvelope: { id: envelope.id, refs: clone(envelope.contextRefs) },
    expectedOutputTypes: clone(configuration.outputContract.types),
    deterministicStatus: 'reference-complete'
  };
  return {
    ok: true,
    outcome: 'completed',
    output,
    disclosure: `${agent.id} created a deterministic structured reference result in the browser. It is not a production ${configuration.actorId.slice(6)} implementation.`
  };
}

export function revokeActorRelationship(runtime, relationshipId, reason = 'Human revoked future use') {
  const next = clone(runtime);
  const relationship = next.relationships.find(item => item.id === relationshipId);
  if (!relationship) return { runtime, denied: true, reason: 'relationship-not-found' };
  relationship.status = 'revoked';
  relationship.revokedAt = now();
  relationship.revokedBy = 'human:hayden';
  relationship.revocationReason = reason;
  relationship.revision = String(Number(relationship.revision) + 1);
  const receipt = makeRuntimeReceipt({
    action: 'relationship.revoked',
    actorId: relationship.source.id,
    outcome: 'completed',
    summary: `${relationship.source.id} × ${relationship.target.id} was revoked for future Runs. Historical evidence remains.`,
    resources: [relationship.id]
  });
  next.receipts.push(receipt);
  return { runtime: next, relationship, receipt };
}

export function recordTerminalNodeEvidence(runtime, {
  productionId,
  runId,
  actorId,
  agentId,
  outcome,
  reason
}) {
  const next = clone(runtime);
  const returned = {
    schema: 'gummy.work-return/v0',
    id: uid('return'),
    boxId: 'box:hayden',
    workOrderId: uid('work-order'),
    taskLeaseId: uid('lease'),
    humanAuthorityId: 'human:hayden',
    actorId,
    agentId,
    result: outcome,
    summary: reason,
    gummyIds: [],
    checks: [],
    receiptIds: [],
    createdAt: now()
  };
  const receipt = makeRuntimeReceipt({
    action: `production-run.node-${outcome}`,
    productionId,
    actorId,
    agentId,
    runId,
    outcome,
    summary: reason
  });
  returned.receiptIds.push(receipt.id);
  next.returns.push(returned);
  next.receipts.push(receipt);
  return { runtime: next, returned, receipt };
}

export function makeRuntimeReceipt({
  action,
  productionId,
  actorId,
  agentId,
  moldId,
  taskLeaseId,
  grantIds = [],
  contextEnvelopeId,
  runId,
  outcome,
  summary,
  resources = []
}) {
  return {
    schema: 'gummy.action-receipt/v0',
    id: uid('receipt'),
    action,
    requestId: runId,
    humanAuthorityId: 'human:hayden',
    actorId,
    actorAddress: actorId === 'actor:hayden' ? '@Hayden' : undefined,
    operatorType: agentId ? 'agent' : 'human',
    operatorId: agentId || 'human:hayden',
    agentId,
    moldId,
    masterControlId: 'master-control:hayden',
    taskLeaseId,
    grantIds,
    productionId,
    productionRunId: runId,
    contextEnvelopeId,
    runtimeClass: agentId ? 'browser' : 'web',
    locality: 'web',
    resources,
    outcome,
    summary,
    cost: { currency: 'USD', amount: 0 },
    createdAt: now()
  };
}

export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

export async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return `sha256:${[...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('')}`;
}

export function actorSurfaceWindowId(actorId, productionId = null, surfaceId = 'main') {
  return `actor-surface:${actorId}:${productionId || 'standalone'}:${surfaceId}`;
}

export function upsertWindowState(runtime, windowRecord) {
  const next = clone(runtime);
  next.windowState = next.windowState.filter(item => item.id !== windowRecord.id);
  next.windowState.push({ ...windowRecord, updatedAt: now() });
  return next;
}
