import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it } from 'vitest';
import type { CareerRecord, Workspace } from '@/lib/types';
import type { ApplicationStore } from '../applications/application-types';
import { analyzeApplications } from '../applications/application-metrics';
import { analyzeWorkspace } from './analytics-data';
let directory = '';
afterEach(async () => { if (directory) await rm(directory, { recursive: true, force: true }); });
it('seeds all content and reconciles independent expected application and workspace metrics', async () => {
  directory = await mkdtemp(join(tmpdir(), 'careery-rich-demo-'));
  const seed = () => execFileSync(process.execPath, ['scripts/seed-demo.mjs'], { env: { ...process.env, CAREERY_DATA_DIR: directory, CAREERY_DEMO_DATE: '2026-10-27' } });
  seed();
  const record: CareerRecord = JSON.parse(await readFile(join(directory, 'career-record.json'), 'utf8'));
  const workspace: Workspace = JSON.parse(await readFile(join(directory, 'workspace.json'), 'utf8'));
  const store: ApplicationStore = JSON.parse(await readFile(join(directory, 'applications.json'), 'utf8'));
  expect(record.entries).toHaveLength(100); expect(workspace.resumes).toHaveLength(74); expect(workspace.profiles).toHaveLength(8); expect(store.applications).toHaveLength(50);
  expect(new Set(workspace.resumes.map((resume) => resume.appearance?.template).filter(Boolean)).size).toBe(6);
  const data = analyzeApplications(store.applications, new Date('2026-10-27T12:00:00Z'));
  expect(data).toMatchObject({ total: 50, submitted: 40, active: 36, archived: 6, responded: 24, responseRate: 0.6, interviewed: 22, offers: 10, accepted: 3, openTasks: 72, overdue: 12, upcomingInterviews: 10, medianResponseDays: 3, medianOutcomeDays: 18 });
  expect(data.unanswered).toHaveLength(12);
  expect(data.stages).toEqual([{ label: 'Applied', count: 28, median: 5 }, { label: 'Interviewing', count: 12, median: 5 }, { label: 'Offer', count: 5, median: 8 }]);
  expect(data.sources.map((source) => source.submitted)).toEqual([8, 8, 8, 8, 8]);
  expect(data.sources.reduce((sum, source) => sum + source.responses, 0)).toBe(24);
  expect(data.sources).toEqual([
    { label: 'Company website', submitted: 8, responses: 5, interviews: 4, offers: 2 },
    { label: 'Job board', submitted: 8, responses: 5, interviews: 4, offers: 2 },
    { label: 'LinkedIn', submitted: 8, responses: 4, interviews: 5, offers: 2 },
    { label: 'Recruiter', submitted: 8, responses: 5, interviews: 4, offers: 2 },
    { label: 'Referral', submitted: 8, responses: 5, interviews: 5, offers: 2 },
  ]);
  expect(data.months.map((month) => month.count)).toEqual([7, 7, 6, 6, 14, 0]);
  const inventory = analyzeWorkspace(record, workspace);
  expect(inventory.sections.map((section) => section.record)).toEqual([16, 10, 22, 36, 16]);
  expect(inventory.resumes).toHaveLength(74);
  expect(inventory.resumes.filter((resume) => resume.language === 'ar')).toHaveLength(28);
  expect(inventory.resumes.filter((resume) => resume.template === 'classic')).toHaveLength(58);
  expect(inventory.profiles.map((profile) => profile.resumes)).toEqual([9, 9, 9, 9, 8, 8, 8, 8]);
  expect(inventory.profiles.reduce((sum, profile) => sum + profile.resumes, 0)).toBe(68);
  const visible = workspace.resumes.flatMap((resume) => resume.entries.filter((entry) => !resume.hiddenEntryIds.includes(entry.id) && !resume.hiddenSections?.includes(entry.kind) && resume.sectionOrder.includes(entry.kind)));
  expect(inventory.sections.reduce((sum, section) => sum + section.visible, 0)).toBe(visible.length);
  const bilingualFields: { en: string; ar?: string }[] = [];
  function collect(value: unknown) {
    if (!value || typeof value !== 'object') return;
    if ('en' in value && typeof value.en === 'string') { const field = value as { en: string; ar?: string }; if (field.en.trim() || field.ar?.trim()) bilingualFields.push(field); }
    else Object.values(value).forEach(collect);
  }
  collect(record);
  expect(inventory.translation).toEqual({ total: bilingualFields.length, translated: bilingualFields.filter((field) => field.ar?.trim()).length });
  expect(inventory.bullets).toBe(record.entries.flatMap((entry) => 'bullets' in entry ? entry.bullets : []).length);
  const before = await Promise.all(['career-record.json', 'workspace.json', 'applications.json'].map((file) => readFile(join(directory, file), 'utf8')));
  seed();
  expect(await Promise.all(['career-record.json', 'workspace.json', 'applications.json'].map((file) => readFile(join(directory, file), 'utf8')))).toEqual(before);
  store.applications[0].company = 'Preserved edit'; workspace.resumes[54].name = 'Preserved Resume'; record.entries[80] = { id: record.entries[80].id, kind: 'skills', name: { en: 'Preserved entry' } };
  await writeFile(join(directory, 'applications.json'), JSON.stringify(store)); await writeFile(join(directory, 'workspace.json'), JSON.stringify(workspace)); await writeFile(join(directory, 'career-record.json'), JSON.stringify(record));
  seed();
  expect(JSON.parse(await readFile(join(directory, 'applications.json'), 'utf8')).applications[0].company).toBe('Preserved edit');
  expect(JSON.parse(await readFile(join(directory, 'workspace.json'), 'utf8')).resumes[54].name).toBe('Preserved Resume');
  expect(JSON.parse(await readFile(join(directory, 'career-record.json'), 'utf8')).entries[80].name.en).toBe('Preserved entry');
});
