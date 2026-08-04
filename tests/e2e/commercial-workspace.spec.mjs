import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function onboard(page, name = 'Commercial Interface Tester') {
  await page.goto('/');
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill(name);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
  await expect(page.getByRole('region', { name: 'Gummy Canvas' })).toBeVisible();
}

async function databaseRecords(page, storeNames) {
  return page.evaluate(async names => {
    const request = indexedDB.open('gummy-os');
    const database = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const result = {};
    for (const name of names) {
      const transaction = database.transaction(name);
      result[name] = await new Promise((resolve, reject) => {
        const read = transaction.objectStore(name).getAll();
        read.onsuccess = () => resolve(read.result);
        read.onerror = () => reject(read.error);
      });
    }
    database.close();
    return result;
  }, storeNames);
}

async function addPaletteItem(composer, key, lane) {
  const item = composer.locator(`[data-palette-id="${key}"]`);
  await item.getByLabel(/Choose a lane for/).selectOption(lane);
  await item.getByRole('button', { name: 'Add' }).click();
  await composer.getByRole('dialog', { name: 'Composer proposal preview' }).getByRole('button', { name: 'Accept proposal' }).click();
}

test('Gummy Box is the unmistakable user-owned home workspace without weakening storage boundaries', async ({ page }) => {
  await onboard(page);
  const primaryLabels = await page.locator('.bar-primary .label').allTextContents();
  expect(primaryLabels).toEqual([
    'Gummy',
    'Gummy Box',
    'Composer',
    'Productions',
    'Command Center'
  ]);
  await page.getByRole('tab', { name: /Gummy Box/ }).click();
  const box = page.getByTestId('gummy-box');
  await expect(box.getByRole('heading', { name: 'Gummy Box' })).toBeVisible();
  await expect(box).toContainText('Your files, projects, results, and history');
  await expect(box).toContainText("Stored in this browser's Local Gummy Box.");
  for (const folder of ['Projects / Productions', 'Sources', 'Results', 'Receipts and history', 'Imports / Quarantine', 'Backups and connections']) {
    await expect(box.getByRole('button', { name: new RegExp(folder) })).toBeVisible();
  }
  await box.getByRole('button', { name: 'Grid' }).click();
  await expect(box.locator('.gummy-box-objects')).toHaveClass(/grid/);
  await box.getByLabel('Search Gummy Box').fill('project brief');
  await expect(box.locator('[data-gummy-id="gummy:project-brief"]')).toBeVisible();
  await box.locator('[data-gummy-id="gummy:project-brief"]').getByText('Show storage details').click();
  await expect(box).toContainText('IndexedDB record + OPFS bytes');
  await expect(box).toContainText('Native filesystem authority');
  const findings = await new AxeBuilder({ page }).include('[data-testid="gummy-box"]').analyze();
  expect(findings.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);
});

