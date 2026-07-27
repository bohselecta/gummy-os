import { registerSW } from 'virtual:pwa-register';
import { RecordRepository } from './core/repository.js';
import { RecordValidator } from './core/schema-validator.js';
import { ByteStore, ByteStoreError } from './core/byte-store.js';
import { LocalBoxAdapter, GitHubBoxAdapter } from './core/box-adapters.js';
import { PolicyEngine } from './core/policy-engine.js';
import { WorkOrderWorkflow } from './core/workflow.js';
import { CAPABILITIES, SOURCE_TEXT, createReceipt, ensureFullProductRecords, personalRecords } from './core/records.js';
import { createId, sha256 } from './core/hash.js';
import { migrateLegacy } from './core/migration.js';
import { ProductionRuntimeRepository } from './core/production-repository.js';
import { actorSurfaceWindowId } from './core/production-runtime.js';
import { applicationLaunchState, loadProductCatalog } from './core/product-registry.js';
import { createProductionApp } from './apps/production.js';
import { createActorSurface } from './apps/actor-surface.js';
import { createMasterControlApp } from './apps/master-control.js';
import { WindowManager } from './window-manager.js';
import { gummyAssets } from './brand/gummy-assets.js';

const appRoot = document.querySelector('#app');
const announcer = document.querySelector('#announcer');
const validator = new RecordValidator();
const repository = new RecordRepository({ validator: (record, store, repo) => validator.validate(record, store, repo) });
const byteStore = new ByteStore();
const productionRepository = new ProductionRuntimeRepository({ repository, byteStore });
const policy = new PolicyEngine(repository, byteStore);
const localBox = new LocalBoxAdapter(repository, byteStore);
const githubBox = new GitHubBoxAdapter();
const workflow = new WorkOrderWorkflow({ repository, byteStore, policy, box: localBox });
let windowManager;
let session = { openaiConfigured: false, githubConfigured: false, testMode: false };
let panelOpen = false;
let panelTab = 'conversation';
let selectedApp = 'guide';
let selectedWorkOrderId = 'work-order:project-brief';
let productionState = { productionRuntime: null };
const productionStore = {
  getState: () => productionState,
  setState(updater) {
    productionState = typeof updater === 'function' ? updater(productionState) : updater;
    void productionRepository.persist(productionState.productionRuntime).catch(error => {
      announce(`Production persistence blocked: ${error.message}`);
    });
    return productionState;
  }
};

const surfaces = [
  ['glopper', '✦', 'Glopper'],
  ['gummies', '▤', 'My Gummies'],
  ['browser', '◉', 'Browser'],
  ['productions', '◇', 'Productions'],
  ['actors', '◎', 'Actors / Bowls'],
  ['work-orders', '⇢', 'Work Orders'],
  ['receipts', '✓', 'Receipts'],
  ['control', '⌁', 'Master Control'],
  ['applications', '⌘', 'Applications']
];

