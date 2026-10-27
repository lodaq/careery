// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { QuestionsTable } from './QuestionsTable';
import type { Question } from './question-model';
afterEach(cleanup);
const question: Question = { id: 'stable', question: 'Explain closures?', answer: 'A function retains its lexical environment.', tagIds: ['javascript'], frequency: 3, revision: 0, card: null };
test('retains expanded answers across clock updates and uses current row actions and data', () => {
  const oldEdit = vi.fn(); const edit = vi.fn();
  const props = { questions: [question], tags: [{ id: 'javascript', name: 'JavaScript' }], now: new Date('2026-10-27T12:00:00Z'), disabled: false, edit: oldEdit, remove: vi.fn(), practice: vi.fn() };
  const view = render(<QuestionsTable {...props} />);
  fireEvent.click(screen.getByRole('button', { name: question.question }));
  expect(screen.getByRole('button', { name: question.question }).getAttribute('aria-expanded')).toBe('true');
  view.rerender(<QuestionsTable {...props} now={new Date('2026-10-27T12:00:15Z')} questions={[{ ...question, frequency: 9 }]} edit={edit} />);
  expect(screen.getByRole('button', { name: question.question }).getAttribute('aria-expanded')).toBe('true');
  expect(screen.getByRole('cell', { name: '9' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: `Edit: ${question.question}` }));
  expect(edit).toHaveBeenCalledWith(expect.objectContaining({ id: 'stable', frequency: 9 }));
  expect(oldEdit).not.toHaveBeenCalled();
  view.rerender(<QuestionsTable {...props} questions={[]} />);
  expect(screen.queryByRole('button', { name: question.question })).toBeNull();
});
