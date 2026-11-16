'use client';
import { ListPlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { NoteItemsField } from './NoteItemsField';
import { NotePalette } from './NotePalette';
import type { NoteDraft } from './note-types';

export function NoteComposer({ draft, onChange, onStart, onSave, textareaRef, pending }: { draft: NoteDraft | null; onChange: (draft: NoteDraft) => void; onStart: () => void; onSave: () => void; textareaRef: React.RefObject<HTMLTextAreaElement | null>; pending: boolean }) {
  function addItem() { if (!draft) return; onChange({ ...draft, items: [...draft.items, { id: crypto.randomUUID(), text: '', done: false }] }); }
  return <section className="notes-composer" data-color={draft?.color ?? 'default'} aria-label="New note">
    <div className="notes-composer-body">
      <Textarea ref={textareaRef} className="notes-composer-text" dir="auto" rows={1} placeholder="Take a note…" aria-label="New note text" value={draft?.text ?? ''} onFocus={onStart} onChange={event => draft && onChange({ ...draft, text: event.target.value })} />
      {draft && draft.items.length > 0 && <NoteItemsField items={draft.items} onChange={items => onChange({ ...draft, items })} label="New note checklist" />}
    </div>
    {draft && <div className="notes-composer-toolbar">
      <NotePalette value={draft.color} onChange={color => onChange({ ...draft, color })} />
      <Button variant="ghost" size="sm" onClick={addItem}><ListPlusIcon aria-hidden="true" />Add checklist</Button>
      <span className="notes-composer-spacer" />
      <Button size="sm" onClick={onSave} disabled={pending}>{pending ? 'Saving…' : 'Save note'}</Button>
    </div>}
  </section>;
}
