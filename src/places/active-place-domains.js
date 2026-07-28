import { PlaceSystemError } from '../core/place-system.js';
import { validateWorldPlan, estimateWorld } from './place-doctrines.js';

function clone(value) {
  return structuredClone(value);
}

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freeze(child);
  return value;
}

export function slug(value, fallback = 'record') {
  const result = String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return result || fallback;
}

export function composeOwnedOutfit(items, { previousOutfit = null, replaceSlot = null } = {}) {
  const owned = items.filter(item => item?.owned === true);
  if (!owned.length) throw new PlaceSystemError('wardrobe-empty', 'Add at least one confirmed owned item first.');
  const available = owned.filter(item => item.availability !== 'unavailable');
  if (!available.length) throw new PlaceSystemError('wardrobe-unavailable', 'No owned item is currently available.');

  const byId = new Map(available.map(item => [item.id, item]));
  const selected = [];
  const used = new Set();
  const targetSlots = ['top', 'bottom', 'shoes', 'layer', 'accessory'];

  if (previousOutfit?.itemIds?.length) {
    for (const itemId of previousOutfit.itemIds) {
      const item = byId.get(itemId);
      if (!item || item.slot === replaceSlot) continue;
      if (!used.has(item.slot)) {
        selected.push(item);
        used.add(item.slot);
      }
    }
  }

  for (const slot of targetSlots) {
    if (used.has(slot)) continue;
    const candidate = available.find(item => item.slot === slot && !selected.some(selectedItem => selectedItem.id === item.id));
    if (candidate) {
      selected.push(candidate);
      used.add(slot);
    }
  }

  if (!selected.length) selected.push(available[0]);
  return freeze({
    itemIds: selected.map(item => item.id),
    slots: Object.fromEntries(selected.map(item => [item.slot, item.id])),
    temporaryUnavailable: owned.filter(item => item.availability === 'unavailable').map(item => item.id),
    disliked: [],
    checkoutAvailable: false
  });
}

export function createHouseIntentPreview({ intent, selectedRecordIds, records }) {
  if (!intent?.trim()) throw new PlaceSystemError('intent-required', 'Describe the House intent first.');
  const selected = records.filter(record => selectedRecordIds.includes(record.recordId));
  const forbidden = selected.filter(record => /address|photo/i.test(record.recordType) || /address|photo/i.test(record.recordId));
  if (forbidden.length) {
    throw new PlaceSystemError('scope-wall', 'Address and photo records require a separate explicit House package.');
  }
  return freeze({
    schema: 'gummy.house-intent-preview/v1',
    intent: intent.trim(),
    sentRecordIds: selected.map(record => record.recordId),
    withheldRecordIds: records.filter(record => !selectedRecordIds.includes(record.recordId)).map(record => record.recordId),
    executionState: 'preview',
    executing: false
  });
}

export function createHouseCommit(preview, { intentNote, consequenceNote, approvedBy }) {
  if (preview?.executionState !== 'preview') throw new PlaceSystemError('preview-required', 'Open the Intent Gate first.');
  if (!intentNote?.trim() || !consequenceNote?.trim()) {
    throw new PlaceSystemError('two-note-commit', 'Both intent and consequence notes are required.');
  }
  if (!approvedBy?.startsWith('actor:')) throw new PlaceSystemError('approval-required', 'A Human Actor must approve the House commit.');
  return freeze({
    schema: 'gummy.house-commit/v1',
    preview: clone(preview),
    intentNote: intentNote.trim(),
    consequenceNote: consequenceNote.trim(),
    approvedBy,
    status: 'committed-local',
    externalExecution: false
  });
}

export function validateAndEstimateWorld(plan) {
  const validation = validateWorldPlan(plan);
  const estimate = estimateWorld(plan);
  return freeze({ validation, estimate });
}

export function duplicateWorldPlan(plan, { id, title }) {
  validateWorldPlan(plan);
  return freeze({
    ...clone(plan),
    id,
    title: title || `${plan.title} copy`,
    revision: 1,
    duplicatedFrom: { id: plan.id, revision: plan.revision },
    createdAt: new Date().toISOString()
  });
}

export function createPrivateTableExport(records) {
  const safeRecords = records
    .filter(record => !/address-grant/i.test(record.recordType))
    .map(record => ({ ...clone(record), value: removeAddress(record.value) }));
  return freeze({
    schema: 'gummy.table-export/v1',
    records: safeRecords,
    exactAddressIncluded: false,
    discoverable: false,
    balanceIncluded: false,
    exportedAt: new Date().toISOString()
  });
}

function removeAddress(value) {
  if (Array.isArray(value)) return value.map(removeAddress);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !/address|latitude|longitude|gps/i.test(key))
    .map(([key, child]) => [key, removeAddress(child)]));
}

export function reviseRadioEpisode(episode, scriptText) {
  if (!scriptText?.trim()) throw new PlaceSystemError('script-required', 'A script revision cannot be empty.');
  return freeze({
    ...clone(episode),
    script: {
      revision: Number(episode?.script?.revision || 0) + 1,
      text: scriptText.trim(),
      approved: false,
      approvedAt: null
    },
    voiceApproval: { approved: false },
    exportApproval: { approved: false },
    publishApproval: { approved: false }
  });
}

export function approveRadioScript(episode, approvedBy) {
  if (!episode?.script?.text) throw new PlaceSystemError('script-required', 'Create a script revision first.');
  if (!approvedBy?.startsWith('actor:')) throw new PlaceSystemError('approval-required', 'A Human Actor must approve the exact script revision.');
  return freeze({
    ...clone(episode),
    script: { ...clone(episode.script), approved: true, approvedBy, approvedAt: new Date().toISOString() }
  });
}

export function createRadioExport(episode) {
  if (!episode?.script?.approved) throw new PlaceSystemError('script-approval-required', 'Approve the exact script revision first.');
  if (episode?.sourcePackage?.privacy === 'public') throw new PlaceSystemError('unexpected-public-source', 'Radio local export expects private or participant-scoped source material.');
  return freeze({
    schema: 'gummy.radio-export/v1',
    episodeId: episode.id,
    title: episode.title,
    sourcePackage: clone(episode.sourcePackage),
    script: clone(episode.script),
    mode: 'private-package',
    browserSpeechIsFinalAudio: false,
    published: false,
    exportedAt: new Date().toISOString()
  });
}

export function nextFairParticipant(participants, currentParticipantId = null) {
  if (!participants.length) throw new PlaceSystemError('room-empty', 'Add at least one participant.');
  const index = participants.findIndex(participant => participant.id === currentParticipantId);
  return freeze(participants[(index + 1 + participants.length) % participants.length]);
}
