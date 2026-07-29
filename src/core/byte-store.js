import { sha256 } from './hash.js';

export class ByteStoreError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ByteStoreError';
    this.code = code;
  }
}

export class ByteStore {
  constructor({
    storage = globalThis.navigator?.storage,
    indexedDBFactory = globalThis.indexedDB,
    fallbackDatabaseName = 'gummy-byte-store'
  } = {}) {
    this.storage = storage;
    this.indexedDBFactory = indexedDBFactory;
    this.fallbackDatabaseName = fallbackDatabaseName;
    this.fallbackDatabasePromise = null;
  }

  async root() {
    if (!this.storage?.getDirectory) throw new ByteStoreError('unsupported', 'Origin-private file storage is unavailable.');
    try {
      return await this.storage.getDirectory();
    } catch (error) {
      throw new ByteStoreError('unavailable', `Origin-private file storage failed: ${error.message}`);
    }
  }

  async directory(path, { create = false } = {}) {
    let directory = await this.root();
    for (const name of path.split('/').filter(Boolean)) {
      directory = await directory.getDirectoryHandle(name, { create });
    }
    return directory;
  }

  async fallbackDatabase() {
    if (!this.indexedDBFactory) {
      throw new ByteStoreError('unsupported', 'Neither origin-private file storage nor IndexedDB byte storage is available.');
    }
    if (!this.fallbackDatabasePromise) {
      this.fallbackDatabasePromise = new Promise((resolve, reject) => {
        const request = this.indexedDBFactory.open(this.fallbackDatabaseName, 1);
        request.onupgradeneeded = () => {
          const database = request.result;
          if (!database.objectStoreNames.contains('bytes')) database.createObjectStore('bytes', { keyPath: 'path' });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new ByteStoreError('unavailable', `IndexedDB byte storage failed: ${request.error?.message || 'unknown error'}`));
        request.onblocked = () => reject(new ByteStoreError('blocked', 'IndexedDB byte storage is blocked by another browser context.'));
      });
    }
    return this.fallbackDatabasePromise;
  }

  async fallbackPut(path, data) {
    const database = await this.fallbackDatabase();
    const bytes = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    await new Promise((resolve, reject) => {
      const transaction = database.transaction('bytes', 'readwrite');
      transaction.objectStore('bytes').put({ path, bytes, byteLength: data.byteLength, updatedAt: new Date().toISOString() });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(new ByteStoreError(transaction.error?.name === 'QuotaExceededError' ? 'quota' : 'write-failed', transaction.error?.message || 'IndexedDB byte write failed.'));
      transaction.onabort = () => reject(new ByteStoreError(transaction.error?.name === 'QuotaExceededError' ? 'quota' : 'write-failed', transaction.error?.message || 'IndexedDB byte write was aborted.'));
    });
  }

  async fallbackGet(path) {
    const database = await this.fallbackDatabase();
    const record = await new Promise((resolve, reject) => {
      const request = database.transaction('bytes', 'readonly').objectStore('bytes').get(path);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new ByteStoreError('read-failed', request.error?.message || 'IndexedDB byte read failed.'));
    });
    return record ? new Uint8Array(record.bytes) : null;
  }

  async fallbackDelete(path) {
    if (!this.indexedDBFactory) return;
    const database = await this.fallbackDatabase();
    await new Promise((resolve, reject) => {
      const transaction = database.transaction('bytes', 'readwrite');
      transaction.objectStore('bytes').delete(path);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(new ByteStoreError('delete-failed', transaction.error?.message || 'IndexedDB byte deletion failed.'));
      transaction.onabort = () => reject(new ByteStoreError('delete-failed', transaction.error?.message || 'IndexedDB byte deletion was aborted.'));
    });
  }

  async writeOpfs(path, data) {
    const parts = path.split('/').filter(Boolean);
    const fileName = parts.pop();
    const directory = await this.directory(parts.join('/'), { create: true });
    const handle = await directory.getFileHandle(fileName, { create: true });
    const writable = await handle.createWritable();
    await writable.write(data);
    await writable.close();
  }

  async write(path, data) {
    if (this.storage?.getDirectory) {
      try {
        await this.writeOpfs(path, data);
        return 'opfs';
      } catch (error) {
        if (error?.name === 'QuotaExceededError' || error?.code === 'quota') {
          throw new ByteStoreError('quota', error.message);
        }
        if (!this.indexedDBFactory) {
          throw error instanceof ByteStoreError ? error : new ByteStoreError('write-failed', error.message);
        }
      }
    }
    await this.fallbackPut(path, data);
    return 'indexeddb';
  }

  async writeGummy(gummyId, revision, bytes) {
    const data = bytes instanceof Uint8Array ? bytes : new TextEncoder().encode(bytes);
    const hash = await sha256(data);
    const fileName = `${revision}-${hash}`;
    const path = `/gummies/${encodeURIComponent(gummyId)}/${fileName}`;
    const storageClass = await this.write(path, data);
    return { path, hash, byteLength: data.byteLength, storageClass };
  }

  async writeArtifact(boxId, name, bytes) {
    const data = bytes instanceof Uint8Array ? bytes : new TextEncoder().encode(bytes);
    const hash = await sha256(data);
    const path = `/gummy-box/${encodeURIComponent(boxId)}/artifacts/${name}`;
    const storageClass = await this.write(path, data);
    return { path, hash, byteLength: data.byteLength, storageClass };
  }

  async read(path) {
    if (this.storage?.getDirectory) {
      try {
        const parts = path.split('/').filter(Boolean);
        const fileName = parts.pop();
        const handle = await (await this.directory(parts.join('/'))).getFileHandle(fileName);
        return new Uint8Array(await (await handle.getFile()).arrayBuffer());
      } catch (error) {
        if (!this.indexedDBFactory && error?.name !== 'NotFoundError') {
          throw error instanceof ByteStoreError ? error : new ByteStoreError('read-failed', error.message);
        }
      }
    }
    const fallback = await this.fallbackGet(path);
    if (fallback) return fallback;
    throw new ByteStoreError('not-found', `No stored bytes exist at ${path}.`);
  }

  async delete(path) {
    let removed = false;
    if (this.storage?.getDirectory) {
      try {
        const parts = path.split('/').filter(Boolean);
        const name = parts.pop();
        await (await this.directory(parts.join('/'))).removeEntry(name, { recursive: true });
        removed = true;
      } catch (error) {
        if (!['NotFoundError', 'TypeMismatchError'].includes(error?.name) && !this.indexedDBFactory) {
          throw error instanceof ByteStoreError ? error : new ByteStoreError('delete-failed', error.message);
        }
      }
    }
    if (this.indexedDBFactory) {
      await this.fallbackDelete(path);
      removed = true;
    }
    return removed;
  }

  hash(bytes) {
    return sha256(bytes);
  }
}
