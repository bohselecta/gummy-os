import { sha256 } from './hash.js';

export class ByteStoreError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ByteStoreError';
    this.code = code;
  }
}

export class ByteStore {
  async root() {
    if (!navigator.storage?.getDirectory) throw new ByteStoreError('unsupported', 'Origin-private file storage is unavailable.');
    try {
      return await navigator.storage.getDirectory();
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

  async writeGummy(gummyId, revision, bytes) {
    const data = bytes instanceof Uint8Array ? bytes : new TextEncoder().encode(bytes);
    const hash = await sha256(data);
    const directory = await this.directory(`/gummies/${encodeURIComponent(gummyId)}`, { create: true });
    const fileName = `${revision}-${hash}`;
    try {
      const handle = await directory.getFileHandle(fileName, { create: true });
      const writable = await handle.createWritable();
      await writable.write(data);
      await writable.close();
      return { path: `/gummies/${encodeURIComponent(gummyId)}/${fileName}`, hash, byteLength: data.byteLength };
    } catch (error) {
      throw new ByteStoreError(error.name === 'QuotaExceededError' ? 'quota' : 'write-failed', error.message);
    }
  }

  async writeArtifact(boxId, name, bytes) {
    const data = bytes instanceof Uint8Array ? bytes : new TextEncoder().encode(bytes);
    const hash = await sha256(data);
    const directory = await this.directory(`/gummy-box/${encodeURIComponent(boxId)}/artifacts`, { create: true });
    const handle = await directory.getFileHandle(name, { create: true });
    const writable = await handle.createWritable();
    await writable.write(data);
    await writable.close();
    return { path: `/gummy-box/${encodeURIComponent(boxId)}/artifacts/${name}`, hash, byteLength: data.byteLength };
  }

  async read(path) {
    const parts = path.split('/').filter(Boolean);
    const fileName = parts.pop();
    const handle = await (await this.directory(parts.join('/'))).getFileHandle(fileName);
    return new Uint8Array(await (await handle.getFile()).arrayBuffer());
  }

  async delete(path) {
    const parts = path.split('/').filter(Boolean);
    const name = parts.pop();
    await (await this.directory(parts.join('/'))).removeEntry(name, { recursive: true });
  }

  hash(bytes) {
    return sha256(bytes);
  }
}
