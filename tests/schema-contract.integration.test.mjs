import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import {
  addRanchDayRoster,
  compileActorPlan,
  createDragIntent,
  createInitialProductionRuntime,
  createProduction,
  makeProduction,
  promoteSettingToActorDefault,
  saveProductionActorConfiguration
} from '../src/core/production-runtime.js';

const schemaNames = [
  'production',
  'production-participant',
  'production-actor-configuration',
  'actor-app-descriptor',
  'actor-plan',
  'context-envelope',
  'production-run',
  'actor-update-proposal',
  'drag-intent'
];

async function validators() {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const entries = await Promise.all(schemaNames.map(async name => {
    const schema = JSON.parse(await readFile(new URL(`../schemas/${name}.schema.json`, import.meta.url), 'utf8'));
    return [name, ajv.compile(schema)];
  }));
  return Object.fromEntries(entries);
}

test('canonical Production runtime artifacts validate against versioned JSON Schemas', async () => {
  const validate = await validators();
  const created = createProduction(createInitialProductionRuntime());
  let runtime = addRanchDayRoster(created.runtime, created.production.id);
  for (const actorId of ['actor:imagehoss', 'actor:3d-bee', 'actor:videoboss', 'actor:project-composer', 'actor:gummy-storage']) {
    runtime = (await saveProductionActorConfiguration(runtime, created.production.id, actorId, {})).runtime;
  }
  runtime = compileActorPlan(runtime, created.production.id).runtime;
  const drag = createDragIntent(runtime, {
    productionId: created.production.id,
    sourceKind: 'gummy',
    sourceId: 'gummy:ranch-day-source-brief',
    targetKind: 'actor',
    targetId: 'actor:videoboss',
    action: 'task-input',
    dataClasses: ['text/markdown'],
    inputMode: 'keyboard'
  });
  runtime = drag.runtime;
  const promoted = await promoteSettingToActorDefault(runtime, created.production.id, 'actor:videoboss', ['durationSeconds']);
  runtime = promoted.runtime;
  const completed = await makeProduction(runtime, created.production.id, { approvedBy: 'human:hayden' });
  runtime = completed.runtime;

  const fixtures = {
    production: runtime.productions,
    'production-participant': runtime.participants,
    'production-actor-configuration': runtime.configurations,
    'actor-app-descriptor': runtime.actorAppDescriptors,
    'actor-plan': runtime.actorPlans,
    'context-envelope': runtime.contextEnvelopes,
    'production-run': runtime.productionRuns,
    'actor-update-proposal': runtime.actorUpdateProposals,
    'drag-intent': runtime.dragIntents
  };
  for (const [name, records] of Object.entries(fixtures)) {
    assert.ok(records.length > 0, `${name} has fixture records`);
    for (const record of records) {
      assert.equal(validate[name](record), true, `${name}: ${JSON.stringify(validate[name].errors)}`);
    }
  }
});
