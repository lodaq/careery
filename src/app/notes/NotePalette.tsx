'use client';
import { noteColorLabels, noteColors, type NoteColor } from './note-types';

export function NotePalette({ value, onChange, label = 'Note colour' }: { value: NoteColor; onChange: (color: NoteColor) => void; label?: string }) {
  return <div className="note-palette" role="group" aria-label={label}>
    {noteColors.map(color => <button key={color} type="button" className="note-swatch" data-color={color} aria-pressed={value === color} aria-label={`${noteColorLabels[color]} note`} title={noteColorLabels[color]} onClick={() => onChange(color)} />)}
  </div>;
}
