import { sha256 } from './hash.js';
import { createReceipt } from './records.js';
import {
  acceptProductionResult,
  addNightGummyLaunchRoster,
  compileActorPlan,
  createProduction,
  makeProduction,
  saveProductionActorConfiguration
} from './production-runtime.js';

export const PHASE16_IDS = Object.freeze({
  bowl: 'bowl:friday-brainstorm',
  session: 'session:friday-brainstorm:1',
  socialInstance: 'social-instance:friday-brainstorm-crew',
  sharedVision: 'shared-vision:cyberpunk-short-film',
  production: 'production:friday-brainstorm-film',
  agreement: 'production-agreement:friday-brainstorm-film:v1',
  pool: 'production-pool:friday-brainstorm-film:v1',
  revisedPool: 'production-pool:friday-brainstorm-film:v2',
  ledger: 'contribution-ledger:friday-brainstorm-film',
  formation: 'production-formation:friday-brainstorm-film'
});

export const PHASE16_ACTORS = Object.freeze([
  Object.freeze({ id: 'actor:hayden', name: 'Hayden', role: 'Human sponsor', presence: 'human-live' }),
  Object.freeze({ id: 'actor:contributor-b', name: 'Contributor B', role: 'Writing', presence: 'ai-represented' }),
  Object.freeze({ id: 'actor:contributor-c', name: 'Contributor C', role: 'Design', presence: 'static' }),
  Object.freeze({ id: 'actor:contributor-d', name: 'Contributor D', role: 'Technical review', presence: 'offline' })
]);

const REPRESENTATIVE_AGENT_ID = 'agent:contributor-b-representative';
const REPRESENTATION_MOLD_ID = 'mold:contributor-b:representation-v1';
const REPRESENTATION_GRANT_ID = 'grant:contributor-b:representation-v1';
const PROOF_SOURCE_GUMMIES = Object.freeze([
  'gummy:night-gummy-launch-brief',
  'gummy:night-gummy-launch-brand-kit'
]);
const FIXTURE_TIMESTAMP = '2026-07-28T18:00:00.000Z';
const FAR_FUTURE = '2099-07-28T18:00:00.000Z';
const clone = value => structuredClone(value);
const now = clock => clock ? clock() : new Date().toISOString();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function actorFixture(id, address, name, timestamp, extensions = {}) {
  return {
    schema: 'gummy.actor/v0',
    id,
    address,
    kind: 'person',
    name,
    status: 'active',
    humanAuthorityIds: ['human:hayden'],
    moldIds: id === 'actor:contributor-b' ? [REPRESENTATION_MOLD_ID] : [],
    agentIds: id === 'actor:contributor-b' ? [REPRESENTATIVE_AGENT_ID] : [],
    gummyIds: [],
    deployment: {
      mode: 'local-only',
      authoritativeLocation: 'Local Gummy Box',
      lastOpenedAt: timestamp
    },
    syncPolicy: {
      mode: 'none',
      directions: [],
      allowedData: [],
      requiresApproval: true
    },
    createdAt: timestamp,
    updatedAt: timestamp,
    extensions: {
      localFixture: true,
      verifiedRemoteIdentity: false,
      ...extensions
    }
  };
}

function presenceRecord({
  actorId,
  state,
  operator,
  disclosure,
  timestamp,
  expiresAt = FAR_FUTURE,
  allowedCapabilities = [],
  allowedData = [],
  excludedActions = []
}) {
  const represented = state === 'ai-represented';
  return {
    schema: 'gummy.actor-presence/v1',
    id: `actor-presence:${actorId.slice('actor:'.length)}`,
    actorId,
    state,
    operator,
    representationAuthority: {
      required: represented,
      allowedCapabilities,
      allowedData,
      excludedActions,
      revocable: true
    },
    visibility: 'invite',
    allowedPurposes: ['Friday Brainstorm Crew collaboration'],
    excludedActions,
    contactModes: state === 'offline' ? ['message'] : ['text', 'message', 'invitation'],
    mediaCapabilities: ['local-fixture-text-only'],
    contextRefs: {
      bowlId: PHASE16_IDS.bowl,
      sessionId: PHASE16_IDS.session,
      socialInstanceId: PHASE16_IDS.socialInstance,
      productionId: null,
      placeId: 'app:gummy-rooms'
    },
    stale: false,
    revision: 1,
    startedAt: timestamp,
    updatedAt: timestamp,
    expiresAt: ['static', 'offline', 'dormant', 'revoked'].includes(state) ? null : expiresAt,
    lastVerifiedAt: timestamp,
    revokedAt: state === 'revoked' ? timestamp : null,
    disclosure,
    provenance: {
      source: 'Phase 16 deterministic local fixture',
      remoteIdentityVerified: false,
      realAudioVideoConnected: false
    },
    receiptIds: []
  };
}

function socialLayout() {
  return [
    ['hayden', 'actor', 'actor:hayden', 'open', 32, 48, 360, 260, 10],
    ['contributor-b', 'actor', 'actor:contributor-b', 'open', 420, 48, 360, 260, 11],
    ['contributor-c', 'actor', 'actor:contributor-c', 'minimized', 808, 48, 340, 240, 9],
    ['contributor-d', 'actor', 'actor:contributor-d', 'open', 32, 336, 360, 240, 8],
    ['shared-thread', 'thread', 'thread:cyberpunk-video', 'open', 420, 336, 728, 300, 12]
  ].map(([slug, subjectType, subjectId, state, x, y, width, height, zIndex]) => ({
    windowId: `social-window:${PHASE16_IDS.socialInstance.slice('social-instance:'.length)}:${slug}`,
    subjectType,
    subjectId,
    state,
    x,
    y,
    width,
    height,
    zIndex
  }));
}

async function ensureRecord(repository, store, id, factory, { validate = true } = {}) {
  const existing = await repository.get(store, id);
  if (existing) return existing;
  const record = await factory();
  await repository.put(store, record, { validate });
  return record;
}

