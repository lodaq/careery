import { expect, it, vi } from 'vitest';
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/app/applications/application-data', () => ({ changeApplication: vi.fn() }));
import { POST } from './route';
import { changeApplication } from '@/app/applications/application-data';
const context = { params: Promise.resolve({ id: 'app-1' }) };
it('accepts a same-origin upload when Next uses an internal hostname', async () => {
  const form = new FormData(); form.set('revision', '2'); form.set('file', new File(['letter'], 'letter.txt'));
  const result = await POST(new Request('http://localhost:3100/api/applications/app-1/documents', { method: 'POST', headers: { host: '127.0.0.1:3100', origin: 'http://127.0.0.1:3100' }, body: form }), context);
  expect(result.status).toBe(200);
  expect(changeApplication).toHaveBeenCalledWith('app-1', 2, 'attachment', { name: 'letter.txt', content: Buffer.from('letter').toString('base64') });
});
it('rejects missing/cross-origin requests and oversized bodies before reading them', async () => {
  const response = await POST(new Request('http://localhost:3100', { method: 'POST', headers: { host: '127.0.0.1:3100', origin: 'https://attacker.example' } }), context);
  expect(response.status).toBe(403);
  const oversized = await POST(new Request('http://localhost:3100', { method: 'POST', headers: { host: '127.0.0.1:3100', origin: 'http://127.0.0.1:3100', 'content-length': String(7 * 1024 * 1024) } }), context);
  expect(oversized.status).toBe(413);
});
