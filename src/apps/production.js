import { button, clear, el, sectionHeading } from '../core/dom.js';
import { utilityTile } from '../brand/gummy-utility-tiles.js';
import {
  addActorToProduction,
  addRanchDayRoster,
  applyDragIntent,
  compileActorPlan,
  createDragIntent,
  createProduction,
  getSetupGuidance,
  makeProduction,
  previewProductionRun,
  RANCH_DAY_ACTOR_IDS,
  revokeActorRelationship
} from '../core/production-runtime.js';

export function createProductionApp({
  store,
  productionId = null,
  openActorSurface,
  openMasterControl,
  openProduction,
  toast
}) {
  const root = el('div', { class: 'production-app' });
  let selectedTab = 'canvas';
  let pendingIntentId = null;
  let runPreview = null;

  const setRuntime = runtime => store.setState(current => ({ ...current, productionRuntime: runtime }));

  const render = () => {
    clear(root);
    const runtime = store.getState().productionRuntime;
    const production = productionId
      ? runtime.productions.find(item => item.id === productionId)
      : runtime.productions.at(-1);
    if (!production) {
      renderEmpty(runtime);
      return;
    }
    productionId = production.id;
    renderProduction(runtime, production);
  };

  function renderEmpty() {
    root.append(el('section', { class: 'production-empty' }, [
      tileImage('gummy.utility.setup', 192, 'utility-tile utility-hero'),
      el('span', { class: 'eyebrow', text: 'ACTOR-FIRST PRODUCTION' }),
      el('h1', { text: 'Start with the undertaking, then bring in the Actors.' }),
      el('p', { text: 'A Production is durable and editable. Nothing executes until a Human approves Make Production.' }),
      button('Start private Ranch Day Production', 'primary-button large-action', () => {
        const result = createProduction(store.getState().productionRuntime);
        setRuntime(result.runtime);
        productionId = result.production.id;
        toast('Ranch Day created', 'The Production exists with @Hayden as owner. No service work executed.');
        render();
      })
    ]));
  }

  function renderProduction(runtime, production) {
    const owner = runtime.actors.find(item => item.id === production.ownerActorId);
    root.append(el('header', { class: 'production-header' }, [
      el('div', {}, [
        el('span', { class: 'eyebrow', text: 'PRODUCTION' }),
        el('h1', { text: production.title }),
        el('p', { text: production.description })
      ]),
      el('div', { class: 'production-header-actions' }, [
        button('Master Control', 'secondary-button', () => openMasterControl(production.id)),
        button('Make Production', 'primary-button make-production-button', () => showRunPreview())
      ])
    ]));
    root.append(el('div', { class: 'production-facts' }, [
      fact('Owner', owner?.address || production.ownerActorId),
      fact('Status', production.status),
      fact('Visibility', production.visibility),
      fact('Revision', production.revision),
      fact('Authority', production.authoritativeLocation)
    ]));

    const tabs = el('nav', { class: 'production-tabs', 'aria-label': 'Production sections' });
    for (const [id, label] of [
      ['canvas', 'Production Canvas'],
      ['plan', 'Actor Plan'],
      ['gummies', 'Gummy shelf'],
      ['runs', 'Run history']
    ]) {
      tabs.append(button(label, `graph-tab ${selectedTab === id ? 'active' : ''}`, () => {
        selectedTab = id;
        render();
      }));
    }
    root.append(tabs);

    const layout = el('div', { class: 'production-layout' });
    const rail = renderSetupRail(runtime, production);
    const main = el('section', { class: 'production-main' });
    if (selectedTab === 'canvas') renderCanvas(runtime, production, main);
    if (selectedTab === 'plan') renderPlan(runtime, production, main);
    if (selectedTab === 'gummies') renderGummies(runtime, production, main);
    if (selectedTab === 'runs') renderRuns(runtime, production, main);
    layout.append(rail, main);
    root.append(layout);
    if (pendingIntentId) root.append(renderIntentPreview(runtime, production));
    if (runPreview) root.append(renderRunPreview(runtime, production));
  }

  function renderSetupRail(runtime, production) {
    const rail = el('aside', { class: 'setup-rail' }, [
      el('div', { class: 'setup-heading' }, [
        el('span', { class: 'eyebrow', text: 'GUIDED SETUP' }),
        el('strong', { text: 'Dependency-aware order' })
      ])
    ]);
    const guidance = getSetupGuidance(runtime, production.id);
    for (const step of guidance) {
      const actor = runtime.actors.find(item => item.id === step.actorId);
      rail.append(el('button', {
        class: `setup-step readiness-${step.readiness}`,
        onclick: () => openActorSurface(step.actorId, actor.kind === 'service' ? production.id : null),
        'aria-label': `Open ${actor.address}; ${step.readiness}${step.optional ? '; optional' : ''}`
      }, [
        tileImage(setupTileForActor(step.actorId), 64),
        el('span', { class: 'setup-number', text: String(step.order) }),
        el('span', {}, [
          el('strong', { text: actor.name }),
          el('small', { text: `${step.readiness}${step.optional ? ' · optional' : ''}` })
        ])
      ]));
    }
    return rail;
  }

  function renderCanvas(runtime, production, main) {
    const participants = runtime.participants.filter(item => item.productionId === production.id && item.status !== 'removed');
    main.append(sectionHeading('Participant roster', 'Actors participate; Agent executors remain separately identified.', [
      button('Add Ranch Day roster', 'primary-button', () => {
        const next = addRanchDayRoster(store.getState().productionRuntime, production.id, 'mention');
        setRuntime(next);
        toast('Roster proposed by @mention', 'Participants were added for configuration. No Agent executed.');
        render();
      })
    ]));

    const composer = el('form', { class: 'mention-composer' });
    const mention = el('input', { placeholder: '@mention or search an Actor', 'aria-label': 'Mention or search Actor' });
    composer.append(mention, button('Add Actor', 'secondary-button', event => {
      event?.preventDefault?.();
      const query = mention.value.trim().toLowerCase();
      const actor = runtime.actors.find(item => item.address.toLowerCase() === query || item.name.toLowerCase() === query.replace(/^@/, ''));
      if (!actor) {
        toast('Actor not found', 'Try @ImageHoss, @Meshmallow, @VideoBoss, @ProjectComposer, or @GummyStorage.');
        return;
      }
      const result = addActorToProduction(store.getState().productionRuntime, production.id, actor.id, query.startsWith('@') ? 'mention' : 'search');
      setRuntime(result.runtime);
      mention.value = '';
      render();
    }));
    composer.addEventListener('submit', event => event.preventDefault());
    main.append(composer);

    const roster = el('div', {
      class: 'actor-roster',
      'aria-label': 'Production participant roster',
      ondragover: event => event.preventDefault(),
      ondrop: event => {
        event.preventDefault();
        const actorId = event.dataTransfer.getData('application/x-gummy-actor');
        if (actorId) proposeIntent({
          sourceKind: 'actor',
          sourceId: actorId,
          targetKind: 'production',
          targetId: production.id,
          action: 'participant-membership',
          dataClasses: ['actor-identity', 'production-role'],
          inputMode: 'pointer'
        });
      }
    });
    for (const participant of participants) {
      const actor = runtime.actors.find(item => item.id === participant.actorId);
      const config = runtime.configurations.find(item => item.productionId === production.id && item.actorId === actor.id);
      const card = el('article', {
        class: 'actor-card',
        draggable: 'true',
        dataset: { actorId: actor.id },
        ondragstart: event => {
          event.dataTransfer.setData('application/x-gummy-actor', actor.id);
          setDragProxy(event, 'gummy.utility.setup', `Add ${actor.address}`);
        }
      }, [
        el('div', { class: 'actor-card-topline' }, [
          el('span', { class: `actor-kind kind-${actor.kind}`, text: actor.kind }),
          el('span', { class: `status ${config?.readiness === 'ready' || actor.kind === 'person' ? '' : 'review'}`, text: config?.readiness || participant.status })
        ]),
        el('h3', { text: actor.address }),
        el('p', { text: participant.roles.join(' · ') }),
        el('small', { text: participant.assignedAgentId ? `Agent: ${participant.assignedAgentId}` : 'No execution Agent required' }),
        el('div', { class: 'card-actions' }, [
          button('Open Actor surface', 'secondary-button', () => openActorSurface(actor.id, actor.kind === 'service' ? production.id : null)),
          button('Keyboard/touch proposal', 'ghost-button inline-action', () => proposeIntent({
            sourceKind: 'actor',
            sourceId: actor.id,
            targetKind: 'production',
            targetId: production.id,
            action: 'participant-membership',
            dataClasses: ['actor-identity', 'production-role'],
            inputMode: 'keyboard'
          })),
          actor.id !== 'actor:videoboss' ? button('Route to VideoBoss', 'ghost-button inline-action', () => proposeIntent({
            sourceKind: 'actor',
            sourceId: actor.id,
            targetKind: 'actor',
            targetId: 'actor:videoboss',
            action: 'actor-routing',
            dataClasses: ['typed-production-handoff'],
            inputMode: 'touch'
          })) : null
        ])
      ]);
      roster.append(card);
    }
    if (!participants.length) roster.append(el('div', { class: 'drop-target-empty utility-empty' }, [
      tileImage('gummy.utility.bowl', 96),
      el('strong', { text: 'Build the Production roster' }),
      el('span', { text: 'Drop an Actor here or use @mention/search.' })
    ]));
    main.append(roster);

    const available = runtime.actors.filter(actor => !participants.some(item => item.actorId === actor.id));
    if (available.length) {
      main.append(el('h3', { text: 'Actor search results' }));
      main.append(el('div', { class: 'search-results' }, available.map(actor => el('button', {
        class: 'search-actor',
        draggable: 'true',
        ondragstart: event => {
          event.dataTransfer.setData('application/x-gummy-actor', actor.id);
          setDragProxy(event, 'gummy.utility.setup', `Add ${actor.address}`);
        },
        onclick: () => {
          const result = addActorToProduction(store.getState().productionRuntime, production.id, actor.id, 'search');
          setRuntime(result.runtime);
          render();
        }
      }, [el('strong', { text: actor.address }), el('small', { text: `${actor.kind} Actor · drag or activate to propose membership` })]))));
    }
  }

  function renderPlan(runtime, production, main) {
    let plan = runtime.actorPlans.find(item => item.productionId === production.id);
    main.append(sectionHeading('Actor Plan', 'Editable graph of context, setup, execution, review, approval, storage, and publication.', [
      button(plan ? 'Recompile graph' : 'Compile graph', 'primary-button', () => {
        const result = compileActorPlan(store.getState().productionRuntime, production.id);
        setRuntime(result.runtime);
        toast('Actor Plan compiled', `Revision ${result.plan.revision}; this did not execute work.`);
        render();
      })
    ]));
    if (!plan) {
      main.append(el('div', { class: 'empty-state utility-empty' }, [
        tileImage('gummy.utility.setup', 96),
        el('strong', { text: 'Configure the Actor Plan' }),
        el('span', { text: 'Compile the roster into a visible dependency graph.' })
      ]));
      return;
    }
    const graph = el('div', { class: 'actor-plan-graph', dataset: { planRevision: plan.revision } });
    for (const node of plan.nodes) {
      const actor = runtime.actors.find(item => item.id === node.actorId);
      graph.append(el('article', {
        class: `plan-node node-${node.nodeType}`,
        draggable: 'true',
        ondragstart: event => {
          event.dataTransfer.setData('application/x-gummy-plan-node', node.id);
          setDragProxy(event, 'gummy.utility.setup', `Reorder ${actor.address}`);
        }
      }, [
        el('span', { class: 'eyebrow', text: node.nodeType }),
        el('strong', { text: actor.address }),
        el('small', { text: node.role }),
        el('code', { text: node.agentId || 'No Agent — non-execution node' }),
        el('span', { class: 'tag', text: node.moldId || 'Human context relationship' }),
        button('Propose reorder', 'ghost-button inline-action', () => proposeIntent({
          sourceKind: 'plan-node',
          sourceId: node.id,
          targetKind: 'plan',
          targetId: plan.id,
          action: 'plan-reorder',
          dataClasses: ['editable-plan-order'],
          inputMode: 'keyboard'
        }))
      ]));
    }
    main.append(graph);
    const edges = el('div', { class: 'plan-edges' });
    for (const edge of plan.edges) {
      const from = plan.nodes.find(item => item.id === edge.fromNodeId);
      const to = plan.nodes.find(item => item.id === edge.toNodeId);
      const fromActor = runtime.actors.find(item => item.id === from.actorId);
      const toActor = runtime.actors.find(item => item.id === to.actorId);
      edges.append(el('article', { class: `plan-edge edge-${edge.edgeType}` }, [
        el('span', { class: 'edge-type', text: edge.edgeType }),
        el('strong', { text: `${fromActor.address} → ${toActor.address}` }),
        el('small', { text: edge.dataClasses.join(', ') }),
        el('span', { class: 'tag', text: edge.approvalRequired ? 'approval required' : 'bounded by plan' }),
        edge.optional ? el('span', { class: 'tag', text: 'optional branch' }) : null
      ]));
    }
    main.append(edges);
  }

  function renderGummies(runtime, production, main) {
    main.append(el('div', { class: 'utility-section-heading' }, [
      tileImage('gummy.utility.attach', 64),
      sectionHeading('Gummy shelf', 'Source, references, results, deliverables, Returns, and Receipts stay inspectable.')
    ]));
    const shelf = el('div', { class: 'gummy-shelf' });
    for (const gummyId of production.gummyIds) {
      const gummy = runtime.gummies.find(item => item.id === gummyId);
      if (!gummy) continue;
      shelf.append(el('article', {
        class: `gummy-card gummy-${gummy.status}`,
        draggable: 'true',
        ondragstart: event => {
          event.dataTransfer.setData('application/x-gummy-object', gummy.id);
          setDragProxy(event, gummy.status === 'result' ? 'gummy.utility.deliver' : 'gummy.utility.attach', gummy.name);
        }
      }, [
        el('span', { class: 'eyebrow', text: gummy.status }),
        el('strong', { text: gummy.name }),
        el('small', { text: `${gummy.mediaType} · revision ${gummy.revision}` }),
        el('code', { text: gummy.hash }),
        button('Propose as VideoBoss input', 'secondary-button', () => proposeIntent({
          sourceKind: 'gummy',
          sourceId: gummy.id,
          targetKind: 'actor',
          targetId: 'actor:videoboss',
          action: 'task-input',
          dataClasses: [gummy.mediaType],
          moldId: 'mold:videoboss:private-family-video',
          inputMode: 'touch'
        })),
        gummy.status === 'result' ? button('Propose downstream Composer edge', 'secondary-button', () => proposeIntent({
          sourceKind: 'gummy',
          sourceId: gummy.id,
          targetKind: 'actor',
          targetId: 'actor:project-composer',
          action: 'plan-edge',
          dataClasses: [gummy.mediaType],
          inputMode: 'keyboard'
        })) : null
      ]));
    }
    main.append(shelf);
    main.append(el('div', {
      class: 'actor-input-dropzone',
      tabindex: '0',
      'aria-label': 'Drop a Gummy to propose VideoBoss task input',
      ondragover: event => event.preventDefault(),
      ondrop: event => {
        event.preventDefault();
        const gummyId = event.dataTransfer.getData('application/x-gummy-object');
        if (gummyId) proposeIntent({
          sourceKind: 'gummy',
          sourceId: gummyId,
          targetKind: 'actor',
          targetId: 'actor:videoboss',
          action: 'task-input',
          dataClasses: ['selected-gummy'],
          moldId: 'mold:videoboss:private-family-video',
          inputMode: 'pointer'
        });
      }
    }, [
      tileImage('gummy.utility.attach', 64),
      el('strong', { text: 'VideoBoss input proposal target' }),
      el('span', { text: 'Drop here, or use the keyboard/touch action on a Gummy card.' })
    ]));
    main.append(el('div', { class: 'surface-actions' }, [
      button('Propose Production preservation', 'secondary-button', () => proposeIntent({
        sourceKind: 'production',
        sourceId: production.id,
        targetKind: 'actor',
        targetId: 'actor:gummy-storage',
        action: 'preservation-policy',
        dataClasses: ['sources', 'results', 'returns', 'receipts'],
        moldId: 'mold:gummy-storage:local-preservation',
        inputMode: 'touch'
      })),
      el('span', { class: 'boundary-note', text: 'This creates an editable policy proposal; it does not move bytes or start storage work.' })
    ]));
  }

  function renderRuns(runtime, production, main) {
    main.append(sectionHeading('Run history', 'Every Make Production freezes a new immutable attempt.'));
    const runs = runtime.productionRuns.filter(item => item.productionId === production.id).reverse();
    if (!runs.length) {
      main.append(el('div', { class: 'empty-state', text: 'No execution attempts. Adding and configuring Actors never creates a Run.' }));
      return;
    }
    for (const run of runs) {
      main.append(el('article', { class: 'run-card' }, [
        el('div', {}, [
          el('span', { class: 'eyebrow', text: run.status }),
          el('h3', { text: run.id }),
          el('p', { text: `Production r${run.productionRevision} · Plan r${run.actorPlanRevision} · ${run.resultGummyIds.length} results` })
        ]),
        el('div', { class: 'run-hashes' }, [
          el('code', { text: run.manifestHash }),
          el('small', { text: `Sources frozen: ${run.sourceGummyRevisions.map(item => `${item.id}@${item.revision}`).join(', ')}` })
        ])
      ]));
    }
  }

  function proposeIntent(values) {
    const result = createDragIntent(store.getState().productionRuntime, { productionId, approvalRequired: true, ...values });
    setRuntime(result.runtime);
    pendingIntentId = result.intent.id;
    render();
  }

  function renderIntentPreview(runtime) {
    const intent = runtime.dragIntents.find(item => item.id === pendingIntentId);
    if (!intent) return null;
    return el('section', { class: 'modal-card intent-preview', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Typed proposal preview' }, [
      el('span', { class: 'eyebrow', text: 'TYPED INTENT PREVIEW — NO EXECUTION' }),
      el('h2', { text: intent.proposedRelation }),
      tileImage(intent.utilityTileId, 96, 'utility-tile intent-tile'),
      el('div', { class: 'intent-grid' }, [
        fact('Source', `${intent.source.kind}: ${intent.source.id}`),
        fact('Target', `${intent.target.kind}: ${intent.target.id}`),
        fact('Data classes', intent.dataClasses.join(', ') || 'none'),
        fact('Mold / permission', intent.moldId || 'Human approval required'),
        fact('Approval', intent.approvalRequired ? 'required' : 'not required'),
        fact('Input equivalent', intent.inputMode)
      ]),
      el('p', { class: 'boundary-note', text: 'This proposal grants no ambient authority, starts no Agent, and cannot mutate an active frozen Run.' }),
      el('div', { class: 'modal-actions' }, [
        button('Cancel', 'secondary-button', () => { pendingIntentId = null; render(); }),
        intent.validation?.valid === false
          ? el('p', { class: 'boundary-note blocked', text: `Blocked: ${intent.validation.blockers.join(', ')}` })
          : button('Accept proposal', 'primary-button', () => {
          const result = applyDragIntent(store.getState().productionRuntime, pendingIntentId);
          setRuntime(result.runtime);
          pendingIntentId = null;
          toast('Typed proposal accepted', 'Editable Production state changed; no execution started and no Grant was issued.');
          render();
        })
      ])
    ]);
  }

  function showRunPreview() {
    const result = previewProductionRun(store.getState().productionRuntime, productionId);
    setRuntime(result.runtime);
    runPreview = result.preview;
    render();
  }

  function renderRunPreview(runtime, production) {
    const current = previewProductionRun(runtime, production.id);
    const preview = current.preview;
    const blocked = preview.blockers.length > 0;
    return el('section', { class: 'modal-card run-preview', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Master Control Run preview' }, [
      el('span', { class: 'eyebrow', text: 'MASTER CONTROL · RUN PREVIEW' }),
      el('h2', { text: blocked ? 'Make Production is blocked' : 'Ready for Human approval' }),
      tileImage(blocked ? 'gummy.utility.setup' : 'gummy.utility.progress', 96, 'utility-tile intent-tile'),
      el('div', { class: 'intent-grid' }, [
        fact('Frozen Production', `${production.id}@${preview.productionRevision}`),
        fact('Frozen Actor Plan', `${preview.actorPlanId}@${preview.actorPlanRevision}`),
        fact('Participants', String(preview.participants.length)),
        fact('Source Gummies', String(preview.sourceGummies.length)),
        fact('Locality', preview.locality.join(', ')),
        fact('Cost ceiling', '$0 deterministic reference')
      ]),
      el('div', { class: blocked ? 'blocker-list' : 'approval-list' }, [
        el('strong', { text: blocked ? 'Unresolved blockers' : 'Authority path' }),
        ...(blocked
          ? preview.blockers.map(item => el('p', { text: item }))
          : [
              el('p', { text: 'Human → Master Control → active Mold → Work Order → Task Lease → bounded Grant → reference Agent.' }),
              el('p', { text: 'Context is sliced per node. Native capability remains unavailable.' })
            ])
      ]),
      el('div', { class: 'modal-actions' }, [
        button('Close preview', 'secondary-button', () => { runPreview = null; render(); }),
        button('Inspect full Master Control', 'secondary-button', () => openMasterControl(production.id)),
        button('Approve & Make Production', 'primary-button', async () => {
          const result = await makeProduction(store.getState().productionRuntime, production.id, { approvedBy: 'human:hayden' });
          setRuntime(result.runtime);
          runPreview = null;
          if (result.denied) toast('Make Production blocked', result.blockers.join(', '));
          else {
            toast('Production Run completed', `${result.run.id} created ${result.results.length} deterministic reference results with Returns and Receipts.`);
            selectedTab = 'runs';
          }
          render();
        })
      ].filter((_, index) => !blocked || index < 2))
    ]);
  }

  render();
  return { node: root, refresh: render };
}

