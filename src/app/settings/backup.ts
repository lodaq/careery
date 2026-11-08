import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { dataDirectory, readRecord, readWorkspace, replaceJson } from '@/lib/storage';
import { readApplications } from '../applications/application-data';
import { readQuestions } from '../interview-questions/question-data';

export const backupFiles = ['career-record.json', 'workspace.json', 'applications.json', 'interview-questions.json'] as const;
export type BackupFile = typeof backupFiles[number];
export interface Backup { app: 'careery'; format: 1; exportedAt: string; files: Partial<Record<BackupFile, unknown>> }

const missing = (error: unknown) => error instanceof Error && 'code' in error && error.code === 'ENOENT';

/** Reads every store as-is; a missing file is omitted rather than invented. */
export async function createBackup(directory = dataDirectory()): Promise<Backup> {
  const files: Backup['files'] = {};
  for (const name of backupFiles) {
    try { files[name] = JSON.parse(await readFile(join(/*turbopackIgnore: true*/ directory, name), 'utf8')); }
    catch (error) { if (!missing(error)) throw error; }
  }
  return { app: 'careery', format: 1, exportedAt: new Date().toISOString(), files };
}

function parseBackup(input: unknown): Backup {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('That file is not a Careery backup.');
  const value = input as Record<string, unknown>;
  if (value.app !== 'careery' || value.format !== 1) throw new Error('That file is not a supported Careery backup.');
  if (!value.files || typeof value.files !== 'object' || Array.isArray(value.files)) throw new Error('The backup has no data files.');
  const files = value.files as Record<string, unknown>;
  const names = Object.keys(files);
  if (!names.length) throw new Error('The backup has no data files.');
  if (names.some((name) => !backupFiles.includes(name as BackupFile))) throw new Error('The backup contains an unknown data file.');
  if (names.some((name) => !files[name] || typeof files[name] !== 'object' || Array.isArray(files[name]))) throw new Error('The backup contains unreadable data.');
  return { app: 'careery', format: 1, exportedAt: typeof value.exportedAt === 'string' ? value.exportedAt : '', files: files as Backup['files'] };
}

/** Copies current files aside so a restore can be undone from `data/backups/`. */
async function snapshot(directory: string) {
  const existing: { name: BackupFile; text: string }[] = [];
  for (const name of backupFiles) {
    try { existing.push({ name, text: await readFile(join(/*turbopackIgnore: true*/ directory, name), 'utf8') }); }
    catch (error) { if (!missing(error)) throw error; }
  }
  if (!existing.length) return null;
  const root = join(/*turbopackIgnore: true*/ directory, 'backups');
  await mkdir(root, { recursive: true });
  const target = await mkdtemp(join(/*turbopackIgnore: true*/ root, `${new Date().toISOString().replace(/[:.]/g, '-')}-`));
  await Promise.all(existing.map(({ name, text }) => writeFile(join(/*turbopackIgnore: true*/ target, name), text)));
  return target.slice(root.length + 1);
}

/**
 * Validates the bundle with the same readers the app uses, snapshots current
 * data, then replaces only the files present in the bundle.
 */
export async function restoreBackup(input: unknown, directory = dataDirectory()) {
  const bundle = parseBackup(input);
  await mkdir(directory, { recursive: true });
  const temporary = await mkdtemp(join(/*turbopackIgnore: true*/ directory, '.restore-'));
  try {
    for (const name of backupFiles) {
      const value = bundle.files[name];
      if (value !== undefined) await writeFile(join(/*turbopackIgnore: true*/ temporary, name), JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
    }
    if (bundle.files['career-record.json'] !== undefined) await readRecord(temporary);
    if (bundle.files['workspace.json'] !== undefined) await readWorkspace(temporary);
    if (bundle.files['applications.json'] !== undefined) await readApplications(temporary);
    // Reading also migrates an older interview-question schema inside the temporary copy.
    if (bundle.files['interview-questions.json'] !== undefined) await readQuestions(temporary);
    const restored = backupFiles.filter((name) => bundle.files[name] !== undefined);
    const snapshotName = await snapshot(directory);
    for (const name of restored) {
      const value: unknown = JSON.parse(await readFile(join(/*turbopackIgnore: true*/ temporary, name), 'utf8'));
      await replaceJson(join(/*turbopackIgnore: true*/ directory, name), value);
    }
    return { restored, snapshot: snapshotName };
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}
