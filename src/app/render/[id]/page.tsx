import { Suspense } from 'react';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { readWorkspace } from '../../../lib/storage';
import { resolveResume } from '../../../lib/resolver';
import { resumeRevision } from '../../resumes/resume-data';
import { ResumeDocument } from '../../../template/ResumeDocument';
async function Content({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ revision?: string }> }) {
  await connection();
  const [{ id }, query, workspace] = await Promise.all([params, searchParams, readWorkspace()]);
  const resume = workspace.resumes.find((item) => item.id === id);
  if (!resume || (query.revision && resumeRevision(resume) !== query.revision)) notFound();
  return <ResumeDocument document={resolveResume(resume)} />;
}
export default function RenderPage(props: { params: Promise<{ id: string }>; searchParams: Promise<{ revision?: string }> }) {
  return <Suspense fallback={null}><Content {...props} /></Suspense>;
}
