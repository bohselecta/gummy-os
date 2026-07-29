export * from './production-composition-market-base.js';

import {
  COMPOSITION_STARTERS as BASE_COMPOSITION_STARTERS,
  addCompositionReference as addCompositionReferenceBase,
  addRecommendedCompositionElement as addRecommendedCompositionElementBase,
  applyCompositionStarter as applyCompositionStarterBase,
  updateProductionCompositionBrief
} from './production-composition-market-base.js';
import {
  connectCompositionNodes,
  disconnectCompositionEdge
} from './production-composition-base.js';
import {
  applyDragIntent,
  createDragIntent,
  makeRuntimeReceipt
} from './production-runtime.js';

const clone = value => structuredClone(value);

export const COMPOSITION_STARTERS = Object.freeze(BASE_COMPOSITION_STARTERS.map(starter => Object.freeze(
  starter.id === 'research-brief'
    ? {
        ...starter,
        description: 'Use a selected source, the Human Actor, explicit review, and the Gummy Box to shape a bounded private brief.'
      }
    : starter
)));

function composition(runtime, compositionId) {
  return (runtime.compositions || []).find(item => item.id === compositionId) || null;
}

function referenceLane(reference) {
  return reference.lane || ({
    gummy: 'inputs',
    production: 'inputs',
    'shared-vision': 'inputs',
    actor: 'people-tools',
    place: 'people-tools',
    'review-gate': 'review-approval',
    destination: 'destinations'
  }[reference.kind] || 'steps-connections');
}

function ensureHumanActorInEmptyPattern(runtime, compositionId) {
  let current = composition(runtime, compositionId);
  if (!current || current.nodes.some(node => node.lane === 'people-tools')) {
    return { runtime, composition: current };
  }
  const human = (runtime.actors || []).find(actor => actor.id === current.ownerActorId)
    || (runtime.actors || []).find(actor => actor.kind === 'person');
  if (!human) return { runtime, composition: current };

  const added = addCompositionReferenceBase(runtime, compositionId, {
    kind: 'actor',
    id: human.id,
    label: human.name || 'Human owner',
    description: 'The Human Actor owns the goal, choices, approval, and acceptance. A companion Agent may help only under explicit authority.',
    lane: 'people-tools',
    availability: { state: 'available', reason: 'The Human owner is present in this local workspace.' }
  });
  if (added.denied) return added;
  let working = added.runtime;
  current = composition(working, compositionId);
  const humanNode = current.nodes.find(node => node.ref.kind === 'actor' && node.ref.id === human.id);
  const sourceNode = current.nodes.find(node => node.lane === 'inputs');
  const reviewNode = current.nodes.find(node => node.lane === 'review-approval');
  const direct = current.edges.find(edge => edge.fromNodeId === sourceNode?.id && edge.toNodeId === reviewNode?.id);
  if (direct) {
    const disconnected = disconnectCompositionEdge(working, compositionId, direct.id);
    if (!disconnected.denied) working = disconnected.runtime;
  }
  if (sourceNode && humanNode) {
    const connected = connectCompositionNodes(working, compositionId, {
      fromNodeId: sourceNode.id,
      toNodeId: humanNode.id,
      edgeType: 'context',
      dataClasses: ['starter-pattern', 'human-owned-context'],
      approvalRule: 'The Human chooses what context may be used.',
      optional: false
    });
    if (!connected.denied) working = connected.runtime;
  }
  current = composition(working, compositionId);
  const refreshedHuman = current.nodes.find(node => node.ref.kind === 'actor' && node.ref.id === human.id);
  const refreshedReview = current.nodes.find(node => node.lane === 'review-approval');
  if (refreshedHuman && refreshedReview) {
    const connected = connectCompositionNodes(working, compositionId, {
      fromNodeId: refreshedHuman.id,
      toNodeId: refreshedReview.id,
      edgeType: 'review',
      dataClasses: ['human-decision'],
      approvalRule: 'Completion requires a separate Human acceptance decision.',
      optional: false
    });
    if (!connected.denied) working = connected.runtime;
  }
  return { runtime: working, composition: composition(working, compositionId) };
}

/**
 * Apply an optional starting pattern without letting the pattern replace the Human's existing brief.
 * The change remains non-executing, but it leaves a Receipt because it materially revises the visible proposal.
 */
