import {
  PlaceSystemError,
  createPlaceHandoffPreview,
  createSourcePackage
} from '../core/place-system.js';
export { PHASE14_PLACES } from './manifest.js';

export const WORLD_TOOLS = Object.freeze([
  'validate_world',
  'check_sources',
  'estimate_world',
  'make_world',
  'world_status',
  'inspect_world',
  'package_world',
  'duplicate_world',
  'list_starters'
]);

const HASH_A = 'a'.repeat(64);
const HASH_B = 'b'.repeat(64);

export const PLACE_FIXTURES = Object.freeze({
  channels: {
    guide: [
      ['6:00 PM', 'Family Room bulletin', 'Three notes from invited family'],
      ['7:30 PM', 'Night Gummy premiere', 'Staged — publishing is not connected'],
      ['Sunday', 'Kitchen channel', 'A bounded weekly guide']
    ]
  },
  wardrobe: {
    items: [
      { id: 'item:gold-jacket', name: 'Gold work jacket', state: 'available', owned: true },
      { id: 'item:purple-shirt', name: 'Purple shirt', state: 'available', owned: true },
      { id: 'item:canvas-trousers', name: 'Canvas trousers', state: 'temporarily-unavailable', owned: true },
      { id: 'item:dark-jeans', name: 'Dark jeans', state: 'available', owned: true }
    ]
  },
  house: {
    project: 'Front room listening corner',
    scopedNodes: ['room:front-room', 'item:record-shelf', 'note:lighting-preference'],
    withheldNodes: ['home:exact-address', 'photo:family-wall', 'room:bedroom']
  },
  worlds: {
    starter: 'starter:listening-room',
    status: 'Plan ready; Meshmallow runtime required for a real build.'
  },
  table: {
    gathering: 'Sunday supper',
    invitees: ['Hayden', 'Sam', 'Jo'],
    pantryGift: 'Bring the good olive oil'
  },
  radio: {
    episode: 'Night Gummy premiere notes',
    sourceCount: 2,
    scriptRevision: 3
  }
});

function blocked(code, message, details = {}) {
  throw new PlaceSystemError(code, message, details);
}

function containsForbiddenWorldAccess(value) {
  const text = JSON.stringify(value).toLowerCase();
  return [
    'shell', 'bash', 'python', 'filesystem', 'file://', 'bpy', 'blender script',
    'exec(', 'eval(', 'subprocess', 'arbitrary code'
  ].some(fragment => text.includes(fragment));
}

export function validateWorldPlan(plan, { walkAccepted = false } = {}) {
  if (plan?.schema !== 'gummy.world-plan/v1') blocked('invalid-world-plan', 'World Plan schema is required.');
  if (!Array.isArray(plan.sources) || !plan.sources.length) blocked('missing-sources', 'A World Plan requires source evidence.');
  if (plan.sources.some(source => !source.verified || !source.rights || !/^[a-f0-9]{64}$/.test(source.hash))) {
    blocked('unverified-source', 'Every world source needs a verified hash and declared rights.');
  }
  if (containsForbiddenWorldAccess(plan)) blocked('arbitrary-access-forbidden', 'Worlds accepts typed plans, never code, shell, filesystem, Python, or Blender scripting.');
  if (plan.constraints?.arbitraryCodeAllowed !== false) blocked('arbitrary-code-forbidden', 'arbitraryCodeAllowed must be false.');
  if (plan.experience === 'walk' && !walkAccepted) blocked('walk-gated', 'Walk mode requires separate safety and performance acceptance.');
  return Object.freeze({
    valid: true,
    experience: plan.experience,
    operationCount: plan.typedOperations.length,
    sourceCount: plan.sources.length
  });
}

export function estimateWorld(plan) {
  const validation = validateWorldPlan(plan);
  return Object.freeze({
    schema: 'gummy.world-estimate/v1',
    validation,
    estimatedMinutes: Math.min(plan.constraints.maxMinutes, 4 + plan.typedOperations.length * 3),
    costCeiling: plan.constraints.maxCost,
    executing: false,
    runtime: 'Meshmallow runtime required'
  });
}

