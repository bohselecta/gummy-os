import {
  CALM_NOTIFICATION_HISTORY_ID,
  coalesceNotification,
  inferNotificationKind,
  notificationDuration,
  notificationGroupKey
} from './core/calm-workspace.js';

function element(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else node.setAttribute(key, String(value));
  }
  for (const child of Array.isArray(children) ? children : [children]) {
    if (child == null) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export class NotificationCenter {
  constructor({ repository, announcer, openHistory = () => {} }) {
    this.repository = repository;
    this.announcer = announcer;
    this.openHistory = openHistory;
    this.layer = null;
    this.current = null;
    this.timeout = null;
    this.pointerStart = null;
    this.persistQueue = Promise.resolve();
    this.onKeydown = event => {
      if (event.key === 'Escape' && this.current) this.dismiss('keyboard');
    };
  }

  mount(layer) {
    this.layer = layer;
    document.removeEventListener('keydown', this.onKeydown);
    document.addEventListener('keydown', this.onKeydown);
    this.render();
  }

  async notify(message, options = {}) {
    const timestamp = new Date().toISOString();
    const kind = inferNotificationKind(message, options.kind);
    const incoming = {
      id: options.id || `notification:${crypto.randomUUID()}`,
      title: options.title || 'Gummy OS',
      message,
      kind,
      groupKey: notificationGroupKey(message, options.groupKey),
      sourceRef: options.sourceRef || null,
      createdAt: timestamp,
      updatedAt: timestamp,
      events: [{ message, at: timestamp }]
    };
    this.current = coalesceNotification(this.current, incoming);
    this.persistQueue = this.persistQueue
      .catch(() => undefined)
      .then(() => this.persist(incoming));
    await this.persistQueue;
    this.announce(this.current);
    this.render();
    this.schedule();
    return structuredClone(this.current);
  }

  announce(notification) {
    if (!this.announcer) return;
    const count = notification.count > 1 ? ` ${notification.count} related updates.` : '';
    this.announcer.textContent = `${notification.message}${count}`;
  }

  async persist(incoming) {
    const record = await this.repository.get('meta', CALM_NOTIFICATION_HISTORY_ID);
    const history = structuredClone(record?.notifications || []);
    const latest = history.at(-1);
    if (latest?.groupKey === incoming.groupKey) history[history.length - 1] = coalesceNotification(latest, incoming);
    else history.push({ ...incoming, count: 1 });
    await this.repository.put('meta', {
      id: CALM_NOTIFICATION_HISTORY_ID,
      schema: 'gummy.notification-history/v1',
      ownerActorId: 'actor:hayden',
      notifications: history.slice(-100),
      updatedAt: incoming.updatedAt
    }, { validate: false });
  }

  schedule() {
    clearTimeout(this.timeout);
    const duration = notificationDuration(this.current?.kind);
    if (duration) this.timeout = setTimeout(() => this.dismiss('timeout'), duration);
  }

  dismiss(reason = 'dismissed') {
    clearTimeout(this.timeout);
    this.timeout = null;
    if (!this.current) return;
    this.current.dismissedBy = reason;
    this.current = null;
    this.render();
  }

  render() {
    if (!this.layer) return;
    this.layer.replaceChildren();
    if (!this.current) return;
    const notification = this.current;
    const toast = element('div', {
      class: `toast toast-${notification.kind}`,
      role: notification.kind === 'warning' || notification.kind === 'decision' ? 'alert' : 'status',
      dataset: {
        notificationId: notification.id,
        notificationKind: notification.kind,
        notificationCount: String(notification.count || 1)
      }
    }, [
      element('div', { class: 'toast-copy' }, [
        element('strong', { text: notification.title }),
        element('span', { text: notification.message }),
        notification.count > 1
          ? element('small', { text: `${notification.count} related updates coalesced` })
          : null
      ]),
      notification.kind === 'warning' || notification.kind === 'decision'
        ? element('div', { class: 'toast-actions' }, [
            element('button', {
              type: 'button',
              class: 'toast-action',
              'aria-label': 'Open notification history',
              onclick: () => this.openHistory()
            }, 'History'),
            element('button', {
              type: 'button',
              class: 'toast-action',
              'aria-label': 'Dismiss notification',
              onclick: () => this.dismiss('button')
            }, 'Dismiss')
          ])
        : null
    ]);
    toast.addEventListener('pointerdown', event => {
      this.pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
      toast.setPointerCapture?.(event.pointerId);
    });
    toast.addEventListener('pointerup', event => {
      if (!this.pointerStart || this.pointerStart.id !== event.pointerId) return;
      const horizontal = event.clientX - this.pointerStart.x;
      const vertical = Math.abs(event.clientY - this.pointerStart.y);
      this.pointerStart = null;
      if (Math.abs(horizontal) >= 56 && vertical < 44) this.dismiss('swipe');
    });
    this.layer.append(toast);
  }

  async history() {
    const record = await this.repository.get('meta', CALM_NOTIFICATION_HISTORY_ID);
    return structuredClone(record?.notifications || []);
  }
}
