import { chmod, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { rm } from 'node:fs/promises';
import { readRecord, readWorkspace, updateWorkspace, updateRecord } from './storage';
import { copyProfile, copyResume, emptyRecord, emptyWorkspace } from './types';

const dirs: string[] = [];
async function directory() { const dir = await mkdtemp(join(tmpdir(), 'careery-')); dirs.push(dir); return dir; }
afterEach(async () => { await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))); });

it('round-trips bilingual data without leaving temporary files', async () => {
  const dir = await directory();
  await updateRecord((record) => { record.basics.name = { en: 'Name', ar: 'اسم' }; }, dir);
  expect((await readRecord(dir)).basics.name).toEqual({ en: 'Name', ar: 'اسم' });
  expect(await readdir(dir)).toEqual(['career-record.json']);
});
it('serializes simultaneous read-modify-write updates', async () => {
  const dir = await directory();
  await Promise.all(Array.from({ length: 20 }, (_, index) => updateWorkspace((workspace) => {
    workspace.resumes.push(copyResume(emptyRecord(), workspace, `${index}`, `Resume ${index}`));
  }, dir)));
  expect((await readWorkspace(dir)).resumes).toHaveLength(20);
});
it('failed mutations leave the existing file byte-identical and allow retry', async () => {
  const dir = await directory();
  await updateWorkspace((workspace) => { workspace.lastLanguage = 'ar'; }, dir);
  const before = await readFile(join(dir, 'workspace.json'), 'utf8');
  await expect(updateWorkspace(() => { throw new Error('failed change'); }, dir)).rejects.toThrow('failed change');
  expect(await readFile(join(dir, 'workspace.json'), 'utf8')).toBe(before);
  await updateWorkspace((workspace) => { workspace.lastLanguage = 'en'; }, dir);
  expect((await readWorkspace(dir)).lastLanguage).toBe('en');
});
it('does not replace malformed or legacy data with an empty workspace', async () => {
  const dir = await directory();
  await writeFile(join(dir, 'workspace.json'), '{invalid');
  await expect(readWorkspace(dir)).rejects.toThrow();
  expect(await readFile(join(dir, 'workspace.json'), 'utf8')).toBe('{invalid');
  await writeFile(join(dir, 'profiles.json'), '[]');
  await rm(join(dir, 'workspace.json'));
  await expect(readWorkspace(dir)).rejects.toThrow('migration');
});
it('copies source content deeply and preserves Resumes through source changes and moves', () => {
  const record = emptyRecord();
  record.basics.name.en = 'Original';
  record.entries.push({ id: 'skill', kind: 'skills', name: { en: 'TypeScript', ar: 'تايب سكريبت' } });
  const profile = copyProfile(record, 'web', 'Web developer', ['skill']);
  const workspace = emptyWorkspace();
  const resume = copyResume(record, workspace, 'resume', 'Frontend', profile);
  const entry = record.entries[0];
  if (entry.kind !== 'skills') throw new Error('Expected a skill fixture');
  entry.name.en = 'Changed';
  profile.basics.name.en = 'Changed';
  profile.entries.splice(0);
  const before = structuredClone(resume);
  resume.profileId = null;
  expect(resume).toEqual({ ...before, profileId: null });
  expect(resume.entries[0]).toMatchObject({ name: { en: 'TypeScript' } });
  expect(resume.basics.name.en).toBe('Original');
});

it('failed disk writes preserve the previous file and recover on retry', async () => {
  const dir = await directory();
  await updateRecord((record) => { record.basics.name.en = 'Before'; }, dir);
  const before = await readFile(join(dir, 'career-record.json'), 'utf8');
  await chmod(dir, 0o555);
  try {
    await expect(updateRecord((record) => { record.basics.name.en = 'After'; }, dir)).rejects.toThrow();
  } finally { await chmod(dir, 0o755); }
  expect(await readFile(join(dir, 'career-record.json'), 'utf8')).toBe(before);
  await updateRecord((record) => { record.basics.name.en = 'After'; }, dir);
  expect((await readRecord(dir)).basics.name.en).toBe('After');
});
