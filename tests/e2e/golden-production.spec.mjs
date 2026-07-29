import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { evidencePath } from './evidence-path.mjs';

async function onboard(page) {
  await page.goto('/');
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Test User');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
  await page.getByRole('tab', { name: /Productions/ }).click();
}

async function durable(page) {
  return page.evaluate(async () => {
    const request = indexedDB.open('gummy-os');
    const db = await new Promise(resolve => { request.onsuccess = () => resolve(request.result); });
    const all = name => new Promise(resolve => {
      const operation = db.transaction(name).objectStore(name).getAll();
      operation.onsuccess = () => resolve(operation.result);
    });
    return {
      productions: await all('productions'),
      runs: await all('productionRuns'),
      envelopes: await all('contextEnvelopes'),
      returns: await all('returns'),
      receipts: await all('receipts'),
      gummies: await all('gummies'),
      links: await all('links'),
      grants: await all('grants')
    };
  });
}

test('Night Gummy Launch runs, compares, accepts, revises, and restarts with complete evidence', async ({ page }) => {
  await onboard(page);
  const production = page.locator('[data-window-id="productions"]');
  await production.getByRole('button', { name: 'Open the Night Gummy Launch sample' }).click();
  await expect(production.getByRole('heading', { name: 'Night Gummy Launch' })).toBeVisible();
  await expect(production.locator('.demonstration-lane')).toContainText('not real generated image, video, or Blender output');
  await production.getByRole('button', { name: 'Add launch specialists' }).click();
  await expect(production.locator('.actor-card')).toHaveCount(6);

  for (const [actorId, actorName] of [
    ['imagehoss', 'ImageHoss'],
    ['3d-bee', 'Meshmallow'],
    ['videoboss', 'VideoBoss'],
    ['project-composer', 'ProjectComposer'],
    ['gummy-storage', 'GummyStorage']
  ]) {
    await production.locator('.actor-card').filter({ hasText: `@${actorName}` })
      .getByRole('button', { name: `Open ${actorName}` }).click();
    const actor = page.locator(`[data-window-id="actor-surface:actor:${actorId}:production:night-gummy-launch:main"]`);
    if (actorId === 'imagehoss' || actorId === 'videoboss' || actorId === '3d-bee') {
      for (const section of ['Direction', 'Deliverable', 'Locks', 'References / Assets', 'Exploration', 'Exclusions', 'Route and capability', 'Acceptance', 'Compiled preview']) {
        await expect(actor.getByRole('heading', { name: section })).toBeVisible();
      }
      await expect(actor.getByText('This readable package is compiled without starting a Job or calling a provider.')).toBeVisible();
      const schema = actorId === 'imagehoss'
        ? 'gummy.imagehoss-production-configuration/v1'
        : actorId === 'videoboss'
          ? 'gummy.videoboss-production-configuration/v1'
          : 'gummy.meshmallow-production-configuration/v1';
      await expect(actor.getByText(schema)).not.toBeVisible();
      await actor.getByText('View technical package').click();
      await expect(actor.getByText(schema)).toBeVisible();
    }
    await actor.getByRole('button', { name: `Save for Night Gummy Launch` }).click();
    await expect(actor.getByText(/ready · sha256:/)).toBeVisible();
    await actor.getByRole('button', { name: `Close ${actorName}` }).click();
  }

  await production.getByRole('button', { name: 'Actor Plan' }).click();
  await production.getByRole('button', { name: 'Compile graph' }).click();
  await expect(production.locator('.plan-node')).toHaveCount(6);
  await production.getByRole('button', { name: 'Make Production' }).click();
  const preview = production.getByRole('dialog', { name: 'Master Control Run preview' });
  await expect(preview).toContainText('Ready to review');
  await preview.getByRole('button', { name: 'Approve & Make Production' }).click();
  await expect(production.locator('.run-card')).toHaveCount(1);

  await production.getByRole('button', { name: 'Gummy shelf' }).click();
  await expect(production.locator('.gummy-card.gummy-result')).toHaveCount(5);
  await production.getByRole('button', { name: 'Accept as launch-image' }).click();
  await expect(production.getByText('accepted · launch-image')).toBeVisible();
  await page.locator('.toast-layer .toast').evaluateAll(nodes => nodes.forEach(node => node.remove()));
  await production.screenshot({ path: evidencePath('night-gummy-launch-golden.png') });

  let state = await durable(page);
  expect(state.runs).toHaveLength(1);
  expect(state.returns.filter(item => item.productionRunId === state.runs[0].id)).toHaveLength(5);
  expect(state.grants.filter(item => item.scope?.productionRunId === state.runs[0].id || state.runs[0].grantIds.includes(item.id))).toHaveLength(5);
  const videoEnvelope = state.envelopes.find(item => item.targetActorId === 'actor:videoboss');
  expect(videoEnvelope.relationshipLinkIds).toEqual([]);
  expect(videoEnvelope.excludes).toContain('complete-actor-memory');
  expect(state.links.some(item => item.relation === 'accepted-as')).toBe(true);

  await production.getByRole('button', { name: 'Run history' }).click();
  await production.getByRole('button', { name: 'Keep everything except one direction' }).click();
  await expect(page.locator('.toast-layer')).toContainText('Accepted role locks were carried forward. No work executed.');
  await expect.poll(async () => (await durable(page)).productions[0]?.revisionHistory?.length || 0).toBe(1);
  const before = await durable(page);
  await page.reload();
  await expect(page.locator('[data-window-id="productions"]').getByRole('heading', { name: 'Night Gummy Launch' })).toBeVisible();
  state = await durable(page);
  expect(state.runs).toEqual(before.runs);
  expect(state.gummies.find(item => item.acceptance?.role === 'launch-image')).toBeTruthy();
  const a11y = await new AxeBuilder({ page }).include('[data-window-id="productions"]').analyze();
  expect(a11y.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);
});
