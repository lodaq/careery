import { expect, test } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { emptyRecord } from '../src/lib/types';

test('tabs isolate content while collapsible entries and achievements retain edits and persist drag order', async ({ page }) => {
  const directory = process.env.CAREERY_E2E_DATA_DIR!;
  const record = emptyRecord();
  record.entries = [
    { id: 'first', kind: 'experience', title: { en: 'First role' }, employer: { en: 'Company' }, dates: { start: '2020-01' }, bullets: [{ id: 'a', text: { en: 'First achievement' } }, { id: 'b', text: { en: 'Second achievement' } }] },
    { id: 'second', kind: 'experience', title: { en: 'Second role' }, employer: { en: 'Other company' }, dates: { start: '2022-01' }, bullets: [] },
  ];
  await writeFile(join(directory, 'career-record.json'), JSON.stringify(record));
  await page.goto('/career-record');
  await page.getByLabel('Name', { exact: true }).fill('Tab draft');
  await page.getByRole('tab', { name: /^Experience/ }).click();
  await expect(page.getByLabel('Name', { exact: true })).toBeHidden();
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
  const entries = page.getByRole('list', { name: 'Experience entries', exact: true });
  const drag = page.getByRole('button', { name: 'Reorder experience 2', exact: true });
  const source = await drag.boundingBox();
  const target = await page.getByRole('button', { name: 'Reorder experience 1', exact: true }).boundingBox();
  if (!source || !target) throw new Error('Missing drag handles');
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2 - 12, { steps: 15 });
  await page.mouse.up();
  await expect(entries.locator('.entry-card').first()).toContainText('Second role');
  await page.getByRole('button', { name: /First role/ }).click();
  const role = page.getByRole('group', { name: 'Experience 2', exact: true });
  await role.getByLabel('Job title', { exact: true }).fill('Updated role');
  await role.getByRole('button', { name: 'Reorder achievement 2', exact: true }).focus();
  await page.keyboard.press('ArrowUp');
  await role.getByRole('button', { name: /Achievement 1.*Second achievement/ }).click();
  await role.getByLabel('Achievement 1', { exact: true }).fill('Updated achievement');
  await page.getByRole('tab', { name: /^Education/ }).click();
  await expect(entries).toBeHidden();
  await page.getByRole('tab', { name: 'Basics' }).click();
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Tab draft');
  await expect(page.getByRole('status')).toHaveText('Saved');
  const saved = JSON.parse(await readFile(join(directory, 'career-record.json'), 'utf8'));
  expect(saved.entries.map((entry: { id: string }) => entry.id)).toEqual(['second', 'first']);
  expect(saved.entries[1].title.en).toBe('Updated role');
  expect(saved.entries[1].bullets.map((bullet: { id: string }) => bullet.id)).toEqual(['b', 'a']);
  expect(saved.entries[1].bullets[0].text.en).toBe('Updated achievement');
  await page.reload();
  await page.getByRole('tab', { name: /^Experience/ }).click();
  await expect(entries.locator('.entry-card').first()).toContainText('Second role');
  await expect(page.getByLabel('Job title').first()).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.getByRole('tab', { name: /^Certifications/ }).click();
  await page.getByRole('button', { name: 'Add certification', exact: true }).click();
  await expect(page.getByLabel('Issuer', { exact: true })).toBeVisible();
});
