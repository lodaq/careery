'use client';
import { lazy, Suspense, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRightIcon, Trash2Icon } from 'lucide-react';
import { useConfirmAction } from '@/components/ConfirmAction';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { deleteProfileAction } from './actions';

const CreateProfileDialog = lazy(() => import('./CreateProfileDialog').then((module) => ({ default: module.CreateProfileDialog })));

export interface ProfileTile { id: string; name: string; entryCount: number; resumeCount: number; revision: string }
export function ProfileGrid({ profiles, unfiledCount }: { profiles: ProfileTile[]; unfiledCount: number }) {
  const { confirm, confirmation } = useConfirmAction();
  const id = useId();
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  async function remove(profile: ProfileTile) {
    if (pending.current || !await confirm(`Delete “${profile.name}”? ${profile.resumeCount} Resumes will move to Unfiled. Their content will be preserved.`)) return;
    pending.current = true; setBusy(true); setStatus('Deleting Profile…');
    const form = new FormData(); form.set('id', profile.id); form.set('_revision', profile.revision); form.set('resumeCount', String(profile.resumeCount));
    try {
      const result = await deleteProfileAction(form);
      if (result.success) { setStatus('Profile deleted. Its Resumes are in Unfiled.'); router.refresh(); }
      else setStatus(result.error ?? 'Could not delete the Profile. Retry.');
    } catch { setStatus('Could not delete the Profile. Retry.'); }
    finally { pending.current = false; setBusy(false); }
  }
  return <><section aria-labelledby={`${id}-title`} className="profile-workspace">
    <div className="section-title profiles-heading"><div><h1 id={`${id}-title`}>Profiles</h1><p>Organize your career directions and their Resumes.</p></div><div className="row-actions"><Link prefetch={false} className="plain-link" href="/unfiled">Unfiled ({unfiledCount})</Link><Button type="button" onClick={() => setCreating(true)}>Create Profile</Button></div></div>
    <p role="status" aria-live="polite">{status}</p>
    {profiles.length === 0 ? <Empty><EmptyHeader><EmptyTitle role="heading" aria-level={3}>No profiles yet</EmptyTitle><EmptyDescription>Create a Profile, then choose content from your Career Record.</EmptyDescription></EmptyHeader></Empty> : <div className="profile-grid">
      {profiles.map((profile) => <Card role="article" className="profile-tile" key={profile.id}>
      <CardHeader>
      <CardTitle><h3><Link prefetch={false} href={`/profiles/${profile.id}`}>{profile.name}</Link></h3></CardTitle>
      <CardDescription>{profile.entryCount} entries · {profile.resumeCount} Resumes</CardDescription></CardHeader>
      <CardFooter className="row-actions profile-actions"><Button variant="outline" render={<Link prefetch={false} href={`/profiles/${profile.id}`} />} nativeButton={false}>Edit Profile<ArrowUpRightIcon data-icon="inline-end" /></Button><Button variant="ghost" size="icon" type="button" disabled={busy} onClick={() => { void remove(profile); }} aria-label={`Delete ${profile.name}`}><Trash2Icon aria-hidden="true" /></Button></CardFooter>
      </Card>)}
    </div>}
  </section>
  {creating ? <Suspense fallback={null}><CreateProfileDialog id={id} onClose={() => setCreating(false)} /></Suspense> : null}
  {confirmation}</>;
}
