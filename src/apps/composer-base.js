import { button, clear, el } from '../core/dom.js';
import { PHASE14_PLACES } from '../places/manifest.js';
import {
  COMPOSER_LANES,
  addCompositionNode,
  applyProductionComposition,
  bindCompositionToProduction,
  connectCompositionNodes,
  createProductionComposition,
  disconnectCompositionEdge,
  duplicateCompositionNode,
  duplicateProductionComposition,
  ensureProductionComposition,
  moveCompositionNode,
  moveCompositionNodeToLane,
  removeCompositionNode,
  renameProductionComposition,
  replaceCompositionFromSnapshot,
  toggleCompositionBranch
} from '../core/production-composition.js';
import {
  applyDragIntent,
  createDragIntent,
  createProduction
} from '../core/production-runtime.js';

const clone = value => structuredClone(value);

export function createComposerApp({
  store,
  productionId = null,
  paletteRecords = {},
  openProduction = () => {},
  openActorSurface = () => {},
  openMasterControl = () => {},
  openCanonicalRef = () => {},
  reloadRuntime = null,
  toast = () => {}
}) {
  const root = el('div', { class: 'composer-app', dataset: { testid: 'composer-surface' } });
  let compositionId = productionId
    ? store.getState().productionRuntime.compositions?.find(item => item.productionId === productionId)?.id || null
    : store.getState().productionRuntime.compositions?.at(-1)?.id || null;
  let paletteQuery = '';
  let paletteCategory = 'all';
  let displayMode = 'canvas';
  let phoneMode = localStorage.getItem('gummy:composer-phone-mode') || 'goal';
  let zoom = 1;
  let pendingProposal = null;
  let connectionSourceId = null;
  let undoStack = [];
  let redoStack = [];

  const setRuntime = runtime => store.setState(current => ({ ...current, productionRuntime: runtime }));
  const runtimeNow = () => store.getState().productionRuntime;
  const compositionNow = runtime => (runtime.compositions || []).find(item => item.id === compositionId);

  if (productionId && !compositionId) {
    const ensured = ensureProductionComposition(runtimeNow(), productionId);
    compositionId = ensured.composition.id;
    if (ensured.created) setRuntime(ensured.runtime);
  }

  function commitMutation(operation, message = null) {
    const runtime = runtimeNow();
    const current = compositionNow(runtime);
    if (!current) return;
    const result = operation(runtime);
    if (result?.denied) {
      toast('Composer change blocked', result.reason);
      return;
    }
    undoStack.push(clone(current));
    if (undoStack.length > 50) undoStack.shift();
    redoStack = [];
    setRuntime(result.runtime);
    if (message) toast(message, 'The saved proposal changed. No work ran.');
    render();
  }

  function queueProposal({ source, target, relation, dataClasses, inputMode, apply }) {
    const current = compositionNow(runtimeNow());
    if (!current) return;
    const proposed = createDragIntent(runtimeNow(), {
      productionId: current.productionId || undefined,
      sourceKind: source.kind,
      sourceId: source.id,
      targetKind: target.kind,
      targetId: target.id,
      action: relation,
      dataClasses,
      approvalRequired: true,
      inputMode
    });
    setRuntime(proposed.runtime);
    pendingProposal = {
      intentId: proposed.intent.id,
      apply,
      plainSummary: proposalSummary(relation)
    };
    render();
  }

  function acceptProposal() {
    if (!pendingProposal) return;
    const runtime = runtimeNow();
    const current = compositionNow(runtime);
    const accepted = applyDragIntent(runtime, pendingProposal.intentId);
    if (accepted.denied) {
      toast('Proposal blocked', accepted.reason);
      pendingProposal = null;
      setRuntime(accepted.runtime);
      render();
      return;
    }
    const result = pendingProposal.apply(accepted.runtime, accepted.intent);
    if (result?.denied) {
      toast('Proposal blocked', result.reason);
      pendingProposal = null;
      setRuntime(accepted.runtime);
      render();
      return;
    }
    undoStack.push(clone(current));
    if (undoStack.length > 50) undoStack.shift();
    redoStack = [];
    pendingProposal = null;
    setRuntime(result.runtime);
    toast('Proposal accepted', 'The composition changed. No Run, Lease, Grant, provider call, charge, publication, or accepted result was created.');
    render();
  }

  function createBlankComposition() {
    const result = createProductionComposition(runtimeNow(), {
      title: 'Untitled composition',
      source: 'blank'
    });
    compositionId = result.composition.id;
    setRuntime(result.runtime);
    undoStack = [];
    redoStack = [];
    toast('Blank composition created', 'It is private in this browser and has not been attached to a Production.');
    render();
  }

  function createAndAttachProduction() {
    const created = createProduction(runtimeNow(), {
      title: 'Untitled Production',
      description: 'A private Production created from an editable composition.',
      sourceGummyIds: []
    });
    let runtime = created.runtime;
    let current = compositionNow(runtime);
    if (!current) {
      const composed = createProductionComposition(runtime, {
        title: `${created.production.title} composition`,
        productionId: created.production.id,
        source: 'blank'
      });
      runtime = composed.runtime;
      compositionId = composed.composition.id;
      current = composed.composition;
    } else {
      runtime = bindCompositionToProduction(runtime, current.id, created.production.id).runtime;
    }
    setRuntime(runtime);
    toast('Production attached', 'The composition is now linked to a private Production. Nothing ran.');
    render();
  }

  function attachToProduction(targetProductionId) {
    if (!compositionId || !targetProductionId) return;
    commitMutation(
      runtime => bindCompositionToProduction(runtime, compositionId, targetProductionId),
      'Composition attached'
    );
  }

  function addPaletteItem(item, lane, inputMode) {
    queueProposal({
      source: item.ref,
      target: { kind: 'lane', id: lane },
      relation: 'composition-add',
      dataClasses: [item.category, lane],
      inputMode,
      apply: (runtime, intent) => addCompositionNode(runtime, compositionId, {
        ref: item.ref,
        label: item.label,
        description: item.description,
        lane,
        optional: item.optional,
        availability: item.availability,
        sourceIntentId: intent.id
      })
    });
  }

  function moveNode(nodeId, lane, inputMode) {
    queueProposal({
      source: { kind: 'composition-node', id: nodeId },
      target: { kind: 'lane', id: lane },
      relation: 'composition-move',
      dataClasses: ['human-layout', lane],
      inputMode,
      apply: runtime => moveCompositionNodeToLane(runtime, compositionId, nodeId, lane)
    });
  }

  function connectNodes(fromNodeId, toNodeId, inputMode) {
    if (!fromNodeId || !toNodeId || fromNodeId === toNodeId) return;
    queueProposal({
      source: { kind: 'composition-node', id: fromNodeId },
      target: { kind: 'composition-node', id: toNodeId },
      relation: 'composition-connect',
      dataClasses: ['typed-production-handoff'],
      inputMode,
      apply: (runtime, intent) => connectCompositionNodes(runtime, compositionId, {
        fromNodeId,
        toNodeId,
        edgeType: inferEdgeType(compositionNow(runtime), fromNodeId, toNodeId),
        dataClasses: ['typed-production-handoff'],
        approvalRule: 'Master Control approval required',
        sourceIntentId: intent.id
      })
    });
  }

  function render() {
    clear(root);
    const runtime = runtimeNow();
    const compositions = runtime.compositions || [];
    const composition = compositionNow(runtime);
    if (composition && !localStorage.getItem('gummy:composer-phone-mode')) phoneMode = 'arrange';
    root.dataset.composerPhoneMode = phoneMode;
    root.append(renderHeader(runtime, compositions, composition));
    if (!composition) {
      root.append(renderBlankState());
      return;
    }
    root.append(renderPhoneModes());
    root.append(renderWorkspace(runtime, composition));
    if (pendingProposal) root.append(renderProposal(runtime));
  }

  function renderPhoneModes() {
    const modes = [
      ['goal', 'Goal'],
      ['arrange', 'Arrange'],
      ['review', 'Review'],
      ['system', 'System Details']
    ];
    return el('nav', {
      class: 'composer-phone-modes',
      'aria-label': 'Composer mode'
    }, modes.map(([id, label]) => el('button', {
      type: 'button',
      class: phoneMode === id ? 'primary-button' : 'ghost-button',
      text: label,
      'aria-pressed': String(phoneMode === id),
      dataset: { composerMode: id },
      onclick: () => {
        phoneMode = id;
        localStorage.setItem('gummy:composer-phone-mode', id);
        render();
      }
    })));
  }

  function renderHeader(runtime, compositions, composition) {
    const header = el('header', { class: 'composer-header' }, [
      el('div', {}, [
        el('p', { class: 'eyebrow', text: 'COMPOSER · HUMAN-EDITABLE PROPOSAL' }),
        el('h1', { text: composition ? 'Composer' : 'Arrange what you want to make' }),
        composition ? el('strong', { class: 'composer-current-title', text: composition.title }) : null,
        el('p', {
          class: 'lede',
          text: 'See your inputs, people and tools, steps, decisions, and destinations in one place. Every canvas change is a proposal; nothing runs here.'
        })
      ])
    ]);
    const chooser = el('select', { 'aria-label': 'Choose a saved composition' }, [
      el('option', { value: '', text: compositions.length ? 'Choose a composition' : 'No saved compositions' }),
      ...compositions.map(item => el('option', {
        value: item.id,
        text: `${item.title} · r${item.revision}`,
        selected: item.id === composition?.id
      }))
    ]);
    chooser.addEventListener('change', () => {
      if (!chooser.value) return;
      compositionId = chooser.value;
      undoStack = [];
      redoStack = [];
      render();
    });
    header.append(el('div', { class: 'composer-header-actions' }, [
      chooser,
      button('New composition', 'secondary-button', createBlankComposition)
    ]));
    return header;
  }

  function renderBlankState() {
    return el('section', { class: 'composer-blank', dataset: { testid: 'composer-blank' } }, [
      el('div', { class: 'composer-blank-copy' }, [
        el('h2', { text: 'Start with an empty canvas' }),
        el('p', { text: 'Choose the visible objects yourself. You can attach the composition to a Production now or later.' }),
        el('div', { class: 'button-row' }, [
          button('Create a blank composition', 'primary-button', createBlankComposition),
          button('Start a blank Production', 'secondary-button', () => {
            createBlankComposition();
            createAndAttachProduction();
          })
        ])
      ]),
      el('div', { class: 'composer-lanes composer-lanes-empty', 'aria-label': 'Empty Composer lanes' },
        COMPOSER_LANES.map(lane => el('article', { class: 'composer-lane' }, [
          el('span', { class: 'eyebrow', text: lane.title }),
          el('h2', { text: lane.prompt }),
          el('p', { text: lane.description })
        ]))
      )
    ]);
  }

  function renderWorkspace(runtime, composition) {
    const shell = el('div', { class: 'composer-workspace' });
    const toolbar = renderToolbar(runtime, composition);
    toolbar.dataset.composerPane = 'arrange';
    shell.append(toolbar);
    const body = el('div', { class: 'composer-body' });
    const palette = renderPalette(runtime, composition);
    palette.dataset.composerPane = 'goal';
    const arrangement = displayMode === 'list'
      ? renderOrderedList(runtime, composition)
      : renderCanvas(runtime, composition);
    arrangement.dataset.composerPane = 'arrange';
    body.append(palette, arrangement);
    shell.append(body);
    const readiness = renderReadiness(runtime, composition);
    readiness.dataset.composerPane = 'review';
    shell.append(readiness);
    return shell;
  }

  function renderToolbar(runtime, composition) {
    const title = el('input', {
      value: composition.title,
      'aria-label': 'Composition name',
      maxlength: '120'
    });
    const productionSelect = el('select', { 'aria-label': 'Attach composition to a Production' }, [
      el('option', { value: '', text: 'Not attached to a Production', selected: !composition.productionId }),
      ...runtime.productions.map(item => el('option', {
        value: item.id,
        text: `${samplePrefix(item)}${item.title}`,
        selected: item.id === composition.productionId
      }))
    ]);
    productionSelect.addEventListener('change', () => attachToProduction(productionSelect.value));
    return el('section', { class: 'composer-toolbar', 'aria-label': 'Composition controls' }, [
      el('div', { class: 'composer-name-controls' }, [
        title,
        button('Rename', 'secondary-button', () => commitMutation(
          runtimeValue => renameProductionComposition(runtimeValue, composition.id, title.value),
          'Composition renamed'
        )),
        productionSelect,
        button('Start a blank Production', 'secondary-button', createAndAttachProduction)
      ]),
      el('div', { class: 'composer-edit-controls' }, [
        button('Undo', 'ghost-button', () => undo(composition), undoStack.length === 0),
        button('Redo', 'ghost-button', () => redo(composition), redoStack.length === 0),
        button('Zoom out', 'ghost-button', () => { zoom = Math.max(0.65, zoom - 0.1); render(); }),
        el('output', { class: 'composer-zoom', 'aria-live': 'polite', text: `${Math.round(zoom * 100)}%` }),
        button('Zoom in', 'ghost-button', () => { zoom = Math.min(1.4, zoom + 0.1); render(); }),
        button('Fit', 'ghost-button', () => { zoom = 1; render(); }),
        button(displayMode === 'canvas' ? 'Ordered-list view' : 'Canvas view', 'secondary-button', () => {
          displayMode = displayMode === 'canvas' ? 'list' : 'canvas';
          render();
        })
      ]),
      el('div', { class: 'composer-save-controls' }, [
        button('Save', 'primary-button', () => {
          setRuntime(clone(runtimeNow()));
          toast('Composition saved', `${composition.id}@${composition.revision} is stored in this browser.`);
        }),
        button('Reload', 'secondary-button', async () => {
          if (reloadRuntime) {
            const reloaded = await reloadRuntime();
            setRuntime(reloaded);
          }
          undoStack = [];
          redoStack = [];
          toast('Composition reloaded', 'The latest durable browser state is shown.');
          render();
        }),
        button('Duplicate', 'secondary-button', () => {
          const result = duplicateProductionComposition(runtimeNow(), composition.id);
          if (result.denied) return;
          setRuntime(result.runtime);
          compositionId = result.composition.id;
          undoStack = [];
          redoStack = [];
          toast('Composition duplicated', 'The copy is independent and not attached to a Production.');
          render();
        }),
        button('Export', 'secondary-button', () => exportComposition(composition))
      ])
    ]);
  }

  function renderPalette(runtime, composition) {
    const items = paletteItems(runtime, paletteRecords, composition);
    const categories = [...new Set(items.map(item => item.category))];
    const query = paletteQuery.trim().toLowerCase();
    const visible = items.filter(item => (
      (paletteCategory === 'all' || item.category === paletteCategory)
      && (!query || `${item.label} ${item.description} ${item.ref.id}`.toLowerCase().includes(query))
    ));
    const search = el('input', {
      type: 'search',
      value: paletteQuery,
      placeholder: 'Search Box, people, Places…',
      'aria-label': 'Search Composer palette'
    });
    search.addEventListener('input', () => {
      paletteQuery = search.value;
      render();
      root.querySelector('[aria-label="Search Composer palette"]')?.focus();
    });
    const category = el('select', { 'aria-label': 'Filter Composer palette' }, [
      el('option', { value: 'all', text: 'Everything', selected: paletteCategory === 'all' }),
      ...categories.map(value => el('option', {
        value,
        text: categoryLabel(value),
        selected: value === paletteCategory
      }))
    ]);
    category.addEventListener('change', () => {
      paletteCategory = category.value;
      render();
    });
    return el('aside', { class: 'composer-palette', 'aria-label': 'Composer palette' }, [
      el('div', { class: 'composer-palette-heading' }, [
        el('p', { class: 'eyebrow', text: 'YOUR PALETTE' }),
        el('h2', { text: 'Add what you need' }),
        el('p', { text: 'Drag an item into a lane, or choose a lane and activate Add.' })
      ]),
      search,
      category,
      el('div', { class: 'composer-palette-list' }, visible.length
        ? visible.map(item => renderPaletteItem(item))
        : [el('p', { class: 'empty-state', text: 'No matching objects.' })])
    ]);
  }

  function renderPaletteItem(item) {
    let activationMode = 'keyboard';
    const lane = el('select', { 'aria-label': `Choose a lane for ${item.label}` },
      COMPOSER_LANES.map(value => el('option', {
        value: value.id,
        text: value.title,
        selected: value.id === item.defaultLane
      }))
    );
    const add = button('Add', 'ghost-button', () => {
      addPaletteItem(item, lane.value, activationMode);
      activationMode = 'keyboard';
    });
    add.addEventListener('pointerdown', event => {
      activationMode = event.pointerType === 'touch' ? 'touch' : 'keyboard';
    });
    add.addEventListener('keydown', () => {
      activationMode = 'keyboard';
    });
    return el('article', {
      class: `composer-palette-item availability-${item.availability.state}`,
      draggable: 'true',
      dataset: { paletteId: item.key },
      ondragstart: event => {
        event.dataTransfer.setData('application/x-gummy-composer-palette', item.key);
        event.dataTransfer.effectAllowed = 'copy';
      }
    }, [
      el('span', { class: 'eyebrow', text: `${categoryLabel(item.category)} · ${item.availability.state}` }),
      el('strong', { text: item.label }),
      el('small', { text: item.description }),
      item.isSample ? el('span', { class: 'tag sample-tag', text: 'Sample / Local example' }) : null,
      item.availability.state !== 'available'
        ? el('p', { class: 'boundary-note compact', text: item.availability.reason })
        : null,
      el('div', { class: 'composer-palette-action' }, [lane, add])
    ]);
  }

  function renderCanvas(runtime, composition) {
    const items = paletteItems(runtime, paletteRecords, composition);
    const canvas = el('section', {
      class: 'composer-canvas',
      'aria-label': `${composition.title} visual canvas`,
      dataset: { testid: 'composer-canvas', compositionId: composition.id }
    });
    canvas.style.setProperty('--composer-zoom', String(zoom));
    const lanes = el('div', { class: 'composer-lanes' });
    for (const lane of COMPOSER_LANES) {
      const nodes = composition.nodes
        .filter(node => node.lane === lane.id)
        .sort((left, right) => left.position.order - right.position.order);
      const region = el('section', {
        class: 'composer-lane',
        'aria-label': `${lane.title}: ${lane.prompt}`,
        dataset: { lane: lane.id },
        ondragover: event => {
          event.preventDefault();
          event.dataTransfer.dropEffect = event.dataTransfer.types.includes('application/x-gummy-composer-palette') ? 'copy' : 'move';
        },
        ondrop: event => {
          event.preventDefault();
          const paletteId = event.dataTransfer.getData('application/x-gummy-composer-palette');
          const nodeId = event.dataTransfer.getData('application/x-gummy-composition-node');
          if (paletteId) {
            const item = items.find(value => value.key === paletteId);
            if (item) addPaletteItem(item, lane.id, 'pointer');
          } else if (nodeId) {
            moveNode(nodeId, lane.id, 'pointer');
          }
        }
      }, [
        el('header', {}, [
          el('span', { class: 'eyebrow', text: lane.title }),
          el('h2', { text: lane.prompt }),
          el('p', { text: lane.description })
        ])
      ]);
      const stack = el('div', { class: 'composer-node-stack' });
      for (const node of nodes) stack.append(renderNode(runtime, composition, node));
      if (!nodes.length) stack.append(el('p', { class: 'composer-drop-hint', text: 'Drop or add an object here.' }));
      region.append(stack);
      lanes.append(region);
    }
    canvas.append(lanes, renderEdges(composition));
    return canvas;
  }

  function renderNode(runtime, composition, node) {
    const details = canonicalDetails(runtime, node.ref);
    const card = el('article', {
      class: `composer-node availability-${node.availability.state} ${connectionSourceId === node.id ? 'is-connecting' : ''}`,
      draggable: 'true',
      dataset: {
        nodeId: node.id,
        refKind: node.ref.kind,
        refId: node.ref.id
      },
      ondragstart: event => {
        event.dataTransfer.setData('application/x-gummy-composition-node', node.id);
        event.dataTransfer.effectAllowed = 'move';
      },
      ondragover: event => {
        if (!event.dataTransfer.types.includes('application/x-gummy-composition-node')) return;
        event.preventDefault();
      },
      ondrop: event => {
        const sourceNodeId = event.dataTransfer.getData('application/x-gummy-composition-node');
        if (!sourceNodeId || sourceNodeId === node.id) return;
        event.preventDefault();
        event.stopPropagation();
        connectNodes(sourceNodeId, node.id, 'pointer');
      }
    }, [
      el('div', { class: 'composer-node-heading' }, [
        el('span', { class: 'eyebrow', text: humanKind(node.ref.kind) }),
        el('span', { class: `status ${node.availability.state !== 'available' ? 'review' : ''}`, text: node.availability.state })
      ]),
      el('strong', { text: node.label }),
      el('p', { text: node.description }),
      node.optional ? el('span', { class: 'tag', text: 'Optional' }) : null,
      node.availability.state !== 'available'
        ? el('p', { class: 'boundary-note compact', text: node.availability.reason })
        : null,
      el('div', { class: 'composer-node-actions' }, [
        button('Open', 'ghost-button inline-action', () => openNode(node.ref)),
        button(connectionSourceId === node.id ? 'Cancel connection' : 'Connect from here', 'ghost-button inline-action', () => {
          connectionSourceId = connectionSourceId === node.id ? null : node.id;
          render();
        }),
        connectionSourceId && connectionSourceId !== node.id
          ? accessibleProposalButton('Connect here', mode => {
              connectNodes(connectionSourceId, node.id, mode);
              connectionSourceId = null;
            })
          : null,
        button('Earlier', 'ghost-button inline-action', () => commitMutation(
          value => moveCompositionNode(value, composition.id, node.id, 'before')
        )),
        button('Later', 'ghost-button inline-action', () => commitMutation(
          value => moveCompositionNode(value, composition.id, node.id, 'after')
        )),
        button('Duplicate', 'ghost-button inline-action', () => commitMutation(
          value => duplicateCompositionNode(value, composition.id, node.id)
        )),
        button('Remove', 'ghost-button inline-action danger-action', () => commitMutation(
          value => removeCompositionNode(value, composition.id, node.id)
        ))
      ]),
      el('details', { class: 'composer-system-details' }, [
        el('summary', { text: 'Show system details' }),
        el('dl', { class: 'facts' }, [
          el('dt', { text: 'Canonical object' }),
          el('dd', { text: `${node.ref.kind}: ${node.ref.id}` }),
          el('dt', { text: 'Revision' }),
          el('dd', { text: node.ref.revision || details.revision || 'not revisioned' }),
          el('dt', { text: 'Hash' }),
          el('dd', { text: node.ref.hash || details.hash || 'not content-addressed' }),
          el('dt', { text: 'Composition node' }),
          el('dd', { text: node.id }),
          el('dt', { text: 'Position' }),
          el('dd', { text: `${node.lane} · order ${node.position.order}` }),
          el('dt', { text: 'Authority / locality' }),
          el('dd', { text: details.authority })
        ])
      ])
    ]);
    return card;
  }

  function renderEdges(composition) {
    if (!composition.edges.length) return el('section', { class: 'composer-connections' }, [
      el('h2', { text: 'Connections' }),
      el('p', { class: 'empty-state', text: 'No typed connections yet. Drag one canvas card onto another, or use Connect from here.' })
    ]);
    return el('section', { class: 'composer-connections', 'aria-label': 'Typed composition connections' }, [
      el('h2', { text: 'Connections' }),
      ...composition.edges.map(edge => {
        const from = composition.nodes.find(node => node.id === edge.fromNodeId);
        const to = composition.nodes.find(node => node.id === edge.toNodeId);
        return el('article', { class: 'composer-edge' }, [
          el('div', {}, [
            el('strong', { text: `${from?.label || 'Missing source'} → ${to?.label || 'Missing destination'}` }),
            el('span', { class: 'tag', text: edge.optional ? 'Optional branch' : edge.edgeType })
          ]),
          el('div', { class: 'button-row' }, [
            button(edge.optional ? 'Make required' : 'Make optional', 'ghost-button inline-action', () => commitMutation(
              runtime => toggleCompositionBranch(runtime, composition.id, edge.id)
            )),
            button('Disconnect', 'ghost-button inline-action danger-action', () => commitMutation(
              runtime => disconnectCompositionEdge(runtime, composition.id, edge.id)
            ))
          ]),
          el('details', {}, [
            el('summary', { text: 'Show connection details' }),
            el('dl', { class: 'facts' }, [
              el('dt', { text: 'Typed edge' }), el('dd', { text: `${edge.edgeType} · ${edge.id}` }),
              el('dt', { text: 'Data classes' }), el('dd', { text: edge.dataClasses.join(', ') || 'none' }),
              el('dt', { text: 'Authority and approval' }), el('dd', { text: edge.approvalRule }),
              el('dt', { text: 'Source proposal' }), el('dd', { text: edge.sourceIntentId || 'Imported from the current Actor Plan' })
            ])
          ])
        ]);
      })
    ]);
  }

  function renderOrderedList(runtime, composition) {
    return el('section', {
      class: 'composer-ordered',
      'aria-label': `${composition.title} accessible ordered-list view`,
      dataset: { testid: 'composer-ordered-list' }
    }, [
      el('p', { class: 'boundary-note', text: 'This list contains the same objects and typed proposals as the visual canvas. Every drag action has an equivalent button.' }),
      ...COMPOSER_LANES.map(lane => {
        const nodes = composition.nodes
          .filter(node => node.lane === lane.id)
          .sort((left, right) => left.position.order - right.position.order);
        return el('section', { class: 'composer-ordered-lane' }, [
          el('h2', { text: `${lane.title} — ${lane.prompt}` }),
          el('ol', {}, nodes.length
            ? nodes.map(node => el('li', {}, [renderNode(runtime, composition, node)]))
            : [el('li', { class: 'empty-state', text: 'Nothing added.' })])
        ]);
      }),
      renderEdges(composition)
    ]);
  }

  function renderReadiness(runtime, composition) {
    const production = runtime.productions.find(item => item.id === composition.productionId);
    const blockers = composition.readiness.blockers || [];
    const warnings = composition.readiness.warnings || [];
    return el('section', { class: 'composer-readiness', dataset: { testid: 'composer-readiness' } }, [
      el('div', {}, [
        el('p', { class: 'eyebrow', text: 'REVIEW THE CONSEQUENCES' }),
        el('h2', { text: readinessTitle(composition.readiness.state) }),
        el('p', {
          text: production
            ? `Applying this view can revise ${production.title} configuration and its editable Actor Plan. It cannot start work.`
            : 'Attach this composition to a Production before applying it to typed Production configuration.'
        })
      ]),
      blockers.length
        ? el('div', { class: 'composer-validation blocker-list' }, [
            el('strong', { text: 'Needs your attention' }),
            ...blockers.map(item => el('p', { text: item }))
          ])
        : el('p', { class: 'status', text: 'The visible composition has the required Human-facing regions.' }),
      warnings.length
        ? el('details', {}, [
            el('summary', { text: `${warnings.length} planned or unavailable choice${warnings.length === 1 ? '' : 's'}` }),
            ...warnings.map(item => el('p', { text: item }))
          ])
        : null,
      el('div', { class: 'button-row' }, [
        production
          ? button('Apply as Production proposal', 'primary-button', () => {
              const result = applyProductionComposition(runtimeNow(), composition.id);
              if (result.denied) {
                toast('Composition could not be applied', result.reason);
                return;
              }
              setRuntime(result.runtime);
              toast('Production proposal applied', `Actor Plan ${result.plan.id}@${result.plan.revision} was revised. Execution inventory remained unchanged: ${String(result.executionInventoryUnchanged)}.`);
              render();
            })
          : button('Start and attach a blank Production', 'primary-button', createAndAttachProduction),
        production ? button('Review compiled plan', 'secondary-button', () => openProduction(production.id, 'plan')) : null,
        production ? button('Open Master Control', 'secondary-button', () => openMasterControl(production.id)) : null,
        production ? button('Open the full Production', 'secondary-button', () => openProduction(production.id)) : null
      ]),
      composition.linkedActorPlan
        ? el('details', {
            class: 'composer-system-details',
            dataset: {
              testid: 'composer-applied-evidence',
              actorPlanId: composition.linkedActorPlan.id,
              actorPlanRevision: composition.linkedActorPlan.revision
            }
          }, [
            el('summary', { text: 'Show applied system evidence' }),
            el('p', { text: `Composition ${composition.id}@${composition.revision}` }),
            el('p', { text: `Actor Plan ${composition.linkedActorPlan.id}@${composition.linkedActorPlan.revision}` }),
            el('p', { text: `Applied ${composition.appliedAt}. No Run, Lease, Grant, provider call, charge, publication, or acceptance was created.` })
          ])
        : null,
      el('p', { class: 'boundary-note', text: 'There is no execute button in Composer. Make Production remains the sole Production-wide execution transition in the governed Production review.' })
    ]);
  }

  function renderProposal(runtime) {
    const intent = runtime.dragIntents.find(item => item.id === pendingProposal.intentId);
    if (!intent) return null;
    return el('section', {
      class: 'modal-card composer-proposal',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Composer proposal preview'
    }, [
      el('p', { class: 'eyebrow', text: 'VISIBLE PROPOSAL · NO EXECUTION' }),
      el('h2', { text: pendingProposal.plainSummary }),
      el('p', { text: 'Accepting changes only this editable composition. It gives no ambient authority and cannot mutate a frozen Run.' }),
      el('dl', { class: 'facts' }, [
        el('dt', { text: 'From' }), el('dd', { text: `${intent.source.kind}: ${intent.source.id}` }),
        el('dt', { text: 'To' }), el('dd', { text: `${intent.target.kind}: ${intent.target.id}` }),
        el('dt', { text: 'Input equivalent' }), el('dd', { text: intent.inputMode }),
        el('dt', { text: 'Starts work' }), el('dd', { text: 'No' })
      ]),
      el('details', {}, [
        el('summary', { text: 'Show typed intent details' }),
        el('p', { text: `${intent.id} · ${intent.proposedRelation}` }),
        el('p', { text: `Data classes: ${intent.dataClasses.join(', ')}` }),
        el('p', { text: `Approval required: ${String(intent.approvalRequired)} · Grants authority: ${String(intent.grantsAuthority)}` })
      ]),
      el('div', { class: 'modal-actions' }, [
        button('Cancel', 'secondary-button', () => {
          pendingProposal = null;
          render();
        }),
        button('Accept proposal', 'primary-button', acceptProposal)
      ])
    ]);
  }

  function undo(composition) {
    const snapshot = undoStack.pop();
    if (!snapshot) return;
    redoStack.push(clone(composition));
    const result = replaceCompositionFromSnapshot(runtimeNow(), composition.id, snapshot);
    setRuntime(result.runtime);
    toast('Composition edit undone', 'The prior visible proposal was restored. Nothing ran.');
    render();
  }

  function redo(composition) {
    const snapshot = redoStack.pop();
    if (!snapshot) return;
    undoStack.push(clone(composition));
    const result = replaceCompositionFromSnapshot(runtimeNow(), composition.id, snapshot);
    setRuntime(result.runtime);
    toast('Composition edit redone', 'The visible proposal was restored. Nothing ran.');
    render();
  }

  function openNode(ref) {
    if (ref.kind === 'actor') return openActorSurface(ref.id, compositionNow(runtimeNow())?.productionId || null);
    if (ref.kind === 'production') return openProduction(ref.id);
    if (ref.kind === 'review-gate') {
      const current = compositionNow(runtimeNow());
      return current?.productionId ? openMasterControl(current.productionId) : openCanonicalRef(ref);
    }
    return openCanonicalRef(ref);
  }

  render();
  return { node: root, refresh: render };
}

