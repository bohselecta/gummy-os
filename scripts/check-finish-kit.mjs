import { access, readFile } from 'node:fs/promises';

const finishKitFiles = [
  'docs/finish-kit/README.md',
  'docs/finish-kit/MASTER_RELEASE_ROADMAP.md',
  'docs/finish-kit/PRODUCT_READINESS_AND_UX.md',
  'docs/finish-kit/SPECIALIST_INTEGRATION_BLUEPRINT.md',
  'docs/finish-kit/INFRASTRUCTURE_AND_GUMMY_BOX.md',
  'docs/finish-kit/ACCEPTANCE_AND_RELEASE_MATRIX.md',
  'docs/finish-kit/RISKS_STOP_RULES_AND_DEFERRED_SCOPE.md',
  'docs/finish-kit/CODEX_ONE_TURN_EXECUTION_PROMPT.md',
  'docs/finish-kit/release-program.json',
  'plans/active/2026-07-27-master-finish-up-execution.md',
  '.cursor/rules/final-release-finish-kit.mdc'
];

for (const path of finishKitFiles) await access(path);

function assert(condition, message) {
  if (!condition) throw new Error(`finish kit invalid: ${message}`);
}

const program = JSON.parse(await readFile('docs/finish-kit/release-program.json', 'utf8'));

assert(program.schema === 'gummy.final-release-program/v1', 'unknown release-program schema');
assert(program.id === 'release-program:gummy-os:founder-ready-personal-v1', 'release-program ID changed');
assert(program.status === 'authorized-for-full-implementation', 'release program is not implementation-authorized');
assert(program.canonicalRepository === 'bohselecta/gummy-os', 'canonical repository changed');
assert(program.execution?.mode === 'one-sustained-codex-turn', 'one-turn execution mode is missing');
assert(program.execution?.intermediateFounderStops === false, 'intermediate founder stops must remain retired');
assert(program.execution?.phaseCheckpointCommits === true, 'phase checkpoint commits are required');
assert(program.execution?.oneFinalBranchPerRepository === true, 'one final branch per repository is required');
assert(program.execution?.oneFinalPullRequestPerRepository === true, 'one final PR per repository is required');
assert(program.execution?.manualRegressionAssignedToFounder === false, 'Hayden cannot be assigned routine regression');

const expectedRepositories = new Set([
  'bohselecta/gummy-os',
  'bohselecta/imagehoss',
  'bohselecta/videoboss',
  'bohselecta/3d-bee'
]);
const actualRepositories = new Set(program.repositories?.map(repository => repository.fullName));
assert(actualRepositories.size === expectedRepositories.size, 'exactly four canonical repositories are required');
for (const repository of expectedRepositories) {
  assert(actualRepositories.has(repository), `missing canonical repository ${repository}`);
}

const meshmallow = program.repositories.find(repository => repository.fullName === 'bohselecta/3d-bee');
assert(meshmallow?.publicName === 'Meshmallow', 'Meshmallow public name is missing');
for (const identity of ['bohselecta/3d-bee', 'app:3d-bee', 'actor:3d-bee', '3d-bee.*']) {
  assert(meshmallow.preservedLegacyIdentities?.includes(identity), `Meshmallow legacy identity is missing: ${identity}`);
}

assert(Array.isArray(program.phases) && program.phases.length === 10, 'Phases 0 through 9 are required');
for (let id = 0; id <= 9; id += 1) {
  const phase = program.phases.find(candidate => candidate.id === id);
  assert(phase, `phase ${id} is missing`);
  assert(typeof phase.name === 'string' && phase.name.length > 3, `phase ${id} has no useful name`);
  assert(Array.isArray(phase.outputs) && phase.outputs.length > 0, `phase ${id} has no outputs`);
  assert(typeof phase.exit === 'string' && phase.exit.length > 10, `phase ${id} has no exit gate`);
  if (id > 0) assert(phase.dependsOn?.includes(id - 1), `phase ${id} must depend on phase ${id - 1}`);
}

for (const path of program.controllingFiles || []) {
  assert(finishKitFiles.includes(path), `controlling file is not in the finish-kit inventory: ${path}`);
}
assert(program.controllingFiles?.length === 8, 'the eight controlling finish-kit documents are required');

const requiredInvariants = [
  'Human authority remains above Actor and Agent',
  'Actor and Agent remain distinct',
  'Opening or configuring a specialist never executes',
  'Make Production is the sole Production execution transition',
  'Human acceptance is final and role-specific',
  'Local Gummy Box works without an external account',
  'Specialist repositories remain separate',
  'Simulated and genuine results are never conflated'
];
for (const invariant of requiredInvariants) {
  assert(program.invariants?.includes(invariant), `required invariant is missing: ${invariant}`);
}

