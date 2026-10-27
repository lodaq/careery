import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, test } from 'vitest';
import { changeQuestion, readQuestions } from './question-data';
const directories: string[] = [];
afterEach(async () => { await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))); });
function form(operation: string, values: Record<string, string> = {}) {
  const data = new FormData(); data.set('operation', operation);
  Object.entries(values).forEach(([key, value]) => data.set(key, value)); return data;
}
test('seeds once, persists CRUD, rejects stale edits, and keeps a deleted library empty', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'careery-questions-')); directories.push(directory);
  expect((await readQuestions(directory)).questions).toHaveLength(63);
  const created = await changeQuestion(form('create', { question: ' My question? ', answer: ' My answer. ' }), directory);
  const item = created.library!.questions[0];
  expect(item.question).toBe('My question?');
  const original = { id: item.id, revision: String(item.revision) };
  expect((await changeQuestion(form('edit', { ...original, question: 'Updated?', answer: 'Updated answer.' }), directory)).error).toBeUndefined();
  expect((await changeQuestion(form('delete', original), directory)).error).toContain('changed in another tab');
  for (const question of (await readQuestions(directory)).questions) {
    expect((await changeQuestion(form('delete', { id: question.id, revision: String(question.revision) }), directory)).error).toBeUndefined();
  }
  expect((await readQuestions(directory)).questions).toEqual([]);
});
test('rejects blank questions and answers without writing', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'careery-questions-')); directories.push(directory);
  expect((await changeQuestion(form('create', { question: ' ', answer: 'Answer' }), directory)).error).toContain('Enter a question');
  expect((await changeQuestion(form('create', { question: 'Question', answer: ' ' }), directory)).error).toContain('Enter a question');
  expect((await readQuestions(directory)).questions).toHaveLength(63);
});
