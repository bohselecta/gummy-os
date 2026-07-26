const REQUIRED_APPLICATION_FIELDS = Object.freeze([
  'id',
  'name',
  'canonicalRepository',
  'productPurpose',
  'launchMode',
  'webRoute',
  'nativeRoute',
  'capabilities',
  'acceptedInputs',
  'producedArtifacts',
  'protocolVersions',
  'locality',
  'connectionStatus',
  'releaseStatus',
  'unavailableReason'
]);

const REQUIRED_APPLICATION_IDS = Object.freeze([
  'app:videoboss',
  'app:imagehoss',
  'app:3d-bee',
  'app:gummy-rooms'
]);

const LAUNCH_MODES = new Set(['routed-web', 'installed-pwa', 'native-bridge', 'unavailable']);

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function assert(condition, message) {
  if (!condition) throw new Error(`Product registry invalid: ${message}`);
}

function validateProductMap(productMap) {
  assert(productMap?.schema === 'gummy.product-map/v1', 'unknown product-map schema');
  assert(productMap.controllingRule === 'Simplify the doorway. Do not flatten the house.', 'controlling rule changed');
  assert(Array.isArray(productMap.pillars), 'pillars must be an array');
  assert(productMap.pillars.length === 8, 'exactly eight protected pillars are required');
  const ids = productMap.pillars.map(pillar => pillar.id);
  assert(new Set(ids).size === ids.length, 'pillar IDs must be unique');
  for (const pillar of productMap.pillars) {
    assert(pillar.visibility === 'visible', `${pillar.id} must remain visible`);
    assert(Boolean(pillar.canonicalSource && pillar.productPurpose), `${pillar.id} requires source and purpose`);
  }
}

function validateApplicationRegistry(registry) {
  assert(registry?.schema === 'gummy.application-registry/v1', 'unknown application-registry schema');
  assert(Array.isArray(registry.applications), 'applications must be an array');
  const ids = registry.applications.map(application => application.id);
  assert(new Set(ids).size === ids.length, 'application IDs must be unique');
  assert(REQUIRED_APPLICATION_IDS.every(id => ids.includes(id)), 'a protected first-party application is missing');
  for (const application of registry.applications) {
    for (const field of REQUIRED_APPLICATION_FIELDS) {
      assert(Object.hasOwn(application, field), `${application.id || 'application'} is missing ${field}`);
    }
    assert(LAUNCH_MODES.has(application.launchMode), `${application.id} has an unsupported launch mode`);
    assert(application.canonicalRepository.startsWith('bohselecta/'), `${application.id} must name its canonical repository`);
    assert(application.capabilities.length > 0, `${application.id} must advertise capabilities`);
    assert(application.producedArtifacts.length > 0, `${application.id} must advertise produced artifacts`);
    assert(application.protocolVersions.includes('gummy.app-handoff/v1'), `${application.id} must support the Gummy handoff wrapper`);
    if (application.launchMode === 'routed-web') {
      const route = new URL(application.webRoute);
      assert(route.protocol === 'https:', `${application.id} routed web launch must use HTTPS`);
    }
    if (application.launchMode === 'native-bridge') {
      assert(Boolean(application.nativeRoute), `${application.id} native launch requires a capability route`);
      assert(Boolean(application.unavailableReason), `${application.id} must explain the disconnected state`);
    }
    if (application.launchMode === 'unavailable') {
      assert(Boolean(application.unavailableReason), `${application.id} must explain why launch is unavailable`);
    }
  }
}

async function readJson(fetcher, path) {
  const response = await fetcher(path, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Product registry unavailable: ${path}`);
  return response.json();
}

export async function loadProductCatalog(fetcher = fetch) {
  const [productMap, applicationRegistry] = await Promise.all([
    readJson(fetcher, '/registry/product-map.json'),
    readJson(fetcher, '/registry/first-party-applications.json')
  ]);
  validateProductMap(productMap);
  validateApplicationRegistry(applicationRegistry);
  return deepFreeze({ productMap, applicationRegistry });
}

export function applicationLaunchState(application) {
  if (application.launchMode === 'routed-web' && application.connectionStatus === 'available') {
    return Object.freeze({
      available: true,
      label: `Open ${application.name}`,
      route: application.webRoute,
      mode: 'routed-web'
    });
  }
  return Object.freeze({
    available: false,
    label: application.launchMode === 'native-bridge' ? 'Local capability required' : 'Unavailable',
    route: null,
    mode: application.launchMode,
    reason: application.unavailableReason || 'The required runtime is not connected.'
  });
}

export { REQUIRED_APPLICATION_FIELDS, REQUIRED_APPLICATION_IDS };
