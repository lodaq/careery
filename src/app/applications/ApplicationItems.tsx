'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon, RotateCcwIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useConfirmAction } from '@/components/ConfirmAction';
import { applicationAction } from './actions';
import type { ApplicationSummary, Contact, Interview } from './application-types';
import { ApplicationForm, AppField } from './ApplicationForm';

export function ItemAction({ app, operation, values = {}, label, destructive = false, icon = 'delete' }: { app: Pick<ApplicationSummary, 'id' | 'revision'>; operation: string; values?: Record<string, string>; label: string; destructive?: boolean; icon?: 'delete' | 'check' | 'restore' }) {
  const router = useRouter(); const [pending, setPending] = useState(false); const [error, setError] = useState(''); const { confirm, confirmation } = useConfirmAction();
  const Icon = icon === 'check' ? CheckIcon : icon === 'restore' ? RotateCcwIcon : Trash2Icon;
  return <><Button type="button" variant={destructive ? 'destructive' : 'outline'} disabled={pending} onClick={async () => {
    if (destructive && !await confirm(`${label}? This cannot be undone.`)) return;
    setPending(true); try { const form = new FormData(); Object.entries(values).forEach(([key, value]) => form.set(key, value)); const result = await applicationAction(app.id, app.revision, operation, form); setError(result.error ?? ''); if (!result.error) { if (operation === 'delete') router.push('/applications'); router.refresh(); } } catch { setError('Could not save. Please retry.'); } finally { setPending(false); }
  }}><Icon aria-hidden="true" />{label}</Button>{error && <p role="alert" className="text-destructive">{error}</p>}{confirmation}</>;
}
export function Tasks({ app }: { app: ApplicationSummary }) {
  return <section className="application-section"><h2>Tasks</h2>{app.tasks.length ? <ul className="application-items">{[...app.tasks].sort((a, b) => Number(Boolean(a.completedAt)) - Number(Boolean(b.completedAt)) || (a.due || '9999').localeCompare(b.due || '9999')).map((task) => <li key={task.id}><div className="application-item-heading"><div><h3>{task.completedAt ? <s>{task.title}</s> : task.title}</h3><p className="application-meta">{task.due || 'No due date'}{task.completedAt ? ' · Complete' : ''}</p></div><div className="application-item-actions"><ItemAction app={app} operation="toggleTask" values={{ itemId: task.id }} label={task.completedAt ? 'Reopen' : 'Complete'} icon={task.completedAt ? 'restore' : 'check'} /><ItemAction app={app} operation="removeItem" values={{ collection: 'tasks', itemId: task.id }} label="Delete task" destructive /></div></div><EditTask app={app} task={task} /></li>)}</ul> : <p>No tasks yet.</p>}
    <ApplicationForm id={app.id} revision={app.revision} operation="task" label="Add task" reset><div className="application-fields"><AppField name="title" label="Task" required /><AppField name="due" label="Due date" type="date" /></div></ApplicationForm>
  </section>;
}
export function EditTask({ app, task }: { app: ApplicationSummary; task: ApplicationSummary['tasks'][number] }) {
  return <Collapsible><CollapsibleTrigger className="application-disclosure">Edit task</CollapsibleTrigger><CollapsibleContent><ApplicationForm id={app.id} revision={app.revision} operation="task" label="Save task"><input name="itemId" type="hidden" value={task.id} /><div className="application-fields"><AppField name="title" label="Task title" value={task.title} required /><AppField name="due" label="Task due date" type="date" value={task.due} /></div></ApplicationForm></CollapsibleContent></Collapsible>;
}
export function EditContact({ app, contact }: { app: ApplicationSummary; contact: Contact }) {
  return <Collapsible><CollapsibleTrigger className="application-disclosure">Edit contact</CollapsibleTrigger><CollapsibleContent><ApplicationForm id={app.id} revision={app.revision} operation="contact" label="Save contact"><input name="itemId" type="hidden" value={contact.id} /><div className="application-fields"><AppField name="name" label="Contact name" value={contact.name} required /><AppField name="contactRole" label="Contact role" value={contact.role} /><AppField name="email" label="Email" type="email" value={contact.email} /><AppField name="phone" label="Phone" value={contact.phone} /><AppField name="linkedin" label="LinkedIn URL" type="url" value={contact.linkedin} /><AppField name="relationship" label="Relationship" value={contact.relationship} /></div></ApplicationForm></CollapsibleContent></Collapsible>;
}
export function InterviewForm({ app, item }: { app: ApplicationSummary; item?: Interview }) {
  const localAt = item?.at ? new Date(Date.parse(item.at) - new Date(item.at).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';
  return <ApplicationForm id={app.id} revision={app.revision} operation="interview" label={item ? 'Save round' : 'Add round'} reset={!item}>
    {item && <input type="hidden" name="itemId" value={item.id} />}
    <div className="application-fields"><AppField name="kind" label="Type" options={['Interview', 'Assessment']} value={item?.kind || 'Interview'} /><AppField name="title" label="Round / assessment title" required value={item?.title} /><AppField name="state" label="Round state" options={['Scheduled', 'Completed', 'Cancelled']} value={item?.state || 'Scheduled'} />
      <AppField name="at" label="Scheduled time (your device timezone)" type="datetime-local" value={localAt} /><AppField name="timezone" label="Interviewer timezone (IANA)" value={item?.timezone || 'Africa/Cairo'} />
      <AppField name="duration" label="Duration" value={item?.duration} /><AppField name="interviewers" label="Interviewers" value={item?.interviewers} />
      <AppField name="location" label="Meeting link / location" value={item?.location} /><AppField name="deadline" label="Assessment deadline" type="date" value={item?.deadline} />
      {(['preparation', 'questions', 'feedback', 'result'] as const).map((key) => <AppField key={key} name={key} label={{ preparation: 'Preparation / instructions', questions: 'Questions asked', feedback: 'Feedback', result: 'Result / submission link' }[key]} value={item?.[key]} multiline />)}
    </div>
  </ApplicationForm>;
}
export function UploadDocument({ app }: { app: ApplicationSummary }) {
  const router = useRouter(); const [pending, setPending] = useState(false); const [error, setError] = useState('');
  return <form className="application-form" onSubmit={async (event) => {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); data.set('revision', String(app.revision)); const file = data.get('file');
    if (!(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024) { setError('Choose a file under 5 MB.'); return; }
    setPending(true); setError(''); try { const response = await fetch(`/api/applications/${app.id}/documents`, { method: 'POST', body: data }); if (!response.ok) { const result = await response.json(); setError(result.error || 'Upload failed. Please retry.'); } else { form.reset(); router.refresh(); } } catch { setError('Upload failed. Please retry.'); } finally { setPending(false); }
  }}><Label htmlFor="document-file">Attachment (up to 5 MB)</Label><Input id="document-file" name="file" type="file" required disabled={pending} /><div className="application-form-actions"><Button type="submit" disabled={pending}><UploadIcon aria-hidden="true" />{pending ? 'Uploading…' : 'Upload attachment'}</Button>{error && <p role="alert" className="text-destructive">{error}</p>}</div></form>;
}
