import { createId, sha256 } from './hash.js';
import { createReceipt, makeGrant } from './records.js';
import { PolicyError } from './policy-engine.js';

const now = () => new Date().toISOString();

export class WorkOrderWorkflow {
  constructor({ repository, byteStore, policy, box }) {
    Object.assign(this, { repository, byteStore, policy, box });
  }

  async decide(workOrder, decision) {
    if (decision === 'hold') {
      const held = { ...workOrder, status: 'held', updatedAt: now() };
      await this.repository.putValidated('workOrders', held);
      await createReceipt(this.repository, { action: 'hold-work-order', resources: [workOrder.id], outcome: 'completed', reversible: true, detail: 'Held without issuing a lease or Grant.' });
      return held;
    }
    if (decision === 'reject') {
      const returned = await this.terminalReturn(workOrder, 'denied', 'Human rejected the proposed Work Order.');
      await this.box.archive(workOrder, 'rejected');
      return returned;
    }
    if (decision === 'revise') {
      const revised = {
        ...structuredClone(workOrder), id: createId('work-order'), status: 'awaiting-approval',
        goal: `${workOrder.goal} Keep the result under 500 words.`,
        approval: { required: true, risk: 'medium' }, createdAt: now(), updatedAt: now(),
        extensions: { ...workOrder.extensions, supersedes: workOrder.id }
      };
      await this.repository.putValidated('workOrders', revised);
      await this.box.archive(workOrder, 'cancelled');
      await createReceipt(this.repository, { action: 'revise-work-order', resources: [workOrder.id, revised.id], outcome: 'completed', reversible: false });
      return revised;
    }
    if (decision !== 'approve') throw new Error(`Unknown decision: ${decision}`);
    return this.approve(workOrder);
  }

  async approve(workOrder) {
    let authority;
    try {
      authority = await this.policy.validateWorkOrder(workOrder);
    } catch (error) {
      if (error instanceof PolicyError) return this.terminalReturn(workOrder, 'blocked', error.message);
      throw error;
    }
    const leaseId = createId('lease');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const scopeHash = await this.policy.scopeHash(workOrder);
    const claim = await this.repository.acquireLeaseClaim({ scopeHash, leaseId, expiresAt });
    if (!claim.acquired) return this.terminalReturn(workOrder, 'blocked', `Scope is already leased by ${claim.current.leaseId}.`);
    const lease = {
      schema: 'gummy.task-lease/v0', id: leaseId, humanAuthorityId: authority.human.id,
      actorId: authority.actor.id, agentId: authority.agent.id, moldId: authority.mold.id,
      masterControlId: authority.control.id, taskId: workOrder.id,
      scope: { gummyIds: workOrder.scope.gummyIds, capabilities: workOrder.scope.requestedCapabilities },
      authoritativeLocation: authority.box.authoritativeLocation, mode: 'exclusive',
      expectedReturn: workOrder.acceptance.expectedReturn, status: 'active', issuedAt: now(), expiresAt,
      extensions: { workOrderId: workOrder.id, scopeHash }
    };
    const approvedOrder = {
      ...workOrder, status: 'approved', taskLeaseId: lease.id, updatedAt: now(),
      approval: { ...workOrder.approval, approvedBy: authority.human.id, approvedAt: now() }
    };
    const grants = [
      makeGrant({ action: 'gummy.read', resource: workOrder.scope.gummyIds[0], leaseId }),
      makeGrant({ action: 'transform.bounded', resource: workOrder.id, leaseId }),
      makeGrant({ action: 'gummy.create', resource: `${workOrder.boxId}/artifacts`, leaseId })
    ];
    await this.repository.transaction(['workOrders', 'taskLeases', 'grants', 'masterControls'], 'readwrite', async tx => {
      await tx.objectStore('workOrders').put(approvedOrder);
      await tx.objectStore('taskLeases').put(lease);
      for (const grant of grants) await tx.objectStore('grants').put(grant);
      await tx.objectStore('masterControls').put({ ...authority.control, activeTaskLeaseId: lease.id, updatedAt: now() });
    });
    return { workOrder: approvedOrder, lease, grants };
  }

