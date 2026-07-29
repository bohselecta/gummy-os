import '../styles/market-advantage.css';
import { createGummyBoxApp as createBaseGummyBoxApp } from './gummy-box-base.js';

function h(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (['disabled', 'hidden'].includes(key)) node[key] = value;
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

function isResult(gummy) {
  return ['result', 'artifact', 'deliverable'].includes(gummy.kind) || Boolean(gummy.acceptance);
}

function sortRecent(items) {
  return [...items].sort((left, right) => String(right.updatedAt || right.createdAt || '').localeCompare(String(left.updatedAt || left.createdAt || '')));
}

export function createGummyBoxApp(options) {
  const root = createBaseGummyBoxApp(options);
  let enhancing = false;

  function sendToComposer(reference) {
    const opened = options.openComposer?.();
    Promise.resolve(opened).then(() => {
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent('gummy:composer:add-ref', { detail: reference }));
      }, 40);
    });
  }

  function makeComposerSource(card, reference) {
    if (!card || card.dataset.composerSourceReady === 'true') return;
    card.dataset.composerSourceReady = 'true';
    card.classList.add('composer-draggable-source');
    card.draggable = true;
    card.addEventListener('dragstart', event => {
      event.dataTransfer.setData('application/x-gummy-composer-ref', JSON.stringify(reference));
      event.dataTransfer.effectAllowed = 'copy';
    });
    const actions = card.querySelector('.button-row') || h('div', { class: 'button-row' });
    if (!actions.parentNode) card.append(actions);
    actions.append(button('Add in Composer', () => sendToComposer(reference), 'button', {
      'aria-label': `Add ${reference.label || reference.id} in Composer`
    }));
    card.append(h('small', { class: 'composer-drag-hint', text: 'Drag this into an open Composer, or use Add in Composer.' }));
  }

  function decorateGummies() {
    for (const card of root.querySelectorAll('.gummy-box-object[data-gummy-id]')) {
      const gummy = options.gummies.find(item => item.id === card.dataset.gummyId);
      if (!gummy) continue;
      makeComposerSource(card, {
        kind: 'gummy',
        id: gummy.id,
        revision: String(gummy.revision || 1),
        hash: typeof gummy.hash === 'string' ? gummy.hash : gummy.hash?.value || null,
        label: gummy.title || gummy.name || gummy.id,
        description: isResult(gummy)
          ? 'A selected result from the Local Gummy Box.'
          : 'A selected source from the Local Gummy Box.',
        lane: 'inputs',
        availability: { state: gummy.quarantine ? 'planned' : 'available', reason: gummy.quarantine ? 'Quarantined imports remain bounded until reviewed.' : 'Stored in this browser.' }
      });
    }
  }

  function decorateProjects() {
    for (const card of root.querySelectorAll('.gummy-box-project')) {
      const title = card.querySelector('h3')?.textContent?.trim();
      const production = options.runtime.productions.find(item => item.title === title);
      if (!production) continue;
      card.dataset.productionId = production.id;
      makeComposerSource(card, {
        kind: 'production',
        id: production.id,
        revision: String(production.revision || 1),
        hash: null,
        label: production.title,
        description: 'An existing undertaking linked without duplicating its canonical state.',
        lane: 'inputs',
        availability: { state: 'available', reason: 'Available in this browser.' }
      });
    }
  }

  function decorateShared() {
    for (const card of root.querySelectorAll('.gummy-box-object:not([data-gummy-id])')) {
      const title = card.querySelector('h3')?.textContent?.trim();
      const vision = options.sharedVisions.find(item => (item.goal || item.title) === title);
      if (!vision) continue;
      makeComposerSource(card, {
        kind: 'shared-vision',
        id: vision.id,
        revision: String(vision.revision || 1),
        hash: vision.hash || vision.provenanceHash || null,
        label: vision.goal || vision.title,
        description: vision.intent || 'A selected Shared Vision with exact provenance.',
        lane: 'inputs',
        availability: { state: 'available', reason: 'Stored privately in this browser.' }
      });
    }
  }

  function renderHomeLaunchpad() {
    const main = root.querySelector('.gummy-box-main');
    const heading = main?.querySelector('.gummy-box-section-heading');
    if (!main || !heading || main.querySelector('[data-testid="gummy-box-launchpad"]')) return;
    if (heading.querySelector('h2')?.textContent?.trim() !== 'Home') return;

    const sources = options.gummies.filter(item => !isResult(item) && !item.quarantine);
    const results = options.gummies.filter(isResult);
    const quarantined = options.gummies.filter(item => item.quarantine);
    const recentProduction = sortRecent(options.runtime.productions).at(0) || null;
    const recentResult = sortRecent(results).at(0) || null;
    const attention = quarantined.length
      + results.filter(item => !item.acceptance && item.status !== 'accepted').length;

    const launchpad = h('section', {
      class: 'gummy-box-launchpad market-card',
      dataset: { testid: 'gummy-box-launchpad' }
    }, [
      h('div', { class: 'market-card-heading' }, [
        h('div', {}, [
          h('p', { class: 'eyebrow', text: 'YOUR WORKSPACE AT A GLANCE' }),
          h('h2', { text: 'Continue, arrange, or bring something in' }),
          h('p', { text: 'Gummy Box is the durable home. Composer is where you visibly connect sources, people, tools, decisions, and destinations.' })
        ]),
        h('span', {
          class: `status ${attention ? 'review' : ''}`,
          text: attention ? `${attention} item${attention === 1 ? '' : 's'} needs attention` : 'Ready'
        })
      ]),
      h('div', { class: 'gummy-box-home-metrics' }, [
        metric('Productions', options.runtime.productions.length),
        metric('Sources', sources.length),
        metric('Results', results.length),
        metric('Quarantined', quarantined.length)
      ]),
      h('div', { class: 'gummy-box-continue-grid' }, [
        recentProduction ? h('article', { class: 'continue-card' }, [
          h('span', { class: 'eyebrow', text: 'CONTINUE' }),
          h('strong', { text: recentProduction.title }),
          h('p', { text: recentProduction.description }),
          h('div', { class: 'button-row' }, [
            button('Open', () => options.openProduction(recentProduction.id), 'button primary'),
            button('Arrange in Composer', () => sendToComposer({
              kind: 'production',
              id: recentProduction.id,
              revision: String(recentProduction.revision || 1),
              label: recentProduction.title,
              description: 'An existing undertaking linked without duplication.',
              lane: 'inputs',
              availability: { state: 'available', reason: 'Available in this browser.' }
            }))
          ])
        ]) : h('article', { class: 'continue-card' }, [
          h('span', { class: 'eyebrow', text: 'CONTINUE' }),
          h('strong', { text: 'No Productions yet' }),
          h('p', { text: 'Start with a blank Composer or one of its optional patterns.' }),
          button('Open Composer', options.openComposer, 'button primary')
        ]),
        h('article', { class: 'continue-card' }, [
          h('span', { class: 'eyebrow', text: 'START OR IMPORT' }),
          h('strong', { text: 'Bring in a source or begin arranging' }),
          h('p', { text: 'Imports stay bounded in this browser. Composer changes remain proposals until you choose a later governed action.' }),
          h('div', { class: 'button-row' }, [
            button('Import a Gummy', () => options.picker.click(), 'button primary'),
            button('Open Composer', options.openComposer)
          ])
        ]),
        recentResult ? h('article', {
          class: 'continue-card',
          title: recentResult.title || recentResult.name || recentResult.id
        }, [
          h('span', { class: 'eyebrow', text: 'RECENT RESULT' }),
          h('strong', { text: recentResult.title || recentResult.name || recentResult.id }),
          h('p', { text: recentResult.acceptance
            ? 'Accepted result · open Results for the exact item and provenance.'
            : 'Candidate result awaiting a Human decision · open Results for exact details.' }),
          button('Add recent result in Composer', () => sendToComposer({
            kind: 'gummy',
            id: recentResult.id,
            revision: String(recentResult.revision || 1),
            hash: typeof recentResult.hash === 'string' ? recentResult.hash : recentResult.hash?.value || null,
            label: recentResult.title || recentResult.name || recentResult.id,
            description: 'A selected result from the Local Gummy Box.',
            lane: 'inputs',
            availability: { state: 'available', reason: 'Stored in this browser.' }
          }), 'button', {
            'aria-label': `Add ${recentResult.title || recentResult.name || recentResult.id} in Composer`
          })
        ]) : h('article', { class: 'continue-card' }, [
          h('span', { class: 'eyebrow', text: 'RECENT RESULT' }),
          h('strong', { text: 'No results yet' }),
          h('p', { text: 'Accepted and candidate results will appear here with their exact title and state.' })
        ]),
        h('article', { class: 'continue-card' }, [
          h('span', { class: 'eyebrow', text: 'NEEDS ATTENTION' }),
          h('strong', { text: attention ? `${attention} item${attention === 1 ? '' : 's'} to review` : 'Nothing urgent' }),
          h('p', { text: attention
            ? 'Review bounded imports and candidate results without changing their underlying state.'
            : 'Command Center will collect meaningful local decisions here when they appear.' }),
          button('Open Command Center', options.openCommandCenter, attention ? 'button primary' : 'button')
        ])
      ])
    ]);
    heading.insertAdjacentElement('afterend', launchpad);
  }

  function metric(label, value) {
    return h('article', { class: 'metric-card' }, [h('strong', { text: String(value) }), h('span', { text: label })]);
  }

  function enhance() {
    if (enhancing) return;
    enhancing = true;
    try {
      renderHomeLaunchpad();
      decorateGummies();
      decorateProjects();
      decorateShared();
    } finally {
      enhancing = false;
    }
  }

  const observer = new MutationObserver(() => queueMicrotask(enhance));
  observer.observe(root, { childList: true, subtree: true });
  enhance();
  return root;
}
