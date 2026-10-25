import Link from 'next/link';
import { WorkspaceShell } from '../components/WorkspaceShell';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { readWorkspace } from '../lib/storage';
import { ProfileGrid } from './profiles/ProfileGrid';
import { profileRevision } from './profiles/profile-data';

async function Profiles() {
  await connection();
  const workspace = await readWorkspace();
  const profiles = workspace.profiles.map((profile) => ({ id: profile.id, name: profile.name, entryCount: profile.entries.length, resumeCount: workspace.resumes.filter((resume) => resume.profileId === profile.id).length, revision: profileRevision(profile) }));
  return <ProfileGrid profiles={profiles} unfiledCount={workspace.resumes.filter((resume) => resume.profileId === null).length} />;
}
export default function Page() {
  return <WorkspaceShell footer="Made for your next move. Stored on your machine.">
      <div className="introduction"><h1>Your next chapter starts here.</h1><p>Keep your career in one place. Shape a resume for wherever you want to go.</p><Link className="primary-link" href="/career-record">Build your Career Record</Link></div>
      <Suspense fallback={<section className="profile-workspace"><h2>Your Profiles</h2><p role="status">Loading your Profiles…</p></section>}><Profiles /></Suspense>
  </WorkspaceShell>;
}
