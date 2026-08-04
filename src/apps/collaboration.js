import {
  DEMO_PRODUCTION_SPECIALISTS,
  DEMO_WORKER,
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
  const operator = presence.operator || {};
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
        h('small', { text: actor.role })
      ]),
      objectStatus('Presence', presence.state.replaceAll('-', ' '), truthful ? 'review' : '')
    ]),
    h('p', { text: presence.disclosure }),
    h('p', {
      class: 'phase16-possible-interaction',
      text: presence.state === 'offline'
        ? 'Possible here: leave a local message or invitation.'
        : 'Possible here: open the local text window or leave a message.'
    }),
    represented
      ? h('p', { class: 'boundary-note compact', text: 'AI represented · explicitly disclosed and Human-revocable.' })
      : null,
    h('details', { class: 'phase16-system-details' }, [
      h('summary', { text: 'Show system details' }),
      h('dl', { class: 'phase16-mini-facts' }, [
        h('dt', { text: 'Actor ID' }),
        h('dd', { text: actor.id }),
        h('dt', { text: 'Operator / Agent' }),
        h('dd', { text: operator.operatorId || 'none' }),
        h('dt', { text: 'Mold' }),
        h('dd', { text: operator.moldId || 'none' }),
        h('dt', { text: 'Grant' }),
        h('dd', { text: operator.grantId || 'none' }),
        h('dt', { text: 'Human sponsor' }),
        h('dd', { text: operator.sponsorHumanId || 'none' }),
        h('dt', { text: 'Expiry / revocation' }),
        h('dd', { text: presence.revokedAt ? `revoked ${presence.revokedAt}` : presence.expiresAt || 'not expiring' }),
        h('dt', { text: 'Authority' }),
        h('dd', { text: represented ? 'Bounded representation only; revocable' : 'No representation authority' }),
        h('dt', { text: 'Locality and runtime truth' }),
        h('dd', { text: 'This browser · deterministic local example · no remote model claimed' }),
        h('dt', { text: 'Media truth' }),
        h('dd', { text: 'Local example text only; no remote audio or video' })
      ])
    ])
  ]);
}

function socialPreview(social, presenceByActor) {
  const windows = social?.layout?.windows || [];
  return h('div', {
    class: 'phase16-layout-preview',
    dataset: { testid: 'phase16-layout-preview' },
    role: 'region',
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
      h('small', { text: windowRecord.state }),
      h('details', {}, [
        h('summary', { text: 'Show window details' }),
        h('small', { text: `${windowRecord.windowId} · ${windowRecord.width}×${windowRecord.height} at ${windowRecord.x},${windowRecord.y} · z-index ${windowRecord.zIndex} · saved revision ${social.revision}` })
      ])
    ]);
  }));
}

