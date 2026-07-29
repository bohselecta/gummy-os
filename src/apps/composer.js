import '../styles/market-advantage.css';
import { createComposerApp as createBaseComposerApp } from './composer-base.js';
import {
  COMPOSITION_STARTERS,
  addCompositionReference,
  addRecommendedCompositionElement,
  analyzeProductionComposition,
  applyCompositionStarter,
  updateProductionCompositionBrief
} from '../core/production-composition.js';

const clone = value => structuredClone(value);

function h(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (['checked', 'disabled', 'hidden', 'open'].includes(key)) node[key] = value;
    else node.setAttribute(key, String(value));
  }
  for (const child of Array.isArray(children) ? children : [children]) {
    if (child == null) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

function button(label, onclick, className = 'button', props = {}) {
  return h('button', { type: 'button', class: className, onclick, ...props }, label);
}

function field(label, control, hint = null) {
  return h('label', { class: 'field composer-brief-field' }, [
    h('span', { text: label }),
    control,
    hint ? h('small', { text: hint }) : null
  ]);
}

function currentComposition(root, runtime) {
  const canvasId = root.querySelector('[data-composition-id]')?.dataset.compositionId;
  const selectedId = root.querySelector('[aria-label="Choose a saved composition"]')?.value;
  const id = canvasId || selectedId || (runtime.compositions || []).at(-1)?.id;
  return (runtime.compositions || []).find(item => item.id === id) || null;
}

function ensureVisibleComposition(root) {
  const create = [...root.querySelectorAll('button')].find(node => node.textContent.trim() === 'Create a blank composition');
  create?.click();
}

function laneForReference(reference) {
  return reference.lane || ({
    gummy: 'inputs',
    production: 'inputs',
    'shared-vision': 'inputs',
    actor: 'people-tools',
    place: 'people-tools',
    'review-gate': 'review-approval',
    destination: 'destinations'
  }[reference.kind] || 'steps-connections');
}

export function createComposerApp(options) {
  const base = createBaseComposerApp(options);
  const root = base.node;
  let enhancing = false;

  const runtimeNow = () => options.store.getState().productionRuntime;
  const setRuntime = runtime => options.store.setState(current => ({ ...current, productionRuntime: runtime }));
  const toast = (title, detail) => options.toast?.(title, detail);

  function refresh() {
    base.refresh();
    queueMicrotask(enhance);
  }

  function ensureComposition() {
    let current = currentComposition(root, runtimeNow());
    if (current) return current;
    ensureVisibleComposition(root);
    current = currentComposition(root, runtimeNow());
    return current;
  }

  function applyStarter(starterId) {
    const current = ensureComposition();
    const result = applyCompositionStarter(runtimeNow(), {
      compositionId: current?.id || null,
      starterId
    });
    if (result.denied) {
      toast('Pattern could not be applied', result.reason);
      return;
    }
    setRuntime(result.runtime);
    toast('Pattern added', `${result.starter.title} is now an editable proposal. Nothing ran.`);
    refresh();
  }

  function saveBrief(composition, controls) {
    const result = updateProductionCompositionBrief(runtimeNow(), composition.id, {
      goal: controls.goal.value,
      audience: controls.audience.value,
      successCriteria: controls.success.value,
      constraints: controls.constraints.value,
      starterId: composition.brief?.starterId || null
    });
    if (result.denied) {
      toast('Brief could not be saved', result.reason);
      return;
    }
    setRuntime(result.runtime);
    toast('Composer brief saved', 'The goal changed; no work, spending, authority, or publication started.');
    refresh();
  }

  function addRecommended(composition, recommendationId) {
    if (recommendationId === 'define-goal') {
      root.querySelector('[data-testid="composer-brief"] input[name="composer-goal"]')?.focus();
      return;
    }
    if (recommendationId === 'inspect-planned') {
      root.querySelector('.composer-connections')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const result = addRecommendedCompositionElement(runtimeNow(), composition.id, recommendationId);
    if (result.denied) {
      toast('Nothing was added', result.reason === 'recommendation-not-actionable'
        ? 'Choose the object directly from your palette.'
        : result.reason);
      return;
    }
    setRuntime(result.runtime);
    toast('Choice added', 'The visible proposal changed. Nothing ran.');
    refresh();
  }

  function addExternalReference(reference, lane = null) {
    const current = ensureComposition();
    if (!current) {
      toast('Open a composition first', 'Create a blank composition, then add the object.');
      return;
    }
    const result = addCompositionReference(runtimeNow(), current.id, {
      ...clone(reference),
      lane: lane || laneForReference(reference)
    });
    if (result.denied) {
      toast('Object could not be added', result.reason);
      return;
    }
    setRuntime(result.runtime);
    toast('Added to Composer', `${reference.label || reference.id} was linked as a visible proposal. Nothing ran.`);
    refresh();
  }

  function renderBrief(composition) {
    const brief = composition?.brief || {};
    const controls = {
      goal: h('input', {
        name: 'composer-goal',
        value: brief.goal || '',
        placeholder: 'What should exist when this is successful?'
      }),
      audience: h('input', {
        value: brief.audience || '',
        placeholder: 'Who is this for?'
      }),
      success: h('textarea', {
        rows: '2',
        placeholder: 'How will you know the result is good enough?'
      }, brief.successCriteria || ''),
      constraints: h('textarea', {
        rows: '2',
        placeholder: 'What must not change, happen, or leave this workspace?'
      }, brief.constraints || '')
    };
    const panel = h('details', {
      class: 'composer-brief market-card',
      open: localStorage.getItem(`gummy:composer-panel:goal:${composition.id}`) !== 'closed',
      dataset: { testid: 'composer-brief', composerPane: 'goal' }
    }, [
      h('summary', { text: brief.goal ? 'Goal · defined' : 'Goal · describe what you want to make' }),
      h('div', { class: 'market-card-heading' }, [
        h('div', {}, [
          h('p', { class: 'eyebrow', text: 'START WITH THE RESULT' }),
          h('h2', { text: 'Describe what you want to make' }),
          h('p', { text: 'This brief belongs to the composition. It helps people and Agents understand the goal without granting them authority.' })
        ]),
        h('span', { class: 'status', text: brief.goal ? 'Goal defined' : 'Optional but powerful' })
      ]),
      h('div', { class: 'composer-brief-grid' }, [
        field('Desired result', controls.goal, 'A concrete outcome, not an instruction to obey.'),
        field('Audience', controls.audience, 'Private, named collaborators, or an eventual public audience.'),
        field('Success looks like', controls.success),
        field('Boundaries and constraints', controls.constraints)
      ]),
      button('Save the brief', () => saveBrief(composition, controls), 'button primary')
    ]);
    panel.addEventListener('toggle', () => localStorage.setItem(
      `gummy:composer-panel:goal:${composition.id}`,
      panel.open ? 'open' : 'closed'
    ));
    return panel;
  }

  function renderStarters(composition) {
    const empty = !composition || composition.nodes.length === 0;
    return h('details', {
      class: 'composer-starters market-card',
      open: empty,
      dataset: { testid: 'composer-starters', composerPane: empty ? 'goal' : 'arrange' }
    }, [
      h('summary', { text: empty ? 'Start from a useful pattern' : 'Add or compare a starting pattern' }),
      h('p', { text: 'Patterns add visible objects and typed connections. You remain free to move, remove, reconnect, duplicate, or ignore every part.' }),
      h('div', { class: 'composer-starter-grid' }, COMPOSITION_STARTERS.map(starter => h('article', { class: 'composer-starter-card' }, [
        h('strong', { text: starter.title }),
        h('p', { text: starter.description }),
        button('Use this pattern', () => applyStarter(starter.id), 'button')
      ])))
    ]);
  }

  function renderImpact(composition, runtime) {
    if (!composition) return null;
    const analysis = analyzeProductionComposition(composition, runtime);
    const panel = h('details', {
      class: 'composer-impact market-card',
      open: localStorage.getItem(`gummy:composer-panel:review:${composition.id}`) !== 'closed',
      dataset: { testid: 'composer-impact', composerPane: 'review' }
    }, [
      h('summary', { text: 'Review · what this composition currently means' }),
      h('div', { class: 'market-card-heading' }, [
        h('div', {}, [
          h('p', { class: 'eyebrow', text: 'UNDERSTAND BEFORE YOU ACT' }),
          h('h2', { text: 'What this composition currently means' }),
          h('p', { text: 'A readable impact map over the same canonical objects, edges, permissions, and readiness evidence.' })
        ]),
        h('span', { class: `status ${analysis.readyToApply ? '' : 'review'}`, text: analysis.readyToApply ? 'Ready to propose' : 'Still being shaped' })
      ]),
      h('div', { class: 'composer-impact-metrics' }, [
        metric('Visible objects', analysis.nodeCount),
        metric('Typed connections', analysis.edgeCount),
        metric('Planned connections', analysis.plannedCount),
        metric('Unavailable choices', analysis.unavailableCount)
      ]),
      h('div', { class: 'composer-impact-law' }, [
        h('strong', { text: 'Authority' }),
        h('span', { text: 'Proposal only' }),
        h('strong', { text: 'Execution' }),
        h('span', { text: 'Not started' }),
        h('strong', { text: 'Cost' }),
        h('span', { text: analysis.costState === 'not-estimated' ? 'Not estimated yet' : `Production Pool exists${analysis.costCeiling ? ` · ceiling ${analysis.costCeiling}` : ''}` }),
        h('strong', { text: 'Data classes' }),
        h('span', { text: analysis.dataClasses.length ? analysis.dataClasses.join(', ') : 'No typed transfer yet' })
      ]),
      analysis.nextMoves.length
        ? h('div', { class: 'composer-next-moves' }, [
            h('h3', { text: 'Choices that would make this easier to use' }),
            ...analysis.nextMoves.map(item => h('article', { class: 'composer-next-move' }, [
              h('div', {}, [h('strong', { text: item.title }), h('p', { text: item.detail })]),
              button(item.id === 'inspect-planned' ? 'Inspect' : item.id === 'define-goal' ? 'Define it' : 'Add this', () => addRecommended(composition, item.id), 'button')
            ]))
          ])
        : h('p', { class: 'notice compact-notice', text: 'The composition has an input, people or tools, Human review, and a truthful destination. You can still revise anything.' }),
      h('details', {}, [
        h('summary', { text: 'Show lane counts and canonical readiness' }),
        h('pre', { class: 'json-preview', text: JSON.stringify({
          compositionId: composition.id,
          revision: composition.revision,
          goal: composition.brief?.goal || null,
          lanes: analysis.laneCounts,
          readiness: composition.readiness,
          authority: analysis.authority,
          executionState: analysis.executionState
        }, null, 2) })
      ])
    ]);
    panel.addEventListener('toggle', () => localStorage.setItem(
      `gummy:composer-panel:review:${composition.id}`,
      panel.open ? 'open' : 'closed'
    ));
    return panel;
  }

  function renderSystemDetails(composition) {
    if (!composition) return null;
    return h('details', {
      class: 'composer-system-panel market-card',
      dataset: { composerPane: 'system' }
    }, [
      h('summary', { text: 'System Details · canonical object references' }),
      h('p', { text: `${composition.id}@${composition.revision} · ${composition.nodes.length} nodes · ${composition.edges.length} typed connections` }),
      h('p', { text: `Production: ${composition.productionId || 'not attached'} · execution: not started · authority: proposal only` }),
      h('p', { class: 'boundary-note compact', text: 'These details expose the same canonical objects; they do not create a second model or hidden execution path.' })
    ]);
  }

  function metric(label, value) {
    return h('article', { class: 'metric-card' }, [h('strong', { text: String(value) }), h('span', { text: label })]);
  }

  function enhance() {
    if (enhancing || root.querySelector('[data-market-layer="composer"]')) return;
    enhancing = true;
    try {
      const runtime = runtimeNow();
      const composition = currentComposition(root, runtime);
      const layer = h('div', {
        class: 'composer-market-layer',
        dataset: { marketLayer: 'composer' }
      }, [
        composition ? renderBrief(composition) : null,
        renderStarters(composition),
        renderImpact(composition, runtime),
        renderSystemDetails(composition)
      ]);
      const workspace = root.querySelector('.composer-workspace');
      if (workspace) workspace.append(layer);
      else root.append(layer);
    } finally {
      enhancing = false;
    }
  }

  const observer = new MutationObserver(() => queueMicrotask(enhance));
  observer.observe(root, { childList: true, subtree: false });

  root.addEventListener('dragover', event => {
    if (event.dataTransfer?.types?.includes('application/x-gummy-composer-ref')) event.preventDefault();
  }, true);
  root.addEventListener('drop', event => {
    const raw = event.dataTransfer?.getData('application/x-gummy-composer-ref');
    if (!raw) return;
    event.preventDefault();
    event.stopPropagation();
    try {
      const reference = JSON.parse(raw);
      const lane = event.target.closest?.('[data-lane]')?.dataset.lane || null;
      addExternalReference(reference, lane);
    } catch {
      toast('Drop blocked', 'The dragged object did not contain a valid Gummy reference.');
    }
  }, true);

  const externalAdd = event => {
    const reference = event.detail;
    if (reference?.kind && reference?.id) addExternalReference(reference, reference.lane || null);
  };
  window.addEventListener('gummy:composer:add-ref', externalAdd);

  enhance();
  return {
    node: root,
    refresh,
    destroy() {
      observer.disconnect();
      window.removeEventListener('gummy:composer:add-ref', externalAdd);
    }
  };
}