function paletteItems(runtime, records, composition) {
  const items = [];
  for (const gummy of runtime.gummies || []) {
    items.push({
      key: `gummy:${gummy.id}`,
      category: 'box',
      label: gummy.name || gummy.title || gummy.id,
      description: gummy.kind === 'result'
        ? 'A Production result in your Local Gummy Box.'
        : 'A source in your Local Gummy Box.',
      ref: {
        kind: 'gummy',
        id: gummy.id,
        revision: String(gummy.revision),
        hash: typeof gummy.hash === 'string' ? gummy.hash : gummy.hash?.value || null
      },
      defaultLane: 'inputs',
      availability: { state: 'available', reason: 'Stored in this browser.' },
      isSample: gummy.id.includes('night-gummy') || gummy.id.includes('phase16')
    });
  }
  for (const actor of runtime.actors || []) {
    items.push({
      key: `actor:${actor.id}`,
      category: 'people',
      label: actor.name,
      description: actor.kind === 'person'
        ? `${actor.role || 'Human participant'} · presence and authority remain explicit.`
        : `${actor.role || 'Service Actor'} · open to inspect or configure.`,
      ref: { kind: 'actor', id: actor.id, revision: null, hash: null },
      defaultLane: 'people-tools',
      availability: { state: 'available', reason: 'Available to configure in this browser.' },
      isSample: ['actor:zeke', 'actor:yuki', 'actor:maren'].includes(actor.id)
    });
  }
  for (const bowl of records.bowls || []) {
    items.push({
      key: `group:${bowl.id}`,
      category: 'groups',
      label: bowl.name || 'Saved group',
      description: `${bowl.members?.length || 0} people and Actors · add individual participants from People & tools.`,
      ref: { kind: 'shared-vision', id: bowl.id, revision: String(bowl.revision || 1), hash: bowl.hash || null },
      defaultLane: 'people-tools',
      availability: { state: 'available', reason: 'Saved privately in this browser.' },
      isSample: true
    });
  }
  for (const place of PHASE14_PLACES) {
    const connected = place.id !== 'app:gummy-radio' && place.id !== 'app:gummy-channels';
    items.push({
      key: `place:${place.id}`,
      category: 'places',
      label: place.name,
      description: place.doctrine,
      ref: { kind: 'place', id: place.id, revision: null, hash: null },
      defaultLane: place.id === 'app:gummy-worlds' ? 'people-tools' : 'destinations',
      availability: connected
        ? { state: 'available', reason: 'Available as a local Gummy Place.' }
        : { state: 'planned', reason: 'The remote service is not connected. This may be arranged as a visible plan but cannot execute.' },
      isSample: false
    });
  }
  for (const production of runtime.productions || []) {
    items.push({
      key: `production:${production.id}`,
      category: 'productions',
      label: production.title,
      description: 'An existing undertaking. Link it as an input or destination without duplicating it.',
      ref: { kind: 'production', id: production.id, revision: String(production.revision), hash: null },
      defaultLane: 'inputs',
      availability: { state: 'available', reason: 'Available in this browser.' },
      isSample: Boolean(production.id.includes('night-gummy') || production.id.includes('cyberpunk'))
    });
  }
  for (const vision of records.sharedVisions || []) {
    items.push({
      key: `vision:${vision.id}`,
      category: 'ideas',
      label: vision.goal || vision.title || 'Saved idea',
      description: vision.intent || 'A Shared Vision with selected, versioned source context.',
      ref: {
        kind: 'shared-vision',
        id: vision.id,
        revision: String(vision.revision),
        hash: vision.hash || vision.provenanceHash || null
      },
      defaultLane: 'inputs',
      availability: { state: 'available', reason: 'Saved privately in this browser.' },
      isSample: true
    });
  }
  items.push(
    {
      key: 'gate:human-acceptance',
      category: 'review',
      label: 'Human reviews the result',
      description: 'Completion is not acceptance. The Human chooses a role for an exact result revision.',
      ref: { kind: 'review-gate', id: 'review-gate:human-acceptance', revision: null, hash: null },
      defaultLane: 'review-approval',
      availability: { state: 'available', reason: 'Available through existing Human acceptance.' }
    },
    {
      key: 'gate:master-control',
      category: 'review',
      label: 'Master Control approval',
      description: 'Review exact scope, routes, cost limits, authority, and revocation before work.',
      ref: { kind: 'review-gate', id: 'review-gate:master-control', revision: null, hash: null },
      defaultLane: 'review-approval',
      availability: { state: 'available', reason: 'Available through existing Master Control.' }
    },
    destinationItem('gummy-box', 'Keep in Gummy Box', 'Keep the accepted result private in this browser.', 'available'),
    destinationItem('private-export', 'Keep private / export', 'Prepare a bounded private browser export.', 'available'),
    destinationItem('radio', 'Prepare for Radio', 'Prepare an exact Distribution Plan for Radio.', 'planned'),
    destinationItem('channels', 'Prepare for Channels', 'Prepare an exact Distribution Plan for Channels.', 'planned')
  );
  for (const saved of runtime.compositions || []) {
    if (saved.id === composition?.id) continue;
    items.push({
      key: `composition:${saved.id}`,
      category: 'templates',
      label: saved.title,
      description: `Reusable saved composition · revision ${saved.revision}.`,
      ref: { kind: 'composition', id: saved.id, revision: saved.revision, hash: null },
      defaultLane: 'inputs',
      availability: saved.productionId
        ? { state: 'available', reason: 'Saved and linked to a Production.' }
        : { state: 'planned', reason: 'Saved template is not attached to a Production.' }
    });
  }
  return items;
}

