import { button, clear, el, sectionHeading } from '../core/dom.js';
import { previewProductionRun, revokeActorRelationship } from '../core/production-runtime.js';

export function createMasterControlApp({
  store,
  productionId = null,
  openActorSurface,
  openProduction,
  toast
}) {
  const root = el('div', { class: 'master-control-app' });
  let section = productionId ? 'overview' : 'productions';

  const render = () => {
    clear(root);
    const runtime = store.getState().productionRuntime;
    const production = runtime.productions.find(item => item.id === productionId);
    root.append(sectionHeading('Master Control', production
      ? `${production.title} scope · authority, data flow, execution, evidence, and revocation`
      : 'Global scope · canonical object inspection', [
        production ? button('Open Production', 'secondary-button', () => openProduction(production.id)) : null
      ].filter(Boolean)));

    const nav = el('nav', { class: 'master-nav', 'aria-label': 'Master Control views' });
    for (const [id, label] of [
      ['overview', production ? 'Run preview' : 'Overview'],
      ['productions', 'Productions'],
      ['actors', 'Actors'],
      ['plans', 'Actor Plans'],
      ['authority', 'Molds · Grants · Leases'],
      ['context', 'Context · data flow'],
      ['evidence', 'Returns · Receipts'],
      ['native', 'Native Bridges'],
      ['revocation', 'Revocation · locks']
    ]) {
      nav.append(button(label, `graph-tab ${section === id ? 'active' : ''}`, () => { section = id; render(); }));
    }
    root.append(nav);

    const content = el('section', { class: 'master-content' });
    if (section === 'overview') renderOverview(runtime, production, content);
    if (section === 'productions') renderProductions(runtime, content);
    if (section === 'actors') renderActors(runtime, production, content);
    if (section === 'plans') renderPlans(runtime, production, content);
    if (section === 'authority') renderAuthority(runtime, production, content);
    if (section === 'context') renderContext(runtime, production, content);
    if (section === 'evidence') renderEvidence(runtime, production, content);
    if (section === 'native') renderNative(content);
    if (section === 'revocation') renderRevocation(runtime, production, content);
    root.append(content);
  };

  function renderOverview(runtime, production, content) {
    if (!production) {
      const counts = [
        ['Productions', runtime.productions.length],
        ['Actors', runtime.actors.length],
        ['Agents', runtime.agents.length],
        ['Runs', runtime.productionRuns.length],
        ['Receipts', runtime.receipts.length]
      ];
      content.append(el('div', { class: 'metric-grid' }, counts.map(([label, value]) => metric(value, label))));
      content.append(el('div', { class: 'boundary-callout' }, [
        el('strong', { text: 'Human authority remains above Actor and Agent.' }),
        el('p', { text: 'Opening this window or any Actor App Surface creates no authority. Master Control exposes the records that govern it.' })
      ]));
      return;
    }
    const inspection = previewProductionRun(runtime, production.id);
    const preview = inspection.preview;
    content.append(el('div', { class: 'master-answer-grid' }, [
      answer('Who participates?', preview.participants.map(item => `${actorAddress(runtime, item.actorId)} — ${item.roles.join(', ')}`)),
      answer('Which Agent executes?', preview.participants.filter(item => item.agentId).map(item => `${actorAddress(runtime, item.actorId)} → ${item.agentId}`)),
      answer('Which Mold and approval?', preview.participants.filter(item => item.moldId).map(item => `${item.moldId} · ${item.approvalState}`)),
      answer('Where is authoritative state?', [production.authoritativeLocation]),
      answer('What costs money?', ['$0 deterministic browser reference execution']),
      answer('What remains private?', ['Production context', 'approved Hoyt relationship slices', 'source Gummies', 'no public release']),
      answer('What is blocked?', preview.blockers.length ? preview.blockers : ['native Bridge', 'commercial/public use', 'voice cloning', 'ambient authority']),
      answer('What proves outcomes?', [`${runtime.returns.length} Returns`, `${runtime.receipts.length} Receipts`, 'source/result hashes', 'Run manifest hashes'])
    ]));
  }

  function renderProductions(runtime, content) {
    if (!runtime.productions.length) content.append(el('div', { class: 'empty-state', text: 'No Productions yet.' }));
    for (const production of runtime.productions) {
      content.append(el('article', { class: 'master-object-row' }, [
        el('div', {}, [
          el('strong', { text: production.title }),
          el('small', { text: `${production.id} · ${production.status} · revision ${production.revision} · ${production.authoritativeLocation}` })
        ]),
        button('Open canonical Production window', 'secondary-button', () => openProduction(production.id))
      ]));
    }
  }

  function renderActors(runtime, production, content) {
    const participants = production
      ? runtime.participants.filter(item => item.productionId === production.id)
      : runtime.actors.map(actor => ({ actorId: actor.id, roles: [], status: actor.status }));
    for (const participant of participants) {
      const actor = runtime.actors.find(item => item.id === participant.actorId);
      const config = production && runtime.configurations.find(item => item.productionId === production.id && item.actorId === actor.id);
      content.append(el('article', { class: 'master-object-row' }, [
        el('div', {}, [
          el('strong', { text: `${actor.address} · ${actor.kind} Actor` }),
          el('small', { text: `${actor.id} · roles: ${participant.roles?.join(', ') || 'global'} · configuration: ${config ? `${config.id}@${config.revision}` : 'none'}` })
        ]),
        button('Open canonical Actor surface', 'secondary-button', () => openActorSurface(actor.id, production && actor.kind === 'service' ? production.id : null))
      ]));
    }
  }

  function renderPlans(runtime, production, content) {
    const plans = runtime.actorPlans.filter(item => !production || item.productionId === production.id);
    if (!plans.length) content.append(el('div', { class: 'empty-state', text: 'No compiled Actor Plan.' }));
    for (const plan of plans) {
      content.append(el('article', { class: 'master-plan-card' }, [
        el('h3', { text: `${plan.title} · revision ${plan.revision}` }),
        el('p', { text: `${plan.nodes.length} nodes · ${plan.edges.length} typed graph edges · ${plan.status}` }),
        el('div', { class: 'tag-row' }, [...new Set(plan.edges.map(item => item.edgeType))].map(type => el('span', { class: 'tag', text: type })))
      ]));
    }
  }

  function renderAuthority(runtime, production, content) {
    const relevantActorIds = production
      ? runtime.participants.filter(item => item.productionId === production.id).map(item => item.actorId)
      : runtime.actors.map(item => item.id);
    const molds = runtime.molds.filter(item => relevantActorIds.includes(item.actorId));
    content.append(el('h3', { text: 'Active Molds' }));
    for (const mold of molds) content.append(objectRow(mold.id, `${mold.actorId} · ${mold.status} · ${mold.permissions.capabilities.join(', ')}`));
    content.append(el('h3', { text: 'Task Leases and bounded Grants' }));
    const runIds = production ? runtime.productionRuns.filter(item => item.productionId === production.id).map(item => item.id) : null;
    const leases = runtime.taskLeases.filter(item => !runIds || runIds.some(runId => item.scope.productionRunId === runId));
    for (const lease of leases) {
      const grant = runtime.grants.find(item => item.taskLeaseId === lease.id);
      content.append(objectRow(lease.id, `${lease.agentId} · ${lease.mode} · ${lease.status} · Grant: ${grant?.id || 'none'}`));
    }
    if (!leases.length) content.append(el('p', { class: 'muted', text: 'No Leases or Grants exist before Make Production.' }));
  }

  function renderContext(runtime, production, content) {
    const runIds = production ? runtime.productionRuns.filter(item => item.productionId === production.id).map(item => item.id) : null;
    const envelopes = runtime.contextEnvelopes.filter(item => !runIds || runIds.includes(item.productionRunId));
    if (!envelopes.length) {
      content.append(el('div', { class: 'empty-state', text: 'Context Envelopes are created only for approved execution nodes.' }));
      return;
    }
    for (const envelope of envelopes) {
      content.append(el('details', { class: 'context-envelope-card' }, [
        el('summary', { text: `${actorAddress(runtime, envelope.targetActorId)} → ${envelope.agentId}` }),
        el('p', { text: `Allowed refs: ${envelope.contextRefs.join(', ')}` }),
        el('p', { text: `Excluded: ${envelope.excludes.join(', ')}` }),
        el('p', { text: `Forbidden: ${envelope.forbiddenActions.join(', ')}` }),
        el('code', { text: envelope.hash })
      ]));
    }
  }

  function renderEvidence(runtime, production, content) {
    const returns = runtime.returns.filter(item => !production || runtime.productionRuns.some(run => run.productionId === production.id && item.workOrderId.includes(run.id.slice(15))));
    const receipts = runtime.receipts.filter(item => !production || item.productionId === production.id);
    content.append(el('h3', { text: `Returns (${returns.length})` }));
    for (const returned of returns) content.append(objectRow(returned.id, `${returned.agentId} · ${returned.result} · ${returned.summary}`));
    content.append(el('h3', { text: `Receipts (${receipts.length})` }));
    for (const receipt of receipts.slice().reverse()) content.append(objectRow(receipt.id, `${receipt.action} · ${receipt.outcome} · ${receipt.summary}`));
  }

  function renderNative(content) {
    content.append(el('article', { class: 'native-denial-card' }, [
      el('span', { class: 'eyebrow', text: 'DENY BY DEFAULT' }),
      el('h2', { text: 'Native Bridge unavailable' }),
      el('p', { text: 'No arbitrary shell, filesystem, process, device, or provider-credential access is exposed. A future native executor requires explicit Agent identity, Bridge, active Mold, bounded Grant, Task Lease, locality disclosure, and Receipt.' }),
      el('div', { class: 'tag-row' }, [
        el('span', { class: 'tag', text: 'Bridge: missing' }),
        el('span', { class: 'tag', text: 'fallback: denied' }),
        el('span', { class: 'tag', text: 'ambient authority: none' })
      ])
    ]));
  }

  function renderRevocation(runtime, production, content) {
    const relationship = runtime.relationships.find(item => item.id === 'link:hoyt-videoboss-private-family');
    content.append(el('article', { class: 'relationship-card' }, [
      el('div', {}, [
        el('span', { class: 'eyebrow', text: `RELATIONSHIP · ${relationship.status}` }),
        el('h2', { text: '@Hoyt × @VideoBoss' }),
        el('p', { text: `Allowed: ${relationship.allowedContextRefs.join(', ')}` }),
        el('p', { text: `Blocked: ${relationship.blockedCapabilities.join(', ')}` }),
        relationship.revokedAt ? el('small', { text: `Revoked ${relationship.revokedAt}. Completed history retained.` }) : null
      ]),
      relationship.status === 'active'
        ? button('Revoke future use', 'danger-button', () => {
            const result = revokeActorRelationship(store.getState().productionRuntime, relationship.id);
            store.setState(current => ({ ...current, productionRuntime: result.runtime }));
            toast('Relationship revoked', 'Future dependent Runs are blocked. Historical Runs, Returns, and Receipts remain.');
            render();
          })
        : el('span', { class: 'status review', text: 'Future Runs blocked' })
    ]));
    const historical = runtime.productionRuns.filter(item => !production || item.productionId === production.id);
    content.append(el('p', { class: 'boundary-note', text: `Historical evidence preserved: ${historical.length} Run(s), ${runtime.returns.length} Return(s), ${runtime.receipts.length} Receipt(s).` }));
  }

  render();
  return { node: root, refresh: render };
}

function actorAddress(runtime, actorId) {
  return runtime.actors.find(item => item.id === actorId)?.address || actorId;
}

function metric(value, label) {
  return el('article', { class: 'metric-card' }, [el('strong', { text: String(value) }), el('span', { text: label })]);
}

function answer(question, lines) {
  return el('article', { class: 'answer-card' }, [
    el('strong', { text: question }),
    ...(lines.length ? lines : ['None']).map(line => el('p', { text: line }))
  ]);
}

function objectRow(id, summary) {
  return el('article', { class: 'master-object-row' }, [
    el('div', {}, [el('strong', { text: id }), el('small', { text: summary })])
  ]);
}
