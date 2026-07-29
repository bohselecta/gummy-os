import { access, readFile } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const required = [
  '.env.example',
  'index.html',
  'src/app.js',
  'src/styles.css',
  'src/core/state.js',
  'src/core/production-runtime.js',
  'src/core/production-repository.js',
  'src/core/capability-broker.js',
  'src/core/product-registry.js',
  'src/core/place-system.js',
  'src/core/place-ui-contracts.js',
  'src/core/living-collaboration.js',
  'src/places/place-doctrines.js',
  'src/integrations/app-handoff.js',
  'src/integrations/local-operator.js',
  'src/integrations/gummy-rooms.js',
  'src/apps/snack-graph.js',
  'src/apps/enterprise.js',
  'src/apps/production.js',
  'src/apps/actor-surface.js',
  'src/apps/master-control.js',
  'src/apps/collaboration.js',
  'src/apps/social-instance-windows.js',
  'src/apps/places.js',
  'src/brand/gummy-utility-tiles.js',
  'src/production.css',
  'docs/BRAND_SYSTEM.md',
  'docs/BRAND_ASSET_CATALOG.md',
  'docs/GLOPPER_NAMING.md',
  'docs/ACTOR_AGENT_MASTER_CONTROL.md',
  'docs/PLATFORM_PLAYGROUND_SECURITY.md',
  'docs/GUMMY_BOX_WORK_ORDERS.md',
  'docs/AUTOMATED_ACCEPTANCE.md',
  'docs/VOCABULARY.md',
  'docs/ARCHITECTURE.md',
  'docs/PROTOCOL.md',
  'docs/SECURITY_MODEL.md',
  'docs/SOCIAL_LAYER.md',
  'docs/SOCIAL_GRAPH.md',
  'docs/ENTERPRISE_FRAMEWORK.md',
  'docs/ROADMAP.md',
  'docs/FULL_PRODUCT_PRESERVATION_DIRECTIVE.md',
  'docs/FULL_PRODUCT_GAP_AUDIT.md',
  'docs/MANAGED_GUMMY_BOX_LANE.md',
  'docs/GUMMY_UTILITY_TILE_SYSTEM.md',
  'docs/IMAGEHOSS_PRODUCTION_CONTRACT_RECONCILIATION.md',
  'docs/PRODUCTION_ACTOR_RUNTIME.md',
  'docs/ACTOR_FIRST_PRODUCTION_MODEL.md',
  'docs/architecture/ACTOR_IDENTITY_VS_RUNTIME_IDENTITY_2026-07-29.md',
  'docs/architecture/OPERATIONAL_MEMORY_VS_CANONICAL_STATE_2026-07-29.md',
  'docs/providers/GOOGLE_AGENT_PLATFORM_PROFILE_2026-07-29.md',
  'docs/security/PHASE17A_RUNTIME_IDENTITY_MEMORY_THREAT_MODEL_2026-07-29.md',
  'plans/review/2026-07-29-phase17a-runtime-identity-memory-migration.md',
  'evidence/phase17a-runtime-identity-memory-rollback.md',
  'evidence/phase17a-foundation-acceptance-matrix.md',
  'fixtures/runtime-conformance/google-agent-platform-profile-2026-07-29.json',
  'fixtures/runtime-conformance/phase17a-runtime-identity-memory-foundation.json',
  'plans/active/2026-07-27-production-runtime-reconciliation-and-utility-tiles.md',
  'design/source/gummy-utility-tiles-legacy/manifest.json',
  'design/source/gummy-utility-tiles-legacy/SOURCE_ARCHIVE.md',
  'public/brand/gummy/utility-tiles/manifest.json',
  'scripts/generate-utility-tiles.mjs',
  'scripts/check-utility-tiles.mjs',
  'evidence/consolidation-feature-source-map.json',
  'public/registry/product-map.json',
  'public/registry/first-party-applications.json',
  'public/registry/gummy-places.json',
  'docs/PLACE_SYSTEM.md',
  'plans/active/2026-07-28-phase-14-gummy-places.md',
  'evidence/phase14-source-resolution.json',
  'evidence/phase14-place-compatibility-map.json',
  'examples/glopper-web.agent.json',
  'examples/hayden.gummy-box.json',
  'examples/project-brief.work-order.json',
  'examples/project-brief.task-lease.json',
  'examples/project-brief.work-return.json',
  'examples/standalone-acceptance.return.json',
  'plans/active/2026-07-25-personal-gummy-cursor-work-order.md',
  'plans/active/2026-07-25-gummy-box-cursor-addendum.md',
  'plans/active/2026-07-25-brand-system-cursor-addendum.md',
  'plans/active/2026-07-25-production-brand-assets-cursor-addendum.md',
  'plans/active/2026-07-25-automated-acceptance-cursor-addendum.md'
];