function destinationItem(id, label, description, state) {
  return {
    key: `destination:${id}`,
    category: 'destinations',
    label,
    description,
    ref: { kind: 'destination', id: `destination:${id}`, revision: null, hash: null },
    defaultLane: 'destinations',
    availability: state === 'available'
      ? { state, reason: 'Available through a bounded local action.' }
      : { state, reason: 'The service is not connected. This planned destination cannot execute.' }
  };
}

function accessibleProposalButton(label, action) {
  let mode = 'keyboard';
  const node = button(label, 'primary-button inline-action', () => {
    action(mode);
    mode = 'keyboard';
  });
  node.addEventListener('pointerdown', event => {
    mode = event.pointerType === 'touch' ? 'touch' : 'keyboard';
  });
  node.addEventListener('keydown', () => {
    mode = 'keyboard';
  });
  return node;
}

function exportComposition(composition) {
  const blob = new Blob([`${JSON.stringify(composition, null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${composition.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'composition'}.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function inferEdgeType(composition, fromNodeId, toNodeId) {
  const from = composition?.nodes.find(item => item.id === fromNodeId);
  const to = composition?.nodes.find(item => item.id === toNodeId);
  if (to?.lane === 'review-approval') return 'review';
  if (to?.lane === 'destinations') return to.ref.id.includes('box') ? 'storage' : 'publication';
  if (from?.lane === 'inputs') return 'input';
  if (from?.lane === 'people-tools' && to?.lane === 'steps-connections') return 'execution';
  return 'context';
}

function canonicalDetails(runtime, ref) {
  let record = null;
  if (ref.kind === 'actor') record = runtime.actors.find(item => item.id === ref.id);
  if (ref.kind === 'gummy') record = runtime.gummies.find(item => item.id === ref.id);
  if (ref.kind === 'production') record = runtime.productions.find(item => item.id === ref.id);
  return {
    revision: record?.revision ? String(record.revision) : null,
    hash: typeof record?.hash === 'string' ? record.hash : record?.hash?.value || null,
    authority: record?.authoritativeLocation
      || record?.locality
      || (ref.kind === 'gummy' ? "This browser's Local Gummy Box" : 'Linked canonical record; no authority granted by the canvas')
  };
}

function humanKind(kind) {
  return {
    actor: 'Person or tool',
    gummy: 'Gummy Box object',
    place: 'Place',
    production: 'Production',
    composition: 'Saved composition',
    'shared-vision': 'Saved idea',
    'review-gate': 'Review choice',
    destination: 'Destination'
  }[kind] || kind;
}

function categoryLabel(category) {
  return {
    box: 'Gummy Box',
    people: 'People & tools',
    groups: 'Saved groups',
    places: 'Places & apps',
    productions: 'Productions',
    ideas: 'Saved ideas',
    review: 'Review & approval',
    destinations: 'Destinations',
    templates: 'Saved compositions'
  }[category] || category;
}

function proposalSummary(relation) {
  return {
    'composition-add': 'Add this visible object?',
    'composition-move': 'Move this object to another lane?',
    'composition-connect': 'Connect these objects?'
  }[relation] || 'Change this composition?';
}

function readinessTitle(state) {
  return {
    draft: 'Keep arranging, or attach a Production',
    blocked: 'Some choices need your attention',
    'ready-to-apply': 'Ready to apply as a Production proposal',
    applied: 'Applied to the editable Actor Plan'
  }[state] || state.replaceAll('-', ' ');
}

function samplePrefix(production) {
  return production.id.includes('night-gummy') || production.id.includes('cyberpunk')
    ? 'Sample · '
    : '';
}
