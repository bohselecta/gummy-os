import { test, expect } from '@playwright/test';
import { openMoreItem } from './support/calm-navigation.mjs';

test.skip(!process.env.GUMMY_LIVE_BRIDGES, 'Run only for an explicit production bridge verification.');

async function onboard(page) {
  await page.goto(process.env.GUMMY_LIVE_BASE_URL || '/');
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Bridge Verifier');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
}

async function openPlace(page, name) {
  await openMoreItem(page, 'Places');
  await page.getByRole('button', { name: `Open ${name}` }).click();
  return page.getByRole('region', { name: `${name} window` });
}

test('production House, Worlds, and Radio studios return exact import receipts', async ({ context, page }) => {
  await onboard(page);

  const house = await openPlace(page, 'House');
  await house.getByLabel('Name').fill('Bridge room');
  await house.getByRole('button', { name: 'Save room' }).click();
  await expect(house.locator('[data-record-type="room"]')).toHaveCount(1);
  await house.getByLabel('Intent', { exact: true }).fill('Make a quiet reading corner.');
  await house.getByRole('button', { name: 'Preview scoped intent' }).click();
  await expect(house.locator('[data-record-type="intent-preview"]')).toHaveCount(1);
  await house.getByLabel('Intent note').fill('Add one warm reading lamp.');
  await house.getByLabel('Consequence note').fill('Keep the accessible route clear.');
  await house.getByRole('button', { name: 'Commit both notes' }).click();
  await expect(house.locator('[data-record-type="commit"]')).toHaveCount(1);
  const housePopupPromise = context.waitForEvent('page');
  await house.getByRole('button', { name: 'Open latest commit in the full House workbench' }).click();
  const housePopup = await housePopupPromise;
  await expect(housePopup.getByRole('heading', { name: 'Scoped projection, never a graph mirror' })).toBeVisible();
  await expect(house.getByRole('status').last()).toContainText('imported the Human-approved two-note commit');
  await housePopup.close();

  const worlds = await openPlace(page, 'Worlds');
  await worlds.getByLabel('Title').fill('Bridge Chamber');
  await worlds.getByLabel('Intent').fill('A calm place to sit and listen together.');
  await worlds.getByRole('button', { name: 'Create valid Sit plan' }).click();
  await expect(worlds.locator('[data-record-type="world-plan"]')).toHaveCount(1);
  const worldsPopupPromise = context.waitForEvent('page');
  await worlds.getByRole('button', { name: 'Open latest plan in the Worlds Studio' }).click();
  const worldsPopup = await worldsPopupPromise;
  await expect(worldsPopup.getByRole('heading', { name: 'Bounded Sit plans' })).toBeVisible();
  await expect(worlds.getByRole('status').last()).toContainText('imported the bounded Sit plan');
  await worldsPopup.close();

  const radio = await openPlace(page, 'Radio');
  await radio.getByLabel('Episode title').fill('Bridge aftershow');
  await radio.getByLabel('Host A selected sources').fill('What changed?\nThe scoped bridges now connect.');
  await radio.getByLabel('Host B selected sources').fill('Each authority stayed separate.\nEach import returned an exact receipt.');
  await radio.getByRole('button', { name: 'Create private episode' }).click();
  await expect(radio.locator('[data-record-type="episode"]')).toHaveCount(1);
  const radioPopupPromise = context.waitForEvent('page');
  await radio.getByRole('button', { name: 'Open scoped sources in AfterCast' }).click();
  const radioPopup = await radioPopupPromise;
  await expect(radio.getByRole('status').last()).toContainText('AfterCast imported the scoped A/B sources');
  await expect(radioPopup.getByText('The Scoped Bridges Show')).toBeVisible();
  await radioPopup.getByRole('button', { name: 'Open your Studio' }).click();
  await expect(radioPopup.getByRole('button', { name: 'Export private Gummy Radio package' })).toBeVisible();
  await page.screenshot({
    path: 'evidence/visual/phase15b/live-standalone-receipts-desktop.png',
    fullPage: true
  });
  await radioPopup.close();
});

test('Phase 15 Places remain legible on a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await onboard(page);
  await openMoreItem(page, 'Places');
  await expect(page.getByTestId('phase15-places')).toBeVisible();
  await page.screenshot({
    path: 'evidence/visual/phase15b/places-phone-night.png',
    fullPage: true
  });
});
