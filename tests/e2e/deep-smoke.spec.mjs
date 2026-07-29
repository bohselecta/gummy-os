import { test, expect } from '@playwright/test';

async function onboard(page) {
  await page.goto('/');
  await expect(page).toHaveTitle(/Your creative computer, with you in control/);
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Cross Browser Tester');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
  await expect(page.getByRole('region', { name: 'Gummy Canvas' })).toBeVisible();
}

test('Human-owned workspace and goal-first Composer survive a cross-browser return visit', async ({ page }) => {
  await onboard(page);

  await page.getByRole('tab', { name: /Gummy Box/ }).click();
  const box = page.getByTestId('gummy-box');
  await expect(box.getByTestId('gummy-box-launchpad')).toBeVisible();
  await expect(box).toContainText("Stored in this browser's Local Gummy Box.");

  await box.getByRole('button', { name: 'Open Composer' }).first().click();
  const composer = page.getByTestId('composer-surface');
  await composer.getByRole('button', { name: 'Create a blank composition' }).click();
  await composer.getByTestId('composer-brief').getByLabel('Desired result').fill('Create a cited private brief.');
  await composer.getByTestId('composer-brief').getByRole('button', { name: 'Save the brief' }).click();

  const starter = composer.locator('.composer-starter-card').filter({ hasText: 'Research and make a brief' });
  await starter.getByRole('button', { name: 'Use this pattern' }).click();
  await expect(composer.locator('[data-node-id]').filter({ hasText: 'Cross Browser Tester' })).toBeVisible();
  await expect(composer.locator('[data-node-id]').filter({ hasText: 'Human reviews the result' })).toBeVisible();
  await expect(composer.getByTestId('composer-impact')).toContainText('Proposal only');
  await expect(composer.getByRole('button', { name: /Make Production/ })).toHaveCount(0);

  await page.reload();
  await page.getByRole('tab', { name: 'Composer' }).click();
  await expect(page.getByTestId('composer-brief').getByLabel('Desired result')).toHaveValue('Create a cited private brief.');
  await expect(page.getByTestId('composer-surface').locator('[data-node-id]').filter({ hasText: 'Cross Browser Tester' })).toBeVisible();
});
