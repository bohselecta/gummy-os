import { createRequire } from 'node:module';
import { expect, test } from '@playwright/test';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');

test.beforeEach(async ({ page }) => {
  if (process.env.GUMMY_SHARE_URL) await page.goto(process.env.GUMMY_SHARE_URL);
});

test('Production and Master Control have no serious or critical axe violations and support keyboard flow', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start private Ranch Day Production' }).click();
  await page.getByRole('button', { name: 'Add Ranch Day roster' }).click();
  await page.locator('[data-window-id="productions"]').getByRole('button', { name: 'Master Control', exact: true }).click();
  await page.addScriptTag({ path: axePath });
  const result = await page.evaluate(async () => window.axe.run(document, {
    resultTypes: ['violations'],
    rules: {
      'color-contrast': { enabled: true }
    }
  }));
  const severe = result.violations.filter(item => ['serious', 'critical'].includes(item.impact));
  expect(severe, severe.map(item => `${item.id}: ${item.help}`).join('\n')).toEqual([]);

  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toBeVisible();
  const outline = await focused.evaluate(node => getComputedStyle(node).outlineStyle);
  expect(outline).not.toBe('none');
  await expect(page.getByRole('navigation', { name: 'Gummy Bar' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open Glopper Panel' })).toBeVisible();
});

test('phone viewport keeps critical Production actions reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Start private Ranch Day Production' }).click();
  await expect(page.getByRole('button', { name: 'Make Production' })).toBeVisible();
  await page.getByRole('button', { name: 'Add Ranch Day roster' }).click();
  await expect(page.locator('.setup-rail')).toBeVisible();
  await expect(page.locator('.actor-card').first()).toBeVisible();
});
