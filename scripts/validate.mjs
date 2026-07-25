import { access, readFile } from 'node:fs/promises';

const required = [
  'index.html',
  'src/app.js',
  'src/styles.css',
  'src/core/state.js',
  'src/core/capability-broker.js',
  'src/apps/snack-graph.js',
  'src/apps/enterprise.js',
  'docs/BRAND_SYSTEM.md',
  'docs/GLOPPER_NAMING.md',
  'docs/ACTOR_AGENT_MASTER_CONTROL.md',
  'docs/PLATFORM_PLAYGROUND_SECURITY.md',
  'docs/GUMMY_BOX_WORK_ORDERS.md',
  'docs/VOCABULARY.md',
  'docs/ARCHITECTURE.md',
  'docs/PROTOCOL.md',
  'docs/SECURITY_MODEL.md',
  'docs/SOCIAL_LAYER.md',
  'docs/SOCIAL_GRAPH.md',
  'docs/ENTERPRISE_FRAMEWORK.md',
  'docs/ROADMAP.md',
  'examples/glopper-web.agent.json',
  'examples/hayden.gummy-box.json',
  'examples/project-brief.work-order.json',
  'examples/project-brief.task-lease.json',
  'examples/project-brief.work-return.json',
  'plans/active/2026-07-25-personal-gummy-cursor-work-order.md',
  'plans/active/2026-07-25-gummy-box-cursor-addendum.md',
  'plans/active/2026-07-25-brand-system-cursor-addendum.md'
];

for (const path of required) await access(path);

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
if (pkg.name !== 'gummy-os') throw new Error('package name must remain gummy-os');

const schemas = [
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

const product = await readFile('docs/PRODUCT_SPEC.md', 'utf8');
for (const requirement of [
  'Exactly two expressions exist',
  'Gummy    purple-dominant, gold accent',
  'Glopper  gold-dominant, purple accent',
  'No color picker, downloadable theme, per-window accent selection, mascot recoloring, or third-party Gummy OS skin is permitted.'
]) {
  if (!product.includes(requirement)) throw new Error(`product spec is missing brand requirement: ${requirement}`);
}

const agent = JSON.parse(await readFile('examples/glopper-web.agent.json', 'utf8'));
if (agent.id !== 'agent:glopper-web' || agent.characterFamily !== 'Glopper') {
  throw new Error('canonical Glopper Web Agent example is invalid');
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

const legacySocialPath = await readFile('docs/SOCIAL_GRAPH.md', 'utf8');
if (!legacySocialPath.includes('SOCIAL_LAYER.md')) {
  throw new Error('legacy SOCIAL_GRAPH.md must point to the canonical SOCIAL_LAYER.md');
}

console.log('Gummy validation passed with locked Night/Day expressions, exact purple-gold palette, Gummy/Glopper emphasis, Gummy Box Work Orders, Task Lease ownership, and explicit authority boundaries.');
