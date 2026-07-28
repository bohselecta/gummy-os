import { test, expect } from '@playwright/test';

async function onboard(page) {
  await page.goto('/');
  await page.getByTestId('mode-night').click();
  await page.getByRole('button', { name: 'Enter Gummy OS' }).click();
  await page.getByLabel('What should Gummy call you?').fill('Activation Tester');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Create Local Gummy Box' }).click();
  await page.getByTestId('enter-canvas').click();
}

async function openPlace(page, name) {
  await page.getByRole('tab', { name: 'Places' }).click();
  await page.getByRole('button', { name: `Open ${name}` }).click();
  return page.getByRole('region', { name: `${name} window` });
}

test.beforeEach(async ({ context, page }) => {
  await context.clearCookies();
  page.runtimeErrors = [];
  page.on('pageerror', error => page.runtimeErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') page.runtimeErrors.push(message.text());
  });
});

test.afterEach(async ({ page }) => {
  expect(page.runtimeErrors).toEqual([]);
});

test('Wardrobe creates owned items, composes an outfit, and survives reload', async ({ page }) => {
  await onboard(page);
  const wardrobe = await openPlace(page, 'Wardrobe');

  const add = async (name, slot, color) => {
    await wardrobe.getByLabel('Item name').fill(name);
    await wardrobe.getByLabel('Slot').selectOption(slot);
    await wardrobe.getByLabel('Color / material').fill(color);
    await wardrobe.getByRole('button', { name: 'Add owned item' }).click();
  };
  await add('Purple shirt', 'top', 'purple cotton');
  await add('Canvas trousers', 'bottom', 'cream canvas');
  await add('Walking shoes', 'shoes', 'brown leather');
  await expect(wardrobe.getByRole('heading', { name: 'Items (3)' })).toBeVisible();
  await wardrobe.getByRole('button', { name: 'Dress Me' }).click();
  await expect(wardrobe.getByRole('heading', { name: 'Saved outfits (1)' })).toBeVisible();
  await wardrobe.getByText('Purple shirt').locator('..').getByRole('button', { name: 'Mark unavailable' }).click();
  await wardrobe.getByRole('button', { name: 'Replace unavailable slots' }).click();
  await expect(wardrobe.getByRole('heading', { name: 'Saved outfits (2)' })).toBeVisible();
  await expect(wardrobe).toContainText('no checkout');

  await page.reload();
  const reopened = await openPlace(page, 'Wardrobe');
  await expect(reopened.getByRole('heading', { name: 'Items (3)' })).toBeVisible();
  await expect(reopened.getByRole('heading', { name: 'Saved outfits (2)' })).toBeVisible();
});

test('House Intent Gate and Worlds local planning create durable non-executing state', async ({ page }) => {
  await onboard(page);
  const house = await openPlace(page, 'House');
  await house.getByLabel('Name').fill('Front room');
  await house.getByRole('button', { name: 'Save room' }).click();
  await house.getByLabel('Observation').fill('The listening corner needs warmer task light.');
  await house.getByRole('button', { name: 'Save observation' }).click();
  await house.getByLabel('Intent', { exact: true }).fill('Create a calm listening corner.');
  await house.getByRole('button', { name: 'Preview scoped intent' }).click();
  await expect(house.locator('[data-record-type="intent-preview"]')).toHaveCount(1);
  await house.getByLabel('Intent note').fill('Add a warm lamp and a small chair.');
  await house.getByLabel('Consequence note').fill('Keep the walkway and outlet access clear.');
  await house.getByRole('button', { name: 'Commit both notes' }).click();
  await expect(house.locator('[data-record-type="commit"]')).toHaveCount(1);

  const worlds = await openPlace(page, 'Worlds');
  await worlds.getByLabel('Title').fill('Listening Chamber');
  await worlds.getByLabel('Intent').fill('A calm place for sitting, listening, and conversation.');
  await worlds.getByRole('button', { name: 'Create valid Sit plan' }).click();
  await worlds.getByRole('button', { name: 'Validate and estimate' }).click();
  await expect(worlds.getByRole('status').last()).toContainText('executing: false');
  await worlds.getByRole('button', { name: 'Duplicate' }).click();
  await expect(worlds.locator('[data-record-type="world-plan"]')).toHaveCount(2);
  await expect(worlds.getByRole('button', { name: 'Build needs Meshmallow' }).first()).toBeDisabled();
});

