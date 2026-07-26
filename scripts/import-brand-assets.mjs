import { createHash } from 'node:crypto';
import { access, copyFile, mkdir, readFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

const sourceRoot = resolve(process.argv[2] || 'gummy-production-brand-assets/source');
const targetRoot = resolve('public/brand/gummy/source');

const assets = [
  {
    canonical: 'gummy-mascot-head-master.png',
    aliases: ['gummy-final-head-mark.png'],
    sha256: '78a0c9e79f04d451214dde2a02deded724fd130f78bd25e6d044cf5b469e8778'
  },
  {
    canonical: 'gummy-lockup-horizontal-master.png',
    aliases: ['GUMMY-final-horizontal.png'],
    sha256: '8add90bde3dd717384f517aa24f174091ff9ff9c7a360c2cae1284899f6af704'
  },
  {
    canonical: 'gummy-wordmark-master.png',
    aliases: ['gummy-final-text.png'],
    sha256: 'c736c38780eba24c08e0ffb70cd9d1e3f08ea2398ade0d4fa8ceda253f1f72c6'
  },
  {
    canonical: 'gummy-lockup-vertical-master.png',
    aliases: ['GUMMY-final-vertical.png'],
    sha256: 'e53dc4abef4dc94113ef3b23bc9acb34005ba7a25722d84ed5c3dfe32c542449'
  },
  {
    canonical: 'gummy-mark-head-square.png',
    aliases: ['icon1.png'],
    sha256: '7869aa12e4ff182c93aa2941c796d016d1822b59c976b1b2fdfe898edf26c9f6'
  },
  {
    canonical: 'gummy-app-icon-detailed-square.png',
    aliases: ['icon2.png'],
    sha256: '3cadb21ad08b0d78900648b0f64ba74b10d7372f9f02033aa06b4b0d9871da15'
  },
  {
    canonical: 'gummy-app-icon-flat-round.png',
    aliases: ['icon3.png'],
    sha256: '4c03dfd8ae413af93ce6721f465ad67d31b6756d4a02ce7431c73c97e2a42c49'
  },
  {
    canonical: 'gummy-app-icon-monogram.png',
    aliases: ['icon4.png'],
    sha256: 'bd6b00a8dd10b257429f72c941cd981e1ab45092d74733f3663b45ad91888385'
  }
];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function sha256(path) {
  return createHash('sha256').update(await readFile(path)).digest('hex');
}

async function findSource(asset) {
  for (const name of [asset.canonical, ...asset.aliases]) {
    const path = join(sourceRoot, name);
    if (await exists(path)) return path;
  }
  return null;
}

await mkdir(targetRoot, { recursive: true });

const imported = [];
for (const asset of assets) {
  const source = await findSource(asset);
  if (!source) {
    throw new Error(`Missing ${asset.canonical}. Looked in ${sourceRoot} using aliases: ${asset.aliases.join(', ')}`);
  }

  const actual = await sha256(source);
  if (actual !== asset.sha256) {
    throw new Error(`${basename(source)} failed integrity verification. Expected ${asset.sha256}; received ${actual}.`);
  }

  const target = join(targetRoot, asset.canonical);
  await copyFile(source, target);
  const copied = await sha256(target);
  if (copied !== asset.sha256) throw new Error(`Copy verification failed for ${asset.canonical}.`);
  imported.push(asset.canonical);
}

console.log(`Imported ${imported.length} locked Gummy production masters into ${targetRoot}`);
for (const name of imported) console.log(`- ${name}`);
console.log('Next: generate web derivatives/favicons and run the production brand acceptance addendum.');