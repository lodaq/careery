import { expect, test } from '@playwright/test';
import { instant } from '@next/playwright';

test('the home workspace is available on the initial load', async ({ page, baseURL }) => {
  await instant(page, async () => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Your next chapter starts here.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Your Profiles' })).toBeVisible();
  }, { baseURL });
});
