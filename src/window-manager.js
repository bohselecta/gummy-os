export class WindowManager {
  constructor(layer, repository) {
    this.layer = layer;
    this.repository = repository;
    this.windows = new Map();
    this.z = 50;
  }

  async open({ id, title, subtitle = 'Gummy Canvas', content }) {
    const existing = this.windows.get(id);
    if (existing) {
      existing.hidden = false;
      this.focus(existing);
      return existing;
    }
    const saved = await this.repository.get('meta', `window:${id}`);
    const node = document.createElement('section');
    node.className = 'gummy-window';
    node.dataset.windowId = id;
    node.setAttribute('aria-label', `${title} window`);
    Object.assign(node.style, {
      left: `${saved?.left ?? Math.max(24, Math.min(innerWidth - 760, 140 + this.windows.size * 28))}px`,
      top: `${saved?.top ?? 20 + this.windows.size * 18}px`,
      width: saved?.width ? `${saved.width}px` : '',
      height: saved?.height ? `${saved.height}px` : ''
    });
    const bar = document.createElement('header');
    bar.className = 'window-bar';
    const controls = document.createElement('div');
    controls.className = 'window-controls';
    for (const [action, label] of [['close', 'Close'], ['minimize', 'Minimize'], ['maximize', 'Maximize']]) {
      const button = document.createElement('button');
      button.className = `window-control ${action}`;
      button.setAttribute('aria-label', `${label} ${title}`);
      button.dataset.windowAction = action;
      controls.append(button);
    }
    const titleNode = document.createElement('span');
    titleNode.className = 'window-title';
    titleNode.textContent = title;
    const subtitleNode = document.createElement('span');
    subtitleNode.className = 'window-subtitle';
    subtitleNode.textContent = subtitle;
    bar.append(controls, titleNode, subtitleNode);
    const body = document.createElement('div');
    body.className = 'window-body';
    body.append(content);
    node.append(bar, body);
    this.layer.append(node);
    this.windows.set(id, node);
    if (saved?.maximized) node.classList.add('is-maximized');
    if (saved?.hidden) node.hidden = true;
    this.focus(node);
    controls.addEventListener('click', event => this.control(id, event.target.dataset.windowAction));
    node.addEventListener('pointerdown', () => this.focus(node));
    new ResizeObserver(() => this.persist(id)).observe(node);
    this.draggable(id, bar);
    return node;
  }

  async control(id, action) {
    const node = this.windows.get(id);
    if (!node) return;
    if (action === 'close') {
      node.remove();
      this.windows.delete(id);
      await this.repository.delete('meta', `window:${id}`);
    }
    if (action === 'minimize') node.hidden = true;
    if (action === 'maximize') node.classList.toggle('is-maximized');
    await this.persist(id);
  }

  focus(node) {
    node.style.zIndex = String(++this.z);
    for (const candidate of this.windows.values()) candidate.dataset.focused = String(candidate === node);
    void this.persist(node.dataset.windowId);
  }

  async persist(id) {
    const node = this.windows.get(id);
    if (!node || !node.isConnected) return;
    const rect = node.getBoundingClientRect();
    await this.repository.put('meta', {
      id: `window:${id}`, left: Math.round(rect.left), top: Math.round(rect.top),
      width: Math.round(rect.width), height: Math.round(rect.height),
      z: Number(node.style.zIndex || 0), hidden: node.hidden, maximized: node.classList.contains('is-maximized'),
      updatedAt: new Date().toISOString()
    }, { validate: false });
  }

  draggable(id, handle) {
    let drag;
    handle.addEventListener('pointerdown', event => {
      const node = this.windows.get(id);
      if (node.classList.contains('is-maximized') || event.target.closest('.window-controls')) return;
      const rect = node.getBoundingClientRect();
      drag = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener('pointermove', event => {
      if (!drag) return;
      const node = this.windows.get(id);
      node.style.left = `${Math.max(0, Math.min(innerWidth - 260, event.clientX - drag.x))}px`;
      node.style.top = `${Math.max(0, Math.min(innerHeight - 170, event.clientY - drag.y))}px`;
    });
    const stop = () => {
      drag = null;
      void this.persist(id);
    };
    handle.addEventListener('pointerup', stop);
    handle.addEventListener('pointercancel', stop);
  }
}
