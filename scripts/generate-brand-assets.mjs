import { mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import { faviconAssets, sourceAssets } from './brand-asset-manifest.mjs';

const sourceRoot = resolve('public/brand/gummy/source');
const webRoot = resolve('public/brand/gummy/web');
const faviconRoot = resolve('public/brand/gummy/favicons');

await Promise.all([mkdir(webRoot, { recursive: true }), mkdir(faviconRoot, { recursive: true })]);

for (const { source, web, webSize: [width, height] } of sourceAssets) {
  await sharp(join(sourceRoot, source))
    .resize({ width, height, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100, smartSubsample: true, effort: 6 })
    .toFile(join(webRoot, web));
}

for (const { source, target, size } of faviconAssets) {
  await sharp(join(sourceRoot, source))
    .resize({ width: size, height: size, fit: 'contain', withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(join(faviconRoot, target));
}

console.log(`Generated ${sourceAssets.length} responsive WebP assets in ${webRoot}`);
console.log(`Generated ${faviconAssets.length} browser and PWA icons in ${faviconRoot}`);
