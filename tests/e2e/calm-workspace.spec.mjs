import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function onboard(page, name = 'Calm Workspace Tester') {
  await page.goto('/');
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill(name);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
}

test('desktop Calm Workspace keeps core destinations primary and system tools behind More', async ({ page }) => {
  await onboard(page);
  const desktop = page.locator('.gummy-desktop-nav');
  for (const name of ['Gummy', 'Gummy Box', 'Composer', 'Productions', 'Command Center']) {
    await expect(desktop.getByRole('tab', { name, exact: name !== 'Gummy Box' })).toBeVisible();
  }
  await expect(page.getByRole('menu', { name: 'System workspaces' })).toBeHidden();
  await page.getByRole('button', { name: 'More', exact: true }).click();
  const more = page.getByRole('menu', { name: 'System workspaces' });
  for (const name of ['People & groups', 'Places', 'Master Control', 'Browser', 'Work Orders', 'Receipts', 'Connections & runtimes', 'About / Limits']) {
    await expect(more.getByRole('menuitem', { name })).toBeVisible();
  }

  await more.getByRole('menuitem', { name: 'Connections & runtimes' }).click();
  const connections = page.getByRole('region', { name: 'Connections & runtimes window' });
  await expect(connections.getByTestId('connections-surface')).toBeVisible();
  await expect(connections.locator('[data-connection-id="local-box"]')).toHaveAttribute('data-connection-state', 'connected');
  await expect(connections.locator('[data-connection-id="mcp"]')).toHaveAttribute('data-connection-state', 'blocked');
  await expect(connections).toContainText('Gummy never probes localhost automatically');
  await expect(connections).not.toContainText(/api[_-]?key|bearer token|password/i);
});

test('Gummy Box starts with four calm questions and Composer is canvas-first', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: /Gummy Box/ }).click();
  const box = page.getByRole('region', { name: /Gummy Box window/ });
  const launchpad = box.getByTestId('gummy-box-launchpad');
  await expect(launchpad.locator('.continue-card')).toHaveCount(4);
  await expect(launchpad).toContainText('CONTINUE');
  await expect(launchpad).toContainText('START OR IMPORT');
  await expect(launchpad).toContainText('RECENT RESULT');
  await expect(launchpad).toContainText('NEEDS ATTENTION');

  await page.getByRole('tab', { name: 'Composer' }).click();
  const composer = page.getByRole('region', { name: 'Composer window' });
  await composer.getByRole('button', { name: 'Create a blank composition' }).click();
  const workspace = composer.locator('.composer-workspace');
  const order = await workspace.evaluate(node => [...node.children].map(child => child.className));
  expect(order.indexOf('composer-body')).toBeLessThan(order.indexOf('composer-market-layer'));
  await expect(composer.getByText('There is no execute button in Composer')).toBeVisible();
});

test('phone navigation and Composer modes preserve one foreground workspace', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await onboard(page, 'Calm Phone Tester');
  const phone = page.getByRole('navigation', { name: 'Phone workspaces' });
  for (const name of ['Gummy Box', 'Composer', 'Current', 'Gummy', 'More']) {
    await expect(phone.getByText(name, { exact: true })).toBeVisible();
  }
  await phone.getByRole('button', { name: 'Composer' }).click();
  const composer = page.getByRole('region', { name: 'Composer window' });
  await composer.getByRole('button', { name: 'Create a blank composition' }).click();
  for (const name of ['Goal', 'Arrange', 'Review', 'System Details']) {
    await expect(composer.getByRole('button', { name, exact: true })).toBeVisible();
  }
  await composer.getByRole('button', { name: 'Arrange', exact: true }).click();
  await expect(composer.locator('[data-composer-pane="arrange"]').first()).toBeVisible();
  await expect(page.locator('.gummy-window[data-focused="false"]')).toBeHidden();
  const results = await new AxeBuilder({ page }).exclude('iframe').analyze();
  expect(results.violations).toEqual([]);
});
