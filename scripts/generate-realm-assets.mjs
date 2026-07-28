import { createHash } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const sourceRoot = path.join(root, 'design/source/gummy-realm');
const realmRoot = path.join(root, 'public/brand/gummy/realm');
const actorRoot = path.join(root, 'public/brand/gummy/actors');
const productionRoot = path.join(root, 'public/brand/gummy/productions');
const socialRoot = path.join(root, 'public/brand/gummy/social');
const evidenceRoot = path.join(root, 'evidence');
const contactRoot = path.join(sourceRoot, 'lantern-chamber/contact-sheets');

for (const directory of [realmRoot, actorRoot, productionRoot, socialRoot, evidenceRoot, contactRoot]) {
  await mkdir(directory, { recursive: true });
}

const outputs = [];
const sourceRecords = [];
const intentionalEnlargements = [];
const rel = file => path.relative(root, file).replaceAll(path.sep, '/');
const digest = buffer => createHash('sha256').update(buffer).digest('hex');

async function recordSource(file, role, extra = {}) {
  const buffer = await readFile(file);
  const metadata = await sharp(buffer).metadata();
  sourceRecords.push({
    path: rel(file),
    role,
    sha256: digest(buffer),
    width: metadata.width,
    height: metadata.height,
    hasAlpha: metadata.hasAlpha,
    rights: 'repository-owned phase-13 generated source',
    ...extra
  });
  return { buffer, metadata };
}

async function emit(image, file, { role, format, width, height, budgetBytes = null }) {
  let pipeline = image.clone();
  if (format === 'png') pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true });
  if (format === 'webp') pipeline = pipeline.webp({ quality: 66, effort: 6, smartSubsample: true });
  if (format === 'avif') pipeline = pipeline.avif({ quality: 50, effort: 7, chromaSubsampling: '4:2:0' });
  await pipeline.toFile(file);
  const [buffer, metadata, info] = await Promise.all([
    readFile(file),
    sharp(file).metadata(),
    stat(file)
  ]);
  if (metadata.width !== width || metadata.height !== height) {
    throw new Error(`${rel(file)} emitted ${metadata.width}x${metadata.height}; expected ${width}x${height}`);
  }
  if (budgetBytes && info.size > budgetBytes) {
    throw new Error(`${rel(file)} is ${info.size} bytes; budget is ${budgetBytes}`);
  }
  outputs.push({
    path: `/${rel(file).replace(/^public\//, '')}`,
    role,
    format,
    width,
    height,
    bytes: info.size,
    sha256: digest(buffer),
    hasAlpha: metadata.hasAlpha,
    budgetBytes
  });
}