function fact(label, value) {
  return el('article', { class: 'fact-card' }, [el('small', { text: label }), el('strong', { text: String(value) })]);
}

function tileImage(id, size = 64, className = 'utility-tile') {
  const tile = utilityTile(id);
  const sourceSize = size >= 160 ? '192' : size >= 80 ? '96' : '64';
  return el('img', {
    class: className,
    src: tile.derivatives[sourceSize],
    alt: tile.label,
    width: String(size),
    loading: size >= 96 ? 'lazy' : 'eager',
    decoding: 'async',
    dataset: { utilityId: id }
  });
}

function setupTileForActor(actorId) {
  return {
    'actor:hayden': 'gummy.utility.bowl',
    'actor:hoyt': 'gummy.utility.vision',
    'actor:imagehoss': 'gummy.utility.vision',
    'actor:3d-bee': 'gummy.utility.attach',
    'actor:videoboss': 'gummy.utility.agent',
    'actor:project-composer': 'gummy.utility.setup',
    'actor:gummy-storage': 'gummy.utility.deliver'
  }[actorId] || 'gummy.utility.setup';
}

function setDragProxy(event, utilityId, label) {
  const tile = utilityTile(utilityId);
  const proxy = el('div', { class: 'gummy-drag-proxy', 'aria-hidden': 'true' }, [
    el('img', { src: tile.derivatives['96'], alt: '', width: '72', height: '72' }),
    el('strong', { text: label }),
    el('small', { text: 'Proposal only' })
  ]);
  document.body.append(proxy);
  event.dataTransfer?.setDragImage(proxy, 38, 38);
  setTimeout(() => proxy.remove(), 0);
}
