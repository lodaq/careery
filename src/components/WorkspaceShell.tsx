import Link from 'next/link';
import Image from 'next/image';
import { Suspense, type ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkspaceNavigation } from './WorkspaceNavigation';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider, SidebarRail, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { WorkspacePageTitle } from './WorkspacePageTitle';
import { WorkspaceAccount } from './WorkspaceAccount';

export function WorkspaceShell({ children, navigation, footer, className = '', contentId = 'workspace-content' }: { children: ReactNode; navigation?: ReactNode; footer?: ReactNode; className?: string; contentId?: string }) {
  return <TooltipProvider><SidebarProvider style={{ '--sidebar-width-icon': '3.5rem', '--sidebar-width': '14.5rem' } as React.CSSProperties}>
    <a className="skip-link" href={`#${contentId}`}>Skip to content</a>
    <Sidebar collapsible="icon">
      <SidebarHeader><Link prefetch={false} className="sidebar-brand" href="/" aria-label="Careery home" translate="no"><Image src="/icon.svg" width={36} height={36} alt="" unoptimized /><span className="sidebar-brand-name">Careery</span></Link></SidebarHeader>
      <SidebarContent><Suspense fallback={<Skeleton className="h-80 w-full" />}><WorkspaceNavigation /></Suspense></SidebarContent>
      <SidebarFooter><WorkspaceAccount /></SidebarFooter>
      <SidebarRail />
    </Sidebar>
    <div className="workspace workspace-body">
      <header className="workspace-toolbar"><SidebarTrigger /><div className="workspace-heading"><div id="workspace-page-heading" /><div className="workspace-heading-fallback"><Suspense fallback={<span>Careery</span>}><WorkspacePageTitle /></Suspense></div></div></header>
      <main id={contentId} tabIndex={-1} className={`workspace-main ${className}`}>{navigation ? <div className="page-navigation">{navigation}</div> : null}{children}</main>
      {footer ? <footer className="workspace-footer">{footer}</footer> : null}
    </div>
  </SidebarProvider></TooltipProvider>;
}
