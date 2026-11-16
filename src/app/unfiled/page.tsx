import { PageHeading } from '@/components/PageHeading';
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
export const metadata = { title: 'Unfiled', description: 'Manage resumes that are not assigned to a profile.', robots: { index: false, follow: false } };

export default function UnfiledPage() {
  return <WorkspaceShell contentId="unfiled-content" navigation={<Link prefetch={false} href="/profiles">Back to workspace</Link>}><PageHeading><h1>Unfiled</h1><p className="page-intro">Resumes that do not belong to a Profile. Deleting a Profile preserves its Resumes here.</p></PageHeading><Suspense fallback={<p role="status">Loading your Resumes…</p>}><Resumes /></Suspense></WorkspaceShell>;
}
