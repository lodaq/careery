'use client';
import { useConfirmAction } from '@/components/ConfirmAction';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { ArrowUpRightIcon, Trash2Icon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldLabel } from '@/components/ui/field';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

import Link from 'next/link';
import { useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProfileAction, deleteProfileAction } from './actions';

export interface ProfileTile { id: string; name: string; entryCount: number; resumeCount: number; revision: string }
export function ProfileGrid({ profiles, unfiledCount }: { profiles: ProfileTile[]; unfiledCount: number }) {
  const { confirm, confirmation } = useConfirmAction();
  const id = useId();
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  async function create(form: HTMLFormElement) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setStatus('Creating Profile…');
    try {
      const result = await createProfileAction(new FormData(form));
      if (result.id) { form.reset(); setCreating(false); setStatus('Profile created.'); router.push(`/profiles/${result.id}`); }
      else setStatus(result.error ?? 'Could not create the Profile. Retry.');
    } catch { setStatus('Could not create the Profile. Your name is still here. Retry.'); }
    finally { pending.current = false; setBusy(false); }
  }
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
    <Dialog open={creating} onOpenChange={(open) => { if (!busy) setCreating(open); }}>
    <div className="section-title profiles-heading"><div><h1 id={`${id}-title`}>Profiles</h1><p>Organize your career directions and their Resumes.</p></div><div className="row-actions"><Link prefetch={false} className="plain-link" href="/unfiled">Unfiled ({unfiledCount})</Link><DialogTrigger render={<Button type="button" />}>Create Profile</DialogTrigger></div></div>
    <DialogContent showCloseButton={!busy}><DialogHeader><DialogTitle>Create Profile</DialogTitle><DialogDescription>A separate starting point for a career direction.</DialogDescription></DialogHeader>
    <form className="resume-create-form" onSubmit={(event) => { event.preventDefault(); void create(event.currentTarget); }}>
      <FieldLabel htmlFor={`${id}-name`}>New Profile name<Input id={`${id}-name`} name="name" required maxLength={100} autoComplete="off" placeholder="Web developer…" /></FieldLabel>
      {status.startsWith('Could not') ? <p role="alert">{status}</p> : null}
      <DialogFooter><DialogClose render={<Button variant="outline" type="button" disabled={busy} />}>Cancel</DialogClose><Button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create Profile'}</Button></DialogFooter>
    </form></DialogContent></Dialog>
    <p role="status" aria-live="polite">{status}</p>
    {profiles.length === 0 ? <Empty><EmptyHeader><EmptyTitle role="heading" aria-level={3}>No profiles yet</EmptyTitle><EmptyDescription>Create a Profile, then choose content from your Career Record.</EmptyDescription></EmptyHeader></Empty> : <TooltipProvider delay={120}><div className="profile-grid">
      {profiles.map((profile) => <Card role="article" className="profile-tile" key={profile.id}>
      <CardHeader>
      <CardTitle><h3><Link prefetch={false} href={`/profiles/${profile.id}`}>{profile.name}</Link></h3></CardTitle>
      <CardDescription>{profile.entryCount} entries · {profile.resumeCount} Resumes</CardDescription></CardHeader>
      <CardFooter className="row-actions profile-actions"><Button variant="outline" render={<Link prefetch={false} href={`/profiles/${profile.id}`} />} nativeButton={false}>Edit Profile<ArrowUpRightIcon data-icon="inline-end" /></Button><Tooltip><TooltipTrigger render={<Button variant="ghost" size="icon" type="button" disabled={busy} onClick={() => { void remove(profile); }} aria-label={`Delete ${profile.name}`} />}><Trash2Icon aria-hidden="true" /></TooltipTrigger><TooltipContent>Delete Profile</TooltipContent></Tooltip></CardFooter>
      </Card>)}
    </div></TooltipProvider>}
  </section>{confirmation}</>;
}
