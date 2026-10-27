// @vitest-environment jsdom
import { act } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import RootLayout from './layout';

let root: Root | undefined;
afterEach(async () => { if (root) await act(async () => root!.unmount()); root = undefined; vi.restoreAllMocks(); });
it('tolerates extension attributes on body without removing them', async () => {
  const tree = <RootLayout><main>Career workspace</main></RootLayout>;
  document.open(); document.write(`<!doctype html>${renderToString(tree)}`); document.close();
  document.body.setAttribute('data-new-gr-c-s-check-loaded', '14.1342.0');
  document.body.setAttribute('data-gr-ext-installed', '');
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  await act(async () => { root = hydrateRoot(document, tree); });
  expect(error.mock.calls.flat().join(' ')).not.toMatch(/hydrated|hydration|didn't match/i);
  expect(document.body.getAttribute('data-new-gr-c-s-check-loaded')).toBe('14.1342.0');
});
it('still reports mismatches in application content', async () => {
  document.open(); document.write(`<!doctype html>${renderToString(<RootLayout><main data-state="server">Content</main></RootLayout>)}`); document.close();
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  await act(async () => { root = hydrateRoot(document, <RootLayout><main data-state="client">Content</main></RootLayout>); });
  expect(error.mock.calls.flat().join(' ')).toMatch(/hydrated|hydration|didn't match/i);
});
