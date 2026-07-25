import { sha256 } from './hash.js';
import { CAPABILITIES } from './records.js';

export class PolicyError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'PolicyError';
    this.code = code;
  }
}

export class PolicyEngine {
  constructor(repository, byteStore) {
    this.repository = repository;
    this.byteStore = byteStore;
  }

  async validateWorkOrder(workOrder, { sourceBytes } = {}) {
    if (Date.parse(workOrder.expiresAt) <= Date.now()) throw new PolicyError('expired', 'Work Order has expired.');
    const [human, actor, agent, mold, control, box] = await Promise.all([
      this.repository.get('humans', workOrder.target.humanAuthorityId),
      this.repository.get('actors', workOrder.target.actorId),
      this.repository.get('agents', workOrder.target.preferredAgentId),
      this.repository.get('molds', workOrder.target.moldId),
      this.repository.get('masterControls', workOrder.target.masterControlId),
      this.repository.get('boxes', workOrder.boxId)
    ]);
    if (![human, actor, agent, mold, control, box].every(Boolean)) throw new PolicyError('unresolved', 'One or more authority links do not resolve.');
    if (actor.id === agent.id || !actor.id.startsWith('actor:') || !agent.id.startsWith('agent:')) throw new PolicyError('identity', 'Actor and Agent must be distinct.');
    if (!actor.humanAuthorityIds?.includes(human.id) || !human.actorIds?.includes(actor.id)) throw new PolicyError('human-authority', 'Human sponsorship does not resolve in both directions.');
    if (!human.authorizedAgentIds?.includes(agent.id) || !agent.humanAuthorityIds?.includes(human.id)) throw new PolicyError('agent-authority', 'Agent is not authorized by this Human.');
    if (!mold.allowedAgentIds?.includes(agent.id) || mold.actorId !== actor.id) throw new PolicyError('mold-authority', 'Mold does not authorize this Agent and Actor pair.');
    if (control.status !== 'active' || control.activeAgentId !== agent.id || control.activeMoldId !== mold.id) throw new PolicyError('master-control', 'Master Control is not active on the requested route.');
    if (mold.status !== 'active' || control.revokedMoldIds?.includes(mold.id)) throw new PolicyError('revoked', `${mold.id} is revoked.`);
    if (agent.status === 'revoked' || control.revokedAgentIds?.includes(agent.id)) throw new PolicyError('revoked', `${agent.id} is revoked.`);
    const requested = workOrder.scope.requestedCapabilities;
    for (const capability of requested) {
      if (!CAPABILITIES.includes(capability) || !agent.capabilityCeiling.includes(capability) || !mold.permissions.capabilities.includes(capability)) {
        throw new PolicyError('capability', `Capability is outside the authority intersection: ${capability}`);
      }
    }
    if (workOrder.execution.requiresNative || !['cloud', 'web', 'any'].includes(workOrder.execution.requiredLocality)) {
      throw new PolicyError('locality', 'This standalone route is eligible only for web/cloud work.');
    }
    if (workOrder.execution.requiredLocality !== 'any' && !mold.runtimePolicy.allowedLocalities.includes(workOrder.execution.requiredLocality)) {
      throw new PolicyError('locality-ceiling', 'Required locality is outside the Mold runtime policy.');
    }
    if (workOrder.scope.forbiddenActions.some(action => ['shell', 'native-execution'].includes(action)) === false) {
      throw new PolicyError('forbidden-actions', 'Standalone transformations must explicitly forbid shell and native execution.');
    }
    if (sourceBytes) {
      const actual = await sha256(sourceBytes);
      if (actual !== workOrder.sourceRefs[0].hash) throw new PolicyError('source-hash', 'Source hash no longer matches the approved Work Order.');
    }
    for (const sourceRef of workOrder.sourceRefs.filter(ref => ref.kind === 'gummy')) {
      const gummy = await this.repository.get('gummies', sourceRef.ref);
      if (!gummy) throw new PolicyError('source-unresolved', `Source does not resolve: ${sourceRef.ref}`);
      if (sourceRef.hash && sourceRef.hash !== gummy.hash?.value) throw new PolicyError('source-metadata-hash', `Approved source hash does not match durable metadata: ${sourceRef.ref}`);
    }
    return { human, actor, agent, mold, control, box };
  }

  async validateExecution(workOrder, lease, grants, sourceBytes) {
    await this.validateWorkOrder(workOrder, { sourceBytes });
    if (lease.status !== 'active' || Date.parse(lease.expiresAt) <= Date.now()) throw new PolicyError('lease', 'The task lease is not active.');
    if (lease.taskId !== workOrder.id) throw new PolicyError('lease-link', 'Task Lease does not link to this Work Order.');
    for (const grant of grants) {
      if (grant.revoked || Date.parse(grant.expiresAt) <= Date.now() || grant.taskLeaseId !== lease.id) throw new PolicyError('grant', 'A required Grant is invalid.');
    }
    if (grants.length !== 3) throw new PolicyError('grant-count', 'Exactly three bounded Grants are required.');
    const actions = new Set(grants.map(grant => grant.action));
    for (const capability of CAPABILITIES) if (!actions.has(capability)) throw new PolicyError('grant-action', `Missing required Grant action: ${capability}`);
    return true;
  }

  scopeHash(workOrder) {
    return sha256({ actorId: workOrder.target.actorId, gummyIds: [...workOrder.scope.gummyIds].sort(), writeTargets: [...workOrder.scope.allowedWriteTargets].sort() });
  }
}
