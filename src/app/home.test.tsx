import { afterEach, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';
import Page from './page';

const session = vi.hoisted(() => ({ userId: null as string | null }));
vi.mock('@clerk/nextjs/server', () => ({ auth: async () => session }));
vi.mock('next/server', () => ({ connection: async () => undefined }));
vi.mock('next/navigation', () => ({ redirect: (path: string) => { throw new Error(`Redirect: ${path}`); } }));
vi.mock('@/components/LandingPage', () => ({ LandingPage: () => null }));

async function home() {
  const child = Page().props.children as ReactElement;
  return (child.type as () => Promise<ReactElement>)();
}
afterEach(() => { session.userId = null; vi.unstubAllEnvs(); });
it('renders the public landing page without a session', async () => {
  vi.stubEnv('CAREERY_LOCAL_USER', '');
  expect(await home()).toBeTruthy();
});
it('sends signed-in users to Today', async () => {
  session.userId = 'user_example';
  await expect(home()).rejects.toThrow('Redirect: /today');
});
it('preserves local development workspace access', async () => {
  vi.stubEnv('CAREERY_LOCAL_USER', 'demo');
  await expect(home()).rejects.toThrow('Redirect: /today');
});
