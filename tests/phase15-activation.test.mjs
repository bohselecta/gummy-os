import assert from 'node:assert/strict';
import test from 'node:test';
import { availableCapabilities, placeCoreState } from '../src/core/place-activation.js';

function descriptor(overrides = {}) {
  return {
    schema: 'gummy.place-descriptor/v2',
    id: 'app:gummy-wardrobe',
    name: 'Wardrobe',
    featureFlag: true,
    releaseTruth: 'Local Wardrobe core is available; camera classification needs setup.',
    coreAvailability: 'available',
    coreCapabilities: ['wardrobe.read-owned', 'outfit.compose'],
    capabilityStates: [
      {
        id: 'wardrobe.read-owned',
        availability: 'available'
      },
      {
        id: 'outfit.compose',
        availability: 'available'
      },
      {
        id: 'item.capture-camera',
        availability: 'mobile-companion-required'
      }
    ],
    ...overrides
  };
}

test('v2 Place availability uses working core capabilities, not the hardest dependency', () => {
  const state = placeCoreState(descriptor());
  assert.equal(state.available, true);
  assert.equal(state.workingCapabilities, 2);
  assert.equal(state.advancedSetupCount, 1);
  assert.deepEqual(availableCapabilities(descriptor()).map(item => item.id), ['wardrobe.read-owned', 'outfit.compose']);
});

test('an unavailable advanced capability does not stage a useful Place', () => {
  const state = placeCoreState(descriptor({
    capabilityStates: [
      { id: 'wardrobe.read-owned', availability: 'available' },
      { id: 'outfit.compose', availability: 'approval-required' },
      { id: 'item.capture-camera', availability: 'mobile-companion-required' }
    ]
  }));
  assert.equal(state.available, true);
  assert.equal(state.usableCoreCapabilities, 2);
});

test('available core with no usable core capability is rejected', () => {
  assert.throws(() => placeCoreState(descriptor({
    capabilityStates: [
      { id: 'wardrobe.read-owned', availability: 'mobile-companion-required' },
      { id: 'outfit.compose', availability: 'remote-service-required' }
    ]
  })), error => error.evidence.code === 'empty-available-core');
});

test('v1 Places retain their prior whole-Place behavior during migration', () => {
  assert.equal(placeCoreState({
    schema: 'gummy.place-descriptor/v1',
    id: 'app:videoboss',
    featureFlag: true,
    activationState: 'available',
    connectionState: 'connected',
    capabilityScopes: ['production.plan'],
    releaseTruth: 'Planning is available.'
  }).available, true);
});
