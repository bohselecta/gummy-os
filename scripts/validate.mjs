import { access, readFile } from 'node:fs/promises';

const required = [
  'index.html',
  'src/app.js',
  'src/styles.css',
  'src/core/state.js',
  'src/core/capability-broker.js',
  'src/apps/snack-graph.js',
  'src/apps/enterprise.js',
  'docs/VOCABULARY.md',
  'docs/ARCHITECTURE.md',
  'docs/PROTOCOL.md',
  'docs/SECURITY_MODEL.md',
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
  'schemas/mold.schema.json',
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
  'Actor = who acts',
  'Mold = how that Actor is represented and verified',
  'Gummy = what the Actor creates or operates',
  'Bowl = where Actors and Gummies gather',
  'Link = how they relate',
  'Grab = how a Gummy becomes yours without altering the source'
]) {
  if (!vocabulary.includes(definition)) throw new Error(`canonical vocabulary is missing: ${definition}`);
}

console.log('Gummy validation passed with Protocol 0.2 specifications and Protocol 0.1 compatibility inputs.');
