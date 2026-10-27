'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConfirmAction } from '@/components/ConfirmAction';
import type { Library, LibraryResult } from './question-model';
import { changeTagAction } from './actions';
export function TagManager({ library, pending, run }: { library: Library; pending: boolean; run: (action: () => Promise<LibraryResult>, message: string) => Promise<boolean> }) {
  const { confirm, confirmation } = useConfirmAction();
  async function save(form: FormData) { form.set('revision', String(library.tagRevision)); await run(() => changeTagAction(form), 'Tags saved.'); }
  return <section aria-label="Manage tags" className="mb-6 grid gap-4 rounded-lg border border-border bg-card p-5">
    <h2>Manage tags</h2><p className="text-sm text-muted-foreground">A question can have several tags. Removing a tag keeps its questions.</p>
    <form action={save} className="flex flex-wrap gap-2"><input type="hidden" name="operation" value="create" /><Input name="name" aria-label="New tag name" placeholder="New tag name" maxLength={40} required disabled={pending} className="max-w-xs" /><Button type="submit" disabled={pending}>Create tag</Button></form>
    <div className="grid gap-2 sm:grid-cols-2">{library.tags.map((tag) => <form key={`${tag.id}-${tag.name}`} action={save} className="flex min-w-0 gap-2"><input type="hidden" name="operation" value="rename" /><input type="hidden" name="id" value={tag.id} /><Input name="name" defaultValue={tag.name} aria-label={`Rename tag ${tag.name}`} required maxLength={40} disabled={pending} /><Button variant="outline" type="submit" disabled={pending}>Rename</Button><Button type="button" variant="ghost" aria-label={`Delete tag ${tag.name}`} disabled={pending} onClick={async () => {
      if (!await confirm(`Delete the tag “${tag.name}”? Its questions will be kept.`)) return;
      const form = new FormData(); form.set('operation', 'delete'); form.set('id', tag.id); await save(form);
    }}>Delete</Button></form>)}</div>{confirmation}
  </section>;
}
