import { createId, sha256 } from './hash.js';
import { createReceipt } from './records.js';

export const PRESENCE_STATES = Object.freeze([
  'offline', 'away', 'available', 'available-for-chat', 'in-chat',
  'live', 'busy', 'unavailable-capability'
]);

export const LIVE_CAPABILITIES = Object.freeze(['chat', 'audio', 'video', 'screen']);
export const FEEDBACK_CATEGORIES = Object.freeze([
  'confusion', 'bug', 'delight', 'missing-capability', 'trust-privacy'
]);
export const COHORT_EVENTS = Object.freeze([
  'session-started', 'onboarding-completed', 'production-choice',
  'blocked-action', 'feedback-submitted'
]);

const PERSONAL_ACTOR_ID = 'actor:hayden';
const GLOPPER_ACTOR_ID = 'actor:glopper';
const GLOPPER_AGENT_ID = 'agent:glopper-web';
const CHAT_TTL_MS = 5 * 60 * 1000;
const now = clock => (clock ? clock() : new Date().toISOString());

function assertChoice(value, allowed, label) {
  if (!allowed.includes(value)) throw new Error(`${label} is not supported.`);
}

function messageText(value) {
  const text = String(value || '').trim();
  if (!text) throw new Error('Message text is required.');
  if (text.length > 8_000) throw new Error('Message text must be 8,000 characters or fewer.');
  return text;
}

export async function ensureLivingActorRecords(repository, {
  providerConfigured = false,
  testMode = false,
  clock
} = {}) {
  const human = await repository.get('humans', 'human:hayden');
  if (!human) return false;
  const timestamp = now(clock);
  if (!(await repository.get('actors', GLOPPER_ACTOR_ID))) {
    await repository.putValidated('actors', {
      schema: 'gummy.actor/v0',
      id: GLOPPER_ACTOR_ID,
      address: '@glopper',
      kind: 'service',
      name: 'Glopper',
      status: 'active',
      humanAuthorityIds: [human.id],
      moldIds: [],
      agentIds: [GLOPPER_AGENT_ID],
      gummyIds: [],
      deployment: {
        mode: 'governed',
        authoritativeLocation: 'Local Gummy Box',
        lastOpenedAt: timestamp
      },
      syncPolicy: {
        mode: 'none',
        directions: [],
        allowedData: ['explicit-chat-context'],
        requiresApproval: true
      },
      createdAt: timestamp,
      updatedAt: timestamp,
      extensions: {
        serviceActor: true,
        actorAgentBoundary: `${GLOPPER_ACTOR_ID} is the addressable surface; ${GLOPPER_AGENT_ID} is the disclosed operator only when approved.`
      }
    });
  }
  if (!(await repository.get('molds', 'mold:glopper:private-chat-v1'))) {
    await repository.putValidated('molds', {
      schema: 'gummy.mold/v0',
      id: 'mold:glopper:private-chat-v1',
      actorId: GLOPPER_ACTOR_ID,
      name: 'Glopper Private Chat',
      handle: '@glopper',
      status: 'active',
      allowedHumanIds: [human.id],
      allowedAgentIds: [GLOPPER_AGENT_ID],
      role: 'private conversational companion',
      context: 'One isolated Human-approved chat thread.',
      representation: {
        displayName: 'Glopper',
        description: 'Governed service Actor chat surface',
        shape: 'soft-square',
        primaryColor: '#4B187A',
        secondaryColor: '#7C2FD0',
        accentColor: '#F2B544'
      },
      permissions: {
        capabilities: ['chat.reply'],
        readScopes: ['selected-private-chat-thread'],
        writeScopes: ['selected-private-chat-thread'],
        publishScopes: [],
        requiresHumanApproval: true
      },
      runtimePolicy: {
        allowedLocalities: ['cloud'],
        allowedRuntimeClasses: ['server'],
        networkPolicy: 'approved-provider-only'
      },
      syncPolicy: { mode: 'none', allowedData: ['explicit-chat-context'], directions: [] },
      disclosure: {
        operatorType: 'agent',
        agentDisclosureRequired: true,
        licenseDisclosure: 'Private governed chat; no public identity or live presence claim.'
      },
      issuedBy: human.id,
      issuedAt: timestamp,
      updatedAt: timestamp
    });
  }
  if (!(await repository.get('actorPresence', PERSONAL_ACTOR_ID))) {
    await repository.put('actorPresence', {
      id: PERSONAL_ACTOR_ID,
      actorId: PERSONAL_ACTOR_ID,
      state: 'offline',
      source: 'human-controlled',
      updatedAt: timestamp,
      expiresAt: null,
      detail: 'Only you can publish this personal Actor presence from this browser.'
    }, { validate: false });
  }
  await setActorPresence(repository, {
    actorId: GLOPPER_ACTOR_ID,
    state: providerConfigured || testMode ? 'available-for-chat' : 'unavailable-capability',
    source: 'service-derived',
    ttlMs: CHAT_TTL_MS,
    detail: providerConfigured || testMode
      ? 'Private governed chat is available.'
      : 'The server chat provider is not configured.',
    recordReceipt: false,
    clock
  });
  return true;
}

