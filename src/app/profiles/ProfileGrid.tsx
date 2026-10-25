'use client';
import Link from 'next/link';
import { useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProfileAction, deleteProfileAction } from './actions';

export interface ProfileTile { id: string; name: string; entryCount: number; resumeCount: number; revision: string }
export function ProfileGrid({ profiles, unfiledCount }: { profiles: ProfileTile[]; unfiledCount: number }) {
  const id = useId();
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  async function create(form: HTMLFormElement) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setStatus('Creating Profile…');
    try {
      const result = await createProfileAction(new FormData(form));
      if (result.id) { form.reset(); setStatus('Profile created.'); router.push(`/profiles/${result.id}`); }
      else setStatus(result.error ?? 'Could not create the Profile. Retry.');
    } catch { setStatus('Could not create the Profile. Your name is still here. Retry.'); }
    finally { pending.current = false; setBusy(false); }
  }
  async function remove(profile: ProfileTile) {
    if (pending.current || !window.confirm(`Delete “${profile.name}”? ${profile.resumeCount} Resumes will move to Unfiled. Their content will be preserved.`)) return;
    pending.current = true; setBusy(true); setStatus('Deleting Profile…');
    const form = new FormData(); form.set('id', profile.id); form.set('_revision', profile.revision); form.set('resumeCount', String(profile.resumeCount));
    try {
      const result = await deleteProfileAction(form);
      if (result.success) { setStatus('Profile deleted. Its Resumes are in Unfiled.'); router.refresh(); }
      else setStatus(result.error ?? 'Could not delete the Profile. Retry.');
    } catch { setStatus('Could not delete the Profile. Retry.'); }
    finally { pending.current = false; setBusy(false); }
  }
  return <section aria-labelledby={`${id}-title`} className="profile-workspace">
    <div className="section-title"><div><h2 id={`${id}-title`}>Your Profiles</h2><p>A separate starting point for each career direction.</p></div><Link className="plain-link" href="/unfiled">Unfiled ({unfiledCount})</Link></div>
    <form className="profile-create" onSubmit={(event) => { event.preventDefault(); void create(event.currentTarget); }}>
      <label htmlFor={`${id}-name`}>New Profile name<input id={`${id}-name`} name="name" required maxLength={100} autoComplete="off" placeholder="Web developer…" /></label>
      <button type="submit" disabled={busy}>Create Profile</button>
    </form>
    <p role="status" aria-live="polite">{status}</p>
    {profiles.length === 0 ? <div className="profile-empty"><h3>No profiles yet</h3><p>Create a Profile, then choose content from your Career Record.</p></div> : <div className="profile-grid">
      {profiles.map((profile) => <article className="profile-tile" key={profile.id}>
        <h3><Link href={`/profiles/${profile.id}`}>{profile.name}</Link></h3>
        <p>{profile.entryCount} entries · {profile.resumeCount} Resumes</p>
        <div className="row-actions"><Link className="plain-link" href={`/profiles/${profile.id}`}>Edit Profile</Link><button type="button" disabled={busy} onClick={() => { void remove(profile); }} aria-label={`Delete ${profile.name}`}>Delete</button></div>
      </article>)}
    </div>}
  </section>;
}
