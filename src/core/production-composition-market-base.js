export * from './production-composition-base.js';

import {
  addCompositionNode,
  connectCompositionNodes,
  createProductionComposition,
  replaceCompositionFromSnapshot
} from './production-composition-base.js';

const clone = value => structuredClone(value);
const nonExecuting = result => ({ ...result, executed: false });

export const COMPOSITION_STARTERS = Object.freeze([
  Object.freeze({
    id: 'research-brief',
    title: 'Research and make a brief',
    description: 'Use a source, Glopper, Human review, and the Gummy Box to create a bounded private result.',
    goal: 'Turn selected source material into a useful, reviewable brief.',
    audience: 'Private owner',
    successCriteria: 'The brief is grounded in selected sources, reviewed by the Human, and stored with evidence.'
  }),
  Object.freeze({
    id: 'visual-story',
    title: 'Make a visual',
    description: 'Connect a source to ImageHoss, Human review, and the Gummy Box.',
    goal: 'Create a visual direction from selected source material.',
    audience: 'Selected audience',
    successCriteria: 'A Human accepts an exact visual result revision before it is kept or sent anywhere.'
  }),
  Object.freeze({
    id: 'video-release',
    title: 'Make and prepare a video',
    description: 'Shape visual direction, VideoBoss work, review, private storage, and a visibly blocked Channels plan.',
    goal: 'Create a reviewable video package and prepare—but do not publish—a release destination.',
    audience: 'Selected audience',
    successCriteria: 'The accepted video package is preserved privately and publication remains a separate decision.'
  }),
  Object.freeze({
    id: 'world-space',
    title: 'Build an inhabitable world',
    description: 'Plan a World, route bounded 3D work through Meshmallow, review it, and keep the package in Gummy Box.',
    goal: 'Create a structured, inspectable world package from selected source material.',
    audience: 'Private collaborators',
    successCriteria: 'The World Plan remains inspectable and no native 3D construction runs without the authenticated runtime.'
  }),
  Object.freeze({
    id: 'radio-aftershow',
    title: 'Turn work into a private aftershow',
    description: 'Use exact sources, Radio, Human review, and a private export destination.',
    goal: 'Shape selected work history into an intentional private audio program.',
    audience: 'Named participants',
    successCriteria: 'The exact script revision is approved; browser speech is not presented as final audio; nothing publishes.'
  })
]);

function now() {
  return new Date().toISOString();
}

function composition(runtime, compositionId) {
  return (runtime.compositions || []).find(item => item.id === compositionId) || null;
}

function firstSource(runtime) {
  const gummy = (runtime.gummies || []).find(item => !item.quarantine && item.status !== 'rejected')
    || (runtime.gummies || [])[0];
  return gummy ? {
    kind: 'gummy',
    id: gummy.id,
    revision: String(gummy.revision || 1),
    hash: typeof gummy.hash === 'string' ? gummy.hash : gummy.hash?.value || null,
    label: gummy.name || gummy.title || gummy.id,
    description: gummy.kind === 'result' ? 'An existing result used as an explicit source.' : 'A selected source from the Local Gummy Box.',
    lane: 'inputs',
    availability: { state: 'available', reason: 'Stored in this browser.' }
  } : null;
}

function actorSpec(runtime, id, label, description, availability = null) {
  const actor = (runtime.actors || []).find(item => item.id === id);
  if (!actor) return null;
  return {
    kind: 'actor',
    id,
    revision: null,
    hash: null,
    label: actor.name || label,
    description: actor.role || description,
    lane: 'people-tools',
    availability: availability || { state: 'available', reason: 'Available to configure in this browser.' }
  };
}

function placeSpec(id, label, description, lane = 'people-tools', state = 'available', reason = 'Available as a local Gummy Place.') {
  return {
    kind: 'place',
    id,
    revision: null,
    hash: null,
    label,
    description,
    lane,
    availability: { state, reason }
  };
}

function reviewSpec(id = 'review-gate:human-acceptance', label = 'Human reviews the result') {
  return {
    kind: 'review-gate',
    id,
    revision: null,
    hash: null,
    label,
    description: 'Completion is not acceptance. The Human chooses what becomes authoritative.',
    lane: 'review-approval',
    availability: { state: 'available', reason: 'Available through existing Human authority.' }
  };
}

function destinationSpec(id, label, description, state = 'available', reason = 'Available through a bounded local action.') {
  return {
    kind: 'destination',
    id: `destination:${id}`,
    revision: null,
    hash: null,
    label,
    description,
    lane: 'destinations',
    availability: { state, reason }
  };
}

