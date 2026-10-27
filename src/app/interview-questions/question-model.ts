export type StoredCard = {
  due: string; stability: number; difficulty: number; elapsed_days: number; scheduled_days: number;
  reps: number; lapses: number; learning_steps: number; state: number; last_review?: string;
};
export type Question = {
  id: string; question: string; answer: string; tagIds: string[]; frequency: number;
  revision: number; card: StoredCard | null; source?: string;
};
export type Tag = { id: string; name: string };
export type ReviewEvent = { kind: 'review'; id: string; sessionId: string; questionId: string; question: string; at: string; rating: number; before: StoredCard | null; after: StoredCard };
export type UndoEvent = { kind: 'undo'; id: string; reviewId: string; at: string };
export type Library = { version: 1; schema: 2; tagRevision: number; tags: Tag[]; questions: Question[]; events: (ReviewEvent | UndoEvent)[] };
export type LibraryResult = { library?: Library; error?: string };
export type Filters = { search: string; tags: string[]; status: string; sort: string };
export const dayKey = (date = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
export const questionStatus = (q: Question, now = new Date()) => !q.card ? 'New' : Date.parse(q.card.due) <= now.getTime() ? 'Due' : 'Scheduled';
export function dueOrder(a: Question, b: Question) {
  return (a.card ? Date.parse(a.card.due) : Infinity) - (b.card ? Date.parse(b.card.due) : Infinity) || b.frequency - a.frequency || a.question.localeCompare(b.question);
}
export function filterQuestions(questions: Question[], filters: Filters, now = new Date()) {
  const search = filters.search.trim().toLocaleLowerCase();
  return questions.filter((q) => (!search || `${q.question} ${q.answer}`.toLocaleLowerCase().includes(search)) && (!filters.tags.length || q.tagIds.some((tag) => filters.tags.includes(tag))) && (filters.status === 'all' || questionStatus(q, now).toLowerCase() === filters.status))
    .sort(filters.sort === 'frequency' ? (a, b) => b.frequency - a.frequency || dueOrder(a, b) : (a, b) => {
      const rank = (q: Question) => ({ Due: 0, New: 1, Scheduled: 2 })[questionStatus(q, now)];
      return rank(a) - rank(b) || dueOrder(a, b);
    });
}
export function practiceQueue(questions: Question[], now = new Date()) {
  return [...questions.filter((q) => questionStatus(q, now) === 'Due').sort(dueOrder), ...questions.filter((q) => !q.card).sort(dueOrder).slice(0, 10)];
}
export function activeReviews(events: Library['events']) {
  const undone = new Set(events.filter((event) => event.kind === 'undo').map((event) => event.reviewId));
  return events.filter((event): event is ReviewEvent => event.kind === 'review' && !undone.has(event.id));
}
export function activityForDay(events: Library['events'], day: string) {
  const reviews = activeReviews(events).filter((event) => dayKey(new Date(event.at)) === day);
  const questions = [...new Map(reviews.map((review) => [review.questionId, review.question])).entries()];
  return { attempts: reviews.length, distinct: questions.length, questions };
}
export function displayDue(value: string) {
  return new Intl.DateTimeFormat('en', { timeZone: 'Africa/Cairo', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}
