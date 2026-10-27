import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { readRecord, readWorkspace } from '@/lib/storage';
import { templates } from '../resumes/appearance';
import { analyzeWorkspace } from './analytics-data';
import { LazyAnalyticsCharts } from './LazyAnalyticsCharts';
import { RefreshAnalytics } from './RefreshAnalytics';
import './analytics.css';
import { readApplications } from '../applications/application-data';
import { ApplicationAnalytics } from './ApplicationAnalytics';

export const metadata = { title: 'Analytics · Careery' };
const percent = (count: number, total: number) => total ? `${Math.round(count / total * 100)}%` : '—';

async function Analytics() {
  await connection();
  const [record, workspace, applications] = await Promise.all([readRecord(), readWorkspace(), readApplications()]);
  const data = analyzeWorkspace(record, workspace);
  const arabic = data.resumes.filter((resume) => resume.language === 'ar').length;
  const unfiled = workspace.resumes.filter((resume) => resume.profileId === null).length;
  const recent = data.resumes.filter((resume) => resume.updatedAt).sort((a, b) => Date.parse(b.updatedAt!) - Date.parse(a.updatedAt!)).slice(0, 5);
  const attention = data.resumes.filter((resume) => resume.issues.length || (resume.language === 'ar' && resume.missingArabic));
  return <>
    <div className="section-title analytics-heading"><div><h1>Analytics</h1><p>Your saved workspace, at a glance. Everything here stays on your machine.</p></div><div className="row-actions"><Link href="#analytics-charts">View charts</Link><RefreshAnalytics /></div></div>
    <ApplicationAnalytics applications={applications.applications} />
    <dl className="analytics-totals">
      {[[record.entries.length, 'Career Record entries', '/career-record'], [workspace.profiles.length, 'Profiles', '/profiles'], [data.resumes.length, 'Resumes', '/resumes'], [unfiled, 'Unfiled Resumes', '/unfiled']].map(([count, label, href]) => <div key={label}><dt><Link href={String(href)} prefetch={false}>{label}</Link></dt><dd>{count}</dd></div>)}
    </dl>
    <div className="analytics-columns">
      <section aria-labelledby="content-title"><h2 id="content-title">Content inventory</h2><p className="analytics-description">Follow your content from its source to visible Resume entries.</p>
        <div className="analytics-inventory-scroll" tabIndex={0} role="region" aria-label="Scrollable content inventory"><Table aria-label="Content inventory"><TableHeader><TableRow><TableHead scope="col">Section</TableHead><TableHead scope="col">Record</TableHead><TableHead scope="col">Profile copies</TableHead><TableHead scope="col">Visible in Resumes</TableHead></TableRow></TableHeader><TableBody>{data.sections.map((section) => <TableRow key={section.kind}><TableHead scope="row">{section.label}</TableHead><TableCell>{section.record}</TableCell><TableCell>{section.profiles}</TableCell><TableCell>{section.visible}</TableCell></TableRow>)}</TableBody></Table></div>
        <p className="analytics-note">Copies are counted separately. Hidden entries and hidden sections are excluded from the visible total.</p>
      </section>
      <section aria-labelledby="coverage-title"><h2 id="coverage-title">Coverage & reuse</h2>
        <dl className="analytics-facts">
          <div><dt>Career Record Arabic coverage<small>Non-empty bilingual fields with Arabic wording</small></dt><dd>{data.translation.translated} / {data.translation.total}<small>{percent(data.translation.translated, data.translation.total)}</small></dd></div>
          <div><dt>Career Record entries reused<small>Source entries copied into any Profile or Resume</small></dt><dd>{data.reusedEntries} / {record.entries.length}<small>{percent(data.reusedEntries, record.entries.length)}</small></dd></div>
          <div><dt>Career Record achievements</dt><dd>{data.bullets}</dd></div>
          <div><dt>Resume language</dt><dd>{data.resumes.length - arabic} English<small>{arabic} Arabic</small></dd></div>
          <div><dt>Excluded Resume entries<small>Hidden individually, by section, or by section order</small></dt><dd>{data.resumes.reduce((sum, resume) => sum + resume.excluded, 0)}</dd></div>
        </dl>
      </section>
    </div>
    <section className="analytics-section" aria-labelledby="attention-title"><h2 id="attention-title">Needs attention <span className="text-muted-foreground">({attention.length})</span></h2><p className="analytics-description">Basic content checks, not a quality score or an export guarantee.</p>
      {attention.length ? <ul className="analytics-list">{attention.map((resume) => <li key={resume.id}><Link href={`/resumes/${resume.id}`} prefetch={false} dir="auto">{resume.name}</Link><span>{[...resume.issues, ...(resume.language === 'ar' && resume.missingArabic ? [`${resume.missingArabic} visible ${resume.missingArabic === 1 ? 'field' : 'fields'} missing Arabic`] : [])].join(' · ')}</span></li>)}</ul> : <p>{data.resumes.length ? 'No gaps found in the basic checks for your saved Resumes.' : 'Create a Resume to see content checks here.'}</p>}
    </section>
    <section className="analytics-section" aria-labelledby="resumes-title"><h2 id="resumes-title">Resume breakdown</h2><p className="analytics-description">Scroll the table to explore all Resumes and columns. Arabic gaps count visible English fields without Arabic wording, regardless of the selected document language.</p>
      {data.resumes.length ? <div className="analytics-resume-scroll" tabIndex={0} role="region" aria-label="Scrollable Resume breakdown"><Table aria-label="Resume breakdown"><TableHeader><TableRow>{['Resume', 'Profile', 'Language', 'Visible entries', 'Excluded entries', 'Arabic gaps', 'Template'].map((label) => <TableHead scope="col" key={label}>{label}</TableHead>)}</TableRow></TableHeader><TableBody>{data.resumes.map((resume) => <TableRow key={resume.id}><TableHead scope="row"><Link href={`/resumes/${resume.id}`} prefetch={false} dir="auto">{resume.name}</Link></TableHead><TableCell dir="auto">{resume.profile}</TableCell><TableCell>{resume.language === 'en' ? 'English' : 'Arabic'}</TableCell><TableCell>{resume.visible}</TableCell><TableCell>{resume.excluded}</TableCell><TableCell>{resume.missingArabic}</TableCell><TableCell>{templates.find(([key]) => key === resume.template)?.[1]}</TableCell></TableRow>)}</TableBody></Table></div> : <p>No Resumes yet. <Link href="/resumes" prefetch={false}>Start your first Resume</Link> to populate this breakdown.</p>}
    </section>
    <section id="analytics-charts" className="analytics-section" aria-labelledby="charts-title"><h2 id="charts-title">Workspace charts</h2><p className="analytics-description">Explore your current saved data. The tables provide the exact counts.</p>
      <LazyAnalyticsCharts sections={data.sections} profiles={[...data.profiles, { name: 'Unfiled', resumes: unfiled }]} languages={[{ label: 'English', count: data.resumes.length - arabic }, { label: 'Arabic', count: arabic }]} templates={templates.map(([key, label]) => ({ label, count: data.resumes.filter((resume) => resume.template === key).length }))} />
    </section>
    <div className="analytics-columns analytics-section">
      <section aria-labelledby="profiles-title"><h2 id="profiles-title">Profile distribution</h2>{data.profiles.length ? <ul className="analytics-list">{data.profiles.map((profile) => <li key={profile.id}><Link href={`/profiles/${profile.id}`} prefetch={false} dir="auto">{profile.name}</Link><span>{profile.entries} entries · {profile.resumes} Resumes</span></li>)}</ul> : <p>No Profiles yet. <Link href="/profiles" prefetch={false}>Browse Profiles</Link> to get started.</p>}<p className="analytics-note">{unfiled} Resumes are Unfiled.</p>
        <h3>Template usage</h3><dl className="analytics-template-list">{templates.map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{data.resumes.filter((resume) => resume.template === key).length}</dd></div>)}</dl>
      </section>
      <section aria-labelledby="recent-title"><h2 id="recent-title">Recently edited</h2><p className="analytics-description">Latest saved edit per Resume. Times shown in Cairo.</p>{recent.length ? <ul className="analytics-list">{recent.map((resume) => <li key={resume.id}><Link href={`/resumes/${resume.id}`} prefetch={false} dir="auto">{resume.name}</Link><time dateTime={resume.updatedAt}>{new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Cairo' }).format(new Date(resume.updatedAt!))}</time></li>)}</ul> : <p>No saved edit timestamps yet.</p>}<p className="analytics-note">{data.resumes.filter((resume) => !resume.updatedAt).length} Resumes have no recorded edit time. Creation dates and earlier edits cannot be reconstructed.</p></section>
    </div>
    <section className="analytics-section analytics-scope" aria-labelledby="scope-title"><h2 id="scope-title">What this page measures</h2><p>Saved workspace content and recorded application history. Refresh to include new saves. PDF exports, AI review runs, page visits, time spent and deleted records are not tracked. Everything stays local.</p></section>
  </>;
}

export default function AnalyticsPage() {
  return <WorkspaceShell contentId="analytics-content" className="analytics-page"><Suspense fallback={<p role="status">Loading your analytics…</p>}><Analytics /></Suspense></WorkspaceShell>;
}
