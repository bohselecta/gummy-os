import { openDB } from 'idb';

export const DATABASE_NAME = 'gummy-os';
export const DATABASE_VERSION = 2;
export const STORES = Object.freeze([
  'meta', 'humans', 'actors', 'agents', 'molds', 'masterControls', 'gummies',
  'bowls', 'links', 'grabs', 'boxes', 'workOrders', 'taskLeases', 'leaseClaims',
  'grants', 'returns', 'receipts', 'workspaces', 'profiles', 'outbox',
  'actorAppDescriptors', 'productions', 'productionParticipants',
  'productionConfigurations', 'actorPlans', 'contextEnvelopes',
  'productionRuns', 'actorUpdateProposals', 'dragIntents'
]);

/**
 * Validated record repository. Callers may inject a schema/semantic validator.
 * Imported and provider-authored records must use putValidated.
 */
export class RecordRepository {
  constructor({ databaseName = DATABASE_NAME, validator = null } = {}) {
    this.databaseName = databaseName;
    this.validator = validator;
    this.channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('gummy-os-records') : null;
  }

  async open() {
    if (!this.db) {
      this.db = await openDB(this.databaseName, DATABASE_VERSION, {
        upgrade(db) {
          for (const store of STORES) {
            if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, { keyPath: 'id' });
          }
        }
      });
    }
    return this.db;
  }

  async put(store, record, { validate = true } = {}) {
    if (!STORES.includes(store)) throw new Error(`Unknown store: ${store}`);
    if (!record?.id) throw new Error(`Record in ${store} requires an id`);
    if (validate && this.validator) await this.validator(record, store, this);
    const db = await this.open();
    await db.put(store, structuredClone(record));
    this.channel?.postMessage({ type: 'put', store, id: record.id });
    return record;
  }

  putValidated(store, record) {
    return this.put(store, record, { validate: true });
  }

  async get(store, id) {
    return (await this.open()).get(store, id);
  }

  async all(store) {
    return (await this.open()).getAll(store);
  }

  async delete(store, id) {
    await (await this.open()).delete(store, id);
    this.channel?.postMessage({ type: 'delete', store, id });
  }

  async transaction(storeNames, mode, operation) {
    const tx = (await this.open()).transaction(storeNames, mode);
    const value = await operation(tx);
    await tx.done;
    return value;
  }

  async acquireLeaseClaim({ scopeHash, leaseId, expiresAt }) {
    return this.transaction(['leaseClaims'], 'readwrite', async tx => {
      const store = tx.objectStore('leaseClaims');
      const current = await store.get(scopeHash);
      if (current && Date.parse(current.expiresAt) > Date.now() && current.leaseId !== leaseId) {
        return { acquired: false, current };
      }
      const claim = { id: scopeHash, scopeHash, leaseId, expiresAt, claimedAt: new Date().toISOString() };
      await store.put(claim);
      return { acquired: true, claim };
    });
  }

  async releaseLeaseClaim(scopeHash, leaseId) {
    return this.transaction(['leaseClaims'], 'readwrite', async tx => {
      const store = tx.objectStore('leaseClaims');
      const current = await store.get(scopeHash);
      if (current?.leaseId === leaseId) await store.delete(scopeHash);
    });
  }

  async export() {
    const result = {};
    for (const store of STORES) result[store] = await this.all(store);
    return result;
  }

  close() {
    this.db?.close();
    this.channel?.close();
  }
}
