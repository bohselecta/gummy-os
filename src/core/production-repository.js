export * from './production-repository-base.js';

import {
  LEGACY_PRODUCTION_STORAGE_KEY,
  PRODUCTION_RUNTIME_INDEX_ID,
  ProductionRuntimeRepository as BaseProductionRuntimeRepository
} from './production-repository-base.js';

export { LEGACY_PRODUCTION_STORAGE_KEY, PRODUCTION_RUNTIME_INDEX_ID };

function metadataStorageClass(byteStore) {
  if (byteStore?.storageClass === 'indexeddb') return 'IndexedDB';
  if (byteStore?.storageClass === 'opfs') return 'OPFS';
  // Pre-fallback injected stores represented the OPFS byte plane without exposing a class field.
  // Preserve that stable compatibility label; the real ByteStore always declares its actual class.
  return 'OPFS';
}

/**
 * Preserve the established Production repository while making its storage metadata truthful on
 * browsers that use the IndexedDB byte fallback instead of OPFS.
 */
export class ProductionRuntimeRepository extends BaseProductionRuntimeRepository {
  async synchronizeByteStoreMetadata() {
    const index = await this.repository.get('meta', PRODUCTION_RUNTIME_INDEX_ID);
    const storageClass = metadataStorageClass(this.byteStore);
    if (!index || index.byteStore === storageClass) return index;
    const updated = {
      ...index,
      byteStore: storageClass,
      byteStoreFallback: storageClass === 'IndexedDB'
        ? 'IndexedDB bytes preserve Local Gummy Box capability because OPFS is unavailable in this browser.'
        : null,
      updatedAt: new Date().toISOString()
    };
    await this.repository.put('meta', updated, { validate: false });
    return updated;
  }

  async initialize() {
    const runtime = await super.initialize();
    await this.synchronizeByteStoreMetadata();
    return runtime;
  }

  async load() {
    const runtime = await super.load();
    await this.synchronizeByteStoreMetadata();
    return runtime;
  }

  async writeSnapshot(runtime, options) {
    const index = await super.writeSnapshot(runtime, options);
    return (await this.synchronizeByteStoreMetadata()) || index;
  }
}
