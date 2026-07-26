import { createId, sha256 } from './hash.js';
import { LOCAL_OPERATOR_ID, localOperatorRecord } from '../integrations/local-operator.js';

export const CAPABILITIES = Object.freeze(['gummy.read', 'transform.bounded', 'gummy.create']);
export const SOURCE_TEXT = `# Project brief

Gummy OS is a personal, governed AI computer. Turn this brief into an executive-ready summary that preserves the source, identifies constraints, and records limitations.

The first proof is standalone and web-only. It has one Human, two local Actors, one Glopper Web Agent, a Local Gummy Box, explicit Work Orders, temporary Grants, exclusive leases, immutable sources, separate results, and tamper-evident Receipts.
`;

const now = () => new Date().toISOString();

export function personalRecords({ name = 'Hayden', address = '@hayden', sourceHash, byteRef }) {
  const timestamp = now();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const human = {
    schema: 'gummy.human/v0', id: 'human:hayden', name, status: 'active',
    actorIds: ['actor:hayden', 'actor:studio-test'], authorizedAgentIds: ['agent:glopper-web'],
    identityAssurance: 'local-unverified', createdAt: timestamp, updatedAt: timestamp
  };
  const actor = {
    schema: 'gummy.actor/v0', id: 'actor:hayden', address, kind: 'person', name, status: 'active',
    humanAuthorityIds: [human.id], moldIds: ['mold:hayden:personal'], agentIds: ['agent:glopper-web'],
    gummyIds: ['gummy:project-brief'], deployment: { mode: 'web-only', authoritativeLocation: 'box:hayden', lastOpenedAt: timestamp },
    syncPolicy: { mode: 'none', directions: [], allowedData: ['approved-portable-profile'], requiresApproval: true },
    createdAt: timestamp, updatedAt: timestamp
  };
  const testActor = {
    schema: 'gummy.actor/v0', id: 'actor:studio-test', address: '@gummy-studio-test', kind: 'project-role',
    name: 'Gummy Studio Test Actor', status: 'active', humanAuthorityIds: [human.id], moldIds: [],
    agentIds: [], gummyIds: [], deployment: { mode: 'web-only', authoritativeLocation: 'local-test' },
    syncPolicy: { mode: 'none', directions: [], allowedData: [], requiresApproval: true },
    createdAt: timestamp, updatedAt: timestamp, legacyIds: ['snack:studio'],
    extensions: { provenance: 'v0.1-localstorage-to-v0.2-idb' }
  };
  const agent = {
    schema: 'gummy.agent/v0', id: 'agent:glopper-web', name: 'Glopper Web', characterFamily: 'Glopper',
    version: '1.0.0', providerClass: 'OpenAI', model: 'gpt-5.6-sol', runtimeClass: 'server', locality: 'cloud',
    status: 'available', humanAuthorityIds: [human.id], actorIds: [actor.id], moldIds: ['mold:hayden:personal'],
    activeTaskLeaseIds: [], capabilityCeiling: CAPABILITIES,
    memoryBoundary: { privateLocal: true, portableProfileAllowed: true, currentTaskContextOnly: true },
    disclosure: { operator: 'OpenAI Responses through the local Gummy server', autonomy: 'human-directed', providerDisclosure: 'OpenAI / gpt-5.6-sol' },
    createdAt: timestamp, updatedAt: timestamp, extensions: { legacyIds: ['snack:zeke'], characterOnly: true }
  };
  const localOperator = localOperatorRecord({ humanId: human.id, actorId: actor.id, now: timestamp });
  const mold = {
    schema: 'gummy.mold/v0', id: 'mold:hayden:personal', actorId: actor.id, name: 'Personal Gummy',
    handle: address, status: 'active', allowedHumanIds: [human.id], allowedAgentIds: [agent.id],
    role: 'personal operator', context: 'Standalone founder proof',
    representation: { displayName: name, description: 'Personal Actor', shape: 'soft-square', primaryColor: '#4B187A', secondaryColor: '#7C2FD0', accentColor: '#F2B544' },
    permissions: { capabilities: CAPABILITIES, readScopes: ['gummy:project-brief'], writeScopes: ['box:hayden/artifacts'], publishScopes: [], requiresHumanApproval: true },
    runtimePolicy: { allowedLocalities: ['web', 'cloud'], allowedRuntimeClasses: ['server'], networkPolicy: 'approved-provider-only' },
    syncPolicy: { mode: 'approved', allowedData: ['approved-portable-profile'], directions: [] },
    disclosure: { operatorType: 'mixed', agentDisclosureRequired: true, licenseDisclosure: 'Local proof; no verified identity claim.' },
    issuedBy: human.id, issuedAt: timestamp, updatedAt: timestamp
  };
  const masterControl = {
    schema: 'gummy.master-control/v0', id: 'master-control:hayden', humanAuthorityId: human.id, actorId: actor.id,
    activeAgentId: agent.id, activeMoldId: mold.id, authoritativeLocation: 'box:hayden',
    deploymentMode: 'web-only', syncMode: 'none', syncDirections: [], allowedData: ['private-local-memory', 'approved-portable-profile', 'task-context'],
    executorPolicy: { allowedAgentIds: [agent.id], parallelExecution: 'deny', takeoverRequiresHumanApproval: true },
    approvalRules: { default: 'ask', externalNetwork: 'ask', publish: 'deny', destructive: 'ask', sync: 'ask', nativePromotion: 'deny', portableProfileUpdate: 'ask' },
    revokedAgentIds: [], revokedMoldIds: [], revokedTaskLeaseIds: [], status: 'active', updatedAt: timestamp
  };
  const box = {
    schema: 'gummy.box/v0', id: 'box:hayden', humanAuthorityId: human.id, actorId: actor.id,
    provider: { type: 'local', connectionId: 'local:opfs', rootRef: '/gummy-box/box%3Ahayden', displayName: 'Local Gummy Box', scope: ['gummy-box'] },
    authoritativeLocation: 'Local Gummy Box', mirrorLocations: [], allowedWriterRefs: [human.id, agent.id],
    allowedReaderRefs: [human.id, actor.id, agent.id],
    paths: { inbox: 'inbox/', claimed: 'claimed/', running: 'running/', returns: 'returns/', artifacts: 'artifacts/', receipts: 'receipts/', archive: 'archive/', profile: 'profile/' },
    syncPolicy: { mode: 'none', allowedData: ['work-orders', 'returns', 'receipts', 'artifacts', 'approved-portable-profile'], requiresHumanApproval: true },
    protocolVersion: '0.2', status: 'active', createdAt: timestamp, updatedAt: timestamp
  };
  const gummy = {
    schema: 'gummy.gummy/v0', id: 'gummy:project-brief', kind: 'file', title: 'Project Brief.md',
    ownerActorId: actor.id, creatorActorId: actor.id, visibility: 'private', revision: 1,
    content: { mediaType: 'text/markdown', byteRef, sizeBytes: new TextEncoder().encode(SOURCE_TEXT).byteLength },
    hash: { algorithm: 'sha256', value: sourceHash }, capabilities: ['read'],
    quarantine: { status: 'contained-approved', source: 'built-in example', classification: 'trusted local seed', decidedByHumanId: human.id, decidedAt: timestamp, nativeAuthority: false },
    createdAt: timestamp, updatedAt: timestamp
  };
  const workOrder = {
    schema: 'gummy.work-order/v0', id: 'work-order:project-brief', boxId: box.id,
    issuer: { type: 'human', id: human.id, displayName: name },
    target: { humanAuthorityId: human.id, actorId: actor.id, preferredAgentFamily: 'Glopper', preferredAgentId: agent.id, moldId: mold.id, masterControlId: masterControl.id },
    goal: 'Transform the project brief into a concise executive-ready Markdown summary.',
    context: 'Standalone, web-only founder review.',
    sourceRefs: [{ kind: 'gummy', ref: gummy.id, hash: sourceHash, required: true }],
    scope: { requestedCapabilities: CAPABILITIES, gummyIds: [gummy.id], allowedWriteTargets: [`${box.id}/artifacts`], forbiddenActions: ['overwrite-source', 'native-execution', 'shell', 'publish'], maxCost: 0.25 },
    execution: { requiredLocality: 'cloud', privacy: 'approved-cloud', preferredInference: 'frontier-cloud', requiresNative: false, offlineAllowed: false },
    acceptance: { checks: ['Source hash remains unchanged', 'Result is a separate Markdown Gummy', 'Return and chained Receipt exist'], expectedReturn: { format: 'gummy.work-return/v0' }, humanAcceptanceRequired: true },
    approval: { required: true, risk: 'medium' }, status: 'awaiting-approval', createdAt: timestamp, updatedAt: timestamp, expiresAt,
    extensions: { builtInExample: true }
  };
  const profiles = [
    { id: 'profile:hayden:private', type: 'private-local-memory', actorId: actor.id, syncEligible: false, content: 'Local continuity notes stay on this device.', updatedAt: timestamp },
    { id: 'profile:hayden:portable', type: 'approved-portable-profile', actorId: actor.id, syncEligible: true, status: 'draft', content: 'Preferred concise, evidence-forward summaries.', updatedAt: timestamp },
    { id: 'profile:hayden:task', type: 'current-task-context', actorId: actor.id, syncEligible: false, workOrderId: workOrder.id, content: 'Project brief transformation context.', updatedAt: timestamp }
  ];
  return { human, actor, testActor, agent, localOperator, mold, masterControl, box, gummy, workOrder, profiles };
}

