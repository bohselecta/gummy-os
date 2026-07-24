import { access, readFile } from 'node:fs/promises';

const required = [
  'index.html',
  'src/app.js',
  'src/styles.css',
  'src/core/state.js',
  'src/core/capability-broker.js',
  'src/apps/snack-graph.js',
  'src/apps/enterprise.js',
  'docs/ARCHITECTURE.md',
  'docs/SOCIAL_GRAPH.md',
  'docs/ENTERPRISE_FRAMEWORK.md',
  'docs/ROADMAP.md'
];

for (const path of required) await access(path);

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
if (pkg.name !== 'gummy-os') throw new Error('package name must remain gummy-os');

for (const schema of [
  'schemas/snack.schema.json',
  'schemas/graph-object.schema.json',
  'schemas/app-pack.schema.json',
  'schemas/capability-grant.schema.json',
  'schemas/action-receipt.schema.json',
  'schemas/organization.schema.json',
  'schemas/policy-pack.schema.json'
]) {
  const parsed = JSON.parse(await readFile(schema, 'utf8'));
  if (!parsed.$id || !parsed.title) throw new Error(`${schema} is missing $id or title`);
}

console.log('Gummy validation passed.');
