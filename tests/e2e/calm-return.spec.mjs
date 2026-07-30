import { test, expect } from '@playwright/test';

async function onboard(page) {
  await page.goto('/');
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Return Journey Tester');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
}

test('return journey restores windows, navigation, and a non-social saved workspace group', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: 'Composer' }).click();
  await page.locator('.workspace-switcher > summary').click();
  await page.getByRole('button', { name: 'Save group' }).click();
  await expect(page.locator('.toast-layer')).toContainText('Workspace group saved locally');
  await page.reload();
  await expect(page.getByRole('region', { name: 'Composer window' })).toBeVisible();
  await page.locator('.workspace-switcher > summary').click();
  await page.getByRole('button', { name: 'Restore group' }).click();
  await expect(page.getByRole('region', { name: 'Composer window' })).toHaveAttribute('data-focused', 'true');
  const group = await page.evaluate(async () => {
    const request = indexedDB.open('gummy-os');
    const database = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const transaction = database.transaction('meta', 'readonly');
    return new Promise((resolve, reject) => {
      const read = transaction.objectStore('meta').get('workspace-group:actor:hayden:default');
      read.onsuccess = () => resolve(read.result);
      read.onerror = () => reject(read.error);
    });
  });
  expect(group.socialInstanceSemantics).toBe(false);
  expect(group.windowIds).toContain('composer');
});

test('phone workspace switcher keeps every saved-group action reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await onboard(page);
  await page.getByRole('navigation', { name: 'Phone workspaces' })
    .getByRole('button', { name: 'Composer' })
    .click();
  await page.locator('.workspace-switcher > summary').click();

  for (const name of ['Focus current', 'Show all', 'Save group', 'Restore group']) {
    const action = page.getByRole('button', { name });
    await expect(action).toBeVisible();
    await expect.poll(async () => {
      const bounds = await action.boundingBox();
      return Boolean(bounds
        && bounds.x >= 0
        && bounds.x + bounds.width <= 390
        && bounds.y >= 0
        && bounds.y + bounds.height <= 844);
    }).toBe(true);
  }

  await page.getByRole('button', { name: 'Save group' }).click();
  await page.reload();
  await page.locator('.workspace-switcher > summary').click();
  await page.getByRole('button', { name: 'Restore group' }).click();
  await expect(page.getByRole('region', { name: 'Composer window' }))
    .toHaveAttribute('data-focused', 'true');

  await page.setViewportSize({ width: 320, height: 720 });
  await page.locator('.workspace-switcher > summary').click();
  const restore = page.getByRole('button', { name: 'Restore group' });
  await expect(restore).toBeVisible();
  await expect.poll(async () => {
    const bounds = await restore.boundingBox();
    return Boolean(bounds
      && bounds.x >= 0
      && bounds.x + bounds.width <= 320
      && bounds.y >= 0
      && bounds.y + bounds.height <= 720);
  }).toBe(true);
});
