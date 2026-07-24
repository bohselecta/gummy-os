import { el } from './core/dom.js';

export class WindowManager {
  constructor(layer) {
    this.layer = layer;
    this.windows = new Map();
    this.z = 50;
    this.offset = 0;
  }

  open({ id, title, subtitle = '', content, noPadding = false }) {
    const existing = this.windows.get(id);
    if (existing) {
      existing.hidden = false;
      this.focus(existing);
      return existing;
    }

    const windowNode = el('section', { class: 'gummy-window', 'aria-label': title });
    const left = Math.max(120, Math.min(window.innerWidth - 760, 220 + (this.offset % 5) * 28));
    const top = Math.max(0, 12 + (this.offset % 5) * 20);
    this.offset += 1;
    windowNode.style.left = `${left}px`;
    windowNode.style.top = `${top}px`;

    const close = el('button', { class: 'window-control close', 'aria-label': 'Close' });
    const minimize = el('button', { class: 'window-control minimize', 'aria-label': 'Minimize' });
    const maximize = el('button', { class: 'window-control maximize', 'aria-label': 'Maximize' });
    const bar = el('header', { class: 'window-bar' }, [
      el('div', { class: 'window-controls' }, [close, minimize, maximize]),
      el('span', { class: 'window-title', text: title }),
      el('span', { class: 'window-subtitle', text: subtitle })
    ]);
    const body = el('div', { class: `window-body ${noPadding ? 'no-padding' : ''}` }, [content]);
    windowNode.append(bar, body);
    this.layer.append(windowNode);
    this.windows.set(id, windowNode);
    this.focus(windowNode);

    close.addEventListener('click', () => { windowNode.remove(); this.windows.delete(id); });
    minimize.addEventListener('click', () => { windowNode.hidden = true; });
    maximize.addEventListener('click', () => { windowNode.classList.toggle('is-maximized'); this.focus(windowNode); });
    windowNode.addEventListener('pointerdown', () => this.focus(windowNode));
    this.makeDraggable(windowNode, bar);
    return windowNode;
  }

  focus(node) {
    node.style.zIndex = String(++this.z);
  }

  makeDraggable(node, handle) {
    let drag = null;
    handle.addEventListener('pointerdown', event => {
      if (node.classList.contains('is-maximized') || event.target.closest('.window-controls')) return;
      const rect = node.getBoundingClientRect();
      drag = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener('pointermove', event => {
      if (!drag) return;
      const maxX = window.innerWidth - Math.min(260, node.offsetWidth);
      const maxY = window.innerHeight - 170;
      node.style.left = `${Math.max(0, Math.min(maxX, event.clientX - drag.x))}px`;
      node.style.top = `${Math.max(0, Math.min(maxY, event.clientY - drag.y))}px`;
    });
    const stop = () => { drag = null; };
    handle.addEventListener('pointerup', stop);
    handle.addEventListener('pointercancel', stop);
  }
}
