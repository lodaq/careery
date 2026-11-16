import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it, vi } from 'vitest';
import { dataDirectory, readRecord, updateRecord } from './storage';
const session = vi.hoisted(() => ({ userId: 'user_alice' as string | null }));
vi.mock('next/server', () => ({ connection: async () => {} }));
vi.mock('@clerk/nextjs/server', () => ({ auth: async () => session }));
it('isolates user records and rejects missing or invalid identities', async () => {
  const root = await mkdtemp(join(tmpdir(), 'careery-users-'));
  vi.stubEnv('CAREERY_DATA_DIR', root);
  try {
    await updateRecord((record) => { record.basics.name.en = 'Alice'; });
    session.userId = 'user_bob';
    expect((await readRecord()).basics.name.en).not.toBe('Alice');
    await updateRecord((record) => { record.basics.name.en = 'Bob'; });
    session.userId = 'user_alice';
    expect((await readRecord()).basics.name.en).toBe('Alice');
    for (const userId of [null, '../alice']) {
      session.userId = userId;
      await expect(dataDirectory()).rejects.toThrow('Authentication required');
    }
  } finally { vi.unstubAllEnvs(); await rm(root, { recursive: true, force: true }); }
});
