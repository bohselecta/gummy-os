import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { evidencePath } from './evidence-path.mjs';
import { openMoreItem } from './support/calm-navigation.mjs';

async function reachStartingChoice(page, mode = 'night') {
  await page.goto('/');
  await page.getByTestId(`mode-${mode}`).click();
  await page.screenshot({ path: evidencePath(`phase11-first-run-${mode}.png`), fullPage: true });
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Trusted Tester');
  await expect(page.getByLabel('Private local @address')).toHaveValue('@trusted-tester');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('Private on this device · no external account required')).toBeVisible();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await expect(page.getByRole('heading', { name: 'Choose your first Production' })).toBeVisible();
  await expect(page.getByText('Nothing runs or costs money yet.')).toBeVisible();
  await page.screenshot({ path: evidencePath(`phase11-first-production-choice-${mode}.png`), fullPage: true });
}

async function counts(page) {
  return page.evaluate(async () => {
    const request = indexedDB.open('gummy-os');
    const db = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const all = store => new Promise((resolve, reject) => {
      const operation = db.transaction(store).objectStore(store).getAll();
      operation.onsuccess = () => resolve(operation.result);
      operation.onerror = () => reject(operation.error);
    });
    return {
      productions: (await all('productions')).length,
      runs: (await all('productionRuns')).length,
      grants: (await all('grants')).length
    };
  });
}

test('trusted test user can enter the sample, understand Actors, and use Glopper without fake availability', async ({ page }) => {
  await reachStartingChoice(page);
  await page.getByRole('button', { name: 'Open the sample Production' }).click();

  const production = page.getByRole('region', { name: 'Night Gummy Launch window' });
  await expect(production.getByRole('heading', { name: 'Night Gummy Launch' })).toBeVisible();
  await expect(production.getByText('Cost before Make Production')).toBeVisible();
  await expect(production.getByText('Configure freely. Nothing runs or costs money yet.')).toBeVisible();
  await expect(production.getByRole('heading', { name: 'ImageHoss' })).toBeVisible();
  await expect(production.getByText(/Real generation requires the authenticated local runtime/)).toBeVisible();
  expect(await counts(page)).toEqual({ productions: 1, runs: 0, grants: 0 });
  await page.screenshot({ path: evidencePath('phase11-sample-production-night.png'), fullPage: true });

  await openMoreItem(page, /People & groups/);
  const presence = page.getByTestId('actor-presence-grid');
  await expect(presence.locator('[data-presence-id]')).toHaveCount(4);
  await expect(presence.getByRole('heading', { name: 'Glopper' })).toBeVisible();
  await expect(presence.getByText('available for chat')).toBeVisible();
  await expect(presence.getByText('Demonstration available')).toBeVisible();
  await expect(presence.getByText(/Real rendering needs a connected server-side provider route/)).toBeVisible();
  await expect(presence.getByText(/supported Blender runtime/)).toBeVisible();
  await page.screenshot({ path: evidencePath('phase11-actor-presence-night.png'), fullPage: true });

  await page.getByRole('button', { name: 'Open Glopper Panel' }).click();
  const glopper = page.getByRole('complementary', { name: 'Glopper Panel' });
  await expect(glopper.getByText(/You have 1 Production, 1 pending decision/)).toBeVisible();
  await expect(glopper.getByRole('button', { name: /Continue Night Gummy Launch/ })).toBeVisible();
  await expect(glopper.getByRole('button', { name: /Review 1 pending decision/ })).toBeVisible();
  await glopper.getByText('What Glopper can do right now').click();
  await expect(glopper.getByText(/Cloud execution is not configured|hermetic test provider/)).toBeVisible();
  await expect(glopper.getByText(/local placeholder/i)).toHaveCount(0);
  await page.screenshot({ path: evidencePath('phase11-glopper-guidance-night.png'), fullPage: true });

  const a11y = await new AxeBuilder({ page }).exclude('iframe').analyze();
  expect(a11y.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);
});

test('first-user doorway and sample remain usable at phone width in Day Gummy', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await reachStartingChoice(page, 'day');
  await page.getByRole('button', { name: 'Open the sample Production' }).click();
  await expect(page.getByRole('region', { name: 'Night Gummy Launch window' })).toBeVisible();
  await openMoreItem(page, /People & groups/);
  await expect(page.getByTestId('actor-presence-grid').locator('[data-presence-id]')).toHaveCount(4);
  await page.screenshot({ path: evidencePath('phase11-test-user-phone-day.png'), fullPage: true });
});
