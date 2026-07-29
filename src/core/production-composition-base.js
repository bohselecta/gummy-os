import {
  addActorToProduction,
  compileActorPlan,
  makeRuntimeReceipt
} from './production-runtime.js';

export const PRODUCTION_COMPOSITION_SCHEMA = 'gummy.production-composition/v1';
export const COMPOSER_LANES = Object.freeze([
  Object.freeze({
    id: 'inputs',
    title: 'Inputs',
    prompt: 'What am I using?',
    description: 'Gummies, files, Browser captures, references, Shared Visions, and accepted prior results.'
  }),
  Object.freeze({
    id: 'people-tools',
    title: 'People & tools',
    prompt: 'Who or what works on it?',
    description: 'Human Actors, collaborators, service Actors, specialist apps, and compatible Places.'
  }),
  Object.freeze({
    id: 'steps-connections',
    title: 'Steps & connections',
    prompt: 'What happens next?',
    description: 'Typed Actor Plan and Work Order relationships, including visible optional branches.'
  }),
  Object.freeze({
    id: 'review-approval',
    title: 'Review & approval',
    prompt: 'What must I review?',
    description: 'Human decisions, Master Control gates, acceptance roles, and cost limits.'
  }),
  Object.freeze({
    id: 'destinations',
    title: 'Destinations',
    prompt: 'Where does the accepted result go?',
    description: 'Gummy Box, another Production, Radio, Channels, private export, or an approved Place.'
  })
]);

const clone = value => structuredClone(value);
const now = () => new Date().toISOString();
const uid = prefix => `${prefix}:${crypto.randomUUID()}`;
const laneIndex = lane => Math.max(0, COMPOSER_LANES.findIndex(item => item.id === lane));

function safeId(value) {
  return String(value).replace(/[^a-zA-Z0-9._-]/g, '-');
}

function compositionNode({
  ref,
  label,
  description = '',
  lane,
  order,
  optional = false,
  availability = { state: 'available', reason: 'Available in this browser.' }
}) {
  return {
    id: uid('composition-node'),
    ref: {
      kind: ref.kind,
      id: ref.id,
      revision: ref.revision == null ? null : String(ref.revision),
      hash: ref.hash || null
    },
    label,
    description,
    lane,
    position: {
      x: laneIndex(lane) * 280,
      y: order * 132,
      order
    },
    optional: Boolean(optional),
    availability: clone(availability)
  };
}

function canonicalSourceObjects(nodes) {
  const unique = new Map();
  for (const node of nodes) {
    if (!['gummy', 'shared-vision', 'production', 'composition'].includes(node.ref.kind)) continue;
    unique.set(node.ref.id, {
      id: node.ref.id,
      revision: node.ref.revision,
      hash: node.ref.hash
    });
  }
  return [...unique.values()];
}

function destinationPlans(nodes) {
  return nodes
    .filter(node => node.lane === 'destinations' || node.ref.kind === 'destination')
    .map(node => ({
      nodeId: node.id,
      type: node.ref.id.replace(/^destination:/, ''),
      status: node.availability.state === 'available' ? 'available' : 'blocked',
      distributionPlanId: null
    }));
}

function canonicalRecordExists(runtime, ref) {
  if (ref.kind === 'actor') return runtime.actors.some(item => item.id === ref.id);
  if (ref.kind === 'gummy') {
    if (runtime.gummies.some(item => item.id === ref.id)) return true;
    // Gummy Box is the authoritative store for many cross-surface objects. A versioned,
    // content-addressed reference remains a valid canonical link even when the Production
    // runtime does not mirror the object's full metadata.
    return Boolean(ref.revision && ref.hash);
  }
  if (ref.kind === 'production') return runtime.productions.some(item => item.id === ref.id);
  if (ref.kind === 'composition') return (runtime.compositions || []).some(item => item.id === ref.id);
  return true;
}

