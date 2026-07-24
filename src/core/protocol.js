export const GUMMY_PROTOCOL_VERSION = '0.1';

export const riskRank = Object.freeze({ low: 1, medium: 2, high: 3, critical: 4 });

export function makeReceipt({ action, actor, application, resources = [], capabilities = [], outcome = 'completed', reversible = true, detail = '' }) {
  return {
    schema: 'gummy.action-receipt/v0',
    id: `receipt:${crypto.randomUUID()}`,
    action,
    actor,
    application,
    resources,
    capabilities,
    outcome,
    reversible,
    detail,
    createdAt: new Date().toISOString()
  };
}

export function makeDrop({ author, title, scope, kind = 'note' }) {
  return {
    schema: 'gummy.graph-object/v0',
    id: `drop:${crypto.randomUUID()}`,
    author,
    title,
    scope,
    kind,
    forks: 0,
    createdAt: new Date().toISOString()
  };
}

export function makeBowl({ name, visibility = 'private', description = '' }) {
  return {
    schema: 'gummy.graph-object/v0',
    id: `bowl:${crypto.randomUUID()}`,
    name,
    visibility,
    members: 1,
    description
  };
}

export function safeExternalUrl(value) {
  try {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(withProtocol);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}
