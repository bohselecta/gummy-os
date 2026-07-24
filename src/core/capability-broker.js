import { riskRank } from './protocol.js';

export class CapabilityBroker {
  constructor({ confirmAction = window.confirm } = {}) {
    this.confirmAction = confirmAction;
  }

  async request({ actor, action, resource, risk = 'low', reason, scope = {}, expiresInMs = 5 * 60 * 1000 }) {
    const requiresApproval = riskRank[risk] >= riskRank.medium;
    if (requiresApproval) {
      const approved = await this.confirmAction(`${actor} requests ${action} on ${resource}.\n\nReason: ${reason}`);
      if (!approved) return { granted: false, reason: 'user-denied' };
    }

    return {
      granted: true,
      grant: {
        schema: 'gummy.capability-grant/v0',
        id: `grant:${crypto.randomUUID()}`,
        actor,
        action,
        resource,
        risk,
        reason,
        scope,
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + expiresInMs).toISOString(),
        approval: requiresApproval ? 'human' : 'policy'
      }
    };
  }
}
