import { Suspense } from 'react';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { readWorkspace } from '@/lib/storage';
import { readApplications } from '../application-data';
import { ApplicationDetail } from '../ApplicationDetail';
import '../applications.css';
export const metadata = { title: 'Application · Careery' };
async function Detail({ params }: { params: Promise<{ id: string }> }) { await connection(); const { id } = await params; const [store, workspace] = await Promise.all([readApplications(), readWorkspace()]); const app = store.applications.find((item) => item.id === id); if (!app) notFound(); return <ApplicationDetail app={app} resumes={workspace.resumes.map(({ id, name }) => ({ id, name }))} />; }
export default function ApplicationPage({ params }: { params: Promise<{ id: string }> }) { return <WorkspaceShell><Suspense fallback={<p role="status">Loading application…</p>}><Detail params={params} /></Suspense></WorkspaceShell>; }
