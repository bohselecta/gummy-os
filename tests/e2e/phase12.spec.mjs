import { test, expect } from '@playwright/test';

async function onboard(page) {
  await page.goto('/');
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Phase 12 Tester');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
  await expect(page.getByRole('region', { name: 'Gummy Canvas' })).toBeVisible();
}

test('Living Actor presence and governed private Glopper chat persist with transcript, failure-safe controls, and Receipts', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: /Actors/ }).click();
  const glopper = page.locator('[data-presence-id="actor:glopper"]');
  await expect(glopper).toContainText('available for chat');
  await expect(glopper).toContainText('actor:glopper');
  await expect(glopper).toContainText('agent:glopper-web');
  await glopper.getByRole('button', { name: 'Open private chat' }).click();
  const chat = page.getByTestId('private-actor-chat');
  await expect(chat).toContainText('actor:glopper');
  await expect(chat).toContainText('agent:glopper-web');
  await expect(chat).toContainText('Make Production remains separate');
  await chat.getByLabel('Message Glopper').fill('Can we talk without starting a Production?');
  await chat.getByRole('button', { name: 'Approve context, cost & send' }).click();
  await expect(chat.getByText(/private governed test reply/i)).toBeVisible();
  await expect(chat.getByText(/OpenAI \(mocked\)/)).toBeVisible();
  await chat.getByRole('button', { name: 'Close chat' }).click();
  await expect(chat.getByText('closed', { exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole('region', { name: /Private chat · Glopper window/ })).toBeVisible();
  await expect(page.getByText(/private governed test reply/i)).toBeVisible();
  await page.getByRole('button', { name: 'Reopen chat' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export chat' }).click();
  expect((await download).suggestedFilename()).toMatch(/gummy-chat\.json$/);
  await page.getByRole('button', { name: 'Delete chat' }).click();
  await page.getByRole('button', { name: 'Confirm delete chat' }).click();
  await expect(page.getByRole('region', { name: /Private chat · Glopper window/ })).toHaveCount(0);
  await page.getByRole('tab', { name: /Receipts/ }).click();
  await expect(page.getByText('delete-private-actor-chat')).toBeVisible();
});

test('two same-origin pages receive persistent Human presence and private manual Actor chat without fake network delivery', async ({ page, context }) => {
  await onboard(page);
  const second = await context.newPage();
  await second.goto('/');
  await page.getByRole('tab', { name: /Actors/ }).click();
  await second.getByRole('tab', { name: /Actors/ }).click();
  const personalOne = page.locator('[data-actor-id="actor:hayden"]');
  await personalOne.getByRole('button', { name: 'available for chat' }).click();
  await expect(second.locator('[data-actor-id="actor:hayden"]')).toContainText('available for chat');
  await page.locator('[data-actor-id="actor:studio-test"]').getByRole('button', { name: 'Private chat' }).click();
  await page.getByLabel('Message Gummy Studio Test Actor').fill('Manual hello from page one.');
  await page.getByRole('button', { name: 'Save local message' }).click();
  await second.locator('[data-actor-id="actor:studio-test"]').getByRole('button', { name: 'Private chat' }).click();
  await expect(second.getByText('Manual hello from page one.')).toBeVisible();
  await expect(second.getByText(/no Agent reply is implied/i)).toBeVisible();
  await second.close();
});

test('failed provider turns persist an explicit same-key recovery across reload without automatic retry', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/v1/chat/reply', async route => {
    calls += 1;
    if (calls === 1) {
      await route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'failed', message: 'Deliberate provider interruption.' })
      });
      return;
    }
    await route.continue();
  });
  await onboard(page);
  await page.getByRole('tab', { name: /Actors/ }).click();
  await page.locator('[data-presence-id="actor:glopper"]').getByRole('button', { name: 'Open private chat' }).click();
  await page.getByLabel('Message Glopper').fill('Persist this recovery boundary.');
  await page.getByRole('button', { name: 'Approve context, cost & send' }).click();
  await expect(page.getByText('Deliberate provider interruption.')).toBeVisible();
  expect(calls).toBe(1);
  await page.reload();
  const recover = page.getByRole('button', { name: 'Recover failed turn with same key' });
  await expect(recover).toBeVisible();
  expect(calls).toBe(1);
  await recover.click();
  await expect(page.getByText(/private governed test reply/i)).toBeVisible();
  expect(calls).toBe(2);
  await expect(recover).toHaveCount(0);
});

test('tester operations preview/redact locally before explicit private submission and publish only local cohort counts', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: /About/ }).click();
  const operations = page.getByTestId('tester-operations');
  await expect(page.getByTestId('test-build-identity')).toContainText('Test build');
  await operations.getByLabel('Feedback category').selectOption('trust-privacy');
  await operations.getByLabel('Tester feedback note').fill('Please redact sk-abcdefghijklmnop before this leaves.');
  await operations.getByRole('button', { name: 'Preview & redact' }).click();
  await expect(operations).toContainText('[redacted secret-like value]');
  await expect(operations).toContainText('chat transcripts');
  await operations.getByRole('button', { name: 'Save locally + Receipt' }).click();
  await expect(operations).toContainText('Nothing was sent remotely');
  await expect(page.getByTestId('local-cohort-summary')).toContainText('feedback submitted');
  await operations.getByRole('button', { name: 'Submit latest saved feedback' }).click();
  await expect(page.locator('.toast-layer')).toContainText('configured private destination');
});

test('phone Bar, notifications, Actor cards, full Glopper sheet, chat, and media foundations remain bounded at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await onboard(page);
  const bar = page.locator('.gummy-bar');
  await expect(bar).toBeVisible();
  expect(await bar.evaluate(node => node.scrollWidth > node.clientWidth)).toBe(true);
  await page.getByRole('button', { name: 'Switch Night or Day Gummy' }).click();
  const toast = page.locator('.toast').last();
  await expect(toast).toBeVisible();
  expect(await toast.evaluate(node => node.getBoundingClientRect().width <= 304)).toBe(true);
  await page.getByRole('tab', { name: /Actors/ }).click();
  const presence = page.locator('.presence-card').first();
  expect(await presence.evaluate(node => node.getBoundingClientRect().width <= 300)).toBe(true);
  await page.getByRole('button', { name: 'Open Glopper Panel' }).click();
  const panel = page.getByRole('complementary', { name: 'Glopper Panel' });
  await expect(panel).toBeVisible();
  const box = await panel.boundingBox();
  expect(box.x).toBe(0);
  expect(box.width).toBe(320);
  expect(box.y).toBeLessThanOrEqual(60);
  await panel.getByRole('button', { name: 'Start or continue a private chat' }).click();
  await expect(page.getByTestId('private-actor-chat')).toBeVisible();
  await expect(page.getByText(/Remote live room unavailable/)).toBeHidden();
  await page.getByText('Audio, video & screen foundations').click();
  await expect(page.getByText(/Remote live room unavailable/)).toBeVisible();
  await expect(page.locator('video.local-preview-video')).toBeHidden();
});
