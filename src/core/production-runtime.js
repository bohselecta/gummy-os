import { migrateImageHossConfiguration } from '../integrations/imagehoss.js';
import { migrateVideoBossConfiguration } from '../integrations/videoboss.js';
import { migrateMeshmallowConfiguration } from '../integrations/meshmallow.js';

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

export const NIGHT_GUMMY_LAUNCH_ACTOR_IDS = Object.freeze([
  'actor:hayden',
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
    role: 'image-direction, generation, comparison, acceptance, and handoff',
    capability: 'capability:imagehoss.reference-preparation/v0',
    inputs: ['image/*', 'gummy/reference', 'text/brief'],
    outputs: ['gummy/reference-set'],
    setupDependencies: ['actor:hayden'],
    agentId: 'agent:reference-imagehoss-browser',
    liveAgent: {
      id: 'agent:imagehoss-local',
      name: 'ImageHoss local production runtime',
      providerClass: 'imagehoss',
      runtimeClass: 'linux-native',
      locality: 'local'
    },
    moldId: 'mold:imagehoss:production-reference',
    settings: { direction: 'Gummy OS at night; confident, warm, tactile', deliverable: '16:9 launch image', locks: 'five-color brand palette; clear interface-safe space', references: 'repository-owned Gummy brand kit', exploration: 'two composition studies', exclusions: 'private likeness; third-party marks; unapproved colors', route: 'deterministic-demonstration', acceptance: 'brand legibility, safe space, exact palette' }
  },
  {
    id: 'actor:3d-bee',
    address: '@Meshmallow',
    name: 'Meshmallow',
    role: 'editable world, scene, checkpoint, and engine-package production',
    capability: 'capability:3d-bee.scene-preparation/v0',
    inputs: ['gummy/reference-set', 'text/scene-brief'],
    outputs: ['gummy/scene-manifest'],
    setupDependencies: ['actor:imagehoss'],
    agentId: 'agent:reference-3d-bee-browser',
    liveAgent: {
      id: 'agent:meshmallow-local',
      name: 'Meshmallow authenticated Blender supervisor',
      providerClass: 'blender-supervisor',
      runtimeClass: 'linux-native',
      locality: 'local'
    },
    moldId: 'mold:3d-bee:production-scene',
    settings: { worldIntent: 'stylized underground Gummy launch chamber', targetUse: 'editable environment concept', scale: 'meters; Z-up source with declared engine conversion', references: 'accepted ImageHoss launch keyframe with explicit rights', locks: 'five-color palette; Gummy silhouette language', exploration: 'layout and lighting only', exclusions: 'arbitrary Python, shell, path escape, manufacturing or finished-game claims', operations: 'create-scene, add-approved-primitives, assign-approved-materials, checkpoint, export', route: 'deterministic-demonstration; supervised Blender only when discovered', outputs: 'blend-source, glb-package, engine-handoff', acceptance: 'contained editable scene with validated manifest' },
    optional: true
  },
  {
    id: 'actor:videoboss',
    address: '@VideoBoss',
    name: 'VideoBoss',
    role: 'video planning, routing, rendering, review, continuity, and delivery',
    capability: 'capability:videoboss.video-generation/v0',
    inputs: ['gummy/reference-set', 'gummy/scene-manifest', 'gummy/approved-likeness'],
    outputs: ['gummy/video-manifest'],
    setupDependencies: ['actor:imagehoss', 'actor:3d-bee'],
    agentId: 'agent:reference-videoboss-browser',
    liveAgent: {
      id: 'agent:videoboss-fal',
      name: 'VideoBoss fal.ai server broker',
      providerClass: 'fal',
      runtimeClass: 'server',
      locality: 'cloud'
    },
    moldId: 'mold:videoboss:private-family-video',
    settings: { purpose: 'Gummy OS launch motion plan', audience: 'public launch', durationSeconds: 8, aspectRatio: '16:9', continuityLocks: 'accepted launch image, exact palette, readable safe space', references: 'accepted ImageHoss launch keyframe with protected and movable regions', sequence: 'reveal, settle, logo-safe hold', route: 'deterministic-demonstration', variationBudget: 2, exclusions: 'private likeness, unapproved marks, credential exposure', acceptance: 'continuity, motion clarity, camera restraint, downstream usefulness' }
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
    settings: { title: 'Night Gummy Launch', assembly: 'accepted image, motion plan, scene concept, linked evidence', soundtrack: 'none', outputFormat: 'versioned-production-package' }
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

const specialistRouteDefinitions = Object.freeze({
  'actor:imagehoss': Object.freeze({
    adapter: 'imagehoss',
    liveAgentId: 'agent:imagehoss-local',
    locality: 'local',
    routeId: 'comfyui'
  }),
  'actor:videoboss': Object.freeze({
    adapter: 'videoboss',
    liveAgentId: 'agent:videoboss-fal',
    locality: 'cloud',
    routeId: 'broker'
  }),
  'actor:3d-bee': Object.freeze({
    adapter: 'meshmallow',
    liveAgentId: 'agent:meshmallow-local',
    locality: 'local',
    routeId: 'supervisor'
  })
});

export function resolveProductionExecutionRoute(configuration) {
  const specialist = specialistRouteDefinitions[configuration?.actorId];
  const selected = configuration?.settings?.executionRoute;
  if (!specialist || selected?.lane !== 'live') {
    return Object.freeze({
      lane: 'deterministic',
      adapter: 'gummy-reference',
      agentId: serviceDefinitions.find(item => item.id === configuration?.actorId)?.agentId,
      locality: 'web',
      costCeilingUsd: 0
    });
  }
  if (selected.adapter !== specialist.adapter) {
    return Object.freeze({
      lane: 'invalid',
      adapter: selected.adapter,
      blocker: `specialist-route-mismatch:${configuration.actorId}`
    });
  }
  return Object.freeze({
    lane: 'live',
    adapter: specialist.adapter,
    agentId: specialist.liveAgentId,
    locality: specialist.locality,
    routeId: specialist.routeId,
    model: selected.model,
    endpoint: selected.endpoint,
    costCeilingUsd: Number(selected.costCeilingUsd || 0),
    settings: clone(selected.settings || {})
  });
}

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
    agentIds: definition.agentId
      ? [definition.agentId, definition.liveAgent?.id].filter(Boolean)
      : definition.agentIds || [],
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

function makeLiveAgent(definition) {
  const stamp = '2026-07-27T12:00:00.000Z';
  return {
    schema: 'gummy.agent/v0',
    id: definition.liveAgent.id,
    name: definition.liveAgent.name,
    version: '1.0.0',
    providerClass: definition.liveAgent.providerClass,
    runtimeClass: definition.liveAgent.runtimeClass,
    locality: definition.liveAgent.locality,
    status: 'available',
    actorIds: [definition.id],
    moldIds: [definition.moldId],
    capabilityCeiling: [definition.capability],
    memoryBoundary: { privateLocal: false, portableProfileAllowed: false, currentTaskContextOnly: true },
    disclosure: {
      operator: definition.liveAgent.name,
      autonomy: 'service',
      providerDisclosure: 'Authenticated live specialist route; capability is revalidated before every submission.'
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
    allowedAgentIds: [definition.agentId, definition.liveAgent?.id].filter(Boolean),
    role: definition.role,
    permissions: {
      capabilities: [definition.capability],
      readScopes: definition.inputs,
      writeScopes: definition.outputs,
      publishScopes: [],
      requiresHumanApproval: true
    },
    runtimePolicy: {
      allowedLocalities: ['web', definition.liveAgent?.locality].filter(Boolean),
      allowedRuntimeClasses: ['browser', definition.liveAgent?.runtimeClass].filter(Boolean),
      networkPolicy: definition.liveAgent ? 'named-specialist-boundary-only' : 'none'
    },
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
    supportedAgentFamilies: [definition.agentId, definition.liveAgent?.id].filter(Boolean),
    localityOptions: ['web', definition.liveAgent?.locality].filter(Boolean),
    nativeBridgeCapabilities: definition.liveAgent ? [definition.capability] : [],
    optional: Boolean(definition.optional),
    status: 'active',
    defaultSettings: clone(definition.settings)
  };
}

export function createInitialProductionRuntime() {
  const actors = [...personalDefinitions.map(makeActor), ...serviceDefinitions.map(makeActor)];
  const liveAgents = serviceDefinitions.filter(item => item.liveAgent).map(makeLiveAgent);
  return {
    schema: 'gummy.production-runtime/v0',
    version: PRODUCTION_STATE_VERSION,
    actors,
    agents: [...serviceDefinitions.map(makeAgent), ...liveAgents],
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
    runtimeBindings: [],
    managedRuntimeBindings: [],
    executionTraces: [],
    masterControlDecisions: [],
    runtimeAcceptanceDecisions: [],
    productionPools: [],
    contributionLedgers: [],
    distributionPlans: [],
    gummies: [
      {
        schema: 'gummy.gummy/v0',
        id: 'gummy:night-gummy-launch-brief',
        name: 'Night Gummy Launch brief.md',
        kind: 'source',
        mediaType: 'text/markdown',
        content: '# Night Gummy Launch\nCreate a 16:9 Gummy OS launch image, a short motion plan, and a simple stylized chamber using only repository-owned brand assets.\n',
        revision: '1',
        hash: 'sha256:f2f29d98e0813d803558a673f5d1761b2ce407e11aa8d7f50d36ae6a755b9f90',
        ownerActorId: 'actor:hayden',
        creatorActorId: 'actor:hayden',
        authoritativeLocation: 'browser:local-origin',
        status: 'source',
        linkIds: []
      },
      {
        schema: 'gummy.gummy/v0',
        id: 'gummy:night-gummy-launch-brand-kit',
        name: 'Approved Gummy brand kit',
        kind: 'reference',
        mediaType: 'application/vnd.gummy.reference+json',
        content: '{"asset":"gummy-brand-kit","rights":"repository-owned","audience":"public-launch","privateLikeness":false}',
        revision: '1',
        hash: 'sha256:7bbd0e8097e99959e69d711936fffcc5573259e9ab66f0ca70b5e808d121c9a2',
        ownerActorId: 'actor:hayden',
        creatorActorId: 'actor:hayden',
        authoritativeLocation: 'browser:local-origin',
        status: 'source',
        linkIds: []
      },
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
    'actor:imagehoss': ['image-direction', 'generation', 'comparison', 'acceptance', 'handoff', 'executor'],
    'actor:3d-bee': ['world-intent', 'scene-planning', 'checkpointing', 'engine-handoff', 'executor', 'optional'],
    'actor:videoboss': ['planning', 'model-routing', 'rendering', 'review', 'continuity', 'delivery', 'executor'],
    'actor:project-composer': ['project-assembly', 'executor'],
    'actor:gummy-storage': ['storage', 'executor']
  };
  return roles[actorId] || ['participant'];
}

export function createProduction(runtime, {
  title = 'Ranch Day',
  description = 'Private Ranch Day family video Production',
  ownerActorId = 'actor:hayden',
  visibility = 'private',
  audience = 'private',
  id: requestedId = null,
  sourceGummyIds = ['gummy:ranch-day-source-brief', 'gummy:hoyt-likeness-approved']
} = {}) {
  const next = clone(runtime);
  const stamp = now();
  const id = requestedId && !next.productions.some(item => item.id === requestedId)
    ? requestedId
    : title === 'Ranch Day' && !next.productions.some(item => item.id === 'production:ranch-day')
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
    audience,
    participantIds: [],
    bowlIds: [],
    actorPlanIds: [],
    runIds: [],
    gummyIds: clone(sourceGummyIds),
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
    const initialSettings = clone(next.actorDefaults[actorId] || descriptor.defaultSettings);
    if (production.id === 'production:ranch-day' && actorId === 'actor:videoboss') {
      initialSettings.purpose = 'Private Ranch Day family video';
      initialSettings.audience = 'private-family';
      initialSettings.durationSeconds = 30;
      initialSettings.voiceCloning = false;
    }
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
      settings: initialSettings,
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

export function addNightGummyLaunchRoster(runtime, productionId, source = 'sample') {
  let next = runtime;
  for (const actorId of NIGHT_GUMMY_LAUNCH_ACTOR_IDS) {
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
  const executionRoute = resolveProductionExecutionRoute(config);
  if (executionRoute.lane === 'live') {
    participant.assignedAgentId = executionRoute.agentId;
    config.localityPolicy = {
      selected: executionRoute.locality,
      options: [...new Set([...(config.localityPolicy?.options || []), executionRoute.locality])],
      native: executionRoute.locality === 'local' ? 'paired-specialist-required' : 'not-applicable'
    };
    config.costCeiling = { currency: 'USD', amount: executionRoute.costCeilingUsd };
    config.outputContract = { ...config.outputContract, deterministicReference: false, specialistAdapter: executionRoute.adapter };
  } else {
    const definition = serviceDefinitions.find(item => item.id === actorId);
    participant.assignedAgentId = definition?.agentId;
    config.localityPolicy = { selected: 'web', options: ['web'], native: 'unavailable' };
    config.costCeiling = { currency: 'USD', amount: 0 };
    config.outputContract = { ...config.outputContract, deterministicReference: true };
    delete config.outputContract.specialistAdapter;
  }
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
  const executionRoute = resolveProductionExecutionRoute(config);
  if (executionRoute.lane === 'invalid') blockers.push(executionRoute.blocker);
  if (!config.settings || Object.keys(config.settings).length === 0) blockers.push('settings-empty');
  if (!config.moldId || !runtime.molds.some(item => item.id === config.moldId && item.status === 'active')) blockers.push('active-mold-required');
  if (config.actorId === 'actor:videoboss') {
    const representedParticipantIncluded = runtime.participants.some(item => (
      item.productionId === config.productionId
      && item.actorId === 'actor:hoyt'
      && item.status !== 'removed'
    ));
    const relation = runtime.relationships.find(item => item.id === 'link:hoyt-videoboss-private-family');
    if (config.settings.voiceCloning) blockers.push('voice-cloning-blocked');
    if (representedParticipantIncluded) {
      if (!relation || relation.status !== 'active') blockers.push('hoyt-videoboss-relationship-revoked');
      if (config.settings.audience !== 'private-family') blockers.push('public-or-commercial-audience-blocked');
    }
  }
  if (executionRoute.lane === 'deterministic' && config.localityPolicy?.selected !== 'web') blockers.push('deterministic-route-requires-web-locality');
  if (executionRoute.lane === 'live' && config.localityPolicy?.selected !== executionRoute.locality) blockers.push('live-route-locality-mismatch');
  if (executionRoute.lane === 'live' && !runtime.agents.some(item => item.id === executionRoute.agentId)) blockers.push('live-specialist-agent-required');
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
    const configuration = next.configurations.find(item => item.productionId === productionId && item.actorId === actorId);
    const route = nodeType === 'execution' ? resolveProductionExecutionRoute(configuration) : null;
    nodes.push({
      schema: 'gummy.actor-plan-node/v0',
      id: `plan-node:${productionId.slice(11)}:${actorId.slice(6)}`,
      actorId,
      nodeType,
      role,
      optional,
      agentId: nodeType === 'execution' ? participant.assignedAgentId : undefined,
      moldId: participant.moldId,
      configurationId: configuration?.id,
      expectedOutputs: next.actorAppDescriptors.find(item => item.actorId === actorId)?.outputTypes || [],
      executionRoute: nodeType === 'execution' ? route.lane : 'none',
      specialistAdapter: nodeType === 'execution' ? route.adapter : undefined,
      locality: nodeType === 'execution' ? route.locality : 'none',
      cost: nodeType === 'execution' ? route.costCeilingUsd : 0
    });
  };
  addNode('actor:hayden', 'context', 'creative owner and approver');
  addNode('actor:hoyt', 'context', 'represented participant and optional reviewer', true);
  addNode('actor:imagehoss', 'execution', 'image direction, candidates, acceptance, and handoff');
  addNode('actor:3d-bee', 'execution', 'optional editable world and scene package', true);
  addNode('actor:videoboss', 'execution', 'sequence planning, takes, review, continuity, and delivery');
  addNode('actor:project-composer', 'execution', 'accepted-output assembly and finalization');
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
  addEdge('actor:hayden', 'actor:imagehoss', 'context', ['creative-brief', 'approved-production-assets']);
  addEdge('actor:hoyt', 'actor:videoboss', 'context', ['approved-likeness', 'approved-beagle-references', 'private-family-video'], true, true);
  addEdge('actor:imagehoss', 'actor:3d-bee', 'setup', ['approved-reference-set'], true);
  addEdge('actor:imagehoss', 'actor:videoboss', 'input', ['approved-reference-set']);
  addEdge('actor:3d-bee', 'actor:videoboss', 'input', ['scene-manifest'], true);
  addEdge('actor:videoboss', 'actor:project-composer', 'execution', ['sequence-package', 'reviewed-takes']);
  addEdge('actor:hoyt', 'actor:project-composer', 'review', ['private-final-preview'], true, true);
  addEdge('actor:hayden', 'actor:project-composer', 'approval', ['final-deliverable'], false, true);
  addEdge('actor:project-composer', 'actor:gummy-storage', 'storage', ['project-manifest', 'final-deliverable', 'receipts']);
  addEdge('actor:hayden', 'actor:gummy-storage', 'publication', [production.visibility === 'private' ? 'private-only' : 'human-approved-release'], false, true);

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
  const frozenConfigurations = working.configurations.filter(item => item.productionId === productionId);
  const requiredActorIds = ['actor:hayden', 'actor:imagehoss', 'actor:videoboss', 'actor:project-composer', 'actor:gummy-storage'];
  for (const actorId of requiredActorIds) {
    if (!working.participants.some(item => item.productionId === productionId && item.actorId === actorId && item.status !== 'removed')) {
      blockers.push(`missing-required-actor:${actorId}`);
    }
  }
  for (const config of frozenConfigurations) {
    const descriptor = working.actorAppDescriptors.find(item => item.actorId === config.actorId);
    if (!descriptor?.optional && config.readiness !== 'ready') blockers.push(`configuration-not-ready:${config.actorId}`);
  }
  const executionRoutes = frozenConfigurations.map(config => ({
    actorId: config.actorId,
    ...resolveProductionExecutionRoute(config)
  }));
  for (const route of executionRoutes) {
    if (route.lane === 'invalid') blockers.push(route.blocker);
  }
  const relationship = working.relationships.find(item => item.id === 'link:hoyt-videoboss-private-family');
  if (working.participants.some(item => item.productionId === productionId && item.actorId === 'actor:hoyt') && relationship?.status !== 'active') {
    blockers.push('relationship-revoked:actor:hoyt:actor:videoboss');
  }
  const unresolvedRecovery = working.productionRuns.find(item => (
    item.productionId === productionId
    && item.nodeStatuses?.some(node => node.status === 'recovery-required')
  ));
  if (unresolvedRecovery) blockers.push(`production-run-recovery-required:${unresolvedRecovery.id}`);
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
    executionRoutes,
    locality: [...new Set(executionRoutes.map(item => item.locality).filter(Boolean))],
    totalCostCeiling: {
      currency: 'USD',
      amount: executionRoutes.reduce((sum, item) => sum + Number(item.costCeilingUsd || 0), 0)
    },
    retention: 'Production-specific; selected by GummyStorage',
    publication: 'private-only',
    blockers,
    requiresHumanApproval: true
  };
  return { runtime: working, preview, approved: blockers.length === 0, blockers };
}

export async function makeProduction(runtime, productionId, {
  approvedBy = null,
  specialistAdapters = null
} = {}) {
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
    policy: {
      audience: production.audience || 'private',
      locality: clone(inspection.preview.locality),
      retention: 'Production-specific',
      costCeiling: inspection.preview.totalCostCeiling.amount
    },
    status: 'running',
    nodeStatuses: [],
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
    const outcome = await executeProductionNode(next, production, run, node, config, specialistAdapters);
    next = outcome.runtime;
  }
  const storedRun = next.productionRuns.find(item => item.id === runId);
  const editableProduction = next.productions.find(item => item.id === productionId);
  const requiredProblems = storedRun.nodeStatuses.filter(item => (
    item.required && ['blocked', 'failed', 'recovery-required', 'cancelled'].includes(item.status)
  ));
  const optionalProblems = storedRun.nodeStatuses.filter(item => (
    !item.required && ['blocked', 'failed', 'recovery-required', 'cancelled'].includes(item.status)
  ));
  storedRun.status = requiredProblems.some(item => item.status === 'failed')
    ? 'failed'
    : requiredProblems.length
    ? 'blocked'
    : optionalProblems.length
    ? 'partially-completed'
    : 'completed';
  storedRun.finishedAt = now();
  editableProduction.status = storedRun.status === 'completed' || storedRun.status === 'partially-completed'
    ? 'review'
    : 'blocked';
  editableProduction.revision = String(Number(editableProduction.revision) + 1);
  editableProduction.updatedAt = now();
  next.receipts.push(makeRuntimeReceipt({
    action: `production-run.${storedRun.status}`,
    productionId,
    actorId: editableProduction.ownerActorId,
    runId,
    outcome: storedRun.status === 'completed' ? 'completed' : 'failed',
    summary: storedRun.status === 'completed'
      ? `Completed governed Run ${runId}. Every node retained its selected deterministic or authenticated live route evidence.`
      : `Run ${runId} ended ${storedRun.status}; no blocked, failed, or recovery-required node was reported as completed.`,
    resources: [...storedRun.resultGummyIds, storedRun.manifestHash]
  }));
  return { runtime: next, run: clone(storedRun), results: storedRun.resultGummyIds.map(id => next.gummies.find(item => item.id === id)) };
}

async function executeProductionNode(runtime, production, runSnapshot, node, config, specialistAdapters) {
  const next = clone(runtime);
  const run = next.productionRuns.find(item => item.id === runSnapshot.id);
  const currentProduction = next.productions.find(item => item.id === production.id);
  const executionRoute = resolveProductionExecutionRoute(config);
  const relationship = next.relationships.find(item => item.id === 'link:hoyt-videoboss-private-family');
  const representedContextApproved = node.actorId === 'actor:videoboss'
    && next.participants.some(item => item.productionId === currentProduction.id && item.actorId === 'actor:hoyt' && item.status !== 'removed')
    && relationship?.status === 'active';
  const sourceContextRefs = currentProduction.gummyIds
    .map(id => next.gummies.find(item => item.id === id))
    .filter(item => item && item.status === 'source')
    .map(item => item.id);
  const contextRefs = representedContextApproved
    ? clone(relationship.allowedContextRefs)
    : sourceContextRefs;
  const envelope = {
    schema: 'gummy.context-envelope/v0',
    id: `context-envelope:${run.id.slice(15)}:${node.actorId.slice(6)}`,
    productionRunId: run.id,
    actorPlanNodeId: node.id,
    targetActorId: node.actorId,
    agentId: node.agentId,
    taskInstruction: node.role,
    selectedProductionContext: { productionId: currentProduction.id, title: currentProduction.title, audience: currentProduction.audience || 'private' },
    contextRefs,
    sourceGummyRefs: currentProduction.gummyIds.filter(id => contextRefs.includes(id) || id === 'gummy:ranch-day-source-brief'),
    moldIds: [node.moldId],
    relationshipLinkIds: representedContextApproved ? [relationship.id] : [],
    allowedCapabilities: [next.actorAppDescriptors.find(item => item.actorId === node.actorId)?.capabilityIds[0]],
    forbiddenActions: representedContextApproved ? clone(relationship.blockedCapabilities) : ['ambient-native-access', 'publish', 'unapproved-actor-context'],
    outputContract: clone(config.outputContract),
    policy: {
      privacy: config.privacyPolicy,
      retention: config.retentionPolicy,
      locality: config.localityPolicy.selected,
      contribution: config.contributionPolicy,
      audience: currentProduction.audience || 'private'
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
      maxCost: Number(config.costCeiling?.amount || 0)
    },
    execution: {
      requiredLocality: executionRoute.locality,
      privacy: currentProduction.visibility === 'private' ? 'private-local' : 'approved-public-assets',
      preferredInference: executionRoute.lane === 'live' ? executionRoute.adapter : 'no-model',
      requiresNative: executionRoute.locality === 'local',
      offlineAllowed: executionRoute.lane === 'deterministic'
    },
    acceptance: {
      checks: executionRoute.lane === 'live'
        ? ['specialist-native-evidence', 'source-hashes-unchanged', 'human-role-acceptance-required']
        : ['deterministic-manifest-created', 'source-hashes-unchanged'],
      expectedReturn: { schema: 'gummy.work-return/v0' },
      humanAcceptanceRequired: executionRoute.lane === 'live'
    },
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
    locality: executionRoute.locality,
    approval: 'human',
    issuedAt: now(),
    expiresAt: workOrder.expiresAt,
    revoked: false
  };
  const authority = {
    agent: next.agents.find(item => item.id === node.agentId),
    mold: next.molds.find(item => item.id === node.moldId),
    lease,
    grant,
    envelope,
    configuration: config,
    production: currentProduction,
    run
  };
  const adapterResult = executionRoute.lane === 'live'
    ? await invokeSpecialistProductionAdapter({
        ...authority,
        executionRoute,
        specialistAdapters,
        approvedBy: run.approval.approvedBy
      })
    : await invokeCapabilityAdapter(authority);

  if (!adapterResult.ok) {
    return recordBlockedProductionNode({
      runtime: next,
      production: currentProduction,
      run,
      node,
      workOrder,
      lease,
      grant,
      envelope,
      adapterResult
    });
  }

  const resultGummy = {
    schema: 'gummy.gummy/v0',
    id: `gummy:${run.id.slice(15)}:${node.actorId.slice(6)}:result`,
    name: executionRoute.lane === 'live'
      ? `${next.actors.find(item => item.id === node.actorId).name} live specialist result`
      : `${next.actors.find(item => item.id === node.actorId).name} deterministic result`,
    kind: node.actorId === 'actor:project-composer' ? 'deliverable' : 'result',
    mediaType: executionRoute.lane === 'live'
      ? 'application/vnd.gummy.specialist-result+json'
      : 'application/vnd.gummy.reference-result+json',
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
    productionId: currentProduction.id,
    productionRunId: run.id,
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
    checks: executionRoute.lane === 'live'
      ? [
          { name: 'specialist-native-evidence', outcome: 'pass' },
          { name: 'source-hashes-unchanged', outcome: 'pass' },
          { name: 'human-role-acceptance-required', outcome: 'not-run' }
        ]
      : [
          { name: 'deterministic-manifest-created', outcome: 'pass' },
          { name: 'source-hashes-unchanged', outcome: 'pass' }
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
    resources: [resultGummy.id, resultGummy.hash],
    runtimeClass: executionRoute.lane === 'live'
      ? next.agents.find(item => item.id === node.agentId)?.runtimeClass
      : 'browser',
    locality: executionRoute.locality,
    cost: { currency: 'USD', amount: Number(config.costCeiling?.amount || 0) }
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
  storedRun.nodeStatuses.push({
    nodeId: node.id,
    actorId: node.actorId,
    route: executionRoute.lane,
    adapter: executionRoute.adapter,
    status: 'completed',
    required: !node.optional,
    nativeJobIds: clone(adapterResult.nativeJobIds || []),
    specialistReceiptIds: clone(adapterResult.specialistReceiptIds || []),
    ...(adapterResult.specialistJobId ? { specialistJobId: adapterResult.specialistJobId } : {}),
    ...(adapterResult.specialistJob ? { specialistJob: clone(adapterResult.specialistJob) } : {})
  });
  if (!currentProduction.gummyIds.includes(resultGummy.id)) currentProduction.gummyIds.push(resultGummy.id);
  if (resultGummy.kind === 'deliverable' && !currentProduction.deliverableIds.includes(resultGummy.id)) currentProduction.deliverableIds.push(resultGummy.id);
  return { runtime: next, resultGummy, returned, receipt };
}

function resolveRegisteredSpecialistAdapter(registry, actorId) {
  if (!registry) return null;
  if (typeof registry.resolve === 'function') return registry.resolve(actorId);
  if (registry instanceof Map) return registry.get(actorId) || null;
  return registry[actorId] || null;
}

function prepareSpecialistConfiguration(configuration, executionRoute) {
  if (executionRoute.adapter === 'imagehoss') {
    const migrated = migrateImageHossConfiguration(configuration, configuration.productionId);
    migrated.route = {
      ...migrated.route,
      id: 'comfyui',
      workflowId: executionRoute.settings.workflowId || 'approved:imagehoss-safe-v1',
      model: executionRoute.model || executionRoute.settings.model,
      width: Number(executionRoute.settings.width || 1024),
      height: Number(executionRoute.settings.height || 576),
      locality: 'desktop',
      privacy: 'paired-local-companion',
      costCeilingUsd: executionRoute.costCeilingUsd
    };
    return migrated;
  }
  if (executionRoute.adapter === 'videoboss') {
    const migrated = migrateVideoBossConfiguration(configuration, configuration.productionId);
    migrated.durationSeconds = Number(executionRoute.settings.durationSeconds || 5);
    migrated.imageHossAssets = clone(executionRoute.settings.imageHossAssets || []);
    migrated.route = {
      ...migrated.route,
      id: 'broker',
      provider: 'fal',
      model: executionRoute.model || 'fal-ai/wan/v2.7/image-to-video',
      costCeilingUsd: executionRoute.costCeilingUsd,
      timeoutMs: Number(executionRoute.settings.timeoutMs || 15 * 60 * 1000),
      locality: 'server',
      resolution: executionRoute.settings.resolution || '720p',
      audioInput: false,
      promptExpansion: false,
      safetyChecker: true,
      seedPolicy: 'frozen-shot-package'
    };
    const firstShot = migrated.sequence?.shots?.[0];
    if (firstShot) {
      migrated.sequence.shots = [{
        ...firstShot,
        title: 'Approved five-second Wan 2.7 smoke',
        durationSeconds: migrated.durationSeconds
      }];
    }
    migrated.variationBudget = { takesPerShot: 1, maxTotalTakes: 1 };
    return migrated;
  }
  if (executionRoute.adapter === 'meshmallow') {
    const migrated = migrateMeshmallowConfiguration(configuration, configuration.productionId);
    migrated.route = {
      ...migrated.route,
      id: 'supervisor',
      locality: 'desktop',
      blenderTarget: '4.5 LTS',
      timeoutMs: Number(executionRoute.settings.timeoutMs || 120000)
    };
    return migrated;
  }
  throw new Error(`Unsupported specialist adapter ${executionRoute.adapter}`);
}

function validateApprovedLiveRoute(executionRoute) {
  if (executionRoute.adapter !== 'videoboss') return [];
  const blockers = [];
  if ((executionRoute.model || 'fal-ai/wan/v2.7/image-to-video') !== 'fal-ai/wan/v2.7/image-to-video') blockers.push('unapproved-video-model');
  if ((executionRoute.settings.resolution || '720p') !== '720p') blockers.push('unapproved-video-resolution');
  if (Number(executionRoute.settings.durationSeconds || 5) !== 5) blockers.push('unapproved-video-duration');
  if (executionRoute.settings.audioInput === true) blockers.push('video-audio-input-not-approved');
  if (executionRoute.settings.promptExpansion === true) blockers.push('video-prompt-expansion-not-approved');
  if (executionRoute.settings.safetyChecker === false) blockers.push('video-safety-checker-required');
  if (executionRoute.costCeilingUsd <= 0 || executionRoute.costCeilingUsd > 2) blockers.push('video-live-smoke-cost-ceiling-exceeds-approval');
  return blockers;
}

function validateAcceptedVideoSource(configuration) {
  const assets = configuration?.imageHossAssets || [];
  if (assets.length !== 1) return ['accepted-imagehoss-first-frame-required'];
  const asset = assets[0];
  const blockers = [];
  if (asset.productionId !== configuration.productionId) blockers.push('imagehoss-source-production-mismatch');
  if (!['first-frame', 'video-first-frame'].includes(asset.role)) blockers.push('imagehoss-first-frame-role-required');
  if (!asset.acceptance?.acceptedBy || !asset.acceptance?.acceptedAt) blockers.push('imagehoss-human-acceptance-required');
  if (!asset.rights?.rightsCleared || !asset.rights?.permittedUses?.includes('this Production video')) blockers.push('imagehoss-video-rights-required');
  if (!/^[a-f0-9]{64}$/.test(asset.sha256 || '')) blockers.push('imagehoss-source-hash-required');
  return blockers;
}

function specialistCapabilityReady(adapterName, discovery) {
  if (adapterName === 'imagehoss') {
    return discovery?.authenticated === true && discovery?.comfyui?.ready === true;
  }
  if (adapterName === 'videoboss') {
    return discovery?.provider?.authenticated === true && discovery?.provider?.ready === true;
  }
  if (adapterName === 'meshmallow') {
    return discovery?.blender?.ready === true;
  }
  return false;
}

function specialistArtifacts(adapterName, inspection) {
  if (adapterName === 'imagehoss') return inspection?.candidates || [];
  if (adapterName === 'videoboss') return inspection?.takes || [];
  if (adapterName === 'meshmallow') return inspection?.artifacts || [];
  return [];
}

async function invokeSpecialistProductionAdapter({
  agent,
  mold,
  lease,
  grant,
  envelope,
  configuration,
  run,
  executionRoute,
  specialistAdapters,
  approvedBy
}) {
  const blockers = validateApprovedLiveRoute(executionRoute);
  if (!agent || agent.id !== executionRoute.agentId) blockers.push('selected-live-agent-required');
  if (!mold || mold.status !== 'active' || !mold.allowedAgentIds?.includes(agent?.id)) blockers.push('live-agent-outside-active-mold');
  if (!lease || lease.status !== 'active' || lease.agentId !== agent?.id) blockers.push('active-live-task-lease-required');
  if (!grant || grant.revoked || grant.agentId !== agent?.id) blockers.push('active-live-capability-grant-required');
  if (!envelope || envelope.agentId !== agent?.id) blockers.push('live-context-envelope-required');
  const adapter = resolveRegisteredSpecialistAdapter(specialistAdapters, configuration.actorId);
  if (!adapter) blockers.push('capability-unavailable:no-specialist-transport');
  if (blockers.length) {
    return {
      ok: false,
      status: 'blocked',
      outcome: 'capability-unavailable',
      blockers,
      disclosure: `Live ${executionRoute.adapter} route blocked before submission: ${blockers.join(', ')}.`
    };
  }

  const nativeConfiguration = prepareSpecialistConfiguration(configuration, executionRoute);
  if (executionRoute.adapter === 'videoboss') {
    const sourceBlockers = validateAcceptedVideoSource(nativeConfiguration);
    if (sourceBlockers.length) {
      return {
        ok: false,
        status: 'blocked',
        outcome: 'artistic-acceptance-required',
        blockers: sourceBlockers,
        disclosure: `Live VideoBoss route blocked before submission: ${sourceBlockers.join(', ')}.`
      };
    }
  }
  const validation = await adapter.validateConfiguration(nativeConfiguration);
  if (!validation.valid) {
    return {
      ok: false,
      status: 'blocked',
      outcome: 'configuration-invalid',
      blockers: validation.blockers,
      disclosure: `Live ${executionRoute.adapter} configuration blocked before submission: ${validation.blockers.join(', ')}.`
    };
  }
  const compiled = await adapter.compilePackage(nativeConfiguration);
  const discovery = await adapter.discover({
    productionId: configuration.productionId,
    packageDigest: compiled.digest
  });
  if (!specialistCapabilityReady(executionRoute.adapter, discovery)) {
    return {
      ok: false,
      status: 'blocked',
      outcome: 'capability-unavailable',
      blockers: [`capability-unavailable:${executionRoute.adapter}`],
      discovery,
      disclosure: `Live ${executionRoute.adapter} capability is unavailable. No native Job was created and no simulated result was substituted.`
    };
  }

  const idempotencyKey = `${run.id}:${envelope.actorPlanNodeId}:${compiled.digest}`;
  const job = await adapter.execute({
    package: compiled,
    idempotencyKey,
    authorization: {
      action: 'make-production',
      approvedBy,
      packageDigest: compiled.digest,
      planDigest: compiled.planDigest,
      productionRunId: run.id,
      agentId: agent.id,
      moldId: mold.id,
      taskLeaseId: lease.id,
      grantId: grant.id,
      contextEnvelopeId: envelope.id
    }
  });
  if (job.status !== 'succeeded') {
    return {
      ok: false,
      status: job.status === 'recovery-required' ? 'recovery-required' : job.status === 'cancelled' ? 'cancelled' : 'failed',
      outcome: job.status,
      blockers: [job.failure?.code || `${executionRoute.adapter}-job-${job.status}`],
      specialistJobId: job.id,
      specialistJob: clone(job),
      nativeJobIds: [job.nativeJobId, ...(job.nativeJobIds || [])].filter(Boolean),
      disclosure: job.failure?.message || `Live ${executionRoute.adapter} Job ended ${job.status}.`
    };
  }
  if (job.simulation === true) {
    return {
      ok: false,
      status: 'failed',
      outcome: 'simulation-rejected',
      blockers: ['live-route-returned-simulation'],
      disclosure: `Live ${executionRoute.adapter} route returned simulated evidence and was rejected.`
    };
  }
  const inspection = adapter.inspectResult(job.id);
  const artifacts = specialistArtifacts(executionRoute.adapter, inspection);
  if (!artifacts.length || artifacts.some(item => item.simulation === true)) {
    return {
      ok: false,
      status: 'failed',
      outcome: 'native-output-missing',
      blockers: ['genuine-specialist-artifact-required'],
      disclosure: `Live ${executionRoute.adapter} Job did not return genuine specialist artifacts.`
    };
  }
  const specialistReceiptIds = (inspection.specialistReceipts || []).map(item => item.id);
  return {
    ok: true,
    outcome: 'completed',
    output: {
      schema: 'gummy.specialist-execution-output/v1',
      adapter: executionRoute.adapter,
      productionRunId: run.id,
      package: { id: compiled.id, digest: compiled.digest },
      job: clone(inspection.job),
      artifacts: clone(artifacts),
      specialistReceipts: clone(inspection.specialistReceipts || []),
      gummyEvidence: clone(inspection.gummyEvidence || []),
      humanAcceptance: 'required'
    },
    nativeJobIds: [job.nativeJobId, ...(job.nativeJobIds || [])].filter(Boolean),
    specialistReceiptIds,
    specialistJobId: job.id,
    specialistJob: clone(job),
    disclosure: `${agent.id} completed an authenticated live ${executionRoute.adapter} Job. Results await Human role acceptance.`
  };
}

function recordBlockedProductionNode({
  runtime,
  production,
  run,
  node,
  workOrder,
  lease,
  grant,
  envelope,
  adapterResult
}) {
  const next = runtime;
  const status = adapterResult.status || 'blocked';
  workOrder.status = status === 'cancelled' ? 'cancelled' : 'failed';
  lease.status = status === 'recovery-required' ? 'active' : 'released';
  if (lease.status === 'released') lease.releasedAt = now();
  const returned = {
    schema: 'gummy.work-return/v0',
    id: `return:${run.id.slice(15)}:${node.actorId.slice(6)}`,
    boxId: 'box:hayden',
    productionId: production.id,
    productionRunId: run.id,
    workOrderId: workOrder.id,
    taskLeaseId: lease.id,
    humanAuthorityId: 'human:hayden',
    actorId: node.actorId,
    agentId: node.agentId,
    moldId: node.moldId,
    result: status === 'cancelled' ? 'cancelled' : status === 'failed' ? 'failed' : status === 'recovery-required' ? 'partial' : 'blocked',
    summary: adapterResult.disclosure,
    sourceState: run.sourceGummyRevisions,
    gummyIds: [],
    checks: [{
      name: adapterResult.outcome || status,
      outcome: 'blocked',
      detail: (adapterResult.blockers || []).join(', ')
    }],
    receiptIds: [],
    extensions: {
      nodeStatus: status,
      capabilityStatus: adapterResult.outcome,
      nativeJobIds: clone(adapterResult.nativeJobIds || [])
    },
    createdAt: now()
  };
  const receipt = makeRuntimeReceipt({
    action: `production-run.node-${status}`,
    productionId: production.id,
    actorId: node.actorId,
    agentId: node.agentId,
    moldId: node.moldId,
    taskLeaseId: lease.id,
    grantIds: [grant.id],
    contextEnvelopeId: envelope.id,
    runId: run.id,
    outcome: status === 'cancelled' ? 'cancelled' : 'failed',
    summary: adapterResult.disclosure,
    resources: clone(adapterResult.nativeJobIds || []),
    runtimeClass: runtime.agents.find(item => item.id === node.agentId)?.runtimeClass,
    locality: grant.locality,
    cost: { currency: 'USD', amount: 0 }
  });
  returned.receiptIds.push(receipt.id);
  next.workOrders.push(workOrder);
  next.taskLeases.push(lease);
  next.grants.push(grant);
  next.returns.push(returned);
  next.receipts.push(receipt);
  const storedRun = next.productionRuns.find(item => item.id === run.id);
  storedRun.workOrderIds.push(workOrder.id);
  storedRun.taskLeaseIds.push(lease.id);
  storedRun.grantIds.push(grant.id);
  storedRun.contextEnvelopeIds.push(envelope.id);
  storedRun.returnIds.push(returned.id);
  storedRun.receiptIds.push(receipt.id);
  storedRun.nodeStatuses.push({
    nodeId: node.id,
    actorId: node.actorId,
    route: 'live',
    status,
    required: !node.optional,
    blockers: clone(adapterResult.blockers || []),
    nativeJobIds: clone(adapterResult.nativeJobIds || []),
    ...(adapterResult.specialistJobId ? { specialistJobId: adapterResult.specialistJobId } : {}),
    ...(adapterResult.specialistJob ? { specialistJob: clone(adapterResult.specialistJob) } : {})
  });
  return { runtime: next, returned, receipt };
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

export function acceptProductionResult(runtime, {
  productionId,
  resultGummyId,
  role,
  acceptedBy = 'human:hayden'
}) {
  const next = clone(runtime);
  const production = next.productions.find(item => item.id === productionId);
  const result = next.gummies.find(item => item.id === resultGummyId && item.productionId === productionId);
  if (!production || !result || result.status !== 'result') {
    return { runtime, denied: true, reason: 'eligible-production-result-required' };
  }
  if (!role || acceptedBy !== 'human:hayden') {
    return { runtime, denied: true, reason: 'human-role-acceptance-required' };
  }
  const acceptance = {
    schema: 'gummy.production-result-acceptance/v1',
    id: `acceptance:${result.id.slice(6)}:${role}`,
    productionId,
    productionRunId: result.productionRunId,
    resultGummyId: result.id,
    role,
    acceptedBy,
    acceptedAt: now(),
    sourceHash: result.hash
  };
  result.acceptance = acceptance;
  result.status = 'accepted';
  if (!production.deliverableIds.includes(result.id)) production.deliverableIds.push(result.id);
  production.status = 'accepted';
  production.updatedAt = acceptance.acceptedAt;
  const link = {
    schema: 'gummy.link/v0',
    id: `link:${acceptance.id.slice(11)}:accepted-as`,
    source: { kind: 'gummy', id: result.id },
    target: { kind: 'production-role', id: `${productionId}:${role}` },
    relation: 'accepted-as',
    productionRunId: result.productionRunId,
    createdAt: acceptance.acceptedAt
  };
  if (!next.links.some(item => item.id === link.id)) next.links.push(link);
  if (!result.linkIds.includes(link.id)) result.linkIds.push(link.id);
  const receipt = makeRuntimeReceipt({
    action: 'production-result.accepted',
    productionId,
    actorId: 'actor:hayden',
    runId: result.productionRunId,
    outcome: 'completed',
    summary: `Human accepted ${result.id} as ${role}. Other candidates and prior source bytes remain unchanged.`,
    resources: [acceptance.id, result.id, result.hash, link.id]
  });
  next.receipts.push(receipt);
  return { runtime: next, acceptance, receipt, link, result };
}

export function createDeltaRevision(runtime, productionId, {
  except,
  note = '',
  requestedBy = 'human:hayden'
}) {
  const next = clone(runtime);
  const production = next.productions.find(item => item.id === productionId);
  if (!production || !except || requestedBy !== 'human:hayden') {
    return { runtime, denied: true, reason: 'human-delta-revision-required' };
  }
  const priorRevision = production.revision;
  const accepted = next.gummies
    .filter(item => item.productionId === productionId && item.acceptance)
    .map(item => ({ resultGummyId: item.id, role: item.acceptance.role, hash: item.hash }));
  production.revision = String(Number(production.revision) + 1);
  production.status = 'configuring';
  production.updatedAt = now();
  production.revisionHistory = [
    ...(production.revisionHistory || []),
    {
      schema: 'gummy.production-delta-revision/v1',
      fromRevision: priorRevision,
      toRevision: production.revision,
      instruction: `Keep everything except ${except}.`,
      note,
      carryForwardAcceptedLocks: accepted,
      requestedBy,
      createdAt: production.updatedAt
    }
  ];
  const delta = production.revisionHistory.at(-1);
  const receipt = makeRuntimeReceipt({
    action: 'production.delta-revision-created',
    productionId,
    actorId: 'actor:hayden',
    outcome: 'completed',
    summary: `${delta.instruction} Carried forward ${accepted.length} accepted role lock(s); no work executed.`,
    resources: accepted.map(item => `${item.resultGummyId}:${item.hash}`)
  });
  next.receipts.push(receipt);
  return { runtime: next, production, delta, receipt };
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
  resources = [],
  runtimeClass = agentId ? 'browser' : 'web',
  locality = 'web',
  cost = { currency: 'USD', amount: 0 }
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
    runtimeClass,
    locality,
    resources,
    outcome,
    summary,
    cost,
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
