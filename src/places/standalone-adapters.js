import { assertAllowlistedRoute, PlaceSystemError } from '../core/place-system.js';

export const STANDALONE_PLACE_ADAPTERS = Object.freeze({
  'app:gummy-house': Object.freeze({
    product: 'HomeWright',
    repository: 'bohselecta/homewright',
    routeKind: 'web',
    route: 'https://homewright.vercel.app/',
    allowedOrigins: Object.freeze(['https://homewright.vercel.app']),
    acknowledgement: 'homewright.gummy-ack/v1',
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
    route: 'https://www.getaftercast.com/',
    allowedOrigins: Object.freeze(['https://www.getaftercast.com']),
    acknowledgement: 'aftercast.gummy-ack/v1',
    handoffPackage: 'gummy.source-package/v1',
    limitations: Object.freeze([
      'Gummy passes scoped packages only.',
      'AfterCast remains responsible for source boundaries, approvals, and episode state.'
    ])
  }),
  'app:gummy-worlds': Object.freeze({
    product: 'VideoWorlds',
    repository: 'bohselecta/videoworlds3',
    supportingRepository: 'bohselecta/3d-bee',
    routeKind: 'web',
    route: 'https://videoworldsnet.vercel.app/create',
    allowedOrigins: Object.freeze(['https://videoworldsnet.vercel.app']),
    acknowledgement: 'videoworlds.gummy-ack/v1',
    handoffPackage: 'gummy.world-plan/v1',
    limitations: Object.freeze([
      'No arbitrary code crosses the boundary.',
      'VideoWorlds accepts the bounded Sit plan; authenticated construction remains a separate Meshmallow boundary.'
    ])
  }),
  'app:gummy-channels': Object.freeze({
    product: 'Gummy Channels',
    repository: 'bohselecta/vidfamtv',
    routeKind: 'android',
    route: 'gummy-channels://open',
    webFallback: 'https://www.mygum.my/places/channels',
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

export function createStandaloneHandoff(placeId, packageValue, {
  messageId = `handoff:${crypto.randomUUID()}`,
  sentAt = new Date().toISOString()
} = {}) {
  const adapter = standaloneAdapter(placeId);
  if (!packageValue || packageValue.schema !== adapter.handoffPackage) {
    throw new PlaceSystemError(
      'handoff-package-invalid',
      `${adapter.product} requires an exact ${adapter.handoffPackage} package.`
    );
  }
  return Object.freeze({
    schema: 'gummy.place-standalone-handoff/v1',
    messageId,
    placeId,
    package: structuredClone(packageValue),
    sentAt
  });
}

export function openStandaloneHandoff(placeId, packageValue, {
  browser = window,
  timeoutMs = 8000
} = {}) {
  const adapter = standaloneAdapter(placeId);
  if (adapter.routeKind !== 'web') {
    throw new PlaceSystemError('web-handoff-unavailable', `${adapter.product} does not use a web handoff.`);
  }
  const route = createLaunchRoute(placeId, adapter.route, adapter.allowedOrigins);
  const targetOrigin = new URL(route).origin;
  const envelope = createStandaloneHandoff(placeId, packageValue);
  const target = browser.open(route, '_blank');
  if (!target) {
    throw new PlaceSystemError('popup-blocked', `Allow popups to open ${adapter.product}.`);
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      browser.clearInterval(repeater);
      browser.clearTimeout(timer);
      browser.removeEventListener('message', receive);
      callback(value);
    };
    const receive = event => {
      if (
        event.origin !== targetOrigin ||
        event.source !== target ||
        event.data?.schema !== adapter.acknowledgement ||
        event.data?.messageId !== envelope.messageId ||
        event.data?.placeId !== placeId
      ) return;
      finish(resolve, structuredClone(event.data));
    };
    browser.addEventListener('message', receive);
    const send = () => target.postMessage(envelope, targetOrigin);
    const repeater = browser.setInterval(send, 500);
    const timer = browser.setTimeout(() => {
      finish(reject, new PlaceSystemError(
        'handoff-timeout',
        `${adapter.product} opened, but its exact import acknowledgement did not return. Download and import the package manually.`
      ));
    }, timeoutMs);
    send();
  });
}