export async function ensureLivingCollaborationRecords(repository, { clock } = {}) {
  const [human, owner] = await Promise.all([
    repository.get('humans', 'human:hayden'),
    repository.get('actors', 'actor:hayden')
  ]);
  if (!human || !owner) return false;
  const timestamp = now(clock);

  for (const definition of [
    ['actor:contributor-b', '@contributor-b', 'Contributor B', { representation: 'AI-represented local fixture' }],
    ['actor:contributor-c', '@contributor-c', 'Contributor C', { representation: 'Static local fixture' }],
    ['actor:contributor-d', '@contributor-d', 'Contributor D', { representation: 'Offline local fixture' }]
  ]) {
    await ensureRecord(repository, 'actors', definition[0], () => actorFixture(
      definition[0],
      definition[1],
      definition[2],
      timestamp,
      definition[3]
    ));
  }

  await ensureRecord(repository, 'agents', REPRESENTATIVE_AGENT_ID, () => ({
    schema: 'gummy.agent/v0',
    id: REPRESENTATIVE_AGENT_ID,
    name: 'Contributor B disclosed representative',
    characterFamily: 'Local representation fixture',
    version: '1',
    providerClass: 'deterministic-local-fixture',
    model: 'none',
    runtimeClass: 'browser',
    locality: 'web',
    status: 'available',
    humanAuthorityIds: ['human:hayden'],
    actorIds: ['actor:contributor-b'],
    moldIds: [REPRESENTATION_MOLD_ID],
    activeTaskLeaseIds: [],
    capabilityCeiling: ['collect-message', 'summarize-approved-profile'],
    memoryBoundary: {
      privateLocal: true,
      portableProfileAllowed: false,
      currentTaskContextOnly: true
    },
    disclosure: {
      operator: REPRESENTATIVE_AGENT_ID,
      autonomy: 'human-directed',
      providerDisclosure: 'Deterministic local fixture. No remote model or Human impersonation.'
    },
    createdAt: timestamp,
    updatedAt: timestamp
  }));

  await ensureRecord(repository, 'molds', REPRESENTATION_MOLD_ID, () => ({
    schema: 'gummy.mold/v0',
    id: REPRESENTATION_MOLD_ID,
    actorId: 'actor:contributor-b',
    name: 'Contributor B bounded representation',
    handle: '@contributor-b',
    status: 'active',
    allowedHumanIds: ['human:hayden'],
    allowedAgentIds: [REPRESENTATIVE_AGENT_ID],
    role: 'message collection and approved profile explanation',
    context: PHASE16_IDS.socialInstance,
    representation: {
      displayName: 'Contributor B · AI represented',
      description: 'Disclosed deterministic local fixture; never Human-live.'
    },
    permissions: {
      capabilities: ['collect-message', 'summarize-approved-profile'],
      readScopes: ['selected-public-profile', PHASE16_IDS.socialInstance],
      writeScopes: ['message-draft'],
      publishScopes: [],
      requiresHumanApproval: true
    },
    runtimePolicy: {
      allowedLocalities: ['web'],
      allowedRuntimeClasses: ['browser'],
      networkPolicy: 'none'
    },
    syncPolicy: {
      mode: 'none',
      allowedData: ['selected-public-profile'],
      directions: []
    },
    disclosure: {
      operatorType: 'agent',
      agentDisclosureRequired: true,
      licenseDisclosure: 'Local fixture only. Cannot approve, spend, publish, or speak as the Human.'
    },
    issuedBy: 'human:hayden',
    issuedAt: timestamp,
    expiresAt: FAR_FUTURE,
    updatedAt: timestamp
  }));

  await ensureRecord(repository, 'grants', REPRESENTATION_GRANT_ID, () => ({
    schema: 'gummy.capability-grant/v0',
    id: REPRESENTATION_GRANT_ID,
    humanAuthorityId: 'human:hayden',
    actorId: 'actor:contributor-b',
    operatorType: 'agent',
    operatorId: REPRESENTATIVE_AGENT_ID,
    agentId: REPRESENTATIVE_AGENT_ID,
    moldId: REPRESENTATION_MOLD_ID,
    masterControlId: 'master-control:hayden',
    action: 'represent-in-social-instance',
    resource: PHASE16_IDS.socialInstance,
    resourceKind: 'conversation',
    risk: 'medium',
    reason: 'Explicit Phase 16 local representation proof',
    scope: {
      allowedCapabilities: ['collect-message', 'summarize-approved-profile'],
      allowedData: ['selected-public-profile'],
      excludedActions: ['approve', 'spend', 'execute', 'publish', 'grant-rights']
    },
    locality: 'web',
    approval: 'human',
    issuerId: 'human:hayden',
    issuedAt: timestamp,
    expiresAt: FAR_FUTURE,
    revoked: false
  }));

  await ensureRecord(repository, 'bowls', PHASE16_IDS.bowl, () => ({
    schema: 'gummy.bowl/v0',
    id: PHASE16_IDS.bowl,
    name: 'Friday Brainstorm Bowl',
    description: 'Private local policy container for the saved collaboration proof.',
    ownerActorId: 'actor:hayden',
    visibility: 'private',
    members: PHASE16_ACTORS.map(actor => ({
      actorId: actor.id,
      moldId: actor.id === 'actor:contributor-b' ? REPRESENTATION_MOLD_ID : undefined,
      role: actor.role,
      status: 'active',
      joinedAt: timestamp
    })),
    gummyIds: ['gummy:project-brief'],
    policy: {
      whoCanInvite: ['actor:hayden'],
      whoCanPublish: [],
      agentActorsAllowed: true,
      defaultGummyVisibility: 'private',
      grabPolicy: 'per-gummy'
    },
    createdAt: timestamp,
    updatedAt: timestamp,
    extensions: {
      sourceApplicationId: 'app:gummy-rooms',
      localFixture: true,
      remotePresenceClaimed: false
    }
  }));

  const messages = [
    ['message:friday:118', 'actor:hayden', 'Let’s make a short cyberpunk music video from our Night Gummy world.', true],
    ['message:friday:124', 'actor:contributor-b', 'I can shape the story and opening narration.', true],
    ['message:friday:131', 'actor:contributor-c', 'I can contribute visual direction and title-card design.', true],
    ['message:friday:140', 'actor:hayden', 'Private budget details stay excluded from the source package.', false]
  ];
  for (const [id, senderActorId, text, selected] of messages) {
    await ensureRecord(repository, 'collaborationMessages', id, async () => ({
      id,
      schema: 'gummy.session-message/v1',
      sessionId: PHASE16_IDS.session,
      senderActorId,
      text,
      revision: 1,
      hash: await sha256(text),
      selectedForSharedVision: selected,
      createdAt: timestamp
    }), { validate: false });
  }

  await ensureRecord(repository, 'collaborationSessions', PHASE16_IDS.session, () => ({
    id: PHASE16_IDS.session,
    schema: 'gummy.session/v1',
    bowlId: PHASE16_IDS.bowl,
    socialInstanceId: PHASE16_IDS.socialInstance,
    revision: 1,
    status: 'paused',
    participantActorIds: PHASE16_ACTORS.map(actor => actor.id),
    threadIds: ['thread:cyberpunk-video', 'thread:distribution'],
    selectedGummyIds: ['gummy:project-brief'],
    recordingConsent: 'deny',
    transcriptionConsent: 'deny',
    createdAt: timestamp,
    updatedAt: timestamp
  }), { validate: false });

  const presenceDefinitions = [
    presenceRecord({
      actorId: 'actor:hayden',
      state: 'human-live',
      operator: {
        type: 'human',
        operatorId: 'human:hayden',
        moldId: null,
        grantId: null,
        sponsorHumanId: 'human:hayden'
      },
      disclosure: 'Human operating this local browser session. No remote identity, audio, or video is verified.',
      timestamp
    }),
    presenceRecord({
      actorId: 'actor:contributor-b',
      state: 'ai-represented',
      operator: {
        type: 'agent',
        operatorId: REPRESENTATIVE_AGENT_ID,
        moldId: REPRESENTATION_MOLD_ID,
        grantId: REPRESENTATION_GRANT_ID,
        sponsorHumanId: 'human:hayden'
      },
      disclosure: 'AI represented by a disclosed deterministic local fixture. This is never the Human.',
      timestamp,
      allowedCapabilities: ['collect-message', 'summarize-approved-profile'],
      allowedData: ['selected-public-profile'],
      excludedActions: ['approve', 'spend', 'execute', 'publish', 'grant-rights']
    }),
    presenceRecord({
      actorId: 'actor:contributor-c',
      state: 'static',
      operator: {
        type: 'none',
        operatorId: null,
        moldId: null,
        grantId: null,
        sponsorHumanId: null
      },
      disclosure: 'Static approved profile only. No current Human or Agent operator is present.',
      timestamp,
      expiresAt: null
    }),
    presenceRecord({
      actorId: 'actor:contributor-d',
      state: 'offline',
      operator: {
        type: 'none',
        operatorId: null,
        moldId: null,
        grantId: null,
        sponsorHumanId: null
      },
      disclosure: 'Offline local fixture. A message may be left; no live presence is claimed.',
      timestamp,
      expiresAt: null
    })
  ];
  for (const presence of presenceDefinitions) {
    const existing = (await repository.all('actorPresence'))
      .find(item => item.actorId === presence.actorId && item.schema === 'gummy.actor-presence/v1');
    if (!existing) await repository.putValidated('actorPresence', presence);
  }

  await ensureRecord(repository, 'socialInstances', PHASE16_IDS.socialInstance, () => ({
    schema: 'gummy.social-instance/v1',
    id: PHASE16_IDS.socialInstance,
    name: 'Friday Brainstorm Crew',
    title: 'Friday Brainstorm Crew',
    description: 'A resumable local collaboration topology, not merely a transcript.',
    ownerActorId: 'actor:hayden',
    sourceBowlId: PHASE16_IDS.bowl,
    originatingSessionId: PHASE16_IDS.session,
    latestSessionId: PHASE16_IDS.session,
    visibility: 'private',
    members: PHASE16_ACTORS.map(actor => ({
      actorId: actor.id,
      role: actor.role,
      status: 'active',
      moldId: actor.id === 'actor:contributor-b' ? REPRESENTATION_MOLD_ID : null,
      presencePolicy: actor.presence,
      joinedAt: timestamp
    })),
    purpose: 'Recurring creative ideation and governed Production formation.',
    permissionRules: {
      invite: ['actor:hayden'],
      share: 'explicit-handoff-only',
      formProduction: 'exact-agreement-approval-required',
      publish: 'separate-distribution-approval-required'
    },
    presenceRules: {
      refreshOnOpen: true,
      neverAssumeOldParticipantsPresent: true,
      allowedStates: ['human-live', 'human-available', 'human-away', 'ai-represented', 'static', 'busy', 'offline', 'dormant', 'revoked']
    },
    rhythm: 'Friday evenings',
    layout: { windows: socialLayout() },
    threadIds: ['thread:cyberpunk-video', 'thread:distribution'],
    gummyIds: ['gummy:project-brief'],
    sharedVisionIds: [],
    productionIds: [],
    linkIds: [],
    communicationModes: ['text', 'static'],
    notificationPolicy: { mode: 'local-only', remotePush: false },
    privacy: {
      recordingDefault: 'deny',
      transcriptionDefault: 'deny',
      crossInstanceSharing: 'explicit-handoff-only'
    },
    resumeState: {
      selectedThreadId: 'thread:cyberpunk-video',
      lastMessageId: 'message:friday:140',
      nextAction: 'Review selected provenance'
    },
    resumeInstructions: 'Restore the saved windows, refresh each Actor Presence, then ask the Human before creating a new Session revision.',
    provenance: {
      sourceBowlId: PHASE16_IDS.bowl,
      sourceSessionId: PHASE16_IDS.session,
      fixture: 'phase16-local-proof'
    },
    status: 'paused',
    revision: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastActivityAt: timestamp
  }));
  return true;
}

