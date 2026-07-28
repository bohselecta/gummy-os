const PLACE_SCHEMA = 'gummy.place-descriptor/v1';
const REGISTRY_SCHEMA = 'gummy.place-registry/v1';
const SOURCE_PACKAGE_SCHEMA = 'gummy.source-package/v1';
const HANDOFF_SCHEMA = 'gummy.place-handoff/v1';
const SHA256 = /^[a-f0-9]{64}$/;
const CONTEXT_TYPES = new Set(['personal', 'production', 'session']);
const ACTIVATION_STATES = new Set([
  'available',
  'local-runtime-required',
  'remote-service-required',
  'mobile-companion-required',
  'staged',
  'blocked'
]);
const REQUIRED_PLACE_IDS = Object.freeze([
  'app:gummy-channels',
  'app:gummy-wardrobe',
  'app:gummy-house',
  'app:gummy-worlds',
  'app:gummy-table',
  'app:gummy-radio'
]);
const PRESERVED_APPLICATION_IDS = Object.freeze([
  'app:videoboss',
  'app:imagehoss',
  'app:3d-bee',
  'app:gummy-rooms'
]);
const SECRET_KEY = /(^|[-_.])(api[-_]?key|authorization|cookie|password|secret|token)($|[-_.])/i;

function clone(value) {
  return structuredClone(value);
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function assert(condition, code, message, details = {}) {
  if (!condition) throw new PlaceSystemError(code, message, details);
}

function requiredString(value, field) {
  assert(typeof value === 'string' && Boolean(value.trim()), 'missing-field', `${field} is required`, { field });
  return value;
}

function assertNoSecrets(value, path = '$') {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    assert(!SECRET_KEY.test(key), 'secret-field', `Secret-bearing field is forbidden at ${path}.${key}`, { path: `${path}.${key}` });
    assertNoSecrets(child, `${path}.${key}`);
  }
}

export class PlaceSystemError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'PlaceSystemError';
    this.evidence = deepFreeze({
      schema: 'gummy.place-system-failure/v1',
      status: 'blocked',
      code,
      message,
      details: clone(details)
    });
  }
}

export function validatePlaceRegistry(registry, applicationRegistry) {
  assert(registry?.schema === REGISTRY_SCHEMA, 'unknown-registry', 'Unknown Place registry schema');
  assert(registry.migrationSource === 'gummy.application-registry/v1', 'missing-migration', 'Application registry migration source is required');
  assert(Array.isArray(registry.places), 'invalid-registry', 'Places must be an array');
  const ids = registry.places.map(place => place.id);
  assert(new Set(ids).size === ids.length, 'duplicate-place', 'Place IDs must be unique');
  for (const id of [...PRESERVED_APPLICATION_IDS, ...REQUIRED_PLACE_IDS]) {
    assert(ids.includes(id), 'missing-place', `Required Place is missing: ${id}`, { id });
  }
  for (const place of registry.places) {
    assert(place.schema === PLACE_SCHEMA, 'invalid-descriptor', `${place.id || 'Place'} uses an unknown descriptor schema`);
    for (const field of [
      'id', 'name', 'shortLabel', 'actorId', 'actorAddress', 'placeClass', 'canonicalSource',
      'standaloneTargets', 'surfaceModes', 'authoritativeDataLocation', 'domainSchemas',
      'projectionSchemas', 'capabilityScopes', 'acceptedPackages', 'producedPackages',
      'privacyBoundary', 'executionBoundary', 'locality', 'connectionState',
      'activationState', 'releaseTruth', 'featureFlag'
    ]) assert(Object.hasOwn(place, field), 'missing-field', `${place.id || 'Place'} is missing ${field}`, { field });
    assert(ACTIVATION_STATES.has(place.activationState), 'invalid-activation', `${place.id} has an unsupported activation state`);
    assert(place.actorId.startsWith('actor:'), 'invalid-actor', `${place.id} requires an Actor identity`);
    assert(place.actorAddress.startsWith('@'), 'invalid-address', `${place.id} requires an Actor address`);
    assert(place.capabilityScopes.length > 0, 'missing-capabilities', `${place.id} requires bounded capabilities`);
    assert(place.producedPackages.includes(HANDOFF_SCHEMA), 'missing-handoff', `${place.id} must produce Place handoffs`);
  }
  if (applicationRegistry) {
    assert(applicationRegistry.schema === 'gummy.application-registry/v1', 'invalid-migration-source', 'Unknown Application registry schema');
    const oldIds = new Set(applicationRegistry.applications.map(application => application.id));
    for (const id of PRESERVED_APPLICATION_IDS) {
      assert(oldIds.has(id) && ids.includes(id), 'migration-loss', `Application migration lost ${id}`, { id });
    }
  }
  return true;
}

