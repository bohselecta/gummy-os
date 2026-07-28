import { assertAllowlistedRoute, PlaceSystemError } from '../core/place-system.js';

export const STANDALONE_PLACE_ADAPTERS = Object.freeze({
  'app:gummy-house': Object.freeze({
    product: 'HomeWright',
    repository: 'bohselecta/homewright',
    routeKind: 'web',
    handoffPackage: 'gummy.house-commit/v1',
    limitations: Object.freeze([
      'Gummy owns the scoped projection; HomeWright remains the Home Graph authority.',
      'The route is not considered connected until the allowlisted deployment is verified.'
    ])
  }),
  'app:gummy-radio': Object.freeze({
    product: 'AfterCast',
    repository: 'bohselecta/talkprint-studio',
    publicName: 'AfterCast',
    routeKind: 'web',
    handoffPackage: 'gummy.source-package/v1',
    limitations: Object.freeze([
      'Gummy passes scoped packages only.',
      'AfterCast remains responsible for source boundaries, approvals, and episode state.'
    ])
  }),
  'app:gummy-worlds': Object.freeze({
    product: 'Meshmallow',
    repository: 'bohselecta/3d-bee',
    routeKind: 'local-bridge',
    handoffPackage: 'gummy.world-plan/v1',
    limitations: Object.freeze([
      'No arbitrary code crosses the boundary.',
      'Only validated World Plans may enter the Meshmallow supervisor.'
    ])
  }),
  'app:gummy-channels': Object.freeze({
    product: 'Gummy Channels',
    repository: 'bohselecta/vidfamtv',
    routeKind: 'android',
    handoffPackage: 'gummy.channel-premiere/v1',
    limitations: Object.freeze([
      'Creator identity does not automatically become an Actor.',
      'Publishing remains a separately approved service action.'
    ])
  })
});

export function standaloneAdapter(placeId) {
  const adapter = STANDALONE_PLACE_ADAPTERS[placeId];
  if (!adapter) {
    throw new PlaceSystemError('adapter-missing', `No standalone adapter is registered for ${placeId}.`);
  }
  return adapter;
}

export function createLaunchRoute(placeId, route, allowedOrigins = []) {
  const adapter = standaloneAdapter(placeId);
  if (adapter.routeKind === 'local-bridge') {
    if (!route?.startsWith('http://127.0.0.1:') && !route?.startsWith('http://localhost:')) {
      throw new PlaceSystemError('unsafe-local-bridge', 'Local bridge routes must remain loopback only.');
    }
    return route;
  }
  return assertAllowlistedRoute(route, allowedOrigins);
}
