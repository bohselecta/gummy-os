import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';

const manifest = JSON.parse(await readFile(new URL('../public/brand/gummy/realm/manifest.json', import.meta.url)));

test('Phase 13 realm manifest locks one world to Night and Day expressions', () => {
  assert.equal(manifest.schema, 'gummy.realm-assets/v1');
  assert.equal(manifest.world.id, 'lantern-chamber');
  assert.deepEqual(manifest.world.expressions, ['night', 'day']);
  assert.equal(manifest.selectedGlopperCandidate, 'candidate-c');
  assert.deepEqual(manifest.palette, ['#4B187A', '#7C2FD0', '#F2B544', '#FFF1C7', '#100817']);
});

test('Phase 13 initial hero requests remain under hard delivery budgets', () => {
  for (const suffix of [
    'lantern-chamber-night-1280x720.avif',
    'lantern-chamber-day-1280x720.avif'
  ]) {
    const asset = manifest.outputs.find(item => item.path.endsWith(suffix));
    assert.ok(asset, suffix);
    assert.ok(asset.bytes <= 420 * 1024, `${suffix}: ${asset.bytes}`);
  }
  for (const suffix of [
    'lantern-chamber-night-mobile-828x1472.avif',
    'lantern-chamber-day-mobile-828x1472.avif'
  ]) {
    const asset = manifest.outputs.find(item => item.path.endsWith(suffix));
    assert.ok(asset, suffix);
    assert.ok(asset.bytes <= 260 * 1024, `${suffix}: ${asset.bytes}`);
  }
});

test('Phase 13 masters and truthful social composition inputs are local', async () => {
  for (const relative of [
    '../design/source/gummy-realm/lantern-chamber/night/lantern-chamber-night-master-3840x2160.png',
    '../design/source/gummy-realm/lantern-chamber/day/lantern-chamber-day-master-3840x2160.png',
    '../design/source/gummy-realm/glopper/accepted/glopper-standing-three-quarter-master.png',
    '../design/source/gummy-realm/lantern-chamber/contact-sheets/phase13-glopper-candidates.png'
  ]) {
    assert.ok((await stat(new URL(relative, import.meta.url))).size > 0, relative);
  }
  const code = await readFile(new URL('../src/brand/gummy-realm-assets.js', import.meta.url), 'utf8');
  assert.doesNotMatch(code, /https?:\/\//);
});
