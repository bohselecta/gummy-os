function h(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (['checked', 'disabled', 'hidden', 'selected'].includes(key)) node[key] = value;
    else node.setAttribute(key, value);
  }
  for (const child of Array.isArray(children) ? children : [children]) {
    if (child == null) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function createGummyBoxApp({
  gummies,
  receipts,
  sharedVisions,
  socialInstances,
  box,
  runtime,
  picker,
  recovery,
  connection,
  openComposer,
  openCommandCenter,
  openProduction,
  boundedExport,
  denyPromotion,
  burnWorkspace
}) {
  const root = h('div', { class: 'gummy-box-workspace', dataset: { testid: 'gummy-box' } });
  let category = 'home';
  let presentation = 'list';
  let query = '';
  let typeFilter = 'all';
  let stateFilter = 'all';
  const categoryDefinitions = [
    ['home', 'Home', 'Your recent projects, sources, results, and imports'],
    ['projects', 'Projects / Productions', `${runtime.productions.length} undertakings`],
    ['sources', 'Sources', `${gummies.filter(isSourceGummy).length} source objects`],
    ['results', 'Results', `${gummies.filter(isResultGummy).length} result objects`],
    ...(sharedVisions.length || socialInstances.length
      ? [['shared', 'Shared with me', `${sharedVisions.length + socialInstances.length} real local records`]]
      : []),
    ['history', 'Receipts and history', `${receipts.length} evidence records`],
    ['imports', 'Imports / Quarantine', `${gummies.filter(item => item.quarantine).length} bounded imports`],
    ['backups', 'Backups and connections', box?.mirrorLocations?.length ? `${box.mirrorLocations.length} mirror connections` : 'Local only']
  ];
  const header = h('header', { class: 'gummy-box-header' }, [
    h('div', {}, [
      h('p', { class: 'eyebrow', text: 'YOUR HOME WORKSPACE' }),
      h('h1', { text: 'Gummy Box' }),
      h('p', { class: 'lede', text: 'Your files, projects, results, and history' }),
      h('p', { class: 'gummy-box-location', text: "Stored in this browser's Local Gummy Box." })
    ]),
    h('div', { class: 'button-row' }, [
      h('button', { class: 'button primary', onclick: () => picker.click(), dataset: { testid: 'import-gummy' } }, 'Import a Gummy'),
      h('button', { class: 'button', onclick: openComposer }, 'Open Composer'),
      h('button', { class: 'button danger', onclick: burnWorkspace }, 'Clear temporary imports')
    ]),
    picker
  ]);
  const sidebar = h('nav', { class: 'gummy-box-sidebar', 'aria-label': 'Gummy Box folders' });
  const main = h('section', { class: 'gummy-box-main', 'aria-live': 'polite' });

  const renderSidebar = () => {
    sidebar.replaceChildren(...categoryDefinitions.map(([id, label, count]) => h('button', {
      class: `gummy-box-folder ${category === id ? 'active' : ''}`,
      'aria-current': category === id ? 'page' : null,
      onclick: () => {
        category = id;
        renderSidebar();
        renderMain();
      }
    }, [
      h('strong', { text: label }),
      h('small', { text: count })
    ])));
  };

  const renderMain = () => {
    main.replaceChildren();
    const definition = categoryDefinitions.find(([id]) => id === category);
    main.append(h('div', { class: 'gummy-box-section-heading' }, [
      h('div', {}, [
        h('p', { class: 'eyebrow', text: 'GUMMY BOX' }),
        h('h2', { text: definition?.[1] || 'Home' })
      ]),
      categoryUsesGummyList(category) ? h('div', { class: 'button-row' }, [
        h('button', {
          class: `button ${presentation === 'list' ? 'primary' : ''}`,
          'aria-pressed': String(presentation === 'list'),
          onclick: () => { presentation = 'list'; renderMain(); }
        }, 'List'),
        h('button', {
          class: `button ${presentation === 'grid' ? 'primary' : ''}`,
          'aria-pressed': String(presentation === 'grid'),
          onclick: () => { presentation = 'grid'; renderMain(); }
        }, 'Grid')
      ]) : null
    ]));
    if (category === 'projects') return renderProductions(main, runtime, openProduction);
    if (category === 'shared') return renderShared(main, sharedVisions, socialInstances, openCommandCenter);
    if (category === 'history') return renderBoxHistory(main, receipts);
    if (category === 'backups') {
      main.append(
        h('p', { text: 'Local remains authoritative. A connection never receives broad filesystem authority and does not silently become authoritative.' }),
        recovery,
        connection
      );
      return;
    }

    const search = h('input', {
      type: 'search',
      value: query,
      placeholder: 'Search names, types, states, and IDs',
      'aria-label': 'Search Gummy Box'
    });
    const type = h('select', { 'aria-label': 'Filter Gummy Box by type' }, [
      ...['all', 'file', 'source', 'reference', 'result', 'artifact'].map(value => h('option', {
        value,
        text: value === 'all' ? 'All types' : value,
        selected: typeFilter === value
      }))
    ]);
    const state = h('select', { 'aria-label': 'Filter Gummy Box by state' }, [
      ...['all', 'local', 'quarantined', 'blocked', 'accepted'].map(value => h('option', {
        value,
        text: value === 'all' ? 'All states' : `${value[0].toUpperCase()}${value.slice(1)} objects`,
        selected: stateFilter === value
      }))
    ]);
    const list = h('div', { class: `gummy-box-objects ${presentation}` });
    const renderGummyResults = () => {
      list.className = `gummy-box-objects ${presentation}`;
      list.replaceChildren();
      const visible = gummies.filter(gummy => {
        if (category === 'sources' && !isSourceGummy(gummy)) return false;
        if (category === 'results' && !isResultGummy(gummy)) return false;
        if (category === 'imports' && !gummy.quarantine) return false;
        const term = query.trim().toLowerCase();
        if (term && !`${gummy.title || gummy.name || ''} ${gummy.id} ${gummy.kind} ${gummy.quarantine?.status || 'local'}`.toLowerCase().includes(term)) return false;
        if (typeFilter !== 'all' && normalizedGummyKind(gummy) !== typeFilter) return false;
        const gummyState = gummy.acceptance ? 'accepted' : gummy.quarantine?.status || 'local';
        return stateFilter === 'all' || gummyState === stateFilter;
      });
      for (const gummy of visible) {
        list.append(gummyBoxCard(gummy, runtime, { openProduction, boundedExport, denyPromotion }));
      }
      if (!visible.length) list.append(h('p', { class: 'empty-state', text: 'No Gummy Box objects match these choices.' }));
    };
    search.addEventListener('input', () => { query = search.value; renderGummyResults(); });
    type.addEventListener('change', () => { typeFilter = type.value; renderGummyResults(); });
    state.addEventListener('change', () => { stateFilter = state.value; renderGummyResults(); });
    main.append(h('div', { class: 'gummy-box-filters' }, [search, type, state]));
    if (category === 'imports') {
      main.append(h('div', { class: 'button-row' }, [
        h('button', { class: 'button primary', onclick: () => picker.click() }, 'Import another Gummy')
      ]));
    }
    main.append(list);
    renderGummyResults();
  };

  root.append(header, h('div', { class: 'gummy-box-layout' }, [sidebar, main]));
  renderSidebar();
  renderMain();
  return root;
}

function categoryUsesGummyList(category) {
  return ['home', 'sources', 'results', 'imports'].includes(category);
}

function normalizedGummyKind(gummy) {
  return gummy.kind === 'deliverable' ? 'artifact' : gummy.kind;
}

function isResultGummy(gummy) {
  return ['result', 'artifact', 'deliverable'].includes(gummy.kind) || Boolean(gummy.acceptance);
}

function isSourceGummy(gummy) {
  return !isResultGummy(gummy) && !gummy.quarantine;
}

function owningProduction(runtime, gummyId) {
  return runtime.productions.find(production => production.gummyIds.includes(gummyId));
}

function gummyBoxCard(gummy, runtime, actions) {
  const production = owningProduction(runtime, gummy.id);
  const hash = typeof gummy.hash === 'string' ? gummy.hash.replace(/^sha256:/, '') : gummy.hash?.value;
  const mediaType = gummy.content?.mediaType || gummy.mediaType || 'unknown media';
  const byteRef = gummy.content?.byteRef || 'No byte reference';
  const state = gummy.acceptance ? 'accepted' : gummy.quarantine?.status || gummy.status || 'local';
  return h('article', { class: 'gummy-box-object', dataset: { gummyId: gummy.id } }, [
    h('div', { class: 'gummy-box-object-heading' }, [
      h('span', { class: 'gummy-file-icon', 'aria-hidden': 'true', text: isResultGummy(gummy) ? '◆' : '▤' }),
      h('div', {}, [
        h('strong', { text: gummy.title || gummy.name || gummy.id }),
        h('small', { text: `${humanGummyKind(gummy)} · ${mediaType}` }),
        isSampleGummy(gummy) ? h('span', { class: 'tag sample-tag', text: 'Sample / Local example' }) : null
      ]),
      h('span', { class: `status ${['quarantined', 'blocked'].includes(state) ? 'blocked' : ''}`, text: state })
    ]),
    h('p', { class: 'gummy-box-location compact', text: "Stored in this browser's Local Gummy Box." }),
    h('div', { class: 'button-row' }, [
      production ? h('button', { class: 'button primary', onclick: () => actions.openProduction(production.id) }, `Open ${production.title}`) : null,
      byteRef !== 'No byte reference' ? h('button', { class: 'button', onclick: () => actions.boundedExport(gummy) }, 'Bounded export') : null,
      gummy.quarantine?.status === 'quarantined'
        ? h('button', { class: 'button', onclick: () => actions.denyPromotion(gummy) }, 'Deny promotion')
        : null
    ]),
    h('details', {}, [
      h('summary', { text: 'Show provenance' }),
      h('dl', { class: 'facts' }, [
        h('dt', { text: 'Created by' }), h('dd', { text: gummy.creatorActorId || 'unknown' }),
        h('dt', { text: 'Owned by' }), h('dd', { text: gummy.ownerActorId || 'unknown' }),
        h('dt', { text: 'Owning Production' }), h('dd', { text: production?.id || 'Not attached to a Production' }),
        h('dt', { text: 'Canonical Gummy' }), h('dd', { text: gummy.id }),
        h('dt', { text: 'Created' }), h('dd', { text: gummy.createdAt || 'not recorded' })
      ])
    ]),
    h('details', {}, [
      h('summary', { text: 'Show storage details' }),
      h('dl', { class: 'facts' }, [
        h('dt', { text: 'Storage provider' }), h('dd', { text: 'Local Gummy Box · IndexedDB record + OPFS bytes' }),
        h('dt', { text: 'Byte reference' }), h('dd', { text: byteRef }),
        h('dt', { text: 'Hash' }), h('dd', { class: 'receipt-hash', text: hash ? `sha256:${hash}` : 'No content hash' }),
        h('dt', { text: 'Revision' }), h('dd', { text: String(gummy.revision) }),
        h('dt', { text: 'Quarantine' }), h('dd', { text: gummy.quarantine?.status ? `${gummy.quarantine.status} import` : 'not quarantined' }),
        h('dt', { text: 'Synchronization eligibility' }), h('dd', { text: gummy.quarantine?.status ? 'Not eligible while bounded or quarantined' : 'Eligible only through a Human-approved Box connection' }),
        h('dt', { text: 'Native filesystem authority' }), h('dd', { text: 'None' })
      ])
    ])
  ]);
}

function humanGummyKind(gummy) {
  if (isResultGummy(gummy)) return 'Result';
  if (gummy.quarantine) return 'Imported file';
  return gummy.kind === 'reference' ? 'Reference' : 'Source';
}

function isSampleGummy(gummy) {
  return /(?:night-gummy|ranch-day|hoyt|friday|phase16)/.test(gummy.id);
}

function renderProductions(main, runtime, openProduction) {
  const grid = h('div', { class: 'gummy-box-projects' });
  for (const production of runtime.productions) {
    const sample = production.id.includes('night-gummy') || production.id.includes('cyberpunk');
    grid.append(h('article', { class: 'gummy-box-project' }, [
      h('div', {}, [
        h('span', { class: 'eyebrow', text: sample ? 'SAMPLE · PRODUCTION' : 'PRODUCTION' }),
        h('h3', { text: production.title }),
        h('p', { text: production.description }),
        sample ? h('p', { class: 'boundary-note compact', text: 'This example demonstrates the complete model using private records in this browser. It does not imply real contacts, remote presence, payment, publication, or ownership.' }) : null
      ]),
      h('div', { class: 'button-row' }, [
        h('button', { class: 'button primary', onclick: () => openProduction(production.id) }, 'Open Production'),
        h('button', { class: 'button', onclick: () => openProduction(production.id, 'composer') }, 'Open linked Composer')
      ]),
      h('details', {}, [
        h('summary', { text: 'Show project details' }),
        h('p', { text: `${production.id}@${production.revision} · ${production.status} · ${production.gummyIds.length} Gummy objects · ${production.runIds.length} immutable Runs` })
      ])
    ]));
  }
  if (!runtime.productions.length) grid.append(h('p', { class: 'empty-state', text: 'No Productions yet. Start one in Composer.' }));
  main.append(grid);
}

function renderShared(main, sharedVisions, socialInstances, openCommandCenter) {
  main.append(h('p', {
    class: 'boundary-note',
    text: 'Only real records stored in this browser appear here. A local example is labeled and never implies a remote contact or live presence.'
  }));
  for (const social of socialInstances) {
    main.append(h('article', { class: 'gummy-box-object' }, [
      h('span', { class: 'eyebrow', text: 'LOCAL EXAMPLE · SAVED GROUP' }),
      h('h3', { text: social.title }),
      h('p', { text: `${social.members?.length || 0} Actor records · ${social.layout?.windows?.length || 0} saved windows` }),
      h('button', { class: 'button', onclick: openCommandCenter }, 'Open in Command Center')
    ]));
  }
  for (const vision of sharedVisions) {
    main.append(h('article', { class: 'gummy-box-object' }, [
      h('span', { class: 'eyebrow', text: 'LOCAL EXAMPLE · SAVED IDEA' }),
      h('h3', { text: vision.goal || vision.title }),
      h('p', { text: vision.intent }),
      h('details', {}, [
        h('summary', { text: 'Show provenance' }),
        h('p', { text: `${vision.id}@${vision.revision} · ${vision.origin?.recordRefs?.length || 0} selected source records` })
      ])
    ]));
  }
}

function renderBoxHistory(main, receipts) {
  const query = h('input', { type: 'search', placeholder: 'Search actions and evidence', 'aria-label': 'Search Gummy Box history' });
  const list = h('div', { class: 'record-list' });
  const render = () => {
    const term = query.value.toLowerCase();
    list.replaceChildren(...receipts
      .filter(receipt => JSON.stringify(receipt).toLowerCase().includes(term))
      .map(receipt => h('article', { class: 'record-row' }, [
        h('div', {}, [
          h('strong', { text: receipt.action }),
          h('small', { text: `${receipt.outcome} · ${receipt.createdAt}` })
        ]),
        h('details', {}, [
          h('summary', { text: 'Show evidence' }),
          h('p', { text: receipt.detail || 'No additional detail.' }),
          h('code', { text: receipt.canonicalHash || receipt.id })
        ])
      ])));
    if (!list.children.length) list.append(h('p', { class: 'empty-state', text: 'No history matches.' }));
  };
  query.addEventListener('input', render);
  main.append(query, list);
  render();
}
