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

test('Places doorway has six current identities, four journey previews, and no default Place pins', async ({ page }) => {
  await onboard(page);
  await expect(page.locator('.gummy-bar [data-place-id]')).toHaveCount(0);
  await page.getByRole('tab', { name: 'Places' }).click();
  const grid = page.getByTestId('phase14-places');
  await expect(grid.locator('[data-place-id]')).toHaveCount(6);
  for (const name of ['Gummy Channels', 'Wardrobe', 'House', 'Worlds', 'Table', 'Radio']) {
    await expect(grid.getByRole('heading', { name, exact: true })).toBeVisible();
  }
  const journeys = page.getByTestId('cross-place-journeys');
  await expect(journeys.locator('[data-journey]')).toHaveCount(4);
  for (const button of await journeys.getByRole('button', { name: 'Prepare preview' }).all()) {
    await button.click();
  }
  await expect(journeys.getByText(/state preview/)).toHaveCount(4);
  await expect(page.getByText(/VidFam|Dressing Suite|Homewright|VideoWorlds|Easy Food|TalkPrint/i)).toHaveCount(0);
});

test('Human pinning persists and opens a context-specific Place window without deleting it on close', async ({ page }) => {
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

test('all six Place surfaces expose their doctrine and never fake unavailable execution', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: 'Places' }).click();

  await page.getByRole('button', { name: 'Open Gummy Channels' }).click();
  const channels = page.getByRole('region', { name: 'Gummy Channels window' });
  await channels.getByRole('button', { name: 'Preview guide placement' }).click();
  await expect(channels.getByRole('status')).toContainText('published: false');

  await page.getByRole('tab', { name: 'Places' }).click();
  await page.getByRole('button', { name: 'Open Wardrobe' }).click();
  const wardrobe = page.getByRole('region', { name: 'Wardrobe window' });
  await wardrobe.getByRole('button', { name: 'Make one outfit' }).click();
  await expect(wardrobe.getByRole('status')).toContainText('preference unchanged');
  await expect(wardrobe).toContainText('There is no checkout.');

  await page.getByRole('tab', { name: 'Places' }).click();
  await page.getByRole('button', { name: 'Open House' }).click();
  const house = page.getByRole('region', { name: 'House window' });
  await house.getByRole('button', { name: 'Open Intent Gate' }).click();
  await expect(house.getByRole('status')).toContainText('no external execution');

  await page.getByRole('tab', { name: 'Places' }).click();
  await page.getByRole('button', { name: 'Open Worlds' }).click();
  const worlds = page.getByRole('region', { name: 'Worlds window' });
  await worlds.getByRole('button', { name: 'Validate and estimate' }).click();
  await expect(worlds.getByRole('status')).toContainText('executing: false');
  await expect(worlds.getByRole('list', { name: 'The nine Worlds tools' }).getByRole('listitem')).toHaveCount(9);
  await expect(worlds.getByRole('button', { name: 'Meshmallow runtime required' })).toBeDisabled();

  await page.getByRole('tab', { name: 'Places' }).click();
  await page.getByRole('button', { name: 'Open Table' }).click();
  const table = page.getByRole('region', { name: 'Table window' });
  await table.getByRole('button', { name: 'Preview gathering' }).click();
  await expect(table.getByRole('status')).toContainText('address remains withheld');

  await page.getByRole('tab', { name: 'Places' }).click();
  await page.getByRole('button', { name: 'Open Radio' }).click();
  const radio = page.getByRole('region', { name: 'Radio window' });
  await radio.getByRole('button', { name: 'Approve script and prepare demo' }).click();
  await expect(radio.getByRole('status')).toContainText('final audio: false');
  await expect(radio.getByRole('status')).toContainText('published: false');
});

test('Places remains accessible on phone with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await onboard(page);
  await page.getByRole('tab', { name: 'Places' }).click();
  await expect(page.getByTestId('phase14-places').locator('[data-place-id]')).toHaveCount(6);
  const results = await new AxeBuilder({ page }).exclude('iframe').analyze();
  expect(results.violations).toEqual([]);
});