export function projectCompositionReadiness(composition, runtime) {
  const blockers = [];
  const warnings = [];
  const lanes = new Set(composition.nodes.map(node => node.lane));
  if (!lanes.has('inputs')) blockers.push('Add at least one visible input.');
  if (!lanes.has('people-tools')) blockers.push('Add at least one person or tool.');
  if (!lanes.has('review-approval')) blockers.push('Add a Human review or approval gate.');
  if (!lanes.has('destinations')) blockers.push('Choose at least one truthful destination.');
  for (const node of composition.nodes) {
    if (!canonicalRecordExists(runtime, node.ref)) blockers.push(`The linked ${node.ref.kind} no longer exists: ${node.ref.id}`);
    if (['blocked', 'unavailable'].includes(node.availability.state)) {
      blockers.push(`${node.label} is unavailable: ${node.availability.reason}`);
    } else if (node.availability.state === 'planned') {
      warnings.push(`${node.label} is planned and cannot execute until its connection is available.`);
    }
  }
  for (const edge of composition.edges) {
    if (!composition.nodes.some(node => node.id === edge.fromNodeId)) blockers.push(`Connection source is missing: ${edge.id}`);
    if (!composition.nodes.some(node => node.id === edge.toNodeId)) blockers.push(`Connection destination is missing: ${edge.id}`);
  }
  return {
    state: composition.productionId
      ? blockers.length ? 'blocked' : 'ready-to-apply'
      : 'draft',
    blockers: [...new Set(blockers)],
    warnings: [...new Set(warnings)]
  };
}

function refreshProjection(composition, runtime) {
  composition.sourceObjects = canonicalSourceObjects(composition.nodes);
  composition.destinationPlans = destinationPlans(composition.nodes);
  composition.readiness = projectCompositionReadiness(composition, runtime);
  return composition;
}

function bump(composition, runtime) {
  composition.revision = String(Number(composition.revision || 0) + 1);
  composition.updatedAt = now();
  composition.linkedActorPlan = null;
  composition.appliedAt = null;
  return refreshProjection(composition, runtime);
}

function defaultProductionNodes(runtime, productionId) {
  const production = runtime.productions.find(item => item.id === productionId);
  if (!production) return [];
  const nodes = [];
  for (const gummyId of production.gummyIds) {
    const gummy = runtime.gummies.find(item => item.id === gummyId);
    if (!gummy) continue;
    nodes.push(compositionNode({
      ref: {
        kind: 'gummy',
        id: gummy.id,
        revision: gummy.revision,
        hash: typeof gummy.hash === 'string' ? gummy.hash : gummy.hash?.value
      },
      label: gummy.name || gummy.title || gummy.id,
      description: gummy.kind === 'result' ? 'Accepted or candidate Production result.' : 'Source in the Local Gummy Box.',
      lane: 'inputs',
      order: nodes.filter(item => item.lane === 'inputs').length
    }));
  }
  const participants = runtime.participants.filter(item => (
    item.productionId === productionId && item.status !== 'removed'
  ));
  for (const participant of participants) {
    const actor = runtime.actors.find(item => item.id === participant.actorId);
    if (!actor) continue;
    nodes.push(compositionNode({
      ref: { kind: 'actor', id: actor.id },
      label: actor.name,
      description: actor.kind === 'service'
        ? actor.role || 'Service Actor available for Production configuration.'
        : 'Human-controlled participant.',
      lane: 'people-tools',
      order: nodes.filter(item => item.lane === 'people-tools').length,
      optional: Boolean(runtime.actorAppDescriptors.find(item => item.actorId === actor.id)?.optional)
    }));
  }
  nodes.push(compositionNode({
    ref: { kind: 'review-gate', id: 'review-gate:human-acceptance' },
    label: 'Human reviews the result',
    description: 'Completion is not acceptance. The Human chooses any accepted role.',
    lane: 'review-approval',
    order: 0
  }));
  nodes.push(compositionNode({
    ref: { kind: 'destination', id: 'destination:gummy-box' },
    label: 'Keep in Gummy Box',
    description: 'Preserve accepted results, Returns, and Receipts in the Local Gummy Box.',
    lane: 'destinations',
    order: 0
  }));
  return nodes;
}