function h(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'checked' || key === 'disabled' || key === 'hidden') node[key] = value;
    else node.setAttribute(key, value);
  }
  for (const child of Array.isArray(children) ? children : [children]) {
    if (child == null) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

function announce(message) {
  announcer.textContent = message;
  const layer = document.querySelector('.toast-layer');
  if (!layer) return;
  const toast = h('div', { class: 'toast' }, [h('strong', { text: 'Gummy OS' }), h('span', { text: message })]);
  layer.append(toast);
  setTimeout(() => toast.remove(), 4500);
}

async function initializeSession() {
  const response = await fetch('/api/v1/session');
  session = await response.json();
  sessionStorage.setItem('gummy-csrf', session.csrf);
}

async function applyMode(mode, persist = true) {
  const safe = ['night', 'day'].includes(mode) ? mode : 'night';
  if (persist) await repository.put('meta', { id: 'preference:mode', value: safe, updatedAt: new Date().toISOString() }, { validate: false });
  document.documentElement.dataset.gummyMode = safe;
  document.querySelector('meta[name="theme-color"]').content = safe === 'night' ? '#4B187A' : '#FFF1C7';
}

async function seedPersonalGummy({ name, address, mode }) {
  await applyMode(mode);
  const sourceId = 'gummy:project-brief';
  const sourceWrite = await byteStore.writeGummy(sourceId, 1, SOURCE_TEXT);
  const records = personalRecords({ name, address, sourceHash: sourceWrite.hash, byteRef: sourceWrite.path });
  await repository.putValidated('humans', records.human);
  await repository.putValidated('actors', records.actor);
  await repository.putValidated('actors', records.testActor);
  await repository.putValidated('agents', records.agent);
  await repository.putValidated('agents', records.localOperator);
  await repository.putValidated('molds', records.mold);
  await repository.putValidated('masterControls', records.masterControl);
  await localBox.initialize(records.box);
  await repository.putValidated('gummies', records.gummy);
  await repository.putValidated('workOrders', records.workOrder);
  for (const profile of records.profiles) await repository.put('profiles', profile, { validate: false });
  await repository.put('meta', { id: 'onboarding', completed: true, completedAt: new Date().toISOString() }, { validate: false });
  await createReceipt(repository, {
    action: 'initialize-local-gummy-box', resources: ['box:hayden'], outcome: 'completed', reversible: true,
    detail: 'Created the authoritative Local Gummy Box and personal authority records. Identity remains local and unverified.'
  });
  productionState = { productionRuntime: await productionRepository.initialize() };
}

function onboarding() {
  let step = 0;
  const choices = { mode: null, name: 'Hayden', address: '@hayden' };
  const root = h('section', { class: 'onboarding', 'aria-label': 'Gummy OS onboarding' });
  const card = h('div', { class: 'onboarding-card' });
  root.append(card);

  const render = () => {
    card.replaceChildren();
    const identity = h('picture', { class: 'onboarding-brand' }, [
      h('source', { media: '(max-width: 520px)', srcset: gummyAssets.compactHeadMark }),
      h('img', {
        src: gummyAssets.horizontalLockup,
        alt: 'Gummy OS',
        width: '168',
        height: '60',
        decoding: 'async'
      })
    ]);
    const meter = h('div', { class: 'step-meter', 'aria-label': `Step ${step + 1} of 5` });
    for (let index = 0; index < 5; index += 1) meter.append(h('span', { class: index <= step ? 'active' : '' }));
    card.append(identity, meter, h('p', { class: 'eyebrow', text: `Personal Gummy · ${step + 1} / 5` }));
    if (step === 0) {
      card.append(
        h('h1', { text: 'Your creative computer, with you in control.' }),
        h('p', { class: 'lede', text: 'Start locally. Bring an idea, file, or project. Configure what you want. Nothing runs until you choose Make Production.' }),
        h('p', { text: 'Choose Night or Day Gummy. Start locally without an account; connect more only when you choose.' }),
        h('div', { class: 'choice-grid' }, ['night', 'day'].map(mode => h('button', {
          class: 'choice', 'aria-pressed': String(choices.mode === mode), dataset: { testid: `mode-${mode}` },
          onclick: () => { choices.mode = mode; void applyMode(mode, false); render(); }
        }, [h('strong', { text: mode === 'night' ? 'Night Gummy' : 'Day Gummy' }), h('span', { text: mode === 'night' ? 'Deep purple space, cream type.' : 'Cream space, inky type.' })]))),
        nextButton('Enter Gummy OS', () => step += 1, () => Boolean(choices.mode))
      );
    } else if (step === 1) {
      const name = h('input', { id: 'human-name', value: choices.name, autocomplete: 'name' });
      const address = h('input', { id: 'actor-address', value: choices.address, pattern: '^@[a-zA-Z0-9._-]+$' });
      name.addEventListener('input', () => { choices.name = name.value.trim(); });
      address.addEventListener('input', () => { choices.address = address.value.trim(); });
      card.append(
        h('h1', { text: 'Name your local authority' }),
        h('p', { class: 'lede', text: 'This creates a local Human and personal Actor. The provisional @address is not public discovery or verified identity.' }),
        h('label', { class: 'field', for: 'human-name' }, [h('span', { text: 'Human display name' }), name]),
        h('label', { class: 'field', for: 'actor-address' }, [h('span', { text: 'Provisional @address' }), address]),
        nextButton('Continue', () => step += 1, () => Boolean(choices.name && /^@[a-zA-Z0-9._-]+$/.test(choices.address)))
      );
    } else if (step === 2) {
      card.append(
        h('h1', { text: 'Your Local Gummy Box is ready.' }),
        h('p', { class: 'lede', text: 'It keeps your Productions, Gummies, Returns, and Receipts in this browser. You can export a backup or connect another location later.' }),
        h('div', { class: 'card' }, [h('h3', { text: 'Local Gummy Box' }), h('p', { text: 'Private on this device · no external account required' }), h('span', { class: 'status', text: 'Ready' })]),
        nextButton('Create Local Gummy Box', () => step += 1)
      );
    } else if (step === 3) {
      card.append(
        h('h1', { text: 'Connections are optional' }),
        h('div', { class: 'card-grid' }, [
          h('div', { class: 'card' }, [h('h3', { text: 'Private GitHub' }), h('p', { text: 'Connectable after onboarding through a repository-scoped GitHub App.' }), h('span', { class: `status ${session.githubConfigured ? '' : 'offline'}`, text: session.githubConfigured ? 'Server configured' : 'Requires server configuration' })]),
          h('div', { class: 'card' }, [h('h3', { text: 'Google Drive' }), h('p', { text: 'Visible for orientation; unavailable in this standalone proof.' }), h('span', { class: 'status offline', text: 'Unavailable' })])
        ]),
        nextButton('Continue without connecting', () => step += 1)
      );
    } else {
      card.append(
        h('h1', { text: 'Configure freely. Nothing runs yet.' }),
        h('p', { class: 'lede', text: 'Add specialists, assign references, choose routes, and preview the package. Make Production is the only step that starts authorized work.' }),
        h('details', {}, [
          h('summary', { text: 'Review technical authority details' }),
        facts([
          ['Human', `${choices.name} · local, non-verified`],
          ['Actor', `actor:hayden · ${choices.address}`],
          ['Agent', 'agent:glopper-web · OpenAI / gpt-5.6-sol'],
          ['Local Operator', 'agent:gummy-operator-local · Gemma 3 4B · offline until paired'],
          ['Mold', 'mold:hayden:personal'],
          ['Master Control', 'master-control:hayden'],
          ['Authoritative location', 'Local Gummy Box'],
          ['Native authority', 'false']
        ])
        ]),
        h('button', {
          class: 'button primary', dataset: { testid: 'enter-canvas' },
          onclick: async event => {
            const button = event.currentTarget;
            button.disabled = true;
            button.textContent = 'Creating durable state…';
            try {
              await seedPersonalGummy(choices);
              root.remove();
              await renderShell();
            } catch (error) {
              button.disabled = false;
              button.textContent = 'Try again';
              card.append(h('p', { class: 'notice', text: error instanceof ByteStoreError ? `Persistence blocked: ${error.message}` : error.message }));
            }
          }
        }, 'Got it — open my Canvas')
      );
    }
  };

  function nextButton(label, action, enabled = () => true) {
    return h('div', { class: 'button-row' }, h('button', {
      class: 'button primary', disabled: !enabled(),
      onclick: () => { if (enabled()) { action(); render(); } }
    }, label));
  }
  render();
  return root;
}

function facts(items) {
  const list = h('dl', { class: 'facts' });
  for (const [term, description] of items) list.append(h('dt', { text: term }), h('dd', { text: description }));
  return list;
}

async function renderShell() {
  const human = await repository.get('humans', 'human:hayden');
  const actor = await repository.get('actors', 'actor:hayden');
  appRoot.replaceChildren();
  const shell = h('main', { class: 'os-shell' });
  const topbar = h('header', { class: 'topbar' }, [
    h('div', { class: 'brand-cluster' }, h('button', {
      class: 'brand-button',
      onclick: () => openSurface('guide'),
      'aria-label': 'Gummy OS — open Gummy guide'
    }, h('picture', { class: 'brand-picture' }, [
      h('source', { media: '(max-width: 760px)', srcset: gummyAssets.compactHeadMark }),
      h('img', {
        class: 'brand-lockup',
        src: gummyAssets.horizontalLockup,
        alt: '',
        width: '132',
        height: '48',
        decoding: 'async',
        fetchpriority: 'high'
      })
    ]))),
    h('div', { class: 'authority-strip' }, [
      h('span', { text: 'Human ' }), h('strong', { text: human.name }), h('span', { text: '· Actor ' }), h('strong', { text: actor.address }), h('span', { text: '· Authority ' }), h('strong', { text: 'Local Gummy Box' })
    ]),
    h('div', { class: 'top-actions' }, [
      h('button', { class: 'button', onclick: toggleMode, 'aria-label': 'Switch Night or Day Gummy' }, [h('span', { text: '◐' }), h('span', { class: 'label', text: ' Mode' })]),
      h('button', { class: 'button', onclick: () => togglePanel(), 'aria-label': 'Open Glopper Panel' }, [h('span', { text: '✦' }), h('span', { class: 'label', text: ' Glopper' })])
    ])
  ]);
  const canvas = h('section', { class: 'canvas', 'aria-label': 'Gummy Canvas' });
  const layer = h('div', { class: 'window-layer' });
  const toasts = h('div', { class: 'toast-layer', 'aria-live': 'polite' });
  canvas.append(layer, toasts);
  const bar = h('nav', { class: 'gummy-bar', 'aria-label': 'Gummy Bar', role: 'tablist' });
  shell.append(topbar, canvas, bar);
  appRoot.append(shell);
  windowManager = new WindowManager(layer, repository);
  await renderBar(bar);
  const savedWindows = (await repository.all('meta'))
    .filter(record => record.id.startsWith('window:'))
    .sort((a, b) => (a.z || 0) - (b.z || 0));
  if (savedWindows.length) {
    for (const saved of savedWindows) {
      const id = saved.id.slice('window:'.length);
      if (id === 'guide' || surfaces.some(([surfaceId]) => surfaceId === id)) {
        await openSurface(id);
      } else if (id.startsWith('production-window:')) {
        await openProduction(id.slice('production-window:'.length));
      } else if (id.startsWith('production-master-control:')) {
        await openProductionMasterControl(id.slice('production-master-control:'.length));
      } else if (id.startsWith('actor-surface:')) {
        const actor = productionState.productionRuntime.actors
          .find(item => id.startsWith(`actor-surface:${item.id}:`));
        if (actor) {
          const suffix = id.slice(`actor-surface:${actor.id}:`.length, -5);
          await openActorSurface(actor.id, suffix === 'standalone' ? null : suffix);
        }
      }
    }
  } else {
    await openSurface('guide');
  }
}

async function renderBar(bar = document.querySelector('.gummy-bar')) {
  if (!bar) return;
  const pending = (await repository.all('workOrders')).filter(order => order.status === 'awaiting-approval').length;
  const receipts = (await repository.all('receipts')).length;
  bar.replaceChildren();
  surfaces.forEach(([id, icon, label], index) => {
    const button = h('button', {
      class: 'bar-candy', role: 'tab', 'aria-selected': String(selectedApp === id), tabindex: selectedApp === id ? '0' : '-1',
      dataset: { app: id }, onclick: () => id === 'glopper' ? togglePanel() : openSurface(id)
    }, [h('span', { class: 'icon', 'aria-hidden': 'true', text: icon }), h('span', { class: 'label', text: label })]);
    if (id === 'work-orders' && pending) button.append(h('span', { class: 'badge', 'aria-label': `${pending} awaiting approval`, text: String(pending) }));
    if (id === 'receipts' && receipts) button.append(h('span', { class: 'badge', 'aria-label': `${receipts} receipts`, text: String(receipts) }));
    button.addEventListener('keydown', event => {
      const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      const buttons = [...bar.querySelectorAll('.bar-candy')];
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      buttons.forEach((item, itemIndex) => item.tabIndex = itemIndex === next ? 0 : -1);
      buttons[next].focus();
    });
    bar.append(button);
  });
}

async function toggleMode() {
  await applyMode(document.documentElement.dataset.gummyMode === 'night' ? 'day' : 'night');
  announce(`${document.documentElement.dataset.gummyMode === 'night' ? 'Night' : 'Day'} Gummy selected.`);
}

async function openSurface(id) {
  selectedApp = id;
  await renderBar();
  const titles = {
    guide: ['Welcome to your Gummy', 'orientation'],
    gummies: ['My Gummies', 'objects and quarantine'],
    browser: ['Gummy Browser', 'isolated navigation'],
    productions: ['Productions', 'Actor-first durable undertakings'],
    actors: ['Actors & Bowls', 'composition proof'],
    'work-orders': ['Work Orders', 'Glopper Inbox'],
    receipts: ['Receipts', 'local tamper evidence'],
    control: ['Master Control', 'authority and revocation'],
    applications: ['Applications', 'full Gummy OS product map']
  };
  const content = await buildSurface(id);
  const existing = windowManager.windows.get(id);
  if (existing) {
    existing.querySelector('.window-body').replaceChildren(content);
    existing.hidden = false;
    windowManager.focus(existing);
  } else {
    await windowManager.open({ id, title: titles[id]?.[0] || id, subtitle: titles[id]?.[1], content });
  }
}

async function refreshSurface(id) {
  if (windowManager?.windows.has(id)) await openSurface(id);
  await renderBar();
  if (panelOpen) await renderPanel();
}

async function buildSurface(id) {
  if (id === 'guide') return guideSurface();
  if (id === 'gummies') return gummiesSurface();
  if (id === 'browser') return browserSurface();
  if (id === 'productions') return productionSurface();
  if (id === 'actors') return actorsSurface();
  if (id === 'work-orders') return workOrdersSurface();
  if (id === 'receipts') return receiptsSurface();
  if (id === 'control') return controlSurface();
  return applicationsSurface();
}

function productionSurface(productionId = null) {
  return createProductionApp({
    store: productionStore,
    productionId,
    openActorSurface,
    openMasterControl: openProductionMasterControl,
    openProduction,
    toast: (title, detail) => announce(`${title}. ${detail}`)
  }).node;
}

async function openProduction(productionId) {
  const production = productionState.productionRuntime.productions.find(item => item.id === productionId);
  const id = `production-window:${productionId}`;
  const content = productionSurface(productionId);
  const existing = windowManager.windows.get(id);
  if (existing) {
    existing.querySelector('.window-body').replaceChildren(content);
    existing.hidden = false;
    windowManager.focus(existing);
    return;
  }
  await windowManager.open({
    id,
    title: production?.title || 'Production',
    subtitle: `${productionId} · Actor-first Production`,
    content
  });
}

async function openActorSurface(actorId, productionId = null) {
  const actor = productionState.productionRuntime.actors.find(item => item.id === actorId);
  const id = actorSurfaceWindowId(actorId, productionId);
  const content = createActorSurface({
    store: productionStore,
    actorId,
    productionId,
    toast: (title, detail) => announce(`${title}. ${detail}`),
    refreshWindow: () => refreshProductionSurfaces(productionId)
  }).node;
  const existing = windowManager.windows.get(id);
  if (existing) {
    existing.querySelector('.window-body').replaceChildren(content);
    existing.hidden = false;
    windowManager.focus(existing);
    return;
  }
  await windowManager.open({
    id,
    title: actor?.name || actorId,
    subtitle: productionId ? `Actor App Surface · ${productionId}` : 'Standalone Actor App Surface',
    content
  });
}

async function refreshProductionSurfaces(productionId = null) {
  const overview = windowManager?.windows.get('productions');
  if (overview) overview.querySelector('.window-body').replaceChildren(productionSurface());
  if (productionId) {
    const scoped = windowManager?.windows.get(`production-window:${productionId}`);
    if (scoped) scoped.querySelector('.window-body').replaceChildren(productionSurface(productionId));
  }
  await renderBar();
}

async function openProductionMasterControl(productionId) {
  const id = `production-master-control:${productionId}`;
  const content = createMasterControlApp({
    store: productionStore,
    productionId,
    openActorSurface,
    openProduction,
    toast: (title, detail) => announce(`${title}. ${detail}`)
  }).node;
  const existing = windowManager.windows.get(id);
  if (existing) {
    existing.querySelector('.window-body').replaceChildren(content);
    existing.hidden = false;
    windowManager.focus(existing);
    return;
  }
  await windowManager.open({
    id,
    title: 'Master Control',
    subtitle: `${productionId} · Production scope`,
    content
  });
}

function guideSurface() {
  return h('div', {}, [
    h('p', { class: 'eyebrow', text: 'Gummy guide · orientation and continuity' }),
    h('section', { class: 'doorway', 'aria-label': 'Start in Gummy OS' }, [
      h('h1', { text: 'Your creative computer, with you in control.' }),
      h('p', { class: 'lede', text: 'Start locally. Configure what you want. Nothing runs until you choose Make Production.' }),
      h('div', { class: 'doorway-actions' }, [
        h('button', { class: 'choice doorway-choice', onclick: () => openSurface('productions') }, [
          h('strong', { text: 'Start a blank Production' }),
          h('span', { text: 'Create a private workspace. No specialist work starts.' })
        ]),
        h('button', { class: 'choice doorway-choice', onclick: () => openSurface('productions') }, [
          h('strong', { text: 'Open the Night Gummy Launch sample' }),
          h('span', { text: 'Use safe brand-owned sources and deterministic demonstration routes.' })
        ])
      ]),
      h('div', { class: 'button-row secondary-doorway-actions' }, [
        h('button', { class: 'button', onclick: () => openSurface('gummies') }, 'Import a project or backup'),
        h('button', { class: 'button', onclick: () => openSurface('productions') }, 'Open an existing Production'),
        h('button', { class: 'button', onclick: () => document.querySelector('#gummy-conversation')?.focus() }, 'Learn how Gummy OS works')
      ])
    ]),
    h('section', {
      id: 'gummy-conversation',
      class: 'card gummy-orientation',
      tabindex: '-1',
      dataset: { gummyAssistant: 'gummy' },
      'aria-label': 'Talk to Gummy'
    }, [
      h('h2', { text: 'Talk to Gummy' }),
      h('p', { text: 'Gummy helps you understand where projects, applications, people, spaces, and controls belong. Glopper remains the separate action companion.' }),
      h('label', { class: 'field' }, [
        h('span', { text: 'Orientation question' }),
        h('textarea', { rows: '2', placeholder: 'Where should I begin?' })
      ]),
      h('button', { class: 'button', disabled: true }, 'Orientation conversation is staged')
    ]),
    h('div', { class: 'split' }, [
      h('div', {}, [
        h('h1', { text: 'A computer you can open.' }),
        h('p', { class: 'lede', text: 'Your Canvas keeps continuity while Glopper carries out only the work you approve. Every meaningful action leaves local evidence.' }),
        h('div', { class: 'button-row' }, [
          h('button', { class: 'button primary', onclick: () => { panelTab = 'inbox'; togglePanel(true); } }, 'Review the Work Order'),
          h('button', { class: 'button', onclick: () => openSurface('gummies') }, 'Open My Gummies')
        ])
      ]),
      h('figure', { class: 'gummy-guide-figure', dataset: { gummyAssistant: 'gummy' } }, [
        h('img', {
          src: gummyAssets.mascotHead,
          alt: 'Gummy, the VR-goggled chimp guide',
          width: '512',
          height: '768',
          loading: 'lazy',
          decoding: 'async'
        }),
        h('figcaption', {}, [
          h('strong', { text: 'Gummy keeps your place.' }),
          h('span', { text: 'Purple-dominant orientation · gold action cues' })
        ])
      ])
    ]),
    h('div', { class: 'card-grid' }, [
      h('article', { class: 'card', dataset: { gummyAssistant: 'glopper' } }, [
        h('div', { class: 'mascot-slot', 'aria-label': 'Temporary Glopper mascot slot', text: '✦' }),
        h('h2', { text: 'Glopper helps you act.' }),
        h('p', { text: 'agent:glopper-web · OpenAI Responses · gpt-5.6-sol · cloud locality' })
      ]),
      h('article', { class: 'card' }, [
        h('h2', { text: 'Local Operator' }),
        h('p', { text: 'agent:gummy-operator-local · Gemma 3 4B reference lane · offline until a trusted local supervisor is paired' }),
        h('span', { class: 'status offline', text: 'No ambient authority' })
      ]),
      h('article', { class: 'card' }, [h('h2', { text: 'Authority' }), h('p', { text: 'human:hayden sponsors actor:hayden through Master Control.' })]),
      h('article', { class: 'card' }, [h('h2', { text: 'Boundaries' }), h('p', { text: 'No shell, native runtime, public discovery, billing, or production identity.' })]),
      h('article', { class: 'card' }, [h('h2', { text: 'Durability' }), h('p', { text: 'Metadata lives in IndexedDB; Gummy bytes live in origin-private storage.' })])
    ])
  ]);
}

async function gummiesSurface() {
  const gummies = await repository.all('gummies');
  const root = h('div');
  const picker = h('input', { type: 'file', accept: '.md,.txt,text/plain,text/markdown', hidden: true });
  picker.addEventListener('change', async () => {
    const file = picker.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return announce('Import blocked: general imports are limited to 10 MiB.');
    const bytes = new Uint8Array(await file.arrayBuffer());
    const id = createId('gummy');
    try {
      const stored = await byteStore.writeGummy(id, 1, bytes);
      const record = {
        schema: 'gummy.gummy/v0', id, kind: 'file', title: file.name, ownerActorId: 'actor:hayden', creatorActorId: 'actor:hayden',
        visibility: 'private', revision: 1, content: { mediaType: file.type || 'application/octet-stream', byteRef: stored.path, sizeBytes: stored.byteLength },
        hash: { algorithm: 'sha256', value: stored.hash },
        quarantine: { status: 'quarantined', source: 'browser import', classification: 'unknown external file', nativeAuthority: false },
        capabilities: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        extensions: { workspaceId: 'workspace:imports' }
      };
      await repository.putValidated('gummies', record);
      const workspace = await repository.get('workspaces', 'workspace:imports') || { id: 'workspace:imports', status: 'disposable', recordRefs: [], opfsPaths: [], createdAt: new Date().toISOString() };
      workspace.recordRefs.push({ store: 'gummies', id });
      workspace.opfsPaths.push(stored.path);
      await repository.put('workspaces', workspace, { validate: false });
      announce(`${file.name} imported into quarantine.`);
      await refreshSurface('gummies');
    } catch (error) {
      announce(`Persistence blocked: ${error.message}`);
    }
  });
  root.append(
    h('p', { class: 'eyebrow', text: 'User-owned objects' }),
    h('h2', { text: 'My Gummies' }),
    h('p', { class: 'lede', text: 'Sources and results are separate. Provider and unknown imports remain bounded and never receive native authority.' }),
    h('div', { class: 'button-row' }, [
      h('button', { class: 'button primary', onclick: () => picker.click(), dataset: { testid: 'import-gummy' } }, 'Import a Gummy'),
      h('button', { class: 'button', onclick: burnWorkspace }, 'Burn disposable imports')
    ]),
    picker
  );
  const list = h('ul', { class: 'record-list' });
  for (const gummy of gummies) {
    const row = h('li', { class: 'record-row' });
    const details = h('div', {}, [
      h('strong', { text: gummy.title || gummy.id }),
      h('small', { text: `${gummy.kind} · revision ${gummy.revision} · ${gummy.content.mediaType}` }),
      h('small', { class: 'receipt-hash', text: `sha256:${gummy.hash.value}` }),
      h('span', { class: `status ${['quarantined', 'blocked'].includes(gummy.quarantine?.status) ? 'blocked' : ''}`, text: gummy.quarantine?.status || 'local' })
    ]);
    const actions = h('div', { class: 'button-row' });
    if (gummy.quarantine?.status === 'quarantined') {
      actions.append(h('button', { class: 'button', onclick: () => denyPromotion(gummy) }, 'Deny promotion'));
    }
    if (gummy.kind === 'result') actions.append(h('button', { class: 'button', onclick: () => boundedExport(gummy) }, 'Bounded browser export'));
    row.append(details, actions);
    list.append(row);
  }
  root.append(list);
  return root;
}

async function denyPromotion(gummy) {
  const receipt = await createReceipt(repository, {
    action: 'deny-quarantine-promotion', resources: [gummy.id], outcome: 'denied', reversible: false,
    detail: 'Human denied promotion. No shell, process, package, device, or broad filesystem capability was issued.'
  });
  await repository.putValidated('gummies', {
    ...gummy, quarantine: { ...gummy.quarantine, status: 'blocked', decidedByHumanId: 'human:hayden', decidedAt: new Date().toISOString(), decisionReceiptId: receipt.id, nativeAuthority: false },
    updatedAt: new Date().toISOString()
  });
  announce('Promotion denied and Receipt recorded.');
  await refreshSurface('gummies');
}

async function boundedExport(gummy) {
  const bytes = await byteStore.read(gummy.content.byteRef);
  if ('showSaveFilePicker' in window) {
    const handle = await window.showSaveFilePicker({ suggestedName: `${gummy.title || 'gummy-result'}.md`, types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md'] } }] }).catch(() => null);
    if (!handle) return;
    const writable = await handle.createWritable();
    await writable.write(bytes);
    await writable.close();
  } else {
    const url = URL.createObjectURL(new Blob([bytes], { type: gummy.content.mediaType }));
    const anchor = h('a', { href: url, download: `${gummy.title || 'gummy-result'}.md` });
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const receipt = await createReceipt(repository, { action: 'bounded-browser-export', resources: [gummy.id], outcome: 'completed', reversible: false, evidence: { sourceHashes: [gummy.hash.value] }, detail: 'Browser-bounded export only; no native promotion or execution authority.' });
  await repository.putValidated('gummies', { ...gummy, quarantine: { ...gummy.quarantine, status: 'exported-bounded', decidedByHumanId: 'human:hayden', decidedAt: new Date().toISOString(), decisionReceiptId: receipt.id, nativeAuthority: false }, updatedAt: new Date().toISOString() });
  announce('Bounded browser export recorded.');
  await refreshSurface('gummies');
}

async function burnWorkspace() {
  const workspace = await repository.get('workspaces', 'workspace:imports');
  if (!workspace) return announce('No unaccepted disposable workspace state exists.');
  const preManifest = { recordRefs: workspace.recordRefs, opfsPaths: workspace.opfsPaths };
  const preHash = await sha256(preManifest);
  for (const path of workspace.opfsPaths) await byteStore.delete(path).catch(() => {});
  await repository.transaction(['gummies', 'workspaces'], 'readwrite', async tx => {
    for (const ref of workspace.recordRefs) if (ref.store === 'gummies') await tx.objectStore('gummies').delete(ref.id);
    await tx.objectStore('workspaces').delete(workspace.id);
  });
  const postManifest = { recordRefs: [], opfsPaths: [] };
  await createReceipt(repository, {
    action: 'burn-disposable-workspace', resources: [workspace.id], outcome: 'completed', reversible: false,
    evidence: { burnResetProof: `${preHash}:${await sha256(postManifest)}` },
    detail: 'Deleted only unaccepted workspace records and byte paths; accepted Gummies, Returns, and Receipts were preserved.',
    extensions: { preManifest, postManifest }
  });
  announce('Disposable workspace burned; accepted evidence was preserved.');
  await refreshSurface('gummies');
}

function browserSurface() {
  const input = h('input', { value: 'https://example.com', 'aria-label': 'External URL' });
  const frame = h('iframe', { title: 'Isolated external preview', sandbox: '', hidden: true });
  return h('div', {}, [
    h('p', { class: 'eyebrow', text: 'Isolated navigation' }),
    h('h2', { text: 'Gummy Browser' }),
    h('p', { class: 'notice', text: 'External pages open in a sandbox without same-origin privileges. Imported text is rendered as text and never executed.' }),
    h('label', { class: 'field' }, [h('span', { text: 'HTTPS address' }), input]),
    h('button', { class: 'button', onclick: () => {
      try {
        const url = new URL(input.value);
        if (url.protocol !== 'https:') throw new Error();
        frame.src = url.toString();
        frame.hidden = false;
      } catch {
        announce('Only valid HTTPS addresses can open in the isolated preview.');
      }
    } }, 'Open isolated preview'),
    frame
  ]);
}

async function actorsSurface() {
  const actors = await repository.all('actors');
  const bowls = await repository.all('bowls');
  const profiles = await repository.all('profiles');
  const root = h('div', {}, [
    h('p', { class: 'eyebrow', text: 'Persistent identities, explicit composition' }),
    h('h2', { text: 'Actors & Bowls' }),
    h('p', { class: 'lede', text: 'People & Spaces is a first-class Gummy OS pillar. Actor Homes, stable @addresses, follows, memberships, sharing, Links, Grabs, and collaborative Rooms remain staged—not removed.' }),
    h('div', { class: 'card-grid' }, actors.map(actor => h('article', { class: 'card', dataset: { actorId: actor.id } }, [
      h('h3', { text: actor.name }),
      h('p', { text: `${actor.id} · ${actor.address}` }),
      h('span', { class: 'status', text: `${actor.kind} · ${actor.status}` }),
      h('button', { class: 'button', onclick: () => openActorSurface(actor.id) }, 'Open standalone Actor view')
    ]))),
    h('div', { class: 'button-row' }, [
      h('button', { class: 'button primary', onclick: composeBowl, disabled: bowls.some(bowl => bowl.id === 'bowl:composition-proof') }, 'Compose temporary private Bowl')
    ])
  ]);
  if (bowls.length) {
    root.append(h('h3', { text: 'Temporary composition output' }));
    for (const bowl of bowls) root.append(h('div', { class: 'card' }, [h('strong', { text: bowl.name }), h('p', { text: `${bowl.members.length} Actors · ${bowl.gummyIds.length} selected Gummies · private` })]));
  }
  root.append(h('h3', { text: 'Profile boundaries' }));
  for (const profile of profiles.filter(item => item.type !== 'migration-evidence')) {
    const card = h('div', { class: 'record-row' }, [
      h('div', {}, [h('strong', { text: profile.type }), h('small', { text: profile.content }), h('small', { text: profile.syncEligible ? `Sync eligible · ${profile.status || 'approved'}` : 'Never included in Box synchronization' })])
    ]);
    if (profile.type === 'approved-portable-profile' && profile.status !== 'approved') card.append(h('button', { class: 'button', onclick: () => promoteProfile(profile) }, 'Approve promotion'));
    root.append(card);
  }
  return root;
}

async function composeBowl() {
  const gummies = await repository.all('gummies');
  const timestamp = new Date().toISOString();
  const bowl = {
    schema: 'gummy.bowl/v0', id: 'bowl:composition-proof', name: 'Two-Actor Composition Proof',
    description: 'Temporary private composition preserving both Actor identities and provenance.',
    ownerActorId: 'actor:hayden', visibility: 'private',
    members: [
      { actorId: 'actor:hayden', moldId: (await repository.get('masterControls', 'master-control:hayden')).activeMoldId, role: 'sponsor', status: 'active', joinedAt: timestamp },
      { actorId: 'actor:studio-test', role: 'test collaborator', status: 'active', joinedAt: timestamp }
    ],
    gummyIds: gummies.slice(0, 2).map(item => item.id),
    policy: { whoCanInvite: ['actor:hayden'], whoCanPublish: [], agentActorsAllowed: false, defaultGummyVisibility: 'private', grabPolicy: 'per-gummy' },
    createdAt: timestamp, updatedAt: timestamp
  };
  const link = {
    schema: 'gummy.link/v0', id: createId('link'), type: 'collaborates-with',
    source: { kind: 'actor', id: 'actor:hayden' }, target: { kind: 'actor', id: 'actor:studio-test' },
    createdByActorId: 'actor:hayden', scope: { bowlId: bowl.id, temporary: true },
    consent: { sourceApproved: true, targetApproved: true, policyReference: 'local-test-composition' },
    status: 'active', createdAt: timestamp
  };
  await repository.putValidated('bowls', bowl);
  await repository.putValidated('links', link);
  await createReceipt(repository, { action: 'compose-two-local-actors', resources: [bowl.id, link.id], linkIds: [link.id], outcome: 'completed', reversible: true, detail: 'Created a temporary private Bowl without merging Actor identities or private state.' });
  announce('Two Actors composed into a temporary private Bowl.');
  await refreshSurface('actors');
}

async function promoteProfile(profile) {
  await repository.put('profiles', { ...profile, status: 'approved', approvedBy: 'human:hayden', updatedAt: new Date().toISOString() }, { validate: false });
  await createReceipt(repository, { action: 'approve-portable-profile', resources: [profile.id], outcome: 'completed', reversible: true, detail: 'Human explicitly approved only the portable profile. Private local memory remains excluded.' });
  announce('Portable profile approved with a Receipt.');
  await refreshSurface('actors');
}

async function workOrdersSurface() {
  const orders = (await repository.all('workOrders')).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const selected = orders.find(order => order.id === selectedWorkOrderId) || orders[0];
  selectedWorkOrderId = selected?.id;
  const root = h('div', {}, [
    h('p', { class: 'eyebrow', text: 'Glopper Inbox' }),
    h('h2', { text: 'Work Orders' }),
    h('p', { class: 'lede', text: 'A Work Order proposes work. Approval creates the exclusive lease and temporary Grants; it is not itself authority.' })
  ]);
  const importer = h('input', { type: 'file', accept: 'application/json,.json', hidden: true });
  importer.addEventListener('change', async () => {
    const file = importer.files[0];
    if (!file) return;
    try {
      if (file.size > 256 * 1024) throw new Error('Work Order import is limited to 256 KiB.');
      const imported = JSON.parse(await file.text());
      await validator.validate(imported, 'workOrders', repository);
      await policy.validateWorkOrder(imported);
      const safe = {
        ...imported,
        status: 'awaiting-approval',
        updatedAt: new Date().toISOString(),
        extensions: { ...imported.extensions, importSource: 'untrusted-browser-json', validatedAt: new Date().toISOString() }
      };
      await repository.putValidated('workOrders', safe);
      selectedWorkOrderId = safe.id;
      announce('Imported Work Order passed schema and semantic validation; Human approval is still required.');
      await refreshSurface('work-orders');
    } catch (error) {
      announce(`Work Order import blocked: ${error.message}`);
    }
  });
  root.append(h('div', { class: 'button-row' }, [
    h('button', { class: 'button', onclick: () => importer.click() }, 'Import JSON Work Order'),
    h('button', { class: 'button', onclick: () => { selectedWorkOrderId = 'work-order:project-brief'; void refreshSurface('work-orders'); } }, 'Use built-in project brief')
  ]), importer);
  if (!selected) return root;
  const selector = h('select', { 'aria-label': 'Choose a Work Order' });
  for (const order of orders) selector.append(h('option', { value: order.id, selected: order.id === selected.id, text: `${order.status} · ${order.goal}` }));
  selector.addEventListener('change', async () => { selectedWorkOrderId = selector.value; await refreshSurface('work-orders'); });
  root.append(h('label', { class: 'field' }, [h('span', { text: 'Work Order' }), selector]));
  root.append(facts([
    ['Status', selected.status],
    ['Issuer', `${selected.issuer.displayName} · ${selected.issuer.type}`],
    ['Provider / model', 'OpenAI / gpt-5.6-sol (actual response is recorded)'],
    ['Target', `${selected.target.actorId} through ${selected.target.preferredAgentId}`],
    ['Goal', selected.goal],
    ['Sources', selected.sourceRefs.map(ref => `${ref.ref} · ${ref.hash}`).join(', ')],
    ['Capabilities', selected.scope.requestedCapabilities.join(', ')],
    ['Locality / privacy', `${selected.execution.requiredLocality} · ${selected.execution.privacy}`],
    ['Cost ceiling', `$${selected.scope.maxCost.toFixed(2)} USD`],
    ['Expiry', selected.expiresAt],
    ['Risk', selected.approval.risk],
    ['Conflicts', 'Exclusive canonical scope; second claim is denied before provider call'],
    ['Acceptance', selected.acceptance.checks.join(' · ')]
  ]));
  if (['awaiting-approval', 'held', 'validated'].includes(selected.status)) {
    root.append(h('div', { class: 'button-row' }, [
      h('button', { class: 'button', onclick: () => decideWorkOrder(selected, 'hold') }, 'Hold'),
      h('button', { class: 'button', onclick: () => decideWorkOrder(selected, 'reject') }, 'Reject'),
      h('button', { class: 'button', onclick: () => decideWorkOrder(selected, 'revise') }, 'Revise'),
      h('button', { class: 'button primary', dataset: { testid: 'approve-work-order' }, onclick: event => decideWorkOrder(selected, 'approve', event.currentTarget) }, 'Approve & run')
    ]));
  }
  if (selected.status === 'returned') root.append(
    h('p', { class: 'notice', text: 'Result returned. Review the separate result Gummy, Return, and Receipt.' }),
    h('button', { class: 'button primary', onclick: () => acceptReturn(selected) }, 'Accept durable result')
  );
  if (selected.status === 'accepted') root.append(h('p', { class: 'notice', text: 'Human accepted this result. Source, result, Return, and Receipts remain durable.' }));
  return root;
}

async function acceptReturn(order) {
  const returned = (await repository.all('returns')).find(item => item.workOrderId === order.id && item.result === 'completed');
  if (!returned) return announce('No completed Return is available to accept.');
  await repository.putValidated('workOrders', {
    ...order,
    status: 'accepted',
    updatedAt: new Date().toISOString(),
    extensions: { ...order.extensions, acceptedReturnId: returned.id }
  });
  await createReceipt(repository, {
    action: 'accept-work-return',
    resources: [order.id, returned.id, ...returned.gummiesChanged],
    resultGummyIds: returned.gummiesChanged,
    outcome: 'completed',
    reversible: false,
    detail: 'Human accepted the returned result into durable personal state.'
  });
  announce('Return accepted into durable state.');
  await refreshSurface('work-orders');
  await refreshSurface('receipts');
}

async function decideWorkOrder(order, decision, button) {
  if (button) {
    button.disabled = true;
    button.textContent = 'Validating authority…';
  }
  panelOpen = true;
  panelTab = 'control';
  await renderPanel();
  const result = await workflow.decide(order, decision);
  if (decision === 'approve' && result.lease) {
    announce('Approved. Exclusive lease and three 15-minute Grants issued.');
    if (button) button.textContent = 'Glopper is running…';
    const execution = await workflow.execute(result);
    announce(execution.status === 'completed'
      ? 'Glopper returned a separate result Gummy with Return and Receipt.'
      : execution.status === 'offline-queued'
        ? 'Offline. Approved execution is queued and will be fully revalidated on reconnect.'
        : `Execution ${execution.status}: ${execution.returned?.knownLimitations?.[0] || 'Review terminal evidence.'}`);
  } else {
    announce(decision === 'revise' ? 'Revised Work Order created; original archived as cancelled.' : `Work Order ${result.status || decision}.`);
  }
  await refreshSurface('work-orders');
  await refreshSurface('gummies');
  await refreshSurface('receipts');
}

async function receiptsSurface() {
  const all = (await repository.all('receipts')).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const root = h('div', {}, [
    h('p', { class: 'eyebrow', text: 'Evidence, not identity proof' }),
    h('h2', { text: 'Receipts' }),
    h('p', { class: 'notice', text: 'Each Receipt hashes canonical local evidence and the prior Receipt hash. This is local tamper evidence—not a signature or verified identity.' })
  ]);
  const query = h('input', { placeholder: 'Actor, Agent, Work Order, outcome, capability, Box, or date', 'aria-label': 'Filter Receipts' });
  const list = h('div', { class: 'record-list' });
  const render = () => {
    const term = query.value.toLowerCase();
    list.replaceChildren();
    for (const receipt of all.filter(item => JSON.stringify(item).toLowerCase().includes(term))) {
      list.append(h('article', { class: 'card' }, [
        h('div', { class: 'record-row' }, [
          h('div', {}, [h('strong', { text: receipt.action }), h('small', { text: `${receipt.outcome} · ${receipt.operatorId} · ${receipt.createdAt}` })]),
          h('span', { class: `status ${receipt.outcome === 'completed' ? '' : 'blocked'}`, text: receipt.outcome })
        ]),
        h('p', { text: receipt.detail || 'No additional detail.' }),
        h('div', { class: 'receipt-hash', text: `hash ${receipt.canonicalHash}` }),
        h('div', { class: 'receipt-hash', text: `prior ${receipt.extensions?.priorReceiptHash || 'genesis'}` })
      ]));
    }
    if (!list.children.length) list.append(h('p', { class: 'empty', text: 'No Receipts match this filter.' }));
  };
  query.addEventListener('input', render);
  root.append(h('label', { class: 'field' }, [h('span', { text: 'Search Receipts' }), query]), list);
  render();
  return root;
}

async function controlSurface() {
  const control = await repository.get('masterControls', 'master-control:hayden');
  const mold = await repository.get('molds', control.activeMoldId);
  const agent = await repository.get('agents', control.activeAgentId);
  const localOperator = await repository.get('agents', 'agent:gummy-operator-local');
  const root = h('div', {}, [
    h('p', { class: 'eyebrow', text: 'Human-controlled authority' }),
    h('h2', { text: 'Master Control' }),
    facts([
      ['Human', 'human:hayden · local non-verified'],
      ['Actor', 'actor:hayden · @hayden'],
      ['Agent', `${agent.id} · ${agent.status} · ${agent.locality}`],
      ['Local Operator', `${localOperator.id} · ${localOperator.model} · ${localOperator.status} · no active authority`],
      ['Mold', `${mold.id} · ${mold.status}`],
      ['Active lease', control.activeTaskLeaseId || 'none'],
      ['Authoritative location', control.authoritativeLocation],
      ['Locality', 'web / approved cloud transform'],
      ['Capability ceiling', agent.capabilityCeiling.join(', ')],
      ['Cost policy', session.testMode ? 'Hermetic test price table' : session.openaiConfigured ? 'Server-configured' : 'Unconfigured · execution blocks']
    ]),
    h('div', { class: 'button-row' }, [
      h('button', { class: 'button danger', onclick: revokeMold, disabled: mold.status === 'revoked' }, 'Revoke active Mold'),
      h('button', { class: 'button primary', onclick: restoreMold, disabled: mold.status !== 'revoked' }, 'Issue replacement Mold v2'),
      h('button', { class: 'button', onclick: proveRevocationBlock, disabled: mold.status !== 'revoked' }, 'Prove provider-call block')
    ]),
    h('p', { class: 'notice', text: 'Revocation is append-only. Restoration issues a new Mold ID; the revoked Mold is never erased or reactivated.' })
  ]);
  root.append(
    h('section', { class: 'card' }, [
      h('h3', { text: 'Managed Gummy Box' }),
      h('p', { text: 'Optional managed synchronization infrastructure. It never replaces Local Box, Gummy OS, Applications, the Operator, or Social computing.' }),
      h('span', { class: 'status offline', text: 'Staged · explicit opt-in only' }),
      h('p', { class: 'meta', text: 'Local Gummy Box remains authoritative. No managed provider has been connected or granted access.' })
    ]),
    await githubSurface()
  );
  return root;
}

async function revokeMold() {
  const control = await repository.get('masterControls', 'master-control:hayden');
  const mold = await repository.get('molds', control.activeMoldId);
  const revokedAt = new Date().toISOString();
  await repository.putValidated('molds', { ...mold, status: 'revoked', revokedAt, updatedAt: revokedAt });
  await repository.putValidated('masterControls', { ...control, revokedMoldIds: [...new Set([...control.revokedMoldIds, mold.id])], updatedAt: revokedAt });
  await createReceipt(repository, { action: 'revoke-mold', moldId: mold.id, resources: [mold.id], outcome: 'completed', reversible: false, evidence: { revocationProof: `${mold.id}:${revokedAt}` }, detail: 'Revoked Mold; future execution is blocked before provider contact.' });
  announce('Mold revoked. It cannot be reactivated.');
  await refreshSurface('control');
  await refreshSurface('receipts');
}

async function proveRevocationBlock() {
  const template = await repository.get('workOrders', 'work-order:project-brief');
  const order = {
    ...structuredClone(template), id: createId('work-order'), status: 'awaiting-approval', taskLeaseId: undefined,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    approval: { required: true, risk: 'medium' }, extensions: { revocationProof: true, supersedes: template.id }
  };
  await repository.putValidated('workOrders', order);
  selectedWorkOrderId = order.id;
  const result = await workflow.approve(order);
  announce(`Revocation proof: ${result.status}. No provider call was made.`);
  await refreshSurface('control');
  await refreshSurface('work-orders');
  await refreshSurface('receipts');
}

async function restoreMold() {
  const control = await repository.get('masterControls', 'master-control:hayden');
  const revoked = await repository.get('molds', control.activeMoldId);
  const timestamp = new Date().toISOString();
  const mold = {
    ...structuredClone(revoked), id: 'mold:hayden:personal:v2', name: 'Personal Gummy v2', status: 'active',
    issuedAt: timestamp, updatedAt: timestamp, revokedAt: undefined,
    proofs: [...(revoked.proofs || []), { type: 'replacement-for', moldId: revoked.id }]
  };
  await repository.putValidated('molds', mold);
  await repository.putValidated('masterControls', { ...control, activeMoldId: mold.id, updatedAt: timestamp });
  const actor = await repository.get('actors', 'actor:hayden');
  await repository.putValidated('actors', { ...actor, moldIds: [...new Set([...actor.moldIds, mold.id])], updatedAt: timestamp });
  const agent = await repository.get('agents', 'agent:glopper-web');
  await repository.putValidated('agents', { ...agent, moldIds: [...new Set([...agent.moldIds, mold.id])], updatedAt: timestamp });
  const template = await repository.get('workOrders', 'work-order:project-brief');
  if (template) {
    const restoredOrder = {
      ...structuredClone(template),
      id: createId('work-order'),
      target: { ...template.target, moldId: mold.id },
      status: 'awaiting-approval',
      taskLeaseId: undefined,
      approval: { required: true, risk: 'medium' },
      createdAt: timestamp,
      updatedAt: timestamp,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      extensions: { restoredByMold: mold.id, supersedes: template.id }
    };
    await repository.putValidated('workOrders', restoredOrder);
    selectedWorkOrderId = restoredOrder.id;
  }
  await createReceipt(repository, { action: 'issue-replacement-mold', moldId: mold.id, resources: [revoked.id, mold.id], outcome: 'completed', reversible: false, detail: 'Issued Mold v2. The original remains revoked and is not reactivated.' });
  announce('Replacement Mold v2 issued; revoked history preserved.');
  await refreshSurface('control');
  await refreshSurface('receipts');
}

async function githubSurface() {
  const box = await repository.get('boxes', 'box:hayden');
  const card = h('section', { class: 'card' }, [
    h('h3', { text: 'Private GitHub Gummy Box' }),
    h('p', { text: 'Optional mirror: one selected private repository, branch gummy-box, root gummy-box/. Local remains authoritative until you explicitly promote GitHub.' }),
    h('span', { class: `status ${session.githubConfigured ? '' : 'offline'}`, text: session.githubConfigured ? 'GitHub App server configured' : 'Unavailable until GitHub App credentials are configured' })
  ]);
  if (session.githubConfigured) {
    card.append(h('div', { class: 'button-row' }, [
      h('a', { class: 'button primary', href: '/api/v1/github/install', text: 'Install on one repository' }),
      h('button', { class: 'button', onclick: () => loadGitHubRepositories(card) }, 'Choose installed private repository'),
      h('a', { class: 'button', href: 'https://github.com/settings/installations', target: '_blank', rel: 'noreferrer', text: 'Manage installation' })
    ]));
  }
  if (box.extensions?.github) {
    const choice = h('select', { 'aria-label': 'Authority after GitHub disconnect' }, [
      h('option', { value: 'local', text: 'Promote Local back to authoritative' }),
      h('option', { value: 'paused-github', text: 'Keep GitHub authority paused' })
    ]);
    card.append(
      h('label', { class: 'field' }, [h('span', { text: 'Disconnect authority decision' }), choice]),
      h('button', { class: 'button danger', onclick: async () => {
        try {
          const disconnected = await githubBox.disconnect(box.id);
          const localAuthority = choice.value === 'local';
          await repository.putValidated('boxes', {
            ...box,
            authoritativeLocation: localAuthority ? 'Local Gummy Box' : box.authoritativeLocation,
            status: localAuthority ? 'active' : 'paused',
            updatedAt: new Date().toISOString(),
            extensions: { ...box.extensions, github: { ...box.extensions.github, connectionStatus: 'disconnected', authorityStatus: localAuthority ? 'mirror-retained' : 'paused' } }
          });
          await createReceipt(repository, {
            action: 'disconnect-private-github-box',
            resources: [box.id, box.extensions.github.repository],
            outcome: 'completed',
            reversible: true,
            detail: localAuthority ? 'Removed local GitHub session and promoted Local to authoritative.' : 'Removed local GitHub session and left GitHub authority explicitly paused. The App was not uninstalled.'
          });
          announce(`GitHub connection removed. Manage installation separately: ${disconnected.managementUrl}`);
          await refreshSurface('control');
        } catch (error) {
          announce(`GitHub disconnect blocked: ${error.message}`);
        }
      } }, 'Disconnect local GitHub session')
    );
  }
  card.append(h('p', { class: 'meta', text: 'Disconnecting removes this local connection only; it never claims to uninstall the GitHub App.' }));
  return card;
}

async function loadGitHubRepositories(card) {
  try {
    const { repositories } = await githubBox.repositories();
    const select = h('select', { 'aria-label': 'Private GitHub repository' });
    for (const item of repositories) select.append(h('option', { value: item.fullName, text: item.fullName }));
    const authority = h('input', { type: 'checkbox', id: 'github-authority-confirm' });
    card.append(h('div', {}, [
      h('label', { class: 'field' }, [h('span', { text: 'Existing private repository' }), select]),
      h('label', { class: 'field', for: 'github-authority-confirm' }, [authority, h('span', { text: 'After the first Local-to-GitHub sync, promote GitHub to authoritative and Local to mirror.' })]),
      h('button', { class: 'button primary', onclick: async () => {
        try {
          const connected = await githubBox.connect({ boxId: 'box:hayden', repository: select.value });
          const snapshot = await repository.export();
          const files = {
            'gummy-box/returns/snapshot.json': JSON.stringify(snapshot.returns, null, 2),
            'gummy-box/receipts/snapshot.json': JSON.stringify(snapshot.receipts, null, 2)
          };
          const selectedRepository = repositories.find(item => item.fullName === select.value);
          const synced = await githubBox.sync('box:hayden', {
            defaultBranch: selectedRepository.defaultBranch,
            expectedHead: connected.revisionId,
            files,
            message: 'Initialize private Gummy Box'
          });
          if (synced.status !== 'committed') throw new Error('Remote head changed; reconciliation is required before retry.');
          const box = await repository.get('boxes', 'box:hayden');
          const location = `github:${select.value}:gummy-box`;
          await repository.putValidated('boxes', {
            ...box,
            authoritativeLocation: authority.checked ? location : box.authoritativeLocation,
            mirrorLocations: [...new Set([...box.mirrorLocations, location])],
            syncPolicy: { ...box.syncPolicy, mode: 'approved' },
            updatedAt: new Date().toISOString(),
            extensions: { ...box.extensions, github: { repository: select.value, branch: 'gummy-box', root: 'gummy-box/', head: synced.revisionId, localRole: authority.checked ? 'mirror' : 'authoritative' } }
          });
          await createReceipt(repository, {
            action: 'connect-private-github-box',
            resources: ['box:hayden', select.value],
            outcome: 'completed',
            reversible: true,
            detail: authority.checked ? 'Human approved GitHub authority after first Local-to-GitHub sync.' : 'Connected GitHub as an approved mirror; Local remains authoritative.'
          });
          announce('Private GitHub Gummy Box committed with expected-head protection.');
          await refreshSurface('control');
        } catch (error) {
          announce(`GitHub sync blocked: ${error.message}`);
        }
      } }, 'Connect and sync Local first')
    ]));
  } catch (error) {
    announce(`GitHub connection blocked: ${error.message}`);
  }
}

async function applicationsSurface() {
  const root = h('div', {}, [
    h('p', { class: 'eyebrow', text: 'First-party Gummy OS applications' }),
    h('h2', { text: 'Applications' }),
    h('p', { class: 'lede', text: 'Specialist products keep their own interfaces, repositories, protocols, evidence, and execution boundaries. Gummy OS launches or connects them truthfully.' })
  ]);
  try {
    const { productMap, applicationRegistry } = await loadProductCatalog();
    const applicationGrid = h('div', { class: 'card-grid application-grid', dataset: { testid: 'first-party-applications' } });
    for (const application of applicationRegistry.applications) {
      const launch = applicationLaunchState(application);
      const action = launch.available
        ? h('a', { class: 'button primary', href: launch.route, target: '_blank', rel: 'noopener noreferrer', text: launch.label })
        : h('button', { class: 'button', disabled: true, text: launch.label });
      applicationGrid.append(h('article', { class: 'card application-card', dataset: { applicationId: application.id } }, [
        h('div', { class: 'application-heading' }, [
          h('div', {}, [
            h('p', { class: 'eyebrow', text: application.id }),
            h('h3', { text: application.name })
          ]),
          h('span', {
            class: `status ${launch.available ? '' : 'offline'}`,
            text: launch.available ? 'Available' : application.connectionStatus.replaceAll('-', ' ')
          })
        ]),
        h('p', { text: application.productPurpose }),
        h('p', { class: 'meta', text: `${application.canonicalRepository} · ${application.releaseStatus}` }),
        h('div', { class: 'button-row' }, [action]),
        !launch.available ? h('p', { class: 'notice compact-notice', text: launch.reason }) : null,
        h('details', {}, [
          h('summary', { text: 'Capabilities and continuity' }),
          facts([
            ['Launch mode', application.launchMode],
            ['Locality', application.locality.join(', ')],
            ['Capabilities', application.capabilities.join(', ')],
            ['Accepted inputs', application.acceptedInputs.join(', ') || 'none'],
            ['Produces', application.producedArtifacts.join(', ')],
            ['Protocols', application.protocolVersions.join(', ')]
          ])
        ])
      ]));
    }
    const pillarGrid = h('div', { class: 'product-pillar-list' });
    for (const pillar of productMap.pillars) {
      pillarGrid.append(h('article', { class: 'record-row', dataset: { pillarId: pillar.id } }, [
        h('div', {}, [
          h('strong', { text: pillar.name }),
          h('small', { text: pillar.productPurpose }),
          h('small', { text: pillar.canonicalSource })
        ]),
        h('span', { class: 'status', text: pillar.integrationStatus.replaceAll('-', ' ') })
      ]));
    }
    root.append(
      applicationGrid,
      h('section', { class: 'product-map-section' }, [
        h('p', { class: 'eyebrow', text: 'Protected full product map' }),
        h('h3', { text: productMap.controllingRule }),
        h('p', { text: 'Social computing may ship after the personal proof, but it remains visible and architectural. Cloudflare storage, GitHub, and Google Drive remain optional infrastructure.' }),
        pillarGrid
      ])
    );
  } catch (error) {
    root.append(h('section', { class: 'card' }, [
      h('h3', { text: 'Product registry unavailable' }),
      h('p', { text: error.message }),
      h('p', { class: 'notice', text: 'Protected applications are not silently hidden. Launch remains blocked until the registry can be validated.' })
    ]));
  }
  return root;
}

async function togglePanel(force) {
  panelOpen = typeof force === 'boolean' ? force : !panelOpen;
  await renderPanel();
}

async function renderPanel() {
  document.querySelector('.glopper-panel')?.remove();
  if (!panelOpen) return;
  const panel = h('aside', { class: 'glopper-panel', 'aria-label': 'Glopper Panel', dataset: { gummyAssistant: 'glopper' } });
  const header = h('header', { class: 'panel-header' }, [
    h('div', { class: 'glopper-identity' }, [
      h('div', { class: 'mascot-slot', 'aria-label': 'Temporary Glopper mascot slot', text: '✦' }),
      h('div', {}, [h('strong', { text: 'Glopper' }), h('small', { class: 'meta', text: 'agent:glopper-web' })])
    ]),
    h('button', { class: 'button', 'aria-label': 'Close Glopper Panel', onclick: () => togglePanel(false) }, '×')
  ]);
  const tabs = h('div', { class: 'panel-tabs', role: 'tablist' });
  for (const tab of ['conversation', 'inbox', 'control', 'results', 'receipts']) {
    tabs.append(h('button', {
      role: 'tab', 'aria-selected': String(panelTab === tab), text: tab[0].toUpperCase() + tab.slice(1),
      onclick: async () => { panelTab = tab; await renderPanel(); }
    }));
  }
  panel.append(header, tabs, h('div', { class: 'panel-content' }, await panelContent()));
  document.body.append(panel);
}

async function panelContent() {
  if (panelTab === 'conversation') {
    const file = h('input', { type: 'file', accept: '.md,.txt', hidden: true });
    return h('div', {}, [
      h('div', { class: 'message human' }, [h('strong', { text: 'Human · Hayden' }), h('span', { text: 'Help me turn the project brief into a concise summary.' })]),
      h('div', { class: 'message gummy' }, [h('strong', { text: 'Gummy · @hayden' }), h('span', { text: 'The selected Canvas context stays attached to this task only.' })]),
      h('div', { class: 'message glopper' }, [h('strong', { text: 'Glopper · agent:glopper-web' }), h('span', { text: 'I can act only after the Work Order, lease, and three Grants all pass.' })]),
      h('div', { class: 'message system' }, [h('strong', { text: 'System' }), h('span', { text: `Provider ${session.testMode ? 'mocked for hermetic verification' : 'OpenAI'} · gpt-5.6-sol · cloud · cost policy ${session.testMode || session.openaiConfigured ? 'available' : 'unconfigured'}` })]),
      h('div', { class: 'conversation-compose' }, [
        h('label', { class: 'field' }, [h('span', { text: 'Message (local placeholder)' }), h('textarea', { rows: '3', placeholder: 'Conversation input does not execute work.' })]),
        h('div', { class: 'drop-zone', tabindex: '0', text: 'Attach a Markdown file or selected Canvas context' }),
        h('div', { class: 'button-row' }, [h('button', { class: 'button', onclick: () => file.click() }, 'Choose file'), h('button', { class: 'button', disabled: true }, 'Voice placeholder')]),
        file
      ])
    ]);
  }
  if (panelTab === 'inbox') {
    const pending = (await repository.all('workOrders')).filter(order => ['awaiting-approval', 'held'].includes(order.status));
    return h('div', {}, [
      h('h3', { text: `Inbox · ${pending.length} pending` }),
      ...pending.map(order => h('button', { class: 'card button', onclick: () => { selectedWorkOrderId = order.id; openSurface('work-orders'); } }, [
        h('strong', { text: order.goal }), h('small', { text: `${order.approval.risk} risk · expires ${order.expiresAt}` })
      ]))
    ]);
  }
  if (panelTab === 'control') {
    const control = await repository.get('masterControls', 'master-control:hayden');
    const grants = (await repository.all('grants')).filter(grant => !grant.revoked && Date.parse(grant.expiresAt) > Date.now());
    return h('div', {}, [
      facts([
        ['Human', 'human:hayden'],
        ['Actor', 'actor:hayden · @hayden'],
        ['Agent', 'agent:glopper-web'],
        ['Mold', control.activeMoldId],
        ['Authority', control.authoritativeLocation],
        ['Locality', 'web / approved cloud'],
        ['Lease', control.activeTaskLeaseId || 'none'],
        ['Grants', grants.length ? grants.map(grant => grant.action).join(', ') : 'none'],
        ['Cost ceiling', '$0.25 / Work Order']
      ]),
      h('button', { class: 'button', onclick: () => openSurface('control') }, 'Open Master Control')
    ]);
  }
  if (panelTab === 'results') {
    const results = (await repository.all('gummies')).filter(gummy => gummy.kind === 'result');
    return h('div', {}, results.length ? results.map(result => h('div', { class: 'card' }, [h('strong', { text: result.title }), h('p', { text: `${result.hash.algorithm}:${result.hash.value}` }), h('button', { class: 'button', onclick: () => boundedExport(result) }, 'Bounded browser export')])) : [h('p', { class: 'empty', text: 'No result Gummies yet.' })]);
  }
  const receipts = (await repository.all('receipts')).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
  return h('div', {}, receipts.map(receipt => h('div', { class: 'card' }, [h('strong', { text: receipt.action }), h('small', { text: `${receipt.outcome} · ${receipt.createdAt}` })])));
}

async function bootstrap() {
  try {
    await initializeSession();
    await repository.open();
    await migrateLegacy(repository);
    await ensureFullProductRecords(repository);
    const mode = await repository.get('meta', 'preference:mode');
    await applyMode(mode?.value, false);
    document.querySelector('#boot')?.remove();
    const onboardingState = await repository.get('meta', 'onboarding');
    if (!onboardingState?.completed) appRoot.append(onboarding());
    else {
      productionState = { productionRuntime: await productionRepository.initialize() };
      await renderShell();
    }
    registerSW({ immediate: true });
    window.addEventListener('online', () => void resumeApprovedOutbox());
    window.addEventListener('offline', () => announce('Offline. Provider execution is unavailable; approvals will be revalidated before resuming.'));
    window.addEventListener('gummy:open-actor-surface', event => {
      void openActorSurface(event.detail.actorId, event.detail.productionId || null);
    });
  } catch (error) {
    document.querySelector('#boot')?.remove();
    appRoot.append(h('main', { class: 'onboarding' }, h('div', { class: 'onboarding-card' }, [
      h('p', { class: 'eyebrow', text: 'Blocked state' }),
      h('h1', { text: 'Gummy could not open durable state' }),
      h('p', { text: error.message }),
      h('p', { text: 'No successful persistence claim has been made.' })
    ])));
  }
}

async function resumeApprovedOutbox() {
  announce('Back online. Revalidating queued approval, lease, Grants, expiry, locality, revocation, and source hash.');
  for (const item of (await repository.all('outbox')).filter(record => record.operation === 'resume-approved-execution')) {
    const [workOrder, lease] = await Promise.all([
      repository.get('workOrders', item.workOrderId),
      repository.get('taskLeases', item.leaseId)
    ]);
    const grants = (await Promise.all(item.grantIds.map(id => repository.get('grants', id)))).filter(Boolean);
    const result = await workflow.execute({ workOrder, lease, grants });
    await repository.delete('outbox', item.id);
    announce(result.status === 'completed' ? 'Queued execution completed after revalidation.' : `Queued execution returned to terminal evidence: ${result.status}.`);
  }
  await refreshSurface('work-orders');
}

void bootstrap();
