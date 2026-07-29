import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import 'fake-indexeddb/auto';
import {
  amendProductionAgreement,
  appendContribution,
  approveProductionAgreement,
  assertFormationImmutable,
  createContributionLedger,
  createProductionPool,
  createSharedVisionFromSelection,
  ensureLivingCollaborationRecords,
  formProduction,
  generateCommandCenterView,
  PHASE16_IDS,
  proposeFourthContributorAllocation,
  resolveActorPresence,
  resumeSocialInstance,
  revokeRepresentation,
  runLivingCollaborationProof
} from '../src/core/living-collaboration.js';
import { createInitialProductionRuntime } from '../src/core/production-runtime.js';
import { personalRecords } from '../src/core/records.js';
import { RecordRepository } from '../src/core/repository.js';

async function fixture() {
  const databaseName = `gummy-phase16-${crypto.randomUUID()}`;
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
    databaseName,
    close() {
      this.repository.close();
    }
  };
}

test('Actor Presence keeps identity, operator, Mold, Grant, expiry, and revocation separate', async t => {
  const context = await fixture();
  t.after(() => context.close());
  const presence = (await context.repository.all('actorPresence'))
    .find(item => item.actorId === 'actor:contributor-b');
  assert.equal(presence.state, 'ai-represented');
  assert.equal(presence.operator.type, 'agent');
  assert.equal(presence.operator.operatorId, 'agent:contributor-b-representative');
  assert.equal(presence.operator.moldId, 'mold:contributor-b:representation-v1');
  assert.equal(presence.operator.grantId, 'grant:contributor-b:representation-v1');
  assert.equal(presence.operator.sponsorHumanId, 'human:hayden');
  assert.equal(presence.representationAuthority.allowedCapabilities.includes('publish'), false);
  assert.equal(presence.provenance.realAudioVideoConnected, false);

  const expired = resolveActorPresence({ ...presence, expiresAt: '2026-07-28T18:00:01.000Z' }, '2026-07-28T18:00:02.000Z');
  assert.equal(expired.state, 'offline');
  assert.equal(expired.stale, true);

  const revoked = await revokeRepresentation(context.repository, undefined, {
    clock: () => '2026-07-28T18:05:00.000Z'
  });
  assert.equal(revoked.presence.state, 'revoked');
  assert.equal(revoked.mold.status, 'revoked');
  assert.equal(revoked.grant.revoked, true);
  assert.equal(revoked.presence.operator.type, 'none');
});

test('Social Instance persists a topology and resumes as a distinct Session revision after reload', async t => {
  const context = await fixture();
  t.after(() => context.close());
  const original = await context.repository.get('socialInstances', PHASE16_IDS.socialInstance);
  assert.equal(original.sourceBowlId, PHASE16_IDS.bowl);
  assert.equal(original.originatingSessionId, PHASE16_IDS.session);
  assert.equal(original.layout.windows.length, 5);
  assert.ok(original.layout.windows.some(item => item.state === 'minimized'));
  assert.equal(original.privacy.crossInstanceSharing, 'explicit-handoff-only');

  context.repository.close();
  const reopened = new RecordRepository({ databaseName: context.databaseName });
  context.repository = reopened;
  const restored = await reopened.get('socialInstances', PHASE16_IDS.socialInstance);
  assert.deepEqual(restored.layout, original.layout);
  const resumed = await resumeSocialInstance(reopened, restored.id, {
    clock: () => '2026-07-28T19:00:00.000Z'
  });
  assert.equal(resumed.session.revision, 2);
  assert.equal(resumed.session.resumedFromSessionId, PHASE16_IDS.session);
  assert.equal(resumed.socialInstance.latestSessionId, 'session:friday-brainstorm:2');
  assert.notEqual(resumed.socialInstance.id, resumed.session.id);
});

