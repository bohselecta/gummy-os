import assert from 'node:assert/strict';
import test from 'node:test';
import { PRODUCT_STATE_COPY, stateCopy } from '../src/core/product-copy.js';

test('terminal and capability copy always explains impact and safe next state', () => {
  assert.deepEqual(Object.keys(PRODUCT_STATE_COPY), [
    'ready',
    'unavailable',
    'blocked',
    'denied',
    'failed',
    'cancelled',
    'recovery',
    'awaitingAcceptance',
    'accepted'
  ]);
  for (const entry of Object.values(PRODUCT_STATE_COPY)) {
    assert.ok(entry.title.length > 3);
    assert.match(entry.detail, /[.!]$/);
  }
  assert.match(stateCopy('denied').detail, /Nothing ran/);
  assert.match(stateCopy('failed').detail, /sources.*unchanged/i);
  assert.match(stateCopy('recovery').detail, /instead of submitting a duplicate/i);
  assert.equal(stateCopy('unknown'), PRODUCT_STATE_COPY.failed);
});
