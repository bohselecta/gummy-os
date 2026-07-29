import { connectionCatalog } from '../core/calm-workspace.js';

function h(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (['disabled', 'open'].includes(key)) node[key] = value;
    else node.setAttribute(key, String(value));
  }
  for (const child of Array.isArray(children) ? children : [children]) {
    if (child == null) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

function statusLabel(state) {
  return {
    connected: 'Connected',
    'needs-setup': 'Needs setup',
    unavailable: 'Unavailable',
    planned: 'Planned',
    blocked: 'Blocked'
  }[state] || state;
}

export async function createConnectionsApp({
  session,
  specialistAdapters,
  registryApplications,
  openStorage,
  announce
}) {
  let lastVerifiedAt = null;
  const root = h('div', { class: 'connections-surface', dataset: { testid: 'connections-surface' } });

  const render = () => {
    const connections = connectionCatalog({ session, registryApplications, lastVerifiedAt });
    root.replaceChildren(
      h('header', { class: 'connections-header' }, [
        h('div', {}, [
          h('p', { class: 'eyebrow', text: 'CONNECTIONS & RUNTIMES' }),
          h('h2', { text: 'One truthful home for every connection' }),
          h('p', { class: 'lede', text: 'See what is connected, what it can receive, where it runs, what it may cost, and what still needs your action.' })
        ]),
        h('p', { class: 'boundary-note compact', text: 'Gummy never probes localhost automatically. Testing a local companion is a separate Human action and never starts a Job.' })
      ]),
      h('div', { class: 'connections-grid' }, connections.map(connection => h('article', {
        class: 'connection-card',
        dataset: { connectionId: connection.id, connectionState: connection.state }
      }, [
        h('div', { class: 'connection-heading' }, [
          h('div', {}, [
            h('span', { class: 'eyebrow', text: connection.category }),
            h('h3', { text: connection.name })
          ]),
          h('span', { class: `status ${['blocked', 'unavailable'].includes(connection.state) ? 'review' : ''}`, text: statusLabel(connection.state) })
        ]),
        h('p', { text: connection.capability }),
        h('dl', { class: 'connection-facts' }, [
          h('dt', { text: 'Used by' }), h('dd', { text: connection.users }),
          h('dt', { text: 'Runs' }), h('dd', { text: connection.locality }),
          h('dt', { text: 'May receive' }), h('dd', { text: connection.dataClasses.join(', ') }),
          h('dt', { text: 'Cost and limits' }), h('dd', { text: connection.cost }),
          h('dt', { text: 'Last verified' }), h('dd', { text: connection.lastVerifiedAt })
        ]),
        h('div', { class: 'button-row' }, [
          connection.action === 'test-imagehoss'
            ? h('button', {
                type: 'button',
                class: 'button',
                onclick: async event => {
                  const button = event.currentTarget;
                  button.disabled = true;
                  button.textContent = 'Testing…';
                  const adapter = specialistAdapters.resolve('actor:imagehoss');
                  if (!adapter) {
                    announce('ImageHoss needs setup. The bounded specialist adapter is unavailable.');
                    button.disabled = false;
                    button.textContent = 'Test connection';
                    return;
                  }
                  const result = await adapter.discover();
                  lastVerifiedAt = result.checkedAt || new Date().toISOString();
                  announce(result.authenticated
                    ? 'ImageHoss connection verified. No creative Job ran.'
                    : `ImageHoss needs setup. ${result.comfyui?.limitations?.[0] || 'The local companion did not answer.'}`);
                  render();
                }
              }, 'Test connection')
            : null,
          connection.action === 'open-storage'
            ? h('button', { type: 'button', class: 'button', onclick: openStorage }, 'Open setup')
            : null,
          h('details', { class: 'connection-details' }, [
            h('summary', { text: 'Exact technical details' }),
            h('p', { text: `Connection ID: ${connection.id}` }),
            h('p', { text: `Registry state: ${connection.state}` }),
            h('p', { text: 'Credential values are never shown in browser state, logs, or this surface.' })
          ])
        ])
      ])))
    );
  };

  render();
  return root;
}
