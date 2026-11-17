import { Suspense } from 'react';
import { connection } from 'next/server';
import { PageHeading } from '@/components/PageHeading';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { categories } from './job-data';
import { readJobFeed } from './feed';

export const metadata = { title: 'Jobs', description: 'Discover software engineering and teaching jobs eligible for Egypt or worldwide remote work.', robots: { index: false, follow: false } };

async function Feed({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q.slice(0, 200) : '';
  const category = typeof params.category === 'string' && categories.includes(params.category as typeof categories[number]) ? params.category : '';
  let feed;
  try { feed = await readJobFeed(); } catch { return <section role="status"><h2>Jobs couldn’t be loaded</h2><p>The job source is unavailable. Try again shortly.</p><Button render={<a href="/jobs" />}>Try again</Button></section>; }
  const jobs = feed.jobs.filter(j => (!category || j.category === category) && `${j.title} ${j.company}`.toLowerCase().includes(q.toLowerCase()));
  return <div className="max-w-4xl space-y-6">
    <search><form action="/jobs" method="get" className="flex flex-wrap items-end gap-3">
      <div className="min-w-0 flex-1 space-y-2"><Label htmlFor="job-search">Role or company</Label><Input id="job-search" name="q" type="search" defaultValue={q} maxLength={200} /></div>
      <div className="space-y-2"><Label htmlFor="job-category">Category</Label><NativeSelect id="job-category" name="category" defaultValue={category}><NativeSelectOption value="">All categories</NativeSelectOption>{categories.map(c => <NativeSelectOption key={c} value={c}>{c}</NativeSelectOption>)}</NativeSelect></div>
      <Button type="submit">Filter jobs</Button>
    </form></search>
    <p className="text-sm text-muted-foreground">{jobs.length} matching jobs · Last checked {new Date(feed.checkedAt).toLocaleString('en-GB', { timeZone: 'UTC' })} UTC. Checks hourly when opened; cached results may appear during refresh.</p>
    {jobs.length ? <ul className="m-0 list-none divide-y divide-border border-y border-border p-0">{jobs.map(job => <li key={job.id} className="space-y-2 py-5">
      <h2 className="m-0 break-words text-lg"><a className="plain-link text-primary underline-offset-4 hover:underline" href={job.url}>{job.title}</a></h2>
      <p className="m-0 break-words">{job.company}</p>
      <p className="m-0 text-sm text-muted-foreground">{job.category} · Remote: {job.location} · Posted <time dateTime={job.published}>{job.published.slice(0, 10)}</time></p>
      <a className="plain-link text-sm text-primary underline-offset-4 hover:underline" href={job.url}>View job on Jobicy</a>
    </li>)}</ul> : <section><h2>No matching jobs right now</h2><p>Try another role or category, or check back after the next update. Jobs with unclear location eligibility are excluded.</p></section>}
  </div>;
}

export default function JobsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <WorkspaceShell contentId="jobs-content"><PageHeading><h1>Jobs</h1><p>Software engineering and teaching opportunities for Egypt or worldwide remote work.</p></PageHeading>
    <p className="max-w-prose text-sm text-muted-foreground">Powered by <a href="https://jobicy.com" className="plain-link text-primary underline">Jobicy</a>. Recent remote listings from the last seven days, available after a three-hour source delay. Egypt on-site jobs aren’t covered yet. Confirm eligibility and availability on the original listing.</p>
    <Suspense fallback={<p role="status">Loading jobs…</p>}><Feed searchParams={searchParams} /></Suspense>
  </WorkspaceShell>;
}
