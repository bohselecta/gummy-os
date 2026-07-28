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
import {
  applyBackupPackage,
  applyReset,
  BACKUP_MIME,
  createBackupPackage,
  inspectBackupPackage,
  previewReset,
  recoverLocalBox,
  serializeBackupPackage
} from './core/box-backup.js';
import {
  actorSurfaceWindowId,
  addNightGummyLaunchRoster,
  createProduction
} from './core/production-runtime.js';
import { PHASE14_PLACES } from './places/manifest.js';
import { createProductionApp } from './apps/production.js';
import { createActorSurface } from './apps/actor-surface.js';
import { createMasterControlApp } from './apps/master-control.js';
import { createBrowserSpecialistRegistry } from './integrations/specialist-runtime.js';
import {
  ensureLivingActorRecords,
  recordCohortEvent,
  resolvePresence,
  setActorPresence
} from './core/living-actor.js';
import { WindowManager } from './window-manager.js';
import { gummyAssets } from './brand/gummy-assets.js';
import { gummyRealmAssets, realmPicture } from './brand/gummy-realm-assets.js';

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
const specialistAdapters = createBrowserSpecialistRegistry();
let windowManager;
let session = {
  openaiConfigured: false,
  githubConfigured: false,
  feedbackConfigured: false,
  signalingConfigured: false,
  testMode: false
};
let panelOpen = false;
let panelTab = 'conversation';
let selectedApp = 'guide';
let selectedWorkOrderId = 'work-order:project-brief';
let productionState = { productionRuntime: null };
let uxCopy;
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
  ['applications', '⌘', 'Places'],
  ['about', 'ⓘ', 'About / Limits']
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
  try {
    const response = await fetch('/api/v1/session');
    if (!response.ok) throw new Error(`Session endpoint returned ${response.status}`);
    session = await response.json();
    if (session.csrf) sessionStorage.setItem('gummy-csrf', session.csrf);
  } catch {
    session = {
      openaiConfigured: false,
      githubConfigured: false,
      testMode: false,
      offline: true,
      csrf: ''
    };
    sessionStorage.removeItem('gummy-csrf');
  }
}

