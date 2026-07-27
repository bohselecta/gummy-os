import { expect, test } from '@playwright/test';

test('Ranch Day completes, persists, and future Runs stop after relationship revocation', async ({ page, context, browser }) => {
  const errors = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Start with the undertaking' })).toBeVisible();
  await page.getByRole('button', { name: 'Start private Ranch Day Production' }).click();
  await expect(page.getByRole('heading', { name: 'Ranch Day' })).toBeVisible();

  const initial = await runtimeState(page);
  expect(initial.productionRuns).toHaveLength(0);
  expect(initial.workOrders).toHaveLength(0);
  expect(initial.grants).toHaveLength(0);

  const mention = page.getByRole('textbox', { name: 'Mention or search Actor' });
  await mention.fill('@VideoBoss');
  await page.getByRole('button', { name: 'Add Actor' }).click();
  await expect(page.getByRole('heading', { name: '@VideoBoss' })).toBeVisible();
  expect((await runtimeState(page)).productionRuns).toHaveLength(0);

  await page.getByRole('button', { name: 'Add Ranch Day roster' }).click();
  await expect(page.locator('.actor-card')).toHaveCount(7);

  await page.locator('.actor-card').filter({ hasText: '@VideoBoss' }).getByRole('button', { name: 'Keyboard/touch proposal' }).click();
  await expect(page.getByRole('dialog', { name: 'Typed proposal preview' })).toContainText('NO EXECUTION');
  await expect(page.getByRole('dialog', { name: 'Typed proposal preview' })).toContainText('keyboard');
  await page.getByRole('button', { name: 'Accept proposal' }).click();
  expect((await runtimeState(page)).grants).toHaveLength(0);

  for (const actor of ['ImageHoss', '3D-Bee', 'VideoBoss', 'ProjectComposer', 'GummyStorage']) {
    const card = page.locator('.actor-card').filter({ hasText: `@${actor}` });
    await card.getByRole('button', { name: 'Open Actor surface' }).click();
    const surface = page.locator(`[data-window-id*="actor-surface:actor:${actor === 'ProjectComposer' ? 'project-composer' : actor === 'GummyStorage' ? 'gummy-storage' : actor.toLowerCase()}"]`);
    await expect(surface.locator('.scope-chip')).toHaveText('Production: Ranch Day');
    await expect(surface.getByText('this window is a view/controller')).toBeVisible();
    await surface.getByRole('button', { name: 'Save for Ranch Day' }).click();
    await expect(surface.getByText(/ready · sha256:/)).toBeVisible();
    await surface.getByRole('button', { name: 'Close' }).click();
  }

  await page.getByRole('button', { name: 'Actor Plan' }).click();
  await page.getByRole('button', { name: 'Compile graph' }).click();
  await expect(page.locator('.plan-node')).toHaveCount(7);
  await expect(page.locator('.plan-edge')).toHaveCount(10);
  await expect(page.locator('.plan-node').filter({ hasText: '@Hoyt' })).toContainText('No Agent');
  const edgeText = await page.locator('.edge-type').allTextContents();
  expect(new Set(edgeText)).toEqual(new Set(['context', 'setup', 'input', 'execution', 'review', 'approval', 'storage', 'publication']));

  await page.getByRole('button', { name: 'Make Production' }).click();
  const preview = page.getByRole('dialog', { name: 'Master Control Run preview' });
  await expect(preview).toContainText('Ready for Human approval');
  await expect(preview).toContainText('Human → Master Control');
  await preview.getByRole('button', { name: 'Approve & Make Production' }).click();
  await expect(page.locator('.run-card')).toHaveCount(1);

  const completed = await runtimeState(page);
  expect(completed.productionRuns).toHaveLength(1);
  expect(completed.productionRuns[0].schema).toBe('gummy.production-run/v0');
  expect(completed.productionRuns[0].status).toBe('completed');
  expect(completed.productionRuns[0].resultGummyIds).toHaveLength(5);
  expect(completed.workOrders).toHaveLength(5);
  expect(completed.taskLeases).toHaveLength(5);
  expect(completed.grants).toHaveLength(5);
  expect(completed.contextEnvelopes).toHaveLength(5);
  expect(completed.returns).toHaveLength(5);
  expect(completed.contextEnvelopes.find(item => item.targetActorId === 'actor:videoboss').excludes).toContain('complete-actor-memory');

  const sourceEvidence = completed.gummies
    .filter(item => item.status === 'source')
    .map(item => ({ id: item.id, hash: item.hash, content: item.content }));

  await page.locator('[data-window-id="productions"]').getByRole('button', { name: 'Master Control', exact: true }).click();
  const master = page.locator('[data-window-id="master-control:production:ranch-day"]');
  await expect(master.getByRole('heading', { name: 'Master Control' })).toBeVisible();
  await master.getByRole('button', { name: 'Context · data flow' }).click();
  const videoEnvelope = master.locator('.context-envelope-card').filter({ hasText: '@VideoBoss' });
  await videoEnvelope.locator('summary').click();
  await expect(videoEnvelope.getByText('complete-actor-memory')).toBeVisible();
  await master.getByRole('button', { name: 'Revocation · locks' }).click();
  await master.getByRole('button', { name: 'Revoke future use' }).click();
  await expect(master.getByText('Future Runs blocked')).toBeVisible();
  await master.getByRole('button', { name: 'Close' }).click();

  const afterRevoke = await runtimeState(page);
  expect(afterRevoke.productionRuns).toHaveLength(1);
  expect(afterRevoke.returns).toHaveLength(5);
  expect(afterRevoke.relationships[0].status).toBe('revoked');

  await page.getByRole('button', { name: 'Make Production' }).click();
  await expect(page.getByRole('dialog', { name: 'Master Control Run preview' })).toContainText('relationship-revoked');
  await expect(page.getByRole('button', { name: 'Approve & Make Production' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Close preview' }).click();

  expect((await runtimeState(page)).gummies.filter(item => item.status === 'source').map(item => ({ id: item.id, hash: item.hash, content: item.content }))).toEqual(sourceEvidence);

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Ranch Day' })).toBeVisible();
  await page.getByRole('button', { name: 'Run history' }).click();
  await expect(page.locator('.run-card')).toHaveCount(1);

  await page.getByRole('navigation', { name: 'Gummy Bar' }).getByRole('button', { name: /Master Control/ }).click();
  const globalMaster = page.locator('[data-window-id="masterControl"]');
  await globalMaster.getByRole('button', { name: 'Actors' }).click();
  await globalMaster.locator('.master-object-row').filter({ hasText: '@VideoBoss' }).getByRole('button', { name: 'Open canonical Actor surface' }).click();
  const standaloneVideoBoss = page.locator('[data-window-id="actor-surface:actor:videoboss:standalone:main"]');
  await expect(standaloneVideoBoss.getByText('Scope: Standalone')).toBeVisible();
  await expect(standaloneVideoBoss.getByText('Ranch Day', { exact: true })).toBeVisible();
  await expect(standaloneVideoBoss.getByText('No promoted defaults. Production settings remain isolated.')).toBeVisible();
  await standaloneVideoBoss.getByRole('button', { name: 'Close' }).click();
  await globalMaster.getByRole('button', { name: 'Close' }).click();

  const storageState = await context.storageState();
  const freshContext = await browser.newContext({ storageState, reducedMotion: 'reduce', colorScheme: 'dark' });
  const freshPage = await freshContext.newPage();
  await freshPage.goto(page.url());
  await expect(freshPage.getByRole('heading', { name: 'Ranch Day' })).toBeVisible();
  const freshRuntime = await runtimeState(freshPage);
  expect(freshRuntime.productionRuns).toHaveLength(1);
  expect(freshRuntime.relationships[0].status).toBe('revoked');
  await freshContext.close();

  expect(errors).toEqual([]);
});

test('Make Production visibly blocks unresolved service configuration', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start private Ranch Day Production' }).click();
  await page.getByRole('button', { name: 'Add Ranch Day roster' }).click();
  await page.getByRole('button', { name: 'Make Production' }).click();
  const preview = page.getByRole('dialog', { name: 'Master Control Run preview' });
  await expect(preview).toContainText('Make Production is blocked');
  await expect(preview).toContainText('configuration-not-ready:actor:videoboss');
  await expect(preview.getByRole('button', { name: 'Approve & Make Production' })).toHaveCount(0);
});

test('pointer drag creates typed Actor and Gummy proposals without execution', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start private Ranch Day Production' }).click();
  const actorSource = page.locator('.search-actor').filter({ hasText: '@ImageHoss' });
  await actorSource.dragTo(page.locator('.actor-roster'));
  const actorIntent = page.getByRole('dialog', { name: 'Typed proposal preview' });
  await expect(actorIntent).toContainText('participant-membership');
  await expect(actorIntent).toContainText('pointer');
  await actorIntent.getByRole('button', { name: 'Accept proposal' }).click();
  let runtime = await runtimeState(page);
  expect(runtime.participants.find(item => item.actorId === 'actor:imagehoss').source).toBe('drag');
  expect(runtime.productionRuns).toHaveLength(0);
  expect(runtime.grants).toHaveLength(0);

  await page.getByRole('button', { name: 'Add Ranch Day roster' }).click();
  await page.getByRole('button', { name: 'Gummy shelf' }).click();
  await page.evaluate(() => {
    const source = [...document.querySelectorAll('.gummy-card')].find(node => node.textContent.includes('Ranch Day source brief'));
    const target = document.querySelector('.actor-input-dropzone');
    const dataTransfer = new DataTransfer();
    source.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer }));
    target.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer }));
    target.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }));
  });
  const gummyIntent = page.getByRole('dialog', { name: 'Typed proposal preview' });
  await expect(gummyIntent).toContainText('task-input');
  await expect(gummyIntent).toContainText('mold:videoboss:private-family-video');
  await gummyIntent.getByRole('button', { name: 'Accept proposal' }).click();
  runtime = await runtimeState(page);
  expect(runtime.configurations.find(item => item.actorId === 'actor:videoboss').inputGummyIds).toContain('gummy:ranch-day-source-brief');
  expect(runtime.productionRuns).toHaveLength(0);
  expect(runtime.grants).toHaveLength(0);
});

async function runtimeState(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('gummy-os:v0.2')).productionRuntime);
}
