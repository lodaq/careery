import { expect, test } from '@playwright/test';
import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { copyResume, emptyRecord, emptyWorkspace } from '../src/lib/types';

test('collapsed entry order is shared by editor, saved document, and PDF', async ({ page, request }) => {
  const dir = process.env.CAREERY_E2E_DATA_DIR!;
  const record = emptyRecord();
  record.basics.name.en = 'Order verification';
  record.entries = ['Alpha', 'Beta', 'Gamma'].map((name, index) => ({ id: name, kind: 'experience' as const, title: { en: `${name} role` }, employer: { en: 'Company' }, dates: { start: `${2020 + index}-01` }, bullets: [] }));
  const workspace = emptyWorkspace(); const resume = copyResume(record, workspace, 'order-test', 'Order test'); resume.entries = structuredClone(record.entries); workspace.resumes.push(resume);
  await writeFile(join(dir, 'career-record.json'), JSON.stringify(record)); await writeFile(join(dir, 'workspace.json'), JSON.stringify(workspace));
  await page.goto('/resumes/order-test');
  await page.getByRole('button', { name: 'Experience 3', exact: true }).click();
  await page.getByRole('button', { name: 'Reorder experience 3', exact: true }).focus(); await page.keyboard.press('ArrowUp');
  await expect(page.locator('.entry-editor > [data-slot=collapsible-trigger]').filter({ visible: true })).toHaveText([/Alpha/, /Gamma/, /Beta/]);
  await expect(page.locator('.resume-preview-panel article h3')).toHaveText(['Alpha role', 'Gamma role', 'Beta role']);
  await page.getByRole('button', { name: 'Choose content', exact: true }).click();
  await expect(page.getByLabel('Search Career Record', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Save', exact: true }).click(); await expect(page.getByRole('status')).toHaveText('Saved');
  const saved = JSON.parse(await readFile(join(dir, 'workspace.json'), 'utf8'));
  expect(saved.resumes[0].entries.map((entry: { id: string }) => entry.id)).toEqual(['Alpha', 'Gamma', 'Beta']);
  await page.goto('/render/order-test');
  await expect(page.locator('article h3')).toHaveText(['Alpha role', 'Gamma role', 'Beta role']);
  const response = await request.get('/api/resumes/order-test/pdf'); expect(response.ok()).toBe(true);
  expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
});