async function loadFirstUserExperience() {
  const response = await fetch('/registry/first-user-experience.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error(`First-user experience copy unavailable: ${response.status}`);
  const copy = await response.json();
  if (copy.schema !== 'gummy.first-user-experience/v1') throw new Error('First-user experience copy has an unsupported schema');
  return copy;
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
  await ensureLivingActorRecords(repository, {
    providerConfigured: session.openaiConfigured,
    testMode: session.testMode
  });
  await repository.put('meta', { id: 'onboarding', completed: true, completedAt: new Date().toISOString() }, { validate: false });
  await createReceipt(repository, {
    action: 'initialize-local-gummy-box', resources: ['box:hayden'], outcome: 'completed', reversible: true,
    detail: 'Created the authoritative Local Gummy Box and personal authority records. Identity remains local and unverified.'
  });
  productionState = { productionRuntime: await productionRepository.initialize() };
}

async function startProduction(kind, { open = true } = {}) {
  const runtime = productionState.productionRuntime;
  let production = kind === 'sample'
    ? runtime.productions.find(item => item.id === 'production:night-gummy-launch')
    : null;
  let nextRuntime = runtime;

  if (!production) {
    const created = kind === 'sample'
      ? createProduction(runtime, {
          id: 'production:night-gummy-launch',
          title: 'Night Gummy Launch',
          description: 'Create brand-owned launch image, motion, and editable scene concepts without private likenesses or external credentials.',
          audience: 'public-launch',
          sourceGummyIds: ['gummy:night-gummy-launch-brief', 'gummy:night-gummy-launch-brand-kit']
        })
      : createProduction(runtime, {
          title: 'Untitled Production',
          description: 'A private Production ready for your direction, sources, and specialist choices.',
          sourceGummyIds: []
        });
    production = created.production;
    nextRuntime = created.runtime;
    if (kind === 'sample') {
      nextRuntime = addNightGummyLaunchRoster(nextRuntime, production.id, 'sample');
    }
    productionState = { productionRuntime: nextRuntime };
    await productionRepository.persist(nextRuntime);
  }

  if (open && windowManager) await openProduction(production.id);
  return production;
}

function onboarding() {
  let step = 0;
  const copy = uxCopy.onboarding;
  const choices = { mode: null, name: '', address: '', addressEdited: false };
  const root = h('section', { class: 'onboarding', 'aria-label': 'Gummy OS onboarding' });
  const realm = h('div', { class: 'onboarding-realm', 'aria-hidden': 'true' });
  const card = h('div', { class: 'onboarding-card' });
  const renderRealm = mode => {
    const safeMode = mode === 'day' ? 'day' : 'night';
    const picture = realmPicture(safeMode, { className: 'onboarding-realm-picture' });
    picture.querySelector('img').fetchPriority = 'high';
    realm.replaceChildren(
      picture,
      h('div', { class: 'onboarding-realm-vignette' }),
      h('img', {
        class: 'onboarding-glopper',
        src: gummyRealmAssets.glopper.standing,
        alt: '',
        width: '512',
        height: '512',
        decoding: 'async'
      }),
      h('div', { class: 'realm-caption' }, [
        h('span', { text: 'THE GUMMY REALM' }),
        h('strong', { text: 'The Lantern Chamber' }),
        h('small', { text: safeMode === 'day' ? 'Day Gummy · warm creative calm' : 'Night Gummy · focused creative calm' })
      ])
    );
  };
  renderRealm(document.documentElement.dataset.gummyMode);
  root.append(realm, card);

  const render = () => {
    card.replaceChildren();
    card.dataset.step = String(step);
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
    const meter = h('div', {
      class: 'step-meter',
      role: 'progressbar',
      'aria-label': 'Onboarding progress',
      'aria-valuemin': '1',
      'aria-valuemax': '4',
      'aria-valuenow': String(step + 1),
      'aria-valuetext': `Step ${step + 1} of 4`
    });
    for (let index = 0; index < 4; index += 1) meter.append(h('span', { class: index <= step ? 'active' : '' }));
    card.append(identity, meter, h('p', { class: 'eyebrow', text: `Personal Gummy · ${step + 1} / 4` }));
    if (step === 0) {
      card.append(
        h('h1', { text: copy.welcome.title }),
        h('p', { class: 'lede', text: copy.welcome.lede }),
        h('p', { text: copy.welcome.detail }),
        h('div', { class: 'choice-grid realm-choice-grid' }, ['night', 'day'].map(mode => h('button', {
          class: 'choice realm-choice', 'aria-pressed': String(choices.mode === mode), dataset: { testid: `mode-${mode}` },
          onclick: () => {
            choices.mode = mode;
            void applyMode(mode, false);
            renderRealm(mode);
            render();
          }
        }, [
          h('img', {
            src: gummyRealmAssets.realm.expressions[mode].preview,
            alt: '',
            width: '320',
            height: '180',
            loading: 'eager',
            decoding: 'async'
          }),
          h('strong', { text: mode === 'night' ? 'Night Gummy' : 'Day Gummy' }),
          h('span', { text: mode === 'night' ? 'Deep, electric, focused.' : 'Warm, bright, energetic.' })
        ]))),
        nextButton('Enter Gummy OS', () => step += 1, () => Boolean(choices.mode)),
        h('ul', { class: 'onboarding-trust', 'aria-label': 'Local-first promises' }, [
          h('li', { text: 'Private on this device' }),
          h('li', { text: 'No account required' }),
          h('li', { text: 'Nothing runs until Make Production' })
        ])
      );
    } else if (step === 1) {
      const name = h('input', {
        id: 'human-name',
        value: choices.name,
        autocomplete: 'name',
        placeholder: 'Your name'
      });
      const address = h('input', {
        id: 'actor-address',
        value: choices.address,
        pattern: '^@[a-zA-Z0-9._-]+$',
        placeholder: '@your-name'
      });
      const continueRow = nextButton(
        'Continue',
        () => step += 1,
        () => Boolean(choices.name && /^@[a-zA-Z0-9._-]+$/.test(choices.address))
      );
      const syncIdentity = () => {
        continueRow.querySelector('button').disabled = !(choices.name && /^@[a-zA-Z0-9._-]+$/.test(choices.address));
      };
      name.addEventListener('input', () => {
        choices.name = name.value.trim();
        if (!choices.addressEdited) {
          const slug = choices.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-|-$/g, '');
          choices.address = slug ? `@${slug}` : '';
          address.value = choices.address;
        }
        syncIdentity();
      });
      address.addEventListener('input', () => {
        choices.addressEdited = true;
        choices.address = address.value.trim();
        syncIdentity();
      });
      card.append(
        h('h1', { text: copy.identity.title }),
        h('p', { class: 'lede', text: copy.identity.lede }),
        h('label', { class: 'field', for: 'human-name' }, [h('span', { text: copy.identity.nameLabel }), name]),
        h('label', { class: 'field', for: 'actor-address' }, [h('span', { text: copy.identity.addressLabel }), address]),
        continueRow
      );
    } else if (step === 2) {
      const restoreInput = h('input', {
        type: 'file',
        accept: '.gummybox,application/vnd.gummy.box-backup+json',
        class: 'sr-only',
        'aria-label': 'Restore a Gummy Box backup'
      });
      const restoreStatus = h('div', { 'aria-live': 'polite' });
      restoreInput.addEventListener('change', async () => {
        const file = restoreInput.files?.[0];
        if (!file) return;
        restoreStatus.replaceChildren(h('p', { class: 'notice', text: 'Inspecting backup without changing current state…' }));
        try {
          const inspection = await inspectBackupPackage(await file.text(), { repository });
          const apply = h('button', {
            class: 'button primary',
            onclick: async event => {
              event.currentTarget.disabled = true;
              try {
                const result = await applyBackupPackage({ inspection, repository, byteStore });
                productionState = { productionRuntime: await productionRepository.initialize() };
                root.remove();
                await renderShell();
                announce(`Backup restored: ${result.counts.added} records added and ${result.counts.conflicting} conflicts preserved.`);
              } catch (error) {
                event.currentTarget.disabled = false;
                restoreStatus.append(h('p', { class: 'notice', text: `Restore blocked: ${error.message}` }));
              }
            }
          }, 'Restore inspected backup');
          restoreStatus.replaceChildren(
            h('article', { class: 'card' }, [
              h('strong', { text: 'Backup inspection complete' }),
              h('p', { text: `${inspection.counts.records} records · ${inspection.counts.bytes} byte entries · ${inspection.counts.added} added · ${inspection.counts.conflicting} conflicts` }),
              h('p', { class: 'meta', text: `Package sha256:${inspection.packageHash}` }),
              apply
            ])
          );
        } catch (error) {
          restoreStatus.replaceChildren(h('p', { class: 'notice', text: `Backup inspection blocked: ${error.message}` }));
        }
      });
      card.append(
        h('h1', { text: copy.box.title }),
        h('p', { class: 'lede', text: copy.box.lede }),
        h('div', { class: 'card' }, [h('h3', { text: 'Local Gummy Box' }), h('p', { text: copy.box.state }), h('span', { class: 'status', text: 'Ready' })]),
        restoreInput,
        h('button', { class: 'button', onclick: () => restoreInput.click() }, 'Restore a Gummy Box backup'),
        restoreStatus,
        nextButton('Create Local Gummy Box', () => step += 1)
      );
    } else {
      const finish = async (kind, button) => {
        button.disabled = true;
        button.textContent = 'Creating your private starting place…';
        try {
          await seedPersonalGummy(choices);
          await recordCohortEvent(repository, 'onboarding-completed', { surface: 'onboarding' });
          await recordCohortEvent(repository, 'production-choice', { choice: kind });
          const production = kind === 'none' ? null : await startProduction(kind, { open: false });
          root.remove();
          await renderShell();
          if (production) await openProduction(production.id);
          announce(kind === 'sample'
            ? 'Night Gummy Launch is ready to explore. No specialist work has run.'
            : kind === 'blank'
            ? 'Your blank Production is ready. No specialist work has run.'
            : 'Your Canvas is ready. Start or open a Production when you choose.');
        } catch (error) {
          button.disabled = false;
          button.textContent = kind === 'sample'
            ? 'Open the sample Production'
            : kind === 'blank'
            ? 'Start a blank Production'
            : 'Explore my Canvas first';
          card.append(h('p', {
            class: 'notice',
            text: error instanceof ByteStoreError ? `Persistence blocked: ${error.message}` : error.message
          }));
        }
      };
      card.append(
        h('h1', { text: copy.starting.title }),
        h('p', { class: 'lede', text: copy.starting.lede }),
        h('div', { class: 'boundary-callout' }, [
          h('strong', { text: copy.starting.boundaryTitle }),
          h('p', { text: copy.starting.boundaryDetail })
        ]),
        h('div', { class: 'choice-grid first-production-choices' }, [
          h('button', {
            class: 'choice',
            onclick: event => void finish('blank', event.currentTarget)
          }, [
            h('strong', { text: 'Start a blank Production' }),
            h('span', { text: copy.starting.blankDetail })
          ]),
          h('button', {
            class: 'choice',
            onclick: event => void finish('sample', event.currentTarget)
          }, [
            h('strong', { text: 'Open the sample Production' }),
            h('span', { text: copy.starting.sampleDetail })
          ])
        ]),
        h('div', { class: 'button-row' }, [
          h('button', {
            class: 'button',
            dataset: { testid: 'enter-canvas' },
            onclick: event => void finish('none', event.currentTarget)
          }, 'Explore my Canvas first')
        ]),
        h('p', { class: 'meta', text: copy.starting.optional })
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
      h('button', {
        class: 'button window-cycle-button',
        onclick: () => {
          const focused = windowManager?.cycleFocus();
          announce(focused ? `Focused ${focused.getAttribute('aria-label')}.` : 'No open windows.');
        },
        'aria-label': 'Cycle open Gummy windows'
      }, [h('span', { text: '▣' }), h('span', { class: 'label', text: ' Windows' })]),
      h('button', {
        class: 'button current-production-button',
        onclick: () => {
          const current = [...(productionState.productionRuntime?.productions || [])]
            .reverse()
            .find(item => !['completed', 'cancelled'].includes(item.status));
          if (current) void openProduction(current.id);
          else void openSurface('productions');
        },
        'aria-label': 'Return to current Production'
      }, [h('span', { text: '◇' }), h('span', { class: 'label', text: ' Current' })]),
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
      } else if (id.startsWith('private-chat:')) {
        await openPrivateChatWindow(id.slice('private-chat:'.length));
      } else if (id.startsWith('place-window:')) {
        const [, placeSlug, contextType, ...contextParts] = id.split(':');
        const contextId = decodeURIComponent(contextParts.join(':'));
        await openPlaceWindow(`app:${placeSlug}`, { type: contextType, id: contextId });
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
  const pinRecord = await repository.get('meta', 'place-pins:actor:hayden');
  const pinnedIds = pinRecord?.placeIds || [];
  const pinnedPlaces = PHASE14_PLACES.filter(place => pinnedIds.includes(place.id));
  const hasSelectedTab = surfaces.some(([id]) => id === selectedApp)
    || pinnedPlaces.some(place => selectedApp === `place:${place.id}`);
  bar.replaceChildren();
  surfaces.forEach(([id, icon, label], index) => {
    const button = h('button', {
      class: 'bar-candy', role: 'tab', 'aria-selected': String(selectedApp === id), tabindex: selectedApp === id || (!hasSelectedTab && index === 0) ? '0' : '-1',
      dataset: { app: id }, onclick: () => id === 'glopper' ? togglePanel() : openSurface(id)
    }, [
      id === 'glopper'
        ? h('img', {
            class: 'bar-glopper-icon',
            src: gummyRealmAssets.glopper.avatar64,
            alt: '',
            width: '64',
            height: '64',
            decoding: 'async'
          })
        : h('span', { class: 'icon', 'aria-hidden': 'true', text: icon }),
      h('span', { class: 'label', text: label })
    ]);
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
  for (const place of pinnedPlaces) {
    const button = h('button', {
      class: 'bar-candy place-pin',
      role: 'tab',
      'aria-selected': String(selectedApp === `place:${place.id}`),
      tabindex: selectedApp === `place:${place.id}` ? '0' : '-1',
      dataset: { app: `place:${place.id}`, placeId: place.id },
      onclick: () => openPlaceWindow(place.id, place.context)
    }, [
      h('span', { class: 'icon', 'aria-hidden': 'true', text: place.icon }),
      h('span', { class: 'label', text: place.name })
    ]);
    button.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const buttons = [...bar.querySelectorAll('.bar-candy')];
      const current = buttons.indexOf(button);
      const next = event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? buttons.length - 1
          : (current + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      buttons.forEach((item, itemIndex) => item.tabIndex = itemIndex === next ? 0 : -1);
      buttons[next].focus();
    });
    bar.append(button);
  }
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
    applications: ['Places', 'private, studio, and connected Places'],
    about: ['About Gummy', 'capabilities, limits, privacy, and build']
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

async function openPrivateChatWindow(participantActorId = 'actor:glopper') {
  const actor = await repository.get('actors', participantActorId);
  if (!actor) {
    announce(`Private chat blocked: Actor not found (${participantActorId}).`);
    return;
  }
  const id = `private-chat:${participantActorId}`;
  const existing = windowManager.windows.get(id);
  if (existing) {
    existing.hidden = false;
    windowManager.focus(existing);
    return;
  }
  const { createPrivateChatApp } = await import('./apps/private-chat.js');
  const app = await createPrivateChatApp({
    repository,
    session,
    participantActorId,
    announce,
    onDeleted: async () => {
      await windowManager.control(id, 'close');
      await refreshSurface('actors');
    }
  });
  await windowManager.open({
    id,
    title: `Private chat · ${actor.name}`,
    subtitle: participantActorId === 'actor:glopper'
      ? 'Actor surface · governed Agent replies'
      : 'Actor surface · Human-operated messages',
    content: app.node
  });
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
  if (id === 'about') return aboutSurface();
  return applicationsSurface();
}

function productionSurface(productionId = null) {
  return createProductionApp({
    store: productionStore,
    productionId,
    openActorSurface,
    openMasterControl: openProductionMasterControl,
    openProduction,
    toast: (title, detail) => announce(`${title}. ${detail}`),
    specialistAdapters,
    copy: uxCopy.production
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
  const copy = uxCopy.guide;
  return h('div', {}, [
    h('p', { class: 'eyebrow', text: 'Gummy guide · orientation and continuity' }),
    h('section', { class: 'doorway', 'aria-label': 'Start in Gummy OS' }, [
      h('h1', { text: 'Your creative computer, with you in control.' }),
      h('p', { class: 'lede', text: 'Start locally. Configure what you want. Nothing runs until you choose Make Production.' }),
      h('div', { class: 'doorway-actions' }, [
        h('button', { class: 'choice doorway-choice', onclick: () => void startProduction('blank') }, [
          h('strong', { text: 'Start a blank Production' }),
          h('span', { text: 'Create a private workspace. No specialist work starts.' })
        ]),
        h('button', { class: 'choice doorway-choice', onclick: () => void startProduction('sample') }, [
          h('strong', { text: 'Open the Night Gummy Launch sample' }),
          h('span', { text: 'Meet the specialist Actors using safe brand-owned sources and demonstration routes.' })
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
      h('h2', { text: 'Gummy can help you find your way' }),
      h('p', { text: 'Gummy explains where work lives. Glopper is the separate companion that helps you take approved action.' }),
      h('div', { class: 'orientation-topics' }, copy.topics.map(([question, answer]) => h('details', {}, [
        h('summary', { text: question }),
        h('p', { text: answer })
      ]))),
      h('div', { class: 'button-row' }, [
        h('button', { class: 'button', onclick: () => openSurface('actors') }, 'Meet the Actors'),
        h('button', { class: 'button', onclick: () => { panelTab = 'conversation'; void togglePanel(true); } }, 'Ask Glopper what to do next')
      ])
    ]),
    h('figure', { class: 'gummy-guide-figure compact-guide-figure', dataset: { gummyAssistant: 'gummy' } }, [
      realmPicture(document.documentElement.dataset.gummyMode, {
        decorative: false,
        className: 'guide-realm-picture'
      }),
      h('figcaption', {}, [
        h('strong', { text: 'One realm. Two expressions.' }),
        h('span', { text: 'Purple establishes place · gold marks action' })
      ])
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
  const localActors = await repository.all('actors');
  const bowls = await repository.all('bowls');
  const profiles = await repository.all('profiles');
  const runtime = productionState.productionRuntime;
  const copy = uxCopy.presence;
  const activeProduction = [...runtime.productions].reverse().find(item => !['completed', 'cancelled'].includes(item.status))
    || runtime.productions.at(-1);
  const glopperConfigured = session.openaiConfigured || session.testMode;
  const presenceRecords = Object.fromEntries((await repository.all('actorPresence')).map(item => [item.actorId, resolvePresence(item)]));
  const presence = copy.cards.map(item => {
    const glopper = item.id === 'agent:glopper-web';
    const actorId = glopper ? 'actor:glopper' : item.id;
    const livePresence = presenceRecords[actorId];
    const config = activeProduction && runtime.configurations.find(entry => (
      entry.productionId === activeProduction.id && entry.actorId === actorId
    ));
    return {
      ...item,
      id: actorId,
      identity: glopper
        ? 'actor:glopper · service Actor surface · agent:glopper-web disclosed only when approved'
        : item.identity,
      tone: item.tone || 'limited',
      capability: glopper && glopperConfigured ? item.configured : item.capability,
      state: livePresence
        ? `${livePresence.state.replaceAll('-', ' ')}${livePresence.stale ? ' · expired' : ''}`
        : item.state,
      current: activeProduction
        ? glopper ? `Following ${activeProduction.title}` : `${activeProduction.title} · ${config?.readiness?.replaceAll('-', ' ') || 'not assigned'}`
        : 'Waiting for your first Production',
      action: glopper ? 'Open private chat' : activeProduction ? `Open in ${activeProduction.title}` : 'Open with the sample',
      interact: glopper
        ? () => openPrivateChatWindow('actor:glopper')
        : () => activeProduction
          ? openActorSurface(actorId, activeProduction.id)
          : void startProduction('sample').then(production => openActorSurface(actorId, production.id))
    };
  });
  const root = h('div', {}, [
    h('p', { class: 'eyebrow', text: 'Living entry points · truthful presence' }),
    h('h2', { text: 'Actors & companions' }),
    h('p', { class: 'lede', text: copy.intro }),
    h('div', {
      class: 'presence-grid',
      dataset: { testid: 'actor-presence-grid' }
    }, presence.map(item => h('article', {
      class: 'presence-card',
      dataset: { presenceId: item.id }
    }, [
      h('img', {
        class: 'presence-portal',
        src: item.id === 'actor:glopper'
          ? gummyRealmAssets.portals.glopper
          : item.id === 'actor:imagehoss'
          ? gummyRealmAssets.portals.imagehoss
          : item.id === 'actor:videoboss'
          ? gummyRealmAssets.portals.videoboss
          : gummyRealmAssets.portals.meshmallow,
        alt: item.id === 'actor:glopper'
          ? 'Glopper Guide Alcove in the Lantern Chamber'
          : item.id === 'actor:imagehoss'
          ? 'ImageHoss Light Table in the Lantern Chamber'
          : item.id === 'actor:videoboss'
          ? 'VideoBoss Projection Bay in the Lantern Chamber'
          : 'Meshmallow Form Workshop in the Lantern Chamber',
        width: '960',
        height: '540',
        loading: 'lazy',
        decoding: 'async'
      }),
      h('div', { class: 'presence-card-body' }, [
        h('div', { class: 'presence-heading' }, [
          h('div', {}, [h('h3', { text: item.name }), h('p', { class: 'meta', text: item.identity })]),
          h('span', { class: `status ${item.tone === 'ready' ? '' : 'review'}`, text: item.state })
        ]),
        h('p', { class: 'presence-capability', text: item.capability }),
        h('div', { class: 'presence-current' }, [
          h('strong', { text: 'Current state' }),
          h('span', { text: item.current })
        ]),
        h('p', { class: 'boundary-note compact', text: item.truth }),
        h('div', { class: 'button-row' }, [
          h('button', { class: 'button primary', onclick: item.interact }, item.action),
          item.id !== 'actor:glopper'
            ? h('button', { class: 'button', onclick: () => openActorSurface(item.id) }, 'Open standalone Actor view')
            : null
        ])
      ])
    ]))),
    h('h3', { text: 'Your local Actors' }),
    h('p', { text: 'These identities live only in this browser unless you explicitly connect or share them.' }),
    h('div', { class: 'card-grid' }, localActors.map(actor => h('article', { class: 'card', dataset: { actorId: actor.id } }, [
      h('h3', { text: actor.name }),
      h('p', { text: actor.address }),
      h('span', { class: 'status', text: `${actor.kind} Actor · ${presenceRecords[actor.id]?.state?.replaceAll('-', ' ') || 'offline'}` }),
      h('div', { class: 'button-row' }, [
        h('button', { class: 'button', onclick: () => openActorSurface(actor.id) }, 'Open Actor'),
        actor.id !== 'actor:glopper'
          ? h('button', { class: 'button', onclick: () => openPrivateChatWindow(actor.id) }, 'Private chat')
          : null
      ]),
      actor.id === 'actor:hayden' ? h('div', { class: 'presence-controls' }, [
        h('small', { text: 'Personal presence is Human-controlled on this browser.' }),
        h('div', { class: 'button-row' }, [
          ...['available-for-chat', 'away', 'offline'].map(state => h('button', {
            class: 'button',
            onclick: async () => {
              await setActorPresence(repository, {
                actorId: actor.id,
                state,
                source: 'human-controlled',
                detail: `Published by the Human from this browser.`
              });
              await refreshSurface('actors');
            }
          }, state.replaceAll('-', ' ')))
        ])
      ]) : null
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
    await gummyBoxRecoverySurface(),
    h('section', { class: 'card' }, [
      h('h3', { text: 'Managed Gummy Box' }),
      h('p', { text: 'Optional managed synchronization infrastructure. It never replaces Local Box, Gummy OS, Places, the Operator, or Social computing.' }),
      h('span', { class: 'status offline', text: 'Staged · explicit opt-in only' }),
      h('p', { class: 'meta', text: 'Local Gummy Box remains authoritative. No managed provider has been connected or granted access.' })
    ]),
    await githubSurface()
  );
  return root;
}

function downloadPrivateFile(name, content, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = h('a', { href: url, download: name });
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function exportLocalBoxBackup() {
  const backup = await createBackupPackage({
    repository,
    byteStore,
    sourceVersion: '0.1.0',
    sourceCommit: 'release-candidate'
  });
  downloadPrivateFile(`gummy-box-${backup.createdAt.slice(0, 10)}.gummybox`, serializeBackupPackage(backup), BACKUP_MIME);
  await createReceipt(repository, {
    action: 'export-gummy-box-backup',
    resources: [backup.box.id, backup.packageHash],
    outcome: 'completed',
    reversible: false,
    evidence: { packageHash: backup.packageHash, recordCount: Object.values(backup.records).reduce((sum, values) => sum + values.length, 0) },
    detail: 'Exported a complete inspect-first Local Gummy Box backup. Provider secrets, session state, lease claims, and pending outbox work were excluded.'
  });
  announce(`Gummy Box backup exported · sha256:${backup.packageHash.slice(0, 12)}…`);
}

async function gummyBoxRecoverySurface() {
  const card = h('section', { class: 'card', dataset: { testid: 'gummy-box-recovery' } }, [
    h('h3', { text: 'Local Gummy Box backup and recovery' }),
    h('p', { text: 'Export a complete private backup, inspect one before restore, or preview a narrowly scoped reset. Local remains authoritative.' })
  ]);
  const status = h('div', { 'aria-live': 'polite' });
  const input = h('input', {
    type: 'file',
    accept: '.gummybox,application/vnd.gummy.box-backup+json',
    class: 'sr-only',
    'aria-label': 'Inspect a Gummy Box backup'
  });
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    status.replaceChildren(h('p', { class: 'notice', text: 'Inspecting backup. No records are changing yet…' }));
    try {
      const inspection = await inspectBackupPackage(await file.text(), { repository });
      status.replaceChildren(h('article', { class: 'card' }, [
        h('strong', { text: 'Inspected and ready' }),
        h('p', { text: `${inspection.counts.records} records · ${inspection.counts.added} added · ${inspection.counts.unchanged} unchanged · ${inspection.counts.conflicting} conflicts preserved as both versions` }),
        h('p', { class: 'meta', text: `sha256:${inspection.packageHash}` }),
        h('button', {
          class: 'button primary',
          onclick: async event => {
            event.currentTarget.disabled = true;
            try {
              const result = await applyBackupPackage({ inspection, repository, byteStore });
              productionState = { productionRuntime: await productionRepository.load() };
              announce(`Backup restored: ${result.counts.added} added, ${result.counts.conflicting} conflicts preserved.`);
              await refreshSurface('control');
            } catch (error) {
              event.currentTarget.disabled = false;
              status.append(h('p', { class: 'notice', text: `Restore blocked: ${error.message}` }));
            }
          }
        }, 'Apply inspected backup')
      ]));
    } catch (error) {
      status.replaceChildren(h('p', { class: 'notice', text: `Backup inspection blocked: ${error.message}` }));
    }
  });
  const productionSelect = h('select', { 'aria-label': 'Production to remove' });
  for (const production of productionState.productionRuntime.productions) {
    productionSelect.append(h('option', { value: production.id, text: production.title }));
  }
  const resetArea = h('div');
  const showReset = async scope => {
    const productionId = scope === 'production' ? productionSelect.value : null;
    const preview = await previewReset(repository, { scope, productionId });
    const confirmation = h('input', {
      'aria-label': `Type ${preview.confirmation} to confirm`,
      placeholder: preview.confirmation,
      autocomplete: 'off'
    });
    resetArea.replaceChildren(h('section', { class: 'card', role: 'dialog', 'aria-label': `${scope} reset preview` }, [
      h('strong', { text: `${scope === 'box' ? 'Erase Local Gummy Box' : `Reset ${scope}`} preview` }),
      h('p', { text: `${preview.count} records will be removed. ${preview.preserves.length ? `Preserves: ${preview.preserves.join(', ')}.` : 'This erases the Local Box.'}` }),
      h('p', { class: 'notice', text: 'Export a backup first if you may need this state again.' }),
      h('label', { class: 'field' }, [h('span', { text: `Type ${preview.confirmation}` }), confirmation]),
      h('div', { class: 'button-row' }, [
        h('button', { class: 'button', onclick: () => resetArea.replaceChildren() }, 'Cancel'),
        h('button', {
          class: 'button danger',
          onclick: async event => {
            event.currentTarget.disabled = true;
            try {
              const result = await applyReset(repository, preview, confirmation.value);
              if (result.finalReceipt) {
                downloadPrivateFile('gummy-box-final-reset-receipt.json', JSON.stringify(result.finalReceipt, null, 2));
                location.reload();
                return;
              }
              productionState = { productionRuntime: await productionRepository.load() };
              announce(`${scope} reset completed after exact preview and confirmation.`);
              await refreshSurface('control');
            } catch (error) {
              event.currentTarget.disabled = false;
              resetArea.append(h('p', { class: 'notice', text: `Reset blocked: ${error.message}` }));
            }
          }
        }, scope === 'box' ? 'Erase Local Gummy Box' : 'Apply exact reset')
      ])
    ]));
  };
  card.append(
    input,
    h('div', { class: 'button-row' }, [
      h('button', { class: 'button primary', onclick: () => void exportLocalBoxBackup().catch(error => announce(`Backup blocked: ${error.message}`)) }, 'Export complete backup'),
      h('button', { class: 'button', onclick: () => input.click() }, 'Inspect and restore backup')
    ]),
    h('h4', { text: 'Reset scopes' }),
    h('label', { class: 'field' }, [h('span', { text: 'Remove one Production' }), productionSelect]),
    h('div', { class: 'button-row' }, [
      h('button', { class: 'button', onclick: () => void showReset('layout') }, 'Reset layout and preferences'),
      h('button', { class: 'button', onclick: () => void showReset('workspace') }, 'Clear disposable workspace'),
      h('button', { class: 'button danger', disabled: !productionSelect.options.length, onclick: () => void showReset('production') }, 'Remove selected Production'),
      h('button', { class: 'button danger', onclick: () => void showReset('box') }, 'Erase Local Gummy Box')
    ]),
    status,
    resetArea
  );
  return card;
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

async function togglePlacePin(placeId) {
  const definition = PHASE14_PLACES.find(place => place.id === placeId);
  const record = await repository.get('meta', 'place-pins:actor:hayden');
  const placeIds = new Set(record?.placeIds || []);
  const pinned = !placeIds.has(placeId);
  if (pinned) placeIds.add(placeId);
  else placeIds.delete(placeId);
  await repository.put('meta', {
    id: 'place-pins:actor:hayden',
    schema: 'gummy.place-pins/v1',
    actorId: 'actor:hayden',
    placeIds: [...placeIds],
    updatedAt: new Date().toISOString()
  }, { validate: false });
  announce(`${definition?.name || 'Place'} ${pinned ? 'pinned to' : 'removed from'} your Gummy Bar.`);
  await renderBar();
  if (windowManager?.windows.has('applications')) await openSurface('applications');
}

async function openPlaceWindow(placeId, context) {
  const definition = PHASE14_PLACES.find(place => place.id === placeId);
  if (!definition) {
    announce(`Place unavailable: ${placeId}`);
    return;
  }
  const [{ loadPlaceCatalog, placeWindowId }, { createPlaceSurface }] = await Promise.all([
    import('./core/place-ui-contracts.js'),
    import('./apps/places.js')
  ]);
  const { placeRegistry } = await loadPlaceCatalog();
  const descriptor = placeRegistry.places.find(place => place.id === placeId);
  if (!descriptor) {
    announce(`Place descriptor unavailable: ${placeId}`);
    return;
  }
  const id = placeWindowId(placeId, context);
  selectedApp = `place:${placeId}`;
  await renderBar();
  const content = await createPlaceSurface({
    definition,
    descriptor,
    context,
    repository,
    openPlaceWindow,
    togglePlacePin
  });
  const existing = windowManager.windows.get(id);
  if (existing) {
    existing.querySelector('.window-body').replaceChildren(content);
    existing.hidden = false;
    windowManager.focus(existing);
    return;
  }
  await windowManager.open({
    id,
    title: definition.name,
    subtitle: `${context.type} · ${context.id}`,
    content
  });
}

async function applicationsSurface() {
  try {
    const { createPlacesDirectory } = await import('./apps/places.js');
    return createPlacesDirectory({ repository, openPlaceWindow, togglePlacePin });
  } catch (error) {
    return h('section', { class: 'card' }, [
      h('h3', { text: 'Place registry unavailable' }),
      h('p', { text: error.message }),
      h('p', { class: 'notice', text: 'Protected Places are not silently hidden. Launch remains blocked until the registry can be validated.' })
    ]);
  }
}

async function aboutSurface() {
  const commit = typeof __GUMMY_BUILD_COMMIT__ === 'string' ? __GUMMY_BUILD_COMMIT__ : 'unknown';
  const environment = typeof __GUMMY_BUILD_ENVIRONMENT__ === 'string' ? __GUMMY_BUILD_ENVIRONMENT__ : 'unknown';
  const root = h('div', { dataset: { testid: 'about-capabilities-limits' } }, [
    h('p', { class: 'eyebrow', text: 'Release identity and honest boundaries' }),
    h('h2', { text: 'Gummy OS 0.1' }),
    h('p', {
      class: 'test-build-identity',
      dataset: { testid: 'test-build-identity' },
      text: `Test build · ${environment} · ${commit}`
    }),
    h('p', { class: 'lede', text: 'A governed personal creative computer. Configure freely; only Make Production starts authorized work.' }),
    h('div', { class: 'card-grid' }, [
      h('article', { class: 'card' }, [
        h('h3', { text: 'Available now' }),
        h('ul', {}, [
          h('li', { text: 'Local-first Gummy Box with complete backup, inspect-first restore, and scoped reset.' }),
          h('li', { text: 'Persistent private Actor chat with transcript Gummies, export/deletion controls, explicit provider governance, and Receipts.' }),
          h('li', { text: 'Human-controlled and expiring service presence, plus explicit local audio/video/screen previews without remote-live claims.' }),
          h('li', { text: 'Durable Productions, Actor Plans, Work Orders, Leases, Grants, Returns, Receipts, and accepted-role evidence.' }),
          h('li', { text: 'Deterministic ImageHoss, VideoBoss, and Meshmallow Production adapters with explicit simulation disclosure.' }),
          h('li', { text: 'Optional repository-scoped GitHub mirror when the server capability is configured and a Human chooses it.' })
        ])
      ]),
      h('article', { class: 'card' }, [
        h('h3', { text: 'Current limits' }),
        h('ul', {}, [
          h('li', { text: 'Live ImageHoss output is not claimed without its authenticated bridge and supported ComfyUI runtime.' }),
          h('li', { text: 'Live VideoBoss output is not claimed without a trusted server render broker and provider credential.' }),
          h('li', { text: 'Live Meshmallow .blend, preview, and export are not claimed without supported Blender 4.5 LTS and a project-scoped proof.' }),
          h('li', { text: 'No arbitrary shell, Python, filesystem browsing, manufacturing, safety, compliance, or finished-game authority is granted.' })
        ])
      ]),
      h('article', { class: 'card' }, [
        h('h3', { text: 'Privacy and authority' }),
        h('p', { text: 'Local Gummy Box is authoritative by default. Provider credentials stay server-side. Context Envelopes exclude complete Actor memory, provider credentials, and ambient filesystem access.' }),
        h('p', { text: 'Connections remain mirrors unless a Human reviews and approves an authority migration. Revocation blocks future work and preserves historical evidence.' })
      ]),
      h('article', { class: 'card' }, [
        h('h3', { text: 'Build and recovery' }),
        h('p', { text: `Commit ${commit}` }),
        h('p', { text: `Mode ${document.documentElement.dataset.gummyMode} · Local Box · web runtime` }),
        h('p', { text: 'If durable state is interrupted, Gummy reports repaired, quarantined, or recovery-required records without silently claiming success.' })
      ])
    ]),
    h('details', {}, [
      h('summary', { text: 'Technical capability status' }),
      facts([
        ['Build commit', commit],
        ['Build environment', environment],
        ['Tester feedback destination', session.feedbackConfigured || session.testMode ? 'configured private route' : 'not configured · local-only remains available'],
        ['Remote media signaling', session.signalingConfigured ? 'configured seam · no room implied' : 'unavailable · local previews only'],
        ['ImageHoss live', 'NOT CLAIMED · authenticated local bridge unavailable'],
        ['VideoBoss live', 'NOT CLAIMED · trusted provider broker unconfigured'],
        ['Meshmallow live', 'NOT CLAIMED · Blender 4.5 LTS unavailable'],
        ['Deterministic specialist lanes', 'PASS · simulation disclosed'],
        ['Native ambient authority', 'none'],
        ['Backup encryption', 'not encrypted or signed · protect exported file as private data']
      ])
    ])
  ]);
  const { createTesterOperations } = await import('./apps/tester-operations.js');
  root.append(await createTesterOperations({
    repository,
    session,
    commit,
    environment,
    announce
  }));
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
      h('div', { class: 'glopper-avatar-frame' }, h('img', {
        class: 'glopper-avatar',
        src: gummyRealmAssets.glopper.avatar64,
        alt: 'Glopper',
        width: '96',
        height: '96',
        decoding: 'async'
      })),
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
    const copy = uxCopy.glopper;
    const human = await repository.get('humans', 'human:hayden');
    const productions = productionState.productionRuntime.productions;
    const active = [...productions].reverse().find(item => !['completed', 'cancelled'].includes(item.status))
      || productions.at(-1);
    const workOrders = await repository.all('workOrders');
    const pending = workOrders.filter(order => ['awaiting-approval', 'held'].includes(order.status));
    const results = (await repository.all('gummies')).filter(gummy => gummy.kind === 'result');
    const receipts = await repository.all('receipts');
    const configured = session.testMode || session.openaiConfigured;
    const welcome = active
      ? `Welcome back, ${human?.name || 'Human'}. You have ${productions.length} Production${productions.length === 1 ? '' : 's'}, ${pending.length} pending decision${pending.length === 1 ? '' : 's'}, and ${results.length} completed result Gumm${results.length === 1 ? 'y' : 'ies'}.`
      : `Welcome, ${human?.name || 'Human'}. Your Local Gummy Box is ready. Start a Production when you have an idea, file, or outcome you want to organize.`;
    return h('div', {}, [
      h('div', { class: 'message glopper glopper-summary', role: 'status' }, [
        h('strong', { text: 'Glopper' }),
        h('span', { text: welcome })
      ]),
      active ? h('article', { class: 'current-production-card' }, [
        h('p', { class: 'eyebrow', text: 'CURRENT PRODUCTION' }),
        h('h3', { text: active.title }),
        h('p', { text: `${active.status.replaceAll('-', ' ')} · revision ${active.revision}` }),
        h('button', { class: 'button primary', onclick: () => openProduction(active.id) }, `Continue ${active.title}`)
      ]) : null,
      h('div', { class: 'glopper-action-menu', 'aria-label': 'Glopper actions' }, [
        h('h3', { text: 'What would you like to do?' }),
        h('button', {
          class: 'button primary',
          onclick: () => {
            void togglePanel(false);
            void openPrivateChatWindow('actor:glopper');
          }
        }, 'Start or continue a private chat'),
        pending.length ? h('button', {
          class: 'button',
          onclick: () => { panelTab = 'inbox'; void renderPanel(); }
        }, `Review ${pending.length} pending decision${pending.length === 1 ? '' : 's'}`) : null,
        h('button', { class: 'button', onclick: () => void startProduction('blank') }, 'Start a new Production'),
        h('button', { class: 'button', onclick: () => openSurface('gummies') }, `See result Gummies (${results.length})`),
        h('button', {
          class: 'button',
          onclick: () => { panelTab = 'evidence'; void renderPanel(); }
        }, `Explain recent activity (${receipts.length} Receipts)`)
      ])
      ,
      h('details', { class: 'execution-disclosure' }, [
        h('summary', { text: 'What Glopper can do right now' }),
        h('p', { text: configured
          ? copy.configured
          : copy.unconfigured }),
        h('p', { class: 'meta', text: configured
          ? `Chat route: ${session.testMode ? 'hermetic test provider' : 'OpenAI'} · cloud · one-turn approval required. Make Production remains separate.`
          : 'Execution route: unavailable · no provider cost can be incurred' })
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
    return h('div', {}, results.length
      ? results.map(result => h('div', { class: 'card' }, [
          h('strong', { text: result.title }),
          h('p', { text: `${result.hash.algorithm}:${result.hash.value}` }),
          h('button', { class: 'button', onclick: () => boundedExport(result) }, 'Export this result')
        ]))
      : [h('div', { class: 'empty-state compact-empty' }, [
          h('strong', { text: 'No result Gummies yet' }),
          h('p', { text: uxCopy.glopper.emptyResults }),
          h('button', { class: 'button primary', onclick: () => void startProduction('sample') }, 'Open the sample Production')
        ])]);
  }
  const receipts = (await repository.all('receipts')).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
  return h('div', {}, receipts.map(receipt => h('div', { class: 'card' }, [h('strong', { text: receipt.action }), h('small', { text: `${receipt.outcome} · ${receipt.createdAt}` })])));
}

async function bootstrap() {
  try {
    [, uxCopy] = await Promise.all([initializeSession(), loadFirstUserExperience()]);
    await repository.open();
    await migrateLegacy(repository);
    await ensureFullProductRecords(repository);
    await ensureLivingActorRecords(repository, {
      providerConfigured: session.openaiConfigured,
      testMode: session.testMode
    });
    await recordCohortEvent(repository, 'session-started', { surface: 'canvas' });
    const recovery = await recoverLocalBox(repository);
    const mode = await repository.get('meta', 'preference:mode');
    await applyMode(mode?.value, false);
    document.querySelector('#boot')?.remove();
    const onboardingState = await repository.get('meta', 'onboarding');
    if (!onboardingState?.completed) appRoot.append(onboarding());
    else {
      productionState = { productionRuntime: await productionRepository.initialize() };
      await renderShell();
      if (recovery.status !== 'clean') announce(`Local Box recovery: ${recovery.status}. ${[...recovery.recovered, ...recovery.unresolved].join(', ')}`);
    }
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw.js').then(registration => {
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              announce('A new Gummy build is ready. Reload when you are ready; your local records remain durable.');
            }
          });
        });
      }).catch(error => {
        announce(`Offline cache unavailable: ${error.message}`);
      });
    }
    window.addEventListener('online', () => void resumeApprovedOutbox());
    window.addEventListener('offline', () => announce('Offline. Provider execution is unavailable; approvals will be revalidated before resuming.'));
    window.addEventListener('gummy:open-actor-surface', event => {
      void openActorSurface(event.detail.actorId, event.detail.productionId || null);
    });
    repository.channel?.addEventListener('message', event => {
      if (event.data?.store === 'actorPresence' && windowManager?.windows.has('actors')) {
        void refreshSurface('actors');
      }
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
