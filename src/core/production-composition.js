export * from './production-composition-market-base.js';

import {
  applyCompositionStarter as applyCompositionStarterBase,
  updateProductionCompositionBrief
} from './production-composition-market-base.js';
import { makeRuntimeReceipt } from './production-runtime.js';

const clone = value => structuredClone(value);

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
  const composition = next.compositions.find(item => item.id === result.composition.id);
  const receipt = makeRuntimeReceipt({
    action: 'production-composition.starter-applied',
    productionId: composition.productionId || undefined,
    actorId: composition.ownerActorId,
    outcome: 'completed',
    summary: `Applied optional Composer pattern ${options.starterId}. The Human brief was preserved; no Run, Work Order, Lease, Grant, provider call, charge, acceptance, or publication was created.`,
    resources: [composition.id, composition.revision, `starter:${options.starterId}`],
    runtimeClass: 'browser',
    locality: 'local',
    cost: { currency: 'USD', amount: 0 }
  });
  next.receipts.push(receipt);
  return {
    ...result,
    runtime: next,
    composition: next.compositions.find(item => item.id === composition.id),
    receipt,
    executed: false
  };
}
