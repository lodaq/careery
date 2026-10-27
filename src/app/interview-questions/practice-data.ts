import { createEmptyCard, fsrs, type Card, type Grade } from 'ts-fsrs';
import { dataDirectory } from '@/lib/storage';
import { check, currentQuestion, libraryMutation, readQuestions } from './question-data';
import { activeReviews, type StoredCard, type ReviewEvent } from './question-model';

const scheduler = fsrs({ request_retention: 0.9, enable_short_term: true, learning_steps: ['1m', '10m'], relearning_steps: ['10m'], enable_fuzz: false });
const restore = (card: StoredCard | null, now: Date): Card => card ? { ...card, due: new Date(card.due), last_review: card.last_review ? new Date(card.last_review) : undefined } : createEmptyCard(now);
const serialize = (card: Card): StoredCard => ({ ...card, due: card.due.toISOString(), last_review: card.last_review?.toISOString() });
export type ReviewInput = { questionId: string; revision: number; rating: number; submissionId: string; sessionId: string };
export async function previewQuestion(id: string, directory = dataDirectory(), now = new Date()) {
  const library = await readQuestions(directory);
  const question = library.questions.find((q) => q.id === id);
  if (!question) return { error: 'This question was removed. Reload to continue.' };
  const previews = scheduler.repeat(restore(question.card, now), now);
  return { revision: question.revision, options: ([1, 2, 3, 4] as const).map((rating) => ({ rating, due: previews[rating].card.due.toISOString() })) };
}
export async function reviewQuestion(input: ReviewInput, directory = dataDirectory(), now = new Date()) {
  return libraryMutation((library) => {
    check(typeof input.sessionId === 'string' && input.sessionId.length > 0 && input.sessionId.length <= 100 && typeof input.submissionId === 'string' && input.submissionId.length > 0 && input.submissionId.length <= 100, 'Invalid practice submission. Restart the session.');
    const duplicate = library.events.find((event) => event.id === input.submissionId);
    if (duplicate) {
      check(duplicate.kind === 'review' && duplicate.questionId === input.questionId && duplicate.sessionId === input.sessionId && duplicate.rating === input.rating, 'This submission ID was already used. Reload to continue.');
      return;
    }
    check([1, 2, 3, 4].includes(input.rating), 'Choose Again, Hard, Good, or Easy.');
    const question = currentQuestion(library, input.questionId, input.revision);
    const before = question.card;
    const after = serialize(scheduler.next(restore(before, now), now, input.rating as Grade).card);
    const event: ReviewEvent = { kind: 'review', id: input.submissionId, sessionId: input.sessionId, questionId: question.id, question: question.question, at: now.toISOString(), rating: input.rating, before, after };
    library.events.push(event);
    question.card = after; question.revision++;
  }, directory);
}
export async function undoReview(reviewId: string, sessionId: string, directory = dataDirectory(), now = new Date()) {
  return libraryMutation((library) => {
    const review = library.events.find((event): event is ReviewEvent => event.kind === 'review' && event.id === reviewId && event.sessionId === sessionId);
    check(review, 'This review could not be found. Reload to continue.');
    if (library.events.some((event) => event.kind === 'undo' && event.reviewId === reviewId)) return;
    const active = activeReviews(library.events);
    check(active.filter((event) => event.sessionId === sessionId).at(-1)?.id === reviewId && active.filter((event) => event.questionId === review.questionId).at(-1)?.id === reviewId, 'This question was reviewed again. Only the most recent rating can be undone.');
    const question = library.questions.find((q) => q.id === review.questionId);
    check(question && JSON.stringify(question.card) === JSON.stringify(review.after), 'This question changed or was removed. Reload to continue.');
    question.card = review.before; question.revision++;
    library.events.push({ kind: 'undo', id: `undo:${reviewId}`, reviewId, at: now.toISOString() });
  }, directory);
}
