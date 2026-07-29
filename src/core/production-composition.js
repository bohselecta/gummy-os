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
  if (ref.kind === 'gummy') return runtime.gummies.some(item => item.id === ref.id);
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
  next.receipts.push(makeRuntimeReceipt({
    action: 'production-composition.created',
    productionId: productionId || undefined,
    actorId: ownerActorId,
    outcome: 'completed',
    summary: `Created ${composition.title} as an editable visual proposal. No Run, Lease, Grant, provider call, charge, publication, or accepted result was created.`,
    resources: [composition.id]
  }));
  return { runtime: next, composition, created: true };
}

export function ensureProductionComposition(runtime, productionId) {
  const existing = (runtime.compositions || []).find(item => item.productionId === productionId);
  if (existing) return { runtime, composition: existing, created: false };
  const production = runtime.productions.find(item => item.id === productionId);
  return createProductionComposition(runtime, {
    id: `composition:${safeId(productionId.slice('production:'.length))}`,
    title: `${production?.title || 'Production'} composition`,
    productionId,
    source: 'production'
  });
}

function mutateComposition(runtime, compositionId, mutator) {
  const next = clone(runtime);
  next.compositions ||= [];
  const composition = next.compositions.find(item => item.id === compositionId);
  if (!composition) return { runtime, denied: true, reason: 'composition-not-found' };
  mutator(composition, next);
  bump(composition, next);
  return { runtime: next, composition, executed: false };
}

export function renameProductionComposition(runtime, compositionId, title) {
  return mutateComposition(runtime, compositionId, composition => {
    const value = String(title || '').trim();
    if (value) composition.title = value;
  });
}

export function addCompositionNode(runtime, compositionId, values) {
  return mutateComposition(runtime, compositionId, (composition) => {
    const order = composition.nodes.filter(node => node.lane === values.lane).length;
    composition.nodes.push(compositionNode({ ...values, order }));
  });
}

export function removeCompositionNode(runtime, compositionId, nodeId) {
  return mutateComposition(runtime, compositionId, composition => {
    composition.nodes = composition.nodes.filter(node => node.id !== nodeId);
    composition.edges = composition.edges.filter(edge => edge.fromNodeId !== nodeId && edge.toNodeId !== nodeId);
  });
}

export function duplicateCompositionNode(runtime, compositionId, nodeId) {
  return mutateComposition(runtime, compositionId, composition => {
    const source = composition.nodes.find(node => node.id === nodeId);
    if (!source) return;
    const copy = clone(source);
    copy.id = uid('composition-node');
    copy.label = `${copy.label} copy`;
    copy.position.order = composition.nodes.filter(node => node.lane === copy.lane).length;
    copy.position.y = copy.position.order * 132;
    composition.nodes.push(copy);
  });
}

export function moveCompositionNode(runtime, compositionId, nodeId, direction) {
  return mutateComposition(runtime, compositionId, composition => {
    const node = composition.nodes.find(item => item.id === nodeId);
    if (!node) return;
    const laneNodes = composition.nodes
      .filter(item => item.lane === node.lane)
      .sort((left, right) => left.position.order - right.position.order);
    const index = laneNodes.findIndex(item => item.id === nodeId);
    const targetIndex = Math.max(0, Math.min(laneNodes.length - 1, index + (direction === 'before' ? -1 : 1)));
    if (targetIndex === index) return;
    [laneNodes[index], laneNodes[targetIndex]] = [laneNodes[targetIndex], laneNodes[index]];
    laneNodes.forEach((item, order) => {
      item.position.order = order;
      item.position.y = order * 132;
    });
  });
}

export function moveCompositionNodeToLane(runtime, compositionId, nodeId, lane, order = null) {
  if (!COMPOSER_LANES.some(item => item.id === lane)) {
    return { runtime, denied: true, reason: 'composition-lane-not-found' };
  }
  return mutateComposition(runtime, compositionId, composition => {
    const node = composition.nodes.find(item => item.id === nodeId);
    if (!node) return;
    node.lane = lane;
    const laneNodes = composition.nodes
      .filter(item => item.lane === lane && item.id !== nodeId)
      .sort((left, right) => left.position.order - right.position.order);
    const targetOrder = order == null
      ? laneNodes.length
      : Math.max(0, Math.min(laneNodes.length, Number(order)));
    laneNodes.splice(targetOrder, 0, node);
    laneNodes.forEach((item, index) => {
      item.position.x = laneIndex(lane) * 280;
      item.position.y = index * 132;
      item.position.order = index;
    });
  });
}

