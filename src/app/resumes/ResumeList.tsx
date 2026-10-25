'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createResumeAction, deleteResumeAction } from './actions';
export function ResumeList({ resumes, profileId = '' }: { resumes: { id: string; name: string; language: string; revision: string }[]; profileId?: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(''), [busy, setBusy] = useState(false);
  return <section className="editor-section" aria-label="Resumes"><h2>{resumes.length} Resumes</h2>
    <form className="resume-create" onSubmit={async (event) => {
      event.preventDefault(); if (busy) return;
      const data = new FormData(event.currentTarget); setBusy(true);
      try { const result = await createResumeAction(data); if (result.id) router.push(`/resumes/${result.id}`); else setStatus(result.error ?? 'Could not create.'); }
      catch { setStatus('Could not create. Retry.'); } finally { setBusy(false); }
    }}><input type="hidden" name="profileId" value={profileId} /><label>New Resume name<input name="name" required maxLength={100} /></label><button disabled={busy}>Create Resume</button><p>{profileId ? 'Starts with an independent copy of this Profile.' : 'Starts with your contact details and no selected entries.'}</p></form>
    {status ? <p role="status">{status}</p> : null}
    <p className="optional">Most recently edited first. Older Resumes without an edit date keep their existing order.</p>
    <ul className="resume-list">{resumes.map((resume) => <li className="resume-list-item" key={resume.id}><Link className="resume-list-name" href={`/resumes/${resume.id}`}>{resume.name}</Link> <span className="resume-language">{resume.language === 'ar' ? 'Arabic' : 'English'}</span> <button type="button" disabled={busy} className="danger" onClick={async () => {
      if (!window.confirm(`Delete “${resume.name}”? This cannot be undone.`)) return;
      setBusy(true); const data = new FormData(); data.set('id', resume.id); data.set('_revision', resume.revision);
      try { const result = await deleteResumeAction(data); if (result.success) router.refresh(); else setStatus(result.error ?? 'Could not delete.'); }
      catch { setStatus('Could not delete. Retry.'); } finally { setBusy(false); }
    }}>Delete Resume</button></li>)}</ul>
  </section>;
}
