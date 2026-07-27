import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function onboard(page, mode = 'night') {
  await page.goto('/');
  await page.getByTestId(`mode-${mode}`).click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Test User');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
  await expect(page.getByRole('region', { name: 'Gummy Canvas' })).toBeVisible();
}

test.beforeEach(async ({ context, page }) => {
  await context.clearCookies();
  page.runtimeErrors = [];
  page.on('pageerror', error => page.runtimeErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') page.runtimeErrors.push(message.text());
  });
});

test.afterEach(async ({ page }) => {
  expect(page.runtimeErrors).toEqual([]);
});

test('production Gummy identity is intact, responsive, addressable, and separate from Glopper', async ({ page, request }) => {
  await page.route('**/api/v1/session', async route => {
    await new Promise(resolve => setTimeout(resolve, 300));
    await route.continue();
  });
  await page.goto('/');
  const bootMark = page.locator('.boot-mark');
  await expect(bootMark).toBeVisible();
  await expect(bootMark).toHaveAttribute('src', '/brand/gummy/web/gummy-app-icon-monogram.webp');
  await expect(page.getByAltText('Gummy OS')).toBeVisible();
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Test User');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();

  const topbarBrand = page.getByRole('button', { name: 'Gummy OS — open Gummy guide' }).locator('img');
  await expect(topbarBrand).toBeVisible();
  expect(await topbarBrand.evaluate(image => ({
    currentSrc: image.currentSrc,
    natural: [image.naturalWidth, image.naturalHeight],
    fit: getComputedStyle(image).objectFit
  }))).toEqual({
    currentSrc: expect.stringContaining('/brand/gummy/web/gummy-lockup-horizontal.webp'),
    natural: [768, 512],
    fit: 'cover'
  });

  const guide = page.getByAltText('Gummy, the VR-goggled chimp guide');
  await expect(guide).toBeVisible();
  expect(await guide.evaluate(image => ({
    natural: [image.naturalWidth, image.naturalHeight],
    fit: getComputedStyle(image).objectFit
  }))).toEqual({ natural: [512, 768], fit: 'cover' });

  await page.getByRole('tab', { name: /Glopper/ }).click();
  await expect(page.getByRole('complementary', { name: 'Glopper Panel' }).locator('img[src*="/brand/gummy/"]')).toHaveCount(0);
  await expect(page.getByText(/temporary artwork slot/i)).toHaveCount(0);

  const requiredAssets = [
    '/brand/gummy/web/gummy-lockup-horizontal.webp',
    '/brand/gummy/web/gummy-mark-head-square.webp',
    '/brand/gummy/web/gummy-mascot-head.webp',
    '/brand/gummy/favicons/favicon-16x16.png',
    '/brand/gummy/favicons/favicon-32x32.png',
    '/brand/gummy/favicons/favicon-48x48.png',
    '/brand/gummy/favicons/apple-touch-icon.png',
    '/brand/gummy/favicons/pwa-192x192.png',
    '/brand/gummy/favicons/pwa-512x512.png'
  ];
  for (const path of requiredAssets) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.icons).toEqual(expect.arrayContaining([
    expect.objectContaining({ src: '/brand/gummy/favicons/pwa-192x192.png', sizes: '192x192' }),
    expect.objectContaining({ src: '/brand/gummy/favicons/pwa-512x512.png', sizes: '512x512' })
  ]));
});

