import { expect, type APIRequestContext } from '@playwright/test';
import { gzipSync } from 'node:zlib';

/**
 * Gzip bytes of the scripts the server declares for a page. Reading the
 * document response keeps this to what the page loads itself: router
 * prefetches of other routes and the legacy nomodule bundle are excluded.
 */
export async function initialScriptBytes(request: APIRequestContext, path: string) {
  const response = await request.get(path);
  expect(response.ok()).toBe(true);
  const html = await response.text();
  const sources = new Set<string>();
  for (const match of html.matchAll(/<script([^>]*)>/g)) {
    const attrs = match[1];
    if (!attrs.includes('src=') || /noModule|nomodule/.test(attrs)) continue;
    const src = /src="([^"]+)"/.exec(attrs)?.[1];
    if (src) sources.add(src);
  }
  let bytes = 0;
  for (const src of sources) {
    const script = await request.get(src);
    expect(script.ok()).toBe(true);
    bytes += gzipSync(await script.body()).length;
  }
  return bytes;
}
