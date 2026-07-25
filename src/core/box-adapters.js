import { createId, sha256 } from './hash.js';

export class LocalBoxAdapter {
  constructor(repository, byteStore) {
    this.repository = repository;
    this.byteStore = byteStore;
    this.providerType = 'local';
  }

  operation(record, status = 'committed') {
    return sha256(record).then(contentHash => ({
      providerType: this.providerType,
      revisionId: `${record.id}@${record.updatedAt || record.createdAt}`,
      contentHash,
      status
    }));
  }

  async connect(box) { return this.operation(box); }
  async disconnect(box) { return this.operation({ ...box, status: 'disconnected' }); }
  async initialize(box) { await this.repository.putValidated('boxes', box); return this.operation(box); }
  async listPending(boxId) {
    const records = (await this.repository.all('workOrders')).filter(order => order.boxId === boxId && ['awaiting-approval', 'held', 'validated'].includes(order.status));
    return { ...(await this.operation({ id: `pending:${boxId}`, records, createdAt: new Date().toISOString() })), records };
  }
  async readWorkOrder(id) {
    const record = await this.repository.get('workOrders', id);
    return { ...(await this.operation(record || { id, createdAt: new Date().toISOString() })), record };
  }
  async claim(order, lease) {
    await this.repository.transaction(['workOrders', 'taskLeases'], 'readwrite', async tx => {
      await tx.objectStore('taskLeases').put(lease);
      await tx.objectStore('workOrders').put({ ...order, taskLeaseId: lease.id, status: 'claimed', updatedAt: new Date().toISOString() });
    });
    return this.operation(lease);
  }
  async writeReturn(record) { await this.repository.putValidated('returns', record); return this.operation(record); }
  async writeArtifact(boxId, name, bytes) {
    const result = await this.byteStore.writeArtifact(boxId, name, bytes);
    return { providerType: this.providerType, revisionId: result.path, contentHash: result.hash, status: 'committed' };
  }
  async writeReceipt(record) { return this.operation(record); }
  async archive(order, status = 'cancelled') {
    const archived = { ...order, status, updatedAt: new Date().toISOString(), extensions: { ...order.extensions, archivedPath: `archive/${order.id}.json` } };
    await this.repository.putValidated('workOrders', archived);
    return this.operation(archived);
  }
  async reconcile() { return { providerType: this.providerType, revisionId: 'local', contentHash: await sha256('local-reconciled'), status: 'committed' }; }
  async flushOutbox() { return { providerType: this.providerType, revisionId: 'local', contentHash: await sha256('local-outbox-empty'), flushed: 0, status: 'committed' }; }
}

export class GitHubBoxAdapter {
  constructor({ baseUrl = '/api/v1' } = {}) {
    this.baseUrl = baseUrl;
    this.providerType = 'github';
  }

  async request(path, options = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: { 'content-type': 'application/json', 'x-gummy-csrf': sessionStorage.getItem('gummy-csrf') || '', ...options.headers }
    });
    const body = await response.json().catch(() => ({ error: 'Malformed server response' }));
    if (!response.ok) throw new Error(body.error || body.message || 'GitHub operation failed');
    return body;
  }

  repositories() { return this.request('/github/repositories'); }
  connect(input) { return this.request('/github/boxes/connect', { method: 'POST', body: JSON.stringify(input) }); }
  sync(id, input) { return this.request(`/github/boxes/${encodeURIComponent(id)}/sync`, { method: 'POST', body: JSON.stringify(input) }); }
  disconnect(id) { return this.request(`/github/boxes/${encodeURIComponent(id)}/connection`, { method: 'DELETE' }); }
}

export function makeOutboxItem(operation, payload) {
  return { id: createId('outbox'), operation, payload, idempotencyKey: createId('idempotency'), status: 'queued', createdAt: new Date().toISOString() };
}
