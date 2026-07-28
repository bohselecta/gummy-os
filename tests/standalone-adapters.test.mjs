import assert from 'node:assert/strict';
import test from 'node:test';
import { standaloneAdapter, createLaunchRoute } from '../src/places/standalone-adapters.js';

test('canonical standalone products remain separate authorities', () => {
  assert.equal(standaloneAdapter('app:gummy-house').repository, 'bohselecta/homewright');
  assert.equal(standaloneAdapter('app:gummy-radio').publicName, 'AfterCast');
  assert.equal(standaloneAdapter('app:gummy-worlds').repository, 'bohselecta/3d-bee');
});

test('remote launch requires allowlisted HTTPS origins', () => {
  assert.equal(
    createLaunchRoute('app:gummy-radio', 'https://www.getaftercast.com', ['https://www.getaftercast.com']),
    'https://www.getaftercast.com/'
  );
  assert.throws(
    () => createLaunchRoute('app:gummy-radio', 'https://example.com', ['https://www.getaftercast.com']),
    error => error.evidence.code === 'route-not-allowlisted'
  );
});

test('Meshmallow remains loopback bridge only', () => {
  assert.equal(
    createLaunchRoute('app:gummy-worlds', 'http://127.0.0.1:5214'),
    'http://127.0.0.1:5214'
  );
  assert.throws(
    () => createLaunchRoute('app:gummy-worlds', 'https://meshmallow.example.com'),
    error => error.evidence.code === 'unsafe-local-bridge'
  );
});