test('Channels and Table maintain real local records without publishing or address release', async ({ page }) => {
  await onboard(page);
  const channels = await openPlace(page, 'Gummy Channels');
  await channels.getByLabel('Name').first().fill('Kitchen Channel');
  await channels.getByRole('button', { name: 'Save channel' }).click();
  await channels.getByLabel('Name').nth(1).fill('Sunday Watch');
  await channels.getByRole('button', { name: 'Create watch group' }).click();
  await channels.getByLabel('Note').fill('Premiere discussion after the episode.');
  await channels.getByRole('button', { name: 'Post local bulletin' }).click();
  await expect(channels.locator('[data-record-type="channel"]')).toHaveCount(1);
  await expect(channels.locator('[data-record-type="watch-group"]')).toHaveCount(1);
  await expect(channels.getByRole('button', { name: /publish/i })).toHaveCount(0);

  const table = await openPlace(page, 'Table');
  await table.getByLabel('Title').fill('Sunday supper');
  await table.getByLabel('Date').fill('2026-08-02T18:00');
  await table.getByRole('button', { name: 'Create private Table' }).click();
  await table.getByLabel('First name').fill('Sam');
  await table.getByRole('button', { name: 'Create scoped invitation' }).click();
  await table.getByRole('button', { name: 'RSVP yes' }).click();
  await table.getByLabel('Dish').fill('Tomato salad');
  await table.getByRole('button', { name: 'Add dish' }).click();
  await table.getByLabel('Gift').fill('Good olive oil');
  await table.getByRole('button', { name: 'Offer gift' }).click();
  await expect(table).toContainText('No address field, feed, rating, open DM, balance, score, or debt exists.');
  await expect(table.getByRole('button', { name: 'Exact address requires verified service' })).toBeDisabled();
});

test('Radio revisions and approvals stay separate from final audio and publication', async ({ page }) => {
  await onboard(page);
  const radio = await openPlace(page, 'Radio');
  await radio.getByLabel('Episode title').fill('Launch aftershow');
  await radio.getByLabel('Selected source material').fill('The team completed the first locally active Gummy Places.');
  await radio.getByRole('button', { name: 'Create private episode' }).click();
  await radio.getByLabel(/Script revision/).fill('Host A: What changed? Host B: The Places now preserve real local state.');
  await radio.getByRole('button', { name: 'Save new revision' }).click();
  await expect(radio.getByLabel(/Script revision 1/)).toBeVisible();
  await radio.getByRole('button', { name: 'Approve exact revision' }).click();
  await radio.getByRole('button', { name: 'Preview browser speech' }).click();
  await expect(radio.getByRole('status').last()).toContainText('demonstration started');
  await expect(radio.getByRole('button', { name: 'Final voice service not connected' })).toBeDisabled();
  await expect(radio).toContainText('publishing does not exist');
});

test('Rooms creates a local room, participants, isolated threads, and a fair queue', async ({ page }) => {
  await onboard(page);
  const rooms = await openPlace(page, 'Rooms');
  await rooms.getByLabel('Room title').fill('Place planning room');
  await rooms.getByRole('button', { name: 'Create local room' }).click();
  await rooms.getByLabel('Participant').fill('Sam');
  await rooms.getByRole('button', { name: 'Add local participant' }).click();
  await rooms.getByLabel('Thread').fill('Wardrobe launch');
  await rooms.getByRole('button', { name: 'Create isolated thread' }).click();
  await rooms.getByLabel('Message').fill('Review the active local core.');
  await rooms.getByRole('button', { name: 'Save room message' }).click();
  await rooms.getByRole('button', { name: 'Advance fair queue' }).click();
  await expect(rooms.locator('[data-record-type="queue"]')).toHaveCount(1);
  await expect(rooms.getByRole('button', { name: 'Remote room service not connected' })).toBeDisabled();
});
