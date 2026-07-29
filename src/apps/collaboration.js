import {
  ensureLivingCollaborationRecords,
  generateCommandCenterView,
  PHASE16_ACTORS,
  PHASE16_IDS,
  resolveActorPresence,
  resumeSocialInstance,
  runLivingCollaborationProof
} from '../core/living-collaboration.js';

function h(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (['disabled', 'hidden', 'open'].includes(key)) node[key] = value;
    else node.setAttribute(key, value);
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

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function objectStatus(label, state, tone = '') {
  return h('span', { class: `status ${tone}`, text: `${label} · ${state}` });
}

function section(title, eyebrow, children, props = {}) {
  return h('section', { class: 'phase16-section', ...props }, [
    h('p', { class: 'eyebrow', text: eyebrow }),
    h('h3', { text: title }),
    ...children
  ]);
}

function emptyState(text) {
  return h('p', { class: 'notice compact-notice', text });
}

function presenceCard(actor, presence) {
  const represented = presence.state === 'ai-represented';
  const truthful = ['offline', 'static', 'dormant', 'revoked'].includes(presence.state);
  return h('article', {
    class: 'phase16-presence-card',
    dataset: {
      testid: `phase16-presence-${actor.id.slice('actor:'.length)}`,
      presenceState: presence.state
    }
  }, [
    h('div', { class: 'phase16-presence-heading' }, [
      h('div', {}, [
        h('strong', { text: actor.name }),
        h('small', { text: `${actor.id} · ${actor.role}` })
      ]),
      objectStatus('Presence', presence.state.replaceAll('-', ' '), truthful ? 'review' : '')
    ]),
    h('p', { text: presence.disclosure }),
    h('dl', { class: 'phase16-mini-facts' }, [
      h('dt', { text: 'Operator' }),
      h('dd', { text: presence.operator.operatorId || 'none' }),
      h('dt', { text: 'Authority' }),
      h('dd', { text: represented ? `${presence.operator.moldId} · ${presence.operator.grantId}` : 'No representation authority' }),
      h('dt', { text: 'Media truth' }),
      h('dd', { text: 'Local fixture text only' })
    ])
  ]);
}

function socialPreview(social, presenceByActor) {
  const windows = social?.layout?.windows || [];
  return h('div', {
    class: 'phase16-layout-preview',
    dataset: { testid: 'phase16-layout-preview' },
    role: 'img',
    'aria-label': 'Saved multi-window Social Instance layout'
  }, windows.map(windowRecord => {
    const actor = PHASE16_ACTORS.find(item => item.id === windowRecord.subjectId);
    const presence = actor ? presenceByActor[actor.id] : null;
    return h('article', {
      class: `phase16-layout-window ${windowRecord.state === 'minimized' ? 'is-minimized' : ''}`,
      dataset: { windowState: windowRecord.state }
    }, [
      h('span', { class: 'phase16-window-dot', 'aria-hidden': 'true' }),
      h('strong', { text: actor?.name || 'Shared thread' }),
      h('small', { text: actor ? presence?.state?.replaceAll('-', ' ') || 'offline' : windowRecord.subjectId }),
      h('small', { text: `${windowRecord.width}×${windowRecord.height} · ${windowRecord.state}` })
    ]);
  }));
}

function progressCard(label, record, detail) {
  return h('li', {
    class: record ? 'phase16-progress-complete' : '',
    dataset: { phase16Step: label.toLowerCase().replaceAll(' ', '-') }
  }, [
    h('span', { class: 'phase16-progress-mark', 'aria-hidden': 'true', text: record ? '✓' : '○' }),
    h('div', {}, [
      h('strong', { text: label }),
      h('small', { text: record ? detail(record) : 'Waiting for explicit Human action' })
    ])
  ]);
}

function poolTable(original, revised) {
  if (!original) return emptyState('No Production Pool exists. No money has been collected.');
  const future = Object.fromEntries((revised?.allocations || []).map(item => [item.actorId, item]));
  return h('div', { class: 'phase16-table-wrap' }, [
    h('table', { class: 'phase16-table' }, [
      h('caption', { text: '$10.00 estimate · authorization versus future proposal' }),
      h('thead', {}, h('tr', {}, [
        h('th', { scope: 'col', text: 'Contributor' }),
        h('th', { scope: 'col', text: 'Authorized maximum' }),
        h('th', { scope: 'col', text: 'Future proposal' }),
        h('th', { scope: 'col', text: 'Charge' })
      ])),
      h('tbody', {}, [
        ...original.allocations.map(item => h('tr', {}, [
          h('th', { scope: 'row', text: PHASE16_ACTORS.find(actor => actor.id === item.actorId)?.name || item.actorId }),
          h('td', { text: money(item.maximumAmount) }),
          h('td', { text: future[item.actorId] ? money(future[item.actorId].proposedAmount) : '—' }),
          h('td', { text: money(0) })
        ])),
        revised?.allocations.find(item => item.actorId === 'actor:contributor-d')
          ? h('tr', {}, [
              h('th', { scope: 'row', text: 'Contributor D' }),
              h('td', { text: 'Not authorized' }),
              h('td', { text: '$2.50' }),
              h('td', { text: '$0.00' })
            ])
          : null
      ])
    ]),
    h('p', {
      class: 'boundary-note compact',
      text: revised
        ? 'Existing $4/$3/$3 maximums remain unchanged. The $2.50 four-way split is a future proposal and requires fresh individual authorization.'
        : 'Maximums are individual authorizations only. No funds were collected, pooled, or charged.'
    })
  ]);
}

function commandMetric(label, records) {
  return h('article', { class: 'metric-card' }, [
    h('strong', { text: String(records?.length || 0) }),
    h('span', { text: label })
  ]);
}

function attentionCard(item) {
  return h('article', { class: 'record-row phase16-attention-card' }, [
    h('div', {}, [
      h('strong', { text: item.title }),
      h('small', { text: `${item.class.replaceAll('-', ' ')} · ${item.sourceObject.id}@${item.sourceObject.revision}` }),
      h('p', { text: item.explanation })
    ]),
    h('div', {}, [
      objectStatus('Next', item.nextVerb, item.class === 'blocked' ? 'review' : ''),
      h('small', { text: item.authorityRequired || 'No authority required' })
    ])
  ]);
}

function distributionCard(plan, released) {
  const label = plan.destination.type === 'private-export'
    ? 'Private export'
    : plan.destination.type === 'radio'
      ? 'Radio'
      : 'Channels';
  const release = released.find(item => item.distributionPlanId === plan.id);
  return h('article', {
    class: 'card phase16-distribution-card',
    dataset: { destination: plan.destination.type }
  }, [
    h('div', { class: 'phase16-presence-heading' }, [
      h('h4', { text: label }),
      objectStatus('Plan', release ? 'released' : plan.status.replaceAll('-', ' '), plan.status === 'blocked' ? 'review' : '')
    ]),
    h('p', { text: plan.metadata.description }),
    h('small', { text: `${plan.destination.routeStatus} route · ${plan.audience} audience · ${money(0)} actual` }),
    h('p', { class: 'boundary-note compact', text: release
      ? `Explicit release ${release.id}.`
      : plan.destination.type === 'channels'
        ? 'Remote service and moderation are not connected. Nothing published.'
        : plan.destination.type === 'radio'
          ? 'Final voice approval is missing. Nothing published.'
          : 'Exact separate publication approval is required.' })
  ]);
}

export async function createCollaborationApp({
  repository,
  productionRuntime,
  persistProductionRuntime,
  openSocialInstance,
  closeSocialInstance,
  openMasterControl,
  announce
}) {
  let currentRuntime = productionRuntime;
  const root = h('div', { class: 'phase16-command-center', dataset: { testid: 'phase16-command-center' } });

  const render = async () => {
    await ensureLivingCollaborationRecords(repository);
    const [
      social,
      presenceRecords,
      sharedVision,
      agreement,
      originalPool,
      revisedPool,
      ledger,
      formation,
      plans,
      releases
    ] = await Promise.all([
      repository.get('socialInstances', PHASE16_IDS.socialInstance),
      repository.all('actorPresence'),
      repository.get('sharedVisions', PHASE16_IDS.sharedVision),
      repository.get('productionAgreements', PHASE16_IDS.agreement),
      repository.get('productionPools', PHASE16_IDS.pool),
      repository.get('productionPools', PHASE16_IDS.revisedPool),
      repository.get('contributionLedgers', PHASE16_IDS.ledger),
      repository.get('productionFormations', PHASE16_IDS.formation),
      repository.all('distributionPlans'),
      repository.all('distributionReleases')
    ]);
    const presenceByActor = Object.fromEntries(PHASE16_ACTORS.map(actor => {
      const record = presenceRecords.find(item => item.actorId === actor.id && item.schema === 'gummy.actor-presence/v1');
      return [actor.id, resolveActorPresence(record)];
    }));
    const production = currentRuntime.productions.find(item => item.id === PHASE16_IDS.production);
    const run = currentRuntime.productionRuns.find(item => item.productionId === PHASE16_IDS.production);
    const accepted = currentRuntime.gummies.find(item => item.productionId === PHASE16_IDS.production && item.status === 'accepted');
    const command = await generateCommandCenterView(repository, currentRuntime);

    const runButton = button('Run complete local proof', async event => {
      const target = event.currentTarget;
      target.disabled = true;
      target.textContent = 'Running governed local proof…';
      try {
        const result = await runLivingCollaborationProof(repository, currentRuntime, {
          persistProductionRuntime: async runtime => {
            currentRuntime = runtime;
            await persistProductionRuntime(runtime);
          }
        });
        currentRuntime = result.runtime;
        announce('Phase 16 local proof completed. No provider charge occurred; one private destination was explicitly released.');
        await render();
      } catch (error) {
        target.disabled = false;
        target.textContent = 'Run complete local proof';
        announce(`Phase 16 proof blocked: ${error.message}`);
      }
    }, 'button primary', { dataset: { testid: 'phase16-run-proof' } });

    root.replaceChildren(
      h('header', { class: 'phase16-hero' }, [
        h('div', {}, [
          h('p', { class: 'eyebrow', text: 'PHASE 16 · LIVING COLLABORATION' }),
          h('h2', { text: 'See what needs attention' }),
          h('p', {
            class: 'lede',
            text: 'Restore a group, recognize shared intent, agree how to make it, choose contributions, Make Production, review evidence, and send an accepted result somewhere—without silent authority.'
          })
        ]),
        h('aside', { class: 'phase16-authority-law' }, [
          h('strong', { text: 'Command Center shows what needs attention.' }),
          h('span', { text: 'Master Control decides what is allowed.' }),
          h('small', { text: 'Zeke explains and routes here. Glopper remains the companion. Neither can approve, spend, execute, publish, or assign ownership.' })
        ])
      ]),
      h('div', { class: 'phase16-command-metrics' }, [
        commandMetric('Active Productions', command.activeProductions),
        commandMetric('Saved groups', command.activeSocialInstances),
        commandMetric('Shared Visions', command.sharedVisions),
        commandMetric('Waiting decisions', command.waitingHumanDecisions),
        commandMetric('Returns', command.returns),
        commandMetric('Receipts', command.receipts)
      ]),
      section('Friday Brainstorm Crew', 'OPEN THIS GROUP', [
        h('p', { text: `${social.purpose} Bowl, Session, and Social Instance remain separate durable objects.` }),
        socialPreview(social, presenceByActor),
        h('div', { class: 'button-row' }, [
          button('Open this group', () => openSocialInstance(social, { resume: false }), 'button primary', { dataset: { testid: 'phase16-open-group' } }),
          button('Continue where we left off', async () => {
            const resumed = await resumeSocialInstance(repository, social.id);
            await openSocialInstance(resumed.socialInstance, { resume: true });
            announce(`Resumed ${resumed.session.id}. The prior Session remains intact.`);
            await render();
          }),
          button('Close group windows', () => closeSocialInstance(social)),
          button('Reload durable state', () => render())
        ]),
        h('p', { class: 'boundary-note compact', text: social.resumeInstructions })
      ], { dataset: { testid: 'phase16-social-instance' } }),
      section('Truthful Actor Presence', 'WHO IS HERE', [
        h('div', { class: 'phase16-presence-grid' }, PHASE16_ACTORS.map(actor => presenceCard(actor, presenceByActor[actor.id]))),
        h('p', { class: 'boundary-note compact', text: 'Human-live means this local browser fixture only. AI represented is disclosed with Agent, Mold, Grant, Human sponsor, scope, expiry, exclusions, and revocation. No remote audio/video is claimed.' })
      ]),
      section('Complete local-first journey', 'PROOF STATUS', [
        h('ol', { class: 'phase16-progress' }, [
          progressCard('Restore saved Social Instance', social, record => `${record.layout.windows.length} windows · revision ${record.revision}`),
          progressCard('Create Shared Vision', sharedVision, record => `${record.origin.recordRefs.length} exact selected records · no execution`),
          progressCard('Approve Production Agreement', agreement, record => `revision ${record.revision} · ${record.approvals.length} Actor approvals`),
          progressCard('Authorize $10 Production Pool', originalPool, record => `${record.allocations.map(item => money(item.maximumAmount)).join(' / ')} maximums`),
          progressCard('Propose fourth contributor', revisedPool, record => `${record.allocations.length} future shares · prior authorizations unchanged`),
          progressCard('Record Contribution Ledger', ledger, record => `${record.entries.length} append-only entries · revision ${record.revision}`),
          progressCard('Form Production', formation, record => `${record.id} · immutable`),
          progressCard('Make Production', run, record => `${record.id} · ${record.status} · ${money(record.policy.costCeiling)} run ceiling`),
          progressCard('Human accepts result', accepted, record => `${record.id} · ${record.acceptance.role}`),
          progressCard('Prepare Distribution Plans', plans.length ? { id: 'plans', length: plans.length } : null, record => `${record.length} separate destinations`),
          progressCard('Release one destination', releases[0], record => `${record.destination.type} · ${money(record.cost.amount)} actual`)
        ]),
        h('div', { class: 'button-row' }, [
          runButton,
          button('Open Master Control', openMasterControl)
        ]),
        h('p', { class: 'boundary-note compact', text: 'The proof uses the existing Make Production runtime and a deterministic local route. The $10 Pool is an estimate/authorization record; actual provider cost remains $0.00.' })
      ], { dataset: { testid: 'phase16-proof-status' } }),
      h('div', { class: 'phase16-split' }, [
        section('Shared Vision', 'SAVE THIS IDEA', sharedVision ? [
          objectStatus('Status', sharedVision.status.replaceAll('-', ' ')),
          h('h4', { text: sharedVision.goal }),
          h('p', { text: sharedVision.intent }),
          h('ul', {}, sharedVision.origin.recordRefs.map(item => h('li', { text: `${item.id}@${item.revision} · sha256:${item.hash.slice(0, 12)}…` }))),
          h('p', { class: 'boundary-note compact', text: `Excluded: ${sharedVision.origin.explicitExclusions.join(', ')}. A Shared Vision creates no authority, spending, ownership, publication, or execution.` })
        ] : [emptyState('Select exact Session records to create a non-executing Shared Vision.')]),
        section('Production Agreement', 'AGREE HOW WE WILL MAKE IT', agreement ? [
          objectStatus('Agreement', `revision ${agreement.revision} · ${agreement.status}`),
          h('dl', { class: 'phase16-mini-facts' }, [
            h('dt', { text: 'Governance' }), h('dd', { text: agreement.governance }),
            h('dt', { text: 'Creative credit' }), h('dd', { text: 'Separate approval' }),
            h('dt', { text: 'Ownership' }), h('dd', { text: 'Undecided · never automatic' }),
            h('dt', { text: 'Compensation' }), h('dd', { text: 'None in this proof' }),
            h('dt', { text: 'Revenue' }), h('dd', { text: 'Undecided' }),
            h('dt', { text: 'Publication' }), h('dd', { text: 'Separate exact approval' })
          ])
        ] : [emptyState('The exact Agreement revision has not been approved.')])
      ]),
      section('Production Pool', 'CHOOSE YOUR CONTRIBUTION', [
        poolTable(originalPool, revisedPool),
        h('div', { class: 'phase16-pool-truth' }, [
          objectStatus('Custody', originalPool?.custodyModel || 'no Pool yet'),
          objectStatus('Internal currency', originalPool?.internalCurrency ? 'yes' : 'no'),
          objectStatus('Actual charge', money(originalPool?.actual?.charged || 0))
        ])
      ], { dataset: { testid: 'phase16-pool' } }),
      h('div', { class: 'phase16-split' }, [
        section('Contribution Ledger', 'WHAT HAPPENED', ledger ? [
          h('p', { class: 'phase16-law', text: 'The Ledger records what happened. The Agreement determines what it means.' }),
          h('div', { class: 'record-list' }, ledger.entries.slice().reverse().map(entry => h('article', { class: 'record-row' }, [
            h('div', {}, [
              h('strong', { text: entry.description }),
              h('small', { text: `${entry.contributorActorId} · ${entry.category} · ${entry.status}` })
            ]),
            h('small', { text: `ownership: ${entry.ownershipEffect.automatic ? 'automatic' : 'not automatic'}` })
          ])))
        ] : [emptyState('No contributions have been recorded.')]),
        section('Production Formation Event', 'FORM PRODUCTION', formation ? [
          objectStatus('Formation', 'immutable'),
          h('h4', { text: formation.productionId }),
          h('p', { text: `${formation.sharedVisionId}@${formation.sharedVisionRevision} → ${formation.agreementId}@${formation.agreementRevision}` }),
          h('p', { text: `${formation.initialActors.length} founding Actors · Receipt ${formation.receiptId}` }),
          h('p', { class: 'boundary-note compact', text: 'Formation records the agreement transition. Make Production remains a later, separately approved execution transition.' })
        ] : [emptyState('Formation waits for the exact Shared Vision, Agreement, Pool, and Ledger.')])
      ]),
      section('Command Center attention', 'ZEKE EXPLAINS · MASTER CONTROL DECIDES', [
        command.attentionItems.length
          ? h('div', { class: 'record-list' }, command.attentionItems.map(attentionCard))
          : emptyState('No current attention items. Command Center remains a generated non-executing projection.'),
        h('p', { class: 'boundary-note compact', text: `Projection generated ${command.generatedAt}. Authority source: ${command.authoritySource}. Executing: ${String(command.executing)}.` })
      ], { dataset: { testid: 'phase16-attention' } }),
      section('Send somewhere', 'DISTRIBUTION', plans.length ? [
        h('div', { class: 'card-grid phase16-distribution-grid' }, plans.map(plan => distributionCard(plan, releases))),
        h('p', { class: 'phase16-law', text: 'Accepting a result never publishes it.' }),
        h('p', { class: 'boundary-note compact', text: 'Radio, Channels, and private export are separate versioned plans. Only the approved private local destination is released in this proof.' })
      ] : [
        emptyState('Distribution waits for an exact Human-accepted Artifact revision.')
      ], { dataset: { testid: 'phase16-distribution' } }),
      h('footer', { class: 'phase16-footer' }, [
        h('strong', { text: 'Canonical objects remain inspectable' }),
        h('p', { text: 'Human · Actor · Agent · Mold · Bowl · Session · Social Instance · Shared Vision · Production · Production Agreement · Production Pool · Contribution Ledger · Production Formation Event · Work Order · Task Lease · Grant · Master Control · Command Center · Gummy · Return · Receipt · Distribution Plan' }),
        production
          ? h('small', { text: `${production.id} · ${production.status} · ${production.runIds.length} immutable Run(s)` })
          : h('small', { text: 'No Phase 16 Production has formed yet.' })
      ])
    );
  };

  await render();
  return { node: root, refresh: render };
}
