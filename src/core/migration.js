import { sha256 } from './hash.js';

export const LEGACY_STORAGE_KEY = 'gummy-os:v0.1';
export const MIGRATION_ID = 'v0.1-localstorage-to-v0.2-idb';

export async function mapLegacyState(legacy) {
  const evidence = {
    id: `profile:migration:${await sha256(legacy)}`,
    type: 'migration-evidence',
    migration: MIGRATION_ID,
    legacyHash: await sha256(legacy),
    originalColors: legacy?.snack?.colors || null,
    themeMapping: 'night',
    mappings: {
      rootSnack: ['human:hayden', 'actor:hayden', 'mold:hayden:personal'],
      legacyCompanion: ['agent:glopper-web'],
      remainingSocialSnack: ['actor:studio-test'],
      filesAndDrops: 'distinct-gummies-unless-unambiguous',
      forks: 'grabs-plus-grab-of-links',
      dock: 'gummy-bar-state'
    },
    updatedAt: new Date().toISOString()
  };
  return evidence;
}

export async function migrateLegacy(repository, storage = localStorage) {
  const raw = storage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) return { migrated: false, reason: 'no-legacy-state' };
  let legacy;
  try {
    legacy = JSON.parse(raw);
  } catch {
    return { migrated: false, reason: 'invalid-legacy-json' };
  }
  const evidence = await mapLegacyState(legacy);
  const completedId = `migration:${evidence.legacyHash}`;
  if (await repository.get('meta', completedId)) return { migrated: false, reason: 'already-migrated', evidence };

  await repository.transaction(['meta', 'profiles'], 'readwrite', async tx => {
    await tx.objectStore('profiles').put(evidence);
    await tx.objectStore('meta').put({
      id: completedId,
      migration: MIGRATION_ID,
      completedAt: new Date().toISOString(),
      evidenceId: evidence.id
    });
  });
  return { migrated: true, evidence };
}
