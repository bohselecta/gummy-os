import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

async function onboarding(page, mode, layout = 'desktop') {
  await page.goto('/');
  await page.getByTestId(`mode-${mode}`).click();
  const selectorName = layout === 'desktop' ? `${mode}-theme-selector.png` : `${mode}-${layout}-theme-selector.png`;
  await page.screenshot({ path: `artifacts/evidence/${selectorName}`, fullPage: true });
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByRole('button', { name: 'Continue without connecting' }).click();
  await page.getByTestId('enter-canvas').click();
  await expect(page.getByRole('region', { name: 'Gummy Canvas' })).toBeVisible();
}

test.beforeAll(async () => mkdir('artifacts/evidence', { recursive: true }));

test('captures founder-review visual evidence', async ({ page }) => {
  await onboarding(page, 'night');
  await page.screenshot({ path: 'artifacts/evidence/night-canvas-bar.png', fullPage: true });
  await page.getByRole('tab', { name: /Glopper/ }).click();
  await expect(page.getByRole('complementary', { name: 'Glopper Panel' })).toBeVisible();
  await page.screenshot({ path: 'artifacts/evidence/glopper-conversation.png', fullPage: true });
  await page.getByRole('tab', { name: 'Inbox' }).click();
  await page.screenshot({ path: 'artifacts/evidence/awaiting-approval.png', fullPage: true });
  await page.getByRole('tab', { name: /My Gummies/ }).focus();
  await page.screenshot({ path: 'artifacts/evidence/keyboard-focus.png', fullPage: true });
  await page.getByRole('button', { name: 'Switch Night or Day Gummy' }).click();
  await page.getByRole('button', { name: 'Close Glopper Panel' }).click();
  await page.screenshot({ path: 'artifacts/evidence/day-canvas-bar.png', fullPage: true });
  await expect(page.locator('html')).toHaveAttribute('data-gummy-mode', 'day');
  await page.getByRole('tab', { name: /My Gummies/ }).click();
  await page.locator('input[type="file"]').setInputFiles({ name: 'quarantine-proof.md', mimeType: 'text/markdown', buffer: Buffer.from('# quarantine proof') });
  await page.getByRole('button', { name: 'Deny promotion' }).click();
  await expect(page.getByText('blocked', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'artifacts/evidence/quarantined-blocked.png', fullPage: true });
});

test('captures phone and reduced-motion evidence', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 720 });
  await onboarding(page, 'night', 'phone');
  await page.screenshot({ path: 'artifacts/evidence/night-phone-reduced-motion.png', fullPage: true });
  await page.getByAltText('Gummy, the VR-goggled chimp guide').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'artifacts/evidence/night-phone-brand.png', fullPage: true });
  await page.getByRole('tab', { name: /Glopper/ }).click();
  await page.screenshot({ path: 'artifacts/evidence/phone-reduced-motion.png', fullPage: true });
  await page.getByRole('button', { name: 'Switch Night or Day Gummy' }).click();
  await page.getByRole('button', { name: 'Close Glopper Panel' }).click();
  await expect(page.locator('.toast-layer .toast')).toHaveCount(0, { timeout: 6_000 });
  await page.getByAltText('Gummy, the VR-goggled chimp guide').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'artifacts/evidence/day-phone-brand.png', fullPage: true });
});