async function readJson(fetcher, path) {
  const response = await fetcher(path, { cache: 'no-cache' });
  assert(response.ok, 'registry-unavailable', `Place registry unavailable: ${path}`, { status: response.status });
  return response.json();
}

function validatePlaceCatalogEnvelope(placeRegistry, applicationRegistry) {
  assert(placeRegistry?.schema === REGISTRY_SCHEMA, 'unknown-registry', 'Unknown Place registry schema');
  assert(placeRegistry.migrationSource === 'gummy.application-registry/v1', 'missing-migration', 'Application registry migration source is required');
  assert(Array.isArray(placeRegistry.places), 'invalid-registry', 'Places must be an array');
  const ids = new Set(placeRegistry.places.map(place => place.id));
  for (const id of [...PRESERVED_APPLICATION_IDS, ...REQUIRED_PLACE_IDS]) {
    assert(ids.has(id), 'missing-place', `Required Place is missing: ${id}`, { id });
  }
  assert(applicationRegistry?.schema === 'gummy.application-registry/v1', 'invalid-migration-source', 'Unknown Application registry schema');
}

export async function loadPlaceCatalog(fetcher = fetch) {
  const [productMap, applicationRegistry, placeRegistry] = await Promise.all([
    readJson(fetcher, '/registry/product-map.json'),
    readJson(fetcher, '/registry/first-party-applications.json'),
    readJson(fetcher, '/registry/gummy-places.json')
  ]);
  validatePlaceCatalogEnvelope(placeRegistry, applicationRegistry);
  return deepFreeze({ productMap, applicationRegistry, placeRegistry });
}

export function placeLaunchState(place) {
  const available = place.featureFlag === true && place.activationState === 'available' && place.connectionState === 'connected';
  const labels = {
    'local-runtime-required': 'Local runtime required',
    'remote-service-required': 'Service required',
    'mobile-companion-required': 'Mobile companion required',
    staged: 'Staged preview',
    blocked: 'Blocked'
  };
  return deepFreeze({
    available,
    label: available ? `Open ${place.name}` : labels[place.activationState] || 'Unavailable',
    activationState: place.activationState,
    connectionState: place.connectionState,
    reason: available ? null : place.releaseTruth
  });
}

export function placeWindowId(placeId, context) {
  requiredString(placeId, 'placeId');
  assert(placeId.startsWith('app:'), 'invalid-place', 'placeId must start with app:');
  assert(CONTEXT_TYPES.has(context?.type), 'invalid-context', 'Context type must be personal, production, or session');
  requiredString(context.id, 'context.id');
  return `place-window:${placeId.slice(4)}:${context.type}:${encodeURIComponent(context.id)}`;
}

export function createPlaceBinding(input) {
  requiredString(input.id, 'id');
  requiredString(input.placeId, 'placeId');
  requiredString(input.ownerActorId, 'ownerActorId');
  assert(CONTEXT_TYPES.has(input.contextType), 'invalid-context', 'Unknown Place binding context');
  requiredString(input.contextId, 'contextId');
  assertNoSecrets(input);
  const binding = {
    schema: 'gummy.place-binding/v1',
    id: input.id,
    placeId: input.placeId,
    ownerActorId: input.ownerActorId,
    contextType: input.contextType,
    contextId: input.contextId,
    externalInstanceRef: input.externalInstanceRef ?? null,
    localProjectionRefs: clone(input.localProjectionRefs || []),
    permissionScopes: clone(input.permissionScopes || []),
    syncMode: input.syncMode || 'none',
    connectionState: input.connectionState || 'staged',
    lastVerifiedAt: input.lastVerifiedAt ?? null,
    lastReceiptId: input.lastReceiptId ?? null,
    revoked: input.revoked === true
  };
  return deepFreeze(binding);
}