export function resolvePresence(record, at = new Date().toISOString()) {
  if (!record) return {
    state: 'offline',
    stale: true,
    detail: 'No current presence has been published.',
    updatedAt: null,
    expiresAt: null
  };
  if (record.expiresAt && Date.parse(record.expiresAt) <= Date.parse(at)) {
    return {
      ...record,
      state: 'offline',
      stale: true,
      detail: 'Presence expired; current state is unknown and shown offline.'
    };
  }
  return { ...record, stale: false };
}

export async function setActorPresence(repository, {
  actorId,
  state,
  source,
  ttlMs = null,
  detail = '',
  recordReceipt = true,
  clock
}) {
  assertChoice(state, PRESENCE_STATES, 'Presence state');
  if (!['human-controlled', 'service-derived', 'session-derived'].includes(source)) {
    throw new Error('Presence source is not supported.');
  }
  if (actorId === PERSONAL_ACTOR_ID && source !== 'human-controlled') {
    throw new Error('Personal Actor presence must remain Human-controlled.');
  }
  const timestamp = now(clock);
  const record = {
    id: actorId,
    actorId,
    state,
    source,
    updatedAt: timestamp,
    expiresAt: ttlMs ? new Date(Date.parse(timestamp) + ttlMs).toISOString() : null,
    detail
  };
  await repository.put('actorPresence', record, { validate: false });
  if (recordReceipt) {
    await createReceipt(repository, {
      action: 'set-actor-presence',
      resources: [actorId],
      outcome: 'completed',
      reversible: true,
      detail: `${actorId} presence set to ${state} by ${source}.`,
      extensions: { presence: record }
    });
  }
  return record;
}

export async function openPrivateChat(repository, {
  participantActorId,
  title,
  mode = participantActorId === GLOPPER_ACTOR_ID ? 'governed-agent' : 'human-manual',
  clock
}) {
  const actor = await repository.get('actors', participantActorId);
  if (!actor) throw new Error(`Actor not found: ${participantActorId}`);
  const timestamp = now(clock);
  const id = createId('chat');
  const session = {
    id,
    schema: 'gummy.private-chat/v1',
    title: title || `Private chat with ${actor.name}`,
    ownerActorId: PERSONAL_ACTOR_ID,
    participantActorIds: [PERSONAL_ACTOR_ID, participantActorId],
    mode,
    visibility: 'private',
    status: 'open',
    createdAt: timestamp,
    updatedAt: timestamp,
    closedAt: null,
    transcriptGummyId: `gummy:chat-transcript:${id.slice('chat:'.length)}`,
    governance: mode === 'governed-agent' ? {
      actorId: GLOPPER_ACTOR_ID,
      agentId: GLOPPER_AGENT_ID,
      actorIsAgent: false,
      moldId: 'mold:glopper:private-chat-v1',
      capability: 'chat.reply',
      providerDisclosureRequired: true,
      maxCostUsdPerTurn: 0.05
    } : {
      actorId: participantActorId,
      agentId: null,
      actorIsAgent: false,
      capability: 'human.manual-chat',
      providerDisclosureRequired: false,
      maxCostUsdPerTurn: 0
    }
  };
  await repository.put('chatSessions', session, { validate: false });
  await updateTranscriptGummy(repository, id, { clock });
  await createReceipt(repository, {
    action: 'open-private-actor-chat',
    resources: [id, participantActorId],
    resultGummyIds: [session.transcriptGummyId],
    outcome: 'completed',
    reversible: true,
    detail: `${session.title} opened as an isolated local thread.`,
    extensions: { mode, participantActorIds: session.participantActorIds }
  });
  return session;
}