function edgesFromActorPlan(runtime, productionId, nodes) {
  const plan = runtime.actorPlans.find(item => item.productionId === productionId);
  if (!plan) return [];
  const byActor = new Map(
    nodes
      .filter(node => node.ref.kind === 'actor')
      .map(node => [node.ref.id, node])
  );
  return plan.edges.flatMap(edge => {
    const fromPlanNode = plan.nodes.find(item => item.id === edge.fromNodeId);
    const toPlanNode = plan.nodes.find(item => item.id === edge.toNodeId);
    const from = byActor.get(fromPlanNode?.actorId);
    const to = byActor.get(toPlanNode?.actorId);
    if (!from || !to) return [];
    return [{
      id: uid('composition-edge'),
      fromNodeId: from.id,
      toNodeId: to.id,
      edgeType: edge.edgeType,
      dataClasses: clone(edge.dataClasses || []),
      approvalRule: edge.approvalRequired ? 'Master Control approval required' : 'Bounded by the compiled Actor Plan',
      optional: Boolean(edge.optional)
    }];
  });
}

export function createProductionComposition(runtime, {
  id = null,
  title = 'Untitled composition',
  ownerActorId = 'actor:hayden',
  productionId = null,
  source = productionId ? 'production' : 'blank'
} = {}) {
  const next = clone(runtime);
  next.compositions ||= [];
  const compositionId = id || (productionId
    ? `composition:${safeId(productionId.slice('production:'.length))}`
    : uid('composition'));
  const existing = next.compositions.find(item => item.id === compositionId);
  if (existing) return { runtime: next, composition: existing, created: false };
  const nodes = productionId ? defaultProductionNodes(next, productionId) : [];
  const timestamp = now();
  const composition = {
    schema: PRODUCTION_COMPOSITION_SCHEMA,
    id: compositionId,
    title,
    revision: '1',
    ownerActorId,
    productionId,
    nodes,
    edges: productionId ? edgesFromActorPlan(next, productionId, nodes) : [],
    sourceObjects: [],
    destinationPlans: [],
    readiness: { state: 'draft', blockers: [], warnings: [] },
    linkedActorPlan: null,
    provenance: {
      createdByActorId: ownerActorId,
      source,
      sourceCompositionId: null,
      compiler: 'gummy.composer/v1'
    },
    createdAt: timestamp,
    updatedAt: timestamp,
    appliedAt: null
  };
  refreshProjection(composition, next);
  next.compositions.push(composition);
  const receipt = makeRuntimeReceipt({
    action: 'production-composition.created',
    productionId: productionId || undefined,
    actorId: ownerActorId,
    outcome: 'completed',
    summary: `Created ${composition.title} as a Human-editable proposal. No work executed.`,
    resources: [composition.id, composition.revision]
  });
  next.receipts.push(receipt);
  return { runtime: next, composition, receipt, created: true };
}

export function replaceCompositionFromSnapshot(runtime, compositionId, snapshot, {
  action = 'production-composition.snapshot-restored',
  summary = 'Restored a prior visible composition proposal. No work executed.'
} = {}) {
  const next = clone(runtime);
  const index = next.compositions.findIndex(item => item.id === compositionId);
  if (index < 0) return { runtime: next, denied: true, reason: 'composition-not-found' };
  const restored = clone(snapshot);
  restored.revision = String(Number(next.compositions[index].revision || 0) + 1);
  restored.updatedAt = now();
  restored.linkedActorPlan = null;
  restored.appliedAt = null;
  refreshProjection(restored, next);
  next.compositions[index] = restored;
  const receipt = makeRuntimeReceipt({
    action,
    productionId: restored.productionId || undefined,
    actorId: restored.ownerActorId,
    outcome: 'completed',
    summary,
    resources: [restored.id, restored.revision]
  });
  next.receipts.push(receipt);
  return { runtime: next, composition: restored, receipt };
}

