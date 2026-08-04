import { test, expect } from '@playwright/test';
import path from 'node:path';
import { openMoreItem } from './support/calm-navigation.mjs';

const evidenceRoot = path.resolve('artifacts/evidence');
const evidence = name => path.join(evidenceRoot, name);

async function settleImages(page, selector = 'img') {
  await page.locator(selector).evaluateAll(async images => {
    await Promise.all(images.map(async image => {
      if (!image.complete) {
        await new Promise((resolve, reject) => {
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', reject, { once: true });
        });
      }
      if (typeof image.decode === 'function') await image.decode();
      if (image.naturalWidth === 0) throw new Error(`Image did not decode: ${image.currentSrc || image.src}`);
    }));
  });
}

async function selectMode(page, mode) {
  await page.getByTestId(`mode-${mode}`).click();
  await expect(page.getByTestId(`mode-${mode}`)).toHaveAttribute('aria-pressed', 'true');
  await settleImages(page, '.onboarding img');
}

async function enterCanvas(page, mode = 'night') {
  await page.goto('/');
  await selectMode(page, mode);
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Realm Tester');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
  await expect(page.getByRole('region', { name: 'Gummy Canvas' })).toBeVisible();
}

test('captures settled Night and Day first-impression evidence', async ({ page }) => {
  for (const mode of ['night', 'day']) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await selectMode(page, mode);
    await page.screenshot({
      path: evidence(`phase13-onboarding-${mode}-1440x900.png`),
      animations: 'disabled'
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await settleImages(page, '.onboarding img');
    await page.screenshot({
      path: evidence(`phase13-onboarding-${mode}-390x844.png`),
      animations: 'disabled'
    });
  }
});

test('captures the complete Actor presence grid', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 2400 });
  await enterCanvas(page);
  await openMoreItem(page, /Actor Home/);
  await page.getByRole('button', { name: 'Maximize Actor Home' }).click();
  await expect(page.getByTestId('actor-presence-grid').locator('.presence-card')).toHaveCount(4);
  await settleImages(page, '[data-testid="actor-presence-grid"] img');
  await page.screenshot({
    path: evidence('phase13-actor-presence-grid.png'),
    animations: 'disabled'
  });
});

test('captures the reduced-motion doorway at 320 px', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');
  await selectMode(page, 'night');
  await page.screenshot({
    path: evidence('phase13-reduced-motion-320x720.png'),
    animations: 'disabled'
  });
});
