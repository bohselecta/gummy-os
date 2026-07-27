import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  if (process.env.GUMMY_SHARE_URL) await page.goto(process.env.GUMMY_SHARE_URL);
});

test('Ranch Day Production desktop visual', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start private Ranch Day Production' }).click();
  await page.getByRole('button', { name: 'Add Ranch Day roster' }).click();
  await page.waitForTimeout(4500);
  await page.locator('.toast').evaluateAll(nodes => nodes.forEach(node => node.remove()));
  await expect(page.locator('[data-window-id="productions"]')).toHaveScreenshot('ranch-day-production-1440.png');
});

test('Ranch Day Production phone visual', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Start private Ranch Day Production' }).click();
  await page.getByRole('button', { name: 'Add Ranch Day roster' }).click();
  await page.waitForTimeout(4500);
  await page.locator('.toast').evaluateAll(nodes => nodes.forEach(node => node.remove()));
  await expect(page.locator('[data-window-id="productions"]')).toHaveScreenshot('ranch-day-production-390.png');
});