for (const path of required) await access(path);

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
if (pkg.name !== 'gummy-os') throw new Error('package name must remain gummy-os');

const environmentExample = await readFile('.env.example', 'utf8');
for (const name of [
  'HOST',
  'PORT',
  'GUMMY_PUBLIC_ORIGIN',
  'GUMMY_SESSION_SECRET',
  'GUMMY_TEST_MODE',
  'OPENAI_API_KEY',
  'OPENAI_MODEL',
  'OPENAI_INPUT_USD_PER_MILLION',
  'OPENAI_OUTPUT_USD_PER_MILLION',
  'OPENAI_PRICE_TABLE_VERSION',
  'GITHUB_APP_ID',
  'GITHUB_APP_PRIVATE_KEY',
  'GITHUB_APP_SLUG',
  'GITHUB_INSTALLATION_ID',
  'GITHUB_TEST_REPOSITORY'
]) {
  if (!environmentExample.match(new RegExp(`^${name}=`, 'm'))) {
    throw new Error(`.env.example is missing current server setting: ${name}`);
  }
}
for (const staleName of [
  'GUMMY_MODEL_BROKER_URL',
  'GUMMY_MODEL_PROVIDER',
  'GUMMY_DEPLOYMENT_MODE'
]) {
  if (environmentExample.match(new RegExp(`^${staleName}=`, 'm'))) {
    throw new Error(`.env.example still advertises unused setting: ${staleName}`);
  }
}

const readme = await readFile('README.md', 'utf8');
for (const releaseFact of [
  'https://gummy-os-six.vercel.app',
  'bohselecta/mygummy/blob/main/TECHNOLOGY_POSITION.md',
  'b544485e14d3f708651f24a8c78dab5e7760f03c',
  '855172b66e3e854491d7284905e8cd33616be339'
]) {
  if (!readme.includes(releaseFact)) {
    throw new Error(`README is missing release provenance: ${releaseFact}`);
  }
}

const schemas = [
  'schemas/human.schema.json',
  'schemas/actor.schema.json',
  'schemas/agent.schema.json',
  'schemas/mold.schema.json',
  'schemas/master-control.schema.json',
  'schemas/gummy-box.schema.json',
  'schemas/work-order.schema.json',
  'schemas/task-lease.schema.json',
  'schemas/work-return.schema.json',
  'schemas/gummy.schema.json',
  'schemas/bowl.schema.json',
  'schemas/link.schema.json',
  'schemas/grab.schema.json',
  'schemas/app-pack.schema.json',
  'schemas/product-map.schema.json',
  'schemas/application-registry.schema.json',
  'schemas/app-handoff.schema.json',
  'schemas/place-descriptor.schema.json',
  'schemas/place-registry.schema.json',
  'schemas/place-binding.schema.json',
  'schemas/source-package.schema.json',
  'schemas/place-handoff.schema.json',
  'schemas/world-plan.schema.json',
  'schemas/capability-grant.schema.json',
  'schemas/action-receipt.schema.json',
  'schemas/organization.schema.json',
  'schemas/policy-pack.schema.json',
  'schemas/snack.schema.json',
  'schemas/graph-object.schema.json',
  'schemas/actor-app-descriptor.schema.json',
  'schemas/production.schema.json',
  'schemas/production-participant.schema.json',
  'schemas/production-actor-configuration.schema.json',
  'schemas/actor-plan.schema.json',
  'schemas/context-envelope.schema.json',
  'schemas/production-run.schema.json',
  'schemas/actor-update-proposal.schema.json',
  'schemas/drag-intent.schema.json',
  'schemas/actor-presence.schema.json',
  'schemas/social-instance.schema.json',
  'schemas/shared-vision.schema.json',
  'schemas/production-agreement.schema.json',
  'schemas/production-pool.schema.json',
  'schemas/contribution-ledger.schema.json',
  'schemas/production-formation.schema.json',
  'schemas/distribution-plan.schema.json',
  'schemas/command-center-view.schema.json',
  'schemas/actor-agent-runtime-binding.schema.json',
  'schemas/operational-memory.schema.json',
  'schemas/memory-derivation.schema.json',
  'schemas/memory-scope-policy.schema.json',
  'schemas/long-running-work-policy.schema.json',
  'schemas/provider-evidence-bundle.schema.json',
  'schemas/provider-profile-google-agent-platform.schema.json'
];

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const parsedSchemas = new Map();
for (const schema of schemas) {
  const parsed = JSON.parse(await readFile(schema, 'utf8'));
  if (!parsed.$id || !parsed.title) throw new Error(`${schema} is missing $id or title`);
  ajv.addSchema(parsed);
  parsedSchemas.set(schema, parsed);
}

