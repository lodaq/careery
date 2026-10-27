import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, test } from 'vitest';
import { readQuestions, changeQuestion, changeTag } from './question-data';
import { previewQuestion, reviewQuestion, undoReview } from './practice-data';
import { activityForDay, dayKey, filterQuestions, practiceQueue } from './question-model';
const dirs: string[] = [];
afterEach(async () => { await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))); });
async function directory() { const dir = await mkdtemp(join(tmpdir(), 'careery-practice-')); dirs.push(dir); return dir; }
const form = (values: Record<string, string>) => { const data = new FormData(); Object.entries(values).forEach(([key, value]) => data.set(key, value)); return data; };
test('migrates without changing wording or resurrecting missing starters; seeds technical content once', async () => {
  const dir = await directory();
  await writeFile(join(dir, 'interview-questions.json'), JSON.stringify({ version: 1, questions: [{ id: 'starter-1', question: 'My wording', answer: 'My answer' }] }));
  const library = await readQuestions(dir);
  expect(library.questions).toHaveLength(46);
  expect(library.questions[0]).toMatchObject({ id: 'starter-1', question: 'My wording', answer: 'My answer', frequency: 0, card: null });
  const technical = library.questions[1];
  await changeQuestion(form({ operation: 'delete', id: technical.id, revision: String(technical.revision) }), dir);
  expect((await readQuestions(dir)).questions).toHaveLength(45);
  expect((await readQuestions(dir)).questions.some((q) => q.id === 'starter-2')).toBe(false);
});
test('ratings persist once, undo restores scheduling, and deletion preserves activity', async () => {
  const dir = await directory(); const q = (await readQuestions(dir)).questions[0];
  const now = new Date('2026-10-27T12:00:00Z');
  const preview = await previewQuestion(q.id, dir, now);
  expect(preview.options).toHaveLength(4);
  const input = { questionId: q.id, revision: q.revision, rating: 3, submissionId: 'submission-1', sessionId: 'session-1' };
  const rated = await reviewQuestion(input, dir, now);
  expect(rated.error).toBeUndefined();
  const duplicate = await reviewQuestion(input, dir, now);
  expect(duplicate.library?.events).toHaveLength(1);
  expect(activityForDay(duplicate.library!.events, '2026-10-27').attempts).toBe(1);
  const undo = await undoReview('submission-1', 'session-1', dir, now);
  expect(undo.library?.questions[0].card).toBeNull();
  expect(activityForDay(undo.library!.events, '2026-10-27').attempts).toBe(0);
  const current = undo.library!.questions[0];
  const again = await reviewQuestion({ ...input, revision: current.revision, submissionId: 'submission-2' }, dir, now);
  const next = again.library!.questions[0];
  await changeQuestion(form({ operation: 'delete', id: next.id, revision: String(next.revision) }), dir);
  expect(activityForDay((await readQuestions(dir)).events, '2026-10-27').distinct).toBe(1);
});
test('rejects stale ratings, concurrent writes, invalid frequency and stale tags', async () => {
  const dir = await directory(); const library = await readQuestions(dir); const q = library.questions[0];
  const edit = { operation: 'edit', id: q.id, revision: String(q.revision), question: q.question, answer: q.answer, frequency: '7' };
  expect((await changeQuestion(form({ ...edit, frequency: '-1' }), dir)).error).toBeTruthy();
  const results = await Promise.all([changeQuestion(form(edit), dir), changeQuestion(form(edit), dir)]);
  expect(results.filter((r) => r.error)).toHaveLength(1);
  expect((await reviewQuestion({ questionId: q.id, revision: q.revision, rating: 3, submissionId: 'stale', sessionId: 's' }, dir)).error).toContain('changed');
  expect((await changeTag(form({ operation: 'create', name: 'Custom', revision: '0' }), dir)).error).toBeUndefined();
  expect((await changeTag(form({ operation: 'create', name: 'Other', revision: '0' }), dir)).error).toContain('changed');
});
test('counts Cairo dates and repeated attempts; filters and queues honor any tag and due priority', async () => {
  const dir = await directory(); const library = await readQuestions(dir); const q = library.questions[0];
  const now = new Date('2026-10-27T23:00:00Z');
  expect(dayKey(now)).toBe('2026-10-28');
  const result = await reviewQuestion({ questionId: q.id, revision: 0, rating: 1, submissionId: 'one', sessionId: 's' }, dir, now);
  const reviewed = result.library!.questions[0];
  const again = await reviewQuestion({ questionId: q.id, revision: reviewed.revision, rating: 3, submissionId: 'two', sessionId: 's' }, dir, new Date(now.getTime() + 60000));
  expect(activityForDay(again.library!.events, '2026-10-28')).toMatchObject({ attempts: 2, distinct: 1 });
  expect(activityForDay(again.library!.events, '2026-10-27').attempts).toBe(0);
  const items = library.questions.slice(0, 3).map((item, i) => ({ ...item, tagIds: [i === 0 ? 'a' : 'b'], frequency: i }));
  expect(filterQuestions(items, { search: '', tags: ['a', 'b'], status: 'all', sort: 'due' }, now)).toHaveLength(3);
  expect(practiceQueue(items, now).map((item) => item.id)).toEqual([items[2].id, items[1].id, items[0].id]);
  expect(practiceQueue(library.questions, now)).toHaveLength(10);
});
test('malformed data is preserved rather than overwritten', async () => {
  const dir = await directory(); const path = join(dir, 'interview-questions.json');
  await writeFile(path, '{broken');
  await expect(readQuestions(dir)).rejects.toThrow();
  expect(await readFile(path, 'utf8')).toBe('{broken');
});
test('tag assignment survives edits and deleting a tag preserves questions', async () => {
  const dir = await directory(); const library = await readQuestions(dir); const q = library.questions[0];
  const tagged = await changeQuestion(form({ operation: 'edit', id: q.id, revision: '0', question: q.question, answer: q.answer, tagIds: 'general', frequency: '2' }), dir);
  expect(tagged.library!.questions[0].tagIds).toEqual(['general']);
  const renamed = await changeTag(form({ operation: 'rename', id: 'general', name: 'My general', revision: '0' }), dir);
  expect(renamed.library!.tags.find((t) => t.id === 'general')?.name).toBe('My general');
  const deleted = await changeTag(form({ operation: 'delete', id: 'general', revision: '1' }), dir);
  expect(deleted.library!.questions).toHaveLength(63);
  expect(deleted.library!.questions[0].tagIds).toEqual([]);
  expect((await changeQuestion(form({ operation: 'edit', id: q.id, revision: String(tagged.library!.questions[0].revision), question: q.question, answer: q.answer }), dir)).error).toContain('changed');
});
test('free early reviews update scheduling, and undo cannot overwrite a later review from another session', async () => {
  const dir = await directory(); const q = (await readQuestions(dir)).questions[0];
  const now = new Date('2026-10-27T12:00:00Z');
  const first = await reviewQuestion({ questionId: q.id, revision: 0, rating: 4, submissionId: 'a', sessionId: 'first' }, dir, now);
  const card = first.library!.questions[0].card!;
  expect(Date.parse(card.due)).toBeGreaterThan(now.getTime());
  const second = await reviewQuestion({ questionId: q.id, revision: 1, rating: 2, submissionId: 'b', sessionId: 'second' }, dir, new Date(now.getTime() + 1000));
  expect(second.library!.questions[0].card!.reps).toBe(2);
  expect((await undoReview('a', 'first', dir, now)).error).toContain('reviewed again');
  const undone = await undoReview('b', 'second', dir, now);
  expect(undone.library!.questions[0].card).toEqual(card);
  expect((await undoReview('b', 'second', dir, now)).library!.events).toHaveLength(3);
});
test('due queue sorts older dates first, then frequency; filters search answers and statuses', async () => {
  const dir = await directory(); const library = await readQuestions(dir); const now = new Date('2026-10-27T12:00:00Z');
  const q = library.questions[0];
  const rated = await reviewQuestion({ questionId: q.id, revision: 0, rating: 4, submissionId: 'r', sessionId: 's' }, dir, now);
  const base = rated.library!.questions[0];
  const questions = [
    { ...base, id: 'old', frequency: 0, card: { ...base.card!, due: '2026-10-25T12:00:00Z' } },
    { ...base, id: 'frequent', frequency: 4, card: { ...base.card!, due: '2026-10-26T12:00:00Z' } },
    { ...base, id: 'less', frequency: 2, card: { ...base.card!, due: '2026-10-26T12:00:00Z' } },
    { ...base, id: 'future', card: { ...base.card!, due: '2026-11-01T12:00:00Z' } },
    { ...q, id: 'new' },
  ];
  expect(practiceQueue(questions, now).map((q) => q.id)).toEqual(['old', 'frequent', 'less', 'new']);
  expect(filterQuestions(questions, { search: q.answer.slice(0, 12), tags: [], status: 'due', sort: 'due' }, now)).toHaveLength(3);
  expect(filterQuestions(questions, { search: '', tags: [], status: 'scheduled', sort: 'due' }, now).map((q) => q.id)).toEqual(['future']);
});
test('write failures preserve disk data and do not claim a saved review', async () => {
  const dir = await directory(); const library = await readQuestions(dir); const q = library.questions[0];
  const before = await readFile(join(dir, 'interview-questions.json'), 'utf8');
  const result = await reviewQuestion({ questionId: q.id, revision: 0, rating: 99, submissionId: 'bad', sessionId: 's' }, dir);
  expect(result.library).toBeUndefined();
  expect(await readFile(join(dir, 'interview-questions.json'), 'utf8')).toBe(before);
  const blocked = join(dir, 'not-a-directory'); await writeFile(blocked, 'blocked');
  expect((await reviewQuestion({ questionId: q.id, revision: 0, rating: 3, submissionId: 'disk', sessionId: 's' }, blocked)).error).toContain('Could not save');
});
