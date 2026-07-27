import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';

const sourceDirectory = 'design/source/gummy-utility-tiles-legacy';
const derivativeDirectory = 'public/brand/gummy/utility-tiles';
const sourceManifest = JSON.parse(await readFile(join(sourceDirectory, 'manifest.json'), 'utf8'));
const derivativeManifest = JSON.parse(await readFile(join(derivativeDirectory, 'manifest.json'), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

if (sourceManifest.assets.length !== 7 || derivativeManifest.assets.length !== 7) {
  throw new Error('The utility tile system must contain exactly seven unique founder masters.');
}
if (derivativeManifest.sourceArchiveSha256 !== 'c635a5ff0980531d5c18083639d50dea1245072a868a744f640f4ba7246905cc') {
  throw new Error('Utility derivatives do not identify the verified founder source archive.');
}

const expectedIds = sourceManifest.assets.map(asset => asset.id).sort();
const actualIds = derivativeManifest.assets.map(asset => asset.id).sort();
if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) throw new Error('Utility derivative IDs differ from the founder manifest.');

const sourceEntries = await readdir(sourceDirectory, { withFileTypes: true });
const pngs = sourceEntries.filter(entry => entry.isFile() && extname(entry.name) === '.png').map(entry => entry.name).sort();
const expectedPngs = sourceManifest.assets.map(asset => asset.sourceFile).sort();
if (JSON.stringify(pngs) !== JSON.stringify(expectedPngs)) {
  throw new Error(`Utility source directory contains unapproved PNGs: ${pngs.join(', ')}`);
}
if (sourceEntries.some(entry => entry.name === '__MACOSX' || entry.name === 'screenshot-placeholder.png')) {
  throw new Error('Excluded placeholder or AppleDouble material entered the product asset tree.');
}

for (const source of sourceManifest.assets) {
  const sourceBytes = await readFile(join(sourceDirectory, source.sourceFile));
  const sourceMetadata = await sharp(sourceBytes).metadata();
  if (hash(sourceBytes) !== source.sha256) throw new Error(`${source.sourceFile} no longer matches the founder master.`);
  if (sourceMetadata.width !== source.width || sourceMetadata.height !== source.height || !sourceMetadata.hasAlpha) {
    throw new Error(`${source.sourceFile} dimensions or alpha changed.`);
  }

  const generated = derivativeManifest.assets.find(asset => asset.id === source.id);
  if (generated.sourceSha256 !== source.sha256 || generated.sourceFile !== source.sourceFile) {
    throw new Error(`${source.id} derivative provenance is invalid.`);
  }
  for (const size of ['64', '96', '192']) {
    const derivative = generated.derivatives[size];
    const derivativeBytes = await readFile(join(derivativeDirectory, basename(derivative.path)));
    const metadata = await sharp(derivativeBytes).metadata();
    if (hash(derivativeBytes) !== derivative.sha256) throw new Error(`${derivative.path} hash mismatch.`);
    if (!metadata.hasAlpha || metadata.width !== derivative.width || metadata.height !== derivative.height) {
      throw new Error(`${derivative.path} dimensions or alpha changed.`);
    }
    if (Math.abs((source.width / source.height) - (metadata.width / metadata.height)) > 0.02) {
      throw new Error(`${derivative.path} changed the founder aspect ratio.`);
    }
  }
}

const registry = await readFile('src/brand/gummy-utility-tiles.js', 'utf8');
for (const source of sourceManifest.assets) {
  if (!registry.includes(source.id) || !registry.includes(source.sha256)) {
    throw new Error(`Typed utility registry is missing ${source.id} provenance.`);
  }
}

const styles = `${await readFile('src/styles.css', 'utf8')}\n${await readFile('src/production.css', 'utf8')}`;
if (/--[\w-]*(?:attach|agent|bowl|deliver|setup|vision|progress)[\w-]*(?:color|hue|fill)|--[\w-]*(?:color|hue|fill)[\w-]*(?:attach|agent|bowl|deliver|setup|vision|progress)/i.test(styles)) {
  throw new Error('Utility artwork colors must not become Gummy OS brand tokens.');
}

const app = await readFile('src/app.js', 'utf8');
const barSource = app.slice(app.indexOf('async function renderBar'), app.indexOf('async function toggleMode'));
if (/utilityTile|gummy\.utility\.|utility-tiles/.test(barSource)) {
  throw new Error('The Gummy Bar must not become a seven-tile utility rainbow.');
}

for (const excluded of ['screenshot-placeholder.png', '__MACOSX/*']) {
  if (!derivativeManifest.excluded.some(item => item.sourceFile === excluded)) {
    throw new Error(`Derivative manifest lost exclusion ruling for ${excluded}.`);
  }
}

console.log('Founder utility tiles passed seven-master provenance, hash, alpha, aspect, registry, semantic, and Gummy Bar checks.');