export function renameProductionComposition(runtime, compositionId, title) {
  const next = clone(runtime);
  const composition = next.compositions.find(item => item.id === compositionId);
  if (!composition) return { runtime: next, denied: true, reason: 'composition-not-found' };
  composition.title = String(title || '').trim() || 'Untitled composition';
  bump(composition, next);
  return { runtime: next, composition };
}

export function bindCompositionToProduction(runtime, compositionId, productionId) {
  const next = clone(runtime);
  const composition = next.compositions.find(item => item.id === compositionId);
  const production = next.productions.find(item => item.id === productionId);
  if (!composition || !production) return { runtime: next, denied: true, reason: 'composition-or-production-not-found' };
  composition.productionId = productionId;
  composition.provenance = {
    ...composition.provenance,
    source: composition.provenance.source === 'blank' ? 'production' : composition.provenance.source
  };
  bump(composition, next);
  return { runtime: next, composition };
}

export function addCompositionNode(runtime, compositionId, input) {
  const next = clone(runtime);
  const composition = next.compositions.find(item => item.id === compositionId);
  if (!composition) return { runtime: next, denied: true, reason: 'composition-not-found' };
  const duplicate = composition.nodes.find(item => item.ref.kind === input.ref.kind && item.ref.id === input.ref.id);
  if (duplicate) return { runtime: next, composition, node: duplicate, created: false };
  const node = compositionNode({
    ...input,
    order: composition.nodes.filter(item => item.lane === input.lane).length
  });
  if (input.sourceIntentId) node.sourceIntentId = input.sourceIntentId;
  composition.nodes.push(node);
  bump(composition, next);
  return { runtime: next, composition, node, created: true };
}

export function removeCompositionNode(runtime, compositionId, nodeId) {
  const next = clone(runtime);
  const composition = next.compositions.find(item => item.id === compositionId);
  if (!composition) return { runtime: next, denied: true, reason: 'composition-not-found' };
  const before = composition.nodes.length;
  composition.nodes = composition.nodes.filter(item => item.id !== nodeId);
  composition.edges = composition.edges.filter(edge => edge.fromNodeId !== nodeId && edge.toNodeId !== nodeId);
  if (composition.nodes.length === before) return { runtime: next, denied: true, reason: 'composition-node-not-found' };
  bump(composition, next);
  return { runtime: next, composition };
}

export function moveCompositionNodeToLane(runtime, compositionId, nodeId, lane) {
  const next = clone(runtime);
  const composition = next.compositions.find(item => item.id === compositionId);
  const node = composition?.nodes.find(item => item.id === nodeId);
  if (!composition || !node || !COMPOSER_LANES.some(item => item.id === lane)) {
    return { runtime: next, denied: true, reason: 'composition-node-or-lane-not-found' };
  }
  node.lane = lane;
  node.position.x = laneIndex(lane) * 280;
  node.position.order = composition.nodes.filter(item => item.lane === lane && item.id !== nodeId).length;
  node.position.y = node.position.order * 132;
  bump(composition, next);
  return { runtime: next, composition, node };
}

export function moveCompositionNode(runtime, compositionId, nodeId, direction) {
  const next = clone(runtime);
  const composition = next.compositions.find(item => item.id === compositionId);
  const node = composition?.nodes.find(item => item.id === nodeId);
  if (!composition || !node) return { runtime: next, denied: true, reason: 'composition-node-not-found' };
  const laneNodes = composition.nodes
    .filter(item => item.lane === node.lane)
    .sort((left, right) => left.position.order - right.position.order);
  const index = laneNodes.findIndex(item => item.id === nodeId);
  const targetIndex = direction === 'before' ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || targetIndex >= laneNodes.length) return { runtime: next, composition, node };
  [laneNodes[index], laneNodes[targetIndex]] = [laneNodes[targetIndex], laneNodes[index]];
  laneNodes.forEach((item, order) => {
    const current = composition.nodes.find(candidate => candidate.id === item.id);
    current.position.order = order;
    current.position.y = order * 132;
  });
  bump(composition, next);
  return { runtime: next, composition, node: composition.nodes.find(item => item.id === nodeId) };
}

