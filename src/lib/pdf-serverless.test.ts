import { afterEach, expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => {
  const context = { route: vi.fn(), close: vi.fn(), newPage: async () => ({ goto: async () => ({ ok: () => true }), locator: () => ({ waitFor: async () => {} }), evaluate: async () => {}, pdf: async () => Buffer.from('%PDF') }) };
  const instances: { close: ReturnType<typeof vi.fn> }[] = [];
  const launch = vi.fn(async () => { const browser = { once: vi.fn(), close: vi.fn(), newContext: async () => context }; instances.push(browser); return browser; });
  return { launch, instances, executablePath: vi.fn(async () => '/tmp/chromium'), copyFile: vi.fn(), mkdir: vi.fn() };
});
vi.mock('next/headers', () => ({ headers: async () => new Headers() }));
vi.mock('playwright-core', () => ({ chromium: { launch: mock.launch } }));
vi.mock('@sparticuz/chromium', () => ({ default: { args: [], executablePath: mock.executablePath } }));
vi.mock('node:fs/promises', () => ({ copyFile: mock.copyFile, mkdir: mock.mkdir }));
import { printPdf } from './pdf';
afterEach(() => vi.unstubAllEnvs());
it('creates a fresh serverless browser for each export and installs Arabic fonts after extraction', async () => {
  vi.stubEnv('VERCEL', '1'); vi.stubEnv('CAREERY_SITE_URL', 'https://careery.example');
  await printPdf('https://careery.example/render/first');
  await printPdf('https://careery.example/render/second');
  expect(mock.launch).toHaveBeenCalledTimes(2);
  for (const browser of mock.instances) expect(browser.close).toHaveBeenCalledOnce();
  expect(mock.copyFile).toHaveBeenCalledWith(expect.stringContaining('public/fonts/noto-sans-arabic.ttf'), '/tmp/fonts/noto-sans-arabic.ttf');
  expect(mock.executablePath.mock.invocationCallOrder[0]).toBeLessThan(mock.mkdir.mock.invocationCallOrder[0]);
});
