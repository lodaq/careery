import { expect, it, vi } from 'vitest';
const mock = vi.hoisted(() => {
  const pdf = vi.fn<() => Promise<Buffer>>().mockResolvedValue(Buffer.from('pdf'));
  const close = vi.fn().mockResolvedValue(undefined);
  const page = { goto: vi.fn().mockResolvedValue({ ok: () => true }), locator: vi.fn().mockReturnValue({ waitFor: vi.fn().mockResolvedValue(undefined) }), evaluate: vi.fn().mockResolvedValue(undefined), pdf };
  const context = { route: vi.fn().mockResolvedValue(undefined), newPage: vi.fn().mockResolvedValue(page), close };
  const browser = { once: vi.fn(), newContext: vi.fn().mockResolvedValue(context) };
  return { pdf, close, page, launch: vi.fn().mockResolvedValue(browser) };
});
vi.mock('playwright', () => ({ chromium: { launch: mock.launch } }));
import { printPdf } from './pdf';
it('refuses non-local render origins before launching a browser', async () => {
  await expect(printPdf('https://example.com')).rejects.toThrow('local');
  expect(mock.launch).not.toHaveBeenCalled();
});
it('rejects concurrent work, closes contexts on failure, and releases the lock for retry', async () => {
  let finish: (value: Buffer) => void = () => { throw new Error('PDF not started'); };
  mock.pdf.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
  const first = printPdf('http://127.0.0.1:3000/render/example');
  await vi.waitFor(() => expect(mock.pdf).toHaveBeenCalledTimes(1));
  await expect(printPdf('http://127.0.0.1:3000/render/second')).rejects.toThrow('Another PDF');
  finish(Buffer.from('first')); expect(await first).toEqual(Buffer.from('first'));
  mock.pdf.mockRejectedValueOnce(new Error('Printer failed'));
  await expect(printPdf('http://127.0.0.1:3000/render/example')).rejects.toThrow('Printer failed');
  expect(mock.close).toHaveBeenCalledTimes(2);
  mock.page.goto.mockResolvedValueOnce({ ok: () => false });
  await expect(printPdf('http://127.0.0.1:3000/render/missing')).rejects.toThrow('could not be loaded');
  expect(await printPdf('http://127.0.0.1:3000/render/example')).toEqual(Buffer.from('pdf'));
  expect(mock.close).toHaveBeenCalledTimes(4); expect(mock.launch).toHaveBeenCalledTimes(1);
});