const phase17aFixture = JSON.parse(
  await readFile(
    'fixtures/runtime-conformance/phase17a-runtime-identity-memory-foundation.json',
    'utf8'
  )
);
const googleAgentPlatformProfile = JSON.parse(
  await readFile(
    'fixtures/runtime-conformance/google-agent-platform-profile-2026-07-29.json',
    'utf8'
  )
);
const validatePhase17a = (schemaFile, value, label) => {
  const schema = parsedSchemas.get(schemaFile);
  const validate = ajv.getSchema(schema.$id);
  if (!validate(value)) {
    throw new Error(
      `${label} validation failed: ${ajv.errorsText(validate.errors)}`
    );
  }
};
for (const [index, binding] of phase17aFixture.runtimeBindings.entries()) {
  validatePhase17a(
    'schemas/actor-agent-runtime-binding.schema.json',
    binding,
    `Phase 17A runtime binding ${index + 1}`
  );
}
for (const [index, memory] of phase17aFixture.memories.entries()) {
  validatePhase17a(
    'schemas/operational-memory.schema.json',
    memory,
    `Phase 17A operational memory ${index + 1}`
  );
}
for (const [index, derivation] of phase17aFixture.memoryDerivations.entries()) {
  validatePhase17a(
    'schemas/memory-derivation.schema.json',
    derivation,
    `Phase 17A memory derivation ${index + 1}`
  );
}
for (const [index, policy] of phase17aFixture.memoryScopePolicies.entries()) {
  validatePhase17a(
    'schemas/memory-scope-policy.schema.json',
    policy,
    `Phase 17A memory scope policy ${index + 1}`
  );
}
validatePhase17a(
  'schemas/long-running-work-policy.schema.json',
  phase17aFixture.longRunningWorkPolicy,
  'Phase 17A long-running work policy'
);
validatePhase17a(
  'schemas/provider-evidence-bundle.schema.json',
  phase17aFixture.providerEvidenceBundle,
  'Phase 17A provider evidence bundle'
);
validatePhase17a(
  'schemas/provider-profile-google-agent-platform.schema.json',
  googleAgentPlatformProfile,
  'Phase 17A Google provider profile'
);

const placeRegistry = JSON.parse(await readFile('public/registry/gummy-places.json', 'utf8'));
const validatePlaceRegistry = ajv.getSchema('https://mygum.my/schemas/place-registry.schema.json');
if (!validatePlaceRegistry(placeRegistry)) {
  throw new Error(`Place registry validation failed: ${ajv.errorsText(validatePlaceRegistry.errors)}`);
}
for (const identity of [
  ['app:gummy-channels', 'Gummy Channels', '@channels'],
  ['app:gummy-wardrobe', 'Wardrobe', '@wardrobe'],
  ['app:gummy-house', 'House', '@house'],
  ['app:gummy-worlds', 'Worlds', '@worlds'],
  ['app:gummy-table', 'Table', '@table'],
  ['app:gummy-radio', 'Radio', '@radio']
]) {
  const place = placeRegistry.places.find(candidate => candidate.id === identity[0]);
  if (!place || place.name !== identity[1] || place.actorAddress !== identity[2]) {
    throw new Error(`Phase 14 Place identity changed: ${identity[0]}`);
  }
}

const naming = await readFile('docs/GLOPPER_NAMING.md', 'utf8');
for (const definition of [
  'Gummy OS       = the universal platform and WebOS',
  'Gummy Canvas   = the open working and creation surface',
  'Gummy Bar      = the persistent candy-store system bar',
  'Gummy          = the purple-dominant platform guide/personality',
  'Glopper        = the gummy-candy action companion and first-party Agent identity',
  'Gummy tells you where you are.',
  'Glopper helps you act.'
]) {
  if (!naming.includes(definition)) throw new Error(`Gummy/Glopper naming is missing: ${definition}`);
}

