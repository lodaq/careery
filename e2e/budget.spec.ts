import { expect, test } from '@playwright/test';
import { initialScriptBytes } from './initial-js';

for (const path of ['/', '/career-record', '/unfiled']) {
  test(`initial JavaScript stays within 180 kB on ${path}`, async ({ page, request }) => {
    await page.goto(path);
    if (path === '/career-record') await expect(page.getByLabel('Name', { exact: true })).toBeVisible();
    const bytes = await initialScriptBytes(request, path);
    console.log(`${path}: ${bytes} gzip bytes of initial JavaScript`);
    expect(bytes).toBeLessThanOrEqual(180_000);
  });
}
