import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { dataDirectory, readJson, updateJson } from '@/lib/storage';
import { starterQuestions } from './starter-questions';
import { initialTags, technicalQuestions } from './technical-questions';
import type { Library, LibraryResult, Question, StoredCard } from './question-model';

const pathFor = (directory: string) => join(directory, 'interview-questions.json');
const invalid = () => new Error('Invalid interview questions; original data was preserved.');
export function validCard(card: unknown): card is StoredCard {
  if (!card || typeof card !== 'object') return false;
  const value = card as Record<string, unknown>;
  return typeof value.due === 'string' && Number.isFinite(Date.parse(value.due)) &&
    ['stability', 'difficulty', 'elapsed_days', 'scheduled_days', 'reps', 'lapses', 'learning_steps', 'state'].every((key) => typeof value[key] === 'number' && Number.isFinite(value[key]) && value[key] >= 0) &&
    (value.last_review === undefined || typeof value.last_review === 'string' && Number.isFinite(Date.parse(value.last_review)));
}
function normalize(raw: Record<string, unknown>): Library {
  if (!Array.isArray(raw.questions) || raw.questions.some((q) => !q || typeof q.id !== 'string' || typeof q.question !== 'string' || typeof q.answer !== 'string')) throw invalid();
  if (raw.schema === undefined) {
    const questions: Question[] = raw.questions.map((q) => ({ id: q.id, question: q.question, answer: q.answer, tagIds: /^starter-\d+$/.test(q.id) ? [Number(q.id.slice(8)) >= 7 && Number(q.id.slice(8)) <= 13 ? 'behavioral' : 'general'] : [], frequency: 0, revision: 0, card: null }));
    const titles = new Set(questions.map((q) => q.question.trim().toLowerCase()));
    return { version: 1, schema: 2, tagRevision: 0, tags: initialTags.map((tag) => ({ ...tag })), questions: [...questions, ...technicalQuestions().filter((q) => !titles.has(q.question.toLowerCase()))], events: [] };
  }
  if (raw.schema !== 2 || !Number.isSafeInteger(raw.tagRevision) || Number(raw.tagRevision) < 0 || !Array.isArray(raw.tags) || !Array.isArray(raw.events)) throw invalid();
  const library = raw as unknown as Library;
  const tagIds = new Set<string>();
  for (const tag of library.tags) {
    if (!tag || typeof tag.id !== 'string' || typeof tag.name !== 'string' || !tag.name.trim() || tagIds.has(tag.id)) throw invalid();
    tagIds.add(tag.id);
  }
  const questionIds = new Set<string>();
  for (const q of library.questions) {
    if (!Number.isSafeInteger(q.frequency) || q.frequency < 0 || !Number.isSafeInteger(q.revision) || q.revision < 0 || !Array.isArray(q.tagIds) || q.tagIds.some((id) => !tagIds.has(id)) || (q.card !== null && !validCard(q.card)) || questionIds.has(q.id)) throw invalid();
    questionIds.add(q.id);
  }
  const eventIds = new Set<string>();
  for (const event of library.events) {
    if (!event || typeof event.id !== 'string' || eventIds.has(event.id) || typeof event.at !== 'string' || !Number.isFinite(Date.parse(event.at))) throw invalid();
    if (event.kind === 'review') {
      if (typeof event.questionId !== 'string' || typeof event.question !== 'string' || typeof event.sessionId !== 'string' || ![1, 2, 3, 4].includes(event.rating) || !validCard(event.after) || event.before !== null && !validCard(event.before)) throw invalid();
    } else if (event.kind !== 'undo' || typeof event.reviewId !== 'string') throw invalid();
    eventIds.add(event.id);
  }
  return library;
}
const readRaw = (directory: string) => readJson<Record<string, unknown>>(pathFor(directory), () => ({ version: 1, questions: starterQuestions() }));
export async function readQuestions(directory = dataDirectory()): Promise<Library> {
  const raw = await readRaw(directory);
  if (raw.schema === 2) return normalize(raw);
  return updateQuestions(() => undefined, directory);
}
export function updateQuestions(mutate: (library: Library) => void, directory = dataDirectory()) {
  return updateJson(pathFor(directory), async () => normalize(await readRaw(directory)), mutate);
}
export async function libraryMutation(mutate: (library: Library) => void, directory = dataDirectory()): Promise<LibraryResult> {
  try { return { library: await updateQuestions(mutate, directory) }; }
  catch (error) { return { error: error instanceof Error && error.message.startsWith('Check:') ? error.message.slice(7) : 'Could not save. Your changes are still here. Check local disk access and retry.' }; }
}
export function check(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(`Check: ${message}`); }
export function currentQuestion(library: Library, id: string, revision: unknown) {
  const q = library.questions.find((q) => q.id === id);
  check(q, 'This question was removed. Reload to see current questions.');
  check(String(q.revision) === String(revision), 'This question changed in another tab. Copy your edits, then reload.');
  return q;
}
export async function changeQuestion(form: FormData, directory = dataDirectory()): Promise<LibraryResult> {
  return libraryMutation((library) => {
    const operation = form.get('operation');
    check(['create', 'edit', 'delete'].includes(String(operation)), 'Choose a valid question action.');
    const existing = operation === 'create' ? undefined : currentQuestion(library, String(form.get('id')), form.get('revision'));
    if (operation === 'delete') { library.questions = library.questions.filter((q) => q !== existing); return; }
    const question = form.get('question'); const answer = form.get('answer');
    check(typeof question === 'string' && question.trim() && question.length <= 500 && typeof answer === 'string' && answer.trim() && answer.length <= 10000, 'Enter a question (up to 500 characters) and an answer (up to 10,000 characters).');
    const frequency = String(form.get('frequency') ?? '0');
    check(/^\d+$/.test(frequency) && Number.isSafeInteger(Number(frequency)), 'Interview frequency must be a nonnegative whole number.');
    const tagIds = [...new Set(form.getAll('tagIds').map(String))];
    check(tagIds.every((id) => library.tags.some((tag) => tag.id === id)), 'A selected tag was removed. Reload before saving.');
    const item: Question = { ...existing, id: existing?.id ?? randomUUID(), question: question.trim(), answer: answer.trim(), tagIds, frequency: Number(frequency), revision: existing ? existing.revision + 1 : 0, card: existing?.card ?? null };
    if (existing) library.questions[library.questions.indexOf(existing)] = item;
    else library.questions.unshift(item);
  }, directory);
}
export async function changeTag(form: FormData, directory = dataDirectory()): Promise<LibraryResult> {
  return libraryMutation((library) => {
    check(String(library.tagRevision) === form.get('revision'), 'Tags changed in another tab. Reload before saving.');
    const operation = form.get('operation');
    check(['create', 'rename', 'delete'].includes(String(operation)), 'Choose a valid tag action.');
    const tag = library.tags.find((tag) => tag.id === form.get('id'));
    if (operation !== 'create') check(tag, 'This tag was removed. Reload before saving.');
    if (operation === 'delete') {
      library.tags = library.tags.filter((item) => item !== tag);
      library.questions.forEach((q) => { if (q.tagIds.includes(tag!.id)) { q.tagIds = q.tagIds.filter((id) => id !== tag!.id); q.revision++; } });
    } else {
      const name = form.get('name');
      check(typeof name === 'string' && name.trim() && name.trim().length <= 40, 'Enter a tag name up to 40 characters.');
      check(!library.tags.some((item) => item !== tag && item.name.toLowerCase() === name.trim().toLowerCase()), 'A tag with that name already exists.');
      if (tag) tag.name = name.trim(); else library.tags.push({ id: randomUUID(), name: name.trim() });
    }
    library.tagRevision++;
  }, directory);
}
