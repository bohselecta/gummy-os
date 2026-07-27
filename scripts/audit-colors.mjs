import { readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

const approved = new Set(['#4b187a', '#7c2fd0', '#f2b544', '#fff1c7', '#100817']);
const roots = ['index.html', 'src'];
const offenders = [];

async function visit(path) {
  const entries = await readdir(path, { withFileTypes: true }).catch(() => null);
  if (entries) {
    for (const entry of entries) await visit(join(path, entry.name));
    return;
  }
  if (!['.css', '.js', '.html', '.svg'].includes(extname(path))) return;
  const source = await readFile(path, 'utf8');
  for (const match of source.matchAll(/#[0-9a-f]{6}\b/gi)) {
    if (!approved.has(match[0].toLowerCase())) offenders.push(`${path}:${match[0]}`);
  }
}

for (const root of roots) await visit(root);
if (offenders.length) {
  console.error(`Unapproved production colors:\n${offenders.join('\n')}`);
  process.exitCode = 1;
} else {
  console.log('Brand color audit passed: exactly five approved literals.');
}
