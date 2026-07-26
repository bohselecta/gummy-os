import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { faviconAssets, sourceAssets } from './brand-asset-manifest.mjs';

const sourceRoot = 'public/brand/gummy/source';
const webRoot = 'public/brand/gummy/web';
const faviconRoot = 'public/brand/gummy/favicons';

function hash(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

assert.deepEqual(
  (await readdir(sourceRoot)).sort(),
  sourceAssets.map(asset => asset.source).sort(),
  'The source directory must contain exactly the eight locked PNG masters.'
);
assert.deepEqual(
  (await readdir(webRoot)).sort(),
  sourceAssets.map(asset => asset.web).sort(),
  'The web directory must contain exactly the eight deterministic WebP derivatives.'
);
assert.deepEqual(
  (await readdir(faviconRoot)).sort(),
  faviconAssets.map(asset => asset.target).sort(),
  'The favicon directory must contain exactly the required browser and PWA sizes.'
);

for (const asset of sourceAssets) {
  const sourcePath = join(sourceRoot, asset.source);
  const sourceBytes = await readFile(sourcePath);
  assert.equal(hash(sourceBytes), asset.sha256, `${asset.source} no longer matches the founder-approved master.`);
  const source = await sharp(sourceBytes).metadata();
  assert.deepEqual([source.width, source.height], asset.sourceSize, `${asset.source} dimensions changed.`);
  assert.equal(source.format, 'png');
  assert.equal(source.hasAlpha, true, `${asset.source} must preserve its alpha channel.`);

  const web = await sharp(join(webRoot, asset.web)).metadata();
  assert.deepEqual([web.width, web.height], asset.webSize, `${asset.web} dimensions changed.`);
  assert.equal(web.format, 'webp');
  assert.equal(web.width / web.height, source.width / source.height, `${asset.web} distorted the master aspect ratio.`);
}

for (const asset of faviconAssets) {
  const icon = await sharp(join(faviconRoot, asset.target)).metadata();
  assert.deepEqual([icon.width, icon.height], [asset.size, asset.size], `${asset.target} has the wrong dimensions.`);
  assert.equal(icon.format, 'png');
}

const [app, index, vite, styles] = await Promise.all([
  readFile('src/app.js', 'utf8'),
  readFile('index.html', 'utf8'),
  readFile('vite.config.js', 'utf8'),
  Promise.all([
    readFile('src/styles/shell.css', 'utf8'),
    readFile('src/styles/components.css', 'utf8'),
    readFile('src/styles/responsive.css', 'utf8')
  ]).then(parts => parts.join('\n'))
]);

for (const forbidden of ['temporary-mark', 'brand-glyph', 'temporary artwork slot', 'Temporary Gummy wordmark']) {
  assert.equal(`${index}\n${app}`.includes(forbidden), false, `Production UI still contains ${forbidden}.`);
}
assert.match(app, /import \{ gummyAssets \} from '\.\/brand\/gummy-assets\.js';/);
assert.equal(app.includes('/brand/gummy/'), false, 'Application brand paths must come from the centralized asset map.');
assert.match(index, /gummy-app-icon-monogram\.webp/);
assert.match(index, /apple-touch-icon\.png/);
assert.match(vite, /pwa-192x192\.png/);
assert.match(vite, /pwa-512x512\.png/);
assert.equal(/hue-rotate|(^|[;{]\s*)filter\s*:/m.test(styles), false, 'Production artwork must not be recolored or filtered in CSS.');

console.log('Production Gummy assets passed integrity, dimensions, runtime-path, metadata, and placeholder checks.');
