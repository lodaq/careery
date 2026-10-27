// @vitest-environment jsdom
import { useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { PracticeSession } from './PracticeSession';
import { readSession, writeSession, type PracticeState } from './practice-session';
import type { Library, StoredCard } from './question-model';
const actions = vi.hoisted(() => ({ previewQuestionAction: vi.fn(), reviewQuestionAction: vi.fn(), undoReviewAction: vi.fn(), loadLibraryAction: vi.fn() }));
vi.mock('./actions', () => actions);
afterEach(() => { cleanup(); sessionStorage.clear(); vi.resetAllMocks(); });
const now = new Date('2026-10-27T12:00:00Z');
const initial: Library = { version: 1, schema: 2, tagRevision: 0, tags: [], events: [], questions: [{ id: 'q', question: 'Practice question?', answer: 'Hidden answer', frequency: 0, tagIds: [], revision: 0, card: null }] };
const card: StoredCard = { due: '2026-11-01T12:00:00Z', stability: 1, difficulty: 1, elapsed_days: 0, scheduled_days: 5, reps: 1, lapses: 0, learning_steps: 0, state: 2, last_review: now.toISOString() };
function Harness() {
  const [library, setLibrary] = useState(initial);
  const [session, setSession] = useState<PracticeState>({ id: 's', current: 'q', remaining: ['q'] });
  return <PracticeSession library={library} session={session} now={now} update={(value) => { setSession(value); writeSession(value); }} onLibrary={setLibrary} stop={() => undefined} />;
}
function preview(revision = 0) { actions.previewQuestionAction.mockResolvedValue({ revision, options: [1, 2, 3, 4].map((rating) => ({ rating, due: card.due })) }); }
test('answer reveal does not save; failed ratings preserve the question and retry the same submission ID', async () => {
  preview();
  actions.reviewQuestionAction.mockRejectedValueOnce(new Error('Network failed')).mockImplementation(async (input) => ({ library: { ...initial, questions: [{ ...initial.questions[0], card, revision: 1 }], events: [{ kind: 'review', id: input.submissionId, sessionId: 's', questionId: 'q', question: 'Practice question?', rating: 3, at: now.toISOString(), before: null, after: card }] } }));
  render(<Harness />);
  expect(screen.queryByText('Hidden answer')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Reveal answer' }));
  expect(screen.getByText('Hidden answer')).toBeTruthy();
  expect(actions.reviewQuestionAction).not.toHaveBeenCalled();
  const good = await screen.findByRole('button', { name: /^Good/ });
  await waitFor(() => expect(good.hasAttribute('disabled')).toBe(false));
  fireEvent.click(good);
  await screen.findByText(/Could not save. Your current question/);
  expect(screen.getByText('Hidden answer')).toBeTruthy();
  const pending = readSession()!.pending!;
  fireEvent.click(screen.getByRole('button', { name: 'Retry saved rating' }));
  await screen.findByText('Session complete');
  expect(actions.reviewQuestionAction.mock.calls[0][0].submissionId).toBe(pending.submissionId);
  expect(actions.reviewQuestionAction.mock.calls[1][0].submissionId).toBe(pending.submissionId);
  expect(readSession()!.pending).toBeUndefined();
  expect(screen.getByRole('button', { name: 'Undo last rating' })).toBeTruthy();
});
test('stale preview blocks rating until saved content is reloaded', async () => {
  preview(1); render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: 'Reveal answer' }));
  await screen.findByText(/changed in another tab/);
  expect(screen.getByRole('button', { name: /^Good/ }).hasAttribute('disabled')).toBe(true);
  expect(actions.reviewQuestionAction).not.toHaveBeenCalled();
});
test('session storage restores an interrupted rating and ignores malformed session data', () => {
  const session: PracticeState = { id: 'saved', current: 'q', remaining: ['q'], pending: { questionId: 'q', revision: 0, rating: 3, sessionId: 'saved', submissionId: 'retry-id' } };
  writeSession(session); expect(readSession()).toEqual(session);
  sessionStorage.setItem('careery-practice-session-v1', '{bad'); expect(readSession()).toBeNull();
  writeSession(null); expect(readSession()).toBeNull();
});