test('database version 5 adds collaboration and Production Composition stores without losing existing local records', async t => {
  const databaseName = `gummy-phase16-migration-${crypto.randomUUID()}`;
  const legacyRequest = indexedDB.open(databaseName, 3);
  const legacy = await new Promise((resolve, reject) => {
    legacyRequest.onupgradeneeded = () => {
      const database = legacyRequest.result;
      database.createObjectStore('meta', { keyPath: 'id' });
      database.createObjectStore('humans', { keyPath: 'id' });
    };
    legacyRequest.onsuccess = () => resolve(legacyRequest.result);
    legacyRequest.onerror = () => reject(legacyRequest.error);
  });
  const write = legacy.transaction(['meta', 'humans'], 'readwrite');
  write.objectStore('meta').put({ id: 'onboarding', completed: true });
  write.objectStore('humans').put({ id: 'human:existing', name: 'Existing Human' });
  await new Promise((resolve, reject) => {
    write.oncomplete = resolve;
    write.onerror = () => reject(write.error);
  });
  legacy.close();

  const repository = new RecordRepository({ databaseName });
  t.after(() => repository.close());
  assert.equal((await repository.get('meta', 'onboarding')).completed, true);
  assert.equal((await repository.get('humans', 'human:existing')).name, 'Existing Human');
  await repository.put('socialInstances', { id: 'social-instance:migrated-proof' }, { validate: false });
  await repository.put('productionFormations', { id: 'production-formation:migrated-proof' }, { validate: false });
  await repository.put('productionCompositions', { id: 'composition:migrated-proof' }, { validate: false });
  assert.equal((await repository.all('socialInstances')).length, 1);
  assert.equal((await repository.all('productionFormations')).length, 1);
  assert.equal((await repository.all('productionCompositions')).length, 1);
});

test('Shared Vision, Agreement, and Formation require exact revisions without silently executing', async t => {
  const context = await fixture();
  t.after(() => context.close());
  const vision = await createSharedVisionFromSelection(context.repository);
  assert.deepEqual(vision.origin.recordRefs.map(item => item.id), [
    'message:friday:118',
    'message:friday:124',
    'message:friday:131'
  ]);
  assert.ok(vision.origin.recordRefs.every(item => item.hash.length === 64));
  assert.ok(vision.origin.explicitExclusions.includes('message:friday:140'));
  assert.equal((await context.repository.all('productions')).length, 0);

  const agreement = await approveProductionAgreement(context.repository);
  assert.equal(agreement.status, 'active');
  assert.ok(agreement.approvals.every(item => item.revision === 1));
  assert.equal(agreement.ownershipPolicy.automaticFromContribution, false);
  assert.equal(agreement.publicationPolicy.separateApprovalRequired, true);

  const amendment = await amendProductionAgreement(context.repository);
  assert.equal(amendment.revision, 2);
  assert.equal(amendment.status, 'awaiting-approval');
  assert.deepEqual(amendment.approvals, []);
  assert.equal(amendment.supersedesAgreementId, agreement.id);

  await createProductionPool(context.repository);
  await createContributionLedger(context.repository);
  const formation = await formProduction(context.repository);
  assert.equal(formation.immutable, true);
  assert.equal(formation.agreementRevision, 1);
  await assert.rejects(
    assertFormationImmutable(context.repository, { ...formation, agreementRevision: 2 }),
    /immutable/
  );
});

test('Production Pool preserves $4/$3/$3 authorizations and proposes a lower future four-way allocation', async t => {
  const context = await fixture();
  t.after(() => context.close());
  await createSharedVisionFromSelection(context.repository);
  await approveProductionAgreement(context.repository);
  const original = await createProductionPool(context.repository);
  const revised = await proposeFourthContributorAllocation(context.repository);
  assert.deepEqual(original.allocations.map(item => item.maximumAmount), [4, 3, 3]);
  assert.deepEqual(original.allocations.map(item => item.status), ['authorized', 'authorized', 'authorized']);
  assert.deepEqual(revised.allocations.map(item => item.proposedAmount), [2.5, 2.5, 2.5, 2.5]);
  assert.deepEqual(revised.allocations.map(item => item.maximumAmount), [4, 3, 3, 2.5]);
  assert.deepEqual(revised.priorAuthorizationIds, original.allocations.map(item => item.authorizationId));
  assert.equal(revised.recalculation.increasesExistingMaximum, false);
  assert.equal(revised.recalculation.changesCompletedCharges, false);
  assert.equal(revised.recalculation.requiresFreshAuthorizations, true);
  assert.equal(original.actual.charged, 0);
  assert.equal(original.paymentEvents.length, 0);
  assert.equal(original.internalCurrency, false);
});