export function applyCompositionStarter(runtime, options) {
  const before = options.compositionId
    ? (runtime.compositions || []).find(item => item.id === options.compositionId)
    : null;
  const humanBrief = before?.brief ? clone(before.brief) : null;
  let result = applyCompositionStarterBase(runtime, options);
  if (result.denied) return result;

  if (humanBrief) {
    const starterBrief = result.composition.brief || {};
    const restored = updateProductionCompositionBrief(result.runtime, result.composition.id, {
      goal: humanBrief.goal || starterBrief.goal,
      audience: humanBrief.audience || starterBrief.audience,
      successCriteria: humanBrief.successCriteria || starterBrief.successCriteria,
      constraints: humanBrief.constraints || starterBrief.constraints,
      starterId: starterBrief.starterId || humanBrief.starterId || null
    });
    if (!restored.denied) {
      result = {
        ...result,
        runtime: restored.runtime,
        composition: restored.composition
      };
    }
  }

  const humanCentered = ensureHumanActorInEmptyPattern(result.runtime, result.composition.id);
  if (!humanCentered.denied) {
    result = {
      ...result,
      runtime: humanCentered.runtime,
      composition: humanCentered.composition
    };
  }

  const next = clone(result.runtime);
  const current = composition(next, result.composition.id);
  const receipt = makeRuntimeReceipt({
    action: 'production-composition.starter-applied',
    productionId: current.productionId || undefined,
    actorId: current.ownerActorId,
    outcome: 'completed',
    summary: `Applied optional Composer pattern ${options.starterId}. The Human brief and canonical Actor identity were preserved; no Run, Work Order, Lease, Grant, provider call, charge, acceptance, or publication was created.`,
    resources: [current.id, current.revision, `starter:${options.starterId}`],
    runtimeClass: 'browser',
    locality: 'local',
    cost: { currency: 'USD', amount: 0 }
  });
  next.receipts.push(receipt);
  return {
    ...result,
    runtime: next,
    composition: composition(next, current.id),
    receipt,
    executed: false
  };
}

/**
 * Move a canonical object from another Gummy surface into Composer through the same typed,
 * Human-approved, non-executing intent law used by pointer/keyboard/touch canvas proposals.
 */
export function addCompositionReferenceWithIntent(runtime, compositionId, reference, {
  inputMode = reference.inputMode || 'keyboard'
} = {}) {
  const current = composition(runtime, compositionId);
  if (!current) return { runtime, denied: true, reason: 'composition-not-found' };
  const lane = referenceLane(reference);
  const proposed = createDragIntent(runtime, {
    productionId: current.productionId || undefined,
    sourceKind: reference.kind,
    sourceId: reference.id,
    targetKind: 'lane',
    targetId: lane,
    action: 'composition-add',
    dataClasses: ['canonical-reference', reference.kind, lane],
    approvalRequired: true,
    inputMode
  });
  const accepted = applyDragIntent(proposed.runtime, proposed.intent.id);
  if (accepted.denied) return accepted;
  const added = addCompositionReferenceBase(accepted.runtime, compositionId, {
    ...reference,
    lane
  });
  if (added.denied) return added;
  return {
    ...added,
    intent: accepted.intent,
    executed: false
  };
}

/**
 * Compatibility export: callers that add a canonical reference automatically receive the typed,
 * receipted, non-executing path instead of a silent mutation.
 */
export function addCompositionReference(runtime, compositionId, reference) {
  return addCompositionReferenceWithIntent(runtime, compositionId, reference, {
    inputMode: reference.inputMode || 'keyboard'
  });
}

export function addRecommendedCompositionElement(runtime, compositionId, recommendationId) {
  if (recommendationId === 'add-person') {
    const current = composition(runtime, compositionId);
    const human = (runtime.actors || []).find(actor => actor.id === current?.ownerActorId)
      || (runtime.actors || []).find(actor => actor.kind === 'person');
    if (!human) return { runtime, denied: true, reason: 'human-actor-not-found' };
    return addCompositionReferenceWithIntent(runtime, compositionId, {
      kind: 'actor',
      id: human.id,
      label: human.name || 'Human owner',
      description: 'The Human Actor owns the goal, choices, approval, and acceptance.',
      lane: 'people-tools',
      availability: { state: 'available', reason: 'The Human owner is present in this local workspace.' }
    });
  }
  const result = addRecommendedCompositionElementBase(runtime, compositionId, recommendationId);
  if (result.denied) return result;
  const next = clone(result.runtime);
  const current = composition(next, compositionId);
  const receipt = makeRuntimeReceipt({
    action: 'production-composition.recommendation-added',
    productionId: current.productionId || undefined,
    actorId: current.ownerActorId,
    outcome: 'completed',
    summary: `The Human added optional Composer recommendation ${recommendationId}. No work executed and no authority was granted.`,
    resources: [current.id, current.revision, `recommendation:${recommendationId}`],
    runtimeClass: 'browser',
    locality: 'local',
    cost: { currency: 'USD', amount: 0 }
  });
  next.receipts.push(receipt);
  return {
    ...result,
    runtime: next,
    composition: composition(next, compositionId),
    receipt,
    executed: false
  };
}
