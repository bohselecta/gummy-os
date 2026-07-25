import { access, readFile } from 'node:fs/promises';

const required = [
  'index.html',
  'src/app.js',
  'src/styles.css',
  'src/core/state.js',
  'src/core/capability-broker.js',
  'src/apps/snack-graph.js',
  'src/apps/enterprise.js',
  'docs/ACTOR_AGENT_MASTER_CONTROL.md',
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

const vocabulary = await readFile('docs/VOCABULARY.md', 'utf8');
for (const definition of [
  'Human = ultimate personal authority',
  'Actor = persistent addressable entity in the web/world',
  'Agent = executable intelligence that performs work',
  'Mold = permissioned embodiment and operating contract for an Actor',
  'Master Control = where authority, placement, and synchronization are decided',
  'Gummy OS = the Web OS where Actors are opened and deployed',
  'Glyphd OS = the native AI execution and device-sovereignty environment',
  '@address = the stable protocol identity and route for an Actor'
]) {
  if (!vocabulary.includes(definition)) throw new Error(`canonical vocabulary is missing: ${definition}`);
}

const ruling = await readFile('docs/ACTOR_AGENT_MASTER_CONTROL.md', 'utf8');
for (const boundary of [
  'The Web Actor and OS Agent may work together, but they are not the same object.',
  'Master Control',
  'Gummy OS is the **Web OS plane**',
  'Glyphd OS is the **native execution and device-sovereignty plane**'
]) {
  if (!ruling.includes(boundary)) throw new Error(`architecture ruling is missing: ${boundary}`);
}

const legacySocialPath = await readFile('docs/SOCIAL_GRAPH.md', 'utf8');
if (!legacySocialPath.includes('SOCIAL_LAYER.md')) {
  throw new Error('legacy SOCIAL_GRAPH.md must point to the canonical SOCIAL_LAYER.md');
}

console.log('Gummy validation passed with distinct Human, Actor, Agent, Mold, and Master Control specifications.');