export function connectCompositionNodes(runtime, compositionId, {
  fromNodeId,
  toNodeId,
  edgeType = 'execution',
  dataClasses = ['typed-production-handoff'],
  approvalRule = 'Master Control approval required',
  optional = false,
  sourceIntentId = null
}) {
  return mutateComposition(runtime, compositionId, composition => {
    if (fromNodeId === toNodeId) return;
    if (!composition.nodes.some(node => node.id === fromNodeId) || !composition.nodes.some(node => node.id === toNodeId)) return;
    const duplicate = composition.edges.some(edge => (
      edge.fromNodeId === fromNodeId && edge.toNodeId === toNodeId && edge.edgeType === edgeType
    ));
    if (duplicate) return;
    composition.edges.push({
      id: uid('composition-edge'),
      fromNodeId,
      toNodeId,
      edgeType,
      dataClasses: clone(dataClasses),
      approvalRule,
      optional: Boolean(optional),
      ...(sourceIntentId ? { sourceIntentId } : {})
    });
  });
}

export function disconnectCompositionEdge(runtime, compositionId, edgeId) {
  return mutateComposition(runtime, compositionId, composition => {
    composition.edges = composition.edges.filter(edge => edge.id !== edgeId);
  });
}

export function toggleCompositionBranch(runtime, compositionId, edgeId) {
  return mutateComposition(runtime, compositionId, composition => {
    const edge = composition.edges.find(item => item.id === edgeId);
    if (edge) edge.optional = !edge.optional;
  });
}

export function replaceCompositionFromSnapshot(runtime, compositionId, snapshot) {
  const next = clone(runtime);
  const index = (next.compositions || []).findIndex(item => item.id === compositionId);
  if (index < 0) return { runtime, denied: true, reason: 'composition-not-found' };
  const restored = clone(snapshot);
  restored.id = compositionId;
  restored.revision = String(Number(next.compositions[index].revision || 0) + 1);
  restored.updatedAt = now();
  restored.linkedActorPlan = null;
  restored.appliedAt = null;
  refreshProjection(restored, next);
  next.compositions[index] = restored;
  return { runtime: next, composition: restored, executed: false };
}

export function duplicateProductionComposition(runtime, compositionId) {
  const next = clone(runtime);
  const source = (next.compositions || []).find(item => item.id === compositionId);
  if (!source) return { runtime, denied: true, reason: 'composition-not-found' };
  const duplicate = clone(source);
  duplicate.id = uid('composition');
  duplicate.title = `${source.title} copy`;
  duplicate.revision = '1';
  duplicate.productionId = null;
  duplicate.linkedActorPlan = null;
  duplicate.appliedAt = null;
  duplicate.createdAt = now();
  duplicate.updatedAt = duplicate.createdAt;
  duplicate.nodes = duplicate.nodes.map(node => ({ ...node, id: uid('composition-node') }));
  const nodeIds = new Map(source.nodes.map((node, index) => [node.id, duplicate.nodes[index].id]));
  duplicate.edges = duplicate.edges.map(edge => ({
    ...edge,
    id: uid('composition-edge'),
    fromNodeId: nodeIds.get(edge.fromNodeId),
    toNodeId: nodeIds.get(edge.toNodeId)
  }));
  duplicate.provenance = {
    createdByActorId: source.ownerActorId,
    source: 'duplicate',
    sourceCompositionId: source.id,
    compiler: 'gummy.composer/v1'
  };
  refreshProjection(duplicate, next);
  next.compositions.push(duplicate);
  next.receipts.push(makeRuntimeReceipt({
    action: 'production-composition.duplicated',
    actorId: source.ownerActorId,
    outcome: 'completed',
    summary: `Duplicated ${source.id}@${source.revision} into an independent editable composition. No work executed.`,
    resources: [source.id, duplicate.id]
  }));
  return { runtime: next, composition: duplicate, executed: false };
}

export function bindCompositionToProduction(runtime, compositionId, productionId) {
  return mutateComposition(runtime, compositionId, composition => {
    composition.productionId = productionId;
    composition.provenance.boundProductionAt = now();
  });
}

