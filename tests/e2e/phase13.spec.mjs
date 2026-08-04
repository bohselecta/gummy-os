import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openMoreItem } from './support/calm-navigation.mjs';

async function onboard(page, mode = 'night') {
  await page.goto('/');
  await page.getByTestId(`mode-${mode}`).click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Realm Tester');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
  await expect(page.getByRole('region', { name: 'Gummy Canvas' })).toBeVisible();
}

test('Lantern Chamber doorway is art-directed, responsive, and keyboard accessible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const night = page.getByTestId('mode-night');
  const day = page.getByTestId('mode-day');
  await expect(night.locator('img')).toBeVisible();
  await expect(day.locator('img')).toBeVisible();
  await night.focus();
  await page.keyboard.press('Enter');
  await expect(night).toHaveAttribute('aria-pressed', 'true');
  const hero = page.locator('.onboarding-realm-picture img');
  await expect(hero).toHaveAttribute('src', /lantern-chamber-night/);
  const cta = page.getByRole('button', { name: 'Enter Gummy OS' });
  const box = await cta.boundingBox();
  expect(box.y + box.height).toBeLessThanOrEqual(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('.onboarding-glopper')).animationName)).toBe('none');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('realm art reaches Canvas, Actors, Glopper, chat, Production, and public metadata', async ({ page, request }) => {
  await onboard(page, 'night');
  const canvasBackground = await page.locator('.canvas').evaluate(element => getComputedStyle(element).backgroundImage);
  expect(canvasBackground).toContain('lantern-chamber-night-1280x720.avif');

  await openMoreItem(page, /Actor Home/);
  const portals = page.getByTestId('actor-presence-grid').locator('.presence-portal');
  await expect(portals).toHaveCount(4);
  for (const image of await portals.all()) {
    await expect(image).toBeVisible();
    expect(await image.evaluate(node => node.naturalWidth)).toBe(960);
  }

  await page.getByRole('button', { name: 'Open Glopper Panel' }).click();
  await expect(page.getByRole('complementary', { name: 'Glopper Panel' }).getByAltText('Glopper')).toBeVisible();
  await page.getByRole('button', { name: 'Start or continue a private chat' }).click();
  await expect(page.getByTestId('private-actor-chat').getByAltText('Glopper')).toBeVisible();

  await page.getByRole('tab', { name: /Productions/ }).click();
  await page.getByRole('button', { name: 'Open the Night Gummy Launch sample', exact: true }).click();
  await expect(page.getByAltText('Night Gummy Launch Production cover in the Lantern Chamber')).toBeVisible();

  expect((await request.get('/brand/gummy/realm/manifest.json')).status()).toBe(200);
  const html = await (await request.get('/')).text();
  expect(html).toContain('property="og:image"');
  expect(html).toContain('/brand/gummy/social/gummy-og-1200x630.webp');
});
