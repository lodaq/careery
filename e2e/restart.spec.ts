import { test, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { copyResume, emptyRecord, emptyWorkspace } from '../src/lib/types';

test('resume movement, bilingual edits, ordering and remembered language survive a fresh server process', async ({ page }) => {
  const directory = await mkdtemp(join(tmpdir(), 'careery-restart-'));
  const record = emptyRecord(), workspace = emptyWorkspace(); record.basics.name.en = 'Restart verification';
  workspace.profiles.push({ id: 'target', name: 'Target Profile', basics: record.basics, entries: [], headline: { en: '' }, summary: { en: '' } });
  const resume = copyResume(record, workspace, 'restart-resume', 'Restart Resume');
  resume.entries = [{ id: 'skill-a', kind: 'skills', name: { en: 'First skill' } }, { id: 'skill-b', kind: 'skills', name: { en: 'Second skill' } }]; workspace.resumes.push(resume);
  await writeFile(join(directory, 'career-record.json'), JSON.stringify(record));
  await writeFile(join(directory, 'workspace.json'), JSON.stringify(workspace));
  const launch = () => spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3102'], { env: { ...process.env, CAREERY_BUILD_DIR: '.next-build', CAREERY_DATA_DIR: directory }, stdio: 'ignore' });
  let server = launch();
  const stop = async () => { if (server.exitCode !== null) return; const exited = once(server, 'exit'); server.kill('SIGTERM'); await exited; };
  const ready = async () => { await expect.poll(async () => { try { return (await fetch('http://127.0.0.1:3102/unfiled')).status; } catch { return 0; } }).toBe(200); };
  try {
    await ready(); await page.goto('http://127.0.0.1:3102/resumes/restart-resume');
    await page.getByLabel('Language', { exact: true }).selectOption('ar');
    await page.getByLabel('Move to', { exact: true }).selectOption('target');
    await page.getByRole('button', { name: 'Headline: edit Arabic version', exact: true }).click();
    await page.getByLabel('Headline · Arabic (optional)', { exact: true }).fill('عنوان محفوظ');
    await page.getByRole('dialog').getByRole('button', { name: 'Done', exact: true }).click();
    await page.getByRole('button', { name: 'Move entry up', exact: true }).nth(1).click();
    await page.getByRole('checkbox', { name: 'Hide in Resume', exact: true }).nth(1).check();
    await page.getByText('Section order', { exact: true }).first().click();
    await page.getByRole('button', { name: 'Move experience section up', exact: true }).click();
    await page.getByRole('button', { name: 'Save now / retry' }).click(); await expect(page.getByRole('status')).toHaveText('Saved');
    await stop(); server = launch(); await ready(); await page.reload();
    await expect(page.getByLabel('Language', { exact: true })).toHaveValue('ar');
    await expect(page.getByLabel('Move to', { exact: true })).toHaveValue('target');
    await expect(page.getByLabel('Headline · Arabic (optional)', { exact: true })).toHaveValue('عنوان محفوظ');
    await expect(page.getByLabel('Skill · English (required)', { exact: true }).first()).toHaveValue('Second skill');
    await expect(page.getByRole('checkbox', { name: 'Hide in Resume', exact: true }).nth(1)).toBeChecked();
    expect(await page.locator('input[name="sectionOrder"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('value')))).toEqual(['summary', 'experience', 'skills', 'education', 'projects', 'certifications']);
    await page.goto('http://127.0.0.1:3102/unfiled');
    await page.getByLabel('New Resume name', { exact: true }).fill('After restart'); await page.getByRole('button', { name: 'Create Resume', exact: true }).click();
    await expect(page.getByLabel('Language', { exact: true })).toHaveValue('ar');
  } finally { await stop(); await rm(directory, { recursive: true, force: true }); }
});
