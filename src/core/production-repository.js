import { createInitialProductionRuntime, PRODUCTION_STATE_VERSION } from './production-runtime.js';
import { clarifyPrivateReferenceContext } from './reference-context.js';

export const PRODUCTION_RUNTIME_INDEX_ID = 'production-runtime:index';
export const LEGACY_PRODUCTION_STORAGE_KEY = 'gummy-os:v0.2';

const COLLECTION_STORES = Object.freeze({
  actors: 'actors',
  agents: 'agents',
  molds: 'molds',
  actorAppDescriptors: 'actorAppDescriptors',
  relationships: 'links',
  productions: 'productions',
  participants: 'productionParticipants',
  configurations: 'productionConfigurations',
  actorPlans: 'actorPlans',
  contextEnvelopes: 'contextEnvelopes',
  productionRuns: 'productionRuns',
  workOrders: 'workOrders',
  taskLeases: 'taskLeases',
  grants: 'grants',
  returns: 'returns',
  receipts: 'receipts',
  gummies: 'gummies',
  links: 'links',
  dragIntents: 'dragIntents',
  actorUpdateProposals: 'actorUpdateProposals'
});

const sharedStores = new Set([
  'actors', 'agents', 'molds', 'links', 'gummies', 'workOrders',
  'taskLeases', 'grants', 'returns', 'receipts'
]);

const clone = value => structuredClone(value);

function productionGummyKind(kind) {
  if (kind === 'result') return 'result';
  if (kind === 'deliverable') return 'artifact';
  return 'file';
}

function mergeExistingPersonalActor(runtime, actor) {
  if (!actor) return runtime;
  const existing = runtime.actors.find(item => item.id === actor.id);
  if (!existing) return runtime;
  Object.assign(existing, actor, {
    publishedCapabilities: existing.publishedCapabilities,
    acceptedInputTypes: existing.acceptedInputTypes,
    outputTypes: existing.outputTypes,
    locality: existing.locality,
    privacy: existing.privacy,
    retention: existing.retention,
    contribution: existing.contribution,
    cost: existing.cost
  });
  return runtime;
}

export class ProductionRuntimeRepository {
  constructor({ repository, byteStore, storage = globalThis.localStorage } = {}) {
    this.repository = repository;
    this.byteStore = byteStore;
    this.storage = storage;
    this.pending = Promise.resolve();
  }

  async initialize() {
    const indexed = await this.repository.get('meta', PRODUCTION_RUNTIME_INDEX_ID);
    if (indexed) return this.load();

    let runtime = createInitialProductionRuntime();
    const migrated = this.readLegacyRuntime();
    if (migrated) runtime = migrated;
    runtime = mergeExistingPersonalActor(runtime, await this.repository.get('actors', 'actor:hayden'));
    const clarified = clarifyPrivateReferenceContext(runtime);
    runtime = clarified.runtime;
    await this.persist(runtime, {
      migration: migrated ? {
        source: LEGACY_PRODUCTION_STORAGE_KEY,
        importedAsMigrationInput: true,
        localStorageAuthoritative: false
      } : null,
      referenceContextMigration: clarified.changed ? {
        classification: 'private-reference',
        historicalRecordsPreserved: true,
        defaultIdentityAmbiguityRemoved: true
      } : null
    });
    return runtime;
  }

  readLegacyRuntime() {
    if (!this.storage?.getItem) return null;
    try {
      const legacy = JSON.parse(this.storage.getItem(LEGACY_PRODUCTION_STORAGE_KEY) || 'null');
      if (legacy?.productionRuntime?.version !== PRODUCTION_STATE_VERSION) return null;
      return clone(legacy.productionRuntime);
    } catch {
      return null;
    }
  }

  async load() {
    const index = await this.repository.get('meta', PRODUCTION_RUNTIME_INDEX_ID);
    if (!index) return this.initialize();
    const runtime = {
      schema: 'gummy.production-runtime/v0',
      version: index.version,
      actorDefaults: clone(index.actorDefaults || {}),
      windowState: clone(index.windowState || []),
      migrationLog: clone(index.migrationLog || [])
    };
    for (const [collection, store] of Object.entries(COLLECTION_STORES)) {
      const ids = index.collections?.[collection] || [];
      const records = await Promise.all(ids.map(id => this.repository.get(store, id)));
      runtime[collection] = records.filter(Boolean);
    }
    runtime.gummies = await Promise.all(runtime.gummies.map(record => this.hydrateGummy(record)));
    const clarified = clarifyPrivateReferenceContext(runtime);
    if (clarified.changed) {
      await this.persist(clarified.runtime, {
        referenceContextMigration: {
          classification: 'private-reference',
          historicalRecordsPreserved: true,
          defaultIdentityAmbiguityRemoved: true
        }
      });
      await this.flush();
    }
    return clarified.runtime;
  }

