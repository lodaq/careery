'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { previewQuestionAction, reviewQuestionAction, undoReviewAction, loadLibraryAction } from './actions';
import { activeReviews, displayDue, dueOrder, type Library, type LibraryResult } from './question-model';
import type { PracticeState } from './practice-session';
import type { ReviewInput } from './practice-data';

const ratingNames = ['Again', 'Hard', 'Good', 'Easy'];
export function PracticeSession({ library, session, now, update, onLibrary, stop }: { library: Library; session: PracticeState; now: Date; update: (value: PracticeState) => void; onLibrary: (value: Library) => void; stop: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [preview, setPreview] = useState<{ id: string; revision: number; options: { rating: number; due: string }[] } | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [reload, setReload] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const currentId = session.current;
  useEffect(() => { heading.current?.focus(); }, [currentId]);
  const question = library.questions.find((q) => q.id === currentId);
  const questionRevision = question?.revision;
  useEffect(() => {
    let active = true;
    if (currentId) previewQuestionAction(currentId).then((result) => {
      if (!active) return;
      if (result.revision !== questionRevision) { setPreview(null); setError('This question changed in another tab. Reload saved questions before rating.'); return; }
      if (result.options && result.revision !== undefined) setPreview({ id: currentId, revision: result.revision, options: result.options });
      else setError(result.error ?? 'Could not prepare this question.');
    }).catch(() => { if (active) setError('Could not load rating intervals. Retry or reload the session.'); });
    return () => { active = false; };
  }, [currentId, questionRevision, reload]);
  function nextState(data: Library, remaining: string[], lastReviewId = session.lastReviewId): PracticeState {
    const candidates = data.questions.filter((q) => remaining.includes(q.id));
    const ready = candidates.filter((q) => !q.card || Date.parse(q.card.due) <= Date.now()).sort(dueOrder);
    return { id: session.id, remaining: candidates.map((q) => q.id), current: ready[0]?.id ?? null, lastReviewId };
  }
  async function run(action: () => Promise<LibraryResult>, success: (data: Library) => void) {
    setPending(true); setError('');
    try { const result = await action(); if (result.library) { onLibrary(result.library); success(result.library); } else setError(result.error ?? 'Could not save. Retry to continue.'); }
    catch { setError('Could not save. Your current question is still here. Retry to continue.'); }
    finally { setPending(false); }
  }
  async function rate(rating: number) {
    if (!question || !preview || preview.id !== question.id) return;
    const input: ReviewInput = session.pending ?? { questionId: question.id, revision: preview.revision, rating, submissionId: crypto.randomUUID(), sessionId: session.id };
    update({ ...session, pending: input });
    await run(() => reviewQuestionAction(input), (data) => {
      const rated = data.questions.find((q) => q.id === input.questionId);
      const remaining = session.remaining.filter((id) => id !== input.questionId);
      if (rated?.card && [1, 3].includes(rated.card.state)) remaining.push(rated.id);
      setRevealed(false); setPreview(null);
      update(nextState(data, remaining, input.submissionId));
    });
  }
  async function undo() {
    if (!session.lastReviewId) return;
    const id = session.lastReviewId;
    await run(() => undoReviewAction(id, session.id), (data) => {
      const event = data.events.find((event) => event.id === id);
      const questionId = event?.kind === 'review' ? event.questionId : null;
      setRevealed(false); setPreview(null);
      update({ id: session.id, remaining: [...new Set([...session.remaining, ...(questionId ? [questionId] : [])])], current: questionId });
    });
  }
  const remaining = library.questions.filter((q) => session.remaining.includes(q.id));
  const waiting = remaining.filter((q) => q.card).sort(dueOrder)[0];
  const ready = remaining.some((q) => !q.card || Date.parse(q.card.due) <= now.getTime());
  const reviewed = activeReviews(library.events).filter((event) => event.sessionId === session.id).length;
  return <section aria-label="Practice session" className="mb-8 rounded-lg border border-border bg-card p-5 sm:p-8">
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3"><div><h2>Practice</h2><p className="mt-1 text-sm text-muted-foreground">{reviewed} saved attempts · {remaining.length} questions remaining</p></div><Button variant="outline" disabled={pending} onClick={stop}>End session</Button></div>
    {error && <div role="alert" className="mb-4"><p className="text-destructive">{error}</p><Button variant="outline" disabled={pending} onClick={async () => { setError(''); try { onLibrary(await loadLibraryAction()); setPreview(null); setReload((n) => n + 1); } catch { setError('Could not reload. Check your connection and retry.'); } }}>Reload saved questions</Button></div>}
    {question ? <>
      <h3 className="mb-5 max-w-prose text-xl font-semibold break-words" ref={heading} tabIndex={-1}>{question.question}</h3>
      <p className="mb-5 text-sm text-muted-foreground">Recall your answer before revealing the guide.</p>
      {!revealed ? <Button onClick={() => setRevealed(true)} disabled={pending}>Reveal answer</Button> : <><p className="mb-6 max-w-prose whitespace-pre-wrap break-words leading-relaxed">{question.answer}</p><p className="mb-3 text-sm text-muted-foreground">How well did you recall it? Each rating shows the next review in Cairo time.</p>
        <div className="flex flex-wrap gap-2">{ratingNames.map((name, index) => {
          const option = preview?.id === question.id ? preview.options[index] : null;
          return <Button key={name} variant={index === 2 ? 'default' : 'outline'} className="h-auto min-h-12 flex-col items-start py-2" disabled={pending || !option || Boolean(session.pending && session.pending.rating !== index + 1)} onClick={() => void rate(index + 1)}><span>{name}</span><span className="text-xs font-normal">{option ? displayDue(option.due) : 'Loading interval…'}</span></Button>;
        })}</div></>}
      {session.pending && !pending && <Button className="mt-4" onClick={() => void rate(session.pending!.rating)}>Retry saved rating</Button>}
      <div className="mt-6 flex flex-wrap gap-2"><Button variant="ghost" disabled={pending || Boolean(session.pending)} onClick={() => { setRevealed(false); setPreview(null); update(nextState(library, session.remaining.filter((id) => id !== question.id))); }}>Skip question</Button></div>
    </> : <div><h3 ref={heading} tabIndex={-1} className="mb-2 font-medium">{remaining.length ? 'Waiting for the next review' : 'Session complete'}</h3><p className="mb-4 text-muted-foreground">{waiting?.card ? `Next review: ${displayDue(waiting.card.due)}. You can leave and return later.` : 'Your saved ratings have updated your review schedule.'}</p>{ready && <Button onClick={() => { setRevealed(false); setPreview(null); update(nextState(library, session.remaining)); }}>Continue practice</Button>}</div>}
    {session.lastReviewId && <Button className="mt-5" variant="outline" disabled={pending || Boolean(session.pending)} onClick={() => void undo()}>Undo last rating</Button>}
    {pending && <p className="mt-3 text-sm" role="status">Saving rating…</p>}
  </section>;
}
