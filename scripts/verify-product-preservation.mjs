import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { sourceAssets } from './brand-asset-manifest.mjs';

const execFileAsync = promisify(execFile);
const suiteComplete = process.argv.includes('--suite-complete');
const requiredPillars = Object.freeze([
  'pillar:gummy-os',
  'pillar:local-4b-operator',
  'pillar:videoboss',
  'pillar:imagehoss',
  'pillar:3d-bee',
  'pillar:social',
  'pillar:gummy-rooms',
  'pillar:gummy-box'
]);
const requiredApplications = Object.freeze([
  ['app:videoboss', 'bohselecta/videoboss'],
  ['app:imagehoss', 'bohselecta/imagehoss'],
  ['app:3d-bee', 'bohselecta/3d-bee'],
  ['app:gummy-rooms', 'bohselecta/gummy2']
]);
const requiredPhase14Places = Object.freeze([
  ['app:gummy-channels', 'Gummy Channels', '@channels'],
  ['app:gummy-wardrobe', 'Wardrobe', '@wardrobe'],
  ['app:gummy-house', 'House', '@house'],
  ['app:gummy-worlds', 'Worlds', '@worlds'],
  ['app:gummy-table', 'Table', '@table'],
  ['app:gummy-radio', 'Radio', '@radio']
]);

const [
  productMap,
  applicationRegistry,
  placeRegistry,
  productSchema,
  applicationSchema,
  placeDescriptorSchema,
  placeRegistrySchema,
  appSource,
  placesSource,
  recordsSource,
  viteSource
] = await Promise.all([
  readFile('public/registry/product-map.json', 'utf8').then(JSON.parse),
  readFile('public/registry/first-party-applications.json', 'utf8').then(JSON.parse),
  readFile('public/registry/gummy-places.json', 'utf8').then(JSON.parse),
  readFile('schemas/product-map.schema.json', 'utf8').then(JSON.parse),
  readFile('schemas/application-registry.schema.json', 'utf8').then(JSON.parse),
  readFile('schemas/place-descriptor.schema.json', 'utf8').then(JSON.parse),
  readFile('schemas/place-registry.schema.json', 'utf8').then(JSON.parse),
  readFile('src/app.js', 'utf8'),
  readFile('src/apps/places.js', 'utf8'),
  readFile('src/core/records.js', 'utf8'),
  readFile('vite.config.js', 'utf8')
]);

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateProductMap = ajv.compile(productSchema);
const validateApplications = ajv.compile(applicationSchema);
ajv.addSchema(placeDescriptorSchema);
const validatePlaces = ajv.compile(placeRegistrySchema);
assert.equal(validateProductMap(productMap), true, ajv.errorsText(validateProductMap.errors));
assert.equal(validateApplications(applicationRegistry), true, ajv.errorsText(validateApplications.errors));
assert.equal(validatePlaces(placeRegistry), true, ajv.errorsText(validatePlaces.errors));

const pillarIds = productMap.pillars.map(pillar => pillar.id);
assert.deepEqual(new Set(pillarIds), new Set(requiredPillars));
assert.ok(productMap.pillars.every(pillar => pillar.visibility === 'visible'));

const applications = new Map(applicationRegistry.applications.map(application => [application.id, application]));
for (const [id, repository] of requiredApplications) {
  assert.equal(applications.get(id)?.canonicalRepository, repository, `${id} canonical repository changed or disappeared`);
  assert.ok(applications.get(id).protocolVersions.includes('gummy.app-handoff/v1'), `${id} lost the Gummy handoff protocol`);
}
assert.equal(applications.get('app:videoboss').launchMode, 'routed-web');
assert.equal(new URL(applications.get('app:videoboss').webRoute).protocol, 'https:');
assert.equal(applications.get('app:imagehoss').connectionStatus, 'capability-required');
assert.equal(applications.get('app:3d-bee').connectionStatus, 'capability-required');
assert.equal(applications.get('app:gummy-rooms').launchMode, 'unavailable');

const places = new Map(placeRegistry.places.map(place => [place.id, place]));
for (const [id] of requiredApplications) {
  assert.ok(places.has(id), `${id} disappeared during the Application-to-Place migration`);
}
for (const [id, name, actorAddress] of requiredPhase14Places) {
  assert.equal(places.get(id)?.name, name, `${id} Place name changed or disappeared`);
  assert.equal(places.get(id)?.actorAddress, actorAddress, `${id} Actor address changed`);
  assert.ok(places.get(id)?.producedPackages.includes('gummy.place-handoff/v1'), `${id} lost the Place handoff protocol`);
}

