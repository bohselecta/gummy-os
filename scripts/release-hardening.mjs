import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';

const secretPatterns = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['openai-key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/],
  ['github-token', /\b(?:github_pat_[A-Za-z0-9_]{30,}|ghp_[A-Za-z0-9]{30,})\b/],
  ['aws-access-key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/]
];
const sourceExtensions = new Set(['.js', '.mjs', '.json', '.md', '.html', '.css', '.yml', '.yaml']);
const ignoredDirectories = new Set(['.git', '.vercel', 'artifacts', 'build', 'coverage', 'node_modules']);

async function listSourceFiles(directory = '.') {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const path = directory === '.' ? entry.name : join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) paths.push(...await listSourceFiles(path));
    } else if (entry.isFile()) {
      paths.push(path);
    }
  }
  return paths;
}

const files = (await listSourceFiles())
  .filter(path => sourceExtensions.has(extname(path)))
  .filter(path => path !== 'scripts/release-hardening.mjs')
  .filter(path => !path.startsWith('artifacts/'));

const findings = [];
for (const path of files) {
  const info = await stat(path);
  if (info.size > 3 * 1024 * 1024) continue;
  const content = await readFile(path, 'utf8');
  for (const [name, pattern] of secretPatterns) {
    if (pattern.test(content)) findings.push(`${name}:${path}`);
  }
}
if (findings.length) throw new Error(`Secret scan blocked release: ${findings.join(', ')}`);

const assetNames = await readdir('build/assets');
const javascript = assetNames.filter(name => name.endsWith('.js'));
const styles = assetNames.filter(name => name.endsWith('.css'));
if (!javascript.length || !styles.length) throw new Error('Production bundle assets are missing');
const bundleText = (await Promise.all(javascript.map(name => readFile(join('build/assets', name), 'utf8')))).join('\n');
for (const marker of [
  'OPENAI_API_KEY',
  'GITHUB_PRIVATE_KEY',
  'GITHUB_APP_PRIVATE_KEY',
  'FAL_KEY',
  'session_token',
  '-----BEGIN PRIVATE KEY-----'
]) {
  if (bundleText.includes(marker)) throw new Error(`Browser bundle contains server-only marker: ${marker}`);
}
const maps = [
  ...assetNames.filter(name => name.endsWith('.map')),
  ...(await readdir('build')).filter(name => name.endsWith('.map'))
];
if (maps.length) throw new Error(`Production source maps must not ship: ${maps.join(', ')}`);

const total = async names => (await Promise.all(names.map(name => stat(join('build/assets', name))))).reduce((sum, info) => sum + info.size, 0);
const jsBytes = await total(javascript);
const cssBytes = await total(styles);
const shell = await readFile('build/index.html', 'utf8');
const entryName = shell.match(/assets\/(index-[^"]+\.js)/)?.[1];
if (!entryName) throw new Error('Production entry bundle is missing');
const entryBytes = (await stat(join('build/assets', entryName))).size;
if (entryBytes > 264 * 1024) throw new Error(`Initial JavaScript entry exceeds 264 KiB budget: ${entryBytes}`);
// Phase 15 adds seven durable, lazy-loaded Place cores. The first-paint ceiling remains unchanged;
// only the total lazy feature budget expands from 300 KiB to 380 KiB.
if (jsBytes > 380 * 1024) throw new Error(`Total lazy-loaded JavaScript exceeds 380 KiB budget: ${jsBytes}`);
if (cssBytes > 40 * 1024) throw new Error(`CSS bundle exceeds 40 KiB budget: ${cssBytes}`);

console.log(JSON.stringify({
  status: 'pass',
  sourceFilesScanned: files.length,
  browserBundle: {
    javascriptBytes: jsBytes,
    initialJavascriptBytes: entryBytes,
    cssBytes,
    sourceMaps: 0,
    serverOnlyMarkers: 0
  }
}));
