import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const publicTitle = 'Gummy OS — Your creative computer, with you in control.';
const publicDescription = 'Your creative computer, with you in control. Start locally with no account. Nothing runs until you review it and choose Make Production.';

test('public delivery exposes real crawler files and no universal soft-404 rewrite', async () => {
  const [vercelSource, robots, sitemap] = await Promise.all([
    read('vercel.json'),
    read('public/robots.txt'),
    read('public/sitemap.xml')
  ]);
  const vercel = JSON.parse(vercelSource);

  assert.ok(vercel.rewrites.some(rule => rule.source === '/api/(.*)' && rule.destination === '/api/[...path].mjs'));
  assert.equal(
    vercel.rewrites.some(rule => rule.destination === '/index.html' && ['/(.*)', '/:path*'].includes(rule.source)),
    false,
    'unknown paths must not be rewritten to the application shell'
  );
  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Disallow: \/api\/$/m);
  assert.match(robots, /^Sitemap: https:\/\/www\.mygum\.my\/sitemap\.xml$/m);
  assert.match(sitemap, /<loc>https:\/\/www\.mygum\.my\/<\/loc>/);
});

test('public shell uses one product position and user-facing boot copy', async () => {
  const html = await read('index.html');

  assert.match(html, new RegExp(`<title>${publicTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</title>`));
  assert.equal((html.match(new RegExp(publicDescription.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length, 3);
  assert.match(html, /<meta name="robots" content="index,follow,max-image-preview:large" \/>/);
  assert.match(html, /<h1>Your creative computer, with you in control\.<\/h1>/);
  assert.match(html, /<p>Picking up where you left off…<\/p>/);
  assert.doesNotMatch(html, /Personal Gummy|Checking your durable state|Human-controlled work|Enter a living personal creative computer/);
});

test('loopback CSP allowance remains an explicit reviewed compatibility decision', async () => {
  const [vercelSource, decision] = await Promise.all([
    read('vercel.json'),
    read('docs/release/PUBLIC-DELIVERY-DECISION-2026-07-29.md')
  ]);
  const vercel = JSON.parse(vercelSource);
  const globalHeaders = vercel.headers.find(rule => rule.source === '/(.*)')?.headers || [];
  const csp = globalHeaders.find(header => header.key === 'Content-Security-Policy')?.value || '';

  assert.match(csp, /http:\/\/127\.0\.0\.1:5214/);
  assert.match(csp, /http:\/\/localhost:5214/);
  assert.match(decision, /retained deliberately/i);
  assert.match(decision, /not a vulnerability/i);
});
