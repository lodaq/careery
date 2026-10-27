import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { changeApplication, createApplication, readApplications } from './application-data';
import { analyzeApplications } from './application-metrics';
import { nextTask } from './application-types';
import { updateWorkspace } from '@/lib/storage';
import { copyResume, emptyRecord, emptyWorkspace } from '@/lib/types';
let directory = '';
afterEach(async () => { vi.unstubAllEnvs(); if (directory) await rm(directory, { recursive: true, force: true }); });
async function setup() { directory = await mkdtemp(join(tmpdir(), 'careery-applications-')); vi.stubEnv('CAREERY_DATA_DIR', directory); return createApplication({ company: 'Acme', role: 'Engineer' }); }
it('persists validated applications, records status history, and rejects stale edits', async () => {
  const app = await setup();
  expect(app.status).toBe('Saved');
  await expect(createApplication({ company: ' ', role: 'Engineer' })).rejects.toThrow('Company');
  await changeApplication(app.id, app.revision, 'edit', { company: 'Acme', role: 'Engineer', status: 'Applied', appliedDate: '2026-10-01' });
  const saved = (await readApplications()).applications[0];
  expect(saved.events.at(-1)).toMatchObject({ kind: 'status', status: 'Applied' });
  expect(saved.details.appliedDate).toBe('2026-10-01');
  await expect(changeApplication(app.id, app.revision, 'archive', {})).rejects.toThrow('changed');
  await expect(changeApplication(app.id, saved.revision, 'edit', { company: 'Acme', role: 'Engineer', status: 'Invalid' })).rejects.toThrow('status');
});
it('orders dated tasks first, completes tasks and preserves immutable Resume submissions', async () => {
  let app = await setup();
  const change = async (operation: string, values: Record<string, string>) => { await changeApplication(app.id, app.revision, operation, values); app = (await readApplications()).applications[0]; };
  await change('task', { title: 'Undated' }); await change('task', { title: 'Follow up', due: '2026-10-28' });
  expect(nextTask(app)?.title).toBe('Follow up');
  await change('toggleTask', { itemId: nextTask(app)!.id });
  expect(nextTask(app)?.title).toBe('Undated');
  const resume = copyResume(emptyRecord(), emptyWorkspace(), 'resume-1', 'Original');
  await updateWorkspace((workspace) => workspace.resumes.push(resume));
  await change('snapshot', { resumeId: resume.id });
  await updateWorkspace((workspace) => { workspace.resumes = []; });
  expect(app.documents[0].resume?.name).toBe('Original');
  expect(app.documents[0].createdAt).toBeTruthy();
});
it('preserves corrupt data and serializes concurrent writes', async () => {
  await setup();
  await Promise.all(Array.from({ length: 8 }, (_, i) => createApplication({ company: `Company ${i}`, role: 'Engineer' })));
  expect((await readApplications()).applications).toHaveLength(9);
  const path = join(directory, 'applications.json'); await writeFile(path, '{broken');
  await expect(createApplication({ company: 'New', role: 'Role' })).rejects.toThrow();
  expect(await readFile(path, 'utf8')).toBe('{broken');
});
it('rejects invalid URLs and dates atomically, and clears the outcome date on reopening', async () => {
  let app = await setup(); const path = join(directory, 'applications.json'); const before = await readFile(path, 'utf8');
  await expect(changeApplication(app.id, app.revision, 'edit', { company: 'Changed', role: 'Engineer', jobUrl: 'javascript:alert(1)' })).rejects.toThrow('http');
  expect(await readFile(path, 'utf8')).toBe(before);
  await expect(changeApplication(app.id, app.revision, 'task', { title: 'Task', due: '2026-02-30' })).rejects.toThrow('valid date');
  await changeApplication(app.id, app.revision, 'status', { status: 'Rejected' });
  app = (await readApplications()).applications[0]; expect(app.details.outcomeDate).toBeTruthy();
  await changeApplication(app.id, app.revision, 'status', { status: 'Applied' });
  app = (await readApplications()).applications[0]; expect(app.details.outcomeDate).toBe('');
});
it('measures submitted cohorts, historical milestones, sources, and workload without inventing responses', async () => {
  const app = await setup();
  app.details = { appliedDate: '2026-10-01', source: 'Referral' }; app.status = 'Rejected';
  app.events.push({ id: 'response', kind: 'response', text: 'Recruiter replied', at: '2026-10-03T12:00:00Z' }, { id: 'interview', kind: 'status', status: 'Interviewing', text: '', at: '2026-10-05T12:00:00Z' });
  app.tasks.push({ id: 'task', title: 'Follow up', due: '2026-10-26' });
  const saved = structuredClone(app); saved.id = 'saved'; saved.status = 'Saved'; saved.details = {}; saved.events = []; saved.tasks = [];
  const data = analyzeApplications([app, saved], new Date('2026-10-27T12:00:00Z'));
  expect(data.submitted).toBe(1); expect(data.responded).toBe(1); expect(data.interviewed).toBe(1); expect(data.offers).toBe(0);
  expect(data.sources[0]).toMatchObject({ label: 'Referral', submitted: 1, interviews: 1 });
  expect(data.medianResponseDays).toBe(2); expect(data.overdue).toBe(0);
  app.archived = true; expect(analyzeApplications([app]).submitted).toBe(1);
  expect(analyzeApplications([]).responseRate).toBeNull();
});
