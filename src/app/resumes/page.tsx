import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { readWorkspace } from '../../lib/storage';
import { resumeRevision, sortResumes } from './resume-data';
import { ResumeList } from './ResumeList';
import './resume-dashboard.css';

async function AllResumes() {
  await connection();
  const workspace = await readWorkspace();
  return <ResumeList dashboard resumes={sortResumes(workspace.resumes).map((resume) => ({ id: resume.id, name: resume.name, language: resume.language, revision: resumeRevision(resume), profileName: workspace.profiles.find((profile) => profile.id === resume.profileId)?.name, updatedAt: resume.updatedAt }))} />;
}
export default function ResumesPage() {
  return <WorkspaceShell contentId="resumes-content" className="resume-dashboard" navigation={<nav aria-label="Workspace"><Link prefetch={false} href="/">Profiles</Link><Link href="/resumes" aria-current="page">Resumes</Link><Link href="/career-record">Career Record</Link></nav>}><Suspense fallback={<p role="status">Loading your Resumes…</p>}><AllResumes /></Suspense></WorkspaceShell>;
}