export function applyProductionComposition(runtime, compositionId) {
  let working = clone(runtime);
  const composition = (working.compositions || []).find(item => item.id === compositionId);
  if (!composition) return { runtime, denied: true, reason: 'composition-not-found', executed: false };
  const production = working.productions.find(item => item.id === composition.productionId);
  if (!production) return { runtime, denied: true, reason: 'bound-production-required', executed: false };
  const before = {
    runs: working.productionRuns.length,
    workOrders: working.workOrders.length,
    taskLeases: working.taskLeases.length,
    grants: working.grants.length,
    returns: working.returns.length,
    accepted: working.gummies.filter(item => item.status === 'accepted').length,
    executionTraces: (working.executionTraces || []).length,
    distributionPlans: (working.distributionPlans || []).length,
    masterControlDecisions: (working.masterControlDecisions || []).length
  };

  for (const node of composition.nodes.filter(item => item.ref.kind === 'actor')) {
    const added = addActorToProduction(working, production.id, node.ref.id, 'composition');
    working = added.runtime;
  }
  const editableProduction = working.productions.find(item => item.id === production.id);
  for (const node of composition.nodes.filter(item => item.ref.kind === 'gummy')) {
    if (!editableProduction.gummyIds.includes(node.ref.id)) editableProduction.gummyIds.push(node.ref.id);
  }
  for (const configuration of working.configurations.filter(item => (
    item.productionId === production.id
    && composition.nodes.some(node => node.ref.kind === 'actor' && node.ref.id === item.actorId)
  ))) {
    configuration.compositionProposal = {
      compositionId: composition.id,
      compositionRevision: composition.revision,
      appliedByActorId: composition.ownerActorId,
      startsExecution: false
    };
    configuration.revision = String(Number(configuration.revision || 0) + 1);
    configuration.updatedAt = now();
  }

  const compiled = compileActorPlan(working, production.id);
  working = compiled.runtime;
  const plan = compiled.plan;
  const liveComposition = working.compositions.find(item => item.id === composition.id);
  const compositionNodes = new Map(liveComposition.nodes.map(node => [node.id, node]));
  for (const edge of liveComposition.edges) {
    const fromRef = compositionNodes.get(edge.fromNodeId)?.ref;
    const toRef = compositionNodes.get(edge.toNodeId)?.ref;
    if (fromRef?.kind !== 'actor' || toRef?.kind !== 'actor') continue;
    const fromPlanNode = plan.nodes.find(item => item.actorId === fromRef.id);
    const toPlanNode = plan.nodes.find(item => item.actorId === toRef.id);
    if (!fromPlanNode || !toPlanNode) continue;
    const duplicate = plan.edges.some(item => (
      item.fromNodeId === fromPlanNode.id
      && item.toNodeId === toPlanNode.id
      && item.edgeType === edge.edgeType
    ));
    if (duplicate) continue;
    plan.edges.push({
      schema: 'gummy.actor-plan-edge/v0',
      id: `plan-edge:${safeId(production.id)}:${safeId(edge.id)}`,
      fromNodeId: fromPlanNode.id,
      toNodeId: toPlanNode.id,
      edgeType: edge.edgeType,
      dataClasses: clone(edge.dataClasses),
      optional: edge.optional,
      approvalRequired: edge.approvalRule !== 'No additional approval',
      sourceCompositionId: liveComposition.id,
      sourceCompositionEdgeId: edge.id
    });
  }
  liveComposition.linkedActorPlan = { id: plan.id, revision: plan.revision };
  liveComposition.appliedAt = now();
  liveComposition.updatedAt = liveComposition.appliedAt;
  liveComposition.readiness = {
    ...projectCompositionReadiness(liveComposition, working),
    state: 'applied'
  };
  working.receipts.push(makeRuntimeReceipt({
    action: 'production-composition.applied-as-proposal',
    productionId: production.id,
    actorId: liveComposition.ownerActorId,
    outcome: 'completed',
    summary: `Applied ${liveComposition.id}@${liveComposition.revision} to typed Production configuration and Actor Plan ${plan.id}@${plan.revision}. No execution records or accepted results were created.`,
    resources: [liveComposition.id, plan.id]
  }));

  const after = {
    runs: working.productionRuns.length,
    workOrders: working.workOrders.length,
    taskLeases: working.taskLeases.length,
    grants: working.grants.length,
    returns: working.returns.length,
    accepted: working.gummies.filter(item => item.status === 'accepted').length,
    executionTraces: (working.executionTraces || []).length,
    distributionPlans: (working.distributionPlans || []).length,
    masterControlDecisions: (working.masterControlDecisions || []).length
  };
  return {
    runtime: working,
    composition: liveComposition,
    plan,
    executed: false,
    executionInventoryUnchanged: JSON.stringify(before) === JSON.stringify(after),
    before,
    after
  };
}
