import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { copyProfile, copyResume, emptyRecord, emptyWorkspace } from '../src/lib/types';
test('orders both Resume containers by edit time and promotes a newly edited legacy Resume', async ({ page }) => {
  const directory = process.env.CAREERY_E2E_DATA_DIR;
  if (!directory) throw new Error('Missing isolated directory');
  const record = emptyRecord(), workspace = emptyWorkspace();
  const profile = copyProfile(record, 'order-profile', 'Ordering Profile', []); workspace.profiles.push(profile);
  for (const prefix of ['unfiled', 'profile']) {
    for (const [id, date] of [['Legacy A', ''], ['Older', '2020-01-01T12:00:00Z'], ['Legacy B', ''], ['Newest', '2021-01-01T12:00:00Z']]) {
      const resume = copyResume(record, workspace, `${prefix}-${id.replace(' ', '-')}`, id, prefix === 'profile' ? profile : undefined);
      if (date) resume.updatedAt = date; workspace.resumes.push(resume);
    }
  }
  await writeFile(join(directory, 'career-record.json'), JSON.stringify(record)); await writeFile(join(directory, 'workspace.json'), JSON.stringify(workspace));
  const links = () => page.getByRole('region', { name: 'Resumes', exact: true }).getByRole('list').getByRole('link');
  for (const path of ['/unfiled', '/profiles/order-profile']) {
    await page.goto(path); await expect(links()).toHaveText(['Newest', 'Older', 'Legacy A', 'Legacy B']);
  }
  await page.goto('/resumes/unfiled-Legacy-A');
  await page.getByLabel('Resume name', { exact: true }).fill('Legacy A edited');
  await page.getByRole('button', { name: 'Save now / retry' }).click(); await expect(page.getByRole('status')).toHaveText('Saved');
  await page.goto('/unfiled'); await expect(links()).toHaveText(['Legacy A edited', 'Newest', 'Older', 'Legacy B']);
  await page.reload(); await expect(links()).toHaveText(['Legacy A edited', 'Newest', 'Older', 'Legacy B']);
});