function starterSpecs(runtime, starterId) {
  const source = firstSource(runtime);
  const humanReview = reviewSpec();
  const box = destinationSpec('gummy-box', 'Keep in Gummy Box', 'Keep the accepted result private with its Return and Receipt.');
  const glopper = actorSpec(runtime, 'actor:glopper', 'Glopper', 'Bounded planning and transformation companion.');
  const imageHoss = actorSpec(runtime, 'actor:imagehoss', 'ImageHoss', 'Visual direction specialist.');
  const videoBoss = actorSpec(runtime, 'actor:videoboss', 'VideoBoss', 'Video planning and delivery specialist.');
  const meshmallow = actorSpec(runtime, 'actor:3d-bee', 'Meshmallow', 'Bounded editable 3D execution specialist.');

  const definitions = {
    'research-brief': [source, glopper, humanReview, box],
    'visual-story': [source, imageHoss, humanReview, box],
    'video-release': [
      source,
      imageHoss,
      videoBoss,
      humanReview,
      box,
      destinationSpec('channels', 'Prepare for Channels', 'Prepare a release plan without publishing it.', 'planned', 'Remote publication and moderation are not connected.')
    ],
    'world-space': [
      source,
      placeSpec('app:gummy-worlds', 'Worlds', 'Structured World Plans and Sit experiences.'),
      meshmallow,
      humanReview,
      box
    ],
    'radio-aftershow': [
      source,
      placeSpec('app:gummy-radio', 'Radio', 'Revisioned source-to-audio production.', 'people-tools', 'available', 'The private local Radio core is available; final voice remains separate.'),
      humanReview,
      destinationSpec('private-export', 'Keep private / export', 'Export a bounded private episode package.')
    ]
  };
  return (definitions[starterId] || []).filter(Boolean);
}

function inferredEdgeType(from, to) {
  if (to.lane === 'review-approval') return 'review';
  if (to.lane === 'destinations') return to.id.includes('gummy-box') ? 'storage' : 'publication';
  if (from.lane === 'inputs') return 'input';
  if (from.lane === 'people-tools' && to.lane === 'people-tools') return 'execution';
  return 'context';
}

function addSpec(runtime, compositionId, spec) {
  const current = composition(runtime, compositionId);
  const existing = current?.nodes.find(node => node.ref.kind === spec.kind && node.ref.id === spec.id);
  if (existing) return nonExecuting({ runtime, node: existing });
  const result = addCompositionNode(runtime, compositionId, {
    ref: { kind: spec.kind, id: spec.id, revision: spec.revision, hash: spec.hash },
    label: spec.label,
    description: spec.description,
    lane: spec.lane,
    availability: spec.availability,
    optional: false
  });
  const node = result.composition.nodes.find(item => item.ref.kind === spec.kind && item.ref.id === spec.id);
  return nonExecuting({ runtime: result.runtime, node });
}

function setBrief(runtime, compositionId, brief) {
  const current = composition(runtime, compositionId);
  if (!current) return nonExecuting({ runtime, denied: true, reason: 'composition-not-found' });
  const snapshot = clone(current);
  snapshot.brief = {
    goal: String(brief.goal || '').trim(),
    audience: String(brief.audience || '').trim(),
    successCriteria: String(brief.successCriteria || '').trim(),
    constraints: String(brief.constraints || '').trim(),
    starterId: brief.starterId || snapshot.brief?.starterId || null,
    updatedAt: now()
  };
  return replaceCompositionFromSnapshot(runtime, compositionId, snapshot);
}

export function updateProductionCompositionBrief(runtime, compositionId, brief) {
  return nonExecuting(setBrief(runtime, compositionId, brief));
}

export function addCompositionReference(runtime, compositionId, reference) {
  const lane = reference.lane || ({
    gummy: 'inputs',
    production: 'inputs',
    'shared-vision': 'inputs',
    actor: 'people-tools',
    place: 'people-tools',
    'review-gate': 'review-approval',
    destination: 'destinations'
  }[reference.kind] || 'steps-connections');
  return nonExecuting(addSpec(runtime, compositionId, {
    kind: reference.kind,
    id: reference.id,
    revision: reference.revision || null,
    hash: reference.hash || null,
    label: reference.label || reference.id,
    description: reference.description || 'A linked canonical Gummy object.',
    lane,
    availability: reference.availability || { state: 'available', reason: 'Available in this browser.' }
  }));
}

