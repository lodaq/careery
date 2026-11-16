'use server';
import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { dataDirectory } from '@/lib/storage';
import { changeTool, readTools, seedToolbox, website } from './data';
export async function toolAction(form: FormData) {
  try {
    const directory = await dataDirectory();
    const id = String(form.get('id') ?? '');
    const operation = String(form.get('operation') ?? 'save');
    if (operation === 'seed') {
      await seedToolbox(directory);
      revalidatePath('/toolbox');
      return { ok: true };
    }
    const previous = id ? (await readTools(directory)).tools.find(t => t.id === id) : undefined;
    if (id && !previous) throw new Error('This tool no longer exists. Refresh and retry.');
    if (operation === 'delete') {
      await changeTool(operation, previous!, directory);
    } else {
      const url = website(String(form.get('url') ?? '').trim());
      let name = String(form.get('name') ?? '').trim();
      const description = String(form.get('description') ?? '').trim() || previous?.description || undefined;
      const category = String(form.get('category') ?? '').trim() || previous?.category || undefined;
      let icon = previous?.url === url ? previous.icon : '';
      if (!previous || previous.url !== url) {
        // shortcut: external metadata can be unavailable; keep a usable domain-named card.
        try {
          const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(10000), cache: 'no-store', redirect: 'error' });
          if (response.ok) {
            const result = await response.json();
            if (result.status === 'success') {
              if (!name && typeof result.data?.title === 'string') name = result.data.title;
              if (typeof result.data?.logo?.url === 'string') icon = website(result.data.logo.url);
            }
          }
        } catch { /* Metadata is optional; persistence is not. */ }
      }
      await changeTool(operation, { id: id || randomUUID(), url, name: name || new URL(url).hostname, icon, description, category }, directory);
    }
    revalidatePath('/toolbox');
    return { ok: true };
  } catch (error) {
    console.error('Toolbox update failed', error);
    return { error: 'Could not save your change. Check the website link and retry.' };
  }
}