export function duplicateCompositionNode(runtime, compositionId, nodeId) {
  const next = clone(runtime);
  const composition = next.compositions.find(item => item.id === compositionId);
  const source = composition?.nodes.find(item => item.id === nodeId);
  if (!composition || !source) return { runtime: next, denied: true, reason: 'composition-node-not-found' };
  const node = clone(source);
  node.id = uid('composition-node');
  node.ref = {
    ...node.ref,
    id: node.ref.kind === 'destination' || node.ref.kind === 'review-gate'
      ? `${node.ref.id}:copy:${node.id.split(':').at(-1)}`
      : node.ref.id
  };
  node.label = `${source.label} copy`;
  node.position.order = composition.nodes.filter(item => item.lane === source.lane).length;
  node.position.y = node.position.order * 132;
  composition.nodes.push(node);
  bump(composition, next);
  return { runtime: next, composition, node };
}

export function connectCompositionNodes(runtime, compositionId, {
  fromNodeId,
  toNodeId,
  edgeType = 'context',
  dataClasses = [],
  approvalRule = 'Human review required',
  optional = false,
  sourceIntentId = null
}) {
  const next = clone(runtime);
  const composition = next.compositions.find(item => item.id === compositionId);
  const from = composition?.nodes.find(item => item.id === fromNodeId);
  const to = composition?.nodes.find(item => item.id === toNodeId);
  if (!composition || !from || !to || fromNodeId === toNodeId) return { runtime: next, denied: true, reason: 'composition-connection-invalid' };
  const duplicate = composition.edges.find(item => item.fromNodeId === fromNodeId && item.toNodeId === toNodeId && item.edgeType === edgeType);
  if (duplicate) return { runtime: next, composition, edge: duplicate, created: false };
  const edge = {
    id: uid('composition-edge'),
    fromNodeId,
    toNodeId,
    edgeType,
    dataClasses: [...new Set(dataClasses)],
    approvalRule,
    optional: Boolean(optional),
    ...(sourceIntentId ? { sourceIntentId } : {})
  };
  composition.edges.push(edge);
  bump(composition, next);
  return { runtime: next, composition, edge, created: true };
}

export function disconnectCompositionEdge(runtime, compositionId, edgeId) {
  const next = clone(runtime);
  const composition = next.compositions.find(item => item.id === compositionId);
  if (!composition) return { runtime: next, denied: true, reason: 'composition-not-found' };
  const before = composition.edges.length;
  composition.edges = composition.edges.filter(item => item.id !== edgeId);
  if (before === composition.edges.length) return { runtime: next, denied: true, reason: 'composition-edge-not-found' };
  bump(composition, next);
  return { runtime: next, composition };
}

export function toggleCompositionBranch(runtime, compositionId, edgeId) {
  const next = clone(runtime);
  const composition = next.compositions.find(item => item.id === compositionId);
  const edge = composition?.edges.find(item => item.id === edgeId);
  if (!composition || !edge) return { runtime: next, denied: true, reason: 'composition-edge-not-found' };
  edge.optional = !edge.optional;
  bump(composition, next);
  return { runtime: next, composition, edge };
}

