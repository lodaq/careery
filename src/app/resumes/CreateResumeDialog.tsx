'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldLabel } from '@/components/ui/field';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { createResumeAction } from './actions';

export function CreateResumeDialog({ profileId, onClose }: { profileId: string; onClose: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  async function create(form: HTMLFormElement) {
    if (busy) return;
    setBusy(true); setStatus('');
    try {
      const result = await createResumeAction(new FormData(form));
      if (result.id) router.push(`/resumes/${result.id}`);
      else setStatus(result.error ?? 'Could not create.');
    } catch { setStatus('Could not create. Retry.'); }
    finally { setBusy(false); }
  }
  return <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
    <DialogContent className="resume-create-dialog" showCloseButton={!busy}>
      <DialogHeader><DialogTitle>Create Resume</DialogTitle><DialogDescription>{profileId ? 'Starts with an independent copy of this Profile.' : 'Starts with your contact details and no selected entries.'}</DialogDescription></DialogHeader>
      <form className="resume-create-form" onSubmit={(event) => { event.preventDefault(); void create(event.currentTarget); }}>
        <input type="hidden" name="profileId" value={profileId} />
        <FieldLabel>New Resume name<Input name="name" required maxLength={100} /></FieldLabel>
        {status ? <p role="alert">{status}</p> : null}
        <DialogFooter><DialogClose render={<Button variant="outline" type="button" disabled={busy} />}>Cancel</DialogClose><Button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create Resume'}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