const brand = await readFile('docs/BRAND_SYSTEM.md', 'utf8');
for (const invariant of [
  'Night Gummy',
  'Day Gummy',
  'Purple tells you where you are. Gold tells you what you can do.',
  'Deep Indigo | `#4B187A`',
  'Gummy Violet | `#7C2FD0`',
  'Honey Gold | `#F2B544`',
  'Warm Cream | `#FFF1C7`',
  'Aubergine Black | `#100817`',
  'Gummy = purple-dominant.',
  'Glopper = gold-dominant.',
  'No theme marketplace.'
]) {
  if (!brand.includes(invariant)) throw new Error(`brand system is missing: ${invariant}`);
}

for (const forbidden of [
  'Teal Gummy is allowed',
  'Red Glopper is allowed',
  'Users may create custom Gummy themes'
]) {
  if (brand.includes(forbidden)) throw new Error(`brand system contains forbidden policy: ${forbidden}`);
}

const boxDoc = await readFile('docs/GUMMY_BOX_WORK_ORDERS.md', 'utf8');
for (const invariant of [
  'Gummy Box is the durable asynchronous handoff space',
  'A Work Order is a proposal, not a Grant.',
  'Frontier models write the instructions. Glopper owns the execution contract. The Human owns the Box and the authority.'
]) {
  if (!boxDoc.includes(invariant)) throw new Error(`Gummy Box doctrine is missing: ${invariant}`);
}

const protocol = await readFile('docs/PROTOCOL.md', 'utf8');
for (const definition of [
  'gummy.box/v0',
  'gummy.work-order/v0',
  'gummy.task-lease/v0',
  'gummy.work-return/v0',
  'A Work Order is not a Capability Grant.'
]) {
  if (!protocol.includes(definition)) throw new Error(`protocol is missing: ${definition}`);
}

const acceptance = await readFile('docs/AUTOMATED_ACCEPTANCE.md', 'utf8');
for (const rule of [
  'Hayden is not the test harness.',
  'No PASS without executable evidence.',
  'The computer tests the computer. Hayden builds the world.',
  'npm run test:acceptance',
  'Founder ready'
]) {
  if (!acceptance.includes(rule)) throw new Error(`automated acceptance mandate is missing: ${rule}`);
}

const workOrder = await readFile('plans/active/2026-07-25-personal-gummy-cursor-work-order.md', 'utf8');
for (const requirement of [
  'Work package A — Gummy Canvas and Gummy Bar',
  'Work package B — Glopper Panel',
  'agent:glopper-web',
  'Work package H — quarantine and burn proof',
  'Work package K — native integration preflight, last'
]) {
  if (!workOrder.includes(requirement)) throw new Error(`active work order is missing: ${requirement}`);
}

const boxAddendum = await readFile('plans/active/2026-07-25-gummy-box-cursor-addendum.md', 'utf8');
for (const requirement of [
  'Local only',
  'Private GitHub',
  'Google Drive',
  'Glopper Inbox',
  'Work Order is a proposal'
]) {
  if (!boxAddendum.includes(requirement)) throw new Error(`Gummy Box addendum is missing: ${requirement}`);
}

const brandAddendum = await readFile('plans/active/2026-07-25-brand-system-cursor-addendum.md', 'utf8');
for (const requirement of [
  'Night Gummy',
  'Day Gummy',
  '--gummy-deep-indigo: #4B187A;',
  '--gummy-violet: #7C2FD0;',
  '--gummy-honey-gold: #F2B544;',
  '--gummy-warm-cream: #FFF1C7;',
  '--gummy-aubergine-black: #100817;',
  'Work package 4 — assistant emphasis',
  'Work package 8 — accessibility'
]) {
  if (!brandAddendum.includes(requirement)) throw new Error(`brand addendum is missing: ${requirement}`);
}

const acceptanceAddendum = await readFile('plans/active/2026-07-25-automated-acceptance-cursor-addendum.md', 'utf8');
for (const requirement of [
  'No founder testing where automation can perform the same verification.',
  'Vite',
  'Playwright',
  'Gummy Acceptance Pack',
  'Founder-ready: YES/NO'
]) {
  if (!acceptanceAddendum.includes(requirement)) throw new Error(`automated acceptance addendum is missing: ${requirement}`);
}

