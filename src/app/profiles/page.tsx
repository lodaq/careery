import { Suspense } from 'react';
import { connection } from 'next/server';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { readWorkspace } from '@/lib/storage';
import { ProfileGrid } from './ProfileGrid';
import { profileRevision } from './profile-data';
async function Profiles() {
  await connection();
  const workspace = await readWorkspace();
  const profiles = workspace.profiles.map((profile) => ({ id: profile.id, name: profile.name, entryCount: profile.entries.length, resumeCount: workspace.resumes.filter((resume) => resume.profileId === profile.id).length, revision: profileRevision(profile) }));
  return <ProfileGrid profiles={profiles} unfiledCount={workspace.resumes.filter((resume) => resume.profileId === null).length} />;
}
export default function ProfilesPage() {
  return <WorkspaceShell contentId="profiles-content"><Suspense fallback={<p role="status">Loading your Profiles…</p>}><Profiles /></Suspense></WorkspaceShell>;
}
