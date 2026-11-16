import { headers } from 'next/headers';
import { chromium } from 'playwright-core';
import type { Browser } from 'playwright-core';

let browser: Promise<Browser> | undefined;
let busy = false;

export async function printPdf(url: string): Promise<Buffer> {
  const target = new URL(url);
  const local = target.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname);
  const hosted = process.env.VERCEL === '1' && target.protocol === 'https:' && target.origin === process.env.CAREERY_SITE_URL;
  if ((!local && !hosted) || target.username || target.password) {
    throw new Error('PDF rendering requires a local HTTP URL.');
  }
  if (busy) throw new Error('Another PDF is being prepared. Try again shortly.');
  busy = true;
  try {
    browser ??= (async () => {
      if (process.env.VERCEL !== '1') return chromium.launch();
      const { default: serverless } = await import('@sparticuz/chromium');
      return chromium.launch({ args: serverless.args, executablePath: await serverless.executablePath(), headless: true });
    })().then((instance) => {
      instance.once('disconnected', () => { browser = undefined; });
      return instance;
    }).catch((error: unknown) => { browser = undefined; throw error; });
    const instance = await browser;
    const incoming = await headers();
    const cookie = incoming.get('cookie'), authorization = incoming.get('authorization');
    const context = await instance.newContext({ extraHTTPHeaders: { ...(cookie ? { cookie } : {}), ...(authorization ? { authorization } : {}) } });
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
