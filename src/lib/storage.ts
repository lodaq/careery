import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { emptyRecord, emptyWorkspace } from './types';
import type { CareerRecord, Workspace } from './types';

const queues = new Map<string, Promise<void>>();
const dataDirectory = () => process.env.CAREERY_DATA_DIR ?? join(process.cwd(), 'data');
function missing(error: unknown): boolean { return error instanceof Error && 'code' in error && error.code === 'ENOENT'; }
async function readJson<T>(path: string, fallback: () => T): Promise<T> {
  let text: string;
  try { text = await readFile(path, 'utf8'); }
  catch (error) { if (missing(error)) return fallback(); throw error; }
  const value: unknown = JSON.parse(text);
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1) {
    throw new Error(`Unsupported data at ${path}; migration is required.`);
  }
  return value as T;
}

export async function readRecord(directory = dataDirectory()): Promise<CareerRecord> {
  const record = await readJson(join(directory, 'career-record.json'), emptyRecord);
  if (!record.basics || !Array.isArray(record.entries)) throw new Error('Invalid Career Record; original data was preserved.');
  return record;
}
export async function readWorkspace(directory = dataDirectory()): Promise<Workspace> {
  try {
    await stat(join(directory, 'profiles.json'));
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

async function updateJson<T>(path: string, read: () => Promise<T>, mutate: (data: T) => void): Promise<T> {
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
export function updateRecord(mutate: (record: CareerRecord) => void, directory = dataDirectory()): Promise<CareerRecord> {
  return updateJson(join(directory, 'career-record.json'), () => readRecord(directory), mutate);
}
export function updateWorkspace(mutate: (workspace: Workspace) => void, directory = dataDirectory()): Promise<Workspace> {
  return updateJson(join(directory, 'workspace.json'), () => readWorkspace(directory), mutate);
}