export async function appendChatMessage(repository, {
  sessionId,
  senderActorId,
  text,
  status = 'delivered',
  provider = null,
  cost = null,
  error = null,
  idempotencyKey = null,
  clock
}) {
  const chat = await repository.get('chatSessions', sessionId);
  if (!chat || chat.status === 'deleted') throw new Error('Chat is unavailable.');
  if (chat.status !== 'open') throw new Error('Reopen this chat before sending a message.');
  if (!chat.participantActorIds.includes(senderActorId)) throw new Error('Sender is outside this private chat.');
  const timestamp = now(clock);
  const message = {
    id: createId('chat-message'),
    schema: 'gummy.chat-message/v1',
    sessionId,
    senderActorId,
    text: messageText(text),
    revision: 1,
    status,
    provider,
    cost,
    error,
    idempotencyKey,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
    history: []
  };
  await repository.put('chatMessages', message, { validate: false });
  await repository.put('chatSessions', { ...chat, updatedAt: timestamp }, { validate: false });
  await updateTranscriptGummy(repository, sessionId, { clock });
  return message;
}

export async function updateChatMessage(repository, {
  messageId,
  text,
  deleteMessage = false,
  clock
}) {
  const message = await repository.get('chatMessages', messageId);
  if (!message) throw new Error('Message not found.');
  const timestamp = now(clock);
  const history = [
    ...(message.history || []),
    {
      revision: message.revision,
      textHash: await sha256(message.text),
      editedAt: timestamp,
      action: deleteMessage ? 'deleted' : 'edited'
    }
  ];
  const next = {
    ...message,
    text: deleteMessage ? '' : messageText(text),
    revision: message.revision + 1,
    updatedAt: timestamp,
    deletedAt: deleteMessage ? timestamp : null,
    history
  };
  await repository.put('chatMessages', next, { validate: false });
  const chat = await updateTranscriptGummy(repository, message.sessionId, { clock });
  await createReceipt(repository, {
    action: deleteMessage ? 'delete-chat-message' : 'edit-chat-message',
    resources: [message.sessionId, message.id],
    resultGummyIds: [chat.transcriptGummyId],
    outcome: 'completed',
    reversible: !deleteMessage,
    detail: `Message revision ${next.revision} ${deleteMessage ? 'tombstoned' : 'saved'} with prior hash evidence.`
  });
  return next;
}

