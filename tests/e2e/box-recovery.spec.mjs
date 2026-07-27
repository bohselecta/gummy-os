import { expect, test } from '@playwright/test';

async function reachLocalBox(page) {
  await page.goto('/');
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Test User');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Your Local Gummy Box is ready.' })).toBeVisible();
}

async function onboard(page) {
  await reachLocalBox(page);
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
}

test('a complete Gummy Box backup restores into a clean browser and reset remains preview-bound', async ({ browser, page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: /Productions/ }).click();
  const productionWindow = page.locator('[data-window-id="productions"]');
  await productionWindow.getByRole('button', { name: 'Open the Night Gummy Launch sample' }).click();
  await expect(productionWindow.getByRole('heading', { name: 'Night Gummy Launch' })).toBeVisible();
  await page.getByRole('tab', { name: /Master Control/ }).click();
  const control = page.locator('[data-window-id="control"]');
  await expect(control.getByTestId('gummy-box-recovery')).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await control.getByRole('button', { name: 'Export complete backup' }).click();
  const download = await downloadPromise;
  const backupPath = await download.path();
  expect(download.suggestedFilename()).toMatch(/\.gummybox$/);
  await expect(page.locator('.toast-layer')).toContainText('Gummy Box backup exported');

  const cleanContext = await browser.newContext();
  const clean = await cleanContext.newPage();
  await reachLocalBox(clean);
  await clean.getByLabel('Restore a Gummy Box backup').setInputFiles(backupPath);
  await expect(clean.getByText('Backup inspection complete')).toBeVisible();
  await expect(clean.getByText(/records · \d+ byte entries/)).toBeVisible();
  await clean.getByRole('button', { name: 'Restore inspected backup' }).click();
  await expect(clean.getByRole('tab', { name: /Productions/ })).toBeVisible();
  await clean.getByRole('tab', { name: /Productions/ }).click();
  await expect(clean.locator('[data-window-id="productions"]').getByRole('heading', { name: 'Night Gummy Launch' })).toBeVisible();
  const durable = await clean.evaluate(async () => {
    const request = indexedDB.open('gummy-os');
    const db = await new Promise(resolve => { request.onsuccess = () => resolve(request.result); });
    const all = name => new Promise(resolve => {
      const operation = db.transaction(name).objectStore(name).getAll();
      operation.onsuccess = () => resolve(operation.result);
    });
    return {
      productions: await all('productions'),
      gummies: await all('gummies'),
      receipts: await all('receipts')
    };
  });
  expect(durable.productions.some(item => item.id === 'production:night-gummy-launch')).toBe(true);
  expect(durable.gummies.length).toBeGreaterThan(0);
  expect(durable.receipts.some(item => item.action === 'import-gummy-box-backup')).toBe(true);

  await clean.getByRole('tab', { name: /Master Control/ }).click();
  const restoredControl = clean.locator('[data-window-id="control"]');
  await restoredControl.getByRole('button', { name: 'Reset layout and preferences' }).click();
  const preview = restoredControl.getByRole('dialog', { name: 'layout reset preview' });
  await expect(preview).toContainText('records will be removed');
  await expect(preview).toContainText('Preserves: Productions, Gummies, Returns, Receipts');
  await preview.getByLabel('Type RESET LAYOUT to confirm').fill('RESET LAYOUT');
  await preview.getByRole('button', { name: 'Apply exact reset' }).click();
  await expect(clean.locator('.toast-layer')).toContainText('layout reset completed');
  await cleanContext.close();
});
