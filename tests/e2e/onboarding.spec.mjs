import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function completeOnboarding(page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Your creative computer, with you in control.' })).toBeVisible();
  await expect(page.getByText(/Nothing runs until you choose Make Production/)).toBeVisible();
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Test User');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Your Local Gummy Box is ready.' })).toBeVisible();
  await expect(page.getByText(/no external account required/i)).toBeVisible();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await expect(page.getByRole('heading', { name: 'Choose your first Production' })).toBeVisible();
  await page.getByTestId('enter-canvas').click();
  await expect(page.getByRole('region', { name: 'Gummy Canvas' })).toBeVisible();
}

async function stores(page) {
  return page.evaluate(async () => {
    const request = indexedDB.open('gummy-os');
    const db = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const all = name => new Promise((resolve, reject) => {
      const operation = db.transaction(name).objectStore(name).getAll();
      operation.onsuccess = () => resolve(operation.result);
      operation.onerror = () => reject(operation.error);
    });
    return {
      boxes: await all('boxes'),
      productions: await all('productions'),
      runs: await all('productionRuns'),
      grants: await all('grants')
    };
  });
}

test('first run creates a local Box, offers exactly two primary paths, and preserves the safe sample', async ({ page }) => {
  await completeOnboarding(page);
  const guide = page.locator('[data-window-id="guide"]');
  await expect(guide.getByRole('button', { name: /Start a blank Production/ })).toBeVisible();
  await expect(guide.getByRole('button', { name: /Open the Night Gummy Launch sample/ })).toBeVisible();
  expect((await stores(page)).boxes).toHaveLength(1);

  await guide.getByRole('button', { name: /Open the Night Gummy Launch sample/ }).click();
  const productions = page.getByRole('region', { name: 'Night Gummy Launch window' });
  await expect(productions.getByRole('heading', { name: 'Night Gummy Launch' })).toBeVisible();
  await expect(productions.getByRole('heading', { name: 'ImageHoss' })).toBeVisible();
  await expect(productions.getByText('Needs direction')).toBeVisible();
  await expect(productions.getByText(/Real generation requires the authenticated local runtime/)).toBeVisible();
  await expect(productions.getByText('Cost before Make Production')).toBeVisible();
  await expect.poll(async () => (await stores(page)).productions.length).toBe(1);
  let durable = await stores(page);
  expect(durable.productions).toHaveLength(1);
  expect(durable.runs).toHaveLength(0);
  expect(durable.grants).toHaveLength(0);

  await page.reload();
  await expect(page.getByRole('region', { name: 'Night Gummy Launch window' }).getByRole('heading', { name: 'Night Gummy Launch' })).toBeVisible();
  durable = await stores(page);
  expect(durable.productions[0].gummyIds).toEqual([
    'gummy:night-gummy-launch-brief',
    'gummy:night-gummy-launch-brand-kit'
  ]);
  const a11y = await new AxeBuilder({ page }).exclude('iframe').analyze();
  expect(a11y.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);
});

test('blank Production starts without sources, execution, or external connection', async ({ page }) => {
  await completeOnboarding(page);
  await page.locator('[data-window-id="guide"]').getByRole('button', { name: /Start a blank Production/ }).click();
  const productions = page.getByRole('region', { name: 'Untitled Production window' });
  await expect(productions.getByRole('heading', { name: 'Untitled Production' })).toBeVisible();
  await expect.poll(async () => (await stores(page)).productions.length).toBe(1);
  const durable = await stores(page);
  expect(durable.productions[0].gummyIds).toEqual([]);
  expect(durable.runs).toHaveLength(0);
  expect(durable.grants).toHaveLength(0);
});
