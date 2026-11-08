import { expect, test } from '@playwright/test';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

test('downloads a backup and restores it from Settings', async ({ page }) => {
  const directory = process.env.CAREERY_E2E_DATA_DIR;
  if (!directory) throw new Error('Missing isolated test directory');
  await mkdir(directory, { recursive: true });
  const recordPath = join(directory, 'career-record.json');
  const original = await readFile(recordPath, 'utf8').catch(() => null);
  const snapshotsBefore = await readdir(join(directory, 'backups')).catch(() => [] as string[]);
  const record = (name: string) => JSON.stringify({ version: 1, basics: { name: { en: name }, title: { en: 'Engineer' }, location: { en: 'Cairo' }, email: '', phone: '', links: [] }, entries: [] });

  try {
    await writeFile(recordPath, record('Backup original'));
    await page.goto('/settings');
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: 'Download backup' }).click()]);
    const file = await download.path();
    if (!file) throw new Error('Backup download failed');
    const bundle = JSON.parse(await readFile(file, 'utf8'));
    expect(bundle.app).toBe('careery');
    expect(bundle.files['career-record.json'].basics.name.en).toBe('Backup original');
    expect(download.suggestedFilename()).toMatch(/^careery-backup-\d{4}-\d{2}-\d{2}\.json$/);

    await writeFile(recordPath, record('Changed after backup'));
    await page.reload();
    await page.getByLabel('Restore a backup').setInputFiles({ name: 'careery-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(bundle)) });
    await page.getByRole('button', { name: 'Restore backup' }).click();
    await expect(page.getByRole('alertdialog')).toContainText('Replace only the data files included in this backup');
    await expect(page.getByRole('alertdialog')).toContainText('Other current data files will be left unchanged');
    await page.getByRole('alertdialog').getByRole('button', { name: 'Restore', exact: true }).click();
    await expect(page.getByRole('status')).toContainText(/^Restored \d+ data files?/);
    expect(JSON.parse(await readFile(recordPath, 'utf8')).basics.name.en).toBe('Backup original');

    const snapshotsAfter = await readdir(join(directory, 'backups'));
    const created = snapshotsAfter.filter((name) => !snapshotsBefore.includes(name));
    expect(created).toHaveLength(1);
    expect(JSON.parse(await readFile(join(directory, 'backups', created[0], 'career-record.json'), 'utf8')).basics.name.en).toBe('Changed after backup');
    await Promise.all(created.map((name) => rm(join(directory, 'backups', name), { recursive: true, force: true })));
  } finally {
    if (original === null) await rm(recordPath, { force: true });
    else await writeFile(recordPath, original);
  }
});