  persist(runtime, options = {}) {
    const snapshot = clone(runtime);
    this.pending = this.pending.then(() => this.writeSnapshot(snapshot, options));
    return this.pending;
  }

  flush() {
    return this.pending;
  }

  async writeSnapshot(runtime, options) {
    const previous = await this.repository.get('meta', PRODUCTION_RUNTIME_INDEX_ID);
    const records = {};
    for (const [collection, store] of Object.entries(COLLECTION_STORES)) {
      records[collection] = [];
      for (const record of runtime[collection] || []) {
        records[collection].push(collection === 'gummies'
          ? await this.persistedGummy(record)
          : clone(record));
      }
    }
    const collections = Object.fromEntries(
      Object.entries(records).map(([collection, values]) => [collection, values.map(item => item.id)])
    );
    const index = {
      id: PRODUCTION_RUNTIME_INDEX_ID,
      schema: 'gummy.production-runtime-index/v0',
      version: PRODUCTION_STATE_VERSION,
      authoritativeStore: 'IndexedDB',
      byteStore: 'OPFS',
      localStorageRole: 'preferences-and-migration-input-only',
      collections,
      actorDefaults: clone(runtime.actorDefaults || {}),
      windowState: clone(runtime.windowState || []),
      migrationLog: clone(runtime.migrationLog || []),
      migration: options.migration || previous?.migration || null,
      referenceContextMigration: options.referenceContextMigration || previous?.referenceContextMigration || null,
      updatedAt: new Date().toISOString()
    };

    const storeNames = [...new Set(['meta', ...Object.values(COLLECTION_STORES)])];
    await this.repository.transaction(storeNames, 'readwrite', async tx => {
      for (const [collection, store] of Object.entries(COLLECTION_STORES)) {
        for (const record of records[collection]) await tx.objectStore(store).put(record);
        if (!sharedStores.has(store)) {
          const nextIds = new Set(collections[collection]);
          for (const oldId of previous?.collections?.[collection] || []) {
            if (!nextIds.has(oldId)) await tx.objectStore(store).delete(oldId);
          }
        }
      }
      await tx.objectStore('meta').put(index);
    });
    return index;
  }

  async persistedGummy(gummy) {
    if (typeof gummy.content !== 'string') return clone(gummy);
    const write = await this.byteStore.writeGummy(gummy.id, gummy.revision, gummy.content);
    const expected = String(gummy.hash || '').replace(/^sha256:/, '');
    if (expected && write.hash !== expected) {
      throw new Error(`Production Gummy byte hash mismatch: ${gummy.id}`);
    }
    const createdAt = gummy.createdAt || new Date().toISOString();
    return {
      ...clone(gummy),
      title: gummy.name,
      kind: productionGummyKind(gummy.kind),
      visibility: gummy.visibility || 'private',
      revision: Number(gummy.revision),
      content: {
        mediaType: gummy.mediaType,
        byteRef: write.path,
        sizeBytes: write.byteLength
      },
      hash: { algorithm: 'sha256', value: write.hash },
      createdAt,
      updatedAt: gummy.updatedAt || createdAt,
      extensions: {
        ...(gummy.extensions || {}),
        productionRuntime: {
          name: gummy.name,
          kind: gummy.kind,
          mediaType: gummy.mediaType,
          revision: String(gummy.revision),
          hash: `sha256:${write.hash}`,
          status: gummy.status
        }
      }
    };
  }

  async hydrateGummy(record) {
    const runtime = record.extensions?.productionRuntime;
    if (!runtime) return clone(record);
    const bytes = await this.byteStore.read(record.content.byteRef);
    return {
      ...clone(record),
      name: runtime.name,
      kind: runtime.kind,
      mediaType: runtime.mediaType,
      revision: runtime.revision,
      hash: runtime.hash,
      status: runtime.status,
      content: new TextDecoder().decode(bytes)
    };
  }
}
