import { PageHeading } from '@/components/PageHeading';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { readTools } from './data';
import { Toolbox } from './Toolbox';
export const metadata: Metadata = { title: 'Toolbox', description: 'Manage your career tools and resources.', robots: { index: false, follow: false } };
async function ToolboxContent() {
  const { tools } = await readTools();
  return <><PageHeading><h1>Toolbox</h1><p className="page-intro">Your websites and tools, ready when you need them.</p></PageHeading><Toolbox tools={tools} /></>;
}

export default function ToolboxPage() { return <WorkspaceShell contentId="toolbox-content"><Suspense fallback={<p role="status">Loading tools…</p>}><ToolboxContent /></Suspense></WorkspaceShell>; }
