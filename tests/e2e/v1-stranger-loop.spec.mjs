import { test, expect } from '@playwright/test';
import { openMoreItem } from './support/calm-navigation.mjs';

async function onboard(page, name = 'Stranger Loop Tester') {
  await page.goto('/');
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill(name);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
  await expect(page.getByRole('region', { name: 'Gummy Canvas' })).toBeVisible();
}

test('stranger completes Demo Production loop under three minutes', async ({ page }) => {
  test.setTimeout(180_000);
  await onboard(page);

  const guide = page.getByRole('region', { name: 'Gummy window' });
  await expect(guide.getByRole('heading', { name: 'Your work should not disappear into AI chats.' })).toBeVisible();
  await expect(guide.getByText(/No orphaned work/i).first()).toBeVisible();
  await guide.getByTestId('open-demo-production').click();

  const command = page.getByRole('region', { name: 'Command Center window' });
  await expect(command.getByTestId('phase16-command-center')).toBeVisible();
  await expect(command.getByTestId('demo-production-doorway')).toBeVisible();
  await expect(command.getByText('Create a collaborative 30-second AI video.')).toBeVisible();
  await expect(command.getByTestId('demo-worker-label')).toContainText('Demo Worker');
  await expect(command.getByTestId('command-center-lanes')).toBeVisible();
  await expect(command.getByTestId('lane-now')).toBeVisible();
  await expect(command.getByTestId('lane-done')).toBeVisible();

  await openMoreItem(page, /Actor Home/);
  const actorHome = page.getByRole('region', { name: 'Actor Home window' });
  await expect(actorHome.getByRole('heading', { name: 'Actor Home' })).toBeVisible();
  await actorHome.getByTestId('actor-home-demo').click();

  await expect(command.getByTestId('phase16-command-center')).toBeVisible();
  await command.getByTestId('phase16-run-proof').click();
  await expect(command.getByTestId('phase16-distribution')).toBeVisible({ timeout: 60_000 });
  await expect(command.getByTestId('next-action-card')).toContainText('Accepted once');
  await expect(command.getByTestId('lane-done')).toBeVisible();
  await expect(command.getByTestId('demo-worker-label')).toContainText('Demo Worker');

  await page.reload();
  await expect(page.getByRole('region', { name: 'Gummy Canvas' })).toBeVisible();
  await openMoreItem(page, /Command Center/);
  const restored = page.getByRole('region', { name: 'Command Center window' });
  await expect(restored.getByTestId('phase16-distribution')).toBeVisible();
  await expect(restored.getByText(/Collaborative 30-second AI video|Demo Production|Accepted once/i).first()).toBeVisible();
});
