'use client';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { PlusIcon, PlayIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { useConfirmAction } from '@/components/ConfirmAction';
import { changeQuestionAction } from './actions';
import { activityForDay, dayKey, filterQuestions, practiceQueue, type Library, type LibraryResult, type Question, type Filters } from './question-model';
import { QuestionsTable } from './QuestionsTable';
import { readSession, writeSession, type PracticeState } from './practice-session';
const QuestionEditor = lazy(() => import('./QuestionEditor').then((module) => ({ default: module.QuestionEditor })));
const PracticeSession = lazy(() => import('./PracticeSession').then((module) => ({ default: module.PracticeSession })));
const ActivityCalendar = lazy(() => import('./ActivityCalendar').then((module) => ({ default: module.ActivityCalendar })));
const TagManager = lazy(() => import('./TagManager').then((module) => ({ default: module.TagManager })));

export function QuestionLibrary({ initialLibrary, initialNow }: { initialLibrary: Library; initialNow: string }) {
  const [library, setLibrary] = useState(initialLibrary);
  const [now, setNow] = useState(new Date(initialNow));
  const [filters, setFilters] = useState<Filters>({ search: '', tags: [], status: 'all', sort: 'due' });
  const [editing, setEditing] = useState<Question | 'new' | null>(null);
  const [showTags, setShowTags] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [session, setSession] = useState<PracticeState | null>(null);
  const [recoverable, setRecoverable] = useState<PracticeState | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const { confirm, confirmation } = useConfirmAction();
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    const recovery = setTimeout(() => setRecoverable(readSession()), 0);
    return () => { clearInterval(timer); clearTimeout(recovery); };
  }, []);
  const updateSession = useCallback((value: PracticeState) => { setSession(value); writeSession(value); }, []);
  const onLibrary = useCallback((value: Library) => { setLibrary(value); setNow(new Date()); }, []);
  const run = useCallback(async (action: () => Promise<LibraryResult>, message: string) => {
    setPending(true); setError(''); setStatus('');
    try { const result = await action(); if (result.library) { onLibrary(result.library); setStatus(message); return true; } setError(result.error ?? 'Could not save. Retry your changes.'); return false; }
    catch { setError('Could not save. Your changes are still here. Please retry.'); return false; }
    finally { setPending(false); }
  }, [onLibrary]);
  const filtered = filterQuestions(library.questions, filters, now);
  const queue = practiceQueue(filtered, now);
  const today = activityForDay(library.events, dayKey(now));
  function begin(ids: string[]) { setRecoverable(null); setError(''); setStatus(''); updateSession({ id: crypto.randomUUID(), remaining: ids, current: ids[0] ?? null }); }
  function clearSession() { setSession(null); setRecoverable(null); writeSession(null); }
  async function remove(q: Question) {
    if (!await confirm(`Delete “${q.question}” and its answer? Past practice activity will be preserved.`)) return;
    const form = new FormData(); form.set('operation', 'delete'); form.set('id', q.id); form.set('revision', String(q.revision));
    await run(() => changeQuestionAction(form), 'Question deleted.');
  }
  return <section className="mx-auto w-full max-w-7xl">
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><h1>Interview questions</h1><p className="mt-2 max-w-prose text-muted-foreground">Build your answers. Practice what is due. Keep the questions that matter close.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" disabled={pending || Boolean(editing) || Boolean(session) || Boolean(recoverable)} onClick={() => { setEditing('new'); setError(''); }}><PlusIcon aria-hidden="true" />Add question</Button><Button disabled={pending || Boolean(editing) || Boolean(session) || Boolean(recoverable) || !queue.length} onClick={() => begin(queue.map((q) => q.id))}><PlayIcon aria-hidden="true" />Practice ({queue.length})</Button></div></div>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3"><p className="text-sm"><strong className="tabular-nums">{today.distinct}</strong> questions reviewed today · <span className="tabular-nums">{today.attempts}</span> attempts <span className="text-muted-foreground">· Cairo time</span></p><div className="flex gap-2"><Button variant="ghost" aria-expanded={showActivity} onClick={() => setShowActivity(!showActivity)}>Activity calendar</Button><Button variant="ghost" disabled={Boolean(editing) || Boolean(session)} aria-expanded={showTags} onClick={() => setShowTags(!showTags)}>Manage tags</Button></div></div>
    {status && <p role="status" className="mb-4 text-sm">{status}</p>}{error && <p role="alert" className="mb-4 text-destructive">{error}</p>}
    {recoverable && !session && <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-border p-4"><p>Your previous practice session is saved.</p><Button onClick={() => { updateSession(recoverable); setRecoverable(null); }}>Resume practice</Button><Button variant="outline" onClick={clearSession}>Discard session</Button></div>}
    {showActivity && <Suspense fallback={<p role="status">Loading activity…</p>}><ActivityCalendar events={library.events} today={dayKey(now)} /></Suspense>}
    {showTags && <Suspense fallback={<p role="status">Loading tags…</p>}><TagManager library={library} pending={pending} run={run} /></Suspense>}
    {editing && <Suspense fallback={<p role="status">Loading question editor…</p>}><QuestionEditor key={editing === 'new' ? 'new' : editing.id} question={editing === 'new' ? undefined : editing} tags={library.tags} pending={pending} cancel={() => { setEditing(null); setError(''); }} save={async (form) => { if (await run(() => changeQuestionAction(form), 'Question saved.')) setEditing(null); }} /></Suspense>}
    {session && <Suspense fallback={<p role="status">Loading practice…</p>}><PracticeSession key={session.id} library={library} session={session} now={now} update={updateSession} onLibrary={onLibrary} stop={clearSession} /></Suspense>}
    <div className="mb-4 grid gap-4"><div className="flex flex-wrap items-end gap-3"><div className="grid min-w-0 flex-1 basis-full gap-1 sm:basis-0"><label htmlFor="question-search" className="text-sm">Search questions and answers</label><Input id="question-search" type="search" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search your library…" /></div><div className="grid gap-1"><label htmlFor="question-status" className="text-sm">Review status</label><NativeSelect id="question-status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>{['all', 'new', 'due', 'scheduled'].map((value) => <NativeSelectOption key={value} value={value}>{value === 'all' ? 'All statuses' : value[0].toUpperCase() + value.slice(1)}</NativeSelectOption>)}</NativeSelect></div><div className="grid gap-1"><label htmlFor="question-sort" className="text-sm">Sort by</label><NativeSelect id="question-sort" value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value })}><NativeSelectOption value="due">Review priority</NativeSelectOption><NativeSelectOption value="frequency">Interview frequency</NativeSelectOption></NativeSelect></div></div>
      <fieldset><legend className="mb-2 text-sm">Filter by tags <span className="text-muted-foreground">· match any selected</span></legend><div className="flex flex-wrap gap-x-4 gap-y-2">{library.tags.map((tag) => <label key={tag.id} className="flex min-h-8 items-center gap-2 text-sm"><span className="inline-flex"><Checkbox checked={filters.tags.includes(tag.id)} onCheckedChange={(checked) => setFilters({ ...filters, tags: checked ? [...filters.tags, tag.id] : filters.tags.filter((id) => id !== tag.id) })} /></span>{tag.name}</label>)}</div></fieldset>
      {(filters.search || filters.status !== 'all' || filters.tags.length > 0) && <Button variant="ghost" className="w-fit" onClick={() => setFilters({ search: '', status: 'all', tags: [], sort: filters.sort })}>Clear filters</Button>}
    </div>
    {!queue.length && !session && <p className="mb-4 text-sm text-muted-foreground">No new or due questions match these filters. You can still practice any question individually.</p>}
    {filtered.length ? <QuestionsTable questions={filtered} tags={library.tags} now={now} disabled={pending || Boolean(editing) || Boolean(session) || Boolean(recoverable)} edit={(q) => { setEditing(q); setError(''); }} remove={(q) => void remove(q)} practice={(q) => begin([q.id])} /> : <p className="border-y border-border py-10 text-muted-foreground">{library.questions.length ? 'No questions match these filters. Clear the filters or try another search.' : 'No questions yet. Add a question and answer to begin.'}</p>}
    <p className="mt-6 max-w-prose text-sm text-muted-foreground">Starter answers are guides to personalize. Interview frequency is your manual count. Practice uses FSRS at 90% target retention; revealing an answer does not record a review.</p>
    {confirmation}
  </section>;
}