export function makeWorld(plan, { toolName, runtimeEvidence, approved }) {
  validateWorldPlan(plan);
  if (!WORLD_TOOLS.includes(toolName)) blocked('tool-not-allowed', `${toolName} is not one of the nine Worlds tools.`);
  if (toolName !== 'make_world') blocked('wrong-tool', 'A build submission must use make_world.');
  if (approved !== true) blocked('approval-required', 'The exact World Plan must be approved.');
  if (runtimeEvidence?.authenticated !== true || runtimeEvidence?.status !== 'available') {
    blocked('runtime-required', 'A trusted Meshmallow runtime is required; Worlds will not simulate success.');
  }
  return Object.freeze({ status: 'submitted', simulated: false, planId: plan.id, runtimeReceipt: runtimeEvidence.receiptId });
}

export function chooseWardrobeOutfit(items, preferredIds) {
  if (items.some(item => item.owned !== true)) blocked('not-owned', 'Wardrobe can only select owned items.');
  const available = items.filter(item => item.state === 'available');
  const unavailable = items.filter(item => preferredIds.includes(item.id) && item.state !== 'available');
  const chosen = preferredIds
    .map(id => available.find(item => item.id === id))
    .filter(Boolean);
  for (const missing of unavailable) {
    const replacement = available.find(item => !chosen.includes(item) && item.id !== missing.id);
    if (replacement) chosen.push(replacement);
  }
  return Object.freeze({
    outfit: chosen.slice(0, 3),
    temporaryUnavailable: unavailable.map(item => item.id),
    disliked: [],
    checkoutAvailable: false
  });
}

export function previewHouseIntent({ intent, selectedNodes, homeGraph }) {
  const selected = homeGraph.filter(node => selectedNodes.includes(node.id));
  const sentFields = selected.map(node => node.id);
  const withheldFields = homeGraph.filter(node => !selectedNodes.includes(node.id)).map(node => node.id);
  if (sentFields.some(id => /address|photo/i.test(id))) blocked('scope-wall', 'Address and photos cannot cross the Scope Wall without a separate explicit selection.');
  return Object.freeze({
    schema: 'gummy.house-intent-preview/v1',
    intent,
    sentFields,
    withheldFields,
    executionState: 'preview',
    executing: false
  });
}

export function commitHouseIntent(preview, { intentNote, consequenceNote, approvedBy }) {
  if (preview?.executionState !== 'preview') blocked('preview-required', 'The Intent Gate requires a preview.');
  if (!intentNote?.trim() || !consequenceNote?.trim()) blocked('two-note-commit', 'Both intent and consequence notes are required.');
  if (!approvedBy?.startsWith('actor:')) blocked('approval-required', 'A Human Actor must approve the House commit.');
  return Object.freeze({
    schema: 'gummy.house-commit/v1',
    preview,
    intentNote,
    consequenceNote,
    approvedBy,
    status: 'committed-local',
    externalExecution: false
  });
}

export function releaseTableAddress({ invited, purposeApproved, serviceApproved, exactAddress }) {
  if (!invited) blocked('invite-required', 'Table is invite-only.');
  if (!purposeApproved || !serviceApproved) blocked('address-withheld', 'The exact address needs person-and-service approval for this gathering.');
  if (!exactAddress?.trim()) blocked('address-missing', 'No exact address is available.');
  return Object.freeze({ exactAddress, scope: 'this-gathering-only', discoverable: false, retainedBalance: false });
}

export function createRadioEpisode({ id, sourcePackage, title }) {
  if (sourcePackage?.schema !== 'gummy.source-package/v1') blocked('source-package-required', 'Radio requires an exact source-boundary package.');
  return Object.freeze({
    schema: 'gummy.radio-episode/v1',
    id,
    title,
    sourcePackage,
    outline: { revision: 1, approved: false },
    script: { revision: 1, approved: false },
    voiceApproval: { approved: false },
    exportApproval: { approved: false },
    publishApproval: { approved: false }
  });
}

