import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { copyProfile, copyResume, emptyRecord, emptyWorkspace } from '../../lib/types';
import { readRecord, updateRecord, updateWorkspace } from '../../lib/storage';
import { recordRevision } from './record-data';
import { saveCareerRecord } from './actions';
let directory: string;
afterEach(async () => { vi.unstubAllEnvs(); if (directory) await rm(directory, { recursive: true, force: true }); });
it('persists valid edits and rejects a stale tab without overwriting the newer file', async () => {
  directory = await mkdtemp(join(tmpdir(), 'careery-actions-')); vi.stubEnv('CAREERY_DATA_DIR', directory);
  const form = new FormData(); form.set('name.en', 'First saved name'); form.set('_revision', recordRevision(emptyRecord()));
  expect((await saveCareerRecord(form)).revision).toBeDefined();
  const bytes = await readFile(join(directory, 'career-record.json'), 'utf8');
  form.set('name.en', 'Stale name');
  expect((await saveCareerRecord(form)).error).toContain('another tab');
  expect(await readFile(join(directory, 'career-record.json'), 'utf8')).toBe(bytes);
  form.set('_revision', recordRevision(await readRecord(directory)));
  form.set('email', 'invalid');
  expect((await saveCareerRecord(form)).error).toContain('email');
  expect(await readFile(join(directory, 'career-record.json'), 'utf8')).toBe(bytes);
});

it('source edits and deletion leave saved Profile and Resume files byte-identical', async () => {
  directory = await mkdtemp(join(tmpdir(), 'careery-independence-')); vi.stubEnv('CAREERY_DATA_DIR', directory);
  const source = emptyRecord(); source.entries.push({ id: 'skill-1', kind: 'skills', name: { en: 'TypeScript' } });
  await updateRecord((record) => { Object.assign(record, source); }, directory);
  const profile = copyProfile(source, 'profile-1', 'Web', ['skill-1']);
  const resume = copyResume(source, emptyWorkspace(), 'resume-1', 'Developer', profile);
  await updateWorkspace((workspace) => { workspace.profiles.push(profile); workspace.resumes.push(resume); }, directory);
  const before = await readFile(join(directory, 'workspace.json'), 'utf8');
  const form = new FormData(); form.set('_revision', recordRevision(source)); form.set('name.en', 'Edited source');
  expect((await saveCareerRecord(form)).revision).toBeDefined();
  expect((await readRecord(directory)).entries).toHaveLength(0);
  expect(await readFile(join(directory, 'workspace.json'), 'utf8')).toBe(before);
});
