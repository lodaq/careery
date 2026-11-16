'use client';
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useConfirmAction } from '@/components/ConfirmAction';
import { Input } from '@/components/ui/input';
import { noteAction } from './actions';
import { NoteCard } from './NoteCard';
import { NoteComposer } from './NoteComposer';
import { emptyDraft, splitDraft, type Note, type NoteDraft } from './note-types';

export function NotesBoard({ notes, saveAction = noteAction, lessons = false }: { notes: Note[]; saveAction?: typeof noteAction; lessons?: boolean }) {
  const [draft, setDraft] = useState<NoteDraft | null>(null);
  const [editing, setEditing] = useState<Note | null>(null);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const { confirm, confirmation } = useConfirmAction();
  const router = useRouter();
  const composerRef = useRef<HTMLTextAreaElement>(null);

  function persist(note: Note, message = 'Note saved') {
    startTransition(async () => {
      const result = await saveAction('save', note);
      if (result.error) { setNotice(''); setError(result.error); return; }
      setError(''); setNotice(message);
      router.refresh();
    });
  }

  function saveDraft() {
    if (!draft) return;
    const { title, text } = splitDraft(draft);
    if (!title && !text && !draft.items.some(item => item.text.trim())) { setNotice(''); setError('Add a title or note before saving.'); return; }
    const note: Note = { id: draft.id, title, text, pinned: draft.pinned, color: draft.color, items: draft.items, updatedAt: '' };
    setDraft(emptyDraft(crypto.randomUUID()));
    persist(note, 'Note saved');
    composerRef.current?.focus();
  }

  async function remove(note: Note) {
    if (!await confirm('Delete this note permanently?', { action: 'Delete note' })) return;
    startTransition(async () => {
      const result = await saveAction('delete', note);
      if (result.error) { setNotice(''); setError(result.error); return; }
      setError(''); setNotice('Note deleted');
      router.refresh();
    });
  }

  const search = query.trim().toLowerCase();
  const matching = notes.filter(note => !search || `${note.title} ${note.text} ${note.items.map(item => item.text).join(' ')}`.toLowerCase().includes(search));
  const ordered = [...matching.filter(note => note.pinned), ...matching.filter(note => !note.pinned)];

  function card(note: Note) {
    const shown = editing?.id === note.id ? editing : note;
    return <NoteCard key={note.id} note={shown} editing={editing?.id === note.id} pending={pending}
      onEdit={() => { setEditing(note); setNotice(''); setError(''); }}
      onDraft={drafted => setEditing(drafted)}
      onSave={saved => { setEditing(null); persist(saved, 'Note saved'); }}
      onCancel={() => setEditing(null)}
      onPersist={changed => persist(changed)}
      onDelete={() => remove(note)} />;
  }

  return <div className="notes-board">
    <div className="notes-topbar">
      <NoteComposer draft={draft} onChange={setDraft} onStart={() => setDraft(current => current ?? emptyDraft(crypto.randomUUID()))} onSave={saveDraft} textareaRef={composerRef} pending={pending} />
      <search className="notes-search">
        <label htmlFor="notes-search">{lessons ? 'Search lessons' : 'Search notes'}</label>
        <Input id="notes-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={lessons ? 'Search lessons' : 'Search notes'} />
      </search>
    </div>
    <p className="notes-status" role="status">{notice}</p>
    {error && <p className="notes-status notes-status-error" role="alert">{error}</p>}
    <section className="notes-section" aria-labelledby="notes-all">
      <h2 id="notes-all">{lessons ? 'Lessons' : 'Notes'} <span>{ordered.length}</span></h2>
      {ordered.length > 0 ? <div className="notes-grid">{ordered.map(card)}</div>
        : <div className="notes-empty"><h2>{notes.length ? `No ${lessons ? 'lessons' : 'notes'} match your search` : lessons ? 'No lessons yet' : 'No notes yet'}</h2><p>{notes.length ? 'Try another word, or clear the search to see every note.' : lessons ? 'Write what happened, what you learned and what you will do differently next time.' : 'Take a note above to keep reminders, interview ideas and links close at hand.'}</p></div>}
    </section>
    {confirmation}
  </div>;
}
