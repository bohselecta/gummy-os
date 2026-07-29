import { PHASE16_IDS, resolveActorPresence } from '../core/living-collaboration.js';

function h(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else node.setAttribute(key, value);
  }
  for (const child of Array.isArray(children) ? children : [children]) {
    if (child == null) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

function actorWindowContent(actor, presence) {
  return h('div', { class: 'social-actor-window', dataset: { actorId: actor.id } }, [
    h('p', { class: 'eyebrow', text: 'ACTOR PRESENCE · LOCAL PROOF' }),
    h('h2', { text: actor.name }),
    h('p', { class: 'lede', text: presence.disclosure }),
    h('dl', { class: 'facts' }, [
      h('dt', { text: 'Actor' }),
      h('dd', { text: actor.id }),
      h('dt', { text: 'Role' }),
      h('dd', { text: actor.role }),
      h('dt', { text: 'Presence' }),
      h('dd', { text: presence.state.replaceAll('-', ' ') }),
      h('dt', { text: 'Operator' }),
      h('dd', { text: presence.operator?.operatorId || 'none' }),
      h('dt', { text: 'Authority' }),
      h('dd', { text: presence.operator?.grantId || 'No representation Grant' }),
      h('dt', { text: 'Media' }),
      h('dd', { text: 'Local fixture text only' })
    ]),
    h('p', {
      class: 'boundary-note compact',
      text: 'This window does not infer remote presence, audio, video, identity, approval, spending, execution, publication, or ownership.'
    })
  ]);
}

async function threadWindowContent(repository, social) {
  const messages = (await repository.all('collaborationMessages'))
    .filter(message => message.sessionId === social.originatingSessionId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const actors = await repository.all('actors');
  return h('div', { class: 'social-thread-window', dataset: { testid: 'phase16-shared-thread' } }, [
    h('p', { class: 'eyebrow', text: 'SHARED THREAD · EXACT LOCAL RECORDS' }),
    h('h2', { text: 'Cyberpunk video' }),
    h('p', {
      class: 'lede',
      text: 'The visible thread is only the selected local Session context. Private budget details remain explicitly excluded.'
    }),
    h('ol', { class: 'social-thread-messages' }, messages.map(message => {
      const actor = actors.find(item => item.id === message.senderActorId);
      return h('li', { class: message.selectedForSharedVision ? 'is-selected' : 'is-excluded' }, [
        h('strong', { text: actor?.name || message.senderActorId }),
        h('p', { text: message.text }),
        h('small', {
          text: message.selectedForSharedVision
            ? `Selected provenance · ${message.id}@${message.revision}`
            : `Explicitly excluded · ${message.id}@${message.revision}`
        })
      ]);
    })),
    h('p', { class: 'boundary-note compact', text: social.resumeInstructions })
  ]);
}

async function openSocialWindow({ social, windowRecord, repository, windowManager }) {
  const existing = windowManager.windows.get(windowRecord.windowId);
  if (existing) {
    existing.hidden = windowRecord.state === 'minimized';
    if (!existing.hidden) windowManager.focus(existing);
    return existing;
  }
  let title = 'Shared thread';
  let subtitle = `${social.id} · local Session context`;
  let content;
  if (windowRecord.subjectType === 'actor') {
    const actorRecord = await repository.get('actors', windowRecord.subjectId);
    const actor = {
      id: windowRecord.subjectId,
      name: actorRecord?.name || windowRecord.subjectId,
      role: social.members.find(item => item.actorId === windowRecord.subjectId)?.role || 'Participant'
    };
    const presenceRecord = (await repository.all('actorPresence'))
      .find(item => item.actorId === windowRecord.subjectId && item.schema === 'gummy.actor-presence/v1');
    const presence = resolveActorPresence(presenceRecord);
    title = actor.name;
    subtitle = `${presence.state.replaceAll('-', ' ')} · truthful Actor Presence`;
    content = actorWindowContent(actor, presence);
  } else {
    content = await threadWindowContent(repository, social);
  }
  return windowManager.open({
    id: windowRecord.windowId,
    title,
    subtitle,
    content
  });
}

export async function openSocialInstanceWindows({ social, repository, windowManager, announce }) {
  for (const windowRecord of social.layout.windows) {
    await repository.put('meta', {
      id: `window:${windowRecord.windowId}`,
      left: windowRecord.x,
      top: windowRecord.y,
      width: windowRecord.width,
      height: windowRecord.height,
      z: windowRecord.zIndex,
      hidden: windowRecord.state === 'minimized',
      maximized: false,
      updatedAt: new Date().toISOString()
    }, { validate: false });
    await openSocialWindow({ social, windowRecord, repository, windowManager });
  }
  announce(`Opened ${social.title}: ${social.layout.windows.length} saved windows, including one truthfully minimized presence.`);
}

export async function closeSocialInstanceWindows({ social, windowManager, announce }) {
  for (const windowRecord of social.layout.windows) {
    await windowManager.control(windowRecord.windowId, 'close');
  }
  announce(`Closed ${social.title} windows. The Social Instance and Session records remain durable.`);
}

export async function restoreSocialWindow({ windowId, repository, windowManager }) {
  const social = await repository.get('socialInstances', PHASE16_IDS.socialInstance);
  const windowRecord = social?.layout?.windows?.find(item => item.windowId === windowId);
  if (social && windowRecord) {
    await openSocialWindow({ social, windowRecord, repository, windowManager });
  }
}