export function applyCompositionStarter(runtime, {
  compositionId = null,
  starterId,
  ownerActorId = 'actor:hayden'
}) {
  const starter = COMPOSITION_STARTERS.find(item => item.id === starterId);
  if (!starter) return nonExecuting({ runtime, denied: true, reason: 'starter-not-found' });
  let working = clone(runtime);
  let current = compositionId ? composition(working, compositionId) : null;
  if (!current) {
    const created = createProductionComposition(working, {
      title: starter.title,
      ownerActorId,
      source: 'template'
    });
    working = created.runtime;
    current = created.composition;
    compositionId = current.id;
  }
  const briefResult = setBrief(working, compositionId, {
    goal: starter.goal,
    audience: starter.audience,
    successCriteria: starter.successCriteria,
    constraints: 'Nothing executes, publishes, spends, or grants authority from the Composer.',
    starterId
  });
  if (briefResult.denied) return nonExecuting(briefResult);
  working = briefResult.runtime;

  const orderedNodes = [];
  for (const spec of starterSpecs(working, starterId)) {
    const added = addSpec(working, compositionId, spec);
    working = added.runtime;
    if (added.node) orderedNodes.push(added.node);
  }
  for (let index = 0; index < orderedNodes.length - 1; index += 1) {
    const from = orderedNodes[index];
    const to = orderedNodes[index + 1];
    const result = connectCompositionNodes(working, compositionId, {
      fromNodeId: from.id,
      toNodeId: to.id,
      edgeType: inferredEdgeType({ ...from.ref, lane: from.lane, id: from.ref.id }, { ...to.ref, lane: to.lane, id: to.ref.id }),
      dataClasses: ['starter-pattern', starterId],
      approvalRule: to.lane === 'review-approval' || to.lane === 'destinations'
        ? 'Human review required'
        : 'Master Control approval required',
      optional: to.availability?.state === 'planned'
    });
    working = result.runtime;
  }
  return {
    runtime: working,
    composition: composition(working, compositionId),
    starter,
    executed: false
  };
}

export function analyzeProductionComposition(value, runtime) {
  if (!value) return null;
  const laneCounts = Object.fromEntries(['inputs', 'people-tools', 'steps-connections', 'review-approval', 'destinations']
    .map(lane => [lane, value.nodes.filter(node => node.lane === lane).length]));
  const planned = value.nodes.filter(node => node.availability?.state === 'planned');
  const unavailable = value.nodes.filter(node => ['blocked', 'unavailable'].includes(node.availability?.state));
  const dataClasses = [...new Set(value.edges.flatMap(edge => edge.dataClasses || []))];
  const pool = (runtime.productionPools || []).find(item => item.productionId === value.productionId);
  const nextMoves = [];
  if (!value.brief?.goal) nextMoves.push({ id: 'define-goal', title: 'Describe the result you want', detail: 'A clear goal makes the same graph easier to understand and revise.' });
  if (!laneCounts.inputs) nextMoves.push({ id: 'add-input', title: 'Add an input', detail: 'Choose a Gummy, file, result, Production, or Shared Vision.' });
  if (!laneCounts['people-tools']) nextMoves.push({ id: 'add-person', title: 'Choose who or what works on it', detail: 'Add a Human, specialist Actor, Place, or app.' });
  if (!laneCounts['review-approval']) nextMoves.push({ id: 'add-review', title: 'Add Human review', detail: 'Completion should never become acceptance automatically.' });
  if (!laneCounts.destinations) nextMoves.push({ id: 'add-destination', title: 'Choose where accepted work goes', detail: 'Keeping it in Gummy Box is the safest default.' });
  if (planned.length) nextMoves.push({ id: 'inspect-planned', title: 'Review planned connections', detail: `${planned.length} choice${planned.length === 1 ? '' : 's'} cannot execute yet.` });
  return {
    laneCounts,
    nodeCount: value.nodes.length,
    edgeCount: value.edges.length,
    plannedCount: planned.length,
    unavailableCount: unavailable.length,
    dataClasses,
    authority: 'proposal-only',
    executionState: 'not-started',
    costState: pool ? 'authorized-production-pool-exists' : 'not-estimated',
    costCeiling: pool?.estimate?.amount || pool?.estimatedAmount || null,
    nextMoves,
    readyToApply: value.readiness?.state === 'ready-to-apply'
  };
}

export function addRecommendedCompositionElement(runtime, compositionId, recommendationId) {
  const source = firstSource(runtime);
  const recommended = {
    'add-input': source,
    'add-person': actorSpec(runtime, 'actor:glopper', 'Glopper', 'Bounded planning and transformation companion.'),
    'add-review': reviewSpec(),
    'add-destination': destinationSpec('gummy-box', 'Keep in Gummy Box', 'Keep the accepted result private with evidence.')
  }[recommendationId];
  if (!recommended) return nonExecuting({ runtime, denied: true, reason: 'recommendation-not-actionable' });
  return nonExecuting(addSpec(runtime, compositionId, recommended));
}
