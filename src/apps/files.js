import { el, sectionHeading } from '../core/dom.js';

export function createFilesApp({ store, toast }) {
  const root = el('div');
  const render = () => {
    root.replaceChildren(sectionHeading('My Files', 'Objects in your Gummy can be files, projects, chats, apps, or shared Drops.'));
    const grid = el('div', { class: 'files-grid' });
    for (const file of store.getState().files) {
      const card = el('article', { class: 'file-card', draggable: 'true', dataset: { fileId: file.id } }, [
        el('div', { class: 'file-card-icon', text: file.type === 'markdown' ? '📝' : '📄' }),
        el('strong', { text: file.name }),
        el('small', { text: file.project })
      ]);
      card.addEventListener('dragstart', event => {
        event.dataTransfer.setData('application/x-gummy-object', file.id);
        event.dataTransfer.effectAllowed = 'copy';
      });
      card.addEventListener('dblclick', () => toast(file.name, file.content));
      grid.append(card);
    }
    root.append(grid);
  };
  render();
  return { node: root };
}
