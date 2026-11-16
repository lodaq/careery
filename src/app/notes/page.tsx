import { PageHeading } from '@/components/PageHeading';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { readNotes } from './data';
import { NotesBoard } from './NotesBoard';
import './notes.css';
export const metadata: Metadata = { title: 'Notes', description: 'Organize your career notes.', robots: { index: false, follow: false } };
async function NotesContent() {
  const data = await readNotes();
  return <><PageHeading><h1>Notes</h1><p className="page-intro">Keep ideas, reminders and interview prep close at hand.</p></PageHeading><NotesBoard notes={data.notes} /></>;
}

export default function NotesPage() { return <WorkspaceShell contentId="notes-content"><Suspense fallback={<p role="status">Loading notes…</p>}><NotesContent /></Suspense></WorkspaceShell>; }
