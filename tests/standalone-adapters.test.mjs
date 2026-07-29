import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createLaunchRoute,
  createStandaloneHandoff,
  standaloneAdapter
} from '../src/places/standalone-adapters.js';

test('canonical standalone products remain separate authorities', () => {
  assert.equal(standaloneAdapter('app:gummy-house').repository, 'bohselecta/homewright');
  assert.equal(standaloneAdapter('app:gummy-radio').publicName, 'AfterCast');
  assert.equal(standaloneAdapter('app:gummy-worlds').repository, 'bohselecta/videoworlds3');
  assert.equal(standaloneAdapter('app:gummy-worlds').supportingRepository, 'bohselecta/3d-bee');
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

test('VideoWorlds uses its exact production origin while Meshmallow stays separate', () => {
  assert.equal(
    createLaunchRoute(
      'app:gummy-worlds',
      'https://videoworldsnet.vercel.app/create',
      ['https://videoworldsnet.vercel.app']
    ),
    'https://videoworldsnet.vercel.app/create'
  );
  assert.throws(
    () => createLaunchRoute(
      'app:gummy-worlds',
      'https://meshmallow.example.com',
      ['https://videoworldsnet.vercel.app']
    ),
    error => error.evidence.code === 'route-not-allowlisted'
  );
});

test('handoff envelope binds exact Place and package schemas', () => {
  const packageValue = {
    schema: 'gummy.house-commit/v1',
    intentNote: 'Keep the reading nook quiet',
    consequenceNote: 'Preserve the clear route',
    approvedBy: 'actor:hayden'
  };
  const envelope = createStandaloneHandoff('app:gummy-house', packageValue, {
    messageId: 'handoff:test',
    sentAt: '2026-07-28T00:00:00.000Z'
  });
  assert.equal(envelope.schema, 'gummy.place-standalone-handoff/v1');
  assert.equal(envelope.placeId, 'app:gummy-house');
  assert.equal(envelope.package.schema, 'gummy.house-commit/v1');
  assert.throws(
    () => createStandaloneHandoff('app:gummy-radio', packageValue),
    error => error.evidence.code === 'handoff-package-invalid'
  );
});