test('Composer saves, reloads, duplicates, edits, connects, restores, and applies without execution', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: 'Composer' }).click();
  const composerWindow = page.getByRole('region', { name: 'Composer window' });
  const composer = composerWindow.getByTestId('composer-surface');
  await expect(composer.getByTestId('composer-blank')).toBeVisible();
  await composer.getByRole('button', { name: 'Create a blank composition' }).click();

  await addPaletteItem(composer, 'gummy:gummy:night-gummy-launch-brief', 'inputs');
  const actorItem = composer.locator('[data-palette-id="actor:actor:imagehoss"]');
  await actorItem.dragTo(composer.locator('[data-lane="people-tools"]'));
  await composer.getByRole('dialog', { name: 'Composer proposal preview' }).getByRole('button', { name: 'Accept proposal' }).click();
  await addPaletteItem(composer, 'gate:human-acceptance', 'review-approval');
  await addPaletteItem(composer, 'destination:gummy-box', 'destinations');

  const source = composer.locator('[data-node-id]').filter({ hasText: 'Night Gummy Launch brief.md' });
  const actor = composer.locator('[data-node-id]').filter({ hasText: 'ImageHoss' });
  await source.getByRole('button', { name: 'Connect from here' }).click();
  await actor.getByRole('button', { name: 'Connect here' }).click();
  await composer.getByRole('dialog', { name: 'Composer proposal preview' }).getByRole('button', { name: 'Accept proposal' }).click();
  await expect(composer.locator('.composer-edge')).toHaveCount(1);

  await actor.getByRole('button', { name: 'Duplicate' }).click();
  await expect(composer.locator('[data-node-id]').filter({ hasText: 'ImageHoss copy' })).toBeVisible();
  await composer.getByRole('button', { name: 'Undo' }).click();
  await expect(composer.locator('[data-node-id]').filter({ hasText: 'ImageHoss copy' })).toHaveCount(0);
  await composer.getByRole('button', { name: 'Redo' }).click();
  await expect(composer.locator('[data-node-id]').filter({ hasText: 'ImageHoss copy' })).toBeVisible();
  await composer.locator('[data-node-id]').filter({ hasText: 'ImageHoss copy' }).getByRole('button', { name: 'Remove' }).click();

  await composer.getByRole('button', { name: 'Save', exact: true }).click();
  await composer.getByRole('button', { name: 'Reload', exact: true }).click();
  await expect(composer.locator('[data-node-id]').filter({ hasText: 'ImageHoss' }).first()).toBeVisible();
  await composer.locator('.composer-save-controls').getByRole('button', { name: 'Duplicate', exact: true }).click();
  await expect(composer.getByLabel('Choose a saved composition').locator('option')).toHaveCount(3);

  await composer.locator('.composer-name-controls').getByRole('button', { name: 'Start a blank Production' }).click();
  const before = await databaseRecords(page, ['productionRuns', 'workOrders', 'taskLeases', 'grants', 'returns', 'distributionPlans', 'gummies']);
  await composer.getByRole('button', { name: 'Apply as Production proposal' }).click();
  await page.waitForTimeout(300);
  const after = await databaseRecords(page, ['productionRuns', 'workOrders', 'taskLeases', 'grants', 'returns', 'distributionPlans', 'gummies', 'productionCompositions', 'actorPlans', 'dragIntents']);
  for (const store of ['productionRuns', 'workOrders', 'taskLeases', 'grants', 'returns', 'distributionPlans']) {
    expect(after[store]).toHaveLength(before[store].length);
  }
  expect(after.gummies.filter(item => item.status === 'accepted')).toHaveLength(before.gummies.filter(item => item.status === 'accepted').length);
  expect(after.productionCompositions.length).toBeGreaterThan(0);
  expect(after.actorPlans.length).toBeGreaterThan(0);
  const modes = after.dragIntents.filter(item => item.proposedRelation === 'composition-add').map(item => item.inputMode);
  expect(modes).toContain('keyboard');
  expect(modes).toContain('pointer');
  expect(after.dragIntents.every(item => item.startsExecution === false && item.grantsAuthority === false)).toBe(true);
  await expect(composer).toContainText('There is no execute button in Composer.');
  await expect(composer.getByRole('button', { name: /Make Production/ })).toHaveCount(0);
  await composer.getByRole('button', { name: 'Review compiled plan' }).click();
  const productionWindow = page.locator('[data-window-id^="production-window:"]').last();
  await expect(productionWindow.getByRole('heading', { name: 'Actor Plan' })).toBeVisible();
  await expect(productionWindow.getByRole('button', { name: 'Make Production' })).toBeVisible();
  const findings = await new AxeBuilder({ page }).include('[data-testid="composer-surface"]').analyze();
  expect(findings.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);
});

test('Command Center orients before and after the optional local example', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: 'Command Center' }).click();
  const command = page.getByTestId('phase16-command-center');
  await expect(command.getByText('COMMAND CENTER · NO ORPHANED WORK')).toBeVisible();
  await expect(command.getByRole('heading', { name: 'Your work should not disappear into AI chats.' })).toBeVisible();
  await expect(command).toContainText('This page helps you understand and choose.');
  await expect(command).toContainText('Nothing runs merely because it appears here.');
  await expect(command).toContainText('LOCAL EXAMPLE · OPEN A SAVED GROUP');
  const before = await databaseRecords(page, ['productionRuns', 'distributionReleases']);
  expect(before.productionRuns).toHaveLength(0);
  await command.getByTestId('phase16-run-proof').click();
  await expect(command.getByTestId('next-action-card')).toContainText('Accepted once', { timeout: 60_000 });
  const after = await databaseRecords(page, ['productionRuns', 'distributionReleases']);
  expect(after.productionRuns).toHaveLength(1);
  expect(after.distributionReleases).toHaveLength(1);
  await expect(command).toContainText('Accepting a result never publishes it.');
  await expect(command.getByTestId('phase16-run-proof')).toBeVisible();
  await expect(command.getByTestId('demo-worker-label')).toContainText('Demo Worker');
  const findings = await new AxeBuilder({ page }).include('[data-testid="phase16-command-center"]').analyze();
  expect(findings.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);
});

test('320px navigation keeps primary choices clear and exposes the Composer ordered-list equivalent', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await onboard(page, 'Phone Composer Tester');
  const phoneNavigation = page.getByRole('navigation', { name: 'Phone workspaces' });
  await expect(phoneNavigation.getByRole('button', { name: 'Composer' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Browser' })).toBeHidden();
  await page.getByRole('button', { name: 'More', exact: true }).click();
  await expect(page.getByRole('menuitem', { name: 'Browser' })).toBeVisible();
  await phoneNavigation.getByRole('button', { name: 'Composer' }).click();
  const composer = page.getByTestId('composer-surface');
  await composer.getByRole('button', { name: 'Create a blank composition' }).click();
  await composer.getByRole('button', { name: 'Ordered-list view' }).click();
  await expect(composer.getByTestId('composer-ordered-list')).toBeVisible();
  await expect(composer.getByRole('heading', { name: /Inputs/ })).toBeVisible();
  const findings = await new AxeBuilder({ page }).include('[data-testid="composer-surface"]').analyze();
  expect(findings.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);
});
