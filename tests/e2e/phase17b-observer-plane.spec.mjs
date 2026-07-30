import { createHash } from 'node:crypto';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

async function onboard(page) {
  await page.goto('/');
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Observer Plane Tester');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
  await page.getByRole('tab', { name: /Productions/ }).click();
}

async function observerSnapshot(page) {
  return page.evaluate(async () => {
    const request = indexedDB.open('gummy-os');
    const database = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const all = storeName => new Promise((resolve, reject) => {
      const operation = database.transaction(storeName).objectStore(storeName).getAll();
      operation.onsuccess = () => resolve(operation.result);
      operation.onerror = () => reject(operation.error);
    });
    const snapshot = {
      productions: await all('productions'),
      configurations: await all('productionConfigurations'),
      plans: await all('actorPlans'),
      runs: await all('productionRuns'),
      workOrders: await all('workOrders'),
      leases: await all('taskLeases'),
      grants: await all('grants'),
      returns: await all('returns'),
      receipts: await all('receipts'),
      gummies: await all('gummies')
    };
    database.close();
    return snapshot;
  });
}

async function closeRestoredActorWindows(page) {
  const actorWindows = page.locator(
    '[data-window-id^="actor-surface:actor:"][data-window-id*="production:night-gummy-launch:"]'
  );
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const count = await actorWindows.count();
    if (count === 0) return;
    await actorWindows
      .nth(count - 1)
      .locator('[data-window-action="close"]')
      .evaluate(button => button.click());
    await expect.poll(async () => actorWindows.count()).toBeLessThan(count);
  }
  await expect(actorWindows).toHaveCount(0);
}

async function saveActorConfiguration(page, production, actorId, actorName) {
  await closeRestoredActorWindows(page);
  await production.locator('.actor-card').filter({ hasText: `@${actorName}` })
    .getByRole('button', { name: `Open ${actorName}` }).click();
  const actor = page.locator(
    `[data-window-id="actor-surface:actor:${actorId}:production:night-gummy-launch:main"]`
  );
  await actor.getByRole('button', { name: `Save for Night Gummy Launch` }).click();
  await expect(actor.getByText(/ready · sha256:/)).toBeVisible();
  await actor.getByRole('button', { name: `Close ${actorName}` }).click();
  await expect(actor).toHaveCount(0);
}

function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function hasSha256(record) {
  const hash = typeof record.hash === 'string' ? record.hash : record.hash?.value;
  return /^(sha256:)?[a-f0-9]{64}$/.test(hash || '');
}

