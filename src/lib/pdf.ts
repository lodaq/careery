import { chromium } from 'playwright';
import type { Browser } from 'playwright';

let browser: Promise<Browser> | undefined;
let busy = false;

export async function printPdf(url: string): Promise<Buffer> {
  const target = new URL(url);
  if (target.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) || target.username || target.password) {
    throw new Error('PDF rendering requires a local HTTP URL.');
  }
  if (busy) throw new Error('Another PDF is being prepared. Try again shortly.');
  busy = true;
  try {
    browser ??= chromium.launch().then((instance) => {
      instance.once('disconnected', () => { browser = undefined; });
      return instance;
    }).catch((error: unknown) => { browser = undefined; throw error; });
    const instance = await browser;
    const context = await instance.newContext();
    try {
      await context.route('**/*', (route) => new URL(route.request().url()).origin === target.origin ? route.continue() : route.abort());
      const page = await context.newPage();
      const response = await page.goto(target.href, { waitUntil: 'networkidle', timeout: 15_000 });
      if (!response?.ok()) throw new Error('The local render page could not be loaded.');
      if (target.pathname.startsWith('/render/')) await page.locator('.resume-document').waitFor({ timeout: 5000 });
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      return await page.pdf({ format: 'A4', printBackground: true, margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' } });
    } finally {
      await context.close();
    }
  } finally {
    busy = false;
  }
}