test('onboarding, Night/Day continuity, Canvas windows, Bar keyboard, and accessibility', async ({ page }) => {
  await onboard(page, 'night');
  await expect(page.locator('html')).toHaveAttribute('data-gummy-mode', 'night');
  await page.getByRole('button', { name: 'Switch Night or Day Gummy' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-gummy-mode', 'day');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-gummy-mode', 'day');
  await expect(page.getByRole('tab', { name: /Glopper/ })).toBeVisible();
  await page.getByRole('tab', { name: /My Gummies/ }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: /Browser/ })).toBeFocused();
  await page.getByRole('tab', { name: /My Gummies/ }).click();
  await expect(page.getByRole('region', { name: 'My Gummies window' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('region', { name: 'My Gummies window' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Welcome to your Gummy window' })).toBeVisible();
  const results = await new AxeBuilder({ page }).exclude('iframe').analyze();
  expect(results.violations).toEqual([]);
});

test('simple doorway preserves the full product map and truthful first-party launches', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await onboard(page, 'night');
  await expect(page.getByRole('button', { name: /Start a blank Production/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Open the Night Gummy Launch sample/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Learn how Gummy OS works/ })).toBeVisible();
  await expect(page.getByRole('tab', { name: /Actors/ })).toBeVisible();
  await page.getByRole('tab', { name: /Applications/ }).click();

  const applications = page.getByTestId('first-party-applications');
  await expect(applications.locator('[data-application-id]')).toHaveCount(4);
  for (const name of ['VideoBoss', 'ImageHoss', 'Meshmallow', 'Gummy Rooms']) {
    await expect(applications.getByRole('heading', { name })).toBeVisible();
  }
  await expect(applications.getByRole('link', { name: 'Open VideoBoss' })).toHaveAttribute('target', '_blank');
  await expect(applications.getByText(/authenticated local ImageHoss bridge/)).toBeVisible();
  await expect(applications.getByText(/pair the authenticated Meshmallow supervisor/i)).toBeVisible();
  await expect(applications.getByText(/No authenticated Gummy Rooms service/)).toBeVisible();
  await expect(page.locator('[data-pillar-id]')).toHaveCount(8);
  await expect(page.getByText('Simplify the doorway. Do not flatten the house.')).toBeVisible();
  await expect(page.getByText(/Social computing may ship after the personal proof/)).toBeVisible();
});

test('approved Work Order produces separate result, Return, links, lease release, and Receipt', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: /Work Orders/ }).click();
  await page.getByTestId('approve-work-order').click();
  await expect(page.getByText('Result returned. Review the separate result Gummy')).toBeVisible();
  await page.getByRole('tab', { name: /My Gummies/ }).click();
  await expect(page.getByText('Gummy OS Standalone Executive Brief')).toBeVisible();
  await page.locator('.gummy-bar').getByRole('tab', { name: /Work Orders/ }).click();
  await page.getByRole('button', { name: 'Accept durable result' }).click();
  await expect(page.getByText('Human accepted this result')).toBeVisible();
  await page.locator('.gummy-bar').getByRole('tab', { name: /Receipts/ }).click();
  await expect(page.getByText('execute-bounded-transform')).toBeVisible();
  const durable = await page.evaluate(async () => {
    const request = indexedDB.open('gummy-os');
    const db = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const stores = ['gummies', 'returns', 'links', 'taskLeases', 'receipts'];
    const result = {};
    for (const store of stores) {
      const tx = db.transaction(store);
      result[store] = await new Promise((resolve, reject) => {
        const get = tx.objectStore(store).getAll();
        get.onsuccess = () => resolve(get.result);
        get.onerror = () => reject(get.error);
      });
    }
    return result;
  });
  expect(durable.gummies.filter(item => !item.extensions?.productionRuntime)).toHaveLength(2);
  expect(durable.gummies.filter(item => item.extensions?.productionRuntime)).toHaveLength(4);
  expect(durable.returns.at(-1).result).toBe('completed');
  expect(durable.links.map(link => link.type)).toEqual(expect.arrayContaining(['derived-from', 'created-by']));
  expect(durable.taskLeases.at(-1).status).toBe('completed');
  expect(durable.receipts.at(-1).canonicalHash).toMatch(/^[a-f0-9]{64}$/);
});

test('Hold preserves authority, Revise supersedes, and Reject returns terminal evidence', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: /Work Orders/ }).click();
  await page.getByRole('button', { name: 'Hold' }).click();
  await expect(page.getByText('held', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Revise' }).click();
  const selector = page.getByLabel('Choose a Work Order');
  await expect(selector.locator('option')).toHaveCount(2);
  await selector.selectOption({ index: 0 });
  await page.getByRole('button', { name: 'Reject' }).click();
  await expect(page.getByText('rejected', { exact: true })).toBeVisible();
  const records = await page.evaluate(async () => {
    const request = indexedDB.open('gummy-os');
    const db = await new Promise(resolve => { request.onsuccess = () => resolve(request.result); });
    const read = store => new Promise(resolve => {
      const get = db.transaction(store).objectStore(store).getAll();
      get.onsuccess = () => resolve(get.result);
    });
    return { orders: await read('workOrders'), returns: await read('returns'), receipts: await read('receipts') };
  });
  expect(records.orders.some(order => order.extensions?.supersedes === 'work-order:project-brief')).toBe(true);
  expect(records.returns.some(item => item.result === 'denied')).toBe(true);
  expect(records.receipts.some(item => item.outcome === 'denied')).toBe(true);
});

test('JSON Work Order import remains untrusted until schema and semantic validation pass', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: /Work Orders/ }).click();
  const imported = await page.evaluate(async () => {
    const request = indexedDB.open('gummy-os');
    const db = await new Promise(resolve => { request.onsuccess = () => resolve(request.result); });
    const order = await new Promise(resolve => {
      const get = db.transaction('workOrders').objectStore('workOrders').get('work-order:project-brief');
      get.onsuccess = () => resolve(get.result);
    });
    const timestamp = new Date().toISOString();
    return {
      ...order,
      id: `work-order:${crypto.randomUUID()}`,
      issuer: { type: 'model', id: 'model:frontier-planner', displayName: 'Frontier Planning Model', provider: 'disclosed-provider', model: 'disclosed-model' },
      status: 'proposed',
      createdAt: timestamp,
      updatedAt: timestamp,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      extensions: { importedProof: true }
    };
  });
  await page.locator('input[type="file"]').setInputFiles({ name: 'work-order.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(imported)) });
  await expect(page.locator('.toast-layer').getByText(/passed schema and semantic validation/)).toBeVisible();
  await expect(page.getByLabel('Choose a Work Order').locator('option')).toHaveCount(2);
  await expect(page.getByText('Frontier Planning Model · model')).toBeVisible();
});

