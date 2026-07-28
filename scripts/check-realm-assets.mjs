import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const manifest = JSON.parse(await readFile(path.join(root, 'public/brand/gummy/realm/manifest.json'), 'utf8'));
const failures = [];
const digest = buffer => createHash('sha256').update(buffer).digest('hex');

if (manifest.schema !== 'gummy.realm-assets/v1') failures.push('unsupported realm asset manifest schema');
if (manifest.world?.expressions?.join(',') !== 'night,day') failures.push('exact Night/Day expression pair is missing');
if (manifest.selectedGlopperCandidate !== 'candidate-c') failures.push('selected Glopper candidate is not recorded');

for (const output of manifest.outputs) {
  const file = path.join(root, 'public', output.path.replace(/^\//, ''));
  try {
    const [buffer, metadata, info] = await Promise.all([readFile(file), sharp(file).metadata(), stat(file)]);
    if (metadata.width !== output.width || metadata.height !== output.height) {
      failures.push(`${output.path}: ${metadata.width}x${metadata.height} != ${output.width}x${output.height}`);
    }
    if (digest(buffer) !== output.sha256) failures.push(`${output.path}: hash mismatch`);
    if (info.size !== output.bytes) failures.push(`${output.path}: byte count mismatch`);
    if (output.budgetBytes && info.size > output.budgetBytes) failures.push(`${output.path}: exceeds ${output.budgetBytes} bytes`);
    if (output.role.includes('transparent') && !metadata.hasAlpha) failures.push(`${output.path}: alpha channel missing`);
  } catch (error) {
    failures.push(`${output.path}: ${error.message}`);
  }
}

for (const required of [
  'lantern-chamber-night-1280x720.avif',
  'lantern-chamber-day-1280x720.avif',
  'lantern-chamber-night-mobile-828x1472.avif',
  'lantern-chamber-day-mobile-828x1472.avif',
  'lantern-chamber-night-lqip.webp',
  'lantern-chamber-day-lqip.webp'
]) {
  if (!manifest.outputs.some(item => item.path.endsWith(required))) failures.push(`required derivative missing: ${required}`);
}

for (const mode of ['night', 'day']) {
  const master = path.join(root, `design/source/gummy-realm/lantern-chamber/${mode}/lantern-chamber-${mode}-master-3840x2160.png`);
  const metadata = await sharp(master).metadata().catch(() => ({}));
  if (metadata.width !== 3840 || metadata.height !== 2160) failures.push(`${mode} 4K preservation master is missing or wrong`);
}

for (const master of [
  'glopper-standing-three-quarter-master.png',
  'glopper-peeking-master.png',
  'glopper-chat-bust-master.png'
]) {
  const metadata = await sharp(path.join(root, 'design/source/gummy-realm/glopper/accepted', master)).metadata().catch(() => ({}));
  if (!metadata.hasAlpha || Math.max(metadata.width || 0, metadata.height || 0) < 2048) {
    failures.push(`${master}: transparent 2048px master requirement failed`);
  }
}

const sourceText = await Promise.all([
  readFile(path.join(root, 'src/app.js'), 'utf8'),
  readFile(path.join(root, 'src/styles/shell.css'), 'utf8'),
  readFile(path.join(root, 'src/styles/components.css'), 'utf8'),
  readFile(path.join(root, 'src/brand/gummy-realm-assets.js'), 'utf8').catch(() => '')
]);
if (/https?:\/\/[^'")\s]+\.(?:png|jpe?g|webp|avif)/i.test(sourceText.join('\n'))) {
  failures.push('remote runtime image URL detected');
}

if (failures.length) {
  console.error(failures.map(item => `- ${item}`).join('\n'));
  process.exit(1);
}

const desktop = manifest.outputs.find(item => item.path.endsWith('lantern-chamber-night-1280x720.avif'));
const phone = manifest.outputs.find(item => item.path.endsWith('lantern-chamber-night-mobile-828x1472.avif'));
console.log(`Realm asset check passed: ${manifest.outputs.length} files; desktop hero ${desktop.bytes} bytes; phone hero ${phone.bytes} bytes.`);
