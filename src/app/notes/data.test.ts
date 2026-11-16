import { afterEach, expect, it, vi } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }));
import { changeNote, readNotes } from './data';
const directories: string[] = [];
afterEach(async () => { await Promise.all(directories.splice(0).map(d => rm(d, { recursive: true, force: true }))); });
const note = { id: 'test', title: '', text: 'Interview ideas', pinned: false, color: 'default' as const, items: [], updatedAt: '' };
it('persists, updates and deletes notes while rejecting empty notes', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'careery-notes-')); directories.push(directory);
  await changeNote('save', note, directory);
  await changeNote('save', { ...note, pinned: true }, directory);
  const stored = (await readNotes(directory)).notes;
  expect(stored).toHaveLength(1);
  expect(stored[0]).toMatchObject({ id: 'test', title: '', text: 'Interview ideas', pinned: true, color: 'default', items: [] });
  expect(stored[0].updatedAt).not.toBe('');
  await expect(changeNote('save', { ...note, text: '' }, directory)).rejects.toThrow();
  expect((await readNotes(directory)).notes).toHaveLength(1);
  await changeNote('delete', note, directory);
  expect((await readNotes(directory)).notes).toEqual([]);
});
it('keeps note colours and checklist items', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'careery-notes-')); directories.push(directory);
  const items = [{ id: 'one', text: 'Ask about the team', done: false }];
  await changeNote('save', { ...note, color: 'amber', items }, directory);
  const stored = (await readNotes(directory)).notes;
  expect(stored[0].color).toBe('amber');
  expect(stored[0].items).toEqual(items);
  await expect(changeNote('save', { ...note, color: 'rainbow' as never }, directory)).rejects.toThrow();
});
it('reads notes written before colours and checklists existed', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'careery-notes-')); directories.push(directory);
  await writeFile(join(directory, 'notes.json'), JSON.stringify({ version: 1, notes: [{ id: 'old', title: 'Older note', text: '', pinned: true }] }));
  expect((await readNotes(directory)).notes).toEqual([{ id: 'old', title: 'Older note', text: '', pinned: true, color: 'default', items: [], updatedAt: '' }]);
});

it('keeps lessons separate from general notes', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'careery-lessons-')); directories.push(directory);
  const note = { id: 'lesson', title: 'Ask about expectations', text: 'Clarify success before accepting.', pinned: false, color: 'default' as const, items: [], updatedAt: '' };
  await changeNote('save', note, directory, 'lessons.json');
  expect((await readNotes(directory)).notes).toEqual([]);
  expect((await readNotes(directory, 'lessons.json')).notes[0].title).toBe(note.title);
});
