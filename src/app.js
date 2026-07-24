import { createStore } from './core/state.js';
import { CapabilityBroker } from './core/capability-broker.js';
import { makeReceipt } from './core/protocol.js';
import { el } from './core/dom.js';
import { WindowManager } from './window-manager.js';
import { createBrowserApp } from './apps/browser.js';
import { createFilesApp } from './apps/files.js';
import { createSnackApp } from './apps/snack.js';
import { createSnackGraphApp } from './apps/snack-graph.js';
import { createEnterpriseApp } from './apps/enterprise.js';
import { createReceiptsApp } from './apps/receipts.js';
import { createAboutApp } from './apps/about.js';
import { createLauncherApp } from './apps/launcher.js';

const store = createStore();
const broker = new CapabilityBroker();
const desktop = document.querySelector('#desktop');
const boot = document.querySelector('#boot');
const windowManager = new WindowManager(document.querySelector('#window-layer'));
const companion = document.querySelector('#companion');
const toastLayer = document.querySelector('#toast-layer');

const appDefinitions = {
  browser: { id: 'browser', title: 'Gummy Browser', icon: '◉', description: 'Browse internal Gummy pages and compatible external sites.', factory: context => createBrowserApp(context) },
  chat: { id: 'chat', title: 'Gummy Chat', icon: '✦', description: 'Provider-neutral conversation and governed tasks.', factory: context => createBrowserApp({ ...context, initialRoute: 'gummy://chat' }) },
  files: { id: 'files', title: 'My Files', icon: '▤', description: 'Private objects, projects, files, conversations, and Drops.', factory: createFilesApp },
  graph: { id: 'graph', title: 'Snack Graph', icon: '◎', description: 'Portable identities, Bowls, Drops, links, and forks.', factory: createSnackGraphApp },
  enterprise: { id: 'enterprise', title: 'Enterprise Habitat', icon: '▦', description: 'Organizations, App Packs, policy, runtimes, and audit.', factory: createEnterpriseApp },
  receipts: { id: 'receipts', title: 'Receipts', icon: '✓', description: 'Evidence of actions, authority, resources, and outcomes.', factory: createReceiptsApp },
  snack: { id: 'snack', title: 'Snack Bar', icon: '◆', description: 'Shape, color, flavor, companion, and portable identity.', factory: createSnackApp },
  about: { id: 'about', title: 'About Gummy', icon: 'G', description: 'Product thesis, architecture planes, and protocol direction.', factory: createAboutApp },
  launcher: { id: 'launcher', title: 'Applications', icon: '⌘', description: 'Launch every Gummy application.', factory: context => createLauncherApp({ ...context, apps: appDefinitions }) }
};

const context = { store, broker, apps: appDefinitions, openApp, addReceipt, toast };

function addReceipt(receipt) {
  store.setState(current => ({ ...current, receipts: [...current.receipts, receipt].slice(-300) }));
}

function toast(title, message) {
  const node = el('div', { class: 'toast' }, [el('strong', { text: title }), el('span', { text: message })]);
  toastLayer.append(node);
  setTimeout(() => node.remove(), 4200);
}

function openApp(id) {
  const definition = appDefinitions[id];
  if (!definition) return;
  const instance = definition.factory(context);
  windowManager.open({ id, title: definition.title, subtitle: id === 'enterprise' ? 'governed workspace' : 'mygum.my', content: instance.node, noPadding: instance.noPadding });
}

function renderChrome(state) {
  document.documentElement.style.setProperty('--gummy-primary', state.snack.colors.primary);
  document.documentElement.style.setProperty('--gummy-secondary', state.snack.colors.secondary);
  document.documentElement.style.setProperty('--gummy-accent', state.snack.colors.accent);
  document.querySelector('#avatar-initial').textContent = state.snack.name[0]?.toUpperCase() || 'G';
  document.querySelector('#workspace-name').textContent = `${state.snack.name}'s Gummy`;
  document.querySelector('.companion-label').textContent = state.snack.companion;
}

function renderLaunchers() {
  const desktopApps = ['browser', 'files', 'graph', 'enterprise', 'receipts', 'snack'];
  const desktopIcons = document.querySelector('#desktop-icons');
  const dock = document.querySelector('#dock');
  desktopIcons.replaceChildren();
  dock.replaceChildren();
  for (const id of desktopApps) {
    const app = appDefinitions[id];
    desktopIcons.append(el('button', { class: 'desktop-icon', onclick: () => openApp(id) }, [
      el('span', { class: 'desktop-icon-glyph', text: app.icon }),
      el('span', { class: 'desktop-icon-label', text: app.title })
    ]));
    dock.append(el('button', { class: 'dock-button', text: app.icon, dataset: { label: app.title }, onclick: () => openApp(id) }));
  }
}

function installDelegationTarget() {
  const accept = async fileId => {
    const file = store.getState().files.find(item => item.id === fileId);
    if (!file) return;
    const request = await broker.request({ actor: store.getState().snack.handle, action: 'attach-to-agent', resource: file.id, risk: 'medium', reason: `Attach ${file.name} to the current Gummy task`, scope: { read: [file.id] } });
    if (!request.granted) return;
    store.setState(current => ({ ...current, selectedFileId: file.id }));
    addReceipt(makeReceipt({ action: 'attach-file-to-agent', actor: store.getState().snack.handle, application: 'Gummy Companion', resources: [file.id], capabilities: [request.grant.id], detail: `Attached ${file.name} under a temporary read grant.` }));
    toast('Ready to work', `${file.name} is attached to ${store.getState().snack.companion}.`);
    openApp('chat');
  };

  companion.addEventListener('dragover', event => { event.preventDefault(); companion.classList.add('is-drop-target'); });
  companion.addEventListener('dragleave', () => companion.classList.remove('is-drop-target'));
  companion.addEventListener('drop', event => {
    event.preventDefault();
    companion.classList.remove('is-drop-target');
    const fileId = event.dataTransfer.getData('application/x-gummy-object');
    if (fileId) void accept(fileId);
  });
  companion.addEventListener('click', () => openApp('chat'));
}

document.addEventListener('click', event => {
  const target = event.target.closest('[data-action="open-app"]');
  if (target) openApp(target.dataset.app);
});

document.querySelector('#fullscreen-button').addEventListener('click', async () => {
  if (!document.fullscreenElement) await document.documentElement.requestFullscreen().catch(() => {});
  else await document.exitFullscreen().catch(() => {});
});

store.subscribe(renderChrome);
renderChrome(store.getState());
renderLaunchers();
installDelegationTarget();

setTimeout(() => {
  boot.style.opacity = '0';
  setTimeout(() => { boot.remove(); desktop.hidden = false; openApp('browser'); }, 320);
}, 600);