const product = await readFile('docs/PRODUCT_SPEC.md', 'utf8');
for (const requirement of [
  'Exactly two expressions exist',
  'Gummy    purple-dominant, gold accent',
  'Glopper  gold-dominant, purple accent',
  'No color picker, downloadable theme, per-window accent selection, mascot recoloring, or third-party Gummy OS skin is permitted.'
]) {
  if (!product.includes(requirement)) throw new Error(`product spec is missing brand requirement: ${requirement}`);
}

const productionDoctrine = await readFile('docs/PRODUCTION_ACTOR_RUNTIME.md', 'utf8');
for (const requirement of [
  'Make Production',
  'ProductionActorConfiguration',
  'Context Envelope',
  'DragIntent',
  'Drag/drop never grants ambient authority or starts execution.'
]) {
  if (!productionDoctrine.includes(requirement)) throw new Error(`Production runtime doctrine is missing: ${requirement}`);
}

const utilityDoctrine = await readFile('docs/GUMMY_UTILITY_TILE_SYSTEM.md', 'utf8');
for (const requirement of [
  'gummy.utility.attach',
  'gummy.utility.agent',
  'gummy.utility.bowl',
  'gummy.utility.deliver',
  'gummy.utility.setup',
  'gummy.utility.vision',
  'gummy.utility.progress',
  'The tiles are presentation assets only.',
  'No new CSS hue token is introduced from a tile color.'
]) {
  if (!utilityDoctrine.includes(requirement)) throw new Error(`utility tile doctrine is missing: ${requirement}`);
}

const agent = JSON.parse(await readFile('examples/glopper-web.agent.json', 'utf8'));
if (agent.id !== 'agent:glopper-web' || agent.characterFamily !== 'Glopper') {
  throw new Error('canonical Glopper Web Agent example is invalid');
}

const human = JSON.parse(await readFile('examples/hayden.human.json', 'utf8'));
if (human.id !== 'human:hayden' || human.identityAssurance !== 'local-unverified') {
  throw new Error('canonical local Human example is invalid');
}

const box = JSON.parse(await readFile('examples/hayden.gummy-box.json', 'utf8'));
if (box.id !== 'box:hayden' || box.provider.type !== 'github') {
  throw new Error('canonical Gummy Box example is invalid');
}

const proposedWork = JSON.parse(await readFile('examples/project-brief.work-order.json', 'utf8'));
if (proposedWork.boxId !== 'box:hayden' || proposedWork.approval.required !== true) {
  throw new Error('canonical Work Order example is invalid');
}

const lease = JSON.parse(await readFile('examples/project-brief.task-lease.json', 'utf8'));
if (lease.agentId !== 'agent:glopper-web' || lease.mode !== 'exclusive') {
  throw new Error('canonical Glopper Task Lease example is invalid');
}

const returnedWork = JSON.parse(await readFile('examples/project-brief.work-return.json', 'utf8'));
if (returnedWork.workOrderId !== 'work-order:project-brief' || returnedWork.agentId !== 'agent:glopper-web') {
  throw new Error('canonical Work Return example is invalid');
}

const acceptanceReturn = JSON.parse(await readFile('examples/standalone-acceptance.return.json', 'utf8'));
if (acceptanceReturn.extensions.sanitized !== true || acceptanceReturn.checks.length < 5) {
  throw new Error('sanitized standalone acceptance Return is incomplete');
}

for (const [schemaPath, record] of [
  ['schemas/human.schema.json', human],
  ['schemas/agent.schema.json', agent],
  ['schemas/gummy-box.schema.json', box],
  ['schemas/work-order.schema.json', proposedWork],
  ['schemas/task-lease.schema.json', lease],
  ['schemas/work-return.schema.json', returnedWork],
  ['schemas/work-return.schema.json', acceptanceReturn]
]) {
  const validate = ajv.getSchema(parsedSchemas.get(schemaPath).$id);
  if (!validate(record)) throw new Error(`${record.id} fails ${schemaPath}: ${ajv.errorsText(validate.errors)}`);
}

const legacySocialPath = await readFile('docs/SOCIAL_GRAPH.md', 'utf8');
if (!legacySocialPath.includes('SOCIAL_LAYER.md')) {
  throw new Error('legacy SOCIAL_GRAPH.md must point to the canonical SOCIAL_LAYER.md');
}

console.log('Gummy validation passed with founder-free automated acceptance, locked Night/Day expressions, exact purple-gold palette, Gummy/Glopper emphasis, Gummy Box Work Orders, Task Lease ownership, and explicit authority boundaries.');
