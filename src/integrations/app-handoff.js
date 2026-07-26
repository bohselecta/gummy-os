const SHA256 = /^[a-f0-9]{64}$/;
const SUPPORTED_SOURCE_PROTOCOLS = new Map([
  ['app:imagehoss', new Set(['imagehoss.video-boss-handoff/r3'])],
  ['app:videoboss', new Set(['videoboss.production-export/r3'])],
  ['app:3d-bee', new Set(['3d-bee.scene-package/r2d'])],
  ['app:gummy-rooms', new Set(['gummy2.rooms/legacy'])]
]);

function clone(value) {
  return structuredClone(value);
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

export class HandoffValidationError extends Error {
  constructor(code, message, details = {}) {
    super(`Invalid app handoff: ${message}`);
    this.name = 'HandoffValidationError';
    this.evidence = deepFreeze({
      schema: 'gummy.app-handoff-failure/v1',
      status: 'blocked',
      code,
      message,
      details: clone(details)
    });
  }
}

function fail(code, message, details) {
  throw new HandoffValidationError(code, message, details);
}

function requiredString(value, field) {
  if (typeof value !== 'string' || !value.trim()) fail('missing-field', `${field} is required`, { field });
  return value;
}

function requiredPrefixedString(value, prefix, field) {
  if (!requiredString(value, field).startsWith(prefix)) {
    fail('invalid-identity', `${field} must start with ${prefix}`, { field, prefix });
  }
  return value;
}

function validateHashes(hashes) {
  if (!Array.isArray(hashes) || !hashes.length) fail('missing-hash', 'at least one SHA-256 hash is required');
  for (const hash of hashes) {
    if (hash.algorithm !== 'sha256' || !SHA256.test(hash.value)) {
      fail('invalid-hash', 'hashes must be lowercase SHA-256 values');
    }
  }
}

function validateEvidenceObject(value, field) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || !Object.keys(value).length) {
    fail(`missing-${field}`, `${field} must be a non-empty object`, { field });
  }
}

function validateAssetRefs(assetRefs) {
  if (!Array.isArray(assetRefs)) fail('invalid-asset-refs', 'assetRefs must be an array');
  for (const assetRef of assetRefs) {
    requiredString(assetRef?.id, 'assetRefs.id');
    requiredString(assetRef?.role, 'assetRefs.role');
    if (assetRef.revision === null || assetRef.revision === undefined || assetRef.revision === '') {
      fail('missing-revision', 'every referenced asset must identify its revision', { assetId: assetRef.id });
    }
  }
}

function validateSupportedProtocol(sourceApplicationId, sourceProtocolVersion) {
  const supported = SUPPORTED_SOURCE_PROTOCOLS.get(sourceApplicationId);
  if (!supported?.has(sourceProtocolVersion)) {
    fail('unsupported-protocol', `${sourceProtocolVersion} is not supported for ${sourceApplicationId}`, {
      sourceApplicationId,
      sourceProtocolVersion,
      supported: supported ? [...supported] : []
    });
  }
}

function assertFreshRevision(observedRevision, expectedRevision, label) {
  if (expectedRevision !== undefined && observedRevision !== expectedRevision) {
    fail('stale-revision', `${label} revision is stale`, { observedRevision, expectedRevision });
  }
}

export function assertHandoffCapability(capabilitySnapshot, requiredCapability) {
  const available = capabilitySnapshot?.authenticated === true
    && capabilitySnapshot?.status === 'available'
    && Array.isArray(capabilitySnapshot.capabilities)
    && capabilitySnapshot.capabilities.includes(requiredCapability);
  if (!available) {
    fail('capability-unavailable', `${requiredCapability} is unavailable from a trusted runtime`, {
      requiredCapability,
      status: capabilitySnapshot?.status || 'unknown',
      authenticated: capabilitySnapshot?.authenticated === true
    });
  }
  return true;
}

