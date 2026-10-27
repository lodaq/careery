import { execFileSync } from 'node:child_process';
import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { emptyRecord, emptyWorkspace } from '../src/lib/types';

test('shows independently reconciled demo metrics and hydrates with extension attributes', async ({ page }) => {
  const directory = process.env.CAREERY_E2E_DATA_DIR!;
  await writeFile(join(directory, 'career-record.json'), JSON.stringify(emptyRecord()));
  await writeFile(join(directory, 'workspace.json'), JSON.stringify(emptyWorkspace()));
  await writeFile(join(directory, 'applications.json'), JSON.stringify({ version: 1, applications: [] }));
  execFileSync(process.execPath, ['scripts/seed-demo.mjs'], { env: { ...process.env, CAREERY_DATA_DIR: directory } });
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const inject = () => { if (!document.body) return false; document.body.setAttribute('data-new-gr-c-s-check-loaded', '14.1342.0'); document.body.setAttribute('data-gr-ext-installed', ''); return true; };
    if (!inject()) { const observer = new MutationObserver(() => { if (inject()) observer.disconnect(); }); observer.observe(document, { childList: true, subtree: true }); }
  });
  await page.goto('/analytics');
  const jobSearch = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Job search', exact: true }) });
  const total = (label: string) => jobSearch.locator('dl.analytics-totals > div').filter({ has: page.getByText(label, { exact: true }) }).locator('dd');
  for (const [label, value] of [['Submitted', '40'], ['Active opportunities', '36'], ['Response rate', '60%'], ['Interview rate', '55%'], ['Offer rate', '25%'], ['Accepted', '3'], ['Overdue tasks', '12'], ['Upcoming interviews', '10']]) await expect(total(label)).toHaveText(value);
  await expect(jobSearch.getByText('50 tracked · 6 archived · 72 open tasks on active applications', { exact: true })).toBeVisible();
  await expect(page.locator('dl.analytics-totals > div').filter({ has: page.getByRole('link', { name: 'Career Record entries', exact: true }) }).locator('dd')).toHaveText('100');
  await expect(page.locator('dl.analytics-totals > div').filter({ has: page.getByRole('link', { name: 'Resumes', exact: true }) }).locator('dd')).toHaveText('74');
  const source = page.getByRole('region', { name: 'Application source performance' });
  await expect(source.getByRole('row')).toHaveCount(6);
  for (const row of await source.getByRole('row').all()) { if (await row.getByRole('cell').count()) await expect(row.getByRole('cell').first()).toHaveText('8'); }
  await page.getByRole('link', { name: 'View charts', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Content counts by section', exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Resume counts by template', exact: true })).toBeVisible();
  await page.waitForLoadState('networkidle');
  expect(await page.locator('body').getAttribute('data-new-gr-c-s-check-loaded')).toBe('14.1342.0');
  expect(errors).toEqual([]);
  await page.goto('/applications');
  await expect(page.getByText('44 applications', { exact: true })).toBeVisible();
  await page.locator('main:visible').getByLabel('Archive', { exact: true }).selectOption('All');
  await expect(page.getByText('50 applications', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '/tmp/careery-populated-applications-mobile.png', fullPage: true });
});
