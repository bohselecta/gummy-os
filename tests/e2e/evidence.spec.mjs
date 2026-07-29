import { test, expect } from '@playwright/test';
import { evidencePath } from './evidence-path.mjs';
import { openMoreItem } from './support/calm-navigation.mjs';

async function onboarding(page, mode, layout = 'desktop') {
  await page.goto('/');
  await page.getByTestId(`mode-${mode}`).click();
  const selectorName = layout === 'desktop' ? `${mode}-theme-selector.png` : `${mode}-${layout}-theme-selector.png`;
  await page.screenshot({ path: evidencePath(selectorName), fullPage: true });
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Test User');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
  await expect(page.getByRole('region', { name: 'Gummy Canvas' })).toBeVisible();
}

test('captures founder-review visual evidence', async ({ page }) => {
  await onboarding(page, 'night');
  await page.screenshot({ path: evidencePath('night-canvas-bar.png'), fullPage: true });
  await page.getByRole('button', { name: 'Open Glopper Panel' }).click();
  await expect(page.getByRole('complementary', { name: 'Glopper Panel' })).toBeVisible();
  await page.screenshot({ path: evidencePath('glopper-conversation.png'), fullPage: true });
  await page.locator('.toast-layer .toast').evaluateAll(nodes => nodes.forEach(node => node.remove()));
  await page.getByRole('tab', { name: 'Inbox' }).click();
  await page.screenshot({ path: evidencePath('awaiting-approval.png'), fullPage: true });
  await page.getByRole('tab', { name: /My Gummies/ }).focus();
  await page.screenshot({ path: evidencePath('keyboard-focus.png'), fullPage: true });
  await page.getByRole('button', { name: 'Switch Night or Day Gummy' }).click();
  await page.getByRole('button', { name: 'Close Glopper Panel' }).click();
  await page.screenshot({ path: evidencePath('day-canvas-bar.png'), fullPage: true });
  await expect(page.locator('html')).toHaveAttribute('data-gummy-mode', 'day');
  await openMoreItem(page, /Places/);
  await expect(page.getByTestId('phase14-places').locator('[data-place-id]')).toHaveCount(6);
  await expect(page.getByTestId('first-party-applications').locator('[data-application-id]')).toHaveCount(4);
  await page.screenshot({ path: evidencePath('phase14-places.png'), fullPage: true });
  await page.getByRole('tab', { name: /My Gummies/ }).click();
  await page.locator('input[type="file"]').setInputFiles({ name: 'quarantine-proof.md', mimeType: 'text/markdown', buffer: Buffer.from('# quarantine proof') });
  await page.getByRole('button', { name: 'Deny promotion' }).click();
  await expect(page.getByText('blocked', { exact: true })).toBeVisible();
  await page.screenshot({ path: evidencePath('quarantined-blocked.png'), fullPage: true });
});

test('captures phone and reduced-motion evidence', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 720 });
  await onboarding(page, 'night', 'phone');
  await page.screenshot({ path: evidencePath('night-phone-reduced-motion.png'), fullPage: true });
  await page.getByAltText('Night Gummy Lantern Chamber').scrollIntoViewIfNeeded();
  await page.screenshot({ path: evidencePath('night-phone-brand.png'), fullPage: true });
  await page.getByRole('button', { name: 'Open Glopper Panel' }).click();
  await page.screenshot({ path: evidencePath('phone-reduced-motion.png'), fullPage: true });
  await page.getByRole('button', { name: 'Switch Night or Day Gummy' }).click();
  await page.getByRole('button', { name: 'Close Glopper Panel' }).click();
  await expect(page.locator('.toast-layer .toast')).toHaveCount(0, { timeout: 6_000 });
  await page.getByAltText('Night Gummy Lantern Chamber').scrollIntoViewIfNeeded();
  await page.screenshot({ path: evidencePath('day-phone-brand.png'), fullPage: true });
  await openMoreItem(page, /Places/);
  await expect(page.getByTestId('phase14-places').locator('[data-place-id]')).toHaveCount(6);
  await expect(page.getByTestId('first-party-applications').locator('[data-application-id]')).toHaveCount(4);
  await page.screenshot({ path: evidencePath('phase14-places-phone.png'), fullPage: true });
});
