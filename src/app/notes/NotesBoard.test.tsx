// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { NotesBoard } from './NotesBoard';
import type { Note } from './note-types';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const note: Note = { id: 'n1', title: 'Interview loop', text: 'Hiring manager round.', pinned: false, color: 'default', items: [{ id: 'i1', text: 'Send the brief', done: false }], updatedAt: '2026-11-15T09:20:00.000Z' };
type SaveResult = { success: boolean; error?: undefined } | { error: string; success?: undefined };
const saver = () => vi.fn<(operation: string, note: Note) => Promise<SaveResult>>(async () => ({ success: true }));
afterEach(cleanup);

it('keeps the first line as the title and the rest as the note body', async () => {
  const save = saver();
  render(<NotesBoard notes={[]} saveAction={save} />);
  const field = screen.getByLabelText('New note text');
  fireEvent.focus(field);
  fireEvent.change(field, { target: { value: 'Ask about the design review\nBring printed references' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save note' }));
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
  expect(save.mock.calls[0][0]).toBe('save');
  expect(save.mock.calls[0][1]).toMatchObject({ title: 'Ask about the design review', text: 'Bring printed references', color: 'default', pinned: false });
});

it('colours a new note from the composer palette', async () => {
  const save = saver();
  render(<NotesBoard notes={[]} saveAction={save} />);
  const field = screen.getByLabelText('New note text');
  fireEvent.focus(field);
  fireEvent.change(field, { target: { value: 'Colour this note' } });
  fireEvent.click(screen.getByRole('button', { name: 'Amber note' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save note' }));
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
  expect(save.mock.calls[0][1]).toMatchObject({ title: 'Colour this note', color: 'amber' });
});

it('pins a note and marks a checklist item done from the card', async () => {
  const save = saver();
  render(<NotesBoard notes={[note]} saveAction={save} />);
  fireEvent.click(screen.getByRole('button', { name: 'Pin note' }));
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
  expect(save.mock.calls[0][1]).toMatchObject({ id: 'n1', pinned: true });
  fireEvent.click(screen.getByRole('checkbox', { name: 'Send the brief' }));
  await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
  expect(save.mock.calls[1][1].items[0]).toMatchObject({ id: 'i1', done: true });
});

it('shows only the notes that match the search', () => {
  render(<NotesBoard notes={[note, { ...note, id: 'n2', title: 'Question bank', text: '' }]} saveAction={saver()} />);
  expect(screen.getAllByRole('article')).toHaveLength(2);
  fireEvent.change(screen.getByLabelText('Search notes'), { target: { value: 'question' } });
  expect(screen.getAllByRole('article')).toHaveLength(1);
  expect(within(screen.getByRole('article')).getByText('Question bank')).toBeDefined();
});