test('separate browser Observer proves completion across worker replacement without worker narration', async ({
  context,
  page: firstWorker
}, testInfo) => {
  await onboard(firstWorker);
  const firstProduction = firstWorker.locator('[data-window-id="productions"]');
  await firstProduction.getByRole('button', { name: 'Open the Night Gummy Launch sample' }).click();
  await firstProduction.getByRole('button', { name: 'Add launch specialists' }).click();

  await saveActorConfiguration(firstWorker, firstProduction, 'imagehoss', 'ImageHoss');
  await saveActorConfiguration(firstWorker, firstProduction, '3d-bee', 'Meshmallow');

  const observer = await context.newPage();
  await observer.goto('/');
  await expect(observer.getByRole('region', { name: 'Gummy Canvas' })).toBeVisible();
  const before = await observerSnapshot(observer);
  expect(before.runs).toHaveLength(0);
  expect(
    before.configurations
      .filter(item => ['actor:imagehoss', 'actor:3d-bee'].includes(item.actorId))
      .every(item => item.readiness === 'ready')
  ).toBe(true);
  expect(
    before.configurations.find(item => item.actorId === 'actor:videoboss').readiness
  ).not.toBe('ready');

  const beforeScreenshot = testInfo.outputPath('observer-before-worker-replacement.png');
  const beforeState = testInfo.outputPath('observer-state-before.json');
  await observer.screenshot({ path: beforeScreenshot, fullPage: true });
  await writeFile(beforeState, JSON.stringify(before, null, 2));

  await firstWorker.close();
  expect(firstWorker.isClosed()).toBe(true);

  const replacementWorker = await context.newPage();
  await replacementWorker.goto('/');
  await expect(replacementWorker.getByRole('region', { name: 'Gummy Canvas' })).toBeVisible();
  const replacementProduction = replacementWorker.locator('[data-window-id="productions"]');
  await expect(
    replacementProduction.getByRole('heading', { name: 'Night Gummy Launch' })
  ).toBeVisible();

  for (const [actorId, actorName] of [
    ['videoboss', 'VideoBoss'],
    ['project-composer', 'ProjectComposer'],
    ['gummy-storage', 'GummyStorage']
  ]) {
    await saveActorConfiguration(
      replacementWorker,
      replacementProduction,
      actorId,
      actorName
    );
  }

  await replacementProduction.getByRole('button', { name: 'Actor Plan' }).click();
  await replacementProduction.getByRole('button', { name: 'Compile graph' }).click();
  await expect(replacementProduction.locator('.plan-node')).toHaveCount(6);
  await replacementProduction.getByRole('button', { name: 'Make Production' }).click();
  const preview = replacementProduction.getByRole('dialog', {
    name: 'Master Control Run preview'
  });
  await expect(preview).toContainText('Ready to review');
  await preview.getByRole('button', { name: 'Approve & Make Production' }).click();
  await expect(replacementProduction.locator('.run-card')).toHaveCount(1);

  await expect.poll(async () => (await observerSnapshot(observer)).runs.length).toBe(1);
  const after = await observerSnapshot(observer);
  const run = after.runs[0];
  const observedReturns = after.returns.filter(item => run.returnIds.includes(item.id));
  const observedReceipts = after.receipts.filter(item => run.receiptIds.includes(item.id));
  const observedResults = after.gummies.filter(item => run.resultGummyIds.includes(item.id));

  expect(run.status).toBe('completed');
  expect(observedReturns).toHaveLength(5);
  expect(observedReturns.every(item => item.result === 'completed')).toBe(true);
  expect(observedReceipts).toHaveLength(5);
  expect(observedReceipts.every(item => item.outcome === 'completed')).toBe(true);
  expect(observedResults).toHaveLength(5);
  expect(observedResults.every(hasSha256)).toBe(true);
  expect(observedResults.every(item => Number(item.revision) >= 1)).toBe(true);
  expect(after.workOrders.filter(item => run.workOrderIds.includes(item.id))).toHaveLength(5);
  expect(after.grants.filter(item => run.grantIds.includes(item.id))).toHaveLength(5);
  expect(after.leases.filter(item => run.taskLeaseIds.includes(item.id))).toHaveLength(5);
  expect(digest(after)).not.toBe(digest(before));

  await observer.reload();
  const observerProduction = observer.locator('[data-window-id="productions"]');
  await observerProduction.getByRole('button', { name: 'Run history' }).click();
  await expect(observerProduction.locator('.run-card')).toHaveCount(1);
  const afterScreenshot = testInfo.outputPath('observer-after-worker-replacement.png');
  const afterState = testInfo.outputPath('observer-state-after.json');
  await observer.screenshot({ path: afterScreenshot, fullPage: true });
  await writeFile(afterState, JSON.stringify(after, null, 2));

  for (const evidencePath of [
    beforeScreenshot,
    beforeState,
    afterScreenshot,
    afterState
  ]) {
    expect((await stat(evidencePath)).size).toBeGreaterThan(0);
    expect(createHash('sha256').update(await readFile(evidencePath)).digest('hex'))
      .toMatch(/^[a-f0-9]{64}$/);
  }

  await testInfo.attach('observer-before-worker-replacement', {
    path: beforeScreenshot,
    contentType: 'image/png'
  });
  await testInfo.attach('observer-after-worker-replacement', {
    path: afterScreenshot,
    contentType: 'image/png'
  });
  await testInfo.attach('observer-state-after', {
    path: afterState,
    contentType: 'application/json'
  });
});
