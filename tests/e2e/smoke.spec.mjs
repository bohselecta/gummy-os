import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  if (process.env.GUMMY_SHARE_URL) await page.goto(process.env.GUMMY_SHARE_URL);
});

test('Production shell opens and creates Ranch Day without console errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Start private Ranch Day Production' }).click();
  await expect(page.getByRole('heading', { name: 'Ranch Day' })).toBeVisible();
  expect(errors).toEqual([]);
});
