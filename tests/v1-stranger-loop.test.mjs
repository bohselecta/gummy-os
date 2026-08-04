import assert from 'node:assert/strict';
import test from 'node:test';
import 'fake-indexeddb/auto';
import {
  DEMO_WORKER,
  PHASE16_ACTORS,
  createSharedVisionFromSelection,
  ensureLivingCollaborationRecords,
  generateCommandCenterView,
  projectCommandCenterLanes,
  runLivingCollaborationProof
} from '../src/core/living-collaboration.js';
import { createInitialProductionRuntime } from '../src/core/production-runtime.js';
import { personalRecords } from '../src/core/records.js';
import { RecordRepository } from '../src/core/repository.js';

async function fixture() {
  const databaseName = `gummy-v1-loop-${crypto.randomUUID()}`;
  const repository = new RecordRepository({ databaseName });
  const records = personalRecords({
    name: 'Hayden',
    address: '@hayden',
    sourceHash: 'a'.repeat(64),
    byteRef: 'gummies/project-brief/1'
  });
  for (const [store, values] of [
    ['humans', [records.human]],
    ['actors', [records.actor, records.testActor]],
    ['agents', [records.agent, records.localOperator]],
    ['molds', [records.mold]],
    ['masterControls', [records.masterControl]],
    ['gummies', [records.gummy]],
    ['workOrders', [records.workOrder]]
  ]) {
    for (const record of values) await repository.put(store, record, { validate: false });
  }
  await ensureLivingCollaborationRecords(repository, { clock: () => '2026-07-28T18:00:00.000Z' });
  return {
    repository,
    close() {
      this.repository.close();
    }
  };
}

test('Demo Production seed names Bob and a collaborative 30-second intent', async t => {
  const context = await fixture();
  t.after(() => context.close());
  assert.equal(PHASE16_ACTORS.find(actor => actor.id === 'actor:contributor-b').name, 'Bob');
  assert.equal(DEMO_WORKER.label, 'Demo Worker');
  const vision = await createSharedVisionFromSelection(context.repository);
  assert.match(vision.intent, /30-second AI video/i);
});

test('Command Center lanes project Now/Next/Delegated/Review/Blocked/Done', async t => {
  const context = await fixture();
  t.after(() => context.close());
  const completed = await runLivingCollaborationProof(
    context.repository,
    createInitialProductionRuntime()
  );
  const command = await generateCommandCenterView(context.repository, completed.runtime);
  assert.ok(command.lanes);
  for (const key of ['now', 'next', 'delegated', 'review', 'blocked', 'done']) {
    assert.ok(Array.isArray(command.lanes[key]), key);
  }
  assert.equal(command.lanes.worker.label, 'Demo Worker');
  const projected = projectCommandCenterLanes({
    attentionItems: command.attentionItems,
    activeProductions: completed.runtime.productions,
    workOrders: completed.runtime.workOrders,
    returns: completed.runtime.returns,
    receipts: completed.runtime.receipts,
    blockedPlans: [],
    waitingPlans: [],
    runtime: completed.runtime
  });
  assert.ok(projected.done.length >= 1);
});

test('Demo Production acceptance advances once and keeps Demo Worker labeled', async t => {
  const context = await fixture();
  t.after(() => context.close());
  const first = await runLivingCollaborationProof(
    context.repository,
    createInitialProductionRuntime()
  );
  const accepted = first.runtime.gummies.filter(item => item.status === 'accepted');
  assert.equal(accepted.length, 1);
  const second = await runLivingCollaborationProof(context.repository, first.runtime);
  const acceptedAgain = second.runtime.gummies.filter(item => item.status === 'accepted');
  assert.equal(acceptedAgain.length, 1);
  assert.equal(second.runtime.productions[0].title, 'Collaborative 30-second AI video');
  assert.match(DEMO_WORKER.disclosure, /Demo Worker/);
});
