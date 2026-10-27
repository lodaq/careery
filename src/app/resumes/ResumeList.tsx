'use client';
import { FileTextIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useConfirmAction } from '@/components/ConfirmAction';
import { lazy, Suspense } from 'react';
const ToggleGroup = lazy(() => import('@/components/ui/toggle-group').then((module) => ({ default: module.ToggleGroup })));
const ToggleGroupItem = lazy(() => import('@/components/ui/toggle-group').then((module) => ({ default: module.ToggleGroupItem })));
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldLabel } from '@/components/ui/field';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { createResumeAction, deleteResumeAction } from './actions';
export function ResumeList({ resumes, profileId = '', dashboard = false }: { resumes: { id: string; name: string; language: string; revision: string; profileName?: string; updatedAt?: string }[]; profileId?: string; dashboard?: boolean }) {
  const { confirm, confirmation } = useConfirmAction();
  const router = useRouter();
  const formId = useId();
  const [query, setQuery] = useState(''), [filter, setFilter] = useState('all'), [creating, setCreating] = useState(false);
  const visible = resumes.filter((resume) => (filter === 'all' || (filter === 'profiles' ? Boolean(resume.profileName) : !resume.profileName)) && `${resume.name} ${resume.profileName ?? ''} ${resume.language === 'ar' ? 'Arabic' : 'English'}`.toLowerCase().includes(query.trim().toLowerCase()));
  const [status, setStatus] = useState(''), [busy, setBusy] = useState(false);
  return <><Dialog open={creating} onOpenChange={(open) => { if (!busy) { setCreating(open); setStatus(''); } }}><section className={dashboard ? 'resume-library' : 'editor-section'} aria-label="Resumes">
    {dashboard ? <Suspense fallback={<p role="status">Loading filters…</p>}><div className="library-heading"><div><h1>Resumes</h1><p>Create, tailor and organize your resumes.</p></div><DialogTrigger render={<Button variant="default" type="button" className="library-create" />}><PlusIcon data-icon="inline-start" /> Create Resume</DialogTrigger></div><div className="library-filters"><ToggleGroup aria-label="Filter resumes" value={[filter]} onValueChange={(values)=>{if(values[0])setFilter(values[0]);}}>{[{ id: 'all', name: 'All resumes', count: resumes.length }, { id: 'profiles', name: 'In profiles', count: resumes.filter((resume) => resume.profileName).length }, { id: 'unfiled', name: 'Unfiled', count: resumes.filter((resume) => !resume.profileName).length }].map((item) => <ToggleGroupItem key={item.id} value={item.id}>{item.name}<span>{item.count}</span></ToggleGroupItem>)}</ToggleGroup><Link prefetch={false} href="/profiles">Manage profiles</Link></div><FieldLabel className="library-search"><span className="sr-only">Search resumes</span><Input type="search" placeholder="Search by resume or profile" value={query} onChange={(event) => setQuery(event.target.value)} /></FieldLabel></Suspense> : <div className="section-title resume-section-heading"><h2>{resumes.length} Resumes</h2><DialogTrigger render={<Button type="button" />}><PlusIcon data-icon="inline-start" />Create Resume</DialogTrigger></div>}

    <DialogContent className="resume-create-dialog" showCloseButton={!busy}><DialogHeader><DialogTitle>Create Resume</DialogTitle><DialogDescription>{profileId ? 'Starts with an independent copy of this Profile.' : 'Starts with your contact details and no selected entries.'}</DialogDescription></DialogHeader><form id={formId} className="resume-create-form" onSubmit={async (event) => {
      event.preventDefault(); if (busy) return;
      const data = new FormData(event.currentTarget); setBusy(true);
      try { const result = await createResumeAction(data); if (result.id) { setCreating(false); router.push(`/resumes/${result.id}`); } else setStatus(result.error ?? 'Could not create.'); }
      catch { setStatus('Could not create. Retry.'); } finally { setBusy(false); }
    }}><input type="hidden" name="profileId" value={profileId} /><FieldLabel>New Resume name<Input name="name" required maxLength={100} /></FieldLabel>{status ? <p role="alert">{status}</p> : null}<DialogFooter><DialogClose render={<Button variant="outline" type="button" disabled={busy} />}>Cancel</DialogClose><Button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create Resume'}</Button></DialogFooter></form></DialogContent>
    <p className={dashboard ? "sr-only" : "optional"}>Most recently edited first. Older Resumes without an edit date keep their existing order.</p>
    <ul className={`resume-list${profileId ? ' profile-resume-grid' : ''}`}>{visible.map((resume) => <li className="resume-list-item" key={resume.id}><Card className="resume-item-content">{dashboard ? <span className="library-document" aria-hidden="true"><FileTextIcon className="size-5" /></span> : null}<div className="library-card-content"><Link prefetch={false} className="resume-list-name" href={`/resumes/${resume.id}`}>{resume.name}</Link>{dashboard ? <p>Careery · {resume.profileName ?? 'Unfiled'}{resume.updatedAt ? ` · Edited ${new Date(resume.updatedAt).toLocaleDateString('en-GB', { timeZone: 'UTC' })}` : ''}</p> : null}</div> <Badge variant="secondary" className="resume-language">{resume.language === 'ar' ? 'Arabic' : 'English'}</Badge> <Button variant="destructive" size={profileId ? 'icon' : 'default'} aria-label={profileId ? `Delete Resume: ${resume.name}` : undefined} type="button" disabled={busy} className="danger" onClick={async () => {
      if (!await confirm(`Delete “${resume.name}”? This cannot be undone.`)) return;
      setBusy(true); const data = new FormData(); data.set('id', resume.id); data.set('_revision', resume.revision);
      try { const result = await deleteResumeAction(data); if (result.success) router.refresh(); else setStatus(result.error ?? 'Could not delete.'); }
      catch { setStatus('Could not delete. Retry.'); } finally { setBusy(false); }
    }}>{profileId ? <Trash2Icon aria-hidden="true" /> : 'Delete Resume'}</Button></Card></li>)}</ul>{visible.length === 0 ? <Empty role={dashboard ? 'status' : undefined}><EmptyHeader><EmptyTitle>{resumes.length ? 'No matching Resumes' : 'Your first Resume starts here'}</EmptyTitle><EmptyDescription>{resumes.length ? 'No resumes match your search and filter.' : 'Create your first Resume to get started.'}</EmptyDescription></EmptyHeader></Empty> : null}
  </section></Dialog>{confirmation}</>;
}
