import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function onboard(page, mode = 'night') {
  await page.goto('/');
  await page.getByTestId(`mode-${mode}`).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByRole('button', { name: 'Continue without connecting' }).click();
  await page.getByTestId('enter-canvas').click();
  await page.getByRole('tab', { name: /Productions/ }).click();
  await expect(page.getByRole('heading', { name: /Start with the undertaking/ })).toBeVisible();
}

async function durableProductionState(page) {
  return page.evaluate(async () => {
    const request = indexedDB.open('gummy-os');
    const db = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const get = (store, id) => new Promise((resolve, reject) => {
      const operation = db.transaction(store).objectStore(store).get(id);
      operation.onsuccess = () => resolve(operation.result);
      operation.onerror = () => reject(operation.error);
    });
    const all = store => new Promise((resolve, reject) => {
      const operation = db.transaction(store).objectStore(store).getAll();
      operation.onsuccess = () => resolve(operation.result);
      operation.onerror = () => reject(operation.error);
    });
    return {
      index: await get('meta', 'production-runtime:index'),
      productions: await all('productions'),
      participants: await all('productionParticipants'),
      configurations: await all('productionConfigurations'),
      plans: await all('actorPlans'),
      runs: await all('productionRuns'),
      envelopes: await all('contextEnvelopes'),
      workOrders: await all('workOrders'),
      leases: await all('taskLeases'),
      grants: await all('grants'),
      returns: await all('returns'),
      receipts: await all('receipts'),
      gummies: await all('gummies'),
      links: await all('links'),
      dragIntents: await all('dragIntents')
    };
  });
}

test.beforeEach(async ({ page }) => {
  page.runtimeErrors = [];
  page.on('pageerror', error => page.runtimeErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') page.runtimeErrors.push(message.text());
  });
});

test.afterEach(async ({ page }) => {
  expect(page.runtimeErrors).toEqual([]);
});

