'use client';
import { PageHeading } from '@/components/PageHeading';
import { FileTextIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useConfirmAction } from '@/components/ConfirmAction';
import { lazy, Suspense } from 'react';
const ToggleGroup = lazy(() => import('@/components/ui/toggle-group').then((module) => ({ default: module.ToggleGroup })));
const ToggleGroupItem = lazy(() => import('@/components/ui/toggle-group').then((module) => ({ default: module.ToggleGroupItem })));
const CreateResumeDialog = lazy(() => import('./CreateResumeDialog').then((module) => ({ default: module.CreateResumeDialog })));
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldLabel } from '@/components/ui/field';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteResumeAction } from './actions';
export function ResumeList({ resumes, profileId = '', dashboard = false }: { resumes: { id: string; name: string; language: string; revision: string; profileName?: string; updatedAt?: string }[]; profileId?: string; dashboard?: boolean }) {
  const { confirm, confirmation } = useConfirmAction();
  const router = useRouter();
  const [query, setQuery] = useState(''), [filter, setFilter] = useState('all'), [creating, setCreating] = useState(false);
  const visible = resumes.filter((resume) => (filter === 'all' || (filter === 'profiles' ? Boolean(resume.profileName) : !resume.profileName)) && `${resume.name} ${resume.profileName ?? ''} ${resume.language === 'ar' ? 'Arabic' : 'English'}`.toLowerCase().includes(query.trim().toLowerCase()));
  const [status, setStatus] = useState(''), [busy, setBusy] = useState(false);
  const openCreate = () => { setStatus(''); setCreating(true); };
  return <><section className={dashboard ? 'resume-library' : 'editor-section'} aria-label="Resumes">
    {dashboard ? <Suspense fallback={<p role="status">Loading filters…</p>}><div className="library-heading"><div><PageHeading><h1>Resumes</h1><p>Create, tailor and organize your resumes.</p></PageHeading></div><Button variant="default" type="button" className="library-create" onClick={openCreate}><PlusIcon data-icon="inline-start" /> Create Resume</Button></div><div className="library-filters"><ToggleGroup aria-label="Filter resumes" value={[filter]} onValueChange={(values)=>{if(values[0])setFilter(values[0]);}}>{[{ id: 'all', name: 'All resumes', count: resumes.length }, { id: 'profiles', name: 'In profiles', count: resumes.filter((resume) => resume.profileName).length }, { id: 'unfiled', name: 'Unfiled', count: resumes.filter((resume) => !resume.profileName).length }].map((item) => <ToggleGroupItem key={item.id} value={item.id}>{item.name}<span>{item.count}</span></ToggleGroupItem>)}</ToggleGroup><Link prefetch={false} href="/profiles">Manage profiles</Link></div><FieldLabel className="library-search"><span className="sr-only">Search resumes</span><Input type="search" placeholder="Search by resume or profile" value={query} onChange={(event) => setQuery(event.target.value)} /></FieldLabel></Suspense> : <div className="section-title resume-section-heading"><h2>{resumes.length} Resumes</h2><Button type="button" onClick={openCreate}><PlusIcon data-icon="inline-start" />Create Resume</Button></div>}

    <p className={dashboard ? "sr-only" : "optional"}>Most recently edited first. Older Resumes without an edit date keep their existing order.</p>
    <ul className={`resume-list${profileId ? ' profile-resume-grid' : ''}`}>{visible.map((resume) => <li className="resume-list-item" key={resume.id}><Card className="resume-item-content">{dashboard ? <span className="library-document" aria-hidden="true"><FileTextIcon className="size-5" /></span> : null}<div className="library-card-content"><Link prefetch={false} className="resume-list-name" href={`/resumes/${resume.id}`}>{resume.name}</Link>{dashboard ? <p>Careery · {resume.profileName ?? 'Unfiled'}{resume.updatedAt ? ` · Edited ${new Date(resume.updatedAt).toLocaleDateString('en-GB', { timeZone: 'UTC' })}` : ''}</p> : null}</div> <Badge variant="secondary" className="resume-language">{resume.language === 'ar' ? 'Arabic' : 'English'}</Badge> <Button variant="destructive" size={profileId ? 'icon' : 'default'} aria-label={profileId ? `Delete Resume: ${resume.name}` : undefined} type="button" disabled={busy} className="danger" onClick={async () => {
      if (!await confirm(`Delete “${resume.name}”? This cannot be undone.`)) return;
      setBusy(true); const data = new FormData(); data.set('id', resume.id); data.set('_revision', resume.revision);
      try { const result = await deleteResumeAction(data); if (result.success) router.refresh(); else setStatus(result.error ?? 'Could not delete.'); }
      catch { setStatus('Could not delete. Retry.'); } finally { setBusy(false); }
    }}>{profileId ? <Trash2Icon aria-hidden="true" /> : 'Delete Resume'}</Button></Card></li>)}</ul>{visible.length === 0 ? <Empty role={dashboard ? 'status' : undefined}><EmptyHeader><EmptyTitle>{resumes.length ? 'No matching Resumes' : 'Your first Resume starts here'}</EmptyTitle><EmptyDescription>{resumes.length ? 'No resumes match your search and filter.' : 'Create your first Resume to get started.'}</EmptyDescription></EmptyHeader></Empty> : null}
    {status ? <p role="alert">{status}</p> : null}
  </section>
  {creating ? <Suspense fallback={null}><CreateResumeDialog profileId={profileId} onClose={() => setCreating(false)} /></Suspense> : null}
  {confirmation}</>;
}
