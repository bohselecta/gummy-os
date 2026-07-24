import { el, button, sectionHeading } from '../core/dom.js';
import { makeReceipt } from '../core/protocol.js';

export function createSnackApp({ store, addReceipt, toast }) {
  const snack = store.getState().snack;
  const root = el('div');
  root.append(sectionHeading('My Snack', 'Your portable Gummy identity: recognizability, not authentication.'));

  const preview = el('div', { class: 'snack-card' }, [
    el('div', { class: `snack-visual shape-${snack.shape}`, style: `background:linear-gradient(135deg,${snack.colors.primary},${snack.colors.secondary});` }),
    el('h3', { text: snack.name }),
    el('p', { text: `${snack.handle} · ${snack.flavor}` }),
    el('div', { class: 'tag-row' }, [el('span', { class: 'tag', text: snack.visibility }), el('span', { class: 'tag', text: `companion: ${snack.companion}` })])
  ]);

  const name = el('input', { value: snack.name });
  const handle = el('input', { value: snack.handle });
  const flavor = el('input', { value: snack.flavor });
  const companion = el('input', { value: snack.companion });
  const shape = el('select', {}, ['squircle', 'orb', 'bean', 'diamond'].map(value => el('option', { value, text: value, selected: value === snack.shape })));
  const visibility = el('select', {}, ['private', 'invite', 'public'].map(value => el('option', { value, text: value, selected: value === snack.visibility })));
  const primary = el('input', { type: 'color', value: snack.colors.primary });
  const secondary = el('input', { type: 'color', value: snack.colors.secondary });
  const accent = el('input', { type: 'color', value: snack.colors.accent });

  const form = el('div', { class: 'form-grid' }, [
    field('Name', name), field('Handle', handle), field('Flavor', flavor), field('Companion', companion),
    field('Shape', shape), field('Profile visibility', visibility),
    el('div', { class: 'field full' }, [el('label', { text: 'Colors' }), el('div', { class: 'color-row' }, [primary, secondary, accent])])
  ]);

  const save = button('Save Snack', 'primary-button', () => {
    const next = {
      ...store.getState().snack,
      name: name.value.trim() || 'Gummy User',
      handle: handle.value.trim().startsWith('@') ? handle.value.trim() : `@${handle.value.trim()}`,
      flavor: flavor.value.trim() || 'original',
      companion: companion.value.trim() || 'Gummy',
      shape: shape.value,
      visibility: visibility.value,
      colors: { primary: primary.value, secondary: secondary.value, accent: accent.value }
    };
    store.setState(current => ({ ...current, snack: next, graph: { ...current.graph, snacks: current.graph.snacks.map(item => item.id === current.snack.id ? { ...item, name: next.name, handle: next.handle, flavor: next.flavor, shape: next.shape, colors: [next.colors.primary, next.colors.secondary] } : item) } }));
    addReceipt(makeReceipt({ action: 'update-snack', actor: next.handle, application: 'Snack Bar', resources: [next.id], detail: 'Updated portable identity appearance and profile metadata.' }));
    toast('Snack saved', 'Your shape, colors, and companion now follow you through Gummy.');
  });

  root.append(el('div', { class: 'app-grid' }, [preview, el('div', { class: 'snack-card' }, [form, el('div', { style: 'margin-top:16px;display:flex;gap:8px;' }, [save])]) ]));
  return { node: root };
}

function field(label, input) {
  return el('div', { class: 'field' }, [el('label', { text: label }), input]);
}
