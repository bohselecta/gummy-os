import { mkdir } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

const directory = 'evidence/visual/phase16';
await mkdir(directory, { recursive: true });

async function onboard(page) {
  await page.goto('/');
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Phase 16 Evidence');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
}

test('captures exact Phase 16 Command Center and saved-group evidence', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: 'Command Center' }).click();
  let commandCenter = page.getByRole('region', { name: 'Command Center window' });
  await commandCenter.getByTestId('phase16-run-proof').click();
  await expect(page.locator('.toast-layer')).toContainText('Phase 16 local proof completed', { timeout: 20_000 });
  commandCenter = page.getByRole('region', { name: 'Command Center window' });
  await expect(commandCenter.locator('.phase16-progress-complete')).toHaveCount(11);
  await expect(page.locator('.toast-layer .toast')).toHaveCount(0, { timeout: 6_000 });
  await commandCenter.getByRole('button', { name: 'Maximize Command Center' }).click();
  await commandCenter.locator('.window-body').evaluate(node => node.scrollTo(0, 0));
  await page.screenshot({ path: `${directory}/command-center-desktop-night.png`, fullPage: true });
  await commandCenter.getByTestId('phase16-proof-status').screenshot({
    path: `${directory}/complete-local-proof.png`
  });

  await commandCenter.getByTestId('phase16-open-group').click();
  await expect(page.locator('.gummy-window[data-window-id^="social-window:"]')).toHaveCount(5);
  await page.screenshot({ path: `${directory}/social-instance-windows.png`, fullPage: true });

  await page.getByRole('tab', { name: 'Command Center' }).click();
  await expect(page.locator('.gummy-window[data-window-id="command-center"]')).toHaveAttribute('data-focused', 'true');
  await page.setViewportSize({ width: 320, height: 720 });
  await expect(page.getByTestId('phase16-command-center')).toBeVisible();
  await commandCenter.locator('.window-body').evaluate(node => node.scrollTo(0, 0));
  await page.screenshot({ path: `${directory}/command-center-phone-night.png`, fullPage: true });
});
