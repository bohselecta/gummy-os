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
  assert.equal(headers['permissions-policy'], 'camera=(self), display-capture=(self), geolocation=(), microphone=(self)');
});

test('Vercel static delivery carries the same CSP plus transport and immutable asset policy', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  const global = Object.fromEntries(config.headers[0].headers.map(item => [item.key.toLowerCase(), item.value]));
  const assets = Object.fromEntries(config.headers[1].headers.map(item => [item.key.toLowerCase(), item.value]));
  const shell = Object.fromEntries(config.headers[2].headers.map(item => [item.key.toLowerCase(), item.value]));
  assert.match(global['content-security-policy'], /frame-ancestors 'none'/);
  assert.match(global['strict-transport-security'], /max-age=63072000/);
  assert.equal(global['x-frame-options'], 'DENY');
  assert.equal(assets['cache-control'], 'public, max-age=31536000, immutable');
  assert.equal(shell['cache-control'], 'no-store');
  assert.equal(config.routes, undefined, 'legacy routes must not bypass the top-level security headers');
  assert.deepEqual(config.redirects, [{
    source: '/:path*',
    has: [{ type: 'host', value: 'mygum.my' }],
    destination: 'https://www.mygum.my/:path*',
    permanent: true
  }]);
  assert.deepEqual(config.rewrites, [
    { source: '/api/(.*)', destination: '/api/[...path].mjs' },
    { source: '/(.*)', destination: '/index.html' }
  ]);
});

test('external preview remains sandboxed and every new-tab link is opener-safe', async () => {
  const source = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(source, /h\('iframe', \{ title: 'Isolated external preview', sandbox: ''/);
  for (const match of source.matchAll(/target: '_blank'[^}\n]*/g)) {
    assert.match(match[0], /rel: '(?:noopener noreferrer|noreferrer)'/);
  }
});

test('release scanner is portable and preserves first-paint and lazy feature budgets', async () => {
  const source = await readFile(new URL('../scripts/release-hardening.mjs', import.meta.url), 'utf8');
  assert.match(source, /async function listSourceFiles/);
  assert.match(source, /Initial JavaScript entry exceeds 264 KiB budget/);
  assert.match(source, /Total lazy-loaded JavaScript exceeds 380 KiB budget/);
  assert.match(source, /first-paint ceiling remains unchanged/);
  assert.doesNotMatch(source, /execFileSync\(['"]rg['"]/);
});
