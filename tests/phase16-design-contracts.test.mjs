import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const schemaFiles = [
  'actor-presence.schema.json',
  'social-instance.schema.json',
  'shared-vision.schema.json',
  'production-agreement.schema.json',
  'production-pool.schema.json',
  'contribution-ledger.schema.json',
  'production-formation.schema.json',
  'distribution-plan.schema.json',
  'command-center-view.schema.json'
];

async function json(path) {
  return JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
}

test('all Phase 16 design contracts compile as JSON Schema 2020-12', async () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  for (const file of schemaFiles) {
    const schema = await json(`schemas/${file}`);
    assert.doesNotThrow(() => ajv.compile(schema), file);
  }
});

test('Actor Presence separates Actor identity from operator identity', async () => {
  const schema = await json('schemas/actor-presence.schema.json');
  assert.equal(schema.properties.schema.const, 'gummy.actor-presence/v1');
  assert.ok(schema.properties.state.enum.includes('human-live'));
  assert.ok(schema.properties.state.enum.includes('ai-represented'));
  assert.ok(schema.properties.operator.properties.moldId);
  assert.ok(schema.properties.operator.properties.grantId);
});

test('Social Instance remains distinct from Bowl and Session', async () => {
  const schema = await json('schemas/social-instance.schema.json');
  assert.equal(schema.properties.schema.const, 'gummy.social-instance/v1');
  assert.ok(schema.properties.sourceBowlId);
  assert.ok(schema.properties.originatingSessionId);
  assert.ok(schema.properties.latestSessionId);
  assert.equal(schema.properties.privacy.properties.crossInstanceSharing.const, 'explicit-handoff-only');
});

test('Shared Vision can recognize intent without execution or automatic formation', async () => {
  const schema = await json('schemas/shared-vision.schema.json');
  assert.equal(schema.properties.schema.const, 'gummy.shared-vision/v1');
  assert.ok(schema.properties.status.enum.includes('proposed'));
  assert.ok(schema.properties.status.enum.includes('rejected'));
  assert.ok(schema.properties.formationReadiness.enum.includes('ready'));
  assert.ok(schema.properties.origin.properties.explicitExclusions);
});

test('Production Agreement keeps contribution, ownership, credit, and publication separate', async () => {
  const schema = await json('schemas/production-agreement.schema.json');
  assert.equal(schema.properties.ownershipPolicy.properties.automaticFromContribution.const, false);
  assert.equal(schema.properties.publicationPolicy.properties.separateApprovalRequired.const, true);
  assert.equal(schema.properties.amendmentPolicy.properties.staleApprovalsInvalid.const, true);
});

test('Production Pool uses external USD payment evidence without internal stored value', async () => {
  const schema = await json('schemas/production-pool.schema.json');
  assert.equal(schema.properties.currency.const, 'USD');
  assert.equal(schema.properties.custodyModel.const, 'external-provider-no-internal-stored-value');
  assert.equal(schema.properties.internalCurrency.const, false);
  assert.equal(schema.properties.recalculation.properties.increasesExistingMaximum.const, false);
  assert.equal(schema.properties.recalculation.properties.changesCompletedCharges.const, false);
});

test('Contribution Ledger records evidence but cannot silently assign ownership', async () => {
  const schema = await json('schemas/contribution-ledger.schema.json');
  assert.equal(schema.properties.appendOnly.const, true);
  const entry = schema.properties.entries.items.properties;
  assert.equal(entry.ownershipEffect.properties.automatic.const, false);
  assert.ok(entry.evidenceRefs);
});

test('Formation, distribution, and Command Center preserve separate approval boundaries', async () => {
  const formation = await json('schemas/production-formation.schema.json');
  const distribution = await json('schemas/distribution-plan.schema.json');
  const command = await json('schemas/command-center-view.schema.json');
  assert.equal(formation.properties.schema.const, 'gummy.production-formation/v1');
  assert.ok(distribution.properties.approvals.items.properties.class.enum.includes('publication'));
  assert.equal(command.properties.authoritySource.const, 'underlying-objects-and-master-control');
  assert.equal(command.properties.executing.const, false);
});

test('canonical doctrine files preserve Master Control, Glopper, Zeke, and translation boundaries', async () => {
  const [formation, presence, command, plan] = await Promise.all([
    readFile(new URL('../docs/GUMMY_SHARED_VISION_PRODUCTION_MODEL.md', import.meta.url), 'utf8'),
    readFile(new URL('../docs/GUMMY_ACTOR_PRESENCE_SOCIAL_INSTANCE_MODEL.md', import.meta.url), 'utf8'),
    readFile(new URL('../docs/GUMMY_COMMAND_CENTER_DISTRIBUTION_MODEL.md', import.meta.url), 'utf8'),
    readFile(new URL('../plans/review/2026-07-28-phase-16-living-collaboration.md', import.meta.url), 'utf8')
  ]);
  assert.match(formation, /Make Production remains the sole Production-wide execution transition/);
  assert.match(presence, /The AI is never “the user.”/);
  assert.match(command, /Command Center shows what needs attention\. Master Control decides what is allowed/);
  assert.match(command, /Glopper remains the first-party companion identity/);
  assert.match(command, /Zeke is the visible coordination and explanation intelligence of Command Center/);
  assert.match(plan, /FOUNDER ACCEPTED \/ MERGE AND PRODUCTION PROMOTION AUTHORIZED/);
  assert.match(plan, /evidence\/phase16-founder-acceptance\.json/);
});
