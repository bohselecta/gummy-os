import { el, button, sectionHeading, clear } from '../core/dom.js';
import { makeReceipt } from '../core/protocol.js';

export function createEnterpriseApp({ store, addReceipt, toast }) {
  const root = el('div');
  let view = 'overview';

  const render = () => {
    clear(root);
    const enterprise = store.getState().enterprise;
    root.append(sectionHeading('Enterprise Habitat', `${enterprise.organization.name} · ${enterprise.organization.deployment}`, [
      button('Policies', 'secondary-button', () => { view = 'policies'; render(); }),
      button('App Packs', 'secondary-button', () => { view = 'packs'; render(); }),
      button('Overview', 'primary-button', () => { view = 'overview'; render(); })
    ]));
    if (view === 'overview') renderOverview(enterprise);
    if (view === 'policies') renderPolicies(enterprise);
    if (view === 'packs') renderPacks(enterprise);
  };

  function renderOverview(enterprise) {
    root.append(el('div', { class: 'metric-grid' }, [
      metric(String(enterprise.organization.seats), 'Seats'),
      metric(String(enterprise.appPacks.length), 'Application Packs'),
      metric(String(enterprise.runtimes.filter(item => item.status === 'ready').length), 'Ready runtime pools'),
      metric(`${enterprise.policies.receiptRetentionDays}d`, 'Receipt retention')
    ]));
    root.append(el('div', { class: 'app-grid' }, [
      panel('Identity & Access', 'Passkeys, organization identity, roles, service accounts, and delegated agents.', '◉'),
      panel('Model Broker', 'Routes tasks to organization-approved local, hosted, or private models.', '✦'),
      panel('Connector Broker', 'Keeps long-lived credentials outside model context and issues bounded actions.', '⇄'),
      panel('Runtime Pools', 'Web-native, Wasm, Linux compatibility, and governed cloud capsules.', '⬡'),
      panel('Pack Registry', 'Signed vendor knowledge, capabilities, workflows, policy, tests, and recovery.', '▣'),
      panel('Audit & Receipts', 'Tamper-evident evidence, retention, export, and incident reconstruction.', '✓')
    ]));
    root.append(el('div', { style: 'margin-top:18px;' }, [
      el('h3', { text: 'Runtime matrix' }),
      el('table', { class: 'table' }, [
        el('thead', {}, [el('tr', {}, ['Pool', 'Status', 'Isolation'].map(text => el('th', { text })))]),
        el('tbody', {}, enterprise.runtimes.map(runtime => el('tr', {}, [
          el('td', { text: runtime.name }),
          el('td', {}, [el('span', { class: `status ${runtime.status === 'ready' ? '' : 'review'}`, text: runtime.status })]),
          el('td', { text: runtime.isolation })
        ])))
      ])
    ]));
  }

  function renderPolicies(enterprise) {
    const definitions = [
      ['externalNetwork', 'External network', 'Controls whether agents can reach unapproved internet destinations.'],
      ['destructiveActions', 'Destructive actions', 'Controls deletion, replacement, publication, purchasing, and irreversible operations.'],
      ['modelRouting', 'Model routing', 'Limits tasks to approved model providers, regions, and data-handling classes.'],
      ['publicSharing', 'Public sharing', 'Controls whether people or agents can publish objects outside the organization.']
    ];
    const grid = el('div', { class: 'policy-grid' });
    for (const [key, title, description] of definitions) {
      const select = el('select', {}, ['disabled', 'approval', 'confirm', 'organization-approved', 'allowed'].map(value => el('option', { value, text: value, selected: enterprise.policies[key] === value })));
      select.addEventListener('change', () => updatePolicy(key, select.value));
      grid.append(el('article', { class: 'policy-card' }, [el('header', {}, [el('strong', { text: title }), select]), el('p', { text: description })]));
    }
    root.append(grid);
  }

  function renderPacks(enterprise) {
    root.append(el('table', { class: 'table' }, [
      el('thead', {}, [el('tr', {}, ['Application Pack', 'Vendor', 'Capabilities', 'Status', 'Action'].map(text => el('th', { text })))]),
      el('tbody', {}, enterprise.appPacks.map(pack => el('tr', {}, [
        el('td', { text: pack.name }),
        el('td', { text: pack.vendor }),
        el('td', { text: String(pack.capabilities) }),
        el('td', {}, [el('span', { class: `status ${pack.status === 'verified' ? '' : 'review'}`, text: pack.status })]),
        el('td', {}, [button(pack.status === 'verified' ? 'Inspect' : 'Verify', 'secondary-button', () => verifyPack(pack))])
      ])))
    ]));
  }

  function updatePolicy(key, value) {
    store.setState(current => ({ ...current, enterprise: { ...current.enterprise, policies: { ...current.enterprise.policies, [key]: value } } }));
    addReceipt(makeReceipt({ action: 'update-enterprise-policy', actor: store.getState().snack.handle, application: 'Enterprise Habitat', resources: [`policy:${key}`], detail: `Changed ${key} to ${value}.`, reversible: true }));
    toast('Policy updated', `${key} is now ${value}.`);
  }

  function verifyPack(pack) {
    if (pack.status === 'verified') {
      toast(pack.name, 'Verified pack: signed manifest, typed capabilities, workflow recipes, policy rules, verification tests, and recovery contract.');
      return;
    }
    store.setState(current => ({ ...current, enterprise: { ...current.enterprise, appPacks: current.enterprise.appPacks.map(item => item.id === pack.id ? { ...item, status: 'verified' } : item) } }));
    addReceipt(makeReceipt({ action: 'verify-app-pack', actor: store.getState().snack.handle, application: 'Enterprise Habitat', resources: [pack.id], detail: `Marked ${pack.name} verified in the demo registry.` }));
    render();
  }

  render();
  return { node: root };
}

function metric(value, label) {
  return el('article', { class: 'metric-card' }, [el('strong', { text: value }), el('span', { text: label })]);
}

function panel(title, description, icon) {
  return el('article', { class: 'app-card' }, [el('span', { class: 'app-card-icon', text: icon }), el('span', {}, [el('strong', { text: title }), el('small', { text: description })])]);
}
