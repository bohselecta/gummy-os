import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openMoreItem } from './support/calm-navigation.mjs';

async function onboard(page) {
  await page.goto('/');
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Test User');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
  await expect(page.getByRole('region', { name: 'Gummy Canvas' })).toBeVisible();
}

test('local Chromium performance budgets stay bounded', async ({ page }) => {
  await page.addInitScript(() => {
    window.__gummyPerformance = { lcp: 0, cls: 0, longTaskTotal: 0, longTaskCount: 0 };
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) window.__gummyPerformance.lcp = Math.max(window.__gummyPerformance.lcp, entry.startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__gummyPerformance.cls += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        window.__gummyPerformance.longTaskTotal += entry.duration;
        window.__gummyPerformance.longTaskCount += 1;
      }
    }).observe({ type: 'longtask', buffered: true });
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paints = Object.fromEntries(performance.getEntriesByType('paint').map(entry => [entry.name, entry.startTime]));
    const resources = performance.getEntriesByType('resource');
    return {
      ttfbMs: navigation.responseStart,
      domContentLoadedMs: navigation.domContentLoadedEventEnd,
      loadMs: navigation.loadEventEnd,
      fcpMs: paints['first-contentful-paint'] || 0,
      lcpMs: window.__gummyPerformance.lcp || paints['first-contentful-paint'] || 0,
      cls: window.__gummyPerformance.cls,
      longTaskTotalMs: window.__gummyPerformance.longTaskTotal,
      longTaskCount: window.__gummyPerformance.longTaskCount,
      resourceCount: resources.length,
      transferBytes: resources.reduce((sum, entry) => sum + Number(entry.transferSize || 0), 0)
    };
  });
  console.log(`GUMMY_PERFORMANCE ${JSON.stringify(metrics)}`);
  expect(metrics.ttfbMs).toBeLessThan(800);
  expect(metrics.fcpMs).toBeGreaterThan(0);
  expect(metrics.fcpMs).toBeLessThan(1800);
  expect(metrics.lcpMs).toBeLessThan(2500);
  expect(metrics.cls).toBeLessThan(0.1);
  expect(metrics.longTaskTotalMs).toBeLessThan(200);
  expect(metrics.resourceCount).toBeLessThan(30);
});

