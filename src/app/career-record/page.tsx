import Link from 'next/link';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { readRecord } from '../../lib/storage';
import { recordRevision } from './record-data';
import { RecordEditor } from './RecordEditor';
import { saveCareerRecord } from './actions';

async function Editor() {
  await connection();
  const record = await readRecord();
  return <RecordEditor record={record} revision={recordRevision(record)} saveAction={saveCareerRecord} />;
}
export default function CareerRecordPage() {
  return <WorkspaceShell contentId="career-content" navigation={<Link prefetch={false} href="/">Back to workspace</Link>} className="record-main"><h1>Career Record</h1><p className="page-intro">Your experience, in your own words. Build it once, then choose what belongs in each resume.</p>
      <Suspense fallback={<p role="status">Loading your Career Record…</p>}><Editor /></Suspense>
  </WorkspaceShell>;
}