export async function ensureFullProductRecords(repository) {
  if (await repository.get('agents', LOCAL_OPERATOR_ID)) return false;
  const [human, actor] = await Promise.all([
    repository.get('humans', 'human:hayden'),
    repository.get('actors', 'actor:hayden')
  ]);
  if (!human || !actor) return false;
  await repository.putValidated('agents', localOperatorRecord({
    humanId: human.id,
    actorId: actor.id
  }));
  return true;
}

export async function createReceipt(repository, input) {
  const previous = (await repository.all('receipts')).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).at(-1);
  const receipt = {
    schema: 'gummy.action-receipt/v0', id: createId('receipt'),
    humanAuthorityId: 'human:hayden', actorId: 'actor:hayden', actorAddress: '@hayden',
    operatorType: input.operatorType || 'human', operatorId: input.operatorId || 'human:hayden',
    agentId: input.agentId, characterFamily: input.agentId ? 'Glopper' : undefined,
    moldId: input.moldId || 'mold:hayden:personal', masterControlId: 'master-control:hayden',
    application: input.application || 'Gummy OS', action: input.action,
    taskLeaseId: input.taskLeaseId, grantIds: input.grantIds || [],
    sourceGummyIds: input.sourceGummyIds || [], resultGummyIds: input.resultGummyIds || [],
    linkIds: input.linkIds || [], resources: input.resources || [], capabilities: input.capabilities || [],
    outcome: input.outcome || 'completed', reversible: input.reversible ?? false,
    cost: input.cost, executionRoute: input.executionRoute,
    evidence: input.evidence || {}, detail: input.detail || '', createdAt: now(),
    extensions: { ...input.extensions, priorReceiptHash: previous?.canonicalHash || null, evidenceType: 'local-tamper-evidence-not-signature' }
  };
  receipt.canonicalHash = await sha256(receipt);
  await repository.putValidated('receipts', receipt);
  return receipt;
}

export function makeGrant({ action, resource, leaseId, moldId = 'mold:hayden:personal' }) {
  const issuedAt = now();
  return {
    schema: 'gummy.capability-grant/v0', id: createId('grant'), humanAuthorityId: 'human:hayden',
    actorId: 'actor:hayden', operatorType: 'agent', operatorId: 'agent:glopper-web', agentId: 'agent:glopper-web',
    characterFamily: 'Glopper', moldId, masterControlId: 'master-control:hayden', taskLeaseId: leaseId,
    action, resource, resourceKind: resource.startsWith('gummy:') ? 'gummy' : 'other', risk: 'medium',
    reason: 'Human-approved project brief Work Order', scope: { bounded: true }, locality: 'cloud',
    approval: 'human', issuerId: 'human:hayden', issuedAt, expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), revoked: false
  };
}
