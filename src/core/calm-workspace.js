const WARNING_PATTERN = /\b(blocked|denied|failed|failure|offline|unavailable|required|warning|recovery|revoked|expired|needs attention)\b/i;
const DECISION_PATTERN = /\b(approval|decision|review required|human input|choose (?:one|an option|a route))\b/i;

export const CALM_NOTIFICATION_HISTORY_ID = 'notification-history:actor:hayden';
export const CALM_NAVIGATION_ID = 'navigation:actor:hayden';
export const CALM_WORKSPACE_GROUP_ID = 'workspace-group:actor:hayden:default';

export function inferNotificationKind(message, requestedKind = null) {
  if (requestedKind) return requestedKind;
  if (DECISION_PATTERN.test(message)) return 'decision';
  if (WARNING_PATTERN.test(message)) return 'warning';
  return 'success';
}

export function notificationGroupKey(message, requestedKey = null) {
  if (requestedKey) return requestedKey;
  const lead = String(message || '')
    .split(/[.:]/, 1)[0]
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return lead || 'gummy-os';
}

export function notificationDuration(kind) {
  if (kind === 'warning' || kind === 'decision') return null;
  return kind === 'success' ? 2800 : 4500;
}

export function coalesceNotification(current, incoming) {
  if (!current || current.groupKey !== incoming.groupKey) return { ...incoming, count: 1 };
  return {
    ...current,
    ...incoming,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: incoming.updatedAt,
    count: (current.count || 1) + 1,
    events: [...(current.events || []), ...(incoming.events || [])].slice(-12)
  };
}

export function connectionCatalog({
  session = {},
  registryApplications = [],
  lastVerifiedAt = null
} = {}) {
  const application = id => registryApplications.find(item => item.id === id);
  const imageHoss = application('app:imagehoss');
  const videoBoss = application('app:videoboss');
  const meshmallow = application('app:3d-bee');
  const checked = lastVerifiedAt || 'Not tested in this session';
  return [
    {
      id: 'local-box',
      category: 'Storage',
      name: 'Local Gummy Box',
      state: 'connected',
      capability: 'Stores Productions, sources, results, Returns, Receipts, backups, and local preferences in this browser.',
      users: 'Human-owned default storage',
      locality: 'local',
      dataClasses: ['canonical records', 'selected source bytes', 'accepted result bytes', 'evidence'],
      cost: 'No provider charge',
      lastVerifiedAt: 'Verified when this browser opened',
      action: 'open-storage'
    },
    {
      id: 'ai-provider',
      category: 'AI providers',
      name: 'Server AI provider',
      state: session.openaiConfigured ? 'connected' : 'needs-setup',
      capability: 'Can provide bounded governed Agent replies through the trusted server route.',
      users: 'Glopper and explicitly authorized Work Orders',
      locality: 'remote',
      dataClasses: ['approved prompt context only'],
      cost: session.openaiConfigured ? 'Provider pricing applies; Gummy cost policy must allow the request' : 'No charge while disconnected',
      lastVerifiedAt: session.openaiConfigured ? 'Verified by the current server session' : checked,
      action: 'server-managed'
    },
    {
      id: 'github',
      category: 'GitHub',
      name: 'GitHub mirror',
      state: session.githubConfigured ? 'needs-setup' : 'unavailable',
      capability: 'Can mirror a Human-selected private repository with expected-head protection.',
      users: 'Local Gummy Box only after explicit repository selection',
      locality: 'remote',
      dataClasses: ['selected code and text records', 'Returns', 'Receipts'],
      cost: 'No Gummy charge; provider plan limits may apply',
      lastVerifiedAt: session.githubConfigured ? 'Server route available; repository not selected' : checked,
      action: 'open-storage'
    },
    {
      id: 'imagehoss',
      category: 'local companion',
      name: 'ImageHoss',
      state: imageHoss?.connectionStatus === 'available' ? 'connected' : 'needs-setup',
      capability: imageHoss?.productPurpose || 'Direct images and preserve accepted Assets through a bounded local companion.',
      users: 'ImageHoss specialist Actor',
      locality: 'local companion',
      dataClasses: ['approved image direction', 'selected references', 'generated image Assets'],
      cost: 'Local runtime cost; no automatic probe or Job',
      lastVerifiedAt: checked,
      action: 'test-imagehoss'
    },
    {
      id: 'videoboss',
      category: 'VideoBoss',
      name: 'VideoBoss render route',
      state: videoBoss?.connectionStatus === 'available' ? 'planned' : 'unavailable',
      capability: videoBoss?.productPurpose || 'Plan, route, review, and deliver video packages.',
      users: 'VideoBoss specialist Actor',
      locality: 'remote broker required for live rendering',
      dataClasses: ['approved shot packets', 'accepted ImageHoss handoffs', 'render evidence'],
      cost: 'No provider charge until a bounded broker route is connected and approved',
      lastVerifiedAt: checked,
      action: 'details-only'
    },
    {
      id: 'meshmallow',
      category: 'Meshmallow',
      name: 'Meshmallow supervisor',
      state: meshmallow?.connectionStatus === 'available' ? 'connected' : 'needs-setup',
      capability: meshmallow?.productPurpose || 'Build reviewed scene plans through bounded Blender operations.',
      users: 'Meshmallow specialist Actor; legacy 3D Bee identity preserved',
      locality: 'local companion',
      dataClasses: ['approved world intent', 'scene plans', 'validated project-scoped exports'],
      cost: 'Local runtime cost; no automatic probe or Blender execution',
      lastVerifiedAt: checked,
      action: 'details-only'
    },
    {
      id: 'radio',
      category: 'Radio voice',
      name: 'Radio voice route',
      state: 'planned',
      capability: 'Keeps source, voice revision, export approval, and publication approval separate.',
      users: 'Radio Place',
      locality: 'local planning; remote route not connected',
      dataClasses: ['approved script', 'approved voice revision', 'publication evidence'],
      cost: 'No charge while planned',
      lastVerifiedAt: checked,
      action: 'details-only'
    },
    {
      id: 'channels',
      category: 'Channels publication',
      name: 'Channels',
      state: 'blocked',
      capability: 'Prepares a separate Distribution Plan without publishing automatically.',
      users: 'Channels Place',
      locality: 'remote service required',
      dataClasses: ['Human-accepted Artifact', 'approved audience and publication scope'],
      cost: 'No charge while blocked',
      lastVerifiedAt: checked,
      action: 'details-only'
    },
    {
      id: 'rooms',
      category: 'Rooms signaling',
      name: 'Gummy Rooms',
      state: session.signalingConfigured ? 'needs-setup' : 'unavailable',
      capability: 'Preserves governed room, queue, thread, Actor, Bowl, and Receipt contracts.',
      users: 'Gummy Rooms registered Place',
      locality: 'remote signaling',
      dataClasses: ['approved room events and isolated thread messages'],
      cost: 'No charge while disconnected',
      lastVerifiedAt: session.signalingConfigured ? 'Signaling seam configured; no live room implied' : checked,
      action: 'details-only'
    },
    {
      id: 'mcp',
      category: 'MCP servers',
      name: 'MCP runtime',
      state: 'blocked',
      capability: 'Future bounded runtime bridge for named operations beneath Gummy authority.',
      users: 'No Actor or Place in Phase 16.5',
      locality: 'not connected',
      dataClasses: ['none'],
      cost: 'No charge',
      lastVerifiedAt: 'Phase 17 live execution held',
      action: 'details-only'
    }
  ];
}
