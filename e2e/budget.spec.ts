import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

for (const path of ['/', '/career-record', '/unfiled']) {
  test(`initial JavaScript stays within 180 kB on ${path}`, async ({ page }) => {
    await page.goto(path);
    if (path === '/career-record') await expect(page.getByLabel('Name', { exact: true })).toBeVisible();
    await page.waitForLoadState('networkidle');
    const scripts = await page.evaluate(() => [...new Set(performance.getEntriesByType('resource').map((entry) => new URL(entry.name).pathname).filter((path) => path.startsWith('/_next/static/') && path.endsWith('.js')))]);
    expect(scripts.length).toBeGreaterThan(0);
    const sizes = await Promise.all(scripts.map(async (path) => gzipSync(await readFile(join('.next-build', path.replace('/_next/', '')))).length));
    const bytes = sizes.reduce((sum, size) => sum + size, 0);
    console.log(`${path}: ${bytes} gzip bytes of loaded JavaScript`);
    expect(bytes).toBeLessThanOrEqual(180_000);
  });
}
