import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function onboard(page) {
  await page.goto('/');
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Place Tester');
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

test('Phase 14 Place identities and pinning model remain preserved after activation', async ({ page }) => {
  await onboard(page);
  await expect(page.locator('.gummy-bar [data-place-id]')).toHaveCount(0);
  await page.getByRole('tab', { name: 'Places' }).click();
  const grid = page.getByTestId('phase15-places');
  await expect(grid.locator('[data-place-id]')).toHaveCount(7);
  for (const name of ['Gummy Channels', 'Wardrobe', 'House', 'Worlds', 'Table', 'Radio', 'Rooms']) {
    await expect(grid.getByRole('heading', { name, exact: true })).toBeVisible();
  }
  await expect(page.getByText(/VidFam|Dressing Suite|Homewright|VideoWorlds|Easy Food|TalkPrint/i)).toHaveCount(0);
});

test('Human pinning persists and Place windows remain context-specific', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: 'Places' }).click();
  const wardrobeCard = page.locator('[data-place-id="app:gummy-wardrobe"]').first();
  await wardrobeCard.getByRole('button', { name: 'Pin', exact: true }).click();
  await expect(page.locator('.gummy-bar').getByRole('tab', { name: 'Wardrobe' })).toBeVisible();
  await page.reload();
  await expect(page.locator('.gummy-bar').getByRole('tab', { name: 'Wardrobe' })).toBeVisible();
  await page.locator('.gummy-bar').getByRole('tab', { name: 'Wardrobe' }).click();
  const personal = page.getByRole('region', { name: 'Wardrobe window' });
  await expect(personal).toBeVisible();
  await personal.getByRole('button', { name: 'production' }).click();
  await expect(page.getByRole('region', { name: 'Wardrobe window' })).toHaveCount(2);
  await page.getByRole('button', { name: 'Close Wardrobe' }).last().click();
  await expect(page.locator('.gummy-bar').getByRole('tab', { name: 'Wardrobe' })).toBeVisible();
});

test('advanced Place capabilities remain separately blocked without staging the core', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: 'Places' }).click();
  for (const name of ['Gummy Channels', 'Wardrobe', 'House', 'Worlds', 'Table', 'Radio', 'Rooms']) {
    const card = page.locator('.place-card').filter({ has: page.getByRole('heading', { name, exact: true }) });
    await expect(card.getByText('Available', { exact: true })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Open Wardrobe' }).click();
  await expect(page.getByRole('region', { name: 'Wardrobe window' }).getByRole('button', { name: 'Camera capture needs companion' })).toBeDisabled();
  await page.getByRole('tab', { name: 'Places' }).click();
  await page.getByRole('button', { name: 'Open Worlds' }).click();
  await expect(page.getByRole('region', { name: 'Worlds window' }).getByRole('button', { name: 'Build needs Meshmallow' })).toBeDisabled();
  await page.getByRole('tab', { name: 'Places' }).click();
  await page.getByRole('button', { name: 'Open Table' }).click();
  await expect(page.getByRole('region', { name: 'Table window' }).getByRole('button', { name: 'Exact address requires verified service' })).toBeDisabled();
  await page.getByRole('tab', { name: 'Places' }).click();
  await page.getByRole('button', { name: 'Open Radio' }).click();
  await expect(page.getByRole('region', { name: 'Radio window' }).getByRole('button', { name: 'Final voice service not connected' })).toBeDisabled();
});

test('Places remains accessible on phone with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await onboard(page);
  await page.getByRole('tab', { name: 'Places' }).click();
  await expect(page.getByTestId('phase15-places').locator('[data-place-id]')).toHaveCount(7);
  const results = await new AxeBuilder({ page }).exclude('iframe').analyze();
  expect(results.violations).toEqual([]);
});