test('unknown imports are quarantined, denied promotion is receipted, and burn is bounded', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: /My Gummies/ }).click();
  const picker = page.locator('input[type="file"]');
  await picker.setInputFiles({ name: 'unknown.md', mimeType: 'text/markdown', buffer: Buffer.from('# unknown') });
  await expect(page.getByText('quarantined', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Deny promotion' }).click();
  await expect(page.getByText('blocked', { exact: true })).toBeVisible();
  await picker.setInputFiles({ name: 'burn-me.txt', mimeType: 'text/plain', buffer: Buffer.from('disposable') });
  await expect(page.getByText('burn-me.txt', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Burn disposable imports' }).click();
  await expect(page.getByText('burn-me.txt', { exact: true })).toHaveCount(0);
  await page.locator('.gummy-bar').getByRole('tab', { name: /Receipts/ }).click();
  await expect(page.getByText('deny-quarantine-promotion')).toBeVisible();
  await expect(page.getByText('burn-disposable-workspace')).toBeVisible();
});

test('offline approval queues once and reconnect revalidates before execution', async ({ page, context }) => {
  await onboard(page);
  await page.getByRole('tab', { name: /Work Orders/ }).click();
  await context.setOffline(true);
  await page.getByTestId('approve-work-order').click();
  await expect(page.locator('.toast-layer').getByText(/queued and will be fully revalidated/)).toBeVisible();
  const queued = await page.evaluate(async () => {
    const request = indexedDB.open('gummy-os');
    const db = await new Promise(resolve => { request.onsuccess = () => resolve(request.result); });
    return new Promise(resolve => {
      const get = db.transaction('outbox').objectStore('outbox').getAll();
      get.onsuccess = () => resolve(get.result);
    });
  });
  expect(queued).toHaveLength(1);
  await context.setOffline(false);
  await expect(page.locator('.toast-layer').getByText(/Queued execution completed after revalidation/)).toBeVisible();
  await page.locator('.gummy-bar').getByRole('tab', { name: /My Gummies/ }).click();
  await expect(page.getByText('Gummy OS Standalone Executive Brief')).toBeVisible();
});

test('revocation blocks before provider, replacement Mold is additive, and two Actors compose', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: /Master Control/ }).click();
  await page.getByRole('button', { name: 'Revoke active Mold' }).click();
  await page.getByRole('button', { name: 'Prove provider-call block' }).click();
  await expect(page.locator('.toast-layer').getByText(/Revocation proof: blocked/)).toBeVisible();
  await page.getByRole('button', { name: 'Issue replacement Mold v2' }).click();
  await expect(page.locator('.toast-layer').getByText(/Replacement Mold v2 issued/)).toBeVisible();
  await page.getByRole('tab', { name: /Actors/ }).click();
  await page.getByRole('button', { name: 'Compose temporary private Bowl' }).click();
  await expect(page.getByText('Two-Actor Composition Proof')).toBeVisible();
});

test('phone Glopper panel is a bottom sheet and 320px layout remains operable', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await onboard(page);
  const compactBrand = page.getByRole('button', { name: 'Gummy OS — open Gummy guide' }).locator('img');
  await expect(compactBrand).toBeVisible();
  expect(await compactBrand.evaluate(image => ({
    currentSrc: image.currentSrc,
    natural: [image.naturalWidth, image.naturalHeight],
    fit: getComputedStyle(image).objectFit
  }))).toEqual({
    currentSrc: expect.stringContaining('/brand/gummy/web/gummy-mark-head-square.webp'),
    natural: [512, 512],
    fit: 'contain'
  });
  const phoneGuide = page.getByAltText('Gummy, the VR-goggled chimp guide');
  await phoneGuide.scrollIntoViewIfNeeded();
  const guideBox = await phoneGuide.boundingBox();
  expect(guideBox.y).toBeGreaterThanOrEqual(56);
  expect(guideBox.y + guideBox.height).toBeLessThanOrEqual(638);
  await page.getByRole('tab', { name: /Glopper/ }).click();
  const panel = page.getByRole('complementary', { name: 'Glopper Panel' });
  await expect(panel).toBeVisible();
  const box = await panel.boundingBox();
  expect(box.width).toBe(320);
  expect(box.y).toBeGreaterThan(100);
  await expect(page.getByRole('tab', { name: /Work Orders/ })).toBeVisible();
});
