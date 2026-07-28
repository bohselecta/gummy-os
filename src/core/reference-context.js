export const RANCH_DAY_REFERENCE_PRODUCTION_ID = 'production:ranch-day';
export const HOYT_REFERENCE_ACTOR_ID = 'actor:hoyt';
export const REFERENCE_CONTEXT_MIGRATION_ID = 'migration:clarify-private-reference-context-v1';

const clone = value => structuredClone(value);

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function referenceContext(overrides = {}) {
  return {
    classification: 'private-reference',
    referenceOnly: true,
    fixtureId: RANCH_DAY_REFERENCE_PRODUCTION_ID,
    currentHuman: false,
    defaultIdentity: false,
    ...overrides
  };
}

export function isReferenceOnlyActor(actor) {
  return actor?.id === HOYT_REFERENCE_ACTOR_ID
    || actor?.extensions?.referenceContext?.referenceOnly === true;
}

export function isReferenceProduction(production) {
  return production?.id === RANCH_DAY_REFERENCE_PRODUCTION_ID
    || production?.extensions?.referenceContext?.referenceOnly === true;
}

export function isReferenceGummy(gummy) {
  return ['gummy:ranch-day-source-brief', 'gummy:hoyt-likeness-approved'].includes(gummy?.id)
    || gummy?.extensions?.referenceContext?.referenceOnly === true;
}

/**
 * Preserves the Ranch Day and Hoyt records while removing their accidental
 * resemblance to the current Human/default workspace. This is deliberately
 * idempotent so it can run against new, IndexedDB, and legacy snapshots.
 */
export function clarifyPrivateReferenceContext(inputRuntime) {
  const runtime = clone(inputRuntime);
  let changed = false;
  const update = (record, patch) => {
    if (!record) return;
    for (const [key, value] of Object.entries(patch)) {
      if (!same(record[key], value)) {
        record[key] = clone(value);
        changed = true;
      }
    }
  };

  const hoyt = runtime.actors?.find(actor => actor.id === HOYT_REFERENCE_ACTOR_ID);
  if (hoyt) {
    update(hoyt, {
      name: 'Hoyt — saved participant reference',
      kind: 'project-role',
      status: 'archived',
      humanAuthorityIds: [],
      privacy: 'private-reference',
      retention: 'saved-reference-only',
      contribution: 'only-inside-explicit-ranch-day-reference',
      extensions: {
        ...(hoyt.extensions || {}),
        referenceContext: referenceContext({
          label: 'Saved participant reference',
          explanation: 'Hoyt is Hayden’s brother and a participant in the saved Ranch Day reference. He is not the current Human or a default Gummy OS user.'
        })
      }
    });
  }

  const ranch = runtime.productions?.find(production => production.id === RANCH_DAY_REFERENCE_PRODUCTION_ID);
  if (ranch) {
    const hasExecutedRun = (ranch.runIds || []).length > 0;
    const referenceStatus = !hasExecutedRun && ['draft', 'configuring', 'ready'].includes(ranch.status)
      ? 'completed'
      : ranch.status;
    update(ranch, {
      title: 'Ranch Day — private reference',
      description: 'Saved private family reference involving Hoyt and Ranch Day source material. It is not the current workspace or a default user account.',
      status: referenceStatus,
      extensions: {
        ...(ranch.extensions || {}),
        referenceContext: referenceContext({
          label: 'Saved private reference Production',
          explanation: 'Kept for provenance, deterministic receipts, and future approved family work.'
        })
      }
    });
  }

  const relationship = runtime.relationships?.find(link => link.id === 'link:hoyt-videoboss-private-family');
  if (relationship) {
    update(relationship, {
      extensions: {
        ...(relationship.extensions || {}),
        referenceContext: referenceContext({
          label: 'Ranch Day relationship boundary',
          explanation: 'This relationship is available only inside an explicitly opened private family reference.'
        })
      }
    });
  }

  for (const participant of runtime.participants || []) {
    if (participant.productionId !== RANCH_DAY_REFERENCE_PRODUCTION_ID && participant.actorId !== HOYT_REFERENCE_ACTOR_ID) continue;
    update(participant, {
      extensions: {
        ...(participant.extensions || {}),
        referenceContext: referenceContext({ label: 'Reference Production participant' })
      }
    });
  }

  const gummyLabels = {
    'gummy:ranch-day-source-brief': {
      name: 'Saved reference · Ranch Day source brief.md',
      label: 'Private family reference brief'
    },
    'gummy:hoyt-likeness-approved': {
      name: 'Saved private reference · Hoyt (Ranch Day)',
      label: 'Approved likeness reference for Ranch Day only'
    }
  };
  for (const gummy of runtime.gummies || []) {
    const label = gummyLabels[gummy.id];
    if (!label) continue;
    update(gummy, {
      name: label.name,
      title: label.name,
      extensions: {
        ...(gummy.extensions || {}),
        referenceContext: referenceContext({
          label: label.label,
          explanation: 'Preserved as private source history; not part of the current default workspace.'
        })
      }
    });
  }

  const migrationLog = runtime.migrationLog || (runtime.migrationLog = []);
  if (!migrationLog.some(item => item.id === REFERENCE_CONTEXT_MIGRATION_ID)) {
    migrationLog.push({
      id: REFERENCE_CONTEXT_MIGRATION_ID,
      status: 'applied',
      preservesHistoricalRecords: true,
      removesDefaultIdentityAmbiguity: true,
      appliedAt: new Date().toISOString()
    });
    changed = true;
  }

  return Object.freeze({ runtime, changed });
}
