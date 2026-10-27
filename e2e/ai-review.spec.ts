import { expect, test } from '@playwright/test';
import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { copyResume, emptyRecord, emptyWorkspace } from '../src/lib/types';

test('AI Review handles retry, keeps feedback, and applies only a current explicit summary', async ({ page }) => {
  const directory = process.env.CAREERY_E2E_DATA_DIR!;
  const record = emptyRecord(); record.basics.name.en = 'Synthetic candidate'; record.basics.email = 'test@example.com';
  const workspace = emptyWorkspace(), resume = copyResume(record, workspace, 'ai-test', 'AI writing test'); resume.summary.en = 'Frontend engineer building accessible interfaces.'; workspace.resumes.push(resume);
  await writeFile(join(directory, 'career-record.json'), JSON.stringify(record)); await writeFile(join(directory, 'workspace.json'), JSON.stringify(workspace));
  let attempts = 0;
  const rewrite = 'Frontend engineer focused on building accessible interfaces.';
  await page.route('**/api/resumes/ai-test/review', async (route) => {
    expect(route.request().postDataJSON().revision).toBeTruthy();
    attempts++;
    await route.fulfill(attempts === 1 ? { status: 502, json: { error: 'OpenRouter is rate limited. Wait a moment and retry.' } } : { json: { review: { score: 82, overview: 'A clear professional direction.', strengths: ['A specific focus on accessibility.'], findings: [{ section: 'summary', title: 'Tighten the introduction', detail: 'Keep the focus direct.', suggestion: 'Lead with the kind of work you do.', priority: 'medium' }], summaryRewrite: rewrite, model: 'synthetic/test' } } });
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/resumes/ai-test');
  await page.getByRole('button', { name: 'AI Review', exact: true }).click();
  await page.getByLabel(/Target role or job description/).fill('Accessible frontend engineering');
  await page.getByRole('button', { name: 'Run AI Review', exact: true }).click();
  await expect(page.locator('.review-error[role=alert]')).toContainText('rate limited');
  await page.getByRole('button', { name: 'Run AI Review', exact: true }).click();
  await expect(page.getByText('A clear professional direction.', { exact: true })).toBeVisible();
  await page.screenshot({ path: '/tmp/careery-ai-review-desktop.png' });
  expect(JSON.parse(await readFile(join(directory, 'workspace.json'), 'utf8')).resumes[0].summary.en).toBe(resume.summary.en);
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByRole('button', { name: 'Summary', exact: true }).click();
  await page.getByLabel('Summary', { exact: true }).fill('Updated accessible frontend engineer summary.');
  await page.getByRole('button', { name: /AI Review/ }).click();
  await expect(page.getByText(/Your Resume changed since this review/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Use this summary' })).toBeDisabled();
  await page.getByRole('button', { name: 'Review again', exact: true }).click();
  await expect(page.getByText(/Your Resume changed since this review/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Use this summary' }).click();
  await expect(page.getByLabel('Summary', { exact: true })).toHaveValue(rewrite);
  await page.getByRole('button', { name: 'Save', exact: true }).click(); await expect(page.getByRole('status')).toHaveText('Saved');
  expect(JSON.parse(await readFile(join(directory, 'workspace.json'), 'utf8')).resumes[0].summary.en).toBe(rewrite);
  await page.getByRole('button', { name: 'Customize', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Customize resume', exact: true })).toBeVisible();
  await page.screenshot({ path: '/tmp/careery-studio-customize-desktop.png' });
  await page.getByRole('button', { name: 'Template', exact: true }).click();
  await expect(page.locator('.template-grid .resume-document')).toHaveCount(6);
  await expect(page.getByRole('navigation', { name: 'Resume sections' })).toBeHidden();
  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await page.getByRole('button', { name: /AI Review/ }).click();
    await expect(page.getByRole('button', { name: 'Review again' })).toBeVisible();
    await expect(page.getByRole('button', { name: /AI Review/ })).toHaveAttribute('aria-pressed', 'true');
    if (width === 390) await page.screenshot({ path: '/tmp/careery-ai-review-mobile.png' });
    await page.getByRole('button', { name: 'Customize', exact: true }).click();
  }
});

test('applying an Arabic summary preserves English wording and reveals Arabic', async ({ page }) => {
  const directory = process.env.CAREERY_E2E_DATA_DIR!;
  const record = emptyRecord(), workspace = emptyWorkspace(); record.basics.name.en = 'Synthetic candidate';
  const resume = copyResume(record, workspace, 'arabic-ai', 'Arabic review'); resume.language = 'ar'; resume.summary = { en: 'Original English summary.', ar: 'الملخص الأصلي.' }; workspace.resumes.push(resume);
  await writeFile(join(directory, 'career-record.json'), JSON.stringify(record)); await writeFile(join(directory, 'workspace.json'), JSON.stringify(workspace));
  await page.route('**/api/resumes/arabic-ai/review', (route) => route.fulfill({ json: { review: { score: 80, overview: 'مراجعة تجريبية.', strengths: [], findings: [], summaryRewrite: 'صياغة عربية محسنة.', model: 'synthetic/test' } } }));
  await page.goto('/resumes/arabic-ai');
  await page.getByRole('button', { name: 'AI Review', exact: true }).click();
  await page.getByRole('button', { name: 'Run AI Review', exact: true }).click();
  await page.getByRole('button', { name: 'Use this summary' }).click();
  await expect(page.getByLabel('Summary · Arabic (optional)', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Summary · Arabic (optional)', { exact: true })).toHaveValue('صياغة عربية محسنة.');
  await expect(page.getByLabel('Summary', { exact: true })).toHaveValue('Original English summary.');
});

test('finding actions apply independent project and headline revisions and persist them', async ({ page }) => {
  const directory = process.env.CAREERY_E2E_DATA_DIR!;
  const record = emptyRecord(), workspace = emptyWorkspace(); record.basics.name.en = 'Synthetic candidate';
  const resume = copyResume(record, workspace, 'apply-ai', 'Apply review');
  resume.headline = { en: 'Frontend developer', ar: 'مطور' };
  resume.entries = [{ id: 'project', kind: 'projects', name: { en: 'Tracker' }, description: { en: 'I built an accessible tracker.', ar: 'الوصف الأصلي' }, bullets: [{ id: 'achievement', text: { en: 'I tested keyboard navigation.' } }] }];
  workspace.resumes.push(resume);
  await writeFile(join(directory, 'career-record.json'), JSON.stringify(record)); await writeFile(join(directory, 'workspace.json'), JSON.stringify(workspace));
  const finding = { title: 'Tighten wording', detail: 'Use direct wording.', suggestion: 'Keep existing facts.', priority: 'medium' };
  await page.route('**/api/resumes/apply-ai/review', (route) => route.fulfill({ json: { review: { score: 80, overview: 'Two revisions.', strengths: [], summaryRewrite: '', model: 'synthetic/test', findings: [
    { ...finding, section: 'projects', edits: [{ field: 'project.description.en', before: 'I built an accessible tracker.', after: 'Built an accessible tracker.' }, { field: 'project.achievement.en', before: 'I tested keyboard navigation.', after: 'Tested keyboard navigation.' }] },
    { ...finding, section: 'headline', edits: [{ field: 'headline.en', before: 'Frontend developer', after: 'Frontend development' }] },
    { ...finding, section: 'certifications', edits: [] },
  ] } } }));
  await page.goto('/resumes/apply-ai');
  await page.getByRole('button', { name: 'AI Review', exact: true }).click();
  await page.getByRole('button', { name: 'Run AI Review', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Apply suggestion', exact: true })).toHaveCount(4);
  await page.getByRole('button', { name: 'Apply suggestion', exact: true }).first().click();
  await expect(page.getByRole('button', { name: 'Suggestion applied', exact: true })).toHaveCount(1);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Saved');
  const partial = JSON.parse(await readFile(join(directory, 'workspace.json'), 'utf8')).resumes[0];
  expect(partial.entries[0].description.en).toBe('Built an accessible tracker.');
  expect(partial.entries[0].bullets[0].text.en).toBe('I tested keyboard navigation.');
  await page.getByRole('button', { name: 'Apply suggestion', exact: true }).first().click();
  await expect(page.getByRole('button', { name: 'Suggestion applied', exact: true })).toHaveCount(2);
  await page.getByRole('button', { name: 'Apply suggestion', exact: true }).first().click();
  await expect(page.getByRole('button', { name: 'Suggestion applied', exact: true })).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Apply suggestion', exact: true })).toBeEnabled();
  await expect(page.getByText(/Your Resume changed since this review/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Saved');
  const saved = JSON.parse(await readFile(join(directory, 'workspace.json'), 'utf8')).resumes[0];
  expect(saved.entries[0].description).toEqual({ en: 'Built an accessible tracker.', ar: 'الوصف الأصلي' });
  expect(saved.headline).toEqual({ en: 'Frontend development', ar: 'مطور' });
  await page.screenshot({ path: '/tmp/careery-apply-suggestions.png' });
});


test('Apply suggestion generates missing changes, adds evidenced skills, and retries errors', async ({ page }) => {
  const directory = process.env.CAREERY_E2E_DATA_DIR!;
  const record = emptyRecord(), workspace = emptyWorkspace(); record.basics.name.en = 'Synthetic candidate';
  const resume = copyResume(record, workspace, 'generate-ai', 'Generate revision');
  resume.summary.en = 'Built interfaces with TypeScript.';
  workspace.resumes.push(resume);
  await writeFile(join(directory, 'career-record.json'), JSON.stringify(record)); await writeFile(join(directory, 'workspace.json'), JSON.stringify(workspace));
  const finding = { section: 'skills', title: 'Missing skills', detail: 'Add demonstrated tools.', suggestion: 'List demonstrated skills.', priority: 'high', edits: [] };
  let attempts = 0;
  await page.route('**/api/resumes/generate-ai/review', async (route) => {
    const body = route.request().postDataJSON();
    if (body.finding && ++attempts === 1) { await route.fulfill({ status: 502, json: { error: 'Could not apply. Try again.' } }); return; }
    await route.fulfill({ json: { review: { score: 75, overview: 'Writing review.', strengths: [], summaryRewrite: '', model: 'synthetic/test', findings: [{ ...finding, ...(body.finding ? { addSkills: [{ name: 'TypeScript', evidence: 'Built interfaces with TypeScript.' }] } : {}) }] } } });
  });
  await page.goto('/resumes/generate-ai');
  await page.getByRole('button', { name: 'AI Review', exact: true }).click();
  await page.getByRole('button', { name: 'Run AI Review', exact: true }).click();
  await page.getByRole('button', { name: 'Apply suggestion', exact: true }).click();
  await expect(page.locator('.review-error[role=alert]')).toHaveText('Could not apply. Try again.');
  await page.getByRole('button', { name: 'Apply suggestion', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Suggestion applied' })).toBeVisible();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Saved');
  const saved = JSON.parse(await readFile(join(directory, 'workspace.json'), 'utf8')).resumes[0];
  expect(saved.entries).toEqual([expect.objectContaining({ kind: 'skills', name: { en: 'TypeScript' } })]);
  expect(saved.summary.en).toBe(resume.summary.en);
});

test('personal information uses grouped fields and the preview contains only the document', async ({ page }) => {
  const directory = process.env.CAREERY_E2E_DATA_DIR!;
  const record = emptyRecord(), workspace = emptyWorkspace();
  record.basics.name.en = 'Synthetic candidate'; record.basics.email = 'test@example.com'; record.basics.phone = '+20 123456789'; record.basics.location.en = 'Cairo';
  const resume = copyResume(record, workspace, 'personal-test', 'Personal information'); workspace.resumes.push(resume);
  await writeFile(join(directory, 'career-record.json'), JSON.stringify(record)); await writeFile(join(directory, 'workspace.json'), JSON.stringify(workspace));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/resumes/personal-test');
  await page.getByRole('button', { name: 'Personal info', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'About you', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Contact details', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'test@example.com' })).toHaveAttribute('href', 'mailto:test@example.com');
  await expect(page.getByRole('button', { name: 'Paginated PDF preview' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Live text preview' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Download PDF', exact: true })).toBeVisible();
  await page.screenshot({ path: '/tmp/careery-personal-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.screenshot({ path: '/tmp/careery-personal-mobile.png' });
});

test('unsupported older feedback is retired without a retry error or invented facts', async ({ page }) => {
  const directory = process.env.CAREERY_E2E_DATA_DIR!;
  const record = emptyRecord(), workspace = emptyWorkspace(); record.basics.name.en = 'Synthetic candidate';
  const resume = copyResume(record, workspace, 'unsupported-ai', 'Older review'); workspace.resumes.push(resume);
  await writeFile(join(directory, 'career-record.json'), JSON.stringify(record)); await writeFile(join(directory, 'workspace.json'), JSON.stringify(workspace));
  await page.route('**/api/resumes/unsupported-ai/review', (route) => route.fulfill({ json: route.request().postDataJSON().finding ? { unavailable: true } : { review: { score: 70, overview: 'Older feedback.', strengths: [], findings: [{ section: 'experience', title: 'Show progression', detail: 'Dates differ.', suggestion: 'Show broader responsibilities.', priority: 'medium' }], summaryRewrite: '', model: 'synthetic/test' } } }));
  await page.goto('/resumes/unsupported-ai');
  await page.getByRole('button', { name: 'AI Review', exact: true }).click();
  await page.getByRole('button', { name: 'Run AI Review', exact: true }).click();
  await page.getByRole('button', { name: 'Apply suggestion', exact: true }).click();
  await expect(page.getByText(/No change made: this feedback requires additional facts/)).toBeVisible();
  await expect(page.locator('.review-error')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Apply suggestion', exact: true })).toHaveCount(0);
  expect(JSON.parse(await readFile(join(directory, 'workspace.json'), 'utf8')).resumes[0].entries).toEqual([]);
});
