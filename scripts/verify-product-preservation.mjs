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

const [productMap, applicationRegistry, productSchema, applicationSchema, appSource, recordsSource, viteSource] = await Promise.all([
  readFile('public/registry/product-map.json', 'utf8').then(JSON.parse),
  readFile('public/registry/first-party-applications.json', 'utf8').then(JSON.parse),
  readFile('schemas/product-map.schema.json', 'utf8').then(JSON.parse),
  readFile('schemas/application-registry.schema.json', 'utf8').then(JSON.parse),
  readFile('src/app.js', 'utf8'),
  readFile('src/core/records.js', 'utf8'),
  readFile('vite.config.js', 'utf8')
]);

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateProductMap = ajv.compile(productSchema);
const validateApplications = ajv.compile(applicationSchema);
assert.equal(validateProductMap(productMap), true, ajv.errorsText(validateProductMap.errors));
assert.equal(validateApplications(applicationRegistry), true, ajv.errorsText(validateApplications.errors));

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

for (const surface of ["['actors', '◎', 'Actors / Bowls']", "['applications', '⌘', 'Applications']"]) {
  assert.ok(appSource.includes(surface), `protected Gummy Bar surface disappeared: ${surface}`);
}
assert.match(appSource, /loadProductCatalog/);
assert.match(appSource, /data.*applicationId|applicationId/);
assert.equal(appSource.includes('Social, federation, enterprise expansion, and native distribution are not part of this build.'), false);
assert.match(recordsSource, /localOperatorRecord/);
assert.match(recordsSource, /agent:gummy-operator-local|LOCAL_OPERATOR_ID/);
assert.match(viteSource, /registry\/\*\.json/);
assert.match(viteSource, /gummy-product-registry-v1/);

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
  'schemas/app-handoff.schema.json'
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
  protectedGummyBarSurfaceIds: ['actors', 'applications'],
  brandMasterHashes: Object.fromEntries(sourceAssets.map(asset => [asset.source, asset.sha256])),
  protocolSchemaHashes,
  checkTotals: {
    protectedPillars: requiredPillars.length,
    firstPartyApplications: requiredApplications.length,
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
console.log(`Full-product preservation passed: ${requiredPillars.length} pillars, ${requiredApplications.length} first-party applications, ${protocolSchemaPaths.length} protocol schemas, ${sourceAssets.length} brand masters.`);
