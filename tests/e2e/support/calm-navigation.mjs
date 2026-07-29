export async function openMoreItem(page, name) {
  const item = page.getByRole('menuitem', { name });
  if (!await item.isVisible()) {
    await page.getByRole('button', { name: 'More', exact: true }).click();
  }
  await item.click();
}

export async function revealMore(page) {
  const menu = page.getByRole('menu', { name: /System workspaces|More workspaces/ });
  if (!await menu.isVisible()) {
    await page.getByRole('button', { name: 'More', exact: true }).click();
  }
  return menu;
}

export async function openPrimary(page, name) {
  const tab = page.getByRole('tab', { name });
  if (await tab.isVisible()) {
    await tab.click();
    return;
  }
  await page.getByRole('navigation', { name: 'Phone workspaces' }).getByRole('button', { name }).click();
}
