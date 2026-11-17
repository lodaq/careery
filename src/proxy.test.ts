import { afterEach, expect, it, vi } from 'vitest';
import { NextRequest, type NextFetchEvent } from 'next/server';
const middleware = vi.hoisted(() => vi.fn(() => new Response(null, { status: 204 })));
vi.mock('@clerk/nextjs/server', () => ({ clerkMiddleware: () => middleware }));
import proxy from './proxy';
afterEach(() => vi.clearAllMocks());
it('rejects insecure remote origins before a Clerk handshake can loop', async () => {
  const response = await proxy(new NextRequest('http://192.168.1.50/today'), {} as NextFetchEvent);
  expect(response?.status).toBe(400);
  expect(response?.headers.get('location')).toBeNull();
  expect(middleware).not.toHaveBeenCalled();
});
it.each([
  ['http://localhost:3000/today', {}],
  ['http://127.0.0.1:3000/today', {}],
  ['https://careery.example/today', {}],
  ['http://192.168.1.50/today', { 'x-forwarded-proto': 'https' }],
])('preserves Clerk authentication for %s', async (url, headers) => {
  expect((await proxy(new NextRequest(url, { headers }), {} as NextFetchEvent))?.status).toBe(204);
  expect(middleware).toHaveBeenCalledOnce();
});
