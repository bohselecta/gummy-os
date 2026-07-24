import { el, sectionHeading } from '../core/dom.js';

export function createReceiptsApp({ store }) {
  const root = el('div');
  const receipts = [...store.getState().receipts].reverse();
  root.append(sectionHeading('Action Receipts', 'Human-readable evidence of requests, authority, resources, changes, and outcomes.'));
  if (!receipts.length) {
    root.append(el('div', { class: 'empty-state' }, [el('div', {}, [el('strong', { text: 'No consequential actions yet.' }), el('p', { text: 'Use chat, publish a Drop, change a policy, or open an external site.' })])]));
    return { node: root };
  }
  for (const receipt of receipts) {
    root.append(el('article', { class: 'receipt' }, [
      el('strong', { text: receipt.action }),
      el('small', { text: `${receipt.application} · ${receipt.actor} · ${new Date(receipt.createdAt).toLocaleString()}` }),
      el('p', { text: receipt.detail || 'Completed.' }),
      el('div', { class: 'tag-row' }, [
        el('span', { class: 'tag', text: receipt.outcome }),
        el('span', { class: 'tag', text: receipt.reversible ? 'reversible' : 'irreversible' }),
        ...receipt.resources.slice(0, 3).map(resource => el('span', { class: 'tag', text: resource }))
      ])
    ]));
  }
  return { node: root };
}
