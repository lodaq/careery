import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PageHeading } from '@/components/PageHeading';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { readNotes } from '../notes/data';
import { NotesBoard } from '../notes/NotesBoard';
import { lessonAction } from './actions';
import '../notes/notes.css';
export const metadata: Metadata = { title: 'Lessons', description: 'Keep track of lessons from your job search.', robots: { index: false, follow: false } };
async function LessonsContent() {
  const data = await readNotes(undefined, 'lessons.json');
  return <><PageHeading><h1>Lessons</h1><p className="page-intro">A journal of mistakes, discoveries and lessons from interviews and working life.</p></PageHeading>
    <p className="mb-6 max-w-prose text-muted-foreground">Start with a title on the first line. Then reflect: What happened? What did I learn? What will I do differently? Use a checklist for your next steps.</p>
    <NotesBoard notes={data.notes} saveAction={lessonAction} lessons /></>;
}
export default function LessonsPage() {
  return <WorkspaceShell contentId="lessons-content"><Suspense fallback={<p role="status">Loading lessons…</p>}><LessonsContent /></Suspense></WorkspaceShell>;
}
