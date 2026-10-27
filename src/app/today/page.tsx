import Link from 'next/link';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { readApplications } from '../applications/application-data';
import { cairoDate, closedStatuses } from '../applications/application-types';
import { ItemAction } from '../applications/ApplicationItems';
import '../applications/applications.css';
export const metadata = { title: 'Today · Careery' };
async function Today() {
  await connection(); const now = new Date(); const today = cairoDate(now); const end = cairoDate(new Date(now.getTime() + 7 * 86400000));
  const apps = (await readApplications()).applications.filter((app) => !app.archived && !closedStatuses.includes(app.status));
  const tasks = apps.flatMap((app) => app.tasks.filter((task) => !task.completedAt).map((task) => ({ app, task }))).sort((a, b) => (a.task.due || '9999').localeCompare(b.task.due || '9999'));
  const deadlines = apps.flatMap((app) => [ { title: 'Application deadline', due: app.status === 'Saved' ? app.details.deadline : '' }, { title: 'Offer response', due: app.status === 'Offer' ? app.details.offerDeadline : '' }, ...app.interviews.filter((item) => item.kind === 'Assessment' && (!item.state || item.state === 'Scheduled')).map((item) => ({ title: item.title, due: item.deadline })) ].filter((item) => item.due && item.due <= end).map((item) => ({ ...item, app }))).sort((a, b) => a.due!.localeCompare(b.due!));
  const interviews = apps.flatMap((app) => app.interviews.filter((item) => item.kind === 'Interview' && (!item.state || item.state === 'Scheduled') && item.at >= now.toISOString() && cairoDate(new Date(item.at)) <= end).map((item) => ({ app, item }))).sort((a, b) => a.item.at.localeCompare(b.item.at));
  return <><div className="section-title"><div><h1>Today</h1><p>{new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeZone: 'Africa/Cairo' }).format(now)} · Cairo</p></div><Link prefetch={false} href="/applications">All applications →</Link></div>
    {['Overdue', 'Today', 'Upcoming tasks', 'Undated tasks'].map((group) => { const items = tasks.filter(({ task }) => group === 'Overdue' ? task.due && task.due < today : group === 'Today' ? task.due === today : group === 'Undated tasks' ? !task.due : task.due > today && task.due <= end); return <section className="application-section" key={group}><h2>{group} <span className="text-muted-foreground">({items.length})</span></h2>{items.length ? <ul className="application-items">{items.map(({ app, task }) => <li key={task.id}><div className="application-item-heading"><div><Link prefetch={false} href={`/applications/${app.id}`} className="application-name">{task.title}<span>{app.company} · {app.role}</span></Link><p className="application-meta">{task.due || 'No due date'}</p></div><ItemAction app={{ id: app.id, revision: app.revision }} operation="toggleTask" values={{ itemId: task.id }} label="Complete" icon="check" /></div></li>)}</ul> : <p className="text-muted-foreground">No {group.toLowerCase()}.</p>}</section>; })}
    <section className="application-section"><h2>Interviews · next 7 days</h2>{interviews.length ? <ul className="application-items">{interviews.map(({ app, item }) => <li key={item.id}><Link prefetch={false} className="application-name" href={`/applications/${app.id}`}>{item.title}<span>{app.company} · {app.role}</span></Link><time dateTime={item.at}>{new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Cairo' }).format(new Date(item.at))} Cairo</time></li>)}</ul> : <p className="text-muted-foreground">No interviews in the next 7 days.</p>}</section>
    <section className="application-section"><h2>Deadlines · overdue & next 7 days</h2>{deadlines.length ? <ul className="application-items">{deadlines.map(({ app, title, due }, index) => <li key={`${app.id}-${index}`}><Link prefetch={false} className="application-name" href={`/applications/${app.id}`}>{title}<span>{app.company} · {app.role}</span></Link><p>{due}{due! < today ? ' · Overdue' : ''}</p></li>)}</ul> : <p className="text-muted-foreground">No approaching deadlines.</p>}</section>
  </>;
}
export default function TodayPage() { return <WorkspaceShell><Suspense fallback={<p role="status">Loading today…</p>}><Today /></Suspense></WorkspaceShell>; }
