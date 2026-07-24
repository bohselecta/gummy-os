import { el, button, sectionHeading, clear } from '../core/dom.js';
import { makeBowl, makeDrop, makeReceipt } from '../core/protocol.js';

export function createSnackGraphApp({ store, addReceipt, toast }) {
  const root = el('div');
  let active = 'snacks';

  const render = () => {
    clear(root);
    root.append(sectionHeading('Snack Graph', 'A consent-first social graph for people, agents, Bowls, Drops, projects, and shared objects.', [
      button('New Bowl', 'secondary-button', createBowl),
      button('Publish Drop', 'primary-button', publishDrop)
    ]));

    const tabs = el('div', { class: 'graph-tabs' });
    for (const id of ['snacks', 'bowls', 'drops', 'links']) {
      tabs.append(el('button', { class: `graph-tab ${active === id ? 'active' : ''}`, text: id[0].toUpperCase() + id.slice(1), onclick: () => { active = id; render(); } }));
    }
    root.append(tabs);

    if (active === 'snacks') renderSnacks();
    if (active === 'bowls') renderBowls();
    if (active === 'drops') renderDrops();
    if (active === 'links') renderLinks();
  };

  function renderSnacks() {
    const grid = el('div', { class: 'snack-grid' });
    for (const snack of store.getState().graph.snacks) {
      const visual = el('div', { class: `snack-visual shape-${snack.shape}`, style: `background:linear-gradient(135deg,${snack.colors[0]},${snack.colors[1]});` });
      const relationButton = snack.relation === 'self' ? el('span', { class: 'tag', text: 'you' }) : button(snack.relation === 'following' ? 'Following' : 'Connect', 'secondary-button', () => {
        store.setState(current => ({ ...current, graph: { ...current.graph, snacks: current.graph.snacks.map(item => item.id === snack.id ? { ...item, relation: 'following' } : item), links: [...current.graph.links, { from: current.snack.id, to: snack.id, relation: 'follows', scope: 'profile' }] } }));
        addReceipt(makeReceipt({ action: 'create-graph-link', actor: store.getState().snack.handle, application: 'Snack Graph', resources: [snack.id], detail: `Created a follow link to ${snack.handle}.` }));
        render();
      });
      grid.append(el('article', { class: 'snack-card' }, [visual, el('h3', { text: snack.name }), el('p', { text: `${snack.handle} · ${snack.flavor}` }), el('div', { class: 'tag-row' }, [el('span', { class: 'tag', text: snack.shape }), relationButton]) ]));
    }
    root.append(grid);
  }

  function renderBowls() {
    const grid = el('div', { class: 'bowl-grid' });
    for (const bowl of store.getState().graph.bowls) {
      grid.append(el('article', { class: 'bowl-card' }, [
        el('h3', { text: bowl.name }), el('p', { text: bowl.description }),
        el('div', { class: 'tag-row' }, [el('span', { class: 'tag', text: bowl.visibility }), el('span', { class: 'tag', text: `${bowl.members} members` })])
      ]));
    }
    root.append(grid);
  }

  function renderDrops() {
    const grid = el('div', { class: 'drop-grid' });
    for (const drop of store.getState().graph.drops) {
      grid.append(el('article', { class: 'drop-card' }, [
        el('h3', { text: drop.title }), el('p', { text: `${drop.author} shared to ${drop.scope}` }),
        el('div', { class: 'tag-row' }, [el('span', { class: 'tag', text: drop.kind }), el('span', { class: 'tag', text: `${drop.forks} forks` })]),
        el('div', { style: 'margin-top:12px;' }, [button('Fork to my Gummy', 'secondary-button', () => forkDrop(drop))])
      ]));
    }
    root.append(grid);
  }

  function renderLinks() {
    const rows = store.getState().graph.links.map(link => el('tr', {}, [el('td', { text: link.from }), el('td', { text: link.relation }), el('td', { text: link.to }), el('td', { text: link.scope })]));
    root.append(el('table', { class: 'table' }, [el('thead', {}, [el('tr', {}, ['From','Relationship','To','Scope'].map(text => el('th', { text })))]), el('tbody', {}, rows)]));
  }

  function createBowl() {
    const name = prompt('Name the Bowl');
    if (!name) return;
    const description = prompt('What is this Bowl for?') || '';
    const bowl = makeBowl({ name, visibility: 'invite', description });
    store.setState(current => ({ ...current, graph: { ...current.graph, bowls: [...current.graph.bowls, bowl], links: [...current.graph.links, { from: current.snack.id, to: bowl.id, relation: 'owns', scope: 'private' }] } }));
    addReceipt(makeReceipt({ action: 'create-bowl', actor: store.getState().snack.handle, application: 'Snack Graph', resources: [bowl.id], detail: `Created ${bowl.name} as an invite-only shared space.` }));
    active = 'bowls'; render();
  }

  function publishDrop() {
    const title = prompt('What are you sharing?');
    if (!title) return;
    const scope = store.getState().graph.bowls[0]?.name || 'Private';
    const drop = makeDrop({ author: store.getState().snack.handle, title, scope });
    store.setState(current => ({ ...current, graph: { ...current.graph, drops: [drop, ...current.graph.drops] } }));
    addReceipt(makeReceipt({ action: 'publish-drop', actor: store.getState().snack.handle, application: 'Snack Graph', resources: [drop.id, scope], detail: `Published a Drop to ${scope}.`, reversible: true }));
    active = 'drops'; render();
  }

  function forkDrop(drop) {
    const fork = { ...drop, id: `drop:${crypto.randomUUID()}`, author: store.getState().snack.handle, title: `${drop.title} — fork`, scope: 'My Gummy', forks: 0, createdAt: new Date().toISOString() };
    store.setState(current => ({ ...current, graph: { ...current.graph, drops: [fork, ...current.graph.drops.map(item => item.id === drop.id ? { ...item, forks: item.forks + 1 } : item)] } }));
    addReceipt(makeReceipt({ action: 'fork-drop', actor: store.getState().snack.handle, application: 'Snack Graph', resources: [drop.id, fork.id], detail: 'Created a personal fork without altering the original.' }));
    toast('Drop forked', 'Your edition is now in My Gummy.');
    render();
  }

  render();
  return { node: root };
}