test('production workload, persistence, long-session, phone, and cached-shell budgets stay bounded', async ({ page, context }) => {
  const firstRunStarted = Date.now();
  await onboard(page);
  const firstRunMs = Date.now() - firstRunStarted;

  const hydration = await page.evaluate(async () => {
    const started = performance.now();
    const request = indexedDB.open('gummy-os');
    const database = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    let recordCount = 0;
    for (const name of database.objectStoreNames) {
      const records = await new Promise((resolve, reject) => {
        const operation = database.transaction(name).objectStore(name).getAll();
        operation.onsuccess = () => resolve(operation.result);
        operation.onerror = () => reject(operation.error);
      });
      recordCount += records.length;
    }
    database.close();
    return { durationMs: performance.now() - started, recordCount };
  });

  const beforeCycles = await page.evaluate(() => ({
    heapBytes: performance.memory?.usedJSHeapSize || 0,
    domNodes: document.querySelectorAll('*').length
  }));
  const cycleStarted = Date.now();
  for (let index = 0; index < 8; index += 1) {
    await page.getByRole('tab', { name: /My Gummies/ }).click();
    await page.getByRole('button', { name: 'Close My Gummies' }).click();
  }
  const windowCycleMs = Date.now() - cycleStarted;
  const afterCycles = await page.evaluate(() => ({
    heapBytes: performance.memory?.usedJSHeapSize || 0,
    domNodes: document.querySelectorAll('*').length
  }));

  await page.getByRole('tab', { name: /Productions/ }).click();
  const production = page.locator('[data-window-id="productions"]');
  const productionOpenStarted = Date.now();
  await production.getByRole('button', { name: 'Open the Night Gummy Launch sample' }).click();
  await expect(production.getByRole('heading', { name: 'Night Gummy Launch' })).toBeVisible();
  const productionOpenMs = Date.now() - productionOpenStarted;
  await expect.poll(() => page.evaluate(async () => {
    const request = indexedDB.open('gummy-os');
    const database = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const stored = await new Promise((resolve, reject) => {
      const operation = database.transaction('productions').objectStore('productions').get('production:night-gummy-launch');
      operation.onsuccess = () => resolve(operation.result);
      operation.onerror = () => reject(operation.error);
    });
    database.close();
    return Boolean(stored);
  })).toBe(true);

  const reopenStarted = Date.now();
  await page.reload();
  await page.getByRole('tab', { name: /Productions/ }).click();
  await expect(page.locator('[data-window-id="productions"]').getByRole('heading', { name: 'Night Gummy Launch' })).toBeVisible();
  const productionReopenMs = Date.now() - reopenStarted;

  await page.evaluate(async () => {
    const request = indexedDB.open('gummy-os');
    const database = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise((resolve, reject) => {
      const transaction = database.transaction('receipts', 'readwrite');
      const receipts = transaction.objectStore('receipts');
      for (let index = 0; index < 250; index += 1) {
        receipts.put({
          id: `receipt:performance:${String(index).padStart(3, '0')}`,
          action: 'performance-history-fixture',
          outcome: 'completed',
          operatorId: 'agent:glopper-web',
          createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString(),
          canonicalHash: String(index).padStart(64, '0').slice(-64),
          detail: 'Bounded local history rendering fixture.',
          extensions: { priorReceiptHash: index ? String(index - 1).padStart(64, '0').slice(-64) : null }
        });
      }
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    database.close();
  });
  const receiptRenderStarted = Date.now();
  await openMoreItem(page, /Receipts/);
  const receiptCards = page.locator('[data-window-id="receipts"] .record-list .card');
  await expect.poll(() => receiptCards.count()).toBeGreaterThanOrEqual(250);
  const receiptRenderMs = Date.now() - receiptRenderStarted;
  const receiptCount = await receiptCards.count();

  const asset = await page.evaluate(async () => {
    const started = performance.now();
    const response = await fetch(`/brand/gummy/web/gummy-mascot-head.webp?performance=${Date.now()}`);
    const bytes = (await response.arrayBuffer()).byteLength;
    return { durationMs: performance.now() - started, bytes, status: response.status };
  });

  await page.setViewportSize({ width: 320, height: 720 });
  const phoneInteractionStarted = Date.now();
  await openMoreItem(page, /About \/ Limits/);
  await expect(page.locator('[data-window-id="about"]').getByRole('heading', { name: 'Gummy OS 0.1' })).toBeVisible();
  const phoneInteractionMs = Date.now() - phoneInteractionStarted;

  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await page.reload();
  await expect(page.getByRole('navigation', { name: 'Gummy Bar' })).toBeVisible();
  await context.setOffline(true);
  const cachedShellStarted = Date.now();
  try {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('navigation', { name: 'Gummy Bar' })).toBeVisible();
  } finally {
    await context.setOffline(false);
  }
  const cachedShellMs = Date.now() - cachedShellStarted;

  const metrics = {
    firstRunMs,
    hydrationMs: hydration.durationMs,
    hydratedRecords: hydration.recordCount,
    windowCycleMs,
    heapGrowthBytes: beforeCycles.heapBytes && afterCycles.heapBytes
      ? Math.max(0, afterCycles.heapBytes - beforeCycles.heapBytes)
      : null,
    domNodeGrowth: afterCycles.domNodes - beforeCycles.domNodes,
    productionOpenMs,
    productionReopenMs,
    receiptRenderMs,
    receiptCount,
    assetLoadMs: asset.durationMs,
    assetBytes: asset.bytes,
    phoneInteractionMs,
    cachedShellMs
  };
  console.log(`GUMMY_WORKLOAD_PERFORMANCE ${JSON.stringify(metrics)}`);

  expect(firstRunMs).toBeLessThan(5000);
  expect(hydration.durationMs).toBeLessThan(500);
  expect(hydration.recordCount).toBeGreaterThan(25);
  expect(windowCycleMs).toBeLessThan(3000);
  if (metrics.heapGrowthBytes != null) expect(metrics.heapGrowthBytes).toBeLessThan(32 * 1024 * 1024);
  expect(metrics.domNodeGrowth).toBeLessThan(100);
  expect(productionOpenMs).toBeLessThan(1500);
  expect(productionReopenMs).toBeLessThan(2500);
  expect(receiptRenderMs).toBeLessThan(1500);
  expect(asset.status).toBe(200);
  expect(asset.bytes).toBeGreaterThan(10_000);
  expect(asset.durationMs).toBeLessThan(1000);
  expect(phoneInteractionMs).toBeLessThan(1000);
  expect(cachedShellMs).toBeLessThan(2500);
});

test('accessibility remains clean across modes, limits, desktop, tablet, and phone', async ({ page }) => {
  await onboard(page);
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
    { width: 320, height: 568 }
  ]) {
    await page.setViewportSize(viewport);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(item => ['critical', 'serious'].includes(item.impact))).toEqual([]);
    await expect(page.getByRole('navigation', { name: 'Gummy Bar' })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Switch Night or Day Gummy' }).click();
  let results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(item => ['critical', 'serious'].includes(item.impact))).toEqual([]);
  await openMoreItem(page, /About \/ Limits/);
  const about = page.locator('[data-window-id="about"]');
  await expect(about.getByText('Live ImageHoss output is not claimed')).toBeVisible();
  await expect(about.getByText('Live VideoBoss output is not claimed')).toBeVisible();
  await expect(about.getByText('Live Meshmallow .blend, preview, and export are not claimed')).toBeVisible();
  results = await new AxeBuilder({ page }).include('[data-window-id="about"]').analyze();
  expect(results.violations.filter(item => ['critical', 'serious'].includes(item.impact))).toEqual([]);
  await page.keyboard.press('Tab');
  const focus = await page.evaluate(() => {
    const style = getComputedStyle(document.activeElement);
    return { tag: document.activeElement.tagName, outline: style.outlineStyle, shadow: style.boxShadow };
  });
  expect(focus.tag).not.toBe('BODY');
  expect(focus.outline !== 'none' || focus.shadow !== 'none').toBe(true);
});

test('production responses expose security headers and terminal boot state', async ({ page }) => {
  const response = await page.goto('/');
  const headers = response.headers();
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  await expect(page.locator('#boot')).toHaveCount(0, { timeout: 5000 });
  await expect(page.getByRole('heading', { name: 'Your work should not disappear into AI chats.' })).toBeVisible();
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
});
