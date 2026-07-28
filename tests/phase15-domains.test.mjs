import assert from 'node:assert/strict';
import test from 'node:test';
import {
  approveRadioScript,
  composeOwnedOutfit,
  createHouseCommit,
  createHouseIntentPreview,
  createPrivateTableExport,
  createRadioExport,
  duplicateWorldPlan,
  nextFairParticipant,
  reviseRadioEpisode,
  validateAndEstimateWorld
} from '../src/places/active-place-domains.js';

test('Wardrobe replacement preserves unaffected slots and treats unavailable as temporary', () => {
  const items = [
    { id: 'top-a', slot: 'top', owned: true, availability: 'available' },
    { id: 'bottom-a', slot: 'bottom', owned: true, availability: 'unavailable' },
    { id: 'bottom-b', slot: 'bottom', owned: true, availability: 'available' },
    { id: 'shoes-a', slot: 'shoes', owned: true, availability: 'available' }
  ];
  const previous = { itemIds: ['top-a', 'bottom-a', 'shoes-a'] };
  const outfit = composeOwnedOutfit(items, { previousOutfit: previous, replaceSlot: 'bottom' });
  assert.deepEqual(outfit.itemIds, ['top-a', 'shoes-a', 'bottom-b']);
  assert.deepEqual(outfit.temporaryUnavailable, ['bottom-a']);
  assert.deepEqual(outfit.disliked, []);
  assert.equal(outfit.checkoutAvailable, false);
});

test('House Scope Wall and two-note commit remain required', () => {
  const records = [
    { recordType: 'room', recordId: 'room:front', value: {} },
    { recordType: 'photo', recordId: 'photo:family', value: {} }
  ];
  const preview = createHouseIntentPreview({ intent: 'Improve listening corner', selectedRecordIds: ['room:front'], records });
  assert.deepEqual(preview.sentRecordIds, ['room:front']);
  assert.deepEqual(preview.withheldRecordIds, ['photo:family']);
  assert.equal(preview.executing, false);
  assert.throws(() => createHouseCommit(preview, { intentNote: 'Do it', consequenceNote: '', approvedBy: 'actor:hayden' }), error => error.evidence.code === 'two-note-commit');
  const commit = createHouseCommit(preview, { intentNote: 'Add a quiet listening zone', consequenceNote: 'Keep walkway clear', approvedBy: 'actor:hayden' });
  assert.equal(commit.externalExecution, false);
});

test('Worlds validates and estimates locally while duplicate remains isolated', () => {
  const plan = {
    schema: 'gummy.world-plan/v1',
    id: 'world-plan:test',
    revision: 2,
    title: 'Test room',
    experience: 'sit',
    sources: [{ id: 'asset:a', revision: 1, hash: 'a'.repeat(64), verified: true, rights: 'owner-created' }],
    typedOperations: [{ type: 'scene.configure', parameters: {} }],
    constraints: { maxCost: 3, maxMinutes: 15, arbitraryCodeAllowed: false }
  };
  const result = validateAndEstimateWorld(plan);
  assert.equal(result.validation.valid, true);
  assert.equal(result.estimate.executing, false);
  const copy = duplicateWorldPlan(plan, { id: 'world-plan:test-copy' });
  assert.equal(copy.revision, 1);
  assert.deepEqual(copy.duplicatedFrom, { id: plan.id, revision: 2 });
});

test('Table export structurally excludes addresses, balances, and discovery', () => {
  const exported = createPrivateTableExport([
    { recordType: 'gathering', recordId: 'g1', value: { title: 'Supper', exactAddress: 'secret', nested: { latitude: 1 } } },
    { recordType: 'address-grant', recordId: 'grant1', value: { exactAddress: 'secret' } }
  ]);
  assert.equal(exported.records.length, 1);
  assert.equal(JSON.stringify(exported).includes('secret'), false);
  assert.equal(exported.exactAddressIncluded, false);
  assert.equal(exported.discoverable, false);
  assert.equal(exported.balanceIncluded, false);
});

test('Radio revisions invalidate approval and private export is not publication', () => {
  let episode = {
    id: 'episode:test',
    title: 'Test',
    sourcePackage: { privacy: 'private' },
    script: { revision: 1, text: 'Old', approved: true },
    voiceApproval: { approved: true },
    exportApproval: { approved: true },
    publishApproval: { approved: true }
  };
  episode = reviseRadioEpisode(episode, 'New revision');
  assert.equal(episode.script.revision, 2);
  assert.equal(episode.script.approved, false);
  assert.equal(episode.voiceApproval.approved, false);
  assert.throws(() => createRadioExport(episode), error => error.evidence.code === 'script-approval-required');
  episode = approveRadioScript(episode, 'actor:hayden');
  const exported = createRadioExport(episode);
  assert.equal(exported.browserSpeechIsFinalAudio, false);
  assert.equal(exported.published, false);
});

test('Rooms fair queue is deterministic', () => {
  const people = [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }];
  assert.equal(nextFairParticipant(people, null).id, 'a');
  assert.equal(nextFairParticipant(people, 'a').id, 'b');
  assert.equal(nextFairParticipant(people, 'c').id, 'a');
});
