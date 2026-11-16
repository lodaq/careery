import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { readRecord, readWorkspace } from '@/lib/storage';
import { POST as restoreRequest } from '@/app/api/backup/route';
import { readApplications } from '../applications/application-data';
import { readQuestions } from '../interview-questions/question-data';
import { readTools } from '../toolbox/data';
import { backupFiles, createBackup, restoreBackup } from './backup';

const directories: string[] = [];
async function directory() {
  const path = await mkdtemp(join(tmpdir(), 'careery-backup-'));
  directories.push(path);
  return path;
}
afterEach(async () => { await Promise.all(directories.splice(0).map((path) => rm(path, { recursive: true, force: true }))); });

const record = { version: 1, basics: { name: { en: 'Ada' }, title: { en: 'Engineer' }, location: { en: 'Cairo' }, email: 'ada@example.com', phone: '', links: [] }, entries: [] };
const workspace = { version: 1, profiles: [], resumes: [], lastLanguage: 'en' };
const applications = { version: 1, applications: [] };
const questions = { version: 1, schema: 2, tagRevision: 0, tags: [], questions: [], events: [] };
async function writeAll(path: string) {
  await Promise.all(backupFiles.map((name) => writeFile(join(path, name), JSON.stringify({ 'career-record.json': record, 'workspace.json': workspace, 'applications.json': applications, 'interview-questions.json': questions, 'notes.json': { version: 1, notes: [] }, 'lessons.json': { version: 1, notes: [] }, 'toolbox.json': { version: 1, tools: [{ id: 'example', name: 'Example', url: 'https://example.com/', icon: '' }] } }[name], null, 2) + '\n')));
}

it('round-trips every store and keeps a copy of the replaced data', async () => {
  const source = await directory();
  await writeAll(source);
  const bundle = await createBackup(source);
  expect(bundle.app).toBe('careery');
  expect(Object.keys(bundle.files)).toHaveLength(7);

  const target = await directory();
  await writeFile(join(target, 'career-record.json'), JSON.stringify({ ...record, basics: { ...record.basics, name: { en: 'Before restore' } } }) + '\n');
  const result = await restoreBackup(bundle, target);

  expect(result.restored).toEqual([...backupFiles]);
  expect(result.snapshot).toBeTruthy();
  expect((await readRecord(target)).basics.name.en).toBe('Ada');
  expect((await readWorkspace(target)).lastLanguage).toBe('en');
  expect((await readApplications(target)).applications).toEqual([]);
  expect((await readQuestions(target)).schema).toBe(2);
  expect((await readTools(target)).tools[0].name).toBe('Example');
  const saved = await readFile(join(target, 'backups', result.snapshot!, 'career-record.json'), 'utf8');
  expect(JSON.parse(saved).basics.name.en).toBe('Before restore');
});

it('omits missing stores from backups and preserves them when restoring a partial backup', async () => {
  const source = await directory();
  await writeFile(join(source, 'career-record.json'), JSON.stringify(record) + '\n');
  const bundle = await createBackup(source);
  expect(Object.keys(bundle.files)).toEqual(['career-record.json']);

  const target = await directory();
  await writeFile(join(target, 'career-record.json'), JSON.stringify({ ...record, basics: { ...record.basics, name: { en: 'Replace this' } } }) + '\n');
  await writeFile(join(target, 'workspace.json'), JSON.stringify(workspace) + '\n');
  const result = await restoreBackup(bundle, target);

  expect(result.restored).toEqual(['career-record.json']);
  expect((await readRecord(target)).basics.name.en).toBe('Ada');
  expect(await readFile(join(target, 'workspace.json'), 'utf8')).toBe(JSON.stringify(workspace) + '\n');
});

it('rejects invalid data without changing current files or creating a snapshot', async () => {
  const target = await directory();
  await writeFile(join(target, 'career-record.json'), JSON.stringify(record) + '\n');
  const before = await readFile(join(target, 'career-record.json'), 'utf8');
  await expect(restoreBackup({ app: 'careery', format: 1, files: { 'workspace.json': { version: 1, profiles: 'not-an-array' } } }, target)).rejects.toThrow();
  expect(await readFile(join(target, 'career-record.json'), 'utf8')).toBe(before);
  await expect(stat(join(target, 'backups'))).rejects.toThrow();
});

it('accepts only known, non-empty Careery backups', async () => {
  await expect(restoreBackup({ app: 'careery', format: 1, files: {} }, await directory())).rejects.toThrow('no data files');
  await expect(restoreBackup({ app: 'careery', format: 1, files: { 'other.json': { version: 1 } } }, await directory())).rejects.toThrow('unknown data file');
  await expect(restoreBackup({ app: 'other', format: 1, files: { 'workspace.json': workspace } }, await directory())).rejects.toThrow('not a supported');
});

it('migrates an older interview-question file during restore', async () => {
  const target = await directory();
  const result = await restoreBackup({ app: 'careery', format: 1, files: { 'interview-questions.json': { version: 1, questions: [{ id: 'starter-1', question: 'Tell me about yourself.', answer: 'A short story.' }] } } }, target);
  expect(result.restored).toEqual(['interview-questions.json']);
  const library = await readQuestions(target);
  expect(library.schema).toBe(2);
  expect(library.questions.some((question) => question.id === 'starter-1')).toBe(true);
});

it('rejects cross-origin restore requests', async () => {
  const response = await restoreRequest(new Request('http://localhost/api/backup', {
    method: 'POST',
    headers: { origin: 'http://attacker.example', host: 'localhost', 'content-type': 'application/json' },
    body: '{}',
  }));
  expect(response.status).toBe(403);
  expect((await response.json()).error).toContain('Careery Settings');
});

it('rejects oversized restore requests, with or without a content-length header', async () => {
  const headers = { origin: 'http://localhost', host: 'localhost', 'content-type': 'application/json' };
  const declared = await restoreRequest(new Request('http://localhost/api/backup', {
    method: 'POST', headers: { ...headers, 'content-length': '25000001' }, body: '{}',
  }));
  expect(declared.status).toBe(413);

  const actual = await restoreRequest(new Request('http://localhost/api/backup', {
    method: 'POST', headers, body: ' '.repeat(25_000_001),
  }));
  expect(actual.status).toBe(413);
});