  async execute({ workOrder, lease, grants }) {
    const source = await this.repository.get('gummies', workOrder.scope.gummyIds[0]);
    const sourceBytes = await this.byteStore.read(source.content.byteRef);
    try {
      await this.policy.validateExecution(workOrder, lease, grants, sourceBytes);
    } catch (error) {
      return this.completeFailure(workOrder, lease, grants, 'blocked', error.message);
    }
    if (!navigator.onLine) {
      const queued = {
        id: `outbox:${workOrder.id}`,
        operation: 'resume-approved-execution',
        workOrderId: workOrder.id,
        leaseId: lease.id,
        grantIds: grants.map(grant => grant.id),
        idempotencyKey: `${workOrder.id}:${lease.id}`,
        status: 'queued',
        createdAt: now()
      };
      await this.repository.put('outbox', queued, { validate: false });
      return { status: 'offline-queued', queued };
    }
    let response;
    try {
      response = await fetch('/api/v1/executions/transform', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-gummy-csrf': sessionStorage.getItem('gummy-csrf') || '' },
        body: JSON.stringify({
          human: await this.repository.get('humans', 'human:hayden'),
          actor: await this.repository.get('actors', 'actor:hayden'),
          agent: await this.repository.get('agents', 'agent:glopper-web'),
          mold: await this.repository.get('molds', workOrder.target.moldId),
          masterControl: await this.repository.get('masterControls', 'master-control:hayden'),
          workOrder, taskLease: lease, grants,
          source: { id: source.id, mediaType: source.content.mediaType, title: source.title },
          sourceText: new TextDecoder().decode(sourceBytes),
          sourceHash: source.hash.value,
          idempotencyKey: `${workOrder.id}:${lease.id}`
        })
      });
    } catch {
      return this.completeFailure(workOrder, lease, grants, 'failed', 'Network request failed or became ambiguous; it was not silently retried.');
    }
    const provider = await response.json().catch(() => ({ status: 'failed', message: 'Malformed server response.' }));
    if (!response.ok || provider.status !== 'completed') {
      return this.completeFailure(workOrder, lease, grants, provider.status || 'failed', provider.message || 'Provider call failed.', provider);
    }
    const postHash = await sha256(await this.byteStore.read(source.content.byteRef));
    if (postHash !== source.hash.value) return this.completeFailure(workOrder, lease, grants, 'failed', 'Source changed during execution.');
    const resultId = createId('gummy');
    const markdown = `# ${provider.result.title}\n\n${provider.result.markdown}\n\n## Summary\n\n${provider.result.summary}\n\n## Limitations\n\n${provider.result.limitations.map(item => `- ${item}`).join('\n')}`;
    const stored = await this.byteStore.writeGummy(resultId, 1, markdown);
    const result = {
      schema: 'gummy.gummy/v0', id: resultId, kind: 'result', title: provider.result.title,
      ownerActorId: 'actor:hayden', creatorActorId: 'actor:hayden', operatorActorId: 'actor:hayden',
      moldId: workOrder.target.moldId, visibility: 'private', revision: 1,
      content: { mediaType: 'text/markdown', byteRef: stored.path, sizeBytes: stored.byteLength },
      hash: { algorithm: 'sha256', value: stored.hash },
      quarantine: { status: 'contained-approved', source: 'OpenAI Responses', classification: 'provider-authored bounded text', decidedByHumanId: 'human:hayden', decidedAt: now(), nativeAuthority: false },
      provenance: { sourceGummyIds: [source.id], receiptIds: [], linkIds: [] },
      capabilities: ['read', 'bounded-browser-export'], createdAt: now(), updatedAt: now()
    };
    const links = [
      { schema: 'gummy.link/v0', id: createId('link'), type: 'derived-from', source: { kind: 'gummy', id: result.id }, target: { kind: 'gummy', id: source.id }, createdByActorId: 'actor:hayden', moldId: workOrder.target.moldId, status: 'active', createdAt: now() },
      { schema: 'gummy.link/v0', id: createId('link'), type: 'created-by', source: { kind: 'gummy', id: result.id }, target: { kind: 'actor', id: 'actor:hayden' }, createdByActorId: 'actor:hayden', moldId: workOrder.target.moldId, status: 'active', createdAt: now(), extensions: { agentId: 'agent:glopper-web' } }
    ];
    const receipt = await createReceipt(this.repository, {
      action: 'execute-bounded-transform', operatorType: 'agent', operatorId: 'agent:glopper-web', agentId: 'agent:glopper-web',
      moldId: workOrder.target.moldId, taskLeaseId: lease.id, grantIds: grants.map(grant => grant.id),
      sourceGummyIds: [source.id], resultGummyIds: [result.id], linkIds: links.map(link => link.id),
      resources: [workOrder.id, source.id, result.id], capabilities: grants.map(grant => grant.action),
      executionRoute: { providerClass: provider.provider, model: provider.model, runtime: 'agent:glopper-web', locality: provider.locality, authoritativeLocation: 'Local Gummy Box', syncMode: 'none' },
      cost: { currency: 'USD', amount: provider.cost.amount },
      evidence: { sourceHashes: [source.hash.value], resultHashes: [result.hash.value], traceRef: provider.requestId },
      detail: 'Created a separate result Gummy; source bytes remained unchanged.',
      extensions: { providerRequestId: provider.requestId, usage: provider.usage, priceTableVersion: provider.cost.priceTableVersion, runtimeMs: provider.runtimeMs }
    });
    result.provenance.receiptIds = [receipt.id];
    result.provenance.linkIds = links.map(link => link.id);
    const returned = {
      schema: 'gummy.work-return/v0', id: createId('return'), boxId: workOrder.boxId, workOrderId: workOrder.id,
      taskLeaseId: lease.id, humanAuthorityId: 'human:hayden', actorId: 'actor:hayden', agentId: 'agent:glopper-web', moldId: workOrder.target.moldId,
      baseState: { sourceHashes: [source.hash.value] }, filesChanged: [], gummiesChanged: [result.id],
      actionsPerformed: ['Read approved source', 'Created bounded Markdown result', 'Linked provenance', 'Recorded Receipt'],
      checks: workOrder.acceptance.checks.map(name => ({ name, outcome: 'pass' })),
      artifactRefs: [`${workOrder.boxId}/artifacts/${result.id}.md`], receiptIds: [receipt.id],
      knownLimitations: provider.result.limitations, provenClaims: ['Source hash unchanged', 'Separate result persisted'], unprovenClaims: [],
      recommendedNextAction: 'Human reviews and accepts the result.', result: 'completed', createdAt: now()
    };
    if (this.repository.validator) {
      await this.repository.validator(result, 'gummies', this.repository);
      for (const link of links) await this.repository.validator(link, 'links', this.repository);
      await this.repository.validator(returned, 'returns', this.repository);
    }
    await this.repository.transaction(['gummies', 'links', 'returns', 'workOrders', 'taskLeases', 'masterControls'], 'readwrite', async tx => {
      await tx.objectStore('gummies').put(result);
      for (const link of links) await tx.objectStore('links').put(link);
      await tx.objectStore('returns').put(returned);
      await tx.objectStore('workOrders').put({ ...workOrder, status: 'returned', updatedAt: now() });
      await tx.objectStore('taskLeases').put({ ...lease, status: 'completed', releasedAt: now() });
      const control = await tx.objectStore('masterControls').get('master-control:hayden');
      const updated = { ...control, updatedAt: now() };
      delete updated.activeTaskLeaseId;
      await tx.objectStore('masterControls').put(updated);
    });
    await this.box.writeArtifact(workOrder.boxId, `${result.id}.md`, markdown);
    await this.repository.releaseLeaseClaim(lease.extensions.scopeHash, lease.id);
    return { status: 'completed', result, returned, receipt };
  }

  async terminalReturn(workOrder, result, detail) {
    const leaseId = workOrder.taskLeaseId || createId('lease');
    const receipt = await createReceipt(this.repository, { action: 'work-order-decision', resources: [workOrder.id], outcome: result === 'denied' ? 'denied' : 'failed', detail });
    const returned = {
      schema: 'gummy.work-return/v0', id: createId('return'), boxId: workOrder.boxId, workOrderId: workOrder.id,
      taskLeaseId: leaseId, humanAuthorityId: 'human:hayden', actorId: 'actor:hayden', agentId: 'agent:glopper-web',
      moldId: workOrder.target.moldId, actionsPerformed: [], checks: workOrder.acceptance.checks.map(name => ({ name, outcome: result === 'blocked' ? 'blocked' : 'not-run' })),
      artifactRefs: [], receiptIds: [receipt.id], knownLimitations: [detail], provenClaims: ['No provider call was made'], unprovenClaims: [],
      recommendedNextAction: 'Review authority and approve a new Work Order.', result, createdAt: now()
    };
    await this.repository.put('returns', returned, { validate: false });
    await this.repository.putValidated('workOrders', { ...workOrder, status: result === 'denied' ? 'rejected' : 'failed', updatedAt: now() });
    return { status: result, returned, receipt };
  }

  async completeFailure(workOrder, lease, grants, status, detail, provider = {}) {
    const outcome = status === 'denied' ? 'denied' : 'failed';
    const receipt = await createReceipt(this.repository, {
      action: 'execute-bounded-transform', operatorType: 'agent', operatorId: 'agent:glopper-web', agentId: 'agent:glopper-web',
      taskLeaseId: lease.id, grantIds: grants.map(grant => grant.id), sourceGummyIds: workOrder.scope.gummyIds,
      resources: [workOrder.id], capabilities: grants.map(grant => grant.action), outcome, detail,
      evidence: { traceRef: provider.requestId }, extensions: { typedStatus: status }
    });
    const returned = {
      schema: 'gummy.work-return/v0', id: createId('return'), boxId: workOrder.boxId, workOrderId: workOrder.id,
      taskLeaseId: lease.id, humanAuthorityId: 'human:hayden', actorId: 'actor:hayden', agentId: 'agent:glopper-web', moldId: workOrder.target.moldId,
      actionsPerformed: [], checks: workOrder.acceptance.checks.map(name => ({ name, outcome: status === 'blocked' ? 'blocked' : 'fail' })),
      artifactRefs: [], receiptIds: [receipt.id], knownLimitations: [detail], provenClaims: ['Terminal evidence recorded'], unprovenClaims: [],
      recommendedNextAction: 'Review the failure and re-approve if appropriate.', result: ['denied', 'blocked'].includes(status) ? status : 'failed', createdAt: now()
    };
    await this.repository.putValidated('returns', returned);
    await this.repository.putValidated('taskLeases', { ...lease, status: 'released', releasedAt: now() });
    await this.repository.putValidated('workOrders', { ...workOrder, status: 'failed', updatedAt: now() });
    await this.repository.releaseLeaseClaim(lease.extensions.scopeHash, lease.id);
    return { status, returned, receipt };
  }
}
