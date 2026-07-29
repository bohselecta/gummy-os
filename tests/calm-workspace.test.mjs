import test from 'node:test';
import assert from 'node:assert/strict';
import {
  coalesceNotification,
  connectionCatalog,
  inferNotificationKind,
  notificationDuration
} from '../src/core/calm-workspace.js';

test('Calm Workspace classifies, persists, and coalesces notifications without execution actions', () => {
  assert.equal(inferNotificationKind('Saved locally.'), 'success');
  assert.equal(inferNotificationKind('Review required before release.'), 'decision');
  assert.equal(inferNotificationKind('Connection blocked.'), 'warning');
  assert.equal(notificationDuration('warning'), null);
  assert.equal(notificationDuration('decision'), null);
  assert.equal(notificationDuration('success'), 2800);

  const first = {
    id: 'notification:one',
    message: 'Saved item one.',
    groupKey: 'save',
    createdAt: '2026-07-29T00:00:00.000Z',
    updatedAt: '2026-07-29T00:00:00.000Z',
    events: [{ message: 'Saved item one.' }]
  };
  const second = {
    id: 'notification:two',
    message: 'Saved item two.',
    groupKey: 'save',
    createdAt: '2026-07-29T00:00:01.000Z',
    updatedAt: '2026-07-29T00:00:01.000Z',
    events: [{ message: 'Saved item two.' }]
  };
  const combined = coalesceNotification(first, second);
  assert.equal(combined.id, first.id);
  assert.equal(combined.count, 2);
  assert.equal(combined.events.length, 2);
  assert.equal(combined.message, second.message);
});

test('Connections catalog is truthful, credential-free, and keeps Phase 17 MCP blocked', () => {
  const catalog = connectionCatalog({
    session: {
      openaiConfigured: false,
      githubConfigured: false,
      signalingConfigured: false
    },
    registryApplications: []
  });
  assert.deepEqual(catalog.map(item => item.id), [
    'local-box',
    'ai-provider',
    'github',
    'imagehoss',
    'videoboss',
    'meshmallow',
    'radio',
    'channels',
    'rooms',
    'mcp'
  ]);
  const mcp = catalog.find(item => item.id === 'mcp');
  assert.equal(mcp.state, 'blocked');
  assert.deepEqual(mcp.dataClasses, ['none']);
  assert.match(mcp.lastVerifiedAt, /Phase 17 live execution held/);
  assert.doesNotMatch(JSON.stringify(catalog), /(api[_-]?key|bearer|password|secret)/i);
});
