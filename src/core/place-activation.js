import { PlaceSystemError } from './place-system.js';

export const CAPABILITY_AVAILABILITY = Object.freeze([
  'available',
  'local-runtime-required',
  'remote-service-required',
  'mobile-companion-required',
  'approval-required',
  'blocked'
]);

const CAPABILITY_SET = new Set(CAPABILITY_AVAILABILITY);
const USABLE_CAPABILITY_STATES = new Set(['available', 'approval-required']);

function clone(value) {
  return structuredClone(value);
}

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

export function capabilityState(place, capabilityId) {
  const capability = place?.capabilityStates?.find(item => item.id === capabilityId) || null;
  return capability ? freeze(clone(capability)) : null;
}

export function availableCapabilities(place) {
  if (place?.schema !== 'gummy.place-descriptor/v2') {
    return freeze((place?.activationState === 'available' && place?.connectionState === 'connected')
      ? (place.capabilityScopes || []).map(id => ({ id, availability: 'available' }))
      : []);
  }
  return freeze(place.capabilityStates
    .filter(capability => USABLE_CAPABILITY_STATES.has(capability.availability))
    .map(clone));
}

export function placeCoreState(place) {
  if (!place?.featureFlag) {
    return freeze({ available: false, state: 'blocked', label: 'Blocked', reason: 'Place feature is disabled.', workingCapabilities: 0 });
  }
  if (place.schema !== 'gummy.place-descriptor/v2') {
    const available = place.activationState === 'available' && place.connectionState === 'connected';
    return freeze({
      available,
      state: available ? 'available' : 'needs-setup',
      label: available ? 'Available' : 'Needs setup',
      reason: available ? null : place.releaseTruth,
      workingCapabilities: available ? (place.capabilityScopes || []).length : 0
    });
  }
  if (!['available', 'needs-setup', 'blocked'].includes(place.coreAvailability)) {
    throw new PlaceSystemError('invalid-core-availability', `${place.id} has an invalid coreAvailability.`);
  }
  if (!Array.isArray(place.coreCapabilities) || place.coreCapabilities.length === 0) {
    throw new PlaceSystemError('missing-core-capabilities', `${place.id} requires at least one core capability.`);
  }
  if (!Array.isArray(place.capabilityStates) || place.capabilityStates.length === 0) {
    throw new PlaceSystemError('missing-capability-states', `${place.id} requires capabilityStates.`);
  }
  const ids = new Set();
  for (const capability of place.capabilityStates) {
    if (!CAPABILITY_SET.has(capability.availability)) {
      throw new PlaceSystemError('invalid-capability-availability', `${capability.id} has an unsupported availability.`);
    }
    if (ids.has(capability.id)) {
      throw new PlaceSystemError('duplicate-capability', `${place.id} repeats capability ${capability.id}.`);
    }
    ids.add(capability.id);
  }
  for (const capabilityId of place.coreCapabilities) {
    if (!ids.has(capabilityId)) {
      throw new PlaceSystemError('missing-core-capability-state', `${place.id} is missing state for core capability ${capabilityId}.`);
    }
  }
  const working = availableCapabilities(place);
  const usableCoreCount = working.filter(capability => place.coreCapabilities.includes(capability.id)).length;
  const available = place.coreAvailability === 'available' && usableCoreCount > 0;
  if (place.coreAvailability === 'available' && usableCoreCount === 0) {
    throw new PlaceSystemError('empty-available-core', `${place.id} cannot be available with no usable core capability.`);
  }
  const labels = { available: 'Available', 'needs-setup': 'Needs setup', blocked: 'Blocked' };
  return freeze({
    available,
    state: place.coreAvailability,
    label: labels[place.coreAvailability],
    reason: available ? null : place.releaseTruth,
    workingCapabilities: working.length,
    usableCoreCapabilities: usableCoreCount,
    advancedSetupCount: place.capabilityStates.filter(capability => !USABLE_CAPABILITY_STATES.has(capability.availability)).length
  });
}

export function assertPlaceCoreAvailable(place) {
  const state = placeCoreState(place);
  if (!state.available) {
    throw new PlaceSystemError('place-core-unavailable', state.reason || `${place.id} is not available.`, { placeId: place.id, state });
  }
  return state;
}
