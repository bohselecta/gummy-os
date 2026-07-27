import { button, clear, el, sectionHeading } from '../core/dom.js';
import { utilityTile } from '../brand/gummy-utility-tiles.js';
import {
  applyDragIntent,
  createDragIntent,
  promoteSettingToActorDefault,
  saveProductionActorConfiguration
} from '../core/production-runtime.js';

export function createActorSurface({ store, actorId, productionId = null, toast, refreshWindow }) {
  const root = el('div', { class: 'actor-surface', dataset: { actorId, productionId: productionId || 'standalone' } });

  const persistRuntime = runtime => store.setState(current => ({ ...current, productionRuntime: runtime }));

  const render = () => {
    clear(root);
    const runtime = store.getState().productionRuntime;
    const actor = runtime.actors.find(item => item.id === actorId);
    const descriptor = runtime.actorAppDescriptors.find(item => item.actorId === actorId);
    const production = runtime.productions.find(item => item.id === productionId);
    const config = runtime.configurations.find(item => item.productionId === productionId && item.actorId === actorId);
    if (!actor) {
      root.append(el('div', { class: 'empty-state', text: 'Actor not found.' }));
      return;
    }

    root.append(sectionHeading(actor.name, `${actor.address} · ${actor.kind} Actor · this window is a view/controller`, [
      el('span', { class: 'scope-chip', text: production ? `Production: ${production.title}` : 'Scope: Standalone' })
    ]));

    root.append(el('div', { class: 'actor-identity-grid' }, [
      fact('Actor identity', actor.id),
      fact('Surface identity', descriptor?.id || 'personal Actor surface'),
      fact('Executor', descriptor?.supportedAgentFamilies?.[0] || 'No Agent assigned'),
      fact('Authority', 'Human → Master Control → Mold → Lease → Grant'),
      fact('Locality', actor.locality),
      fact('Cost', `${actor.cost?.estimate || 0} ${actor.cost?.model || 'none'}`),
      fact('Privacy', actor.privacy),
      fact('Retention', actor.retention)
    ]));
    if (descriptor) {
      const operation = operationForActor(actor.id);
      root.append(el('aside', { class: 'actor-operation-mnemonic', dataset: { utilityId: operation } }, [
        tileImage(operation, 64),
        el('div', {}, [
          el('strong', { text: `${utilityTile(operation).label} operation` }),
          el('small', { text: `${actor.name} retains its own service Actor identity. This utility tile is not its application mark.` })
        ])
      ]));
    }

    if (!production) {
      renderStandalone(runtime, actor);
      return;
    }
    if (!config) {
      root.append(el('div', { class: 'boundary-callout' }, [
        el('strong', { text: 'Personal/context Actor' }),
        el('p', { text: 'This participant contributes approved context or Human authority. It does not require an execution Agent.' })
      ]));
      return;
    }

    root.append(el('div', { class: 'scope-banner' }, [
      el('strong', { text: `${production.title} configuration · revision ${config.revision}` }),
      el('span', { text: `${config.readiness} · ${config.hash || 'not saved'}` })
    ]));
    const settings = {};
    const fields = el('div', { class: 'form-grid actor-config-fields' });
    for (const [key, currentValue] of Object.entries(config.settings)) {
      let input;
      if (typeof currentValue === 'boolean') {
        input = el('select', { dataset: { setting: key } }, [
          el('option', { value: 'false', text: 'No', selected: !currentValue }),
          el('option', { value: 'true', text: 'Yes', selected: currentValue })
        ]);
      } else if (typeof currentValue === 'number') {
        input = el('input', { type: 'number', value: String(currentValue), dataset: { setting: key } });
      } else {
        input = el('input', { value: String(currentValue), dataset: { setting: key } });
      }
      settings[key] = { input, type: typeof currentValue };
      fields.append(el('label', { class: 'field' }, [
        el('span', { text: humanize(key) }),
        input
      ]));
    }
    root.append(fields);

    root.append(el('div', { class: 'contract-grid' }, [
      contract('Published capability', descriptor.capabilityIds),
      contract('Accepted inputs', descriptor.acceptedInputTypes),
      contract('Output contract', descriptor.outputTypes),
      contract('Active Mold', [config.moldId]),
      contract('Upstream Actors', config.upstreamActorIds),
      contract('Native capability', ['Unavailable — explicit Bridge required'])
    ]));

    const save = button(`Save for ${production.title}`, 'primary-button', async () => {
      const nextSettings = {};
      for (const [key, entry] of Object.entries(settings)) {
        const value = entry.input.value;
        nextSettings[key] = entry.type === 'boolean' ? value === 'true' : entry.type === 'number' ? Number(value) : value;
      }
      const result = await saveProductionActorConfiguration(store.getState().productionRuntime, production.id, actor.id, { settings: nextSettings });
      persistRuntime(result.runtime);
      toast(result.validation.valid ? 'Production configuration saved' : 'Configuration blocked', result.validation.valid
        ? `${actor.address} is ready for ${production.title}. No work executed.`
        : result.validation.blockers.join(', '));
      render();
      refreshWindow?.();
    });
    const promote = button('Promote selected settings to my default', 'secondary-button', async () => {
      const keys = Object.keys(settings);
      const result = await promoteSettingToActorDefault(store.getState().productionRuntime, production.id, actor.id, keys);
      persistRuntime(result.runtime);
      toast('Explicit default promotion recorded', `${keys.length} settings promoted with evidence ${result.proposal.id}.`);
      render();
    });
    root.append(el('div', { class: 'surface-actions' }, [
      save,
      promote,
      el('span', { class: 'boundary-note', text: 'Saving configures only. Make Production is the sole execution transition.' })
    ]));
  };

  function renderStandalone(runtime, actor) {
    const contexts = runtime.configurations.filter(item => item.actorId === actor.id);
    root.append(el('div', { class: 'boundary-callout' }, [
      el('strong', { text: 'Standalone Actor view' }),
      el('p', { text: 'Production contexts are listed as isolated records. Their mutable settings are not merged into Actor-global memory.' })
    ]));
    root.append(el('h3', { text: 'Saved Production contexts' }));
    if (!contexts.length) root.append(el('div', { class: 'empty-state utility-empty' }, [
      tileImage('gummy.utility.setup', 96),
      el('strong', { text: 'No saved Production contexts yet' }),
      el('span', { text: 'Add this Actor to a Production, then save its isolated configuration.' })
    ]));
    for (const config of contexts) {
      const production = runtime.productions.find(item => item.id === config.productionId);
      const copyActions = runtime.productions
        .filter(item => item.id !== config.productionId)
        .map(target => button(`Copy into ${target.title}`, 'secondary-button', () => {
          const proposed = createDragIntent(store.getState().productionRuntime, {
            productionId: target.id,
            sourceKind: 'configuration',
            sourceId: config.id,
            targetKind: 'production',
            targetId: target.id,
            action: 'copy-configuration',
            dataClasses: ['versioned-production-settings'],
            approvalRequired: true,
            inputMode: 'keyboard'
          });
          persistRuntime(proposed.runtime);
          showCopyPreview(proposed.intent, target);
        }));
      root.append(el('article', { class: 'saved-context-card' }, [
        el('div', {}, [
          el('strong', { text: production?.title || config.productionId }),
          el('small', { text: `${config.id} · revision ${config.revision} · ${config.readiness}` })
        ]),
        el('div', { class: 'card-actions' }, [
          button('Open scoped surface', 'secondary-button', () => window.dispatchEvent(new CustomEvent('gummy:open-actor-surface', { detail: { actorId, productionId: config.productionId } }))),
          ...copyActions
        ])
      ]));
    }
    const defaults = runtime.actorDefaults[actor.id];
    root.append(el('h3', { text: 'Human-owned Actor defaults' }));
    root.append(el('pre', { class: 'object-preview', text: defaults ? JSON.stringify(defaults, null, 2) : 'No promoted defaults. Production settings remain isolated.' }));
  }

  function showCopyPreview(intent, target) {
    const modal = el('section', { class: 'modal-card intent-preview', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Configuration copy preview' }, [
      el('span', { class: 'eyebrow', text: 'VERSIONED COPY PROPOSAL — NO SHARED MUTABLE STATE' }),
      el('h2', { text: `Copy configuration into ${target.title}?` }),
      el('p', { text: `${intent.source.id} → ${intent.target.id}` }),
      el('p', { text: `Data classes: ${intent.dataClasses.join(', ')} · Human approval required · no execution.` }),
      el('div', { class: 'modal-actions' }, [
        button('Cancel', 'secondary-button', () => modal.remove()),
        button('Approve isolated copy', 'primary-button', () => {
          const result = applyDragIntent(store.getState().productionRuntime, intent.id);
          persistRuntime(result.runtime);
          toast('Configuration copied', `A new isolated ${actorId} configuration now belongs to ${target.title} and requires review.`);
          modal.remove();
          render();
        })
      ])
    ]);
    root.append(modal);
  }

  render();
  return { node: root, refresh: render };
}

function fact(label, value) {
  return el('article', { class: 'fact-card' }, [el('small', { text: label }), el('strong', { text: String(value) })]);
}

function contract(label, values) {
  return el('article', { class: 'contract-card' }, [
    el('strong', { text: label }),
    el('div', { class: 'tag-row' }, (values || []).map(value => el('span', { class: 'tag', text: value })))
  ]);
}

function humanize(value) {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ').replace(/^./, letter => letter.toUpperCase());
}

function operationForActor(actorId) {
  return {
    'actor:imagehoss': 'gummy.utility.vision',
    'actor:3d-bee': 'gummy.utility.attach',
    'actor:videoboss': 'gummy.utility.agent',
    'actor:project-composer': 'gummy.utility.setup',
    'actor:gummy-storage': 'gummy.utility.deliver'
  }[actorId] || 'gummy.utility.setup';
}

function tileImage(id, size) {
  const tile = utilityTile(id);
  const sourceSize = size >= 80 ? '96' : '64';
  return el('img', {
    class: 'utility-tile',
    src: tile.derivatives[sourceSize],
    alt: tile.label,
    width: String(size),
    decoding: 'async',
    dataset: { utilityId: id }
  });
}
