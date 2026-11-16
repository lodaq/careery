import { join } from 'node:path';
import { dataDirectory, readJson, updateJson } from '@/lib/storage';
import { noteColors, type Note, type NoteItem } from './note-types';

export { noteColors } from './note-types';
export type { Note, NoteColor, NoteItem } from './note-types';
interface Notes { version: number; notes: Note[] }

const isNoteItem = (value: unknown): value is NoteItem => Boolean(value) && typeof value === 'object' && typeof (value as NoteItem).id === 'string' && typeof (value as NoteItem).text === 'string' && typeof (value as NoteItem).done === 'boolean';

/** Older files predate colours, checklists and edit times; missing fields fall back to their defaults. */
function normalizeNote(value: Note): Note {
  return { ...value, color: noteColors.includes(value.color) ? value.color : 'default', items: Array.isArray(value.items) ? value.items.filter(isNoteItem) : [], updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '' };
}

export async function readNotes(directory?: string, filename: 'notes.json' | 'lessons.json' = 'notes.json'): Promise<Notes> {
  directory ??= await dataDirectory();
  const data = await readJson<Notes>(join(/*turbopackIgnore: true*/ directory, filename), () => ({ version: 1, notes: [] }));
  if (!Array.isArray(data.notes) || data.notes.some(n => !n || typeof n.id !== 'string' || typeof n.title !== 'string' || typeof n.text !== 'string' || typeof n.pinned !== 'boolean' || (n.items !== undefined && !Array.isArray(n.items)) || (n.items ?? []).some(item => !isNoteItem(item)))) throw new Error('Invalid notes; original data was preserved.');
  return { version: 1, notes: data.notes.map(normalizeNote) };
}

export async function changeNote(operation: string, note: Note, directory?: string, filename: 'notes.json' | 'lessons.json' = 'notes.json') {
  const items = note?.items ?? [];
  if (!['save', 'delete'].includes(operation) || !note || typeof note.id !== 'string' || !note.id || typeof note.title !== 'string' || typeof note.text !== 'string' || typeof note.pinned !== 'boolean' || !noteColors.includes(note.color) || !Array.isArray(items) || items.some(item => !isNoteItem(item) || !item.id || item.text.length > 500) || note.title.length > 200 || note.text.length > 20000 || (operation === 'save' && !note.title.trim() && !note.text.trim() && !items.some(item => item.text.trim()))) throw new Error('Add a title or note. Titles allow 200 characters; notes allow 20,000.');
  directory ??= await dataDirectory();
  const stored: Note = { ...note, items, updatedAt: new Date().toISOString() };
  return updateJson(join(/*turbopackIgnore: true*/ directory, filename), () => readNotes(directory, filename), data => {
    const index = data.notes.findIndex(n => n.id === note.id);
    if (operation === 'delete') { if (index >= 0) data.notes.splice(index, 1); }
    else if (index >= 0) data.notes[index] = stored;
    else data.notes.unshift(stored);
  });
}
