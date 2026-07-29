import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { securityHeaders } from '../server/api.mjs';

test('production security headers deny embedding and ambient access while allowing only explicit same-origin media prompts', () => {
  const headers = securityHeaders();
  assert.match(headers['content-security-policy'], /default-src 'self'/);
  assert.match(headers['content-security-policy'], /script-src 'self'/);
  assert.match(headers['content-security-policy'], /connect-src 'self'/);
  assert.match(headers['content-security-policy'], /http:\/\/127\.0\.0\.1:5214/);
  assert.match(headers['content-security-policy'], /http:\/\/localhost:5214/);
  assert.doesNotMatch(headers['content-security-policy'], /connect-src[^;]*\*/);
  assert.match(headers['content-security-policy'], /frame-ancestors 'none'/);
  assert.match(headers['content-security-policy'], /object-src 'none'/);
  assert.equal(headers['x-frame-options'], 'DENY');
  assert.equal(headers['x-content-type-options'], 'nosniff');
  assert.equal(headers['cross-origin-opener-policy'], 'same-origin-allow-popups');
  assert.equal(headers['permissions-policy'], 'camera=(self), display-capture=(self), geolocation=(), microphone=(self)');
});

test('Vercel delivery carries the same CSP plus transport, immutable asset, crawler, and real-404 policy', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  const global = Object.fromEntries(config.headers[0].headers.map(item => [item.key.toLowerCase(), item.value]));
  const assets = Object.fromEntries(config.headers[1].headers.map(item => [item.key.toLowerCase(), item.value]));
  const shell = Object.fromEntries(config.headers.find(item => item.source === '/').headers.map(item => [item.key.toLowerCase(), item.value]));
  const robots = Object.fromEntries(config.headers.find(item => item.source === '/robots.txt').headers.map(item => [item.key.toLowerCase(), item.value]));
  const sitemap = Object.fromEntries(config.headers.find(item => item.source === '/sitemap.xml').headers.map(item => [item.key.toLowerCase(), item.value]));
  const llms = Object.fromEntries(config.headers.find(item => item.source === '/llms.txt').headers.map(item => [item.key.toLowerCase(), item.value]));
  assert.match(global['content-security-policy'], /frame-ancestors 'none'/);
  assert.match(global['strict-transport-security'], /max-age=63072000/);
  assert.equal(global['x-frame-options'], 'DENY');
  assert.equal(
    global['cross-origin-opener-policy'],
    'same-origin-allow-popups',
    'Human-opened standalone Place windows must retain their exact-origin receipt channel'
  );
  assert.equal(assets['cache-control'], 'public, max-age=31536000, immutable');
  assert.equal(shell['cache-control'], 'no-store');
  assert.equal(robots['cache-control'], 'public, max-age=3600');
  assert.equal(sitemap['cache-control'], 'public, max-age=3600');
  assert.match(llms['cache-control'], /must-revalidate/);
  assert.equal(config.routes, undefined, 'legacy routes must not bypass the top-level security headers');
  assert.deepEqual(config.redirects, [{
    source: '/:path*',
    has: [{ type: 'host', value: 'mygum.my' }],
    destination: 'https://www.mygum.my/:path*',
    permanent: true
  }]);
  assert.deepEqual(config.rewrites, [
    { source: '/api/(.*)', destination: '/api/[...path].mjs' },
    { source: '/changelog', destination: '/changelog.html' }
  ]);
  assert.equal(
    config.rewrites.some(rule => rule.destination === '/index.html'),
    false,
    'unknown paths must return genuine 404 responses rather than the application shell'
  );
});

test('external preview remains sandboxed and every new-tab link is opener-safe', async () => {
  const [appSource, browserSource] = await Promise.all([
    readFile(new URL('../src/app.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/apps/browser-surface.js', import.meta.url), 'utf8')
  ]);
  assert.match(browserSource, /sandbox: 'allow-scripts allow-forms allow-popups'/);
  assert.doesNotMatch(browserSource, /sandbox: '[^']*allow-same-origin/);
  for (const match of appSource.matchAll(/target: '_blank'[^}\n]*/g)) {
    assert.match(match[0], /rel: '(?:noopener noreferrer|noreferrer)'/);
  }
});

test('release scanner is portable and preserves first-paint and lazy feature budgets', async () => {
  const source = await readFile(new URL('../scripts/release-hardening.mjs', import.meta.url), 'utf8');
  assert.match(source, /async function listSourceFiles/);
  assert.match(source, /Initial JavaScript entry exceeds 264 KiB budget/);
  assert.match(source, /Phase 16 lazy JavaScript exceeds 60 KiB budget/);
  assert.match(source, /Composer lazy JavaScript exceeds 72 KiB budget/);
  assert.match(source, /Gummy Box lazy JavaScript exceeds 24 KiB budget/);
  assert.match(source, /Total lazy-loaded JavaScript exceeds 520 KiB budget/);
  assert.match(source, /CSS bundle exceeds 68 KiB budget/);
  assert.match(source, /initial-entry ceiling stays unchanged/);
  assert.doesNotMatch(source, /execFileSync\(['"]rg['"]/);
});