export function duplicateProductionComposition(runtime, compositionId, {
  title = null
} = {}) {
  const next = clone(runtime);
  const source = next.compositions.find(item => item.id === compositionId);
  if (!source) return { runtime: next, denied: true, reason: 'composition-not-found' };
  const copy = clone(source);
  copy.id = uid('composition');
  copy.title = title || `${source.title} copy`;
  copy.revision = '1';
  copy.productionId = null;
  copy.linkedActorPlan = null;
  copy.appliedAt = null;
  copy.provenance = {
    ...copy.provenance,
    source: 'duplicate',
    sourceCompositionId: source.id
  };
  copy.nodes = source.nodes.map(node => ({
    ...clone(node),
    id: uid('composition-node')
  }));
  const nodeMap = new Map(source.nodes.map((node, index) => [node.id, copy.nodes[index].id]));
  copy.edges = source.edges.map(edge => ({
    ...clone(edge),
    id: uid('composition-edge'),
    fromNodeId: nodeMap.get(edge.fromNodeId),
    toNodeId: nodeMap.get(edge.toNodeId)
  }));
  const timestamp = now();
  copy.createdAt = timestamp;
  copy.updatedAt = timestamp;
  refreshProjection(copy, next);
  next.compositions.push(copy);
  const receipt = makeRuntimeReceipt({
    action: 'production-composition.duplicated',
    actorId: copy.ownerActorId,
    outcome: 'completed',
    summary: `Duplicated ${source.title} as a new private composition. No work executed.`,
    resources: [source.id, copy.id]
  });
  next.receipts.push(receipt);
  return { runtime: next, composition: copy, receipt };
}

export function applyProductionComposition(runtime, compositionId) {
  let next = clone(runtime);
  let composition = next.compositions.find(item => item.id === compositionId);
  if (!composition) return { runtime: next, denied: true, reason: 'composition-not-found' };
  composition.readiness = projectCompositionReadiness(composition, next);
  if (!composition.productionId) return { runtime: next, denied: true, reason: 'composition-not-bound-to-production' };
  if (composition.readiness.blockers.length) {
    return { runtime: next, denied: true, reason: composition.readiness.blockers.join(' ') };
  }
  const beforeInventory = executionInventory(next);
  const production = next.productions.find(item => item.id === composition.productionId);
  const desiredActorIds = composition.nodes
    .filter(node => node.ref.kind === 'actor')
    .map(node => node.ref.id);
  for (const actorId of desiredActorIds) {
    const added = addActorToProduction(next, production.id, actorId, 'composer');
    if (!added.denied) next = added.runtime;
  }
  const compiled = compileActorPlan(next, production.id);
  if (compiled.denied) return compiled;
  next = compiled.runtime;
  composition = next.compositions.find(item => item.id === compositionId);
  composition.linkedActorPlan = {
    id: compiled.plan.id,
    revision: compiled.plan.revision
  };
  composition.appliedAt = now();
  composition.readiness = projectCompositionReadiness(composition, next);
  const receipt = makeRuntimeReceipt({
    action: 'production-composition.applied',
    productionId: production.id,
    actorId: composition.ownerActorId,
    outcome: 'completed',
    summary: `Applied ${composition.title} as a proposal to ${production.title}. The editable Actor Plan changed; no Production Run started.`,
    resources: [composition.id, composition.revision, compiled.plan.id, compiled.plan.revision]
  });
  next.receipts.push(receipt);
  const afterInventory = executionInventory(next);
  return {
    runtime: next,
    composition,
    plan: compiled.plan,
    receipt,
    executionInventoryUnchanged: JSON.stringify(beforeInventory) === JSON.stringify(afterInventory)
  };
}

export function ensureProductionComposition(runtime, productionId) {
  const existing = (runtime.compositions || []).find(item => item.productionId === productionId);
  if (existing) return { runtime: clone(runtime), composition: clone(existing), created: false };
  return createProductionComposition(runtime, { productionId, title: `${runtime.productions.find(item => item.id === productionId)?.title || 'Production'} composition` });
}

function executionInventory(runtime) {
  return {
    runs: runtime.productionRuns.length,
    workOrders: runtime.workOrders.length,
    leases: runtime.taskLeases.length,
    grants: runtime.grants.length,
    returns: runtime.returns.length,
    acceptedResults: runtime.gummies.filter(item => item.acceptance).length,
    releasedDistributions: (runtime.distributionPlans || []).filter(item => item.status === 'released' || item.status === 'published').length
  };
}