const requiredGates = [
  'product-preservation',
  'configuration-does-not-execute',
  'make-production-boundary',
  'authority-intersection',
  'source-immutability',
  'persistence-and-recovery',
  'truthful-capability-states',
  'human-acceptance',
  'linked-receipts',
  'local-first-new-user',
  'backup-and-clean-restore',
  'accessibility',
  'security-boundaries',
  'visible-known-limitations',
  'rollback'
];
for (const gate of requiredGates) {
  assert(program.requiredReleaseGates?.includes(gate), `required release gate is missing: ${gate}`);
}

const requiredDeferrals = [
  'broad Social Layer runtime',
  'Gummy Rooms live service',
  'Enterprise Habitat',
  'federation',
  'billing and marketplace',
  'broad native OS control',
  'physical engineering and manufacturing',
  'final Underground wallpaper art'
];
for (const item of requiredDeferrals) {
  assert(program.deferred?.includes(item), `deferred scope is missing: ${item}`);
}

const textRequirements = new Map([
  ['docs/finish-kit/README.md', [
    'Complete the product now without reopening its architecture.',
    'choose **Make Production** as the sole execution transition;',
    'begin locally without GitHub, Google Drive, a provider account, or infrastructure setup;'
  ]],
  ['docs/finish-kit/MASTER_RELEASE_ROADMAP.md', [
    'Phase 0 — Freeze the release baseline',
    'Phase 4 — Real ImageHoss integration',
    'Phase 5 — Real VideoBoss integration',
    'Phase 6 — Real Meshmallow integration',
    'Phase 9 — Release candidate, PRs, deployment, and final Return'
  ]],
  ['docs/finish-kit/PRODUCT_READINESS_AND_UX.md', [
    'Five-second comprehension',
    'Ten-second first action',
    'Night Gummy Launch',
    'technical JSON does not precede the readable explanation'
  ]],
  ['docs/finish-kit/SPECIALIST_INTEGRATION_BLUEPRINT.md', [
    'discover',
    'validateConfiguration',
    'compilePackage',
    'execute',
    'recover',
    'cancel',
    'inspectResult',
    'The specialist Receipt remains separately inspectable.'
  ]],
  ['docs/finish-kit/INFRASTRUCTURE_AND_GUMMY_BOX.md', [
    'Local Box = authoritative',
    'GitHub, Google Drive, managed storage',
    'inspect before apply',
    'No release claim may require Hayden to understand or repair GitHub/Vercel/provider plumbing.'
  ]],
  ['docs/finish-kit/ACCEPTANCE_AND_RELEASE_MATRIX.md', [
    'PASS',
    'BLOCKED',
    'NOT CLAIMED',
    'FAIL',
    'Founder-ready decision rule'
  ]],
  ['docs/finish-kit/RISKS_STOP_RULES_AND_DEFERRED_SCOPE.md', [
    'Architecture churn',
    'Plan paralysis',
    'False completion',
    'Global hard-stop conditions',
    'Explicitly deferred product scope'
  ]],
  ['docs/finish-kit/CODEX_ONE_TURN_EXECUTION_PROMPT.md', [
    'This is an implementation and release turn',
    'Do not ask for confirmation between phases.',
    'Do not give Hayden a routine test checklist.',
    'Continue through the complete program in this turn.'
  ]],
  ['plans/active/2026-07-27-master-finish-up-execution.md', [
    'Active and controlling',
    'Do not stop after another plan.',
    'The computer tests the computer. Hayden builds the world.'
  ]],
  ['.cursor/rules/final-release-finish-kit.mdc', [
    'alwaysApply: true',
    'Gummy OS is in release completion, not renewed architecture.',
    'Make Production'
  ]],
  ['AGENTS.md', [
    'founder-ready release completion',
    'docs/finish-kit/README.md',
    'Hayden is not the test harness.',
    'Make Production is the sole Production-wide execution transition.'
  ]],
  ['README.md', [
    'Current status',
    'docs/finish-kit/MASTER_RELEASE_ROADMAP.md',
    'Night Gummy Launch',
    'Hayden is not the test harness.'
  ]],
  ['docs/ROADMAP.md', [
    'founder-ready personal release completion',
    'Final implementation phases',
    'Protected long-horizon roadmap'
  ]],
  ['docs/BUILD_RUNBOOK.md', [
    'Final Release Build Runbook',
    'Phase loop',
    'Golden Production gate',
    'PR and merge procedure'
  ]]
]);

for (const [path, snippets] of textRequirements) {
  const text = await readFile(path, 'utf8');
  for (const snippet of snippets) {
    assert(text.includes(snippet), `${path} is missing controlling text: ${snippet}`);
  }
}

const finishKitText = (await Promise.all(
  finishKitFiles
    .filter(path => path.endsWith('.md') || path.endsWith('.mdc'))
    .map(path => readFile(path, 'utf8'))
)).join('\n');

for (const placeholder of ['[WRITE HERE]', 'TODO:', 'TBD:']) {
  assert(!finishKitText.includes(placeholder), `unfinished placeholder remains: ${placeholder}`);
}

console.log(`Finish kit valid: ${finishKitFiles.length} controlling files, ${program.phases.length} phases, ${program.requiredReleaseGates.length} release gates.`);