test('Ranch Day executes through branded WebOS, persists exact evidence, and revocation blocks future Runs', async ({ page }) => {
  await onboard(page);
  const productionWindow = page.locator('[data-window-id="productions"]');
  await productionWindow.getByRole('button', { name: 'Start private Ranch Day Production' }).click();
  await expect(productionWindow.getByRole('heading', { name: 'Ranch Day' })).toBeVisible();

  await productionWindow.locator('.search-actor').filter({ hasText: '@ImageHoss' })
    .dragTo(productionWindow.locator('.actor-roster'));
  const pointerPreview = productionWindow.getByRole('dialog', { name: 'Typed proposal preview' });
  await expect(pointerPreview).toContainText('participant-membership');
  await expect(pointerPreview).toContainText('pointer');
  await pointerPreview.getByRole('button', { name: 'Accept proposal' }).click();

  await productionWindow.getByRole('button', { name: 'Add Ranch Day roster' }).click();
  await expect(productionWindow.locator('.actor-card')).toHaveCount(7);
  await expect(productionWindow.locator('.setup-rail [data-utility-id]')).toHaveCount(7);
  await page.locator('.toast-layer .toast').evaluateAll(nodes => nodes.forEach(node => node.remove()));
  await productionWindow.locator('.window-body').evaluate(node => { node.scrollTop = 0; });
  await productionWindow.screenshot({ path: 'artifacts/evidence/production-desktop-night.png' });
  await productionWindow.locator('.setup-rail').scrollIntoViewIfNeeded();
  await productionWindow.screenshot({ path: 'artifacts/evidence/production-desktop-utility-tiles.png' });

  const initial = await durableProductionState(page);
  expect(initial.runs).toHaveLength(0);
  expect(initial.grants).toHaveLength(0);
  expect(initial.index.authoritativeStore).toBe('IndexedDB');
  expect(initial.index.byteStore).toBe('OPFS');
  expect(initial.index.localStorageRole).toBe('preferences-and-migration-input-only');

  const videoCard = productionWindow.locator('.actor-card').filter({ hasText: '@VideoBoss' });
  await videoCard.getByRole('button', { name: 'Keyboard/touch proposal' }).click();
  const typedPreview = productionWindow.getByRole('dialog', { name: 'Typed proposal preview' });
  await expect(typedPreview).toContainText('TYPED INTENT PREVIEW — NO EXECUTION');
  await expect(typedPreview).toContainText('keyboard');
  await expect(typedPreview.locator('[data-utility-id="gummy.utility.setup"]')).toBeVisible();
  await typedPreview.getByRole('button', { name: 'Accept proposal' }).click();
  expect((await durableProductionState(page)).grants).toHaveLength(0);

  for (const [actorId, actorName] of [
    ['imagehoss', 'ImageHoss'],
    ['3d-bee', 'Meshmallow'],
    ['videoboss', 'VideoBoss'],
    ['project-composer', 'ProjectComposer'],
    ['gummy-storage', 'GummyStorage']
  ]) {
    await productionWindow.locator('.actor-card').filter({ hasText: `@${actorName}` })
      .getByRole('button', { name: 'Open Actor surface' }).click();
    const actorWindow = page.locator(`[data-window-id="actor-surface:actor:${actorId}:production:ranch-day:main"]`);
    await expect(actorWindow.getByText('Production: Ranch Day')).toBeVisible();
    await expect(actorWindow.getByText(/utility tile is not its application mark/i)).toBeVisible();
    await actorWindow.getByRole('button', { name: 'Save for Ranch Day' }).click();
    await expect(actorWindow.getByText(/ready · sha256:/)).toBeVisible();
    await actorWindow.getByRole('button', { name: `Close ${actorName}` }).click();
  }

  await productionWindow.getByRole('button', { name: 'Actor Plan' }).click();
  await productionWindow.getByRole('button', { name: 'Compile graph' }).click();
  await expect(productionWindow.locator('.plan-node')).toHaveCount(7);
  await expect(productionWindow.locator('.plan-edge')).toHaveCount(10);
  expect(new Set(await productionWindow.locator('.edge-type').allTextContents())).toEqual(
    new Set(['context', 'setup', 'input', 'execution', 'review', 'approval', 'storage', 'publication'])
  );

  await productionWindow.getByRole('button', { name: 'Make Production' }).click();
  const runPreview = productionWindow.getByRole('dialog', { name: 'Master Control Run preview' });
  await expect(runPreview).toContainText('Ready for Human approval');
  await expect(runPreview).toContainText('Human → Master Control');
  await expect(runPreview.locator('[data-utility-id="gummy.utility.progress"]')).toBeVisible();
  await runPreview.getByRole('button', { name: 'Approve & Make Production' }).click();
  await expect(productionWindow.locator('.run-card')).toHaveCount(1);

  await expect.poll(async () => (await durableProductionState(page)).runs.length).toBe(1);
  const completed = await durableProductionState(page);
  const run = completed.runs[0];
  expect(run.status).toBe('completed');
  expect(run.resultGummyIds).toHaveLength(5);
  expect(run.sourceGummyRevisions).toHaveLength(2);
  expect(run.manifestHash).toMatch(/^sha256:[a-f0-9]{64}$/);
  expect(completed.workOrders.filter(item => run.workOrderIds.includes(item.id))).toHaveLength(5);
  expect(completed.leases.filter(item => run.taskLeaseIds.includes(item.id) && item.status === 'completed')).toHaveLength(5);
  expect(completed.grants.filter(item => run.grantIds.includes(item.id))).toHaveLength(5);
  expect(completed.envelopes.filter(item => run.contextEnvelopeIds.includes(item.id))).toHaveLength(5);
  expect(completed.returns.filter(item => run.returnIds.includes(item.id) && item.result === 'completed')).toHaveLength(5);
  expect(completed.receipts.filter(item => run.receiptIds.includes(item.id) && item.outcome === 'completed')).toHaveLength(5);
  expect(completed.gummies.filter(item => run.resultGummyIds.includes(item.id))).toHaveLength(5);
  expect(completed.gummies.filter(item => run.resultGummyIds.includes(item.id)).every(item => item.content.byteRef.startsWith('/gummies/'))).toBe(true);

  await productionWindow.getByRole('button', { name: 'Master Control', exact: true }).click();
  const master = page.locator('[data-window-id="production-master-control:production:ranch-day"]');
  await master.getByRole('button', { name: 'Molds · Grants · Leases' }).click();
  const agentRows = master.locator('.master-object-row[data-utility-id="gummy.utility.agent"]');
  await expect(agentRows).toHaveCount(5);
  await expect(agentRows.first()).toContainText(/Runtime browser · locality web/);
  await expect(agentRows.first()).toContainText(/Mold .* Lease .* Grant/);
  await page.locator('.toast-layer .toast').evaluateAll(nodes => nodes.forEach(node => node.remove()));
  await agentRows.first().scrollIntoViewIfNeeded();
  await master.screenshot({ path: 'artifacts/evidence/production-master-control.png' });

  await master.getByRole('button', { name: 'Revocation · locks' }).click();
  await master.getByRole('button', { name: 'Revoke future use' }).click();
  await expect(master.getByText('Future Runs blocked')).toBeVisible();
  await master.getByRole('button', { name: 'Close Master Control' }).click();

  await productionWindow.getByRole('button', { name: 'Make Production' }).click();
  await expect(productionWindow.getByRole('dialog', { name: 'Master Control Run preview' })).toContainText('relationship-revoked');
  await expect(productionWindow.getByRole('button', { name: 'Approve & Make Production' })).toHaveCount(0);
  await productionWindow.getByRole('button', { name: 'Close preview' }).click();

  await expect.poll(async () => (await durableProductionState(page)).runs.length).toBe(1);
  const beforeRestart = await durableProductionState(page);
  await page.reload();
  await expect(page.locator('[data-window-id="productions"]').getByRole('heading', { name: 'Ranch Day' })).toBeVisible();
  const afterRestart = await durableProductionState(page);
  expect(afterRestart.runs).toEqual(beforeRestart.runs);
  expect(afterRestart.returns).toEqual(beforeRestart.returns);
  expect(afterRestart.gummies.filter(item => item.kind === 'file').map(item => item.hash))
    .toEqual(beforeRestart.gummies.filter(item => item.kind === 'file').map(item => item.hash));

  await page.getByRole('tab', { name: /Actors/ }).click();
  await page.locator('[data-window-id="actors"] [data-actor-id="actor:videoboss"]')
    .getByRole('button', { name: 'Open standalone Actor view' }).click();
  const standalone = page.locator('[data-window-id="actor-surface:actor:videoboss:standalone:main"]');
  await expect(standalone.getByText('Scope: Standalone')).toBeVisible();
  await expect(standalone.getByText('Ranch Day', { exact: true })).toBeVisible();
  await expect(standalone.getByText('No promoted defaults. Production settings remain isolated.')).toBeVisible();
});

