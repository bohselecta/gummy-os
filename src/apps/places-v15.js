import { applicationLaunchState } from '../core/product-registry.js';
import { loadPlaceCatalog } from '../core/place-system.js';
import { placeCoreState } from '../core/place-activation.js';
import { LocalPlaceStore } from '../places/local-place-store.js';
import { activatePlaceDescriptor } from '../places/activation-manifest.js';
import {
  approveRadioScript,
  composeOwnedOutfit,
  createHouseCommit,
  createHouseIntentPreview,
  createPrivateTableExport,
  createRadioExport,
  duplicateWorldPlan,
  nextFairParticipant,
  reviseRadioEpisode,
  slug,
  validateAndEstimateWorld
} from '../places/active-place-domains.js';
import { PHASE14_PLACES } from '../places/manifest.js';
import {
  openStandaloneHandoff,
  standaloneAdapter
} from '../places/standalone-adapters.js';

function h(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'disabled' || key === 'checked' || key === 'hidden') node[key] = value;
    else node.setAttribute(key, String(value));
  }
  for (const child of Array.isArray(children) ? children : [children]) {
    if (child != null) node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

function btn(label, onclick, className = 'button', props = {}) {
  return h('button', { type: 'button', class: className, onclick, ...props }, label);
}

function field(label, control) {
  return h('label', { class: 'field' }, [h('span', { text: label }), control]);
}

function status(text = 'Ready.') {
  return h('div', { class: 'notice place-result', role: 'status', 'aria-live': 'polite', text });
}

function downloadJson(name, value) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  h('a', { href: url, download: name }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function scopeFor(definition, context) {
  return {
    placeId: definition.id,
    ownerActorId: 'actor:hayden',
    contextType: context.type,
    contextId: context.id
  };
}

function recordCard(record, actions = []) {
  return h('article', { class: 'card active-place-record', dataset: { recordType: record.recordType, recordId: record.recordId } }, [
    h('p', { class: 'eyebrow', text: `${record.recordType} · revision ${record.revision}` }),
    h('strong', { text: record.value.title || record.value.name || record.recordId }),
    record.value.detail ? h('p', { text: record.value.detail }) : null,
    h('small', { class: 'meta', text: `Updated ${record.updatedAt}` }),
    actions.length ? h('div', { class: 'button-row' }, actions) : null
  ]);
}

function capabilityMatrix(descriptor) {
  const items = descriptor.capabilityStates || [];
  return h('details', { class: 'capability-matrix' }, [
    h('summary', { text: `Capabilities · ${items.filter(item => ['available', 'approval-required'].includes(item.availability)).length} working now` }),
    h('div', { class: 'card-grid capability-grid' }, items.map(item => h('article', { class: 'card compact capability-card', dataset: { availability: item.availability } }, [
      h('strong', { text: item.label }),
      h('span', { class: `status ${item.availability === 'available' ? '' : 'review'}`, text: item.availability.replaceAll('-', ' ') }),
      h('p', { text: item.releaseTruth }),
      h('small', { text: `${item.locality.join(', ')} · ${item.costModel}` })
    ])))
  ]);
}

async function channelsBody({ local, scope, refresh }) {
  const output = status();
  const channelName = h('input', { placeholder: 'Creator channel name' });
  const episodeTitle = h('input', { placeholder: 'Episode or drop title' });
  const episodeUrl = h('input', { type: 'url', placeholder: 'https://…' });
  const groupName = h('input', { placeholder: 'Watch group name' });
  const bulletin = h('textarea', { rows: '2', placeholder: 'Family Room note' });
  const premiere = h('input', { placeholder: 'Premiere title' });
  const records = await local.list(scope);
  const adapter = standaloneAdapter('app:gummy-channels');
  const add = async (recordType, recordId, value, operation) => {
    try {
      await local.put(scope, recordType, recordId, value, { operation });
      output.textContent = `${value.title || value.name} saved locally.`;
      await refresh();
    } catch (error) { output.textContent = `Blocked · ${error.message}`; }
  };
  return h('div', {}, [
    h('h3', { text: 'Your channel guide' }),
    h('p', { text: 'Create channels, link-first episodes, Human-defined watch groups, Family Room notes, and premiere drafts. Nothing publishes automatically.' }),
    h('div', { class: 'split active-place-form-grid' }, [
      h('section', { class: 'card' }, [h('h4', { text: 'Add a channel' }), field('Name', channelName), btn('Save channel', () => add('channel', `channel:${slug(channelName.value)}`, { name: channelName.value.trim(), favorite: false }, 'channel.create'), 'button primary')]),
      h('section', { class: 'card' }, [h('h4', { text: 'Add an episode link' }), field('Title', episodeTitle), field('HTTPS link', episodeUrl), btn('Save episode', () => add('episode', `episode:${slug(episodeTitle.value)}:${crypto.randomUUID()}`, { title: episodeTitle.value.trim(), url: episodeUrl.value.trim(), playback: 'external-link' }, 'episode.create'), 'button primary')]),
      h('section', { class: 'card' }, [h('h4', { text: 'Watch group' }), field('Name', groupName), btn('Create watch group', () => add('watch-group', `watch-group:${slug(groupName.value)}`, { name: groupName.value.trim(), rule: 'Human-defined' }, 'watch-group.create'))]),
      h('section', { class: 'card' }, [h('h4', { text: 'Family Room note' }), field('Note', bulletin), btn('Post local bulletin', () => add('bulletin', `bulletin:${crypto.randomUUID()}`, { title: 'Family Room note', detail: bulletin.value.trim(), openChat: false }, 'bulletin.create'))]),
      h('section', { class: 'card' }, [h('h4', { text: 'Premiere draft' }), field('Title', premiere), btn('Prepare draft', () => add('premiere', `premiere:${slug(premiere.value)}:${crypto.randomUUID()}`, { title: premiere.value.trim(), published: false, guidePlacementApproved: false }, 'premiere.prepare'))])
    ]),
    h('div', { class: 'button-row' }, [
      h('a', {
        class: 'button primary',
        href: adapter.route,
        text: 'Open installed Gummy Channels'
      }),
      h('a', {
        class: 'button',
        href: adapter.webFallback,
        text: 'Keep using the web guide'
      })
    ]),
    h('p', { class: 'notice compact-notice', text: 'The Android route opens only an installed compatibility build. Remote creator publication remains unavailable until its authenticated service and moderation gates are verified.' }),
    output,
    h('div', { class: 'record-list' }, records.map(record => recordCard(record)))
  ]);
}

async function wardrobeBody({ local, scope, refresh }) {
  const output = status();
  const name = h('input', { placeholder: 'Item name' });
  const slot = h('select', {}, ['top', 'bottom', 'shoes', 'layer', 'accessory'].map(value => h('option', { value, text: value })));
  const color = h('input', { placeholder: 'Color or material' });
  const items = await local.list(scope, { recordType: 'item' });
  const outfits = await local.list(scope, { recordType: 'outfit' });
  const itemValues = items.map(record => ({ id: record.recordId, ...record.value }));
  const addItem = async () => {
    try {
      const itemId = `item:${slug(name.value)}:${crypto.randomUUID()}`;
      await local.put(scope, 'item', itemId, { name: name.value.trim(), slot: slot.value, color: color.value.trim(), owned: true, availability: 'available' }, { operation: 'wardrobe.item.create' });
      await refresh();
    } catch (error) { output.textContent = `Blocked · ${error.message}`; }
  };
  const compose = async ({ replaceSlot = null } = {}) => {
    try {
      const previous = outfits.at(-1)?.value || null;
      const outfit = composeOwnedOutfit(itemValues, { previousOutfit: previous, replaceSlot });
      const recordId = `outfit:${Date.now()}`;
      await local.put(scope, 'outfit', recordId, { ...outfit, title: `Outfit ${outfits.length + 1}`, createdAt: new Date().toISOString() }, { operation: replaceSlot ? 'wardrobe.outfit.replace-slot' : 'wardrobe.outfit.compose' });
      output.textContent = `Saved ${outfit.itemIds.length}-item outfit. No checkout or purchase action exists.`;
      await refresh();
    } catch (error) { output.textContent = `Blocked · ${error.message}`; }
  };
  return h('div', {}, [
    h('h3', { text: 'Your owned wardrobe' }),
    h('p', { text: 'Manual item entry, temporary availability, one useful outfit, and selected-outfit export work locally. Camera classification remains a separate capability.' }),
    h('section', { class: 'card active-place-inline-form' }, [field('Item name', name), field('Slot', slot), field('Color / material', color), btn('Add owned item', addItem, 'button primary')]),
    h('div', { class: 'button-row' }, [btn('Dress Me', () => compose(), 'button primary'), btn('Replace unavailable slots', () => compose({ replaceSlot: itemValues.find(item => item.availability === 'unavailable')?.slot || null })), btn('Camera capture needs companion', null, 'button', { disabled: true })]),
    output,
    h('h4', { text: `Items (${items.length})` }),
    h('div', { class: 'card-grid' }, items.map(record => recordCard(record, [
      btn(record.value.availability === 'available' ? 'Mark unavailable' : 'Make available', async () => {
        await local.put(scope, 'item', record.recordId, { ...record.value, availability: record.value.availability === 'available' ? 'unavailable' : 'available' }, { expectedRevision: record.revision, operation: 'wardrobe.availability.update' });
        await refresh();
      }),
      btn('Remove', async () => { await local.remove(scope, 'item', record.recordId, { expectedRevision: record.revision, operation: 'wardrobe.item.remove' }); await refresh(); })
    ]))),
    h('h4', { text: `Saved outfits (${outfits.length})` }),
    h('div', { class: 'card-grid' }, outfits.map(record => recordCard(record, [btn('Export selected outfit', () => downloadJson(`${slug(record.value.title)}.gummy-outfit.json`, { schema: 'gummy.outfit/v1', outfit: record.value, itemRefs: record.value.itemIds }))])))
  ]);
}

async function houseBody({ local, scope, refresh }) {
  const output = status();
  const roomName = h('input', { placeholder: 'Room or zone' });
  const observation = h('textarea', { rows: '2', placeholder: 'What changed or needs attention?' });
  const intent = h('textarea', { rows: '2', placeholder: 'What are you trying to change?' });
  const intentNote = h('textarea', { rows: '2', placeholder: 'Intent note' });
  const consequenceNote = h('textarea', { rows: '2', placeholder: 'Consequence note' });
  const records = await local.list(scope);
  const previews = records.filter(record => record.recordType === 'intent-preview');
  const commits = records.filter(record => record.recordType === 'commit');
  return h('div', {}, [
    h('h3', { text: 'Scoped House memory' }),
    h('p', { text: 'This local projection does not replace the Home Graph. Address and ambient photos remain outside the Scope Wall.' }),
    h('div', { class: 'split' }, [
      h('section', { class: 'card' }, [h('h4', { text: 'Add room' }), field('Name', roomName), btn('Save room', async () => { await local.put(scope, 'room', `room:${slug(roomName.value)}`, { name: roomName.value.trim(), measured: false }, { operation: 'house.room.create' }); await refresh(); }, 'button primary')]),
      h('section', { class: 'card' }, [h('h4', { text: 'Add observation' }), field('Observation', observation), btn('Save observation', async () => { await local.put(scope, 'observation', `observation:${crypto.randomUUID()}`, { title: 'House observation', detail: observation.value.trim(), confirmed: true }, { operation: 'house.observation.create' }); await refresh(); })])
    ]),
    h('section', { class: 'card' }, [
      h('h4', { text: 'Intent Gate' }), field('Intent', intent),
      btn('Preview scoped intent', async () => {
        try {
          const selected = records.filter(record => ['room', 'observation', 'project'].includes(record.recordType)).map(record => record.recordId);
          const preview = createHouseIntentPreview({ intent: intent.value, selectedRecordIds: selected, records });
          await local.put(scope, 'intent-preview', `intent-preview:${crypto.randomUUID()}`, preview, { operation: 'house.intent.preview' });
          output.textContent = `${preview.sentRecordIds.length} records sent · ${preview.withheldRecordIds.length} withheld · no external execution.`;
          await refresh();
        } catch (error) { output.textContent = `Blocked · ${error.message}`; }
      }, 'button primary'),
      field('Intent note', intentNote), field('Consequence note', consequenceNote),
      btn('Commit both notes', async () => {
        try {
          const preview = previews.at(-1)?.value;
          const commit = createHouseCommit(preview, { intentNote: intentNote.value, consequenceNote: consequenceNote.value, approvedBy: 'actor:hayden' });
          await local.put(scope, 'commit', `commit:${crypto.randomUUID()}`, { ...commit, title: intentNote.value.trim() }, { operation: 'house.two-note.commit' });
          output.textContent = 'Two-note House commit saved locally. The full Home Graph was not rewritten.';
          await refresh();
        } catch (error) { output.textContent = `Blocked · ${error.message}`; }
      })
    ]),
    h('div', { class: 'button-row' }, [
      btn('Open latest commit in the full House workbench', async () => {
        try {
          const commit = commits.at(-1)?.value;
          if (!commit) throw new Error('Commit both House notes first.');
          output.textContent = 'Opening the full House workbench and waiting for its exact import receipt…';
          const ack = await openStandaloneHandoff('app:gummy-house', commit);
          output.textContent = ack.imported
            ? 'The full House workbench imported the Human-approved two-note commit.'
            : 'The full House workbench opened without importing the commit.';
        } catch (error) {
          output.textContent = `Handoff · ${error.message}`;
        }
      }, 'button primary')
    ]),
    output,
    h('div', { class: 'record-list' }, records.map(record => recordCard(record)))
  ]);
}

function newWorldPlan(title, intent) {
  return {
    schema: 'gummy.world-plan/v1',
    id: `world-plan:${slug(title)}:${crypto.randomUUID()}`,
    revision: 1,
    title,
    intent,
    starterId: 'starter:lantern-room',
    experience: 'sit',
    sources: [{ id: 'asset:gummy-realm', revision: 1, hash: 'c'.repeat(64), verified: true, rights: 'owner-created' }],
    typedOperations: [
      { type: 'scene.configure', parameters: { mood: 'warm' } },
      { type: 'experience.configure', parameters: { mode: 'sit' } }
    ],
    constraints: { maxCost: 4, maxMinutes: 20, arbitraryCodeAllowed: false },
    createdAt: new Date().toISOString()
  };
}

async function worldsBody({ local, scope, refresh }) {
  const output = status();
  const title = h('input', { placeholder: 'World title' });
  const intent = h('textarea', { rows: '2', placeholder: 'What should this place feel like and support?' });
  const plans = await local.list(scope, { recordType: 'world-plan' });
  return h('div', {}, [
    h('h3', { text: 'World Plans and Sit experiences' }),
    h('p', { text: 'Planning, validation, estimates, inspection, duplication, packaging, and Sit preview work locally. Only editable 3D construction requires Meshmallow.' }),
    h('section', { class: 'card' }, [field('Title', title), field('Intent', intent), btn('Create valid Sit plan', async () => {
      try {
        const plan = newWorldPlan(title.value.trim(), intent.value.trim());
        validateAndEstimateWorld(plan);
        await local.put(scope, 'world-plan', plan.id, plan, { operation: 'world.plan.create' });
        await refresh();
      } catch (error) { output.textContent = `Blocked · ${error.message}`; }
    }, 'button primary')]),
    h('div', { class: 'button-row' }, [
      btn('Open latest plan in the Worlds Studio', async () => {
        try {
          const plan = plans.at(-1)?.value;
          if (!plan) throw new Error('Create a valid Sit plan first.');
          output.textContent = 'Opening the Worlds Studio and waiting for its exact import receipt…';
          const ack = await openStandaloneHandoff('app:gummy-worlds', plan);
          output.textContent = ack.imported
            ? 'The Worlds Studio imported the bounded Sit plan. No native construction ran.'
            : 'The Worlds Studio opened without importing the plan.';
        } catch (error) {
          output.textContent = `Handoff · ${error.message}`;
        }
      }, 'button primary')
    ]),
    output,
    h('div', { class: 'card-grid' }, plans.map(record => recordCard(record, [
      btn('Validate & estimate', () => { const value = validateAndEstimateWorld(record.value); output.textContent = `Valid · ${value.validation.operationCount} operations · ${value.estimate.estimatedMinutes} minutes · $${value.estimate.costCeiling} ceiling · executing: ${value.estimate.executing}.`; }),
      btn('Sit preview', () => { output.textContent = `${record.value.title} is configured for a local Sit experience. No 3D build ran.`; }),
      btn('Duplicate', async () => { const plan = duplicateWorldPlan(record.value, { id: `world-plan:${slug(record.value.title)}-copy:${crypto.randomUUID()}` }); await local.put(scope, 'world-plan', plan.id, plan, { operation: 'world.plan.duplicate' }); await refresh(); }),
      btn('Package JSON', () => downloadJson(`${slug(record.value.title)}.world-plan.json`, record.value)),
      btn('Build needs Meshmallow', null, 'button', { disabled: true })
    ])))
  ]);
}

async function tableBody({ local, scope, refresh }) {
  const output = status();
  const title = h('input', { placeholder: 'Table title' });
  const date = h('input', { type: 'datetime-local' });
  const invitee = h('input', { placeholder: 'Invited first name' });
  const dish = h('input', { placeholder: 'Dish or contribution' });
  const gift = h('input', { placeholder: 'Pantry gift' });
  const records = await local.list(scope);
  const gatherings = records.filter(record => record.recordType === 'gathering');
  const currentId = gatherings.at(-1)?.recordId || 'gathering:unassigned';
  return h('div', {}, [
    h('h3', { text: 'Invite-only Tables' }),
    h('p', { text: 'Plan a private gathering, invitations, RSVPs, Table Rules, dishes, and Pantry gifts. No address field, feed, rating, open DM, balance, score, or debt exists.' }),
    h('div', { class: 'split' }, [
      h('section', { class: 'card' }, [h('h4', { text: 'Create Table' }), field('Title', title), field('Date', date), btn('Create private Table', async () => { const id = `gathering:${slug(title.value)}:${crypto.randomUUID()}`; await local.put(scope, 'gathering', id, { title: title.value.trim(), date: date.value, inviteOnly: true, exactAddress: null, cancelled: false }, { operation: 'table.create' }); await local.put(scope, 'rules-ack', `rules-ack:host:${id}`, { title: 'Host acknowledged Table Rules', gatheringId: id, actorId: 'actor:hayden', acknowledged: true }, { operation: 'table.rules.acknowledge' }); await refresh(); }, 'button primary')]),
      h('section', { class: 'card' }, [h('h4', { text: 'Invite' }), field('First name', invitee), btn('Create scoped invitation', async () => { await local.put(scope, 'invite', `invite:${crypto.randomUUID()}`, { title: `Invitation for ${invitee.value.trim()}`, gatheringId: currentId, firstName: invitee.value.trim(), status: 'invited', discoverable: false }, { operation: 'table.invite.create' }); await refresh(); })]),
      h('section', { class: 'card' }, [h('h4', { text: 'Dish board' }), field('Dish', dish), btn('Add dish', async () => { await local.put(scope, 'dish', `dish:${crypto.randomUUID()}`, { title: dish.value.trim(), gatheringId: currentId, status: 'offered' }, { operation: 'table.dish.create' }); await refresh(); })]),
      h('section', { class: 'card' }, [h('h4', { text: 'Pantry' }), field('Gift', gift), btn('Offer gift', async () => { await local.put(scope, 'pantry-gift', `pantry-gift:${crypto.randomUUID()}`, { title: gift.value.trim(), gatheringId: currentId, gift: true, balance: null, debt: null }, { operation: 'table.pantry.gift' }); await refresh(); })])
    ]),
    h('div', { class: 'button-row' }, [btn('Export private Table', () => downloadJson('gummy-table.json', createPrivateTableExport(records)), 'button primary'), btn('Exact address requires verified service', null, 'button', { disabled: true })]),
    output,
    h('div', { class: 'record-list' }, records.map(record => recordCard(record, record.recordType === 'invite' ? [btn('RSVP yes', async () => { await local.put(scope, 'invite', record.recordId, { ...record.value, status: 'yes' }, { expectedRevision: record.revision, operation: 'table.rsvp.update' }); await refresh(); })] : [])))
  ]);
}

async function sha256(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function radioBody({ local, scope, refresh }) {
  const output = status();
  const title = h('input', { placeholder: 'Episode title' });
  const sourceA = h('textarea', { rows: '4', placeholder: 'One selected Host A source per line (at least two)' });
  const sourceB = h('textarea', { rows: '4', placeholder: 'One selected Host B source per line (at least two)' });
  const script = h('textarea', { rows: '6', placeholder: 'Revisioned script' });
  const episodes = await local.list(scope, { recordType: 'episode' });
  const current = episodes.at(-1);
  if (current?.value?.script?.text) script.value = current.value.script.text;
  const createEpisode = async () => {
    try {
      const selected = [
        ...sourceA.value.split('\n').map(text => ({ ownerRole: 'A', content: text.trim() })),
        ...sourceB.value.split('\n').map(text => ({ ownerRole: 'B', content: text.trim() }))
      ].filter(source => source.content);
      if (selected.filter(source => source.ownerRole === 'A').length < 2 || selected.filter(source => source.ownerRole === 'B').length < 2) {
        throw new Error('Select at least two source lines for Host A and two for Host B.');
      }
      const sourcePackage = {
        schema: 'gummy.source-package/v1',
        id: `source-package:radio:${crypto.randomUUID()}`,
        sources: await Promise.all(selected.map(async (source, index) => ({
          id: `gummy:radio-source:${source.ownerRole.toLowerCase()}:${crypto.randomUUID()}`,
          revision: 1,
          ownerRole: source.ownerRole,
          content: source.content,
          hash: await sha256(source.content),
          included: true,
          order: index
        }))),
        stageNames: { A: 'Host A', B: 'Host B' },
        includedFields: ['selected-source-text'],
        explicitExclusions: ['ambient-profile', 'credentials', 'unselected-conversation'],
        purpose: 'Create a private Radio episode',
        targetPlaceId: 'app:gummy-radio',
        privacy: 'private',
        audience: 'Named participants',
        quotePermission: false,
        voiceLikenessPermission: false,
        rights: { ownerApproved: true },
        permissions: { quotePermission: false, voiceLikenessPermission: false },
        provenance: { source: 'Human-pasted selected text', importedAt: new Date().toISOString() },
        retention: 'local-until-reset',
        costCeiling: 0,
        limitations: ['Browser speech is demonstration-only.'],
        humanApproval: { approved: true, approvedBy: 'actor:hayden', approvedAt: new Date().toISOString() },
        createdAt: new Date().toISOString()
      };
      const episode = { id: `radio-episode:${slug(title.value)}:${crypto.randomUUID()}`, title: title.value.trim(), sourcePackage, script: { revision: 0, text: '', approved: false }, voiceApproval: { approved: false }, exportApproval: { approved: false }, publishApproval: { approved: false } };
      await local.put(scope, 'episode', episode.id, episode, { operation: 'radio.episode.create' });
      await refresh();
    } catch (error) { output.textContent = `Blocked · ${error.message}`; }
  };
  const saveRevision = async () => {
    try {
      if (!current) throw new Error('Create an episode first.');
      const episode = reviseRadioEpisode(current.value, script.value);
      await local.put(scope, 'episode', current.recordId, episode, { expectedRevision: current.revision, operation: 'radio.script.revise' });
      await refresh();
    } catch (error) { output.textContent = `Blocked · ${error.message}`; }
  };
  const approve = async () => {
    try {
      if (!current) throw new Error('Create an episode first.');
      const episode = approveRadioScript(current.value, 'actor:hayden');
      await local.put(scope, 'episode', current.recordId, episode, { expectedRevision: current.revision, operation: 'radio.script.approve' });
      await refresh();
    } catch (error) { output.textContent = `Blocked · ${error.message}`; }
  };
  return h('div', {}, [
    h('h3', { text: 'Private Radio Studio' }),
    h('p', { text: 'Import exact sources, revise and approve scripts, preview browser speech, and export a private episode package. Browser speech is not final audio and publishing does not exist.' }),
    h('section', { class: 'card' }, [
      field('Episode title', title),
      field('Host A selected sources', sourceA),
      field('Host B selected sources', sourceB),
      btn('Create private episode', createEpisode, 'button primary')
    ]),
    current ? h('section', { class: 'card' }, [h('h4', { text: current.value.title }), field(`Script revision ${current.value.script.revision}`, script), h('div', { class: 'button-row' }, [btn('Save new revision', saveRevision), btn('Approve exact revision', approve, 'button primary'), btn('Preview browser speech', () => {
      if (!current.value.script.approved) return void (output.textContent = 'Blocked · approve the exact script revision first.');
      if (!('speechSynthesis' in window)) return void (output.textContent = 'Browser speech is unavailable on this device.');
      speechSynthesis.cancel();
      speechSynthesis.speak(new SpeechSynthesisUtterance(current.value.script.text));
      output.textContent = 'Browser speech demonstration started. It is not final audio.';
    }), btn('Export private episode', () => {
      try { downloadJson(`${slug(current.value.title)}.gummy-radio.json`, createRadioExport(current.value)); }
      catch (error) { output.textContent = `Blocked · ${error.message}`; }
    }), btn('Final voice service not connected', null, 'button', { disabled: true })])]) : null,
    current ? h('div', { class: 'button-row' }, [
      btn('Open scoped sources in AfterCast', async () => {
        try {
          output.textContent = 'Opening AfterCast and waiting for its exact source-import receipt…';
          const ack = await openStandaloneHandoff('app:gummy-radio', current.value.sourcePackage);
          output.textContent = ack.imported
            ? 'AfterCast imported the scoped A/B sources. Review source boundaries there before shaping the episode.'
            : 'AfterCast opened without importing the source package.';
        } catch (error) {
          output.textContent = `Handoff · ${error.message}`;
        }
      }, 'button primary')
    ]) : null,
    output,
    h('div', { class: 'record-list' }, episodes.map(record => recordCard(record)))
  ]);
}

async function roomsBody({ local, scope, refresh }) {
  const output = status();
  const roomTitle = h('input', { placeholder: 'Room title' });
  const participant = h('input', { placeholder: 'Participant name' });
  const thread = h('input', { placeholder: 'Thread title' });
  const message = h('textarea', { rows: '2', placeholder: 'Local room message' });
  const records = await local.list(scope);
  const rooms = records.filter(record => record.recordType === 'room');
  const currentRoom = rooms.at(-1);
  const roomId = currentRoom?.recordId || 'room:unassigned';
  const participants = records.filter(record => record.recordType === 'participant' && record.value.roomId === roomId).map(record => ({ id: record.recordId, ...record.value }));
  const queueState = records.find(record => record.recordType === 'queue' && record.recordId === `queue:${roomId}`);
  return h('div', {}, [
    h('h3', { text: 'Private local Rooms' }),
    h('p', { text: 'Create local rooms, participants, fair turns, isolated threads, and messages. This does not claim remote verified identity or live media.' }),
    h('div', { class: 'split' }, [
      h('section', { class: 'card' }, [field('Room title', roomTitle), btn('Create local room', async () => { const id = `room:${slug(roomTitle.value)}:${crypto.randomUUID()}`; await local.put(scope, 'room', id, { title: roomTitle.value.trim(), transport: 'BroadcastChannel/local', remote: false }, { operation: 'room.local.create' }); await local.put(scope, 'participant', `participant:hayden:${id}`, { name: 'Hayden', roomId: id, identity: 'local-unverified' }, { operation: 'room.participant.join' }); await refresh(); }, 'button primary')]),
      h('section', { class: 'card' }, [field('Participant', participant), btn('Add local participant', async () => { await local.put(scope, 'participant', `participant:${slug(participant.value)}:${roomId}`, { name: participant.value.trim(), roomId, identity: 'local-unverified' }, { operation: 'room.participant.join' }); await refresh(); })]),
      h('section', { class: 'card' }, [field('Thread', thread), btn('Create isolated thread', async () => { await local.put(scope, 'thread', `thread:${slug(thread.value)}:${crypto.randomUUID()}`, { title: thread.value.trim(), roomId }, { operation: 'room.thread.create' }); await refresh(); })]),
      h('section', { class: 'card' }, [field('Message', message), btn('Save room message', async () => { await local.put(scope, 'message', `message:${crypto.randomUUID()}`, { title: 'Room message', detail: message.value.trim(), roomId, threadId: null }, { operation: 'room.message.create' }); if ('BroadcastChannel' in window) { const channel = new BroadcastChannel(`gummy-room:${roomId}`); channel.postMessage({ type: 'message', roomId }); channel.close(); } await refresh(); })])
    ]),
    h('div', { class: 'button-row' }, [btn('Advance fair queue', async () => {
      try {
        const next = nextFairParticipant(participants, queueState?.value?.currentParticipantId || null);
        await local.put(scope, 'queue', `queue:${roomId}`, { title: 'Fair queue', roomId, currentParticipantId: next.id, currentName: next.name }, { expectedRevision: queueState?.revision ?? null, operation: 'room.queue.advance' });
        output.textContent = `Next turn: ${next.name}.`;
        await refresh();
      } catch (error) { output.textContent = `Blocked · ${error.message}`; }
    }, 'button primary'), btn('Remote room service not connected', null, 'button', { disabled: true })]),
    output,
    h('div', { class: 'record-list' }, records.map(record => recordCard(record)))
  ]);
}

const bodyBuilders = {
  'app:gummy-channels': channelsBody,
  'app:gummy-wardrobe': wardrobeBody,
  'app:gummy-house': houseBody,
  'app:gummy-worlds': worldsBody,
  'app:gummy-table': tableBody,
  'app:gummy-radio': radioBody,
  'app:gummy-rooms': roomsBody
};

export async function createPlaceSurface({ definition, descriptor, context, repository, openPlaceWindow, togglePlacePin }) {
  const root = h('div', { class: 'place-surface', dataset: { placeId: definition.id } });
  const local = new LocalPlaceStore(repository);
  const activeDescriptor = activatePlaceDescriptor(descriptor);
  const state = placeCoreState(activeDescriptor);
  const pins = (await repository.get('meta', 'place-pins:actor:hayden'))?.placeIds || [];
  const contexts = [['personal', 'actor:hayden'], ['production', 'production:night-gummy-launch'], ['session', definition.id === 'app:gummy-rooms' ? 'session:local-room' : 'session:sunday-supper']];
  const render = async () => {
    root.replaceChildren();
    const scope = scopeFor(definition, context);
    const body = await bodyBuilders[definition.id]({ local, scope, refresh: render });
    root.append(
      h('header', { class: 'place-hero' }, [
        h('div', { class: 'place-mark', 'aria-hidden': 'true', text: definition.icon }),
        h('div', {}, [h('p', { class: 'eyebrow', text: `${definition.address} · ${context.type} context` }), h('h2', { text: definition.name }), h('p', { class: 'lede', text: definition.doctrine })]),
        h('span', { class: `status ${state.available ? '' : 'review'}`, text: state.label })
      ]),
      h('p', { class: 'notice compact-notice', text: activeDescriptor.releaseTruth }),
      h('div', { class: 'place-state-strip' }, [
        h('strong', { text: `${state.workingCapabilities} capabilities working now` }),
        h('span', { text: `${state.advancedSetupCount || 0} advanced capabilities need setup` }),
        h('span', { text: `Data: ${activeDescriptor.authoritativeDataLocation}` })
      ]),
      h('nav', { class: 'context-switcher', 'aria-label': `${definition.name} context windows` }, [
        h('span', { text: 'Open context:' }),
        ...contexts.map(([type, id]) => btn(type, () => openPlaceWindow(definition.id, { type, id }), 'button', { 'aria-current': String(context.type === type && context.id === id) }))
      ]),
      body,
      capabilityMatrix(activeDescriptor),
      h('footer', { class: 'place-boundary' }, [
        h('strong', { text: 'Boundary' }),
        h('span', { text: activeDescriptor.privacyBoundary }),
        h('span', { text: activeDescriptor.executionBoundary }),
        btn('Export this Place context', async () => downloadJson(`${slug(definition.name)}-${context.type}.gummy-place.json`, await local.exportPackage(scope))),
        btn(pins.includes(definition.id) ? 'Remove from Gummy Bar' : 'Pin to Gummy Bar', () => togglePlacePin(definition.id))
      ])
    );
  };
  await render();
  return root;
}

export async function createPlacesDirectory({ repository, openPlaceWindow, togglePlacePin }) {
  const { productMap, applicationRegistry, placeRegistry } = await loadPlaceCatalog();
  const pins = (await repository.get('meta', 'place-pins:actor:hayden'))?.placeIds || [];
  const cards = h('div', { class: 'card-grid place-grid', dataset: { testid: 'phase15-places' } });
  for (const definition of PHASE14_PLACES) {
    const original = placeRegistry.places.find(place => place.id === definition.id);
    if (!original) continue;
    const descriptor = activatePlaceDescriptor(original);
    const state = placeCoreState(descriptor);
    const recent = (await new LocalPlaceStore(repository).list(scopeFor(definition, definition.context))).at(-1);
    cards.append(h('article', { class: 'card place-card', dataset: { placeId: definition.id, coreAvailability: state.state } }, [
      h('div', { class: 'place-card-heading' }, [
        h('span', { class: 'place-card-mark', 'aria-hidden': 'true', text: definition.icon }),
        h('div', {}, [h('p', { class: 'eyebrow', text: definition.address }), h('h3', { text: definition.name })]),
        h('span', { class: `status ${state.available ? '' : 'review'}`, text: state.label })
      ]),
      h('p', { text: definition.doctrine }),
      h('p', { class: 'meta', text: `${state.workingCapabilities} working now · ${state.advancedSetupCount || 0} need setup` }),
      recent ? h('p', { class: 'notice compact-notice', text: `Recent: ${recent.value.title || recent.value.name || recent.recordId}` }) : h('p', { class: 'notice compact-notice', text: 'No records yet. Open this Place to create the first one.' }),
      h('div', { class: 'button-row' }, [btn(`Open ${definition.name}`, () => openPlaceWindow(definition.id, definition.context), 'button primary'), btn(pins.includes(definition.id) ? 'Unpin' : 'Pin', () => togglePlacePin(definition.id))])
    ]));
  }
  const migrated = h('div', { class: 'card-grid application-grid', dataset: { testid: 'first-party-applications' } });
  for (const app of applicationRegistry.applications) {
    const launch = applicationLaunchState(app);
    migrated.append(h('article', { class: 'card application-card', dataset: { applicationId: app.id } }, [
      h('p', { class: 'eyebrow', text: `${app.locality.join(' · ')} · ${app.connectionStatus.replaceAll('-', ' ')}` }),
      h('h3', { text: app.name }),
      h('p', { text: app.productPurpose }),
      h('p', { class: 'meta', text: app.releaseStatus }),
      h('p', { class: 'meta', text: `${app.capabilities.length} declared capabilities · ${app.producedArtifacts.length} artifact types` }),
      launch.available
        ? h('a', { class: 'button primary', href: launch.route, target: '_blank', rel: 'noopener noreferrer', text: launch.label })
        : h('p', { class: 'notice compact-notice', text: launch.reason })
    ]));
  }
  const pillars = h('div', { class: 'product-pillar-list' });
  for (const pillar of productMap.pillars) pillars.append(h('article', { class: 'record-row', dataset: { pillarId: pillar.id }, text: pillar.name }));
  return h('div', {}, [
    h('p', { class: 'eyebrow', text: 'Gummy OS Places · Phase 15 activation' }),
    h('h2', { text: 'Places' }),
    h('p', { class: 'lede', text: 'Each Place has a durable useful local core. Phone, provider, service, publication, address, voice, and native 3D capabilities remain separately disclosed.' }),
    cards,
    h('section', { class: 'product-map-section' }, [h('h3', { text: 'Preserved products and protocols' }), migrated]),
    h('section', { class: 'product-map-section' }, [h('h3', { text: productMap.controllingRule }), pillars])
  ]);
}
