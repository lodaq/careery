import { AsyncLocalStorage } from 'node:async_hooks';
import { relative, resolve } from 'node:path';
import { get, put } from '@vercel/blob';

export const cloudStorage = () => process.env.CAREERY_STORAGE === 'blob';
const revisions = new AsyncLocalStorage<Map<string, string | undefined>>();
function key(path: string) {
  const name = relative(resolve(process.cwd(), 'data'), resolve(path));
  if (!/^users\/user_[a-zA-Z0-9]+\//.test(name) || name.split('/').includes('..')) throw new Error('Invalid storage path.');
  return name;
}
export async function readCloudText(path: string): Promise<string | null> {
  const name = key(path);
  const result = await get(name, { access: 'private', useCache: false });
  revisions.getStore()?.set(name, result?.blob.etag);
  return result ? new Response(result.stream).text() : null;
}
export async function writeCloudText(path: string, text: string) {
  const name = key(path), version = revisions.getStore()?.get(name);
  await put(name, text, { access: 'private', addRandomSuffix: false, allowOverwrite: !!version, ...(version ? { ifMatch: version } : {}), contentType: 'application/json' });
}
export function cloudUpdate<T>(operation: () => Promise<T>) {
  return revisions.run(new Map(), operation);
}