async function environmentFamily(mode) {
  const source = path.join(sourceRoot, `lantern-chamber/${mode}/lantern-chamber-${mode}-source.png`);
  const master = path.join(sourceRoot, `lantern-chamber/${mode}/lantern-chamber-${mode}-master-3840x2160.png`);
  const { metadata } = await recordSource(source, `${mode} Lantern Chamber immutable imagegen source`, {
    workflow: mode === 'day' ? 'built-in imagegen identity-preserving lighting edit' : 'built-in imagegen generation',
    providerSeed: 'provider-managed; not exposed by built-in imagegen'
  });
  intentionalEnlargements.push({
    source: rel(source),
    from: `${metadata.width}x${metadata.height}`,
    to: '3840x2160',
    method: 'sharp lanczos3 explicit preservation-master enlargement',
    reason: 'built-in imagegen exposes no output-size control; the untouched source remains hash-recorded'
  });
  await sharp(source)
    .resize(3840, 2160, { fit: 'cover', position: 'centre', kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(master);
  await recordSource(master, `${mode} Lantern Chamber 4K preservation master`, {
    derivedFrom: rel(source),
    enlargementDocumented: true
  });

  for (const [width, height] of [[2560, 1440], [1920, 1080], [1440, 810], [1280, 720], [960, 540]]) {
    for (const format of ['avif', 'webp']) {
      const file = path.join(realmRoot, `lantern-chamber-${mode}-${width}x${height}.${format}`);
      const budgetBytes = width === 1280 && format === 'avif' ? 420 * 1024 : null;
      await emit(sharp(master).resize(width, height, { fit: 'cover' }), file, {
        role: `${mode} responsive Lantern Chamber`,
        format,
        width,
        height,
        budgetBytes
      });
    }
  }

  for (const [width, height] of [[1080, 1920], [828, 1472]]) {
    for (const format of ['avif', 'webp']) {
      const file = path.join(realmRoot, `lantern-chamber-${mode}-mobile-${width}x${height}.${format}`);
      const budgetBytes = width === 828 && format === 'avif' ? 260 * 1024 : null;
      await emit(sharp(master).resize(width, height, { fit: 'cover', position: 'west' }), file, {
        role: `${mode} art-directed mobile Lantern Chamber`,
        format,
        width,
        height,
        budgetBytes
      });
    }
  }

  await emit(
    sharp(master).resize(64, 36, { fit: 'cover' }).blur(2.4),
    path.join(realmRoot, `lantern-chamber-${mode}-lqip.webp`),
    { role: `${mode} Lantern Chamber low-quality placeholder`, format: 'webp', width: 64, height: 36 }
  );
}

await environmentFamily('night');
await environmentFamily('day');

const characterSources = {
  'glopper-standing-three-quarter': path.join(sourceRoot, 'glopper/accepted/glopper-standing-three-quarter-source.png'),
  'glopper-peeking': path.join(sourceRoot, 'glopper/accepted/glopper-peeking-source.png'),
  'glopper-chat-bust': path.join(sourceRoot, 'glopper/accepted/glopper-chat-bust-source.png')
};

for (const [name, source] of Object.entries(characterSources)) {
  const { metadata } = await recordSource(source, `${name} immutable transparent imagegen/chroma-key source`, {
    workflow: 'built-in imagegen identity-preserving generation plus local chroma-key removal',
    selectedIdentity: 'candidate-c',
    providerSeed: 'provider-managed; not exposed by built-in imagegen'
  });
  const portrait = name !== 'glopper-chat-bust';
  const masterWidth = portrait ? Math.round((metadata.width / metadata.height) * 2048) : 2048;
  const masterHeight = 2048;
  const master = path.join(sourceRoot, `glopper/accepted/${name}-master.png`);
  intentionalEnlargements.push({
    source: rel(source),
    from: `${metadata.width}x${metadata.height}`,
    to: `${masterWidth}x${masterHeight}`,
    method: 'sharp lanczos3 explicit preservation-master enlargement with alpha',
    reason: 'required long-edge character master; untouched keyed and alpha sources remain hash-recorded'
  });
  await sharp(source)
    .resize(masterWidth, masterHeight, { fit: 'contain', kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(master);
  await recordSource(master, `${name} transparent preservation master`, {
    derivedFrom: rel(source),
    enlargementDocumented: true
  });

  const sizes = name === 'glopper-chat-bust' ? [1024, 512, 256, 128, 96, 64] : [1024, 512, 256, 128];
  for (const size of sizes) {
    for (const format of ['avif', 'webp']) {
      await emit(
        sharp(master).resize(size, size, {
          fit: 'contain',
          position: name === 'glopper-peeking' ? 'southeast' : 'centre',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }),
        path.join(actorRoot, `${name}-${size}.${format}`),
        { role: `${name} transparent runtime cutout`, format, width: size, height: size }
      );
    }
  }
}

const portalSources = {
  'imagehoss-portal': path.join(sourceRoot, 'actor-portals/imagehoss-light-table-source.png'),
  'videoboss-portal': path.join(sourceRoot, 'actor-portals/videoboss-projection-bay-source.png'),
  'meshmallow-portal': path.join(sourceRoot, 'actor-portals/meshmallow-form-workshop-source.png')
};

const glopperEnvironment = path.join(sourceRoot, 'actor-portals/glopper-guide-alcove-environment-source.png');
await recordSource(glopperEnvironment, 'Glopper Guide Alcove environment-only source', {
  workflow: 'built-in imagegen generation using Night Lantern Chamber reference',
  providerSeed: 'provider-managed; not exposed by built-in imagegen'
});
const glopperMaster = path.join(sourceRoot, 'glopper/accepted/glopper-standing-three-quarter-master.png');
const glopperPortalMaster = path.join(sourceRoot, 'actor-portals/glopper-guide-alcove-master.png');
const glopperCutout = await sharp(glopperMaster).resize({ height: 790 }).toBuffer();
await sharp(glopperEnvironment)
  .resize(1600, 900, { fit: 'cover' })
  .composite([{ input: glopperCutout, gravity: 'southeast' }])
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(glopperPortalMaster);
await recordSource(glopperPortalMaster, 'Glopper Guide Alcove composited portal master', {
  derivedFrom: [rel(glopperEnvironment), rel(glopperMaster)]
});
portalSources['glopper-portal'] = glopperPortalMaster;

for (const [name, source] of Object.entries(portalSources)) {
  if (name !== 'glopper-portal') {
    await recordSource(source, `${name} imagegen source`, {
      workflow: 'built-in imagegen generation using Night Lantern Chamber reference',
      providerSeed: 'provider-managed; not exposed by built-in imagegen'
    });
  }
  const master = name === 'glopper-portal'
    ? source
    : path.join(sourceRoot, `actor-portals/${name.replace('-portal', '')}-master.png`);
  if (name !== 'glopper-portal') {
    await sharp(source).resize(1600, 900, { fit: 'cover' }).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(master);
    await recordSource(master, `${name} 1600x900 portal master`, { derivedFrom: rel(source) });
  }
  for (const [width, height] of [[960, 540], [640, 360]]) {
    for (const format of ['avif', 'webp']) {
      await emit(sharp(master).resize(width, height, { fit: 'cover' }), path.join(actorRoot, `${name}-${width}x${height}.${format}`), {
        role: `${name} lazy-loaded portal`,
        format,
        width,
        height
      });
    }
  }
}

const nightMaster = path.join(sourceRoot, 'lantern-chamber/night/lantern-chamber-night-master-3840x2160.png');
for (const [name, width, height, position] of [
  ['night-gummy-launch-1600x900', 1600, 900, 'centre'],
  ['night-gummy-launch-1200x900', 1200, 900, 'west'],
  ['night-gummy-launch-900x900', 900, 900, 'west'],
  ['untitled-production-1200x900', 1200, 900, 'east']
]) {
  for (const format of ['avif', 'webp']) {
    await emit(sharp(nightMaster).resize(width, height, { fit: 'cover', position }), path.join(productionRoot, `${name}.${format}`), {
      role: name.startsWith('untitled') ? 'quiet architecture-only Production cover' : 'Night Gummy Launch Production cover',
      format,
      width,
      height
    });
  }
}

const candidateIds = ['a', 'b', 'c'];
const candidateComposites = [];
for (const [index, id] of candidateIds.entries()) {
  const source = path.join(sourceRoot, `glopper/candidates/glopper-candidate-${id}.png`);
  const { buffer } = await recordSource(source, `Glopper candidate ${id.toUpperCase()} transparent source`, {
    workflow: 'built-in imagegen plus local chroma-key removal',
    providerSeed: 'provider-managed; not exposed by built-in imagegen',
    status: id === 'c' ? 'selected' : 'rejected'
  });
  candidateComposites.push({
    input: await sharp(buffer).resize(460, 690, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }).toBuffer(),
    left: 70 + index * 570,
    top: 100
  });
}
const contactLabels = `
  <svg width="1800" height="900" xmlns="http://www.w3.org/2000/svg">
    <rect width="1800" height="900" fill="#100817"/>
    <text x="70" y="58" fill="#FFF1C7" font-size="30" font-family="sans-serif" font-weight="700">Phase 13 · Glopper bounded candidates</text>
    <text x="70" y="850" fill="#FFF1C7" opacity=".72" font-size="18" font-family="monospace">Built-in imagegen · provider-managed seed not exposed · candidate C selected for preview</text>
    ${candidateIds.map((id, index) => `<text x="${70 + index * 570}" y="820" fill="${id === 'c' ? '#F2B544' : '#FFF1C7'}" font-size="24" font-family="sans-serif" font-weight="700">Candidate ${id.toUpperCase()}${id === 'c' ? ' · SELECTED' : ' · REJECTED'}</text>`).join('')}
  </svg>`;
const contactSheet = path.join(contactRoot, 'phase13-glopper-candidates.png');
await sharp(Buffer.from(contactLabels)).composite(candidateComposites).png({ compressionLevel: 9 }).toFile(contactSheet);
await recordSource(contactSheet, 'Glopper candidate contact sheet');

const desktopScreenshot = path.join(root, 'artifacts/evidence/phase13-desktop-night-two-windows.png');
try {
  await stat(desktopScreenshot);
  const screenshotCard = await sharp(desktopScreenshot)
    .resize(900, 562, { fit: 'cover', position: 'centre' })
    .extend({ top: 8, bottom: 8, left: 8, right: 8, background: '#F2B544' })
    .toBuffer();
  const lockup = await sharp(path.join(root, 'public/brand/gummy/source/gummy-lockup-horizontal-master.png'))
    .resize({ width: 300 })
    .toBuffer();
  for (const [name, width, height] of [
    ['gummy-og-1200x630', 1200, 630],
    ['gummy-social-1200x675', 1200, 675],
    ['gummy-poster-1080x1350', 1080, 1350],
    ['gummy-press-1920x1080', 1920, 1080]
  ]) {
    const base = sharp(nightMaster).resize(width, height, { fit: 'cover', position: width < height ? 'west' : 'centre' });
    const cardWidth = width < height ? width - 120 : Math.min(900, width - 160);
    const card = await sharp(screenshotCard).resize({ width: cardWidth }).toBuffer();
    const logo = await sharp(lockup).resize({ width: Math.min(300, width - 120) }).toBuffer();
    const cardMeta = await sharp(card).metadata();
    await emit(
      base.composite([
        { input: card, left: Math.round((width - cardMeta.width) / 2), top: Math.round(height * (width < height ? .39 : .18)) },
        { input: logo, left: 60, top: 44 }
      ]),
      path.join(socialRoot, `${name}.webp`),
      { role: 'real integrated product screenshot social composition', format: 'webp', width, height }
    );
  }
} catch {
  // Social derivatives are intentionally deferred until the real integrated screenshot exists.
}

const manifest = {
  schema: 'gummy.realm-assets/v1',
  version: 'phase-13-lantern-chamber-v1',
  generatedAt: new Date().toISOString(),
  baselineCommit: '00115aae2dcec1908a9f355b61c85e7b21468c8a',
  palette: ['#4B187A', '#7C2FD0', '#F2B544', '#FFF1C7', '#100817'],
  world: {
    id: 'lantern-chamber',
    expressions: ['night', 'day'],
    cameraLock: 'same architecture and camera; Day is a lighting-state edit of Night'
  },
  selectedGlopperCandidate: 'candidate-c',
  sourceRecords,
  intentionalEnlargements,
  outputs
};
await writeFile(path.join(realmRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(path.join(actorRoot, 'manifest.json'), `${JSON.stringify({
  schema: manifest.schema,
  version: manifest.version,
  selectedGlopperCandidate: manifest.selectedGlopperCandidate,
  outputs: outputs.filter(item => item.path.includes('/actors/'))
}, null, 2)}\n`);
await writeFile(path.join(evidenceRoot, 'phase13-visual-asset-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Generated ${outputs.length} runtime assets from ${sourceRecords.length} hash-recorded sources.`);
