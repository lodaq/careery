import { afterEach, expect, it, vi } from 'vitest';
const blob = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }));
vi.mock('@vercel/blob', () => blob);
import { cloudUpdate, readCloudText, writeCloudText } from './cloud-storage';
const path = `${process.cwd()}/data/users/user_test/workspace.json`;
afterEach(() => vi.clearAllMocks());
it('uses private uncached reads and conditional writes to prevent lost updates', async () => {
  blob.get.mockResolvedValue({ blob: { etag: 'version-1' }, stream: new Response('{}').body });
  await cloudUpdate(async () => {
    expect(await readCloudText(path)).toBe('{}');
    await writeCloudText(path, '{"version":1}');
  });
  expect(blob.get).toHaveBeenCalledWith('users/user_test/workspace.json', { access: 'private', useCache: false });
  expect(blob.put).toHaveBeenCalledWith('users/user_test/workspace.json', '{"version":1}', expect.objectContaining({ access: 'private', allowOverwrite: true, ifMatch: 'version-1' }));
  blob.put.mockRejectedValueOnce(new Error('Precondition failed'));
  await expect(cloudUpdate(() => writeCloudText(path, '{}'))).rejects.toThrow('Precondition');
});
it('creates missing files without overwrite and refuses paths outside user storage', async () => {
  blob.get.mockResolvedValue(null);
  await cloudUpdate(async () => { expect(await readCloudText(path)).toBeNull(); await writeCloudText(path, '{}'); });
  expect(blob.put).toHaveBeenCalledWith(expect.any(String), '{}', expect.objectContaining({ allowOverwrite: false }));
  await expect(readCloudText('/tmp/other.json')).rejects.toThrow('Invalid storage path');
});
