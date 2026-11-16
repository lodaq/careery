'use client';
import { useId, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlobeIcon, PlusIcon, SearchIcon, SparklesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldLabel } from '@/components/ui/field';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NativeSelect } from '@/components/ui/native-select';
import { useConfirmAction } from '@/components/ConfirmAction';
import type { Tool } from './data';
import { toolAction } from './actions';

function hostname(url: string) {
  try { return new URL(url).hostname; }
  catch { return url; }
}

export function Toolbox({ tools }: { tools: Tool[] }) {
  const router = useRouter();
  const searchId = useId();
  const categoryId = useId();
  const [editing, setEditing] = useState<Tool | null | undefined>();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(48);
  const { confirm, confirmation } = useConfirmAction();

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tools) {
      if (t.category) counts.set(t.category, (counts.get(t.category) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [tools]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter(tool => {
      if (category !== 'all' && tool.category !== category) return false;
      if (!q) return true;
      return (
        tool.name.toLowerCase().includes(q) ||
        (tool.description?.toLowerCase().includes(q) ?? false) ||
        (tool.category?.toLowerCase().includes(q) ?? false) ||
        tool.url.toLowerCase().includes(q)
      );
    });
  }, [tools, query, category]);

  const displayed = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  async function submit(form: FormData) {
    setBusy(true); setStatus('');
    try {
      const result = await toolAction(form);
      if (result.error) setStatus(result.error);
      else { setEditing(undefined); setStatus('Saved.'); router.refresh(); }
    } catch { setStatus('Could not save your change. Retry.'); }
    finally { setBusy(false); }
  }

  return <>
    <div className="flex flex-wrap items-center gap-3">
      <Button disabled={busy} onClick={() => { setEditing(null); setStatus(''); }}>
        <PlusIcon aria-hidden="true" />Add tool
      </Button>
      {!tools.length && <Button variant="outline" disabled={busy} onClick={() => {
        const form = new FormData();
        form.set('operation', 'seed');
        void submit(form);
      }}>
        <SparklesIcon aria-hidden="true" />Load recommended resources
      </Button>}
    </div>

    {editing !== undefined && <form key={editing?.id ?? 'new'} className="my-6 grid max-w-xl gap-4 rounded-xl border border-border bg-card p-5" onSubmit={event => { event.preventDefault(); void submit(new FormData(event.currentTarget)); }}>
      <h2 className="text-lg font-semibold">{editing ? 'Edit tool' : 'Add a website'}</h2>
      <input type="hidden" name="id" value={editing?.id ?? ''} />
      <FieldLabel htmlFor="tool-url">Website link (required)<Input id="tool-url" name="url" required maxLength={2048} inputMode="url" autoCapitalize="none" spellCheck={false} placeholder="https://example.com" defaultValue={editing?.url} disabled={busy} /></FieldLabel>
      <FieldLabel htmlFor="tool-name">Name (optional)<Input id="tool-name" name="name" maxLength={200} placeholder="Automatically fetched from your link" defaultValue={editing?.name} disabled={busy} /></FieldLabel>
      <FieldLabel htmlFor="tool-category">Category (optional)<Input id="tool-category" name="category" maxLength={100} placeholder="e.g. Remote & Flexible Work" defaultValue={editing?.category} disabled={busy} /></FieldLabel>
      <FieldLabel htmlFor="tool-description">Description (optional)<Input id="tool-description" name="description" maxLength={1000} placeholder="Brief description of this resource" defaultValue={editing?.description} disabled={busy} /></FieldLabel>
      <p className="text-xs text-muted-foreground">New links are sent to Microlink to fetch their name and icon if left empty. Icons load from external websites.</p>
      <div className="flex gap-3"><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save tool'}</Button><Button type="button" variant="outline" disabled={busy} onClick={() => setEditing(undefined)}>Cancel</Button></div>
    </form>}

    <p role="status" className="my-2 text-sm text-muted-foreground">{status}</p>

    {tools.length > 0 && <div className="my-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="relative flex-1">
        <label htmlFor={searchId} className="sr-only">Search tools</label>
        <SearchIcon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input id={searchId} type="search" placeholder="Search by name, category, or domain…" value={query} onChange={e => { setQuery(e.target.value); setVisibleCount(48); }} className="pl-9" />
      </div>
      {categories.length > 0 && <div>
        <label htmlFor={categoryId} className="sr-only">Filter by category</label>
        <NativeSelect id={categoryId} value={category} onChange={e => { setCategory(e.target.value); setVisibleCount(48); }} className="w-full">
          <option value="all">All categories ({tools.length})</option>
          {categories.map(([cat, count]) => <option key={cat} value={cat}>{cat} ({count})</option>)}
        </NativeSelect>
      </div>}
    </div>}

    {tools.length > 0 && <p className="text-xs text-muted-foreground">
      Showing {displayed.length} of {filtered.length} {filtered.length === 1 ? 'resource' : 'resources'}
      {filtered.length !== tools.length ? ` (filtered from ${tools.length})` : ''}
    </p>}

    {!tools.length && <p className="my-8 text-muted-foreground">No tools yet. Add a website link or load recommended resources to start your Toolbox.</p>}

    {tools.length > 0 && filtered.length === 0 && <p className="my-8 text-muted-foreground">No resources match your search.</p>}

    <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {displayed.map(tool => <Card key={tool.id} className="flex flex-col"><CardContent className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <ToolIcon key={tool.icon} icon={tool.icon} />
          <div className="min-w-0 flex-1">
            <a className="block truncate font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring" href={tool.url} target="_blank" rel="noopener noreferrer">
              {tool.name}<span className="sr-only"> (opens in a new tab)</span>
            </a>
            <p className="m-0 truncate text-xs text-muted-foreground">{hostname(tool.url)}</p>
          </div>
        </div>
        {tool.category && <Badge variant="secondary" className="w-fit text-[11px] font-normal">{tool.category}</Badge>}
        {tool.description && <p className="m-0 text-xs text-muted-foreground line-clamp-3">{tool.description}</p>}
        <div className="mt-auto flex gap-2 pt-2 border-t border-border/50">
          <Button variant="outline" size="sm" disabled={busy} onClick={() => { setEditing(tool); setStatus(''); }}>
            Edit<span className="sr-only"> {tool.name}</span>
          </Button>
          <Button variant="ghost" size="sm" disabled={busy} onClick={async () => {
            if (await confirm(`Delete ${tool.name} from your Toolbox?`, { action: 'Delete' })) {
              const form = new FormData();
              form.set('id', tool.id);
              form.set('operation', 'delete');
              void submit(form);
            }
          }}>
            Delete<span className="sr-only"> {tool.name}</span>
          </Button>
        </div>
      </CardContent></Card>)}
    </div>

    {visibleCount < filtered.length && <div className="my-8 flex justify-center">
      <Button variant="outline" onClick={() => setVisibleCount(c => c + 48)}>
        Show more ({filtered.length - visibleCount} remaining)
      </Button>
    </div>}

    {confirmation}
  </>;
}

function ToolIcon({ icon }: { icon: string }) {
  const [failed, setFailed] = useState(false);
  // External favicons need their original URLs and a graceful missing-image fallback.
  // eslint-disable-next-line @next/next/no-img-element
  return icon && !failed ? <img src={icon} width={32} height={32} alt="" className="size-8 shrink-0 object-contain rounded" referrerPolicy="no-referrer" onError={() => setFailed(true)} /> : <GlobeIcon aria-hidden="true" className="size-8 shrink-0 text-muted-foreground" />;
}
