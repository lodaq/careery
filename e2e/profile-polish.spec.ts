import { execFileSync } from 'node:child_process';
import { expect, test } from '@playwright/test';

test('profile creation dialog and compact reorder targets work across viewports', async ({ page }) => {
  execFileSync(process.execPath, ['scripts/seed-demo.mjs'], { env: { ...process.env, CAREERY_DATA_DIR: process.env.CAREERY_E2E_DATA_DIR } });
  for (const width of [1044, 390]) {
    await page.setViewportSize({ width, height: 854 });
    await page.goto('/profiles/demo-profile-1');
    const trigger = page.getByRole('region', { name: 'Resumes', exact: true }).getByRole('button', { name: 'Create Resume', exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByLabel('New Resume name')).toBeFocused();
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await page.getByRole('tab', { name: /^Experience/ }).click();
    const handle = page.getByRole('group', { name: 'Reorder experience 1', exact: true });
    const target = await handle.boundingBox();
    expect(target!.width).toBeGreaterThanOrEqual(44);
    expect(target!.height).toBeGreaterThanOrEqual(44);
    for (const button of await handle.getByRole('button').all()) {
      const box = await button.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(24);
      expect(box!.height).toBeGreaterThanOrEqual(24);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  }
  await page.goto('/profiles/demo-profile-1');
  await page.getByRole('button', { name: 'Create Resume', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('New Resume name').fill('Independent modal Resume');
  await dialog.getByRole('button', { name: 'Create Resume', exact: true }).click();
  await expect(page).toHaveURL(/\/resumes\//);
  await expect(page.getByLabel('Resume name', { exact: true })).toHaveValue('Independent modal Resume');
});