export async function updateTranscriptGummy(repository, sessionId, { clock } = {}) {
  const chat = await repository.get('chatSessions', sessionId);
  if (!chat) throw new Error('Chat not found.');
  const messages = (await repository.all('chatMessages'))
    .filter(item => item.sessionId === sessionId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const transcript = JSON.stringify({
    schema: 'gummy.chat-transcript/v1',
    chat: {
      id: chat.id,
      title: chat.title,
      participantActorIds: chat.participantActorIds,
      mode: chat.mode,
      visibility: chat.visibility,
      status: chat.status
    },
    messages: messages.map(item => ({
      id: item.id,
      senderActorId: item.senderActorId,
      text: item.deletedAt ? '[deleted]' : item.text,
      revision: item.revision,
      status: item.status,
      provider: item.provider,
      cost: item.cost,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      deletedAt: item.deletedAt,
      history: item.history
    }))
  }, null, 2);
  const existing = await repository.get('gummies', chat.transcriptGummyId);
  const timestamp = now(clock);
  const gummy = {
    schema: 'gummy.gummy/v0',
    id: chat.transcriptGummyId,
    kind: 'conversation',
    title: `${chat.title} transcript`,
    ownerActorId: PERSONAL_ACTOR_ID,
    creatorActorId: PERSONAL_ACTOR_ID,
    visibility: 'private',
    audienceActorIds: chat.participantActorIds,
    revision: (existing?.revision || 0) + 1,
    content: {
      mediaType: 'application/vnd.gummy.chat-transcript+json',
      inlineText: transcript,
      sizeBytes: new TextEncoder().encode(transcript).byteLength
    },
    hash: { algorithm: 'sha256', value: await sha256(transcript) },
    capabilities: ['read', 'export', 'delete'],
    provenance: { receiptIds: existing?.provenance?.receiptIds || [] },
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
    extensions: {
      chatSessionId: sessionId,
      actorAgentBoundary: chat.governance,
      generatedFromLocalRecords: true
    }
  };
  await repository.putValidated('gummies', gummy);
  return { ...chat, transcriptGummyId: gummy.id, transcript: gummy };
}

export async function setChatStatus(repository, sessionId, status, { clock } = {}) {
  assertChoice(status, ['open', 'closed'], 'Chat status');
  const chat = await repository.get('chatSessions', sessionId);
  if (!chat || chat.status === 'deleted') throw new Error('Chat not found.');
  const timestamp = now(clock);
  const next = {
    ...chat,
    status,
    updatedAt: timestamp,
    closedAt: status === 'closed' ? timestamp : null
  };
  await repository.put('chatSessions', next, { validate: false });
  await updateTranscriptGummy(repository, sessionId, { clock });
  await createReceipt(repository, {
    action: status === 'closed' ? 'close-private-actor-chat' : 'reopen-private-actor-chat',
    resources: [sessionId],
    resultGummyIds: [chat.transcriptGummyId],
    outcome: 'completed',
    reversible: true,
    detail: `${chat.title} ${status}.`
  });
  return next;
}

export async function deleteChat(repository, sessionId, { clock } = {}) {
  const chat = await repository.get('chatSessions', sessionId);
  if (!chat) throw new Error('Chat not found.');
  const messages = (await repository.all('chatMessages')).filter(item => item.sessionId === sessionId);
  const transcript = await repository.get('gummies', chat.transcriptGummyId);
  const deletionEvidence = await sha256({
    sessionId,
    transcriptHash: transcript?.hash?.value || null,
    messageIds: messages.map(item => item.id).sort()
  });
  for (const message of messages) await repository.delete('chatMessages', message.id);
  await repository.delete('gummies', chat.transcriptGummyId);
  await repository.delete('chatSessions', sessionId);
  return createReceipt(repository, {
    action: 'delete-private-actor-chat',
    resources: [sessionId],
    outcome: 'completed',
    reversible: false,
    detail: `Deleted the selected private thread, ${messages.length} messages, and its transcript Gummy. Only deletion evidence remains.`,
    evidence: { deletionEvidence },
    extensions: { deletedMessageCount: messages.length, deletedAt: now(clock) }
  });
}

export function exportChatPackage(chat, messages, transcript) {
  return {
    schema: 'gummy.chat-export/v1',
    exportedAt: new Date().toISOString(),
    chat,
    messages,
    transcript,
    note: 'Private export. This file can contain personal conversation content.'
  };
}

const SECRET_PATTERNS = [
  /\bsk-[A-Za-z0-9_-]{12,}\b/g,
  /\b(?:ghp|github_pat)_[A-Za-z0-9_]{12,}\b/g,
  /\bBearer\s+[A-Za-z0-9._~+/-]{12,}\b/gi,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g
];

export function previewTesterFeedback(raw) {
  assertChoice(raw.category, FEEDBACK_CATEGORIES, 'Feedback category');
  let note = String(raw.note || '').trim().slice(0, 2_000);
  const redactions = [];
  for (const pattern of SECRET_PATTERNS) {
    note = note.replace(pattern, match => {
      redactions.push(match.slice(0, 3));
      return '[redacted secret-like value]';
    });
  }
  if (!note) throw new Error('Feedback note is required.');
  return {
    schema: 'gummy.tester-feedback-preview/v1',
    category: raw.category,
    note,
    context: {
      buildCommit: String(raw.context?.buildCommit || 'unknown').slice(0, 64),
      buildEnvironment: String(raw.context?.buildEnvironment || 'unknown').slice(0, 32),
      surface: String(raw.context?.surface || 'about').slice(0, 80)
    },
    excluded: [
      'credentials', 'private Actor memory', 'chat transcripts', 'source contents',
      'ambient browsing history', 'identity profile'
    ],
    redactionCount: redactions.length
  };
}

export async function saveTesterFeedback(repository, preview, { clock } = {}) {
  const timestamp = now(clock);
  const id = createId('feedback');
  const record = {
    ...preview,
    schema: 'gummy.tester-feedback/v1',
    id,
    status: 'local-only',
    createdAt: timestamp,
    updatedAt: timestamp,
    remote: null
  };
  await repository.put('testerFeedback', record, { validate: false });
  const receipt = await createReceipt(repository, {
    action: 'save-tester-feedback-locally',
    resources: [id],
    outcome: 'completed',
    reversible: true,
    detail: `Saved ${record.category} feedback locally after review and redaction.`,
    extensions: { feedbackHash: await sha256(record), excluded: record.excluded }
  });
  return { record, receipt };
}

export async function recordCohortEvent(repository, type, detail = {}, { clock } = {}) {
  assertChoice(type, COHORT_EVENTS, 'Cohort event');
  const allowedDetail = {
    choice: detail.choice ? String(detail.choice).slice(0, 40) : undefined,
    surface: detail.surface ? String(detail.surface).slice(0, 80) : undefined,
    reason: detail.reason ? String(detail.reason).slice(0, 120) : undefined
  };
  const record = {
    id: createId('cohort-event'),
    schema: 'gummy.local-cohort-event/v1',
    type,
    detail: Object.fromEntries(Object.entries(allowedDetail).filter(([, value]) => value !== undefined)),
    createdAt: now(clock),
    locality: 'this-browser-only'
  };
  await repository.put('cohortEvents', record, { validate: false });
  return record;
}

export function summarizeCohortEvents(events) {
  const counts = Object.fromEntries(COHORT_EVENTS.map(type => [type, 0]));
  for (const event of events) if (counts[event.type] !== undefined) counts[event.type] += 1;
  return {
    schema: 'gummy.local-cohort-summary/v1',
    locality: 'this-browser-only',
    totalEvents: events.length,
    counts,
    firstAt: events.map(item => item.createdAt).sort().at(0) || null,
    lastAt: events.map(item => item.createdAt).sort().at(-1) || null,
    excluded: ['identity', 'message text', 'source contents', 'credentials', 'network telemetry']
  };
}

export function createLiveSessionContract({
  chatSessionId,
  signalingConfigured = false,
  clock
}) {
  const timestamp = now(clock);
  return {
    id: createId('live-session'),
    schema: 'gummy.live-session/v1',
    chatSessionId,
    roomIdentity: null,
    visibility: 'private',
    status: 'preview-ready',
    capabilities: {
      chat: { available: true, mode: 'local-records' },
      audio: { available: true, mode: 'local-preview-only' },
      video: { available: true, mode: 'local-preview-only' },
      screen: { available: true, mode: 'local-preview-only' }
    },
    signaling: signalingConfigured
      ? { configured: true, claim: 'signaling seam configured; remote media still requires an explicit joined session' }
      : { configured: false, claim: 'remote live room unavailable; no signaling service is configured' },
    participants: [],
    recording: false,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}
