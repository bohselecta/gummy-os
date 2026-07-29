export * from './production-composition-market-base.js';

import {
  addCompositionReference as addCompositionReferenceBase,
  addRecommendedCompositionElement as addRecommendedCompositionElementBase,
  applyCompositionStarter as applyCompositionStarterBase,
  updateProductionCompositionBrief
} from './production-composition-market-base.js';
import {
  applyDragIntent,
  createDragIntent,
  makeRuntimeReceipt
} from './production-runtime.js';

const clone = value => structuredClone(value);

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

  const next = clone(result.runtime);
  const current = composition(next, result.composition.id);
  const receipt = makeRuntimeReceipt({
    action: 'production-composition.starter-applied',
    productionId: current.productionId || undefined,
    actorId: current.ownerActorId,
    outcome: 'completed',
    summary: `Applied optional Composer pattern ${options.starterId}. The Human brief was preserved; no Run, Work Order, Lease, Grant, provider call, charge, acceptance, or publication was created.`,
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
  inputMode = 'keyboard'
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

export function addRecommendedCompositionElement(runtime, compositionId, recommendationId) {
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