export function createSourcePackage(input) {
  assertNoSecrets(input);
  requiredString(input.id, 'id');
  assert(input.id.startsWith('source-package:'), 'invalid-id', 'Source package ID must start with source-package:');
  assert(Array.isArray(input.sources) && input.sources.length > 0, 'missing-sources', 'At least one revisioned source is required');
  for (const source of input.sources) {
    requiredString(source.id, 'sources.id');
    assert(source.revision !== undefined && source.revision !== null && source.revision !== '', 'missing-revision', 'Every source requires a revision');
    assert(SHA256.test(source.hash), 'invalid-hash', 'Every source requires a lowercase SHA-256 hash');
  }
  assert(Array.isArray(input.includedFields) && input.includedFields.length > 0, 'empty-scope', 'At least one included field is required');
  requiredString(input.targetPlaceId, 'targetPlaceId');
  const sourcePackage = {
    schema: SOURCE_PACKAGE_SCHEMA,
    id: input.id,
    sources: clone(input.sources),
    includedFields: clone(input.includedFields),
    explicitExclusions: clone(input.explicitExclusions || []),
    purpose: requiredString(input.purpose, 'purpose'),
    targetPlaceId: input.targetPlaceId,
    privacy: input.privacy || 'private',
    audience: requiredString(input.audience, 'audience'),
    quotePermission: input.quotePermission === true,
    voiceLikenessPermission: input.voiceLikenessPermission === true,
    rights: clone(input.rights),
    provenance: clone(input.provenance),
    retention: requiredString(input.retention, 'retention'),
    costCeiling: input.costCeiling ?? null,
    limitations: clone(input.limitations || []),
    humanApproval: clone(input.humanApproval || { approved: false, approvedBy: null, approvedAt: null }),
    createdAt: input.createdAt || new Date().toISOString()
  };
  assert(sourcePackage.rights && Object.keys(sourcePackage.rights).length, 'missing-rights', 'Rights evidence is required');
  assert(sourcePackage.provenance && Object.keys(sourcePackage.provenance).length, 'missing-provenance', 'Provenance evidence is required');
  return deepFreeze(sourcePackage);
}

export function createPlaceHandoffPreview(input) {
  assert(input.sourcePackage?.schema === SOURCE_PACKAGE_SCHEMA, 'invalid-source-package', 'A validated scoped source package is required');
  assert(input.sourcePackage.targetPlaceId === input.targetPlaceId, 'wrong-target', 'Source package target and handoff target differ');
  assertNoSecrets(input);
  const handoff = {
    schema: HANDOFF_SCHEMA,
    id: requiredString(input.id, 'id'),
    sourcePackageId: input.sourcePackage.id,
    sourcePlaceId: requiredString(input.sourcePlaceId, 'sourcePlaceId'),
    targetPlaceId: requiredString(input.targetPlaceId, 'targetPlaceId'),
    sentFields: clone(input.sourcePackage.includedFields),
    withheldFields: clone(input.sourcePackage.explicitExclusions),
    rights: clone(input.sourcePackage.rights),
    provenance: clone(input.sourcePackage.provenance),
    expectedOutput: requiredString(input.expectedOutput, 'expectedOutput'),
    permissionScopes: clone(input.permissionScopes || []),
    locality: input.locality || 'browser',
    runtime: requiredString(input.runtime, 'runtime'),
    costCeiling: input.sourcePackage.costCeiling,
    retention: input.sourcePackage.retention,
    approvalBoundary: input.approvalBoundary || 'place-confirmation',
    executionState: 'preview',
    approval: null,
    createdAt: input.createdAt || new Date().toISOString()
  };
  assert(handoff.id.startsWith('place-handoff:'), 'invalid-id', 'Place handoff ID must start with place-handoff:');
  assert(handoff.permissionScopes.length > 0, 'missing-permissions', 'A handoff requires explicit permission scopes');
  return deepFreeze(handoff);
}

export function approvePlaceHandoff(preview, approval) {
  assert(preview?.schema === HANDOFF_SCHEMA && preview.executionState === 'preview', 'not-preview', 'Only a preview can be approved');
  assert(approval?.approved === true, 'approval-required', 'Explicit approval is required');
  requiredString(approval.approvedBy, 'approvedBy');
  requiredString(approval.approvedAt, 'approvedAt');
  return deepFreeze({
    ...clone(preview),
    executionState: 'approved',
    approval: clone(approval)
  });
}

export function assertAllowlistedRoute(route, allowedOrigins) {
  const url = new URL(route);
  assert(url.protocol === 'https:', 'unsafe-route', 'Remote Place routes must use HTTPS');
  assert(allowedOrigins.includes(url.origin), 'route-not-allowlisted', 'Place route origin is not allowlisted', { origin: url.origin });
  return url.href;
}

