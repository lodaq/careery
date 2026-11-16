import { cloudStorage, readCloudText, writeCloudText, cloudUpdate } from './cloud-storage';
import { connection } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { emptyRecord, emptyWorkspace } from './types';
import type { CareerRecord, Workspace } from './types';

const queues = new Map<string, Promise<void>>();
export async function dataDirectory() {
  await connection();
  if (process.env.CAREERY_LOCAL_USER) return join(process.env.CAREERY_DATA_DIR ?? join(process.cwd(), 'data'), 'users', process.env.CAREERY_LOCAL_USER);
  const { userId } = await auth();
  if (!userId || !/^user_[a-zA-Z0-9]+$/.test(userId)) throw new Error('Authentication required.');
  return join(process.env.CAREERY_DATA_DIR ?? join(process.cwd(), 'data'), 'users', userId);
}
function missing(error: unknown): boolean { return error instanceof Error && 'code' in error && error.code === 'ENOENT'; }
export async function readStoredText(path: string): Promise<string | null> {
  if (cloudStorage() && !path.includes('/.restore-')) return readCloudText(path);
  try { return await readFile(path, 'utf8'); }
  catch (error) { if (missing(error)) return null; throw error; }
}
export async function readJson<T>(path: string, fallback: () => T): Promise<T> {
  const text = await readStoredText(path);
  if (text === null) return fallback();
  const value: unknown = JSON.parse(text);
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1) {
    throw new Error(`Unsupported data at ${path}; migration is required.`);
  }
  return value as T;
}

export async function readRecord(directory?: string): Promise<CareerRecord> {
  directory ??= await dataDirectory();
  const record = await readJson(join(directory, 'career-record.json'), emptyRecord);
  if (!record.basics || !Array.isArray(record.entries)) throw new Error('Invalid Career Record; original data was preserved.');
  return record;
}
export async function readWorkspace(directory?: string): Promise<Workspace> {
  directory ??= await dataDirectory();
  try {
    if (cloudStorage() && !directory.includes('/.restore-')) {
      if (await readStoredText(join(directory, 'profiles.json')) === null) throw Object.assign(new Error('Missing'), { code: 'ENOENT' });
    } else await stat(join(directory, 'profiles.json'));
  } catch (error) {
    if (!missing(error)) throw error;
    const workspace = await readJson(join(directory, 'workspace.json'), emptyWorkspace);
    if (!Array.isArray(workspace.profiles) || !Array.isArray(workspace.resumes) || !['en', 'ar'].includes(workspace.lastLanguage)) {
      throw new Error('Invalid workspace; original data was preserved.');
    }
    return workspace;
  }
  throw new Error('Legacy profiles.json exists; an explicit migration is required before writing workspace data.');
}

export async function updateJson<T>(path: string, read: () => Promise<T>, mutate: (data: T) => void): Promise<T> {
  if (cloudStorage() && !path.includes('/.restore-')) return cloudUpdate(async () => {
    await readStoredText(path);
    const data = await read();
    mutate(data);
    await writeCloudText(path, JSON.stringify(data, null, 2) + '\n');
    return data;
  });
  const key = resolve(path);
  const previous = queues.get(key) ?? Promise.resolve();
  const operation = previous.then(async () => {
    const data = await read();
    mutate(data);
    const temporary = `${key}.${randomUUID()}.tmp`;
    await mkdir(resolve(key, '..'), { recursive: true });
    try {
      await writeFile(temporary, JSON.stringify(data, null, 2) + '\n', { flag: 'wx' });
      await rename(temporary, key);
    } finally {
      await rm(temporary, { force: true });
    }
    return data;
  });
  const settled = operation.then(() => undefined, () => undefined);
  queues.set(key, settled);
  void settled.then(() => { if (queues.get(key) === settled) queues.delete(key); });
  return operation;
}
export async function updateRecord(mutate: (record: CareerRecord) => void, directory?: string): Promise<CareerRecord> {
  directory ??= await dataDirectory();
  return updateJson(join(directory, 'career-record.json'), () => readRecord(directory), mutate);
}
export async function updateWorkspace(mutate: (workspace: Workspace) => void, directory?: string): Promise<Workspace> {
  directory ??= await dataDirectory();
  return updateJson(join(directory, 'workspace.json'), () => readWorkspace(directory), mutate);
}
/** Replaces a whole store through the same queue and atomic rename used by updates. */
export function replaceJson<T>(path: string, data: T): Promise<T> {
  return updateJson(path, async () => data, () => undefined);
}