function progressCard(label, canonicalLabel, record, detail) {
  return h('li', {
    class: record ? 'phase16-progress-complete' : '',
    dataset: { phase16Step: label.toLowerCase().replaceAll(' ', '-') }
  }, [
    h('span', { class: 'phase16-progress-mark', 'aria-hidden': 'true', text: record ? '✓' : '○' }),
    h('div', {}, [
      h('strong', { text: label }),
      h('small', { text: record ? 'Complete in this browser' : 'Waiting for your choice' }),
      h('details', {}, [
        h('summary', { text: 'Show system step' }),
        h('small', { text: record ? `${canonicalLabel} · ${detail(record)}` : canonicalLabel })
      ])
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

function attentionCard(item, {
  openMasterControl,
  openSource,
  preference = {},
  updatePreference
}) {
  return h('article', { class: 'record-row phase16-attention-card' }, [
    h('div', {}, [
      h('strong', { text: item.title }),
      h('p', { text: `What happened: ${item.materialState.replaceAll('-', ' ')}.` }),
      h('p', { text: `Why it matters: ${item.explanation}` }),
      h('div', { class: 'button-row' }, [
        button(item.nextVerb, () => item.authorityRequired ? openMasterControl() : openSource(item)),
        button('Open source object', () => openSource(item)),
        button(preference.pinned ? 'Unpin' : 'Pin', () => updatePreference(item.id, { pinned: !preference.pinned })),
        button('Snooze 1 hour', () => updatePreference(item.id, {
          snoozedUntil: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        })),
        button('Dismiss from this view', () => updatePreference(item.id, { dismissed: true }))
      ])
    ]),
    h('div', {}, [
      objectStatus('Approval', item.authorityRequired ? 'Master Control required' : 'not required', item.class === 'blocked' ? 'review' : ''),
      h('details', {}, [
        h('summary', { text: 'Show source details' }),
        h('small', { text: `${item.sourceObject.kind} · ${item.sourceObject.id}@${item.sourceObject.revision}` }),
        h('small', { text: `Projection ${item.id} · generated by ${item.generatedBy}` }),
        h('small', { text: 'Pin, snooze, and dismiss change only this projection. The source object and its authority remain unchanged.' })
      ])
    ])
  ]);
}

function distributionCard(plan, released) {
  const label = plan.destination.type === 'private-export'
    ? 'Keep private / export'
    : plan.destination.type === 'radio'
      ? 'Prepare for Radio'
      : 'Prepare for Channels';
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
  openCanonicalRef = () => {},
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
    const preferenceRecord = await repository.get('meta', 'command-center-attention:actor:hayden');
    const preferences = preferenceRecord?.items || {};
    const updateAttentionPreference = async (id, patch) => {
      const current = await repository.get('meta', 'command-center-attention:actor:hayden');
      await repository.put('meta', {
        id: 'command-center-attention:actor:hayden',
        schema: 'gummy.command-center-preferences/v1',
        ownerActorId: 'actor:hayden',
        items: {
          ...(current?.items || {}),
          [id]: { ...(current?.items?.[id] || {}), ...patch, updatedAt: new Date().toISOString() }
        },
        updatedAt: new Date().toISOString()
      }, { validate: false });
      announce('Command Center view preference saved. The source object was not changed.');
      await render();
    };
    const visibleAttention = command.attentionItems
      .filter(item => {
        const preference = preferences[item.id] || {};
        if (preference.dismissed) return false;
        return !preference.snoozedUntil || preference.snoozedUntil <= new Date().toISOString();
      })
      .sort((left, right) => Number(Boolean(preferences[right.id]?.pinned)) - Number(Boolean(preferences[left.id]?.pinned)));
    const openAttentionSource = item => openCanonicalRef({
      kind: item.sourceObject.kind,
      id: item.sourceObject.id,
      revision: item.sourceObject.revision
    });

    const createRunButton = (testid = null) => button('Open the Demo Production', async event => {
      const target = event.currentTarget;
      target.disabled = true;
      target.textContent = 'Sending to Demo Worker…';
      try {
        const result = await runLivingCollaborationProof(repository, currentRuntime, {
          persistProductionRuntime: async runtime => {
            currentRuntime = runtime;
            await persistProductionRuntime(runtime);
          }
        });
        currentRuntime = result.runtime;
        announce('Demo Production complete. Demo Worker returned $0.00 actual cost. Nothing was published remotely. Review what came back, then continue.');
        await render();
      } catch (error) {
        target.disabled = false;
        target.textContent = 'Open the Demo Production';
        announce(`Demo Production blocked: ${error.message}`);
      }
    }, 'button primary', testid ? { dataset: { testid } } : {});

    const laneBoard = command.lanes || { now: [], next: [], delegated: [], review: [], blocked: [], done: [], worker: DEMO_WORKER };
    const laneCard = (title, items, testid) => h('article', {
      class: 'phase16-lane',
      dataset: { testid }
    }, [
      h('header', {}, [
        h('strong', { text: title }),
        h('span', { text: String(items.length) })
      ]),
      items.length
        ? h('ul', {}, items.slice(0, 6).map(item => h('li', {}, [
          h('strong', { text: item.title }),
          h('small', { text: [item.status, item.detail].filter(Boolean).join(' · ') })
        ])))
        : h('p', { class: 'empty-inline', text: 'Nothing here yet.' })
    ]);

    root.replaceChildren(
      h('header', { class: 'phase16-hero' }, [
        h('div', {}, [
          h('p', { class: 'eyebrow', text: 'COMMAND CENTER · NO ORPHANED WORK' }),
          h('h2', { text: 'Your work should not disappear into AI chats.' }),
          h('p', {
            class: 'lede',
            text: 'Open a saved group, shape an idea into a Production, review cost and permissions, send work to a labeled Demo Worker, then Accept what came back. Productions, Work Orders, and Receipts keep the loop durable.'
          }),
          h('details', { class: 'phase16-how-it-works' }, [
            h('summary', { text: 'How this works' }),
            h('p', { text: 'Zeke explains and routes what appears here. Glopper remains the separate companion. Neither can silently rank your goals, approve, spend, execute, publish, or assign ownership.' }),
            h('p', { text: 'The Command Center is a generated, non-executing view over exact local records. You may open and change the underlying objects individually.' })
          ])
        ]),
        h('aside', { class: 'phase16-authority-law' }, [
          h('strong', { text: 'This page helps you understand and choose.' }),
          h('span', { text: 'Master Control decides what is allowed.' }),
          h('small', { text: 'Nothing runs merely because it appears here.' })
        ])
      ]),
      h('section', {
        class: 'phase16-demo-doorway',
        dataset: { testid: 'demo-production-doorway' },
        'aria-label': 'Demo Production doorway'
      }, [
        h('p', { class: 'eyebrow', text: 'THREE-MINUTE DEMO · LOCAL ONLY' }),
        h('h3', { text: 'Create a collaborative 30-second AI video.' }),
        h('p', {
          text: `People: ${PHASE16_ACTORS.map(actor => actor.address || `@${actor.name}`).join(', ')}. Specialists: ${DEMO_PRODUCTION_SPECIALISTS.map(item => item.address).join(', ')}. Worker: ${DEMO_WORKER.label}.`
        }),
        h('ol', { class: 'phase16-stranger-steps' }, [
          h('li', { text: 'Open Actor Home / this Command Center' }),
          h('li', { text: 'Save the Shared Vision, then form the Production' }),
          h('li', { text: 'Review cost, contribution split, permissions, and destination' }),
          h('li', { text: `Approve dispatch to the labeled ${DEMO_WORKER.label}` }),
          h('li', { text: 'Inspect the Return and Receipt, then Accept once' }),
          h('li', { text: 'Resume with a clear next action' })
        ]),
        h('div', { class: 'button-row' }, [
          createRunButton('phase16-run-proof'),
          button('Open this group', () => openSocialInstance(social, { resume: false }), 'button'),
          button('Open Master Control', openMasterControl)
        ]),
        h('p', {
          class: 'boundary-note compact',
          dataset: { testid: 'demo-worker-label' },
          text: DEMO_WORKER.disclosure
        })
      ]),
      h('div', { class: 'phase16-command-metrics' }, [
        commandMetric('Active Productions', command.activeProductions),
        commandMetric('Saved groups', command.activeSocialInstances),
        commandMetric('Shared Visions', command.sharedVisions),
        commandMetric('Waiting decisions', command.waitingHumanDecisions),
        commandMetric('Returns', command.returns),
        commandMetric('Receipts', command.receipts)
      ]),
      section('What needs attention', 'COMMAND CENTER LANES · PERSISTED STATE', [
        h('div', {
          class: 'phase16-lane-board',
          dataset: { testid: 'command-center-lanes' }
        }, [
          laneCard('Now', laneBoard.now, 'lane-now'),
          laneCard('Next', laneBoard.next, 'lane-next'),
          laneCard('Delegated', laneBoard.delegated, 'lane-delegated'),
          laneCard('Review', laneBoard.review, 'lane-review'),
          laneCard('Blocked', laneBoard.blocked, 'lane-blocked'),
          laneCard('Done', laneBoard.done, 'lane-done')
        ]),
        h('p', { class: 'boundary-note compact', text: 'Lanes are a non-executing projection. Master Control remains the authority layer.' })
      ]),
      section('Friday Brainstorm Crew', 'LOCAL EXAMPLE · OPEN A SAVED GROUP', [
        h('p', { class: 'boundary-note', text: 'This example demonstrates the complete model using private records in this browser. It does not imply real contacts, remote presence, payment, publication, or ownership.' }),
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
      section('Who is available here?', 'LOCAL EXAMPLE · ACTOR PRESENCE', [
        h('div', { class: 'phase16-presence-grid' }, PHASE16_ACTORS.map(actor => presenceCard(actor, presenceByActor[actor.id]))),
        h('p', { class: 'boundary-note compact', text: 'Human-live means this local browser fixture only. AI represented is disclosed with Agent, Mold, Grant, Human sponsor, scope, expiry, exclusions, and revocation. No remote audio/video is claimed.' })
      ]),
      section('Choose a part to inspect or create', 'LOCAL EXAMPLE · OPTIONAL COMPLETE JOURNEY', [
        h('ol', { class: 'phase16-progress' }, [
          progressCard('Restore saved group', 'Social Instance', social, record => `${record.layout.windows.length} windows · revision ${record.revision}`),
          progressCard('Save the idea', 'Shared Vision', sharedVision, record => `${record.origin.recordRefs.length} exact selected records · no execution`),
          progressCard('Agree how to make it', 'Production Agreement', agreement, record => `revision ${record.revision} · ${record.approvals.length} Actor approvals`),
          progressCard('Review cost & contribution', 'Cost Review', originalPool, record => `${record.allocations.map(item => money(item.maximumAmount)).join(' / ')} maximums · ${DEMO_WORKER.label}`),
          progressCard('Set contribution limits', 'Production Pool', originalPool, record => `${record.allocations.map(item => money(item.maximumAmount)).join(' / ')} maximums`),
          progressCard('Invite another contributor', 'Production Pool revision proposal', revisedPool, record => `${record.allocations.length} future shares · prior authorizations unchanged`),
          progressCard('Record contributions', 'Contribution Ledger', ledger, record => `${record.entries.length} append-only entries · revision ${record.revision}`),
          progressCard('Form the Production', 'Production Formation Event', formation, record => `${record.id} · immutable`),
          progressCard('Approve dispatch', 'Make Production', run, record => `${record.id} · ${record.status} · ${money(record.policy.costCeiling)} run ceiling · ${DEMO_WORKER.label}`),
          progressCard('Accept the result', 'Human acceptance', accepted, record => `${record.id} · ${record.acceptance.role}`),
          progressCard('Prepare destinations', 'Distribution Plans', plans.length ? { id: 'plans', length: plans.length } : null, record => `${record.length} separate destinations`),
          progressCard('Release one destination', 'Distribution Release', releases[0], record => `${record.destination.type} · ${money(record.cost.amount)} actual`)
        ]),
        h('div', { class: 'button-row' }, [
          createRunButton(),
          button('Open Master Control', openMasterControl)
        ]),
        h('p', { class: 'boundary-note compact', text: `Creates the remaining example records in this browser, uses the governed ${DEMO_WORKER.label}, charges $0.00, and publishes nothing remotely.` }),
        h('p', { text: 'This is optional. You can instead inspect and manipulate individual objects through Composer and the sections below.' })
      ], { dataset: { testid: 'phase16-proof-status' } }),
      h('div', { class: 'phase16-split' }, [
        section('Saved idea', 'SHARED VISION', sharedVision ? [
          objectStatus('Status', sharedVision.status.replaceAll('-', ' ')),
          h('h4', { text: sharedVision.goal }),
          h('p', { text: sharedVision.intent }),
          h('p', { text: `People: ${sharedVision.participantActorIds.map(actorId => PHASE16_ACTORS.find(actor => actor.id === actorId)?.name || actorId).join(', ')}.` }),
          h('strong', { text: 'Included in the idea' }),
          h('ul', {}, sharedVision.volunteeredContributions.map(item => h('li', { text: item.description }))),
          h('strong', { text: 'Kept private' }),
          h('p', { text: 'Unselected conversation, private budget details, credentials, and one deliberately excluded message.' }),
          h('p', { class: 'boundary-note compact', text: 'Saving this idea creates no authority, spending, ownership, publication, or execution.' }),
          h('details', {}, [
            h('summary', { text: 'Show provenance' }),
            h('p', { text: `${sharedVision.id}@${sharedVision.revision} · source ${sharedVision.origin.sourceId}` }),
            h('ul', {}, sharedVision.origin.recordRefs.map(item => h('li', { text: `${item.id}@${item.revision} · sha256:${item.hash}` }))),
            h('p', { text: `Explicit exclusions: ${sharedVision.origin.explicitExclusions.join(', ')}` })
          ])
        ] : [emptyState('Select exact Session records to create a non-executing Shared Vision.')]),
        section('How the group agreed to make it', 'PRODUCTION AGREEMENT', agreement ? [
          h('dl', { class: 'phase16-mini-facts' }, [
            h('dt', { text: 'Who decides?' }), h('dd', { text: 'The three participants decide together; protected decisions are unanimous.' }),
            h('dt', { text: 'How will people be credited?' }), h('dd', { text: 'Creative credit is separate and requires approval.' }),
            h('dt', { text: 'Who owns what?' }), h('dd', { text: 'Undecided. Contribution never creates ownership automatically.' }),
            h('dt', { text: 'Is anyone being paid?' }), h('dd', { text: 'No compensation is promised in this local example.' }),
            h('dt', { text: 'How would revenue be handled?' }), h('dd', { text: 'Undecided; there is no automatic participation.' }),
            h('dt', { text: 'Who may publish?' }), h('dd', { text: 'Only after a separate exact publication approval.' })
          ]),
          h('details', {}, [
            h('summary', { text: 'Show agreement details' }),
            h('p', { text: `${agreement.id}@${agreement.revision} · ${agreement.status} · governance ${agreement.governance}` }),
            h('p', { text: `${agreement.approvals.length} exact-revision approvals. Any amendment creates a new revision and makes stale approvals invalid: ${String(agreement.amendmentPolicy.staleApprovalsInvalid)}.` })
          ])
        ] : [emptyState('The exact Agreement revision has not been approved.')])
      ]),
      section('Review cost, contribution, permissions, outputs, destination', 'COST REVIEW', [
        h('p', { class: 'phase16-law', text: "These are individual maximum authorizations, not collected money. Nobody's limit changes until that person approves a new revision." }),
        h('p', { class: 'boundary-note', dataset: { testid: 'cost-review-worker' }, text: `Dispatch target: ${DEMO_WORKER.label}. Live providers stay unavailable unless separately connected — never a silent fake fallback.` }),
        poolTable(originalPool, revisedPool),
        h('details', {}, [
          h('summary', { text: 'Show authorization and reconciliation evidence' }),
          h('div', { class: 'phase16-pool-truth' }, [
            objectStatus('Custody', originalPool?.custodyModel || 'no Pool yet'),
            objectStatus('Internal currency', originalPool?.internalCurrency ? 'yes' : 'no'),
            objectStatus('Actual charge', money(originalPool?.actual?.charged || 0))
          ]),
          originalPool ? h('p', { text: `${originalPool.id}@${originalPool.revision} · ${originalPool.allocations.map(item => item.authorizationId).join(', ')} · provider evidence complete: ${String(originalPool.actual.providerEvidenceComplete)}` }) : null
        ])
      ], { dataset: { testid: 'phase16-pool' } }),
      h('div', { class: 'phase16-split' }, [
        section('What each person contributed', 'CONTRIBUTION LEDGER', ledger ? [
          h('p', { class: 'phase16-law', text: 'The Ledger records what happened. The Agreement determines what it means.' }),
          h('div', { class: 'record-list' }, ledger.entries.slice().reverse().map(entry => h('article', { class: 'record-row' }, [
            h('div', {}, [
              h('strong', { text: entry.description }),
              h('small', { text: `${PHASE16_ACTORS.find(actor => actor.id === entry.contributorActorId)?.name || 'Local contributor'} · ${entry.status}` }),
              h('details', {}, [
                h('summary', { text: 'Show contribution details' }),
                h('small', { text: `${entry.id} · ${entry.contributorActorId} · ${entry.category} · revision ${ledger.revision}` }),
                h('small', { text: `Evidence: ${entry.evidenceRefs.map(ref => `${ref.id}@${ref.revision}`).join(', ')}` })
              ])
            ]),
            h('small', { text: `ownership: ${entry.ownershipEffect.automatic ? 'automatic' : 'not automatic'}` })
          ])))
        ] : [emptyState('No contributions have been recorded.')]),
        section('The Production was formed', 'PRODUCTION FORMATION EVENT', formation ? [
          objectStatus('Formation', 'immutable'),
          h('p', { text: 'The group approved the exact agreement and formed a Production. No work ran during formation.' }),
          h('details', {}, [
            h('summary', { text: 'Show formation evidence' }),
            h('h4', { text: formation.productionId }),
            h('p', { text: `${formation.sharedVisionId}@${formation.sharedVisionRevision} → ${formation.agreementId}@${formation.agreementRevision}` }),
            h('p', { text: `${formation.initialActors.length} founding Actors · Receipt ${formation.receiptId}` })
          ]),
          h('p', { class: 'boundary-note compact', text: 'Make Production remains a later, separately approved execution transition.' })
        ] : [emptyState('Formation waits for the exact Shared Vision, Agreement, Pool, and Ledger.')])
      ]),
      section('Things you may choose to review', 'COMMAND CENTER ATTENTION', [
        visibleAttention.length
          ? h('div', { class: 'record-list' }, visibleAttention.map(item => attentionCard(item, {
              openMasterControl,
              openSource: openAttentionSource,
              preference: preferences[item.id],
              updatePreference: updateAttentionPreference
            })))
          : emptyState('No current attention items. Command Center remains a generated non-executing projection.'),
        h('details', {}, [
          h('summary', { text: 'Show source details' }),
          h('p', { class: 'boundary-note compact', text: `Projection generated ${command.generatedAt}. Authority source: ${command.authoritySource}. Executing: ${String(command.executing)}.` }),
          h('p', { text: command.sourceRevisions.map(item => `${item.id}@${item.revision ?? 'unrevisioned'}`).join(' · ') })
        ])
      ], { dataset: { testid: 'phase16-attention' } }),
      section('What came back / what happens next', 'RETURN · ACCEPTANCE · RESUME', [
        accepted
          ? h('div', { class: 'phase16-next-action', dataset: { testid: 'next-action-card' } }, [
            h('strong', { text: 'Accepted once. Canonical Production advanced.' }),
            h('p', { text: `${accepted.id} · ${accepted.acceptance?.role || 'accepted'}. Choose a destination below, open the Receipts surface, or continue the saved group.` }),
            h('div', { class: 'button-row' }, [
              button('Continue the group', async () => {
                const resumed = await resumeSocialInstance(repository, social.id);
                await openSocialInstance(resumed.socialInstance, { resume: true });
              }, 'button primary'),
              button('Open Master Control', openMasterControl)
            ])
          ])
          : run
            ? h('p', { text: 'A Return is ready for Human acceptance. Accepting updates canonical Production state exactly once.' })
            : h('p', { text: 'After Demo Worker returns, inspect artifacts, Evidence, cost, attribution, and Receipt before Accept.' })
      ]),
      section('Choose where an accepted result could go', 'DISTRIBUTION', plans.length ? [
        h('div', { class: 'card-grid phase16-distribution-grid' }, plans.map(plan => distributionCard(plan, releases))),
        h('p', { class: 'phase16-law', text: 'Accepting a result never publishes it.' }),
        h('p', { class: 'boundary-note compact', text: 'Prepared, blocked, approved, released, and published are different states. Radio, Channels, and private export remain separate versioned plans.' })
      ] : [
        emptyState('Distribution waits for an exact Human-accepted Artifact revision.')
      ], { dataset: { testid: 'phase16-distribution' } }),
      h('footer', { class: 'phase16-footer' }, [
        h('strong', { text: 'The full architecture is still here.' }),
        h('details', {}, [
          h('summary', { text: 'Show the system objects behind this view' }),
          h('p', { text: 'Human · Actor · Agent · Mold · Bowl · Session · Social Instance · Shared Vision · Production · Production Agreement · Production Pool · Contribution Ledger · Production Formation Event · Work Order · Task Lease · Grant · Master Control · Command Center · Gummy · Return · Receipt · Distribution Plan' }),
          production
            ? h('small', { text: `${production.id} · ${production.status} · ${production.runIds.length} immutable Run(s)` })
            : h('small', { text: 'No local-example Production has formed yet.' })
        ])
      ])
    );
  };

  await render();
  return { node: root, refresh: render };
}
