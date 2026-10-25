import { ResumeList } from '../../resumes/ResumeList';
import { resumeRevision, sortResumes } from '../../resumes/resume-data';
import Link from 'next/link';
import { WorkspaceShell } from '../../../components/WorkspaceShell';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { readRecord, readWorkspace } from '../../../lib/storage';
import { RecordEditor } from '../../career-record/RecordEditor';
import { saveProfileAction } from '../actions';
import { profileRevision } from '../profile-data';

async function ProfileContent({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const [workspace, record] = await Promise.all([readWorkspace(), readRecord()]);
  const profile = workspace.profiles.find((profile) => profile.id === id);
  if (!profile) notFound();
  const resumes = workspace.resumes.filter((resume) => resume.profileId === id);
  return <>
    <ResumeList profileId={id} resumes={sortResumes(resumes).map((resume) => ({ id: resume.id, name: resume.name, language: resume.language, revision: resumeRevision(resume) }))} />
    <RecordEditor key={profile.id} record={{ version: 1, basics: profile.basics, entries: profile.entries }} revision={profileRevision(profile)} saveAction={saveProfileAction.bind(null, id)} profile={profile} availableEntries={record.entries} />

  </>;
}
export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  return <WorkspaceShell navigation={<Link href="/">Back to workspace</Link>} className="record-main"><h1>Profile</h1><p className="page-intro">Choose a starting point for a career direction. These copies are yours to adjust.</p><Suspense fallback={<p role="status">Loading your Profile…</p>}><ProfileContent params={params} /></Suspense></WorkspaceShell>;
}
