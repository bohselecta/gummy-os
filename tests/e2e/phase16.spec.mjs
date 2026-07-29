import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openMoreItem } from './support/calm-navigation.mjs';

async function onboard(page, name = 'Phase 16 Tester') {
  await page.goto('/');
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill(name);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
  await expect(page.getByRole('region', { name: 'Gummy Canvas' })).toBeVisible();
}

async function openCommandCenter(page) {
  await openMoreItem(page, 'Command Center');
  const commandCenter = page.getByRole('region', { name: 'Command Center window' });
  await expect(commandCenter.getByTestId('phase16-command-center')).toBeVisible();
  return commandCenter;
}

async function databaseSnapshot(page) {
  return page.evaluate(async () => {
    const request = indexedDB.open('gummy-os');
    const database = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const stores = [
      'socialInstances',
      'sharedVisions',
      'productionAgreements',
      'productionPools',
      'contributionLedgers',
      'productionFormations',
      'distributionPlans',
      'distributionReleases',
      'productionRuns',
      'returns',
      'receipts'
    ];
    const result = {};
    for (const storeName of stores) {
      const transaction = database.transaction(storeName, 'readonly');
      result[storeName] = await new Promise((resolve, reject) => {
        const read = transaction.objectStore(storeName).getAll();
        read.onsuccess = () => resolve(read.result);
        read.onerror = () => reject(read.error);
      });
    }
    database.close();
    return result;
  });
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

test('saved Social Instance restores five truthful windows and resumes as a new Session', async ({ page }) => {
  await onboard(page);
  let commandCenter = await openCommandCenter(page);
  const layout = commandCenter.getByTestId('phase16-layout-preview');
  await expect(layout.locator('.phase16-layout-window')).toHaveCount(5);
  await expect(layout.locator('[data-window-state="minimized"]')).toHaveCount(1);
  await expect(commandCenter.getByTestId('phase16-presence-hayden')).toHaveAttribute('data-presence-state', 'human-live');
  await expect(commandCenter.getByTestId('phase16-presence-contributor-b')).toHaveAttribute('data-presence-state', 'ai-represented');
  await expect(commandCenter.getByTestId('phase16-presence-contributor-c')).toHaveAttribute('data-presence-state', 'static');
  await expect(commandCenter.getByTestId('phase16-presence-contributor-d')).toHaveAttribute('data-presence-state', 'offline');

  await commandCenter.getByTestId('phase16-open-group').click();
  const groupWindows = page.locator('.gummy-window[data-window-id^="social-window:"]');
  await expect(groupWindows).toHaveCount(5);
  await expect(page.locator('.gummy-window[data-window-id^="social-window:"][hidden]')).toHaveCount(1);
  await expect(page.getByTestId('phase16-shared-thread')).toContainText('Private budget details remain explicitly excluded');
  await expect(page.getByTestId('phase16-shared-thread')).toContainText('Explicitly excluded');

  await openMoreItem(page, 'Command Center');
  await expect(page.locator('.gummy-window[data-window-id="command-center"]')).toHaveAttribute('data-focused', 'true');
  commandCenter = page.getByRole('region', { name: 'Command Center window' });
  await commandCenter.getByRole('button', { name: 'Close group windows' }).click();
  await expect(groupWindows).toHaveCount(0);

  await page.reload();
  commandCenter = page.getByRole('region', { name: 'Command Center window' });
  await commandCenter.getByTestId('phase16-open-group').click();
  await expect(page.locator('.gummy-window[data-window-id^="social-window:"]')).toHaveCount(5);
  await page.reload();
  await expect(page.locator('.gummy-window[data-window-id^="social-window:"]')).toHaveCount(5);
  await page.getByRole('tab', { name: 'Command Center' }).click();
  await expect(page.locator('.gummy-window[data-window-id="command-center"]')).toHaveAttribute('data-focused', 'true');
  commandCenter = page.getByRole('region', { name: 'Command Center window' });
  await commandCenter.getByRole('button', { name: 'Continue where we left off' }).click();
  await expect(page.locator('.toast-layer')).toContainText('Resumed session:friday-brainstorm:2');

  const snapshot = await databaseSnapshot(page);
  expect(snapshot.socialInstances).toHaveLength(1);
  expect(snapshot.socialInstances[0].latestSessionId).toBe('session:friday-brainstorm:2');
  expect(snapshot.socialInstances[0].originatingSessionId).toBe('session:friday-brainstorm:1');
});

test('complete journey forms, runs, accepts, and releases only one explicit destination', async ({ page }) => {
  await onboard(page);
  let commandCenter = await openCommandCenter(page);
  let before = await databaseSnapshot(page);
  expect(before.sharedVisions).toHaveLength(0);
  expect(before.productionRuns).toHaveLength(0);
  expect(before.distributionReleases).toHaveLength(0);

  await commandCenter.getByTestId('phase16-run-proof').click();
  await expect(page.locator('.toast-layer')).toContainText('Phase 16 local proof completed', { timeout: 20_000 });
  commandCenter = page.getByRole('region', { name: 'Command Center window' });
  await expect(commandCenter.locator('.phase16-progress-complete')).toHaveCount(11);
  await expect(commandCenter.getByTestId('phase16-pool')).toContainText('$4.00');
  await expect(commandCenter.getByTestId('phase16-pool')).toContainText('$3.00');
  await expect(commandCenter.getByTestId('phase16-pool')).toContainText('$2.50');
  await expect(commandCenter.getByTestId('phase16-pool')).toContainText('Actual charge · $0.00');
  await expect(commandCenter.getByTestId('phase16-distribution').locator('[data-destination="radio"]')).toContainText('Nothing published');
  await expect(commandCenter.getByTestId('phase16-distribution').locator('[data-destination="channels"]')).toContainText('Nothing published');
  await expect(commandCenter.getByTestId('phase16-distribution').locator('[data-destination="private-export"]')).toContainText('released');
  await expect(commandCenter.getByTestId('phase16-attention')).toContainText('Executing: false');

  const after = await databaseSnapshot(page);
  expect(after.sharedVisions).toHaveLength(1);
  expect(after.productionAgreements).toHaveLength(1);
  expect(after.productionPools).toHaveLength(2);
  expect(after.contributionLedgers).toHaveLength(1);
  expect(after.productionFormations).toHaveLength(1);
  expect(after.productionFormations[0].immutable).toBe(true);
  expect(after.productionRuns).toHaveLength(1);
  expect(after.productionRuns[0].status).toBe('completed');
  expect(after.returns.length).toBeGreaterThanOrEqual(4);
  expect(after.receipts.length).toBeGreaterThanOrEqual(4);
  expect(after.distributionPlans).toHaveLength(3);
  expect(after.distributionReleases).toHaveLength(1);
  expect(after.distributionReleases[0].destination.type).toBe('private-export');
  expect(after.distributionReleases[0].cost.amount).toBe(0);

  await page.reload();
  commandCenter = page.getByRole('region', { name: 'Command Center window' });
  await expect(commandCenter.locator('.phase16-progress-complete')).toHaveCount(11);
  await expect(commandCenter).toContainText('production:friday-brainstorm-film · accepted');
});

test('Command Center is accessible on desktop and phone with reduced motion', async ({ page }) => {
  await onboard(page);
  let commandCenter = await openCommandCenter(page);
  let results = await new AxeBuilder({ page }).exclude('iframe').analyze();
  expect(results.violations).toEqual([]);

  await page.setViewportSize({ width: 320, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openMoreItem(page, 'Command Center');
  commandCenter = page.getByRole('region', { name: 'Command Center window' });
  await expect(commandCenter.getByTestId('phase16-command-center')).toBeVisible();
  await expect(commandCenter.getByTestId('phase16-layout-preview')).toBeVisible();
  results = await new AxeBuilder({ page }).exclude('iframe').analyze();
  expect(results.violations).toEqual([]);
});
