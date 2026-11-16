'use client';
import { ListPlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NoteItemsField } from './NoteItemsField';
import { NotePalette } from './NotePalette';
import type { Note } from './note-types';

/** Inline editor: the card keeps its place in the grid while the note is being written. */
export function NoteEditor({ note, onChange, onSave, onCancel, pending }: { note: Note; onChange: (note: Note) => void; onSave: () => void; onCancel: () => void; pending: boolean }) {
  function addItem() { onChange({ ...note, items: [...note.items, { id: crypto.randomUUID(), text: '', done: false }] }); }
  return <div className="note-editor">
    <Input className="note-editor-title" dir="auto" value={note.title} onChange={event => onChange({ ...note, title: event.target.value })} placeholder="Title" aria-label="Note title" maxLength={200} />
    <Textarea value={note.text} dir="auto" onChange={event => onChange({ ...note, text: event.target.value })} placeholder="Take a note…" aria-label="Note text" maxLength={20000} />
    {note.items.length > 0 && <NoteItemsField items={note.items} onChange={items => onChange({ ...note, items })} label="Note checklist" />}
    <div className="note-editor-toolbar">
      <div className="note-editor-tools">
        <NotePalette value={note.color} onChange={color => onChange({ ...note, color })} />
        <Button variant="ghost" size="icon" aria-label="Add checklist" title="Add checklist" onClick={addItem}><ListPlusIcon aria-hidden="true" /></Button>
      </div>
      <div className="note-editor-actions">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={pending}>Cancel</Button>
        <Button size="sm" onClick={onSave} disabled={pending}>{pending ? 'Saving…' : 'Save note'}</Button>
      </div>
    </div>
  </div>;
}