export function resolveActorPresence(record, at = new Date().toISOString()) {
  if (!record) return {
    state: 'offline',
    stale: true,
    disclosure: 'No current Actor Presence record exists.'
  };
  if (record.state === 'revoked') return { ...clone(record), stale: false };
  if (record.expiresAt && Date.parse(record.expiresAt) <= Date.parse(at)) {
    return {
      ...clone(record),
      state: 'offline',
      stale: true,
      disclosure: 'Presence expired. Current state is unknown and shown offline.'
    };
  }
  return { ...clone(record), stale: false };
}

export async function revokeRepresentation(repository, actorId = 'actor:contributor-b', { clock } = {}) {
  const presence = (await repository.all('actorPresence')).find(item => item.actorId === actorId);
  assert(presence?.state === 'ai-represented', 'An active AI-represented presence is required.');
  const [mold, grant] = await Promise.all([
    repository.get('molds', presence.operator.moldId),
    repository.get('grants', presence.operator.grantId)
  ]);
  assert(mold && grant, 'Representation Mold and Grant are required.');
  const timestamp = now(clock);
  await repository.putValidated('molds', {
    ...mold,
    status: 'revoked',
    revokedAt: timestamp,
    updatedAt: timestamp
  });
  await repository.putValidated('grants', {
    ...grant,
    revoked: true,
    revokedAt: timestamp
  });
  const nextPresence = {
    ...presence,
    state: 'revoked',
    operator: {
      type: 'none',
      operatorId: null,
      moldId: null,
      grantId: null,
      sponsorHumanId: 'human:hayden'
    },
    representationAuthority: {
      required: false,
      allowedCapabilities: [],
      allowedData: [],
      excludedActions: ['all-future-representation'],
      revocable: true
    },
    stale: false,
    revision: presence.revision + 1,
    updatedAt: timestamp,
    expiresAt: null,
    revokedAt: timestamp,
    disclosure: 'Representation revoked by the Human. Historical evidence remains; future representation is blocked.'
  };
  await repository.putValidated('actorPresence', nextPresence);
  const receipt = await createReceipt(repository, {
    action: 'actor-representation.revoked',
    resources: [actorId, mold.id, grant.id],
    outcome: 'completed',
    reversible: false,
    detail: 'Human revoked future AI representation without deleting historical presence evidence.'
  });
  return { presence: nextPresence, mold: { ...mold, status: 'revoked' }, grant: { ...grant, revoked: true }, receipt };
}

