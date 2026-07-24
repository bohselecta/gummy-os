import { el, sectionHeading } from '../core/dom.js';

export function createLauncherApp({ apps, openApp }) {
  const root = el('div');
  root.append(sectionHeading('Applications', 'Everything in Gummy is a capability surface, not merely an icon.'));
  const grid = el('div', { class: 'app-grid' });
  for (const app of Object.values(apps).filter(item => item.id !== 'launcher')) {
    grid.append(el('button', { class: 'app-card', onclick: () => openApp(app.id) }, [
      el('span', { class: 'app-card-icon', text: app.icon }),
      el('span', {}, [el('strong', { text: app.title }), el('small', { text: app.description })])
    ]));
  }
  root.append(grid);
  return { node: root };
}
