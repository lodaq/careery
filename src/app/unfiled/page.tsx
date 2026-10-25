import { ResumeList } from '../resumes/ResumeList';
import { resumeRevision, sortResumes } from '../resumes/resume-data';
import Link from 'next/link';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { readWorkspace } from '../../lib/storage';
async function Resumes() {
  await connection();
  const resumes = (await readWorkspace()).resumes.filter((resume) => resume.profileId === null);
  return <ResumeList resumes={sortResumes(resumes).map((resume) => ({ id: resume.id, name: resume.name, language: resume.language, revision: resumeRevision(resume) }))} />;
}
export default function UnfiledPage() {
  return <WorkspaceShell navigation={<Link href="/">Back to workspace</Link>}><h1>Unfiled</h1><p className="page-intro">Resumes that do not belong to a Profile. Deleting a Profile preserves its Resumes here.</p><Suspense fallback={<p role="status">Loading your Resumes…</p>}><Resumes /></Suspense></WorkspaceShell>;
}