export function createAppHandoff(input) {
  requiredString(input.id, 'id');
  if (!input.id.startsWith('handoff:')) fail('invalid-identity', 'id must start with handoff:', { field: 'id' });
  for (const field of ['sourceApplicationId', 'targetApplicationId']) {
    requiredPrefixedString(input[field], 'app:', field);
  }
  for (const field of ['sourceProtocolVersion', 'targetProtocolVersion', 'projectId', 'artifactType', 'createdAt']) {
    requiredString(input[field], field);
  }
  validateSupportedProtocol(input.sourceApplicationId, input.sourceProtocolVersion);
  if (Number.isNaN(Date.parse(input.createdAt))) fail('invalid-date', 'createdAt must be a date-time');
  if (!input.sourceEnvelope || typeof input.sourceEnvelope !== 'object' || Array.isArray(input.sourceEnvelope)) {
    fail('missing-source-envelope', 'untouched sourceEnvelope is required');
  }
  validateAssetRefs(input.assetRefs || []);
  validateEvidenceObject(input.provenance, 'provenance');
  validateEvidenceObject(input.rights, 'rights');
  validateHashes(input.hashes);
  const handoff = {
    schema: 'gummy.app-handoff/v1',
    id: input.id,
    sourceApplicationId: input.sourceApplicationId,
    targetApplicationId: input.targetApplicationId,
    sourceProtocolVersion: input.sourceProtocolVersion,
    targetProtocolVersion: input.targetProtocolVersion,
    projectId: input.projectId,
    artifactType: input.artifactType,
    assetRefs: clone(input.assetRefs || []),
    provenance: clone(input.provenance),
    rights: clone(input.rights),
    hashes: clone(input.hashes),
    limitations: clone(input.limitations || []),
    evidenceRefs: clone(input.evidenceRefs || []),
    sourceEnvelope: clone(input.sourceEnvelope),
    createdAt: input.createdAt
  };
  return deepFreeze(handoff);
}

export function adaptImageHossAcceptedAsset(source, {
  id,
  expectedAssetRevision,
  capabilitySnapshot,
  createdAt = new Date().toISOString()
} = {}) {
  if (source?.schema !== 'imagehoss.video-boss-handoff/r3') {
    fail('unsupported-protocol', 'unsupported ImageHoss handoff protocol', { sourceProtocolVersion: source?.schema });
  }
  if (!source.asset?.id) fail('missing-field', 'ImageHoss handoff requires an accepted Asset ID');
  assertFreshRevision(source.asset.revision, expectedAssetRevision, 'ImageHoss Asset');
  if (capabilitySnapshot) assertHandoffCapability(capabilitySnapshot, 'videoboss.handoff');
  return createAppHandoff({
    id,
    sourceApplicationId: 'app:imagehoss',
    targetApplicationId: 'app:videoboss',
    sourceProtocolVersion: source.schema,
    targetProtocolVersion: 'imagehoss.video-boss-handoff/r3',
    projectId: source.targetProjectId || 'project_video_boss',
    artifactType: 'accepted-image-asset',
    assetRefs: [{ id: source.asset.id, role: source.asset.role || 'reference', revision: source.asset.revision ?? null }],
    provenance: source.asset.provenance,
    rights: source.asset.rights,
    hashes: [source.asset.hash],
    limitations: source.limitations || [],
    evidenceRefs: source.evidenceRefs || [],
    sourceEnvelope: source,
    createdAt
  });
}

export function adaptSpecialistArtifact(source, {
  id,
  sourceApplicationId,
  sourceProtocolVersion,
  projectId,
  artifactType,
  assetRefs = [],
  hashes,
  provenance,
  rights,
  limitations = [],
  evidenceRefs = [],
  expectedRevision,
  capabilitySnapshot,
  requiredCapability,
  createdAt = new Date().toISOString()
}) {
  assertFreshRevision(source?.revision, expectedRevision, `${sourceApplicationId} source`);
  if (requiredCapability) assertHandoffCapability(capabilitySnapshot, requiredCapability);
  return createAppHandoff({
    id,
    sourceApplicationId,
    targetApplicationId: 'app:gummy-os',
    sourceProtocolVersion,
    targetProtocolVersion: 'gummy.gummy/v0',
    projectId,
    artifactType,
    assetRefs,
    provenance,
    rights,
    hashes,
    limitations,
    evidenceRefs,
    sourceEnvelope: source,
    createdAt
  });
}

