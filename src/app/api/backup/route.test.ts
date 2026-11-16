import { expect, it, vi } from 'vitest';
vi.mock('@clerk/nextjs/server', () => ({ auth: async () => ({ userId: null }) }));
vi.mock('next/server', () => ({ connection: async () => {} }));
vi.mock('@/app/settings/backup', () => ({ createBackup: vi.fn(), restoreBackup: vi.fn() }));
import { createBackup } from '@/app/settings/backup';
import { GET } from './route';
it('returns 401 without reading backup data for a signed-out request', async () => {
  vi.stubEnv('CAREERY_LOCAL_USER', '');
  try {
    expect((await GET()).status).toBe(401);
    expect(createBackup).not.toHaveBeenCalled();
  } finally { vi.unstubAllEnvs(); }
});
