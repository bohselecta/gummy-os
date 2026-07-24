import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultState } from '../src/core/state.js';
import { makeBowl, makeDrop, makeReceipt, safeExternalUrl } from '../src/core/protocol.js';
import { CapabilityBroker } from '../src/core/capability-broker.js';

test('default state includes personal, graph, and enterprise surfaces', () => {
  assert.equal(defaultState.snack.id, 'snack:hayden');
  assert.ok(defaultState.graph.snacks.length >= 2);
  assert.ok(defaultState.enterprise.appPacks.length >= 1);
});

test('graph objects receive stable type prefixes', () => {
  assert.match(makeBowl({ name: 'Test Bowl' }).id, /^bowl:/);
  assert.match(makeDrop({ author: '@test', title: 'Hello', scope: 'Test Bowl' }).id, /^drop:/);
});

test('receipts identify the protocol schema', () => {
  const receipt = makeReceipt({ action: 'test', actor: '@test', application: 'Tests' });
  assert.equal(receipt.schema, 'gummy.action-receipt/v0');
  assert.match(receipt.id, /^receipt:/);
});

test('external URLs are restricted to http and https', () => {
  assert.equal(safeExternalUrl('javascript:alert(1)'), null);
  assert.equal(safeExternalUrl('example.com'), 'https://example.com/');
});

test('low-risk capability is granted by policy', async () => {
  const broker = new CapabilityBroker({ confirmAction: () => false });
  const result = await broker.request({ actor: '@test', action: 'read', resource: 'file:1', risk: 'low', reason: 'test' });
  assert.equal(result.granted, true);
  assert.equal(result.grant.approval, 'policy');
});

test('medium-risk capability can be denied by the human', async () => {
  const broker = new CapabilityBroker({ confirmAction: () => false });
  const result = await broker.request({ actor: '@test', action: 'share', resource: 'drop:1', risk: 'medium', reason: 'test' });
  assert.deepEqual(result, { granted: false, reason: 'user-denied' });
});
