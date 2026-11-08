'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DownloadIcon, UploadIcon } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useConfirmAction } from '@/components/ConfirmAction';
import { cn } from '@/lib/utils';

export function DataSettings() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const { confirm, confirmation } = useConfirmAction();

  async function restore(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const file = input.current?.files?.[0];
    if (!file || busy) return;
    if (!await confirm('Replace only the data files included in this backup? Other current data files will be left unchanged. A copy of the current data is saved before restoring.', { title: 'Restore backup', action: 'Restore' })) return;
    setBusy(true); setStatus(''); setError('');
    try {
      const response = await fetch('/api/backup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: await file.text() });
      const result = await response.json() as { restored?: string[]; snapshot?: string | null; error?: string };
      if (!response.ok || !result.restored) setError(result.error ?? 'Could not restore this backup.');
      else {
        setStatus(`Restored ${result.restored.length} data ${result.restored.length === 1 ? 'file' : 'files'}.${result.snapshot ? ' The previous data was saved in data/backups.' : ''}`);
        form.reset();
        router.refresh();
      }
    } catch { setError('Could not restore this backup. Check the file and retry.'); }
    finally { setBusy(false); }
  }

  return <>
    <p className="optional">Your Career Record, Profiles, Resumes, applications and interview questions live in <code>data/</code> on this machine. Download a backup before restoring or moving to another computer. Backup files contain personal career information, so keep them somewhere safe.</p>
    <div className="settings-actions">
      <a className={cn(buttonVariants({ variant: 'outline' }))} href="/api/backup" download>
        <DownloadIcon data-icon="inline-start" aria-hidden="true" />Download backup
      </a>
      <form onSubmit={restore} className="settings-restore">
        <label htmlFor="backup-file" className="text-sm font-medium">Restore a backup</label>
        <input ref={input} id="backup-file" name="backup" type="file" accept="application/json,.json" required disabled={busy} className="settings-file" />
        <Button type="submit" variant="outline" disabled={busy}>
          <UploadIcon data-icon="inline-start" aria-hidden="true" />{busy ? 'Restoring…' : 'Restore backup'}
        </Button>
      </form>
    </div>
    {status ? <p role="status" className="text-sm">{status}</p> : null}
    {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    {confirmation}
  </>;
}
