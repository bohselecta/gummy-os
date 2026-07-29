import { test, expect } from '@playwright/test';
import { evidencePath } from './evidence-path.mjs';
import { openPrimary } from './support/calm-navigation.mjs';

test.use({ reducedMotion: 'reduce' });

async function onboard(page) {
  await page.goto('/');
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Evidence User');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
  await expect(page.getByRole('region', { name: 'Gummy Canvas' })).toBeVisible();
}

test('capture the Human-owned workspace and goal-first Composer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await onboard(page);

  await openPrimary(page, /Gummy Box/);
  const box = page.getByTestId('gummy-box');
  await expect(box.getByTestId('gummy-box-launchpad')).toBeVisible();
  await page.screenshot({ path: evidencePath('executive-convergence-gummy-box-desktop.png'), fullPage: true });

  await box.getByRole('button', { name: 'Open Composer' }).first().click();
  const composer = page.getByTestId('composer-surface');
  await composer.getByRole('button', { name: 'Create a blank composition' }).click();
  const brief = composer.getByTestId('composer-brief');
  await brief.getByLabel('Desired result').fill('Create a short visual launch story that explains Gummy clearly.');
  await brief.getByLabel('Audience').fill('Curious creators');
  await brief.getByLabel('Success looks like').fill('A Human can inspect and accept an exact visual package before it goes anywhere.');
  await brief.getByLabel('Boundaries and constraints').fill('Use selected brand-owned sources; keep the result private until a separate release decision.');
  await brief.getByRole('button', { name: 'Save the brief' }).click();
  await composer.locator('.composer-starter-card').filter({ hasText: 'Make a visual' }).getByRole('button', { name: 'Use this pattern' }).click();
  await expect(composer.getByTestId('composer-impact')).toContainText('Proposal only');
  await page.screenshot({ path: evidencePath('executive-convergence-composer-desktop.png'), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await openPrimary(page, /Gummy Box/);
  await expect(page.getByTestId('gummy-box-launchpad')).toBeVisible();
  await page.screenshot({ path: evidencePath('executive-convergence-gummy-box-phone.png'), fullPage: true });

  await openPrimary(page, 'Composer');
  await expect(page.getByTestId('composer-brief').getByLabel('Desired result')).toHaveValue('Create a short visual launch story that explains Gummy clearly.');
  await page.screenshot({ path: evidencePath('executive-convergence-composer-phone.png'), fullPage: true });
});
