import { mkdir } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const directory = 'evidence/visual/phase14';
await mkdir(directory, { recursive: true });

async function onboard(page) {
  await page.goto('/');
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Phase 14 Evidence');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
}

test('captures Phase 14 desktop and phone evidence', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: 'Places' }).click();
  await expect(page.getByTestId('phase14-places').locator('[data-place-id]')).toHaveCount(6);
  await expect(page.locator('.toast-layer .toast')).toHaveCount(0, { timeout: 6_000 });
  await page.screenshot({ path: `${directory}/places-desktop-night.png`, fullPage: true });

  await page.getByRole('button', { name: 'Open Worlds' }).click();
  const worlds = page.getByRole('region', { name: 'Worlds window' });
  await worlds.getByRole('button', { name: 'Validate and estimate' }).click();
  await expect(worlds.getByRole('status')).toContainText('executing: false');
  await page.screenshot({ path: `${directory}/worlds-bounded-plan.png`, fullPage: true });

  await page.setViewportSize({ width: 320, height: 720 });
  await page.getByRole('tab', { name: 'Places' }).click();
  await page.screenshot({ path: `${directory}/places-phone-night.png`, fullPage: true });
});
