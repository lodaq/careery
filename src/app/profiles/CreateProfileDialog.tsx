'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldLabel } from '@/components/ui/field';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { createProfileAction } from './actions';

export function CreateProfileDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  async function create(form: HTMLFormElement) {
    if (busy) return;
    setBusy(true); setStatus('Creating Profile…');
    try {
      const result = await createProfileAction(new FormData(form));
      if (result.id) { form.reset(); router.push(`/profiles/${result.id}`); }
      else setStatus(result.error ?? 'Could not create the Profile. Retry.');
    } catch { setStatus('Could not create the Profile. Your name is still here. Retry.'); }
    finally { setBusy(false); }
  }
  return <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
    <DialogContent showCloseButton={!busy}>
      <DialogHeader><DialogTitle>Create Profile</DialogTitle><DialogDescription>A separate starting point for a career direction.</DialogDescription></DialogHeader>
      <form className="resume-create-form" onSubmit={(event) => { event.preventDefault(); void create(event.currentTarget); }}>
        <FieldLabel htmlFor={`${id}-name`}>New Profile name<Input id={`${id}-name`} name="name" required maxLength={100} autoComplete="off" placeholder="Web developer…" /></FieldLabel>
        {status.startsWith('Could not') ? <p role="alert">{status}</p> : null}
        <DialogFooter><DialogClose render={<Button variant="outline" type="button" disabled={busy} />}>Cancel</DialogClose><Button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create Profile'}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
