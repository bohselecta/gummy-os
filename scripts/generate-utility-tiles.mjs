import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';

const sourceDirectory = 'design/source/gummy-utility-tiles-legacy';
const outputDirectory = 'public/brand/gummy/utility-tiles';
const sizes = [64, 96, 192];
const slugs = Object.freeze({
  'gummy.utility.attach': 'attach',
  'gummy.utility.agent': 'agent',
  'gummy.utility.bowl': 'bowl',
  'gummy.utility.deliver': 'deliver',
  'gummy.utility.setup': 'setup',
  'gummy.utility.vision': 'vision',
  'gummy.utility.progress': 'progress'
});

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const sourceManifest = JSON.parse(await readFile(path.join(sourceDirectory, 'manifest.json'), 'utf8'));
await mkdir(outputDirectory, { recursive: true });

const assets = [];
for (const asset of sourceManifest.assets) {
  const sourcePath = path.join(sourceDirectory, asset.sourceFile);
  const bytes = await readFile(sourcePath);
  const sourceHash = sha256(bytes);
  if (sourceHash !== asset.sha256) throw new Error(`${asset.sourceFile} hash mismatch`);
  const sourceMetadata = await sharp(bytes).metadata();
  if (sourceMetadata.width !== asset.width || sourceMetadata.height !== asset.height) {
    throw new Error(`${asset.sourceFile} dimensions do not match the founder manifest`);
  }
  if (!sourceMetadata.hasAlpha) throw new Error(`${asset.sourceFile} must retain alpha`);

  const derivatives = {};
  for (const size of sizes) {
    const fileName = `${slugs[asset.id]}-${size}.webp`;
    const outputPath = path.join(outputDirectory, fileName);
    await sharp(bytes)
      .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 90, alphaQuality: 100, effort: 6, smartSubsample: false })
      .toFile(outputPath);
    const derivativeBytes = await readFile(outputPath);
    const metadata = await sharp(derivativeBytes).metadata();
    if (!metadata.hasAlpha) throw new Error(`${fileName} lost alpha`);
    const sourceRatio = asset.width / asset.height;
    const derivativeRatio = metadata.width / metadata.height;
    if (Math.abs(sourceRatio - derivativeRatio) > 0.02) throw new Error(`${fileName} changed aspect ratio`);
    derivatives[String(size)] = {
      path: `/brand/gummy/utility-tiles/${fileName}`,
      width: metadata.width,
      height: metadata.height,
      sha256: sha256(derivativeBytes),
      hasAlpha: metadata.hasAlpha
    };
  }
  assets.push({
    id: asset.id,
    label: asset.defaultLabel,
    sourceFile: asset.sourceFile,
    sourcePath: `/${sourceDirectory}/${asset.sourceFile}`,
    sourceSha256: sourceHash,
    sourceWidth: asset.width,
    sourceHeight: asset.height,
    derivatives
  });
}

const duplicate = sourceManifest.excluded.find(item => item.sourceFile === 'screenshot-placeholder.png');
if (!duplicate || duplicate.sha256 !== sourceManifest.assets.find(item => item.id === 'gummy.utility.setup').sha256) {
  throw new Error('Duplicate placeholder ruling is missing or inconsistent');
}

const outputManifest = {
  schema: 'gummy.utility-tile-derivatives/v1',
  sourceArchive: sourceManifest.sourceArchive,
  sourceArchiveSha256: 'c635a5ff0980531d5c18083639d50dea1245072a868a744f640f4ba7246905cc',
  generation: {
    tool: `sharp/${sharp.versions.sharp}`,
    format: 'webp',
    quality: 90,
    alphaQuality: 100,
    effort: 6,
    fit: 'inside'
  },
  assets,
  excluded: sourceManifest.excluded
};
await writeFile(path.join(outputDirectory, 'manifest.json'), `${JSON.stringify(outputManifest, null, 2)}\n`);
console.log(`Generated ${assets.length * sizes.length} deterministic utility tile derivatives.`);
