import { test, expect } from '@playwright/test';
import path from 'node:path';
import { openMoreItem, openPrimary } from './support/calm-navigation.mjs';

const directory = path.resolve('evidence/visual/phase16-5');

async function clearToasts(page) {
  await page.locator('.toast-layer .toast').evaluateAll(nodes => nodes.forEach(node => node.remove()));
}

async function onboard(page, name) {
  await page.goto('/');
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill(name);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
  await clearToasts(page);
}

test('captures the exact Calm Workspace founder preview on desktop and phone', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await onboard(page, 'Phase 16.5 Founder Preview');

  await page.getByRole('tab', { name: /Gummy Box/ }).click();
  await expect(page.getByTestId('gummy-box-launchpad').locator('.continue-card')).toHaveCount(4);
  await clearToasts(page);
  await page.screenshot({ path: `${directory}/gummy-box-four-questions-desktop.png`, fullPage: true });

  await openPrimary(page, 'Composer');
  const composer = page.getByTestId('composer-surface');
  await composer.getByRole('button', { name: 'Create a blank composition' }).click();
  await clearToasts(page);
  await page.screenshot({ path: `${directory}/composer-canvas-first-desktop.png`, fullPage: true });

  await openMoreItem(page, 'Connections & runtimes');
  await expect(page.getByTestId('connections-surface')).toContainText('Phase 17 live execution held');
  await clearToasts(page);
  await page.screenshot({ path: `${directory}/connections-truth-desktop.png`, fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: `${directory}/connections-phone.png`, fullPage: true });
  await openPrimary(page, 'Composer');
  await expect(page.getByRole('navigation', { name: 'Composer mode' })).toBeVisible();
  await clearToasts(page);
  await page.screenshot({ path: `${directory}/composer-arrange-phone.png`, fullPage: true });

  await page.getByRole('button', { name: 'More', exact: true }).click();
  await expect(page.getByRole('menu', { name: 'More workspaces' })).toBeVisible();
  await clearToasts(page);
  await page.screenshot({ path: `${directory}/phone-more-navigation.png`, fullPage: true });
});