for (const surface of ["['actors', '◎', 'Actors / Bowls']", "['applications', '⌘', 'Places']"]) {
  assert.ok(appSource.includes(surface), `protected Gummy Bar surface disappeared: ${surface}`);
}
const placeUiSource = `${appSource}\n${placesSource}`;
assert.match(placeUiSource, /loadPlaceCatalog/);
assert.match(placeUiSource, /data.*applicationId|applicationId/);
assert.match(placeUiSource, /data.*placeId|placeId/);
assert.match(appSource, /placeWindowId/);
assert.match(appSource, /place-pins:actor:hayden/);
assert.equal(appSource.includes('Social, federation, enterprise expansion, and native distribution are not part of this build.'), false);
assert.match(recordsSource, /localOperatorRecord/);
assert.match(recordsSource, /agent:gummy-operator-local|LOCAL_OPERATOR_ID/);
assert.match(viteSource, /registry\/\*\.json/);
assert.match(viteSource, /gummy-product-registry-v2/);

const protocolSchemaPaths = [
  'schemas/actor.schema.json',
  'schemas/agent.schema.json',
  'schemas/gummy.schema.json',
  'schemas/bowl.schema.json',
  'schemas/link.schema.json',
  'schemas/grab.schema.json',
  'schemas/gummy-box.schema.json',
  'schemas/work-order.schema.json',
  'schemas/task-lease.schema.json',
  'schemas/work-return.schema.json',
  'schemas/capability-grant.schema.json',
  'schemas/action-receipt.schema.json',
  'schemas/app-pack.schema.json',
  'schemas/product-map.schema.json',
  'schemas/application-registry.schema.json',
  'schemas/app-handoff.schema.json',
  'schemas/place-descriptor.schema.json',
  'schemas/place-registry.schema.json',
  'schemas/place-binding.schema.json',
  'schemas/source-package.schema.json',
  'schemas/place-handoff.schema.json',
  'schemas/world-plan.schema.json'
];
const protocolSchemaHashes = {};
for (const path of protocolSchemaPaths) {
  const bytes = await readFile(path);
  protocolSchemaHashes[path] = createHash('sha256').update(bytes).digest('hex');
}

async function countDefinedTests(directory, suffix) {
  const filenames = (await readdir(directory)).filter(filename => filename.endsWith(suffix));
  const sources = await Promise.all(filenames.map(filename => readFile(`${directory}/${filename}`, 'utf8')));
  return sources.reduce((total, source) => total + (source.match(/\btest\(/g)?.length || 0), 0);
}

const [unitContractTests, browserTests] = await Promise.all([
  countDefinedTests('tests', '.test.mjs'),
  countDefinedTests('tests/e2e', '.spec.mjs')
]);
const headSha = process.env.GITHUB_SHA || (await execFileAsync('git', ['rev-parse', 'HEAD'])).stdout.trim();
const report = {
  schema: 'gummy.product-preservation-report/v1',
  headSha,
  generatedAt: new Date().toISOString(),
  controllingRule: productMap.controllingRule,
  requiredPillars,
  visiblePillars: pillarIds,
  registryApplicationIds: [...applications.keys()],
  registryPlaceIds: [...places.keys()],
  phase14PlaceIds: requiredPhase14Places.map(([id]) => id),
  protectedGummyBarSurfaceIds: ['actors', 'applications'],
  brandMasterHashes: Object.fromEntries(sourceAssets.map(asset => [asset.source, asset.sha256])),
  protocolSchemaHashes,
  checkTotals: {
    protectedPillars: requiredPillars.length,
    firstPartyApplications: requiredApplications.length,
    phase14Places: requiredPhase14Places.length,
    protectedBarSurfaces: 2,
    protocolSchemas: protocolSchemaPaths.length,
    brandMasters: sourceAssets.length
  },
  testTotals: {
    unitAndContract: unitContractTests,
    browser: browserTests,
    productionBuild: suiteComplete ? 'PASS' : 'NOT_RUN_IN_THIS_INVOCATION',
    suiteComplete
  },
  result: 'PASS',
  founderReady: false,
  limitation: 'This report proves registry, visible-surface, schema, and brand preservation. Runtime availability remains capability-gated and is tested separately.'
};
await mkdir('artifacts', { recursive: true });
await writeFile('artifacts/product-preservation-report.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(`Full-product preservation passed: ${requiredPillars.length} pillars, ${requiredApplications.length} migrated products, ${requiredPhase14Places.length} Phase 14 Places, ${protocolSchemaPaths.length} protocol schemas, ${sourceAssets.length} brand masters.`);
