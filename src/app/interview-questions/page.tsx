import { Suspense } from 'react';
import { connection } from 'next/server';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { readQuestions } from './question-data';
import { QuestionLibrary } from './QuestionLibrary';
async function Questions() {
  await connection();
  const library = await readQuestions();
  return <QuestionLibrary initialLibrary={library} initialNow={new Date().toISOString()} />;
}
export default function InterviewQuestionsPage() {
  return <WorkspaceShell contentId="questions-content"><Suspense fallback={<p role="status">Loading interview questions…</p>}><Questions /></Suspense></WorkspaceShell>;
}
