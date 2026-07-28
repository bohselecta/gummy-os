import { applicationLaunchState } from '../core/product-registry.js';
import { createSourcePackage, loadPlaceCatalog, placeLaunchState } from '../core/place-system.js';
import {
  PLACE_FIXTURES,
  WORLD_TOOLS,
  buildCrossPlaceJourney,
  chooseWardrobeOutfit,
  commitHouseIntent,
  createRadioEpisode,
  estimateWorld,
  prepareRadioExport,
  previewHouseIntent,
  reviseRadioScript,
  stageChannelPremiere,
  validateWorldPlan
} from '../places/place-doctrines.js';
import { PHASE14_PLACES } from '../places/manifest.js';

function h(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'disabled') node.disabled = value;
    else node.setAttribute(key, value);
  }
  for (const child of Array.isArray(children) ? children : [children]) {
    if (child != null) node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

function result() {
  return h('div', { class: 'notice place-result', role: 'status', 'aria-live': 'polite', text: 'Ready.' });
}

function pack(targetPlaceId, id = targetPlaceId.slice(4)) {
  return createSourcePackage({
    id: `source-package:${id}`,
    sources: [{ id: `gummy:${id}`, revision: 1, hash: 'a'.repeat(64) }],
    includedFields: ['title', 'approved-summary'],
    explicitExclusions: ['private-notes', 'credentials', 'ambient-profile'],
    purpose: `Bounded ${id} preview`,
    targetPlaceId,
    privacy: 'private',
    audience: 'Hayden',
    quotePermission: false,
    voiceLikenessPermission: false,
    rights: { ownerApproved: true },
    provenance: { source: 'local Phase 14 fixture', revision: 1 },
    retention: 'preview-only',
    costCeiling: 0,
    limitations: ['Preview only'],
    humanApproval: { approved: false, approvedBy: null, approvedAt: null }
  });
}

function channels() {
  const output = result();
  const guide = h('div', { class: 'place-guide', role: 'list', 'aria-label': 'Channel guide' });
  for (const [time, title, detail] of PLACE_FIXTURES.channels.guide) {
    guide.append(h('article', { class: 'record-row', role: 'listitem' }, [
      h('strong', { text: time }),
      h('span', { text: `${title} · ${detail}` })
    ]));
  }
  return h('div', {}, [
    h('h3', { text: 'Tonight on your channels' }),
    h('p', { text: 'The Family Room is a bounded bulletin board: no infinite feed, ambient identity binding, or automatic publication.' }),
    guide,
    h('button', {
      class: 'button primary',
      onclick: () => {
        const value = stageChannelPremiere({ sourcePackage: pack('app:gummy-channels', 'creator-premiere') });
        output.textContent = `Preview ready · ${value.guidePlacement} · published: ${value.published}. Separate approval and a connected service are still required.`;
      }
    }, 'Preview guide placement'),
    output
  ]);
}

function wardrobe() {
  const output = result();
  return h('div', {}, [
    h('h3', { text: 'Choose one outfit' }),
    h('p', { text: 'Only owned items. Mobile capture requires a companion that is not connected. There is no checkout.' }),
    h('p', { class: 'notice', text: PLACE_FIXTURES.wardrobe.items.map(item => `${item.name}: ${item.state}`).join(' · ') }),
    h('button', {
      class: 'button primary',
      onclick: () => {
        const value = chooseWardrobeOutfit(PLACE_FIXTURES.wardrobe.items, ['item:gold-jacket', 'item:canvas-trousers']);
        output.textContent = `Outfit: ${value.outfit.map(item => item.name).join(', ')}. Canvas trousers are temporarily unavailable; preference unchanged.`;
      }
    }, 'Make one outfit'),
    h('button', { class: 'button', disabled: true }, 'Mobile companion required'),
    output
  ]);
}

function house() {
  const output = result();
  const intent = h('textarea', { rows: '2', 'aria-label': 'House intent note' });
  const consequence = h('textarea', { rows: '2', 'aria-label': 'House consequence note' });
  const graph = [...PLACE_FIXTURES.house.scopedNodes, ...PLACE_FIXTURES.house.withheldNodes].map(id => ({ id }));
  let preview;
  return h('div', {}, [
    h('h3', { text: PLACE_FIXTURES.house.project }),
    h('p', { text: `Scope Wall selected: ${PLACE_FIXTURES.house.scopedNodes.join(', ')}. Withheld: ${PLACE_FIXTURES.house.withheldNodes.join(', ')}.` }),
    h('button', {
      class: 'button primary',
      onclick: () => {
        preview = previewHouseIntent({ intent: 'Prepare a listening-corner plan', selectedNodes: PLACE_FIXTURES.house.scopedNodes, homeGraph: graph });
        output.textContent = `Intent preview ready · ${preview.sentFields.length} sent · ${preview.withheldFields.length} withheld · no external execution.`;
      }
    }, 'Open Intent Gate'),
    h('label', { class: 'field' }, [h('span', { text: 'Intent note' }), intent]),
    h('label', { class: 'field' }, [h('span', { text: 'Consequence note' }), consequence]),
    h('button', {
      class: 'button',
      onclick: () => {
        try {
          const value = commitHouseIntent(preview, { intentNote: intent.value, consequenceNote: consequence.value, approvedBy: 'actor:hayden' });
          output.textContent = `Local commit recorded · external execution: ${value.externalExecution}.`;
        } catch (error) {
          output.textContent = `Blocked · ${error.message}`;
        }
      }
    }, 'Commit both notes'),
    output
  ]);
}

function worldPlan() {
  return {
    schema: 'gummy.world-plan/v1',
    id: 'world-plan:listening-room',
    revision: 1,
    title: 'Listening room',
    intent: 'A quiet sit-first premiere room',
    starterId: PLACE_FIXTURES.worlds.starter,
    experience: 'sit',
    sources: [{ id: 'asset:poster', revision: 1, hash: 'b'.repeat(64), verified: true, rights: 'owner-created' }],
    typedOperations: [
      { type: 'scene.configure', parameters: { mood: 'warm' } },
      { type: 'asset.place', parameters: { role: 'poster' } },
      { type: 'experience.configure', parameters: { mode: 'sit' } }
    ],
    constraints: { maxCost: 4, maxMinutes: 20, arbitraryCodeAllowed: false },
    createdAt: '2026-07-28T12:00:00.000Z'
  };
}

function worlds() {
  const output = result();
  const plan = worldPlan();
  return h('div', {}, [
    h('h3', { text: plan.title }),
    h('p', { text: 'No code, shell, filesystem, Python, or Blender scripting. Sit is accepted; Walk remains gated.' }),
    h('ul', { class: 'tool-chip-list', 'aria-label': 'The nine Worlds tools' }, WORLD_TOOLS.map(tool => h('li', { text: tool }))),
    h('button', {
      class: 'button primary',
      onclick: () => {
        const valid = validateWorldPlan(plan);
        const estimate = estimateWorld(plan);
        output.textContent = `Valid · ${valid.operationCount} typed operations · estimate ${estimate.estimatedMinutes} minutes · cost ceiling $${estimate.costCeiling} · executing: ${estimate.executing}.`;
      }
    }, 'Validate and estimate'),
    h('button', { class: 'button', disabled: true }, 'Meshmallow runtime required'),
    output
  ]);
}

function table() {
  const output = result();
  return h('div', {}, [
    h('h3', { text: PLACE_FIXTURES.table.gathering }),
    h('p', { text: `Invited: ${PLACE_FIXTURES.table.invitees.join(', ')}. Pantry gift: ${PLACE_FIXTURES.table.pantryGift}.` }),
    h('button', {
      class: 'button primary',
      onclick: () => {
        output.textContent = 'Gathering preview ready for invited participants. The exact address remains withheld; live multiuser service is not connected.';
      }
    }, 'Preview gathering'),
    h('button', { class: 'button', disabled: true }, 'Address grant requires service'),
    output
  ]);
}

function radio() {
  const output = result();
  const script = h('textarea', { rows: '5', 'aria-label': 'Radio script', text: 'Welcome to the Night Gummy premiere.' });
  let episode = createRadioEpisode({ id: 'radio-episode:night-gummy', title: PLACE_FIXTURES.radio.episode, sourcePackage: pack('app:gummy-radio') });
  return h('div', {}, [
    h('h3', { text: episode.title }),
    h('label', { class: 'field' }, [h('span', { text: 'Revisioned script' }), script]),
    h('button', {
      class: 'button primary',
      onclick: () => {
        episode = reviseRadioScript(episode, script.value);
        episode = { ...structuredClone(episode), script: { ...episode.script, approved: true } };
        const demo = prepareRadioExport(episode, { visibility: 'participants', browserSpeech: true });
        output.textContent = `Approved revision ${demo.scriptRevision} · browser speech demonstration · final audio: ${demo.finalAudio} · published: ${demo.published}.`;
      }
    }, 'Approve script and prepare demo'),
    h('button', { class: 'button', disabled: true }, 'Final voice service not connected'),
    output
  ]);
}

const bodies = { 'app:gummy-channels': channels, 'app:gummy-wardrobe': wardrobe, 'app:gummy-house': house, 'app:gummy-worlds': worlds, 'app:gummy-table': table, 'app:gummy-radio': radio };

export async function createPlaceSurface({ definition, descriptor, context, repository, openPlaceWindow, togglePlacePin }) {
  const launch = placeLaunchState(descriptor);
  const pins = (await repository.get('meta', 'place-pins:actor:hayden'))?.placeIds || [];
  const contexts = [['personal', 'actor:hayden'], ['production', 'production:night-gummy-launch'], ['session', 'session:sunday-supper']];
  return h('div', { class: 'place-surface', dataset: { placeId: definition.id } }, [
    h('header', { class: 'place-hero' }, [
      h('div', { class: 'place-mark', 'aria-hidden': 'true', text: definition.icon }),
      h('div', {}, [h('p', { class: 'eyebrow', text: `${definition.address} · ${context.type} context` }), h('h2', { text: definition.name }), h('p', { class: 'lede', text: definition.doctrine })]),
      h('span', { class: `status ${launch.available ? '' : 'review'}`, text: launch.label })
    ]),
    h('p', { class: 'notice compact-notice', text: descriptor.releaseTruth }),
    h('nav', { class: 'context-switcher', 'aria-label': `${definition.name} context windows` }, [
      h('span', { text: 'Open context:' }),
      ...contexts.map(([type, id]) => h('button', { class: 'button', 'aria-current': String(context.type === type && context.id === id), onclick: () => openPlaceWindow(definition.id, { type, id }) }, type))
    ]),
    bodies[definition.id](),
    h('footer', { class: 'place-boundary' }, [
      h('strong', { text: 'Boundary' }),
      h('span', { text: descriptor.privacyBoundary }),
      h('span', { text: descriptor.executionBoundary }),
      h('button', { class: 'button', onclick: () => togglePlacePin(definition.id) }, pins.includes(definition.id) ? 'Remove from Gummy Bar' : 'Pin to Gummy Bar')
    ])
  ]);
}

export async function createPlacesDirectory({ repository, openPlaceWindow, togglePlacePin }) {
  const { productMap, applicationRegistry, placeRegistry } = await loadPlaceCatalog();
  const pins = (await repository.get('meta', 'place-pins:actor:hayden'))?.placeIds || [];
  const places = h('div', { class: 'card-grid place-grid', dataset: { testid: 'phase14-places' } });
  for (const definition of PHASE14_PLACES) {
    const descriptor = placeRegistry.places.find(place => place.id === definition.id);
    places.append(h('article', { class: 'card place-card', dataset: { placeId: definition.id } }, [
      h('div', { class: 'place-card-heading' }, [
        h('span', { class: 'place-card-mark', 'aria-hidden': 'true', text: definition.icon }),
        h('div', {}, [h('p', { class: 'eyebrow', text: definition.address }), h('h3', { text: definition.name })]),
        h('span', { class: 'status review', text: placeLaunchState(descriptor).label })
      ]),
      h('div', { class: 'button-row' }, [
        h('button', { class: 'button primary', onclick: () => openPlaceWindow(definition.id, definition.context) }, `Open ${definition.name}`),
        h('button', { class: 'button', onclick: () => togglePlacePin(definition.id) }, pins.includes(definition.id) ? 'Unpin' : 'Pin')
      ])
    ]));
  }
  const journeys = h('div', { class: 'card-grid journey-grid', dataset: { testid: 'cross-place-journeys' } });
  for (const [kind, title] of [['creator-premiere', 'Creator premiere'], ['home-project', 'Home project'], ['real-world-gathering', 'Real-world gathering'], ['world-premiere', 'World premiere']]) {
    const note = h('small', { text: 'Ready' });
    journeys.append(h('article', { class: 'card journey-card', dataset: { journey: kind } }, [
      h('h4', { text: title }),
      h('button', { class: 'button', onclick: () => {
        const journey = buildCrossPlaceJourney(kind);
        note.textContent = `${journey.preview.sentFields.length} fields sent · ${journey.preview.withheldFields.length} withheld · state ${journey.preview.executionState}`;
      } }, 'Prepare preview'),
      note
    ]));
  }
  const migrated = h('div', { class: 'card-grid application-grid', dataset: { testid: 'first-party-applications' } });
  for (const app of applicationRegistry.applications) {
    const launch = applicationLaunchState(app);
    migrated.append(h('article', { class: 'card application-card', dataset: { applicationId: app.id } }, [
      h('h3', { text: app.name }),
      launch.available
        ? h('a', { class: 'button primary', href: launch.route, target: '_blank', rel: 'noopener noreferrer', text: launch.label })
        : h('p', { class: 'notice compact-notice', text: launch.reason })
    ]));
  }
  const pillars = h('div', { class: 'product-pillar-list' });
  for (const pillar of productMap.pillars) {
    pillars.append(h('article', { class: 'record-row', dataset: { pillarId: pillar.id }, text: pillar.name }));
  }
  return h('div', {}, [
    h('p', { class: 'eyebrow', text: 'Gummy OS Places' }),
    h('h2', { text: 'Places' }),
    h('p', { class: 'lede', text: 'Private places, studios, and connected places keep their own data authority and execution boundaries. Only Places you pin appear in the Gummy Bar.' }),
    places,
    h('section', { class: 'product-map-section' }, [h('h3', { text: 'Linked packages, separate authority' }), journeys]),
    h('section', { class: 'product-map-section' }, [h('h3', { text: 'Preserved products and protocols' }), migrated]),
    h('section', { class: 'product-map-section' }, [
      h('h3', { text: productMap.controllingRule }),
      h('p', { text: 'Social computing may ship after the personal proof.' }),
      pillars
    ])
  ]);
}
