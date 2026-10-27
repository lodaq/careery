import { Suspense } from 'react';
import { connection } from 'next/server';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { readApplications } from './application-data';
import { ApplicationList } from './ApplicationList';
import './applications.css';
export const metadata = { title: 'Applications · Careery' };
async function Applications() { await connection(); const store = await readApplications(); return <ApplicationList applications={store.applications.map(({ documents, ...app }) => { void documents; return app; })} />; }
export default function ApplicationsPage() { return <WorkspaceShell><Suspense fallback={<p role="status">Loading applications…</p>}><Applications /></Suspense></WorkspaceShell>; }
