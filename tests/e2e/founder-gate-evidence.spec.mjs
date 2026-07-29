import { mkdir } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const directory = 'evidence/visual/phase16-founder-gate';
await mkdir(directory, { recursive: true });

async function onboard(page, name) {
  await page.goto('/');
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill(name);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
  await expect(page.getByRole('region', { name: 'Gummy Canvas' })).toBeVisible();
}

async function addPaletteItem(composer, key, lane) {
  const item = composer.locator(`[data-palette-id="${key}"]`);
  await item.getByLabel(/Choose a lane for/).selectOption(lane);
  await item.getByRole('button', { name: 'Add' }).click();
  await composer.getByRole('dialog', { name: 'Composer proposal preview' })
    .getByRole('button', { name: 'Accept proposal' }).click();
}

async function clearToasts(page) {
  await page.locator('.toast-layer .toast').evaluateAll(nodes => nodes.forEach(node => node.remove()));
}

async function captureCommercialJourney(page, suffix) {
  await clearToasts(page);
  await page.screenshot({ path: `${directory}/first-run-workspace-${suffix}.png`, fullPage: true });

  await page.getByRole('tab', { name: /Gummy Box/ }).click();
  await expect(page.getByTestId('gummy-box')).toBeVisible();
  await clearToasts(page);
  await page.screenshot({ path: `${directory}/gummy-box-${suffix}.png`, fullPage: true });

  await page.getByRole('tab', { name: 'Composer' }).click();
  const composerWindow = page.getByRole('region', { name: 'Composer window' });
  const composer = composerWindow.getByTestId('composer-surface');
  await expect(composer.getByTestId('composer-blank')).toBeVisible();
  await composer.getByTestId('composer-blank').scrollIntoViewIfNeeded();
  await clearToasts(page);
  await page.screenshot({ path: `${directory}/composer-blank-${suffix}.png`, fullPage: true });

  await composer.getByRole('button', { name: 'Create a blank composition' }).click();
  await addPaletteItem(composer, 'gummy:gummy:night-gummy-launch-brief', 'inputs');
  await addPaletteItem(composer, 'actor:actor:imagehoss', 'people-tools');
  await addPaletteItem(composer, 'gate:human-acceptance', 'review-approval');
  await addPaletteItem(composer, 'destination:gummy-box', 'destinations');
  await composer.getByTestId('composer-canvas').scrollIntoViewIfNeeded();
  await clearToasts(page);
  await page.screenshot({ path: `${directory}/composer-populated-${suffix}.png`, fullPage: true });

  if (suffix === 'phone-320') {
    await composer.getByRole('button', { name: 'Ordered-list view' }).click();
    await expect(composer.getByTestId('composer-ordered-list')).toBeVisible();
    await composer.getByTestId('composer-ordered-list').scrollIntoViewIfNeeded();
    await clearToasts(page);
    await page.screenshot({ path: `${directory}/composer-ordered-list-${suffix}.png`, fullPage: true });
    await composer.getByRole('button', { name: 'Canvas view' }).click();
  }

  await composer.locator('.composer-name-controls')
    .getByRole('button', { name: 'Start a blank Production' }).click();
  await composer.getByRole('button', { name: 'Apply as Production proposal' }).click();
  const appliedEvidence = composer.getByTestId('composer-applied-evidence');
  await expect(appliedEvidence).toHaveAttribute('data-actor-plan-id', /^actor-plan:/);
  await expect(appliedEvidence).toContainText('No Run, Lease, Grant, provider call, charge, publication, or acceptance was created.');
  await composer.getByRole('button', { name: 'Open the full Production' }).click();
  const production = page.locator('[data-window-id^="production-window:"]').last();
  await expect(production).toBeVisible();
  await production.getByRole('button', { name: /Composer/ }).click();
  await expect(production.getByTestId('composer-surface')).toBeVisible();
  await production.getByTestId('composer-surface').scrollIntoViewIfNeeded();
  await clearToasts(page);
  await page.screenshot({ path: `${directory}/production-linked-composer-${suffix}.png`, fullPage: true });

  await production.getByRole('button', { name: 'Actor Plan', exact: true }).click();
  await expect(production.getByRole('heading', { name: 'Actor Plan' })).toBeVisible();
  await production.locator('.actor-plan-graph').scrollIntoViewIfNeeded();
  await clearToasts(page);
  await page.screenshot({ path: `${directory}/compiled-actor-plan-${suffix}.png`, fullPage: true });

  await page.getByRole('tab', { name: 'Command Center' }).click();
  const command = page.getByTestId('phase16-command-center');
  await expect(command.getByRole('heading', { name: 'Choose what to continue' })).toBeVisible();
  await command.getByRole('heading', { name: 'Choose what to continue' }).scrollIntoViewIfNeeded();
  await clearToasts(page);
  await page.screenshot({ path: `${directory}/command-center-before-${suffix}.png`, fullPage: true });
  await command.getByTestId('phase16-run-proof').click();
  await expect(command.locator('.phase16-progress-complete')).toHaveCount(11);
  await command.getByTestId('phase16-proof-status').scrollIntoViewIfNeeded();
  await clearToasts(page);
  await command.getByTestId('phase16-proof-status').screenshot({
    path: `${directory}/command-center-after-proof-status-${suffix}.png`
  });
  await page.screenshot({ path: `${directory}/command-center-after-${suffix}.png`, fullPage: true });
}

test('captures founder-gate desktop commercial evidence', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await onboard(page, 'Founder Evidence Desktop');
  await captureCommercialJourney(page, 'desktop');
});

test('captures founder-gate 320px commercial evidence', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await onboard(page, 'Founder Evidence Phone');
  await clearToasts(page);
  await page.screenshot({ path: `${directory}/phone-primary-navigation-phone-320.png`, fullPage: true });
  await captureCommercialJourney(page, 'phone-320');
});
