import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { WorkspaceShell } from '../../../components/WorkspaceShell';
import { readRecord, readWorkspace } from '../../../lib/storage';
import { RecordEditor } from '../../career-record/RecordEditor';
import { resumeRevision } from '../resume-data';
import { saveResumeAction } from '../actions';
async function ResumeContent({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const [workspace, record] = await Promise.all([readWorkspace(), readRecord()]);
  const resume = workspace.resumes.find((item) => item.id === id);
  if (!resume) notFound();
  return <RecordEditor key={id} record={{ version: 1, basics: resume.basics, entries: resume.entries }} revision={resumeRevision(resume)} saveAction={saveResumeAction.bind(null, id)} resume={resume} profiles={workspace.profiles.map(({ id, name }) => ({ id, name }))} availableEntries={record.entries} />;
}
export default function ResumePage({ params }: { params: Promise<{ id: string }> }) {
  return <WorkspaceShell navigation={<Link href="/">Back to workspace</Link>} className="record-main resume-main"><h1>Edit Resume</h1><p className="page-intro">Tailor your own copy. Your Career Record and Profiles keep their wording.</p><Suspense fallback={<p role="status">Loading your Resume…</p>}><ResumeContent params={params} /></Suspense></WorkspaceShell>;
}
