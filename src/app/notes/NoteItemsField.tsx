'use client';
import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import type { NoteItem } from './note-types';

/** Checklist rows shared by the composer and the note editor. */
export function NoteItemsField({ items, onChange, label = 'Checklist' }: { items: NoteItem[]; onChange: (items: NoteItem[]) => void; label?: string }) {
  function update(id: string, patch: Partial<NoteItem>) { onChange(items.map(item => item.id === id ? { ...item, ...patch } : item)); }
  return <ul className="note-editor-items" aria-label={label}>
    {items.map((item, index) => <li key={item.id} className="note-item-editor-row">
      <Checkbox checked={item.done} onCheckedChange={(checked) => update(item.id, { done: checked === true })} aria-label={item.text.trim() || `Checklist item ${index + 1}`} />
      <Input value={item.text} dir="auto" onChange={event => update(item.id, { text: event.target.value })} aria-label={item.text.trim() || `Checklist item ${index + 1}`} placeholder="List item" />
      <Button variant="ghost" size="icon-sm" onClick={() => onChange(items.filter(other => other.id !== item.id))} aria-label={`Remove checklist item ${index + 1}`}><XIcon aria-hidden="true" /></Button>
    </li>)}
  </ul>;
}