export function handoffToGummy(handoff, {
  id,
  title,
  ownerActorId,
  creatorActorId,
  byteRef,
  mediaType = 'application/json',
  sizeBytes = 0,
  createdAt = new Date().toISOString()
}) {
  if (handoff?.schema !== 'gummy.app-handoff/v1') fail('unsupported-protocol', 'only validated Gummy app handoffs can become Gummies');
  validateSupportedProtocol(handoff.sourceApplicationId, handoff.sourceProtocolVersion);
  validateAssetRefs(handoff.assetRefs || []);
  validateEvidenceObject(handoff.provenance, 'provenance');
  validateEvidenceObject(handoff.rights, 'rights');
  validateHashes(handoff.hashes);
  if (!handoff.sourceEnvelope || typeof handoff.sourceEnvelope !== 'object') {
    fail('missing-source-envelope', 'untouched sourceEnvelope is required');
  }
  requiredPrefixedString(id, 'gummy:', 'gummy id');
  requiredPrefixedString(ownerActorId, 'actor:', 'ownerActorId');
  requiredPrefixedString(creatorActorId, 'actor:', 'creatorActorId');
  requiredString(byteRef, 'byteRef');
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes < 0) {
    fail('invalid-size', 'sizeBytes must be a non-negative safe integer');
  }
  const primaryHash = handoff.hashes[0];
  return deepFreeze({
    schema: 'gummy.gummy/v0',
    id,
    kind: 'artifact',
    title: requiredString(title, 'title'),
    ownerActorId,
    creatorActorId,
    visibility: 'private',
    revision: 1,
    content: { mediaType, byteRef, sizeBytes },
    hash: clone(primaryHash),
    provenance: {
      handoffId: handoff.id,
      sourceApplicationId: handoff.sourceApplicationId,
      sourceProtocolVersion: handoff.sourceProtocolVersion,
      assetRefs: clone(handoff.assetRefs),
      evidenceRefs: clone(handoff.evidenceRefs)
    },
    rights: clone(handoff.rights),
    limitations: clone(handoff.limitations),
    createdAt,
    updatedAt: createdAt,
    extensions: { immutableSourceEnvelope: clone(handoff.sourceEnvelope) }
  });
}

export function shareGummyWithBowl({ gummy, bowl, createdByActorId, linkId, createdAt = new Date().toISOString() }) {
  if (!gummy?.id?.startsWith('gummy:')) throw new Error('Sharing requires a Gummy');
  if (!bowl?.id?.startsWith('bowl:')) throw new Error('Sharing requires a Bowl');
  requiredPrefixedString(createdByActorId, 'actor:', 'createdByActorId');
  requiredPrefixedString(linkId, 'link:', 'linkId');
  if (bowl.policy?.whoCanPublish?.length && !bowl.policy.whoCanPublish.includes(createdByActorId)) {
    throw new Error('Bowl policy does not allow this Actor to share');
  }
  const updatedBowl = {
    ...clone(bowl),
    gummyIds: [...new Set([...(bowl.gummyIds || []), gummy.id])],
    updatedAt: createdAt
  };
  const link = {
    schema: 'gummy.link/v0',
    id: linkId,
    type: 'shared-with',
    source: { kind: 'gummy', id: gummy.id },
    target: { kind: 'bowl', id: bowl.id },
    createdByActorId,
    scope: { audience: bowl.visibility },
    consent: { sourceApproved: true, targetApproved: true, policyReference: 'bowl-policy' },
    status: 'active',
    createdAt
  };
  return deepFreeze({ bowl: updatedBowl, link, sourceGummy: clone(gummy) });
}
