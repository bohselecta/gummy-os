import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function onboard(page) {
  await page.goto('/');
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Market Advantage Tester');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
}

test('Gummy Box launchpad sends a canonical source into Composer without execution', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: /Gummy Box/ }).click();
  const box = page.getByTestId('gummy-box');
  await expect(box.getByTestId('gummy-box-launchpad')).toBeVisible();
  await expect(box.getByText('Continue, arrange, or bring something in')).toBeVisible();

  const source = box.locator('[data-gummy-id="gummy:project-brief"]');
  await source.getByRole('button', { name: 'Add Project Brief.md in Composer' }).click();
  const composer = page.getByTestId('composer-surface');
  await expect(composer).toBeVisible();
  const linkedSource = composer.locator('[data-ref-kind="gummy"][data-ref-id="gummy:project-brief"]');
  await expect(linkedSource).toHaveCount(1);
  await expect(linkedSource).toContainText('Project Brief.md');
  await expect(composer).toContainText(/nothing runs here/i);

  const state = await page.evaluate(async () => {
    const request = indexedDB.open('gummy-os');
    const database = await new Promise(resolve => { request.onsuccess = () => resolve(request.result); });
    const read = name => new Promise(resolve => {
      const operation = database.transaction(name).objectStore(name).getAll();
      operation.onsuccess = () => resolve(operation.result);
    });
    const result = {
      runs: await read('productionRuns'),
      workOrders: await read('workOrders'),
      grants: await read('grants')
    };
    database.close();
    return result;
  });
  expect(state.runs).toHaveLength(0);
  expect(state.workOrders.filter(item => item.productionId)).toHaveLength(0);
  expect(state.grants.filter(item => item.scope?.productionId)).toHaveLength(0);
});

test('Composer starts from a goal, applies a reversible pattern, and explains impact', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: 'Composer' }).click();
  const composer = page.getByTestId('composer-surface');
  await composer.getByRole('button', { name: 'Create a blank composition' }).click();

  const brief = composer.getByTestId('composer-brief');
  await brief.getByLabel('Desired result').fill('Create a short launch video that explains Gummy clearly.');
  await brief.getByLabel('Audience').fill('Curious creators');
  await brief.getByLabel('Success looks like').fill('A Human accepts an exact video package and nothing publishes automatically.');
  await brief.getByLabel('Boundaries and constraints').fill('Use only selected brand-owned sources.');
  await brief.getByRole('button', { name: 'Save the brief' }).click();
  await expect(brief.getByText('Goal defined')).toBeVisible();

  const starters = composer.getByTestId('composer-starters');
  await starters.getByText('Make and prepare a video', { exact: true }).locator('..').getByRole('button', { name: 'Use this pattern' }).click();
  await expect(composer.locator('[data-node-id]').filter({ hasText: 'ImageHoss' })).toBeVisible();
  await expect(composer.locator('[data-node-id]').filter({ hasText: 'VideoBoss' })).toBeVisible();
  await expect(composer.locator('[data-node-id]').filter({ hasText: 'Human reviews the result' })).toBeVisible();
  await expect(composer.locator('[data-node-id]').filter({ hasText: 'Prepare for Channels' })).toContainText('planned');

  const impact = composer.getByTestId('composer-impact');
  await expect(impact).toContainText('Proposal only');
  await expect(impact).toContainText('Not started');
  await expect(impact).toContainText('Not estimated yet');
  await expect(composer.getByRole('button', { name: /Make Production/ })).toHaveCount(0);

  await page.reload();
  await page.getByRole('tab', { name: 'Composer' }).click();
  await expect(page.getByTestId('composer-brief').getByLabel('Desired result')).toHaveValue('Create a short launch video that explains Gummy clearly.');
  await expect(page.getByTestId('composer-surface').locator('[data-node-id]').filter({ hasText: 'VideoBoss' })).toBeVisible();

  const findings = await new AxeBuilder({ page }).include('[data-testid="composer-surface"]').analyze();
  expect(findings.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);
});
