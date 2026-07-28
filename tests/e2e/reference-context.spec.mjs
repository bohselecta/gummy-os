import { test, expect } from '@playwright/test';

async function onboard(page) {
  await page.goto('/');
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Reference Tester');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
}

test('Hoyt stays recorded but is not presented as a default local user', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: 'Actors / Bowls' }).click();

  const hoytDefaultCard = page.locator('.card[data-actor-id="actor:hoyt"]');
  await expect(hoytDefaultCard).toHaveCount(1);
  await expect(hoytDefaultCard).toBeHidden();
  await expect(page.locator('.card[data-actor-id="actor:hayden"]')).toBeVisible();
});

test('Ranch Day source history is visibly labeled as a saved private reference', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: 'My Gummies' }).click();

  await expect(page.getByText('Saved reference · Ranch Day source brief.md', { exact: true })).toBeVisible();
  await expect(page.getByText('Saved private reference · Hoyt (Ranch Day)', { exact: true })).toBeVisible();
  await expect(page.getByText('Ranch Day source brief.md', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Approved Hoyt likeness references', { exact: true })).toHaveCount(0);
});