export function reviseRadioScript(episode, text) {
  if (!text?.trim()) blocked('script-required', 'A script revision cannot be empty.');
  return Object.freeze({
    ...structuredClone(episode),
    script: { revision: episode.script.revision + 1, text, approved: false },
    exportApproval: { approved: false },
    publishApproval: { approved: false }
  });
}

export function prepareRadioExport(episode, { visibility, browserSpeech = false }) {
  if (!episode.script.approved) blocked('script-approval-required', 'Approve the exact script revision first.');
  if (visibility === 'public' && episode.sourcePackage.privacy !== 'public') {
    blocked('private-source', 'Public export rejects private source material.');
  }
  if (visibility === 'public' && !episode.sourcePackage.humanApproval.approved) {
    blocked('source-approval-required', 'Public export requires approved source material.');
  }
  if (!browserSpeech && !episode.voiceApproval.approved) blocked('voice-approval-required', 'Final voice or likeness needs separate permission.');
  return Object.freeze({
    schema: 'gummy.radio-export/v1',
    scriptRevision: episode.script.revision,
    visibility,
    mode: browserSpeech ? 'browser-speech-demonstration' : 'final-voice',
    finalAudio: !browserSpeech,
    published: false
  });
}

export function stageChannelPremiere({ sourcePackage, autoPublish = false }) {
  if (sourcePackage?.schema !== 'gummy.source-package/v1') blocked('source-package-required', 'Channels requires a scoped source package.');
  if (autoPublish) blocked('auto-publish-forbidden', 'Channels never auto-publishes.');
  return Object.freeze({
    schema: 'gummy.channel-premiere/v1',
    guidePlacement: 'staged',
    bulletinType: 'family-room-note',
    infiniteFeed: false,
    identityShared: false,
    published: false
  });
}

function journeyPackage(id, targetPlaceId, includedFields, purpose) {
  return createSourcePackage({
    id: `source-package:${id}`,
    sources: [{ id: `gummy:${id}`, revision: 1, hash: id.includes('home') ? HASH_B : HASH_A }],
    includedFields,
    explicitExclusions: ['private-notes', 'ambient-profile', 'credentials'],
    purpose,
    targetPlaceId,
    privacy: 'participants',
    audience: 'Named journey participants',
    quotePermission: false,
    voiceLikenessPermission: false,
    rights: { ownerApproved: true },
    provenance: { source: 'fixture-backed automated journey', revision: 1 },
    retention: 'journey-only',
    costCeiling: 0,
    limitations: ['No live external submission'],
    humanApproval: { approved: false, approvedBy: null, approvedAt: null },
    createdAt: '2026-07-28T12:00:00.000Z'
  });
}

export function buildCrossPlaceJourney(kind) {
  const definitions = {
    'creator-premiere': ['app:gummy-channels', ['premiere-title', 'approved-artwork', 'time'], 'Stage a creator premiere in the channel guide'],
    'home-project': ['app:gummy-house', ['project-intent', 'selected-room'], 'Plan a scoped home project'],
    'real-world-gathering': ['app:gummy-table', ['invitees', 'gathering-time', 'menu'], 'Coordinate an invite-only gathering'],
    'world-premiere': ['app:gummy-worlds', ['world-plan', 'verified-assets'], 'Prepare a sit-first world premiere']
  };
  const definition = definitions[kind];
  if (!definition) blocked('unknown-journey', 'Unknown cross-Place journey.');
  const sourcePackage = journeyPackage(kind, definition[0], definition[1], definition[2]);
  const preview = createPlaceHandoffPreview({
    id: `place-handoff:${kind}`,
    sourcePackage,
    sourcePlaceId: 'app:gummy-os',
    targetPlaceId: definition[0],
    expectedOutput: definition[2],
    permissionScopes: [`${kind}.stage`],
    locality: 'browser',
    runtime: 'fixture-backed local preview',
    approvalBoundary: 'place-confirmation',
    createdAt: '2026-07-28T12:00:00.000Z'
  });
  return Object.freeze({
    kind,
    sourcePackage,
    preview
  });
}
