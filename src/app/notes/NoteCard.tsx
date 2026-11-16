'use client';
import { PaletteIcon, PencilIcon, PinIcon, PinOffIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover';
import { NoteEditor } from './NoteEditor';
import { NotePalette } from './NotePalette';
import type { Note } from './note-types';

const editedOn = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export function NoteCard({ note, editing, pending, onEdit, onDraft, onSave, onCancel, onPersist, onDelete }: { note: Note; editing: boolean; pending: boolean; onEdit: () => void; onDraft: (note: Note) => void; onSave: (note: Note) => void; onCancel: () => void; onPersist: (note: Note) => void; onDelete: () => void }) {
  if (editing) return <article className="note-card" data-color={note.color} aria-label="Editing note"><NoteEditor note={note} onChange={onDraft} onSave={() => onSave(note)} onCancel={onCancel} pending={pending} /></article>;
  const empty = !note.title.trim() && !note.text.trim() && !note.items.some(item => item.text.trim());
  const edited = note.updatedAt ? editedOn.format(new Date(note.updatedAt)) : '';
  return <article className="note-card" data-color={note.color} aria-label={note.title.trim() || 'Untitled note'}>
    {note.pinned && <span className="note-card-pin" title="Pinned"><PinIcon aria-hidden="true" /></span>}
    {note.title.trim() && <h3 className="note-card-title" dir="auto">{note.title}</h3>}
    {note.text.trim() && <p className="note-card-text" dir="auto">{note.text}</p>}
    {note.items.length > 0 && <ul className="note-card-items">{note.items.map(item => <li key={item.id} className="note-item-row" data-done={item.done}>
      <Checkbox checked={item.done} onCheckedChange={checked => onPersist({ ...note, items: note.items.map(other => other.id === item.id ? { ...other, done: checked === true } : other) })} aria-label={item.text.trim() || 'Checklist item'} />
      <span dir="auto">{item.text}</span>
    </li>)}</ul>}
    {empty && <p className="note-card-text">Empty note</p>}
    <div className="note-card-footer">
      <p className="note-card-meta" title={edited ? `Edited ${edited}` : undefined}>{edited || 'Not saved yet'}</p>
      <div className="note-card-actions">
        <Popover>
          <PopoverTrigger render={<Button variant="ghost" size="icon" aria-label="Change note colour" />}><PaletteIcon aria-hidden="true" /></PopoverTrigger>
          <PopoverContent align="end" className="note-palette-popover">
            <PopoverHeader><PopoverTitle>Note colour</PopoverTitle></PopoverHeader>
            <NotePalette value={note.color} onChange={color => onPersist({ ...note, color })} />
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="icon" aria-label={note.pinned ? 'Unpin note' : 'Pin note'} onClick={() => onPersist({ ...note, pinned: !note.pinned })}>{note.pinned ? <PinOffIcon aria-hidden="true" /> : <PinIcon aria-hidden="true" />}</Button>
        <Button variant="ghost" size="icon" aria-label="Edit note" onClick={onEdit}><PencilIcon aria-hidden="true" /></Button>
        <Button variant="ghost" size="icon" aria-label="Delete note" onClick={onDelete}><Trash2Icon aria-hidden="true" /></Button>
      </div>
    </div>
  </article>;
}
