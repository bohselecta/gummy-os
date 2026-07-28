import { createId } from '../core/hash.js';
import {
  appendChatMessage,
  createLiveSessionContract,
  deleteChat,
  exportChatPackage,
  openPrivateChat,
  setActorPresence,
  setChatStatus,
  updateChatMessage,
  updateTranscriptGummy
} from '../core/living-actor.js';
import { createReceipt } from '../core/records.js';
import { gummyRealmAssets } from '../brand/gummy-realm-assets.js';

function h(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (['checked', 'disabled', 'hidden'].includes(key)) node[key] = value;
    else node.setAttribute(key, value);
  }
  for (const child of Array.isArray(children) ? children : [children]) {
    if (child == null) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

function download(name, value, type = 'application/json') {
  const anchor = document.createElement('a');
  const url = URL.createObjectURL(new Blob([value], { type }));
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function governanceEnvelope(chat, messages, idempotencyKey) {
  const approvedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const suffix = idempotencyKey.replaceAll(':', '-').slice(-48);
  return {
    chat: {
      id: chat.id,
      participantActorIds: chat.participantActorIds,
      visibility: 'private'
    },
    actor: { id: 'actor:glopper', status: 'active' },
    agent: { id: 'agent:glopper-web', status: 'available' },
    mold: {
      id: 'mold:glopper:private-chat-v1',
      status: 'active',
      capability: 'chat.reply'
    },
    lease: {
      id: `lease:chat:${suffix}`,
      status: 'active',
      chatId: chat.id,
      agentId: 'agent:glopper-web',
      expiresAt
    },
    grant: {
      id: `grant:chat:${suffix}`,
      capability: 'chat.reply',
      approvedBy: 'human:hayden',
      approvedAt,
      expiresAt,
      revoked: false,
      maxCostUsd: 0.05
    },
    messages: messages
      .filter(message => !message.deletedAt && message.status === 'delivered')
      .slice(-40)
      .map(message => ({ senderActorId: message.senderActorId, text: message.text })),
    context: {
      selectedGummyIds: [],
      previewed: true,
      excluded: [
        'complete Actor memory',
        'credentials',
        'ambient files',
        'unselected Gummies',
        'device media'
      ]
    },
    idempotencyKey
  };
}

export async function createPrivateChatApp({
  repository,
  session,
  participantActorId,
  chatId = null,
  announce,
  onDeleted
}) {
  const root = h('div', {
    class: 'private-chat-app',
    dataset: { testid: 'private-actor-chat' }
  });
  let chat = chatId ? await repository.get('chatSessions', chatId) : null;
  if (!chat) {
    const existing = (await repository.all('chatSessions'))
      .filter(item => item.participantActorIds.includes(participantActorId))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    chat = existing || await openPrivateChat(repository, { participantActorId });
  }
  let pendingRecovery = null;
  let activeStream = null;
  const onRecordChange = event => {
    if (['chatSessions', 'chatMessages'].includes(event.data?.store)) void render();
  };
  repository.channel?.addEventListener('message', onRecordChange);
  root.addEventListener('gummy:window-close', () => {
    stopMedia();
    repository.channel?.removeEventListener('message', onRecordChange);
  });

  const stopMedia = () => {
    for (const track of activeStream?.getTracks?.() || []) track.stop();
    activeStream = null;
  };

  const receiptMedia = (action, outcome, detail) => createReceipt(repository, {
    action,
    resources: [chat.id],
    outcome,
    reversible: true,
    detail,
    extensions: { recording: false, remoteRoomJoined: false }
  });

  const sendEnvelope = async (envelope, working, sendButton) => {
    working.hidden = false;
    sendButton.disabled = true;
    await repository.putValidated('taskLeases', {
      schema: 'gummy.task-lease/v0',
      id: envelope.lease.id,
      humanAuthorityId: 'human:hayden',
      actorId: 'actor:glopper',
      agentId: 'agent:glopper-web',
      moldId: envelope.mold.id,
      masterControlId: 'master-control:hayden',
      taskId: chat.id,
      scope: { gummyIds: [chat.transcriptGummyId], capabilities: ['chat.reply'] },
      authoritativeLocation: 'Local Gummy Box',
      mode: 'exclusive',
      status: 'active',
      issuedAt: envelope.grant.approvedAt,
      expiresAt: envelope.lease.expiresAt,
      extensions: { conversationOnly: true, idempotencyKey: envelope.idempotencyKey }
    });
    await repository.putValidated('grants', {
      schema: 'gummy.capability-grant/v0',
      id: envelope.grant.id,
      humanAuthorityId: 'human:hayden',
      actorId: 'actor:glopper',
      operatorType: 'agent',
      operatorId: 'agent:glopper-web',
      agentId: 'agent:glopper-web',
      characterFamily: 'Glopper',
      moldId: envelope.mold.id,
      masterControlId: 'master-control:hayden',
      taskLeaseId: envelope.lease.id,
      action: 'chat.reply',
      resource: chat.id,
      resourceKind: 'conversation',
      risk: 'medium',
      reason: 'Human approved one visible private chat turn.',
      scope: { selectedGummyIds: [], maxCostUsd: envelope.grant.maxCostUsd },
      locality: 'cloud',
      approval: 'human',
      issuerId: 'human:hayden',
      issuedAt: envelope.grant.approvedAt,
      expiresAt: envelope.grant.expiresAt,
      revoked: false
    });
    await setActorPresence(repository, {
      actorId: 'actor:glopper',
      state: 'in-chat',
      source: 'session-derived',
      ttlMs: 5 * 60 * 1000,
      detail: 'A real private provider turn is in flight.',
      recordReceipt: false
    });
    try {
      const response = await fetch('/api/v1/chat/reply', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-gummy-csrf': session.csrf || sessionStorage.getItem('gummy-csrf') || ''
        },
        body: JSON.stringify(envelope)
      });
      const result = await response.json();
      if (!response.ok || result.status !== 'completed') throw Object.assign(new Error(result.message || 'Chat reply failed.'), { result });
      await appendChatMessage(repository, {
        sessionId: chat.id,
        senderActorId: 'actor:glopper',
        text: result.message,
        status: 'delivered',
        provider: { name: result.provider, model: result.model, requestId: result.requestId },
        cost: result.cost,
        idempotencyKey: envelope.idempotencyKey
      });
      await createReceipt(repository, {
        action: 'deliver-private-chat-reply',
        operatorType: 'agent',
        operatorId: 'agent:glopper-web',
        agentId: 'agent:glopper-web',
        moldId: envelope.mold.id,
        taskLeaseId: envelope.lease.id,
        grantIds: [envelope.grant.id],
        resources: [chat.id],
        resultGummyIds: [chat.transcriptGummyId],
        capabilities: ['chat.reply'],
        outcome: 'completed',
        reversible: true,
        cost: result.cost ? {
          amount: result.cost.amount,
          currency: result.cost.currency
        } : undefined,
        executionRoute: {
          provider: result.provider,
          model: result.model,
          locality: result.locality
        },
        detail: 'Delivered one explicitly approved private chat reply. No Production action ran.',
        extensions: { providerRequestId: result.requestId }
      });
      await repository.putValidated('taskLeases', {
        ...(await repository.get('taskLeases', envelope.lease.id)),
        status: 'completed',
        releasedAt: new Date().toISOString()
      });
      await repository.putValidated('grants', {
        ...(await repository.get('grants', envelope.grant.id)),
        revoked: true,
        revokedAt: new Date().toISOString()
      });
      for (const failed of (await repository.all('chatMessages')).filter(message => (
        message.sessionId === chat.id
        && message.status === 'failed'
        && message.idempotencyKey === envelope.idempotencyKey
      ))) {
        await repository.put('chatMessages', {
          ...failed,
          status: 'recovered',
          updatedAt: new Date().toISOString(),
          error: {
            ...failed.error,
            recoveredAt: new Date().toISOString(),
            recoveryEnvelope: null
          }
        }, { validate: false });
      }
      await updateTranscriptGummy(repository, chat.id);
      pendingRecovery = null;
    } catch (error) {
      pendingRecovery = envelope;
      await appendChatMessage(repository, {
        sessionId: chat.id,
        senderActorId: 'actor:glopper',
        text: error.message,
        status: 'failed',
        error: {
          recoverable: true,
          ambiguousRetryBlocked: true,
          message: error.message,
          recoveryEnvelope: envelope
        },
        idempotencyKey: envelope.idempotencyKey
      });
      await createReceipt(repository, {
        action: 'private-chat-reply-failed',
        operatorType: 'agent',
        operatorId: 'agent:glopper-web',
        agentId: 'agent:glopper-web',
        resources: [chat.id],
        capabilities: ['chat.reply'],
        outcome: error.result?.status || 'failed',
        reversible: true,
        detail: `${error.message} Automatic retry was blocked; the Human may explicitly recover with the same idempotency key.`
      });
    } finally {
      working.hidden = true;
      sendButton.disabled = false;
      await setActorPresence(repository, {
        actorId: 'actor:glopper',
        state: session.openaiConfigured || session.testMode ? 'available-for-chat' : 'unavailable-capability',
        source: 'service-derived',
        ttlMs: 5 * 60 * 1000,
        detail: session.openaiConfigured || session.testMode ? 'Private governed chat is available.' : 'Provider unavailable.',
        recordReceipt: false
      });
      await render();
    }
  };

  const beginPreview = async (kind, video, status) => {
    stopMedia();
    status.textContent = `Requesting ${kind} permission after your explicit selection…`;
    try {
      if (!navigator.mediaDevices) throw new Error('Media devices are unavailable in this browser.');
      activeStream = kind === 'screen'
        ? await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
        : await navigator.mediaDevices.getUserMedia({
            video: kind === 'video',
            audio: kind === 'audio'
          });
      video.srcObject = activeStream;
      video.hidden = kind === 'audio';
      const live = createLiveSessionContract({
        chatSessionId: chat.id,
        signalingConfigured: session.signalingConfigured
      });
      live.status = 'local-preview';
      live.participants = [{
        actorId: 'actor:hayden',
        role: 'self-preview',
        audio: activeStream.getAudioTracks().some(track => track.enabled),
        video: activeStream.getVideoTracks().some(track => track.enabled),
        joinedAt: new Date().toISOString()
      }];
      live.updatedAt = new Date().toISOString();
      await repository.put('liveSessions', live, { validate: false });
      await receiptMedia(`start-local-${kind}-preview`, 'completed', `Started an explicit local ${kind} preview. No remote room joined and recording remained off.`);
      status.textContent = `${kind[0].toUpperCase() + kind.slice(1)} preview is local to this page. No remote participant or recording.`;
      for (const track of activeStream.getTracks()) {
        track.addEventListener('ended', () => {
          stopMedia();
          status.textContent = 'Local preview ended.';
          void receiptMedia(`end-local-${kind}-preview`, 'completed', `Ended the local ${kind} preview.`);
        }, { once: true });
      }
    } catch (error) {
      stopMedia();
      status.textContent = `${kind[0].toUpperCase() + kind.slice(1)} preview unavailable: ${error.message}`;
      await receiptMedia(`start-local-${kind}-preview`, 'denied', status.textContent);
    }
  };

  async function render() {
    chat = await repository.get('chatSessions', chat.id);
    if (!chat) return;
    const participant = await repository.get('actors', participantActorId);
    const messages = (await repository.all('chatMessages'))
      .filter(item => item.sessionId === chat.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (!pendingRecovery) {
      pendingRecovery = [...messages]
        .reverse()
        .find(message => message.status === 'failed' && message.error?.recoveryEnvelope)
        ?.error.recoveryEnvelope || null;
    }
    root.replaceChildren();
    const header = h('section', { class: 'chat-header' }, [
      h('div', { class: 'chat-identity' }, [
        participantActorId === 'actor:glopper' ? h('div', { class: 'chat-glopper-frame' }, h('img', {
          src: gummyRealmAssets.glopper.chatBust,
          alt: 'Glopper',
          width: '256',
          height: '256',
          decoding: 'async'
        })) : null,
        h('div', {}, [
          h('p', { class: 'eyebrow', text: 'Private Actor chat' }),
          h('h2', { text: chat.title }),
          h('p', { class: 'meta', text: `${chat.id} · ${chat.visibility} · ${chat.status}` })
        ])
      ]),
      h('span', {
        class: `status ${chat.status === 'open' ? '' : 'review'}`,
        text: chat.status
      })
    ]);
    const boundary = chat.mode === 'governed-agent'
      ? h('details', { class: 'execution-disclosure', open: '' }, [
          h('summary', { text: 'Actor, operator, context, and cost' }),
          h('p', { text: `${participant.name} (${participant.id}) is the addressable Actor. agent:glopper-web is the disclosed operator for each separately approved reply; they are not the same identity.` }),
          h('p', { class: 'meta', text: 'Mold mold:glopper:private-chat-v1 · one-turn Lease · one chat.reply Grant · OpenAI / gpt-5.6-sol · ≤ $0.05 per approved turn' }),
          h('p', { class: 'boundary-note compact', text: 'Sent context preview: this thread only. Excluded: complete Actor memory, credentials, ambient files, unselected Gummies, and all device media. Make Production remains separate; chat never starts it.' })
        ])
      : h('p', {
          class: 'boundary-note',
          text: `${participant.name} is a Human-operated Actor. Messages stay local until a real person uses this browser; no Agent reply is implied.`
        });
    const messageList = h('ol', {
      class: 'chat-message-list',
      'aria-label': `${chat.title} messages`,
      'aria-live': 'polite'
    });
    for (const message of messages) {
      const mine = message.senderActorId === 'actor:hayden';
      const item = h('li', {
        class: `chat-message ${mine ? 'mine' : 'theirs'} ${message.status === 'failed' ? 'failed' : ''}`,
        dataset: { messageId: message.id }
      }, [
        h('div', { class: 'chat-message-meta' }, [
          h('strong', { text: mine ? 'You · actor:hayden' : `${participant.name} · ${participant.id}` }),
          h('span', { text: `${message.status} · r${message.revision}` })
        ]),
        h('p', { text: message.deletedAt ? 'Message deleted.' : message.text }),
        message.provider ? h('small', {
          text: `${message.provider.name} · ${message.provider.model} · $${Number(message.cost?.amount || 0).toFixed(6)}`
        }) : null
      ]);
      if (mine && !message.deletedAt) {
        const actions = h('div', { class: 'button-row compact-actions' });
        actions.append(
          h('button', { class: 'button', onclick: async () => {
            const editor = h('textarea', { rows: '3', text: message.text, 'aria-label': 'Edit message' });
            const save = h('button', { class: 'button primary', onclick: async () => {
              await updateChatMessage(repository, { messageId: message.id, text: editor.value });
              await render();
            } }, 'Save revision');
            item.replaceChildren(editor, save);
          } }, 'Edit'),
          h('button', { class: 'button danger', onclick: async () => {
            await updateChatMessage(repository, { messageId: message.id, deleteMessage: true });
            await render();
          } }, 'Delete message')
        );
        item.append(actions);
      }
      messageList.append(item);
    }
    const working = h('div', {
      class: 'chat-working',
      role: 'status',
      hidden: true,
      text: 'Glopper is working on this real approved reply…'
    });
    const composer = h('textarea', {
      rows: '4',
      maxlength: '8000',
      placeholder: chat.status === 'open' ? `Message ${participant.name}` : 'Reopen this chat to send',
      disabled: chat.status !== 'open',
      'aria-label': `Message ${participant.name}`
    });
    const send = h('button', {
      class: 'button primary',
      disabled: chat.status !== 'open',
      onclick: async () => {
        const text = composer.value.trim();
        if (!text) return;
        const sent = await appendChatMessage(repository, {
          sessionId: chat.id,
          senderActorId: 'actor:hayden',
          text,
          status: 'delivered'
        });
        composer.value = '';
        if (chat.mode !== 'governed-agent') {
          announce('Human-operated message saved locally. No Agent reply was claimed.');
          await render();
          return;
        }
        const all = [...messages, sent];
        const idempotencyKey = createId('chat-turn');
        await sendEnvelope(governanceEnvelope(chat, all, idempotencyKey), working, send);
      }
    }, chat.mode === 'governed-agent' ? 'Approve context, cost & send' : 'Save local message');
    const recovery = pendingRecovery ? h('button', {
      class: 'button',
      onclick: () => void sendEnvelope(pendingRecovery, working, send)
    }, 'Recover failed turn with same key') : null;
    const composerBlock = h('section', { class: 'chat-composer' }, [
      composer,
      h('div', { class: 'button-row' }, [send, recovery]),
      working,
      h('small', { text: chat.mode === 'governed-agent'
        ? 'The button approves only the visible thread context and one provider reply. Failed/ambiguous turns do not auto-retry.'
        : 'This is manual Human chat. Delivery to another browser is not claimed.' })
    ]);
    const liveVideo = h('video', {
      class: 'local-preview-video',
      autoplay: '',
      muted: '',
      playsinline: '',
      hidden: true
    });
    const liveStatus = h('p', {
      class: 'meta',
      text: session.signalingConfigured
        ? 'A signaling seam is configured. This control still starts only a local preview until a real private room is joined.'
        : 'Remote live room unavailable: no signaling service is configured.'
    });
    const live = h('details', { class: 'live-foundation' }, [
      h('summary', { text: 'Audio, video & screen foundations' }),
      h('p', { text: 'Choose a local preview first. Gummy requests device permission only after that choice. It never auto-starts, records, publishes, or creates a public room.' }),
      h('div', { class: 'button-row' }, [
        h('button', { class: 'button', onclick: () => beginPreview('audio', liveVideo, liveStatus) }, 'Preview microphone'),
        h('button', { class: 'button', onclick: () => beginPreview('video', liveVideo, liveStatus) }, 'Preview camera'),
        h('button', { class: 'button', onclick: () => beginPreview('screen', liveVideo, liveStatus) }, 'Preview screen'),
        h('button', { class: 'button', onclick: async event => {
          const tracks = activeStream?.getAudioTracks?.() || [];
          if (!tracks.length) {
            liveStatus.textContent = 'No microphone track is active.';
            return;
          }
          const enabled = !tracks[0].enabled;
          tracks.forEach(track => track.enabled = enabled);
          event.currentTarget.textContent = enabled ? 'Mute microphone' : 'Unmute microphone';
          await receiptMedia(enabled ? 'unmute-local-preview' : 'mute-local-preview', 'completed', `Local preview microphone ${enabled ? 'unmuted' : 'muted'}.`);
        } }, 'Mute microphone'),
        h('button', { class: 'button', onclick: async event => {
          const tracks = activeStream?.getVideoTracks?.() || [];
          if (!tracks.length) {
            liveStatus.textContent = 'No camera or screen track is active.';
            return;
          }
          const enabled = !tracks[0].enabled;
          tracks.forEach(track => track.enabled = enabled);
          event.currentTarget.textContent = enabled ? 'Turn camera off' : 'Turn camera on';
          await receiptMedia(enabled ? 'enable-local-video-preview' : 'disable-local-video-preview', 'completed', `Local preview video ${enabled ? 'enabled' : 'disabled'}.`);
        } }, 'Turn camera off'),
        h('button', { class: 'button danger', onclick: async () => {
          stopMedia();
          liveVideo.hidden = true;
          liveStatus.textContent = 'Local preview ended. No remote room or recording exists.';
          await receiptMedia('leave-local-media-preview', 'completed', liveStatus.textContent);
        } }, 'Leave preview')
      ]),
      liveVideo,
      liveStatus
    ]);
    const controls = h('section', { class: 'chat-controls' }, [
      h('button', { class: 'button', onclick: async () => {
        await setChatStatus(repository, chat.id, chat.status === 'open' ? 'closed' : 'open');
        await render();
      } }, chat.status === 'open' ? 'Close chat' : 'Reopen chat'),
      h('button', { class: 'button', onclick: async () => {
        const transcript = await repository.get('gummies', chat.transcriptGummyId);
        download(
          `${chat.id.replaceAll(':', '-')}.gummy-chat.json`,
          JSON.stringify(exportChatPackage(chat, messages, transcript), null, 2)
        );
        await createReceipt(repository, {
          action: 'export-private-actor-chat',
          resources: [chat.id],
          resultGummyIds: [chat.transcriptGummyId],
          outcome: 'completed',
          reversible: false,
          detail: 'Exported the selected private chat package to a Human-controlled file.'
        });
      } }, 'Export chat'),
      h('button', { class: 'button danger', onclick: event => {
        const button = event.currentTarget;
        if (button.dataset.confirm !== 'true') {
          button.dataset.confirm = 'true';
          button.textContent = 'Confirm delete chat';
          return;
        }
        stopMedia();
        void deleteChat(repository, chat.id).then(() => {
          announce('Private chat, messages, and transcript Gummy deleted; a scoped deletion Receipt remains.');
          onDeleted?.();
        });
      } }, 'Delete chat')
    ]);
    root.append(header, boundary, messageList, composerBlock, live, controls);
  }

  await render();
  return {
    node: root,
    chatId: chat.id,
    destroy: stopMedia
  };
}