export function createPlaceAdapter({ descriptor, repository, allowedOrigins = [] }) {
  assert(descriptor?.schema === PLACE_SCHEMA, 'invalid-descriptor', 'A valid Place descriptor is required');
  requiredString(descriptor.id, 'descriptor.id');
  assert(ACTIVATION_STATES.has(descriptor.activationState), 'invalid-activation', 'Unsupported Place activation state');
  assert(Array.isArray(descriptor.capabilityScopes) && descriptor.capabilityScopes.length > 0, 'missing-capabilities', 'Place capabilities are required');
  let cancelled = false;
  return deepFreeze({
    discover: async () => clone(descriptor),
    getDescriptor: async () => clone(descriptor),
    getConnectionState: async () => descriptor.connectionState,
    openSurface: async ({ route } = {}) => {
      if (route) assertAllowlistedRoute(route, allowedOrigins);
      return { status: 'opened-local-surface', placeId: descriptor.id };
    },
    listCapabilities: async () => clone(descriptor.capabilityScopes),
    preparePackage: async input => createSourcePackage(input),
    validatePackage: async sourcePackage => {
      assert(sourcePackage?.schema === SOURCE_PACKAGE_SCHEMA, 'invalid-source-package', 'Unsupported source package');
      assertNoSecrets(sourcePackage);
      return true;
    },
    submitApprovedAction: async handoff => {
      assert(!cancelled, 'cancelled', 'Adapter action was cancelled');
      assert(handoff?.schema === HANDOFF_SCHEMA && handoff.executionState === 'approved', 'approval-required', 'Approved Place handoff required');
      assert(descriptor.activationState === 'available' && descriptor.connectionState === 'connected', 'runtime-unavailable', descriptor.releaseTruth);
      return deepFreeze({ status: 'submitted', placeId: descriptor.id, handoffId: handoff.id });
    },
    recover: async () => ({ status: descriptor.connectionState, simulated: false }),
    cancel: async () => {
      cancelled = true;
      return { status: 'cancelled' };
    },
    importReturn: async value => {
      assertNoSecrets(value);
      return deepFreeze({ status: 'imported', value: clone(value) });
    },
    revoke: async () => {
      cancelled = true;
      if (repository) {
        await repository.put('workspaces', {
          id: `place-adapter-revocation:${descriptor.id}`,
          schema: 'gummy.place-adapter-revocation/v1',
          placeId: descriptor.id,
          revokedAt: new Date().toISOString()
        }, { validate: false });
      }
      return { status: 'revoked' };
    }
  });
}

export class PlaceProjectionStore {
  constructor(repository) {
    this.repository = repository;
  }

  static projectionId(placeId, ownerActorId, contextType, contextId, recordId) {
    return `place-projection:${encodeURIComponent(placeId)}:${encodeURIComponent(ownerActorId)}:${contextType}:${encodeURIComponent(contextId)}:${encodeURIComponent(recordId)}`;
  }

  async put({ placeId, ownerActorId, contextType, contextId, recordId, value }) {
    assert(CONTEXT_TYPES.has(contextType), 'invalid-context', 'Unknown projection context');
    assertNoSecrets(value);
    const id = PlaceProjectionStore.projectionId(placeId, ownerActorId, contextType, contextId, recordId);
    const record = {
      id,
      schema: 'gummy.place-projection/v1',
      placeId,
      ownerActorId,
      contextType,
      contextId,
      recordId,
      value: clone(value),
      revoked: false,
      updatedAt: new Date().toISOString()
    };
    await this.repository.put('workspaces', record, { validate: false });
    return deepFreeze(record);
  }

  async get(scope) {
    const id = PlaceProjectionStore.projectionId(scope.placeId, scope.ownerActorId, scope.contextType, scope.contextId, scope.recordId);
    const record = await this.repository.get('workspaces', id);
    assert(record && !record.revoked, 'projection-unavailable', 'Projection is missing or revoked');
    return deepFreeze(clone(record));
  }

  async list(scope) {
    const records = await this.repository.all('workspaces');
    return deepFreeze(records.filter(record =>
      record.schema === 'gummy.place-projection/v1'
      && record.placeId === scope.placeId
      && record.ownerActorId === scope.ownerActorId
      && record.contextType === scope.contextType
      && record.contextId === scope.contextId
      && !record.revoked
    ).map(clone));
  }

  async revoke(scope) {
    const records = await this.list(scope);
    for (const record of records) {
      await this.repository.put('workspaces', {
        ...clone(record),
        revoked: true,
        revokedAt: new Date().toISOString()
      }, { validate: false });
    }
    return records.length;
  }
}

export { REQUIRED_PLACE_IDS, PRESERVED_APPLICATION_IDS, assertNoSecrets };
