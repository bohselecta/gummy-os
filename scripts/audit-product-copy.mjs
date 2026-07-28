import { readFile } from 'node:fs/promises';

const paths = [
  'src/app.js',
  'src/core/product-copy.js',
  'src/apps/production.js',
  'src/apps/actor-surface.js',
  'src/apps/master-control.js',
  'src/apps/places.js',
  'src/places/place-doctrines.js',
  'public/registry/first-party-applications.json',
  'public/registry/product-map.json',
  'public/registry/gummy-places.json'
];
const text = (await Promise.all(paths.map(path => readFile(path, 'utf8')))).join('\n');
const requirements = [
  'Your creative computer, with you in control.',
  'Start a blank Production',
  'Open the Night Gummy Launch sample',
  'Nothing runs until',
  'Meshmallow',
  'Runtime not connected',
  'Nothing ran.',
  'The attempt failed',
  'Cancelled',
  'Provider outcome needs recovery',
  'Results are ready',
  'Accepted',
  'Gummy Channels',
  'Wardrobe',
  'House',
  'Worlds',
  'Table',
  'Radio',
  'Only Places you pin appear in the Gummy Bar.'
];
const missing = requirements.filter(value => !text.includes(value));
if (missing.length) throw new Error(`Product copy audit missing: ${missing.join(', ')}`);

const forbidden = [
  ['public 3D-Bee address', /@3D-Bee/],
  ['generic terminal error', /Something went wrong/i],
  ['execution by opening', /opening (?:it|this) (?:runs|executes|generates)/i]
];
for (const [label, pattern] of forbidden) {
  if (pattern.test(text)) throw new Error(`Product copy audit found ${label}: ${pattern}`);
}
console.log(`Product copy audit passed: ${requirements.length} required messages across ${paths.length} release surfaces.`);