export async function resumeSocialInstance(repository, socialInstanceId = PHASE16_IDS.socialInstance, { clock } = {}) {
  const social = await repository.get('socialInstances', socialInstanceId);
  assert(social, 'Saved Social Instance not found.');
  const currentSession = await repository.get('collaborationSessions', social.latestSessionId);
  const revision = Number(currentSession?.revision || 0) + 1;
  const timestamp = now(clock);
  const session = {
    ...clone(currentSession),
    id: `session:friday-brainstorm:${revision}`,
    revision,
    status: 'active',
    resumedFromSessionId: currentSession?.id || null,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  await repository.put('collaborationSessions', session, { validate: false });
  const next = {
    ...social,
    latestSessionId: session.id,
    status: 'active',
    revision: social.revision + 1,
    updatedAt: timestamp,
    lastActivityAt: timestamp,
    resumeState: {
      ...social.resumeState,
      resumedSessionId: session.id,
      nextAction: 'Select exact conversation provenance'
    }
  };
  await repository.putValidated('socialInstances', next);
  const receipt = await createReceipt(repository, {
    action: 'social-instance.resumed',
    resources: [social.id, currentSession?.id, session.id].filter(Boolean),
    outcome: 'completed',
    reversible: true,
    detail: 'Restored the saved topology and created a new Session revision only after Human choice.'
  });
  return { socialInstance: next, session, receipt };
}

export async function createSharedVisionFromSelection(repository, {
  socialInstanceId = PHASE16_IDS.socialInstance,
  selectedMessageIds = ['message:friday:118', 'message:friday:124', 'message:friday:131'],
  clock
} = {}) {
  const existing = await repository.get('sharedVisions', PHASE16_IDS.sharedVision);
  if (existing) return existing;
  const social = await repository.get('socialInstances', socialInstanceId);
  assert(social, 'Social Instance is required.');
  const messages = await Promise.all(selectedMessageIds.map(id => repository.get('collaborationMessages', id)));
  assert(messages.every(Boolean), 'Every selected source record must exist.');
  assert(messages.every(message => message.sessionId === social.originatingSessionId), 'Selected sources must belong to the originating Session.');
  const timestamp = now(clock);
  const vision = {
    schema: 'gummy.shared-vision/v1',
    id: PHASE16_IDS.sharedVision,
    revision: 1,
    status: 'acknowledged',
    ownerActorId: 'actor:hayden',
    participantActorIds: ['actor:hayden', 'actor:contributor-b', 'actor:contributor-c'],
    origin: {
      sourceType: 'session',
      sourceId: social.originatingSessionId,
      recordRefs: messages.map(message => ({
        id: message.id,
        revision: message.revision,
        hash: message.hash
      })),
      explicitExclusions: ['message:friday:140', 'unselected-conversation', 'private-budget-details', 'credentials']
    },
    intent: 'Create a cyberpunk music video together.',
    goal: 'Produce one governed short film proof with inspectable collaboration evidence.',
    possibleOutputs: ['short film', 'Radio aftershow', 'Channels premiere package'],
    unresolvedQuestions: ['Final public audience remains undecided.'],
    volunteeredContributions: [
      { actorId: 'actor:hayden', category: 'compute', description: 'Up to $4.00 future compute authorization', status: 'acknowledged' },
      { actorId: 'actor:contributor-b', category: 'creative', description: 'Story and narration direction', status: 'acknowledged' },
      { actorId: 'actor:contributor-c', category: 'creative', description: 'Visual direction and title-card design', status: 'acknowledged' }
    ],
    privacy: 'private',
    audienceActorIds: ['actor:hayden', 'actor:contributor-b', 'actor:contributor-c'],
    acknowledgements: ['actor:hayden', 'actor:contributor-b', 'actor:contributor-c'].map(actorId => ({
      actorId,
      revision: 1,
      decision: 'acknowledge',
      decidedAt: timestamp
    })),
    proposedProductionId: PHASE16_IDS.production,
    formationReadiness: 'needs-agreement',
    provenance: {
      socialInstanceId,
      sourceSessionId: social.originatingSessionId,
      selectedBy: 'human:hayden',
      automaticConversion: false
    },
    createdAt: timestamp,
    updatedAt: timestamp,
    expiresAt: null
  };
  await repository.putValidated('sharedVisions', vision);
  const nextSocial = {
    ...social,
    sharedVisionIds: [...new Set([...(social.sharedVisionIds || []), vision.id])],
    revision: social.revision + 1,
    updatedAt: timestamp
  };
  await repository.putValidated('socialInstances', nextSocial);
  await createReceipt(repository, {
    action: 'shared-vision.created-from-selection',
    resources: [vision.id, ...selectedMessageIds],
    outcome: 'completed',
    reversible: true,
    detail: 'Created a non-executing Shared Vision from exact Human-selected Session records.'
  });
  return vision;
}

function agreementTerms(timestamp) {
  return {
    schema: 'gummy.production-agreement/v1',
    id: PHASE16_IDS.agreement,
    productionId: PHASE16_IDS.production,
    sharedVisionId: PHASE16_IDS.sharedVision,
    revision: 1,
    status: 'active',
    governance: 'equal-collective',
    participants: [
      { actorId: 'actor:hayden', role: 'creative sponsor', status: 'active', decisionWeight: 1, requiredApprovalClasses: ['formation', 'publication'] },
      { actorId: 'actor:contributor-b', role: 'writer', status: 'active', decisionWeight: 1, requiredApprovalClasses: ['formation', 'credit'] },
      { actorId: 'actor:contributor-c', role: 'designer', status: 'active', decisionWeight: 1, requiredApprovalClasses: ['formation', 'credit'] }
    ],
    decisionRules: {
      defaultThreshold: 'unanimous',
      customThreshold: null,
      protectedDecisions: {
        formation: 'unanimous',
        ownership: 'unanimous',
        publication: 'unanimous',
        amendment: 'unanimous'
      }
    },
    contributionPolicy: {
      ledgerRequired: true,
      acceptedCategories: ['compute', 'creative', 'asset', 'labor', 'expertise', 'rights', 'infrastructure', 'distribution'],
      valuationMode: 'descriptive'
    },
    creditPolicy: {
      creativeCreditSeparateFromOwnership: true,
      publicCreditRequiresApproval: true
    },
    ownershipPolicy: {
      mode: 'undecided',
      automaticFromContribution: false,
      terms: 'No ownership is assigned by the Phase 16 local proof.'
    },
    compensationPolicy: {
      mode: 'none',
      reimbursementRequiresSeparateApproval: true
    },
    revenuePolicy: {
      mode: 'undecided',
      noAutomaticParticipation: true
    },
    privacyPolicy: {
      sourceConversation: 'private',
      selectedRecordsOnly: true
    },
    withdrawalPolicy: {
      futureUseStopsWherePossible: true,
      historicalReceiptsRemain: true
    },
    disputePolicy: {
      mode: 'Human review before further execution'
    },
    publicationPolicy: {
      separateApprovalRequired: true,
      allowedAudiences: ['private', 'invite', 'unlisted', 'public'],
      requiredCreditApproval: true,
      requiredLikenessApproval: true,
      requiredVoiceApproval: true
    },
    amendmentPolicy: {
      createsNewRevision: true,
      staleApprovalsInvalid: true,
      threshold: 'unanimous'
    },
    approvals: ['actor:hayden', 'actor:contributor-b', 'actor:contributor-c'].map(actorId => ({
      actorId,
      revision: 1,
      decision: 'approve',
      decidedAt: timestamp,
      receiptId: null
    })),
    supersedesAgreementId: null,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export async function approveProductionAgreement(repository, { clock } = {}) {
  const existing = await repository.get('productionAgreements', PHASE16_IDS.agreement);
  if (existing) return existing;
  const vision = await repository.get('sharedVisions', PHASE16_IDS.sharedVision);
  assert(vision, 'Shared Vision is required before an Agreement.');
  const agreement = agreementTerms(now(clock));
  await repository.putValidated('productionAgreements', agreement);
  await repository.putValidated('sharedVisions', {
    ...vision,
    formationReadiness: 'ready',
    status: 'ready-to-form',
    updatedAt: now(clock)
  });
  await createReceipt(repository, {
    action: 'production-agreement.approved',
    resources: [agreement.id, `${agreement.id}@${agreement.revision}`],
    outcome: 'completed',
    reversible: false,
    detail: 'All required Actors approved the exact Agreement revision. No Production or Run was created by approval.'
  });
  return agreement;
}

export async function amendProductionAgreement(repository, { clock } = {}) {
  const active = await repository.get('productionAgreements', PHASE16_IDS.agreement);
  assert(active?.status === 'active', 'An active Agreement is required.');
  const id = 'production-agreement:friday-brainstorm-film:v2';
  const existing = await repository.get('productionAgreements', id);
  if (existing) return existing;
  const timestamp = now(clock);
  const amended = {
    ...clone(active),
    id,
    revision: 2,
    status: 'awaiting-approval',
    approvals: [],
    supersedesAgreementId: active.id,
    updatedAt: timestamp
  };
  await repository.putValidated('productionAgreements', amended);
  return amended;
}

function initialPool(timestamp) {
  const allocations = [
    ['actor:hayden', 4],
    ['actor:contributor-b', 3],
    ['actor:contributor-c', 3]
  ].map(([actorId, amount]) => ({
    actorId,
    proposedAmount: amount,
    maximumAmount: amount,
    percentageBasis: amount / 10,
    status: 'authorized',
    authorizationRequired: true,
    authorizationId: `authorization:${actorId.slice('actor:'.length)}:pool-v1`,
    providerCustomerRef: null,
    privateAmount: true,
    approvedRevision: 1,
    approvedAt: timestamp
  }));
  return {
    schema: 'gummy.production-pool/v1',
    id: PHASE16_IDS.pool,
    productionId: PHASE16_IDS.production,
    runId: null,
    agreementId: PHASE16_IDS.agreement,
    agreementRevision: 1,
    revision: 1,
    status: 'authorized',
    currency: 'USD',
    estimate: {
      minimum: 0,
      expected: 10,
      maximum: 10,
      basis: 'Demonstration estimate only; no provider charge or fund collection.',
      estimatedAt: timestamp,
      expiresAt: FAR_FUTURE
    },
    allocationMode: 'fixed-amount',
    allocations,
    resourceCommitments: [],
    recalculation: null,
    supersedesPoolId: null,
    priorAuthorizationIds: [],
    actual: {
      charged: 0,
      refunded: 0,
      released: 0,
      net: 0,
      providerEvidenceComplete: false,
      reconciledAt: null
    },
    paymentEvents: [],
    custodyModel: 'external-provider-no-internal-stored-value',
    internalCurrency: false,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export async function createProductionPool(repository, { clock } = {}) {
  const existing = await repository.get('productionPools', PHASE16_IDS.pool);
  if (existing) return existing;
  const agreement = await repository.get('productionAgreements', PHASE16_IDS.agreement);
  assert(agreement?.status === 'active', 'An active exact Agreement revision is required.');
  const pool = initialPool(now(clock));
  await repository.putValidated('productionPools', pool);
  await createReceipt(repository, {
    action: 'production-pool.authorizations-recorded',
    resources: [pool.id, ...pool.allocations.map(item => item.authorizationId)],
    outcome: 'completed',
    reversible: true,
    cost: { currency: 'USD', amount: 0 },
    detail: '$10 estimate with individual $4/$3/$3 maximum authorizations recorded. No funds were collected and no provider was charged.'
  });
  return pool;
}

export async function proposeFourthContributorAllocation(repository, { clock } = {}) {
  const existing = await repository.get('productionPools', PHASE16_IDS.revisedPool);
  if (existing) return existing;
  const original = await repository.get('productionPools', PHASE16_IDS.pool);
  assert(original?.status === 'authorized', 'The original authorized Pool is required.');
  const timestamp = now(clock);
  const revised = {
    ...clone(original),
    id: PHASE16_IDS.revisedPool,
    revision: 2,
    status: 'awaiting-authorizations',
    allocationMode: 'capped-equal',
    allocations: [
      ['actor:hayden', 2.5, 4, original.allocations[0].authorizationId],
      ['actor:contributor-b', 2.5, 3, original.allocations[1].authorizationId],
      ['actor:contributor-c', 2.5, 3, original.allocations[2].authorizationId],
      ['actor:contributor-d', 2.5, 2.5, null]
    ].map(([actorId, proposedAmount, maximumAmount, priorAuthorizationId]) => ({
      actorId,
      proposedAmount,
      maximumAmount,
      percentageBasis: 0.25,
      status: 'proposed',
      authorizationRequired: true,
      authorizationId: null,
      priorAuthorizationId,
      providerCustomerRef: null,
      privateAmount: true,
      approvedRevision: null,
      approvedAt: null
    })),
    recalculation: {
      reason: 'Contributor D joined before the Run.',
      fromRevision: 1,
      toRevision: 2,
      increasesExistingMaximum: false,
      changesCompletedCharges: false,
      requiresFreshAuthorizations: true,
      proposedAt: timestamp
    },
    supersedesPoolId: original.id,
    priorAuthorizationIds: original.allocations.map(item => item.authorizationId),
    actual: clone(original.actual),
    paymentEvents: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
  await repository.putValidated('productionPools', revised);
  await createReceipt(repository, {
    action: 'production-pool.future-allocation-proposed',
    resources: [original.id, revised.id, ...revised.priorAuthorizationIds],
    outcome: 'completed',
    reversible: true,
    cost: { currency: 'USD', amount: 0 },
    detail: 'Proposed $2.50 future shares for four contributors. Existing maximum authorizations and completed charges remain unchanged.'
  });
  return revised;
}

function contributionEntry({
  id,
  actorId,
  category,
  description,
  evidenceRefs,
  timestamp,
  quantity = null,
  unit = null
}) {
  return {
    id,
    contributorActorId: actorId,
    category,
    description,
    quantity,
    unit,
    declaredValue: null,
    status: 'accepted',
    creditEffect: {
      mode: ['creative-direction', 'writing', 'design', 'technical'].includes(category) ? 'public-credit' : 'private-credit',
      label: description
    },
    ownershipEffect: {
      automatic: false,
      mode: 'agreement-defined',
      termsRef: `${PHASE16_IDS.agreement}@1`
    },
    compensationEffect: {
      mode: 'agreement-defined',
      termsRef: `${PHASE16_IDS.agreement}@1`
    },
    evidenceRefs,
    acknowledgements: [{
      actorId: 'actor:hayden',
      decision: 'acknowledge',
      decidedAt: timestamp
    }],
    supersedesEntryId: null,
    createdAt: timestamp,
    updatedAt: null
  };
}

export async function createContributionLedger(repository, { clock } = {}) {
  const existing = await repository.get('contributionLedgers', PHASE16_IDS.ledger);
  if (existing) return existing;
  const timestamp = now(clock);
  const ledger = {
    schema: 'gummy.contribution-ledger/v1',
    id: PHASE16_IDS.ledger,
    productionId: PHASE16_IDS.production,
    agreementId: PHASE16_IDS.agreement,
    agreementRevision: 1,
    revision: 1,
    appendOnly: true,
    entries: [
      contributionEntry({
        id: 'contribution:friday:creative-direction',
        actorId: 'actor:hayden',
        category: 'creative-direction',
        description: 'Initial intent and creative direction',
        evidenceRefs: [{ kind: 'session-record', id: 'message:friday:118', revision: 1, hash: null }],
        timestamp
      }),
      contributionEntry({
        id: 'contribution:friday:writing',
        actorId: 'actor:contributor-b',
        category: 'writing',
        description: 'Story and opening narration direction',
        evidenceRefs: [{ kind: 'session-record', id: 'message:friday:124', revision: 1, hash: null }],
        timestamp
      }),
      contributionEntry({
        id: 'contribution:friday:design',
        actorId: 'actor:contributor-c',
        category: 'design',
        description: 'Visual direction and title-card design',
        evidenceRefs: [{ kind: 'session-record', id: 'message:friday:131', revision: 1, hash: null }],
        timestamp
      }),
      contributionEntry({
        id: 'contribution:friday:compute-authorization',
        actorId: 'actor:hayden',
        category: 'compute',
        description: 'Authorized up to $4.00 for a future provider route; no charge occurred',
        evidenceRefs: [{ kind: 'receipt', id: PHASE16_IDS.pool, revision: 1, hash: null }],
        timestamp,
        quantity: 4,
        unit: 'USD maximum authorization'
      }),
      contributionEntry({
        id: 'contribution:friday:agreement-decision',
        actorId: 'actor:hayden',
        category: 'decision',
        description: 'Approved exact Production Agreement revision 1',
        evidenceRefs: [{ kind: 'external', id: PHASE16_IDS.agreement, revision: 1, hash: null }],
        timestamp
      })
    ],
    createdAt: timestamp,
    updatedAt: timestamp
  };
  await repository.putValidated('contributionLedgers', ledger);
  return ledger;
}

export async function appendContribution(repository, entryInput, { clock } = {}) {
  const ledger = await repository.get('contributionLedgers', PHASE16_IDS.ledger);
  assert(ledger?.appendOnly, 'Append-only Contribution Ledger is required.');
  assert(!ledger.entries.some(entry => entry.id === entryInput.id), 'Contribution IDs are immutable and unique.');
  const entry = contributionEntry({ ...entryInput, timestamp: now(clock) });
  const next = {
    ...ledger,
    revision: ledger.revision + 1,
    entries: [...ledger.entries, entry],
    updatedAt: now(clock)
  };
  await repository.putValidated('contributionLedgers', next);
  return next;
}

export async function formProduction(repository, { clock } = {}) {
  const existing = await repository.get('productionFormations', PHASE16_IDS.formation);
  if (existing) return existing;
  const [vision, agreement, pool, ledger, social] = await Promise.all([
    repository.get('sharedVisions', PHASE16_IDS.sharedVision),
    repository.get('productionAgreements', PHASE16_IDS.agreement),
    repository.get('productionPools', PHASE16_IDS.pool),
    repository.get('contributionLedgers', PHASE16_IDS.ledger),
    repository.get('socialInstances', PHASE16_IDS.socialInstance)
  ]);
  assert(vision?.formationReadiness === 'ready', 'Shared Vision must be ready.');
  assert(agreement?.status === 'active' && agreement.approvals.every(item => item.revision === agreement.revision && item.decision === 'approve'), 'Exact Agreement approval is required.');
  assert(pool && ledger && social, 'Pool, Ledger, and Social Instance are required.');
  const timestamp = now(clock);
  const receipt = await createReceipt(repository, {
    action: 'production.formed-from-shared-vision',
    resources: [vision.id, agreement.id, pool.id, ledger.id, PHASE16_IDS.production],
    outcome: 'completed',
    reversible: false,
    detail: 'Recorded immutable Production formation from the exact Shared Vision and Agreement revisions. No Run executed.'
  });
  const formation = {
    schema: 'gummy.production-formation/v1',
    id: PHASE16_IDS.formation,
    sharedVisionId: vision.id,
    sharedVisionRevision: vision.revision,
    productionId: PHASE16_IDS.production,
    agreementId: agreement.id,
    agreementRevision: agreement.revision,
    productionPoolId: pool.id,
    contributionLedgerId: ledger.id,
    source: {
      type: 'social-instance',
      id: social.id,
      recordRefs: vision.origin.recordRefs.map(item => item.id)
    },
    initialActors: agreement.participants.map(item => ({ actorId: item.actorId, role: item.role })),
    initialSourceGummyIds: ['gummy:project-brief'],
    initialCommitmentIds: pool.allocations.map(item => item.authorizationId),
    formationMethod: 'shared-vision-flow',
    approvals: agreement.approvals.map(item => ({
      actorId: item.actorId,
      decision: 'approve-formation',
      decidedAt: item.decidedAt
    })),
    limitations: [
      'Local deterministic proof only.',
      'No funds collected.',
      'No provider charge occurred.',
      'No remote presence verified.'
    ],
    receiptId: receipt.id,
    immutable: true,
    createdAt: timestamp
  };
  await repository.putValidated('productionFormations', formation);
  await repository.putValidated('sharedVisions', {
    ...vision,
    status: 'formed',
    updatedAt: timestamp
  });
  await repository.putValidated('socialInstances', {
    ...social,
    productionIds: [...new Set([...(social.productionIds || []), PHASE16_IDS.production])],
    revision: social.revision + 1,
    updatedAt: timestamp
  });
  return formation;
}

export async function assertFormationImmutable(repository, attempted) {
  const existing = await repository.get('productionFormations', attempted.id);
  if (existing && JSON.stringify(existing) !== JSON.stringify(attempted)) {
    throw new Error('Production Formation Event is immutable.');
  }
  return true;
}

function distributionPlan({
  id,
  type,
  placeId,
  routeStatus,
  status,
  artifact,
  acceptanceReceiptId,
  timestamp
}) {
  return {
    schema: 'gummy.distribution-plan/v1',
    id,
    productionId: PHASE16_IDS.production,
    revision: 1,
    status,
    distributingActorId: 'actor:hayden',
    sourceArtifacts: [{
      gummyId: artifact.id,
      revision: Number(artifact.revision),
      hash: String(artifact.hash),
      acceptanceReceiptId
    }],
    destination: {
      type,
      placeId,
      channelRef: null,
      externalRoute: null,
      routeStatus
    },
    metadata: {
      title: 'Friday Brainstorm Film',
      description: type === 'radio' ? 'Private aftershow plan' : type === 'channels' ? 'Premiere plan' : 'Private approved export',
      episodeType: type === 'radio' ? 'aftershow' : null,
      coverGummyId: null,
      scheduledFor: null
    },
    audience: type === 'private-export' ? 'private' : 'invite',
    audienceActorIds: PHASE16_ACTORS.map(actor => actor.id),
    rights: {
      verified: true,
      licenseSummary: 'Repository-owned deterministic proof assets only.',
      commercialUse: 'prohibited',
      rightsReceiptIds: []
    },
    credits: {
      agreementId: PHASE16_IDS.agreement,
      ledgerId: PHASE16_IDS.ledger,
      approved: true,
      publicCreditLines: ['Hayden · creative direction', 'Contributor B · writing', 'Contributor C · design']
    },
    disclosures: {
      syntheticMedia: true,
      syntheticVoice: false,
      aiRepresentation: true,
      text: 'Deterministic local fixture. Contributor B is visibly AI represented; no remote identity or final media is claimed.'
    },
    likenessPermissions: [],
    voicePermissions: [],
    privacyExclusions: ['unselected-conversation', 'private-budget-details', 'credentials'],
    moderation: { reviewed: true, remoteServiceConnected: false },
    monetization: 'none',
    retention: { mode: 'local-until-reset' },
    approvals: [
      {
        class: 'rights',
        actorId: 'actor:hayden',
        revision: 1,
        decision: 'approve',
        decidedAt: timestamp,
        receiptId: null
      },
      {
        class: 'credit',
        actorId: 'actor:hayden',
        revision: 1,
        decision: 'approve',
        decidedAt: timestamp,
        receiptId: null
      },
      {
        class: 'publication',
        actorId: 'actor:hayden',
        revision: 1,
        decision: type === 'private-export' ? 'approve' : 'needs-change',
        decidedAt: timestamp,
        receiptId: null
      }
    ],
    releaseId: null,
    supersedesPlanId: null,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export async function prepareDistributionPlans(repository, {
  artifact,
  acceptanceReceiptId,
  clock
}) {
  assert(artifact?.status === 'accepted', 'An exact Human-accepted Artifact is required.');
  assert(acceptanceReceiptId?.startsWith('receipt:'), 'Acceptance Receipt is required.');
  const timestamp = now(clock);
  const plans = [
    distributionPlan({
      id: 'distribution-plan:friday-film:radio:v1',
      type: 'radio',
      placeId: 'app:gummy-radio',
      routeStatus: 'local',
      status: 'needs-voice-approval',
      artifact,
      acceptanceReceiptId,
      timestamp
    }),
    distributionPlan({
      id: 'distribution-plan:friday-film:channels:v1',
      type: 'channels',
      placeId: 'app:gummy-channels',
      routeStatus: 'service-required',
      status: 'blocked',
      artifact,
      acceptanceReceiptId,
      timestamp
    }),
    distributionPlan({
      id: 'distribution-plan:friday-film:private-export:v1',
      type: 'private-export',
      placeId: null,
      routeStatus: 'local',
      status: 'ready-for-publication',
      artifact,
      acceptanceReceiptId,
      timestamp
    })
  ];
  for (const plan of plans) {
    if (!(await repository.get('distributionPlans', plan.id))) {
      await repository.putValidated('distributionPlans', plan);
    }
  }
  return Promise.all(plans.map(plan => repository.get('distributionPlans', plan.id)));
}

export async function releaseApprovedPrivateDestination(repository, { clock } = {}) {
  const plan = await repository.get('distributionPlans', 'distribution-plan:friday-film:private-export:v1');
  assert(plan?.status === 'ready-for-publication', 'A ready private Distribution Plan is required.');
  const publication = plan.approvals.find(item => item.class === 'publication');
  assert(publication?.decision === 'approve' && publication.revision === plan.revision, 'Exact publication approval is required.');
  const id = 'distribution-release:friday-film:private-export:1';
  const existing = await repository.get('distributionReleases', id);
  if (existing) return existing;
  const timestamp = now(clock);
  const receipt = await createReceipt(repository, {
    action: 'distribution.private-export.released',
    resources: [plan.id, ...plan.sourceArtifacts.map(item => item.gummyId)],
    outcome: 'completed',
    reversible: false,
    cost: { currency: 'USD', amount: 0 },
    detail: 'Explicitly released one approved private local export. Radio and Channels plans remain separate and unpublished.'
  });
  const release = {
    id,
    schema: 'gummy.distribution-release/v1',
    distributionPlanId: plan.id,
    distributionPlanRevision: plan.revision,
    sourceArtifacts: clone(plan.sourceArtifacts),
    destination: clone(plan.destination),
    audience: plan.audience,
    publishingActorId: 'actor:hayden',
    operatorType: 'human',
    operatorId: 'human:hayden',
    providerResponse: null,
    cost: { currency: 'USD', amount: 0 },
    receiptId: receipt.id,
    immutable: true,
    publishedAt: timestamp
  };
  await repository.put('distributionReleases', release, { validate: false });
  return release;
}

function projectionRef(record, {
  title = record.title || record.name || record.id,
  status = record.status || 'recorded',
  revision = record.revision ?? null,
  sourceId = null,
  detail = null
} = {}) {
  return { id: record.id, title, status, revision, sourceId, detail };
}

export async function generateCommandCenterView(repository, productionRuntime, { clock } = {}) {
  const [
    socialInstances,
    visions,
    pools,
    ledgers,
    plans,
    releases,
    presence,
    repositoryWorkOrders,
    repositoryReturns,
    repositoryReceipts,
    grants
  ] = await Promise.all([
    repository.all('socialInstances'),
    repository.all('sharedVisions'),
    repository.all('productionPools'),
    repository.all('contributionLedgers'),
    repository.all('distributionPlans'),
    repository.all('distributionReleases'),
    repository.all('actorPresence'),
    repository.all('workOrders'),
    repository.all('returns'),
    repository.all('receipts'),
    repository.all('grants')
  ]);
  const runtime = productionRuntime || {
    productions: [], agents: [], workOrders: [], returns: [], receipts: [], productionRuns: []
  };
  const workOrders = [...repositoryWorkOrders, ...(runtime.workOrders || [])];
  const returns = [...repositoryReturns, ...(runtime.returns || [])];
  const receipts = [...repositoryReceipts, ...(runtime.receipts || [])];
  const activeProductions = (runtime.productions || []).filter(item => !['completed', 'cancelled'].includes(item.status));
  const activeAgents = (runtime.agents || []).filter(item => ['active', 'available'].includes(item.status));
  const blockedPlans = plans.filter(item => ['blocked', 'needs-rights', 'needs-credit-approval', 'needs-likeness-approval', 'needs-voice-approval'].includes(item.status));
  const waitingPlans = plans.filter(item => item.status !== 'published');
  const expiring = grants.filter(item => item.expiresAt && Date.parse(item.expiresAt) < Date.parse('2100-01-01T00:00:00.000Z'));
  const contributionChanges = ledgers.flatMap(ledger => ledger.entries.slice(-3).map(entry => projectionRef(
    { ...entry, revision: ledger.revision },
    { title: entry.description, status: entry.status, sourceId: ledger.id, detail: entry.category }
  )));
  const sourceRevisions = [
    ...socialInstances,
    ...visions,
    ...pools,
    ...ledgers,
    ...plans,
    ...activeProductions
  ].map(item => ({ kind: item.schema || 'production', id: item.id, revision: item.revision ?? null }));
  const attentionItems = [
    ...waitingPlans.map(plan => ({
      id: `attention:${plan.id.replaceAll(':', '-')}`,
      class: plan.status === 'ready-for-publication' ? 'ready-to-publish' : 'blocked',
      title: `${plan.destination.type} Distribution Plan`,
      sourceObject: { kind: 'distribution-plan', id: plan.id, revision: plan.revision },
      materialState: 'proposal',
      authorityRequired: 'Separate exact publication approval',
      nextVerb: plan.status === 'ready-for-publication' ? 'Publish' : 'Review blockers',
      route: plan.destination.routeStatus,
      cost: { currency: 'USD', estimate: 0, maximum: 0, actual: 0 },
      receiptIds: [],
      explanation: plan.status === 'blocked'
        ? 'The destination service is not connected; nothing was published.'
        : 'This plan is ready for the Human to release separately from result acceptance.',
      generatedBy: 'zeke'
    })),
    ...pools.filter(pool => pool.status === 'awaiting-authorizations').map(pool => ({
      id: `attention:${pool.id.replaceAll(':', '-')}`,
      class: 'needs-approval',
      title: 'Revised future contribution proposal',
      sourceObject: { kind: 'production-pool', id: pool.id, revision: pool.revision },
      materialState: 'proposal',
      authorityRequired: 'Fresh individual maximum authorizations',
      nextVerb: 'Choose your contribution',
      route: 'Master Control',
      cost: { currency: 'USD', estimate: 10, maximum: 10, actual: 0 },
      receiptIds: [],
      explanation: 'Contributor D joined. Existing $4/$3/$3 maximum authorizations remain unchanged.',
      generatedBy: 'zeke'
    }))
  ];
  return {
    schema: 'gummy.command-center-view/v1',
    id: 'command-center-view:hayden:phase16',
    ownerActorId: 'actor:hayden',
    attentionItems,
    activeProductions: activeProductions.map(item => projectionRef(item)),
    activeSocialInstances: socialInstances.filter(item => item.status !== 'archived').map(item => projectionRef(item)),
    sharedVisions: visions.map(item => projectionRef(item, { title: item.goal })),
    activeAgents: activeAgents.map(item => projectionRef(item)),
    workOrders: workOrders.map(item => projectionRef(item, { title: item.goal || item.id })),
    jobs: (runtime.productionRuns || []).map(item => projectionRef(item, { title: item.id })),
    returns: returns.map(item => projectionRef(item, { title: item.summary || item.id, status: item.result || item.status || 'recorded' })),
    receipts: receipts.slice(-20).map(item => projectionRef(item, { title: item.action, status: item.outcome })),
    productionPools: pools.map(item => projectionRef(item, { title: `$${item.estimate.expected.toFixed(2)} Production Pool` })),
    contributionChanges,
    waitingHumanDecisions: [
      ...waitingPlans.map(item => projectionRef(item, { title: `${item.destination.type} release decision` })),
      ...workOrders.filter(item => ['awaiting-approval', 'held'].includes(item.status)).map(item => projectionRef(item, { title: item.goal || item.id }))
    ],
    blockers: blockedPlans.map(item => projectionRef(item, { title: `${item.destination.type} route blocked`, detail: item.destination.routeStatus })),
    expiringPermissions: expiring.map(item => projectionRef(item, { title: item.action, status: item.revoked ? 'revoked' : 'expires', revision: null })),
    presenceChanges: presence.map(item => projectionRef(item, { title: item.actorId, status: resolveActorPresence(item).state })),
    distributionPlans: plans.map(item => projectionRef(item, { title: `${item.destination.type} Distribution Plan` })),
    resumeOpportunities: socialInstances.map(item => projectionRef(item, { title: `Continue ${item.title}`, status: item.status })),
    sourceRevisions,
    generatedAt: now(clock),
    authoritySource: 'underlying-objects-and-master-control',
    executing: false
  };
}

export async function runLivingCollaborationProof(repository, productionRuntime, {
  persistProductionRuntime,
  clock
} = {}) {
  await ensureLivingCollaborationRecords(repository, { clock });
  const social = await repository.get('socialInstances', PHASE16_IDS.socialInstance);
  if (social.status !== 'active') await resumeSocialInstance(repository, social.id, { clock });
  await createSharedVisionFromSelection(repository, { clock });
  await approveProductionAgreement(repository, { clock });
  await createProductionPool(repository, { clock });
  await proposeFourthContributorAllocation(repository, { clock });
  await createContributionLedger(repository, { clock });
  const formation = await formProduction(repository, { clock });

  let runtime = clone(productionRuntime);
  let production = runtime.productions.find(item => item.id === PHASE16_IDS.production);
  if (!production) {
    const created = createProduction(runtime, {
      id: PHASE16_IDS.production,
      title: 'Friday Brainstorm Film',
      description: 'Deterministic local Production formed from the Friday Brainstorm Crew Shared Vision.',
      visibility: 'private',
      audience: 'private-collaboration',
      sourceGummyIds: [...PROOF_SOURCE_GUMMIES]
    });
    runtime = addNightGummyLaunchRoster(created.runtime, created.production.id, 'shared-vision-formation');
    production = created.production;
    for (const actorId of ['actor:imagehoss', 'actor:3d-bee', 'actor:videoboss', 'actor:project-composer', 'actor:gummy-storage']) {
      runtime = (await saveProductionActorConfiguration(runtime, production.id, actorId, {})).runtime;
    }
    runtime = compileActorPlan(runtime, production.id).runtime;
  }

  let run = runtime.productionRuns.find(item => item.productionId === production.id);
  let results = run?.resultGummyIds.map(id => runtime.gummies.find(item => item.id === id)).filter(Boolean) || [];
  if (!run) {
    const made = await makeProduction(runtime, production.id, { approvedBy: 'human:hayden' });
    assert(!made.denied, `Make Production blocked: ${(made.blockers || []).join(', ')}`);
    runtime = made.runtime;
    run = made.run;
    results = made.results;
  }

  let acceptedResult = results.find(item => item.status === 'accepted');
  let acceptanceReceipt = null;
  if (!acceptedResult) {
    const result = results.find(item => item.creatorActorId === 'actor:imagehoss') || results[0];
    const accepted = acceptProductionResult(runtime, {
      productionId: production.id,
      resultGummyId: result.id,
      role: 'shared-vision-film-key-art'
    });
    assert(!accepted.denied, `Result acceptance blocked: ${accepted.reason}`);
    runtime = accepted.runtime;
    acceptedResult = accepted.result;
    acceptanceReceipt = accepted.receipt;
  } else {
    acceptanceReceipt = [...runtime.receipts].reverse().find(item => (
      item.action === 'production-result.accepted' && item.resources?.includes(acceptedResult.id)
    ));
  }

  await appendContribution(repository, {
    id: `contribution:friday:deterministic-run:${run.id.slice('production-run:'.length)}`,
    actorId: 'actor:hayden',
    category: 'compute',
    description: 'Deterministic local Production Run completed at $0 actual provider cost',
    quantity: 1,
    unit: 'local deterministic Run',
    evidenceRefs: [
      { kind: 'return', id: run.returnIds[0], revision: null, hash: null },
      { kind: 'receipt', id: run.receiptIds[0], revision: null, hash: null }
    ]
  }, { clock }).catch(error => {
    if (!/immutable and unique/.test(error.message)) throw error;
  });

  await prepareDistributionPlans(repository, {
    artifact: acceptedResult,
    acceptanceReceiptId: acceptanceReceipt.id,
    clock
  });
  const release = await releaseApprovedPrivateDestination(repository, { clock });
  if (persistProductionRuntime) await persistProductionRuntime(runtime);
  const commandCenter = await generateCommandCenterView(repository, runtime, { clock });
  return {
    runtime,
    socialInstance: await repository.get('socialInstances', PHASE16_IDS.socialInstance),
    sharedVision: await repository.get('sharedVisions', PHASE16_IDS.sharedVision),
    agreement: await repository.get('productionAgreements', PHASE16_IDS.agreement),
    originalPool: await repository.get('productionPools', PHASE16_IDS.pool),
    revisedPool: await repository.get('productionPools', PHASE16_IDS.revisedPool),
    ledger: await repository.get('contributionLedgers', PHASE16_IDS.ledger),
    formation,
    production: runtime.productions.find(item => item.id === PHASE16_IDS.production),
    run,
    acceptedResult,
    release,
    distributionPlans: await repository.all('distributionPlans'),
    commandCenter
  };
}