test('blocked typed input and unresolved Make Production expose exact text without granting authority', async ({ page }) => {
  await onboard(page);
  const productionWindow = page.locator('[data-window-id="productions"]');
  await productionWindow.getByRole('button', { name: 'Start private Ranch Day Production' }).click();
  await productionWindow.getByRole('button', { name: 'Add Ranch Day roster' }).click();

  const accessibility = await new AxeBuilder({ page }).include('[data-window-id="productions"]').analyze();
  expect(accessibility.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);

  await productionWindow.locator('.actor-card').filter({ hasText: '@ImageHoss' })
    .getByRole('button', { name: 'Route to VideoBoss' }).click();
  const touchRoute = productionWindow.getByRole('dialog', { name: 'Typed proposal preview' });
  await expect(touchRoute).toContainText('actor-routing');
  await expect(touchRoute).toContainText('touch');
  await touchRoute.getByRole('button', { name: 'Accept proposal' }).click();
  await expect.poll(async () => (await durableProductionState(page)).links.some(item => item.relation === 'routes-to')).toBe(true);
  const routed = await durableProductionState(page);
  expect(routed.grants).toHaveLength(0);

  await productionWindow.getByRole('button', { name: 'Gummy shelf' }).click();
  await productionWindow.locator('.gummy-card').filter({ hasText: 'Ranch Day source brief' })
    .getByRole('button', { name: 'Propose as VideoBoss input' }).click();
  const intent = productionWindow.getByRole('dialog', { name: 'Typed proposal preview' });
  await expect(intent).toContainText('accepted-input-required:gummy/reference-set|gummy/scene-manifest|gummy/approved-likeness');
  await expect(intent).toContainText('text/markdown');
  await expect(intent).toContainText('NO EXECUTION');
  await expect(intent.getByRole('button', { name: 'Accept proposal' })).toHaveCount(0);
  await intent.getByRole('button', { name: 'Cancel' }).click();

  await productionWindow.getByRole('button', { name: 'Make Production' }).click();
  const preview = productionWindow.getByRole('dialog', { name: 'Master Control Run preview' });
  await expect(preview).toContainText('Make Production is blocked');
  await expect(preview).toContainText('configuration-not-ready:actor:videoboss');
  await expect(preview.getByRole('button', { name: 'Approve & Make Production' })).toHaveCount(0);
  const durable = await durableProductionState(page);
  expect(durable.runs).toHaveLength(0);
  expect(durable.grants).toHaveLength(0);
});

test('phone and reduced-motion Production keep utility meaning and critical actions reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await onboard(page, 'day');
  const productionWindow = page.locator('[data-window-id="productions"]');
  await productionWindow.getByRole('button', { name: 'Start private Ranch Day Production' }).click();
  await productionWindow.getByRole('button', { name: 'Add Ranch Day roster' }).click();
  await expect(productionWindow.getByRole('button', { name: 'Make Production' })).toBeVisible();
  await expect(productionWindow.locator('.setup-rail')).toBeVisible();
  await expect(productionWindow.locator('.setup-rail img[data-utility-id]')).toHaveCount(7);
  await expect(productionWindow.getByAltText('Agent Runtime').first()).toBeVisible();
  await expect(productionWindow.locator('img[data-utility-id]').first()).toHaveCSS('height', /.+/);
  await page.locator('.toast-layer .toast').evaluateAll(nodes => nodes.forEach(node => node.remove()));
  await productionWindow.locator('.window-body').evaluate(node => { node.scrollTop = 0; });
  await page.screenshot({ path: 'artifacts/evidence/production-phone-day-reduced-motion.png', fullPage: true });
  await productionWindow.locator('.setup-rail').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'artifacts/evidence/production-phone-day-utility-tiles.png', fullPage: true });
});
