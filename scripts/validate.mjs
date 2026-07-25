import { access, readFile } from 'node:fs/promises';

const required = [
  'index.html',
  'src/app.js',
  'src/styles.css',
  'src/core/state.js',
  'src/core/capability-broker.js',
  'src/apps/snack-graph.js',
  'src/apps/enterprise.js',
  'docs/GLOPPER_NAMING.md',
  'docs/ACTOR_AGENT_MASTER_CONTROL.md',
  'docs/PLATFORM_PLAYGROUND_SECURITY.md',
  'docs/VOCABULARY.md',
  'docs/ARCHITECTURE.md',
  'docs/PROTOCOL.md',
  'docs/SECURITY_MODEL.md',
  'docs/SOCIAL_LAYER.md',
  'docs/SOCIAL_GRAPH.md',
  'docs/ENTERPRISE_FRAMEWORK.md',
  'docs/ROADMAP.md',
  'plans/active/2026-07-25-personal-gummy-cursor-work-order.md'
];

for (const path of required) await access(path);

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
if (pkg.name !== 'gummy-os') throw new Error('package name must remain gummy-os');

const schemas = [
  'schemas/actor.schema.json',
  'schemas/agent.schema.json',
  'schemas/mold.schema.json',
  'schemas/master-control.schema.json',
  'schemas/gummy.schema.json',
  'schemas/bowl.schema.json',
  'schemas/link.schema.json',
  'schemas/grab.schema.json',
  'schemas/app-pack.schema.json',
  'schemas/capability-grant.schema.json',
  'schemas/action-receipt.schema.json',
  'schemas/organization.schema.json',
  'schemas/policy-pack.schema.json',
  'schemas/snack.schema.json',
  'schemas/graph-object.schema.json'
];

for (const schema of schemas) {
  const parsed = JSON.parse(await readFile(schema, 'utf8'));
  if (!parsed.$id || !parsed.title) throw new Error(`${schema} is missing $id or title`);
}

const naming = await readFile('docs/GLOPPER_NAMING.md', 'utf8');
for (const definition of [
  'Gummy OS       = the universal platform and WebOS',
  'Gummy Canvas   = the open working and creation surface',
  'Gummy Bar      = the persistent candy-store system bar',
  'Glopper        = the gummy-candy companion and first-party Agent identity',
  'The Gummy Bar is the candy store.',
  'Glopper is the companion candy.'
]) {
  if (!naming.includes(definition)) throw new Error(`Glopper naming is missing: ${definition}`);
}

const vocabulary = await readFile('docs/VOCABULARY.md', 'utf8');
for (const definition of [
  'Human = ultimate personal authority',
  'Actor = persistent addressable entity in the web/world',
  'Agent = executable intelligence that performs work',
  'Mold = permissioned embodiment and operating contract for an Actor',
  'Master Control = where authority, placement, and synchronization are decided',
  '@address = the stable protocol identity and route for an Actor'
]) {
  if (!vocabulary.includes(definition)) throw new Error(`canonical vocabulary is missing: ${definition}`);
}

const platform = await readFile('docs/PLATFORM_PLAYGROUND_SECURITY.md', 'utf8');
for (const invariant of [
  'automatic availability != automatic authority',
  'Creation never implies inherited authority.',
  'A candy icon is presentation only.',
  'Existence inside Gummy OS never grants native execution.',
  'The Gummy Bar is the candy store. Glopper is the companion candy. The Gummy Canvas is where the future gets made.'
]) {
  if (!platform.includes(invariant)) throw new Error(`platform thesis is missing: ${invariant}`);
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

const legacySocialPath = await readFile('docs/SOCIAL_GRAPH.md', 'utf8');
if (!legacySocialPath.includes('SOCIAL_LAYER.md')) {
  throw new Error('legacy SOCIAL_GRAPH.md must point to the canonical SOCIAL_LAYER.md');
}

console.log('Gummy validation passed with Gummy Canvas, candy-store Gummy Bar, Glopper companion, standalone-first development, and explicit authority boundaries.');