test('Contribution Ledger appends unique evidence without rewriting prior entries or assigning ownership', async t => {
  const context = await fixture();
  t.after(() => context.close());
  await createSharedVisionFromSelection(context.repository);
  await approveProductionAgreement(context.repository);
  const original = await createContributionLedger(context.repository);
  const prior = structuredClone(original.entries);
  const next = await appendContribution(context.repository, {
    id: 'contribution:friday:technical-review',
    actorId: 'actor:contributor-d',
    category: 'technical',
    description: 'Reviewed the deterministic local proof boundary',
    quantity: 1,
    unit: 'review',
    evidenceRefs: []
  });
  assert.deepEqual(next.entries.slice(0, prior.length), prior);
  assert.equal(next.entries.at(-1).ownershipEffect.automatic, false);
  assert.equal(next.revision, original.revision + 1);
  await assert.rejects(
    appendContribution(context.repository, {
      id: 'contribution:friday:technical-review',
      actorId: 'actor:contributor-d',
      category: 'technical',
      description: 'Attempted rewrite',
      quantity: 2,
      unit: 'review',
      evidenceRefs: []
    }),
    /immutable and unique/
  );
});

test('complete proof forms and runs one governed deterministic Production before separate acceptance and distribution', async t => {
  const context = await fixture();
  t.after(() => context.close());
  const completed = await runLivingCollaborationProof(
    context.repository,
    createInitialProductionRuntime()
  );
  assert.equal(completed.formation.productionId, PHASE16_IDS.production);
  assert.equal(completed.run.status, 'completed');
  assert.equal(completed.run.approval.approvedBy, 'human:hayden');
  assert.ok(completed.run.workOrderIds.length >= 4);
  assert.equal(completed.run.returnIds.length, completed.run.receiptIds.length);
  assert.equal(completed.acceptedResult.status, 'accepted');
  assert.equal(completed.originalPool.actual.charged, 0);
  assert.equal(completed.originalPool.actual.net, 0);
  assert.equal(completed.release.destination.type, 'private-export');

  const plans = Object.fromEntries(completed.distributionPlans.map(item => [item.destination.type, item]));
  assert.equal(plans.radio.status, 'needs-voice-approval');
  assert.equal(plans.channels.status, 'blocked');
  assert.equal(plans.channels.destination.routeStatus, 'service-required');
  assert.equal(plans['private-export'].status, 'ready-for-publication');
  assert.equal((await context.repository.all('distributionReleases')).length, 1);
  assert.equal(completed.commandCenter.executing, false);
  assert.equal(completed.commandCenter.authoritySource, 'underlying-objects-and-master-control');
  assert.ok(completed.commandCenter.blockers.some(item => item.title.includes('channels')));
  assert.ok(completed.commandCenter.resumeOpportunities.length > 0);
});

test('all durable Phase 16 proof records validate against the accepted contracts', async t => {
  const context = await fixture();
  t.after(() => context.close());
  const completed = await runLivingCollaborationProof(
    context.repository,
    createInitialProductionRuntime()
  );
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const contracts = {
    actorPresence: ['actor-presence', await context.repository.all('actorPresence')],
    socialInstances: ['social-instance', await context.repository.all('socialInstances')],
    sharedVisions: ['shared-vision', await context.repository.all('sharedVisions')],
    productionAgreements: ['production-agreement', await context.repository.all('productionAgreements')],
    productionPools: ['production-pool', await context.repository.all('productionPools')],
    contributionLedgers: ['contribution-ledger', await context.repository.all('contributionLedgers')],
    productionFormations: ['production-formation', await context.repository.all('productionFormations')],
    distributionPlans: ['distribution-plan', await context.repository.all('distributionPlans')]
  };
  for (const [store, [name, records]] of Object.entries(contracts)) {
    const schema = JSON.parse(await readFile(new URL(`../schemas/${name}.schema.json`, import.meta.url), 'utf8'));
    const validate = ajv.compile(schema);
    for (const record of records.filter(item => item.schema === schema.properties.schema.const)) {
      assert.equal(validate(record), true, `${store}: ${JSON.stringify(validate.errors)}`);
    }
  }
  const commandSchema = JSON.parse(await readFile(new URL('../schemas/command-center-view.schema.json', import.meta.url), 'utf8'));
  const validateCommand = ajv.compile(commandSchema);
  const command = await generateCommandCenterView(context.repository, completed.runtime);
  assert.equal(validateCommand(command), true, JSON.stringify(validateCommand.errors));
});
