import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { readRecord, readWorkspace, updateRecord, updateWorkspace } from '../../lib/storage';
import { copyResume, emptyWorkspace } from '../../lib/types';
import { createProfile, deleteProfile, saveProfile, profileRevision } from './profile-data';
let directory: string;
afterEach(async () => { vi.unstubAllEnvs(); if (directory) await rm(directory, { recursive: true, force: true }); });
async function setup() {
  directory = await mkdtemp(join(tmpdir(), 'careery-profile-')); vi.stubEnv('CAREERY_DATA_DIR', directory);
  await updateRecord((record) => { record.basics.name.en = 'Original'; record.entries.push({ id: 'skill-1', kind: 'skills', name: { en: 'TypeScript', ar: 'تايب سكريبت' } }); });
  const form = new FormData(); form.set('name', 'Web developer');
  const result = await createProfile(form);
  if (!result.id) throw new Error(result.error);
  return (await readWorkspace()).profiles[0];
}
it('creates a Profile and saves independent copied wording without touching its source', async () => {
  const profile = await setup();
  const resume = copyResume(await readRecord(), emptyWorkspace(), 'existing-resume', 'Prepared Resume', profile);
  await updateWorkspace((workspace) => { workspace.resumes.push(resume); });
  const before = await readFile(join(directory, 'career-record.json'), 'utf8');
  const form = new FormData(); form.set('profileName', 'Frontend'); form.set('_revision', profileRevision(profile));
  form.set('name.en', profile.basics.name.en); form.set('headline.en', 'Frontend developer');
  form.append('entryId', 'skill-1'); form.set('skill-1.kind', 'skills'); form.set('skill-1.name.en', 'Advanced TypeScript');
  expect((await saveProfile(profile.id, form)).revision).toBeDefined();
  expect(await readFile(join(directory, 'career-record.json'), 'utf8')).toBe(before);
  await updateRecord((record) => { record.entries = []; });
  const saved = (await readWorkspace()).profiles[0];
  expect(saved.entries[0]).toMatchObject({ name: { en: 'Advanced TypeScript' } });
  expect(saved.name).toBe('Frontend');
  expect((await readWorkspace()).resumes[0]).toEqual(resume);
  expect((await saveProfile(profile.id, form)).error).toContain('changed');
});
it('deleting a populated Profile atomically moves Resumes to Unfiled without changing content', async () => {
  const profile = await setup();
  const resume = copyResume(await readRecord(), emptyWorkspace(), 'resume-1', 'Developer', profile);
  await updateWorkspace((workspace) => { workspace.resumes.push(resume); });
  const form = new FormData(); form.set('id', profile.id); form.set('_revision', profileRevision(profile)); form.set('resumeCount', '1');
  expect(await deleteProfile(form)).toEqual({ success: true });
  const workspace = await readWorkspace();
  expect(workspace.profiles).toHaveLength(0);
  expect(workspace.resumes).toEqual([{ ...resume, profileId: null }]);
});
it('refuses blank names and deletion based on stale Resume counts', async () => {
  const profile = await setup();
  const blank = new FormData(); blank.set('name', '  ');
  expect((await createProfile(blank)).error).toContain('name');
  const form = new FormData(); form.set('id', profile.id); form.set('_revision', profileRevision(profile)); form.set('resumeCount', '2');
  expect((await deleteProfile(form)).error).toContain('changed');
  expect((await readWorkspace()).profiles).toHaveLength(1);
});
