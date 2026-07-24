import { el, button, clear } from '../core/dom.js';
import { safeExternalUrl, makeReceipt } from '../core/protocol.js';

function homePage(openApp) {
  return el('div', { class: 'internal-page' }, [
    el('p', { text: 'GUMMY BROWSER · INTERNAL PAGE' }),
    el('h1', { text: 'The web is an app inside your computer.' }),
    el('p', { text: 'Gummy keeps chat, files, social spaces, and enterprise software in one governed environment. External sites are framed only when they permit it.' }),
    el('div', { class: 'app-grid' }, [
      ['Chat with Gummy', 'A native provider-neutral chat surface.', 'chat'],
      ['Open Snack Graph', 'People, agents, Bowls, Drops, and shared objects.', 'graph'],
      ['Enterprise Habitat', 'Policies, App Packs, runtimes, and audit.', 'enterprise']
    ].map(([title, description, app]) => el('button', { class: 'app-card', onclick: () => openApp(app) }, [
      el('span', { class: 'app-card-icon', text: app === 'chat' ? '✦' : app === 'graph' ? '◎' : '▦' }),
      el('span', {}, [el('strong', { text: title }), el('small', { text: description })])
    ])))
  ]);
}

function protocolPage() {
  const planes = [
    ['Shell', 'Desktop, windows, dock, browser, files'],
    ['Snack', 'Portable person or agent identity'],
    ['Object Space', 'Files, projects, conversations, apps, Drops'],
    ['Graph', 'Privacy-aware relationships and shared Bowls'],
    ['Broker', 'Task-scoped authority and policy decisions'],
    ['Capsule', 'Web, Wasm, Linux, or governed cloud execution'],
    ['Receipt', 'Evidence of what happened'],
    ['Enterprise', 'Organizations, App Packs, policy, audit, and deployment']
  ];
  return el('div', { class: 'internal-page' }, [
    el('p', { text: 'GUMMY PROTOCOL 0.1' }),
    el('h1', { text: 'One computer. Replaceable intelligence. Enforceable boundaries.' }),
    el('div', { class: 'architecture-stack' }, planes.map(([name, text]) => el('div', { class: 'architecture-plane' }, [el('strong', { text: name }), el('span', { text })])))
  ]);
}

function chatPage(context) {
  const { store, broker, addReceipt } = context;
  const root = el('div', { class: 'chat-layout' });
  const log = el('div', { class: 'chat-log' });
  const initial = store.getState().selectedFileId
    ? `I have ${store.getState().files.find(file => file.id === store.getState().selectedFileId)?.name || 'your file'} ready. Ask me to summarize, organize, or create something from it.`
    : 'I live inside Gummy. Drop a file onto me, ask about your Snack Graph, or request a governed task.';
  log.append(el('div', { class: 'message agent', text: initial }));

  const input = el('textarea', { placeholder: 'Ask Gummy to do something…' });
  const send = async () => {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    log.append(el('div', { class: 'message user', text }));
    log.scrollTop = log.scrollHeight;

    const selected = store.getState().files.find(file => file.id === store.getState().selectedFileId);
    const request = await broker.request({
      actor: store.getState().snack.handle,
      action: selected ? 'read-and-transform' : 'respond',
      resource: selected?.id || 'conversation:current',
      risk: selected ? 'medium' : 'low',
      reason: text,
      scope: selected ? { read: [selected.id], write: ['workspace:generated'] } : { conversation: true }
    });

    if (!request.granted) {
      log.append(el('div', { class: 'message agent', text: 'I stopped because the requested capability was not approved.' }));
      return;
    }

    const answer = selected
      ? `I used a scoped grant to inspect “${selected.name}.” Demo result: ${selected.content.slice(0, 140)}${selected.content.length > 140 ? '…' : ''} I would place the transformed artifact in Generated, then return the capsule result here.`
      : 'This scaffold is running in transparent demo mode. A real Model Adapter can connect a local model, a user-funded provider, or an organization-approved broker without changing the desktop.';
    setTimeout(() => {
      log.append(el('div', { class: 'message agent', text: answer }));
      log.scrollTop = log.scrollHeight;
    }, 250);

    addReceipt(makeReceipt({
      action: selected ? 'read-and-transform' : 'chat-response',
      actor: store.getState().snack.handle,
      application: 'Gummy Chat',
      resources: [selected?.id || 'conversation:current'],
      capabilities: [request.grant.id],
      detail: selected ? `Read ${selected.name} under a temporary grant.` : 'Generated a demo response without an external model call.'
    }));
  };

  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  });

  root.append(log, el('div', { class: 'chat-composer' }, [input, button('Send', '', () => void send())]));
  return root;
}

export function createBrowserApp(context) {
  const { openApp, addReceipt } = context;
  const shell = el('div', { class: 'browser-shell' });
  const view = el('div', { class: 'browser-view' });
  const address = el('input', { class: 'browser-address', value: 'gummy://home', 'aria-label': 'Address' });
  const history = [];
  let historyIndex = -1;

  const navigate = (raw, record = true) => {
    const value = raw.trim();
    address.value = value;
    clear(view);
    if (record) {
      history.splice(historyIndex + 1);
      history.push(value);
      historyIndex = history.length - 1;
    }

    if (value === 'gummy://home') view.append(homePage(openApp));
    else if (value === 'gummy://chat') view.append(chatPage(context));
    else if (value === 'gummy://protocol') view.append(protocolPage());
    else {
      const url = safeExternalUrl(value);
      if (!url) {
        view.append(el('div', { class: 'internal-page' }, [el('h1', { text: 'That address is not available.' }), el('p', { text: 'Use gummy://home, gummy://chat, gummy://protocol, or an http(s) address.' })]));
        return;
      }
      const iframe = el('iframe', {
        src: url,
        sandbox: 'allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts',
        referrerpolicy: 'strict-origin-when-cross-origin',
        title: `Gummy Browser: ${url}`
      });
      view.append(iframe);
      addReceipt(makeReceipt({ action: 'open-external-site', actor: context.store.getState().snack.handle, application: 'Gummy Browser', resources: [url], capabilities: ['browser:sandboxed-frame'], detail: 'Opened an external site in a sandboxed frame. The site may refuse embedding.' }));
    }
  };

  const toolbar = el('div', { class: 'browser-toolbar' }, [
    el('div', { class: 'browser-controls' }, [
      button('←', '', () => { if (historyIndex > 0) navigate(history[--historyIndex], false); }),
      button('→', '', () => { if (historyIndex < history.length - 1) navigate(history[++historyIndex], false); }),
      button('⌂', '', () => navigate('gummy://home'))
    ]),
    address,
    button('↗', '', () => {
      const url = safeExternalUrl(address.value);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    })
  ]);
  address.addEventListener('keydown', event => { if (event.key === 'Enter') navigate(address.value); });
  shell.append(toolbar, view);
  navigate(context.initialRoute || 'gummy://home');
  return { node: shell, noPadding: true };
}
