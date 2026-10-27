import Link from 'next/link';
import { Suspense, type ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkspaceNavigation } from './WorkspaceNavigation';

export function WorkspaceShell({ children, navigation, footer, className = '', contentId = 'workspace-content' }: { children: ReactNode; navigation?: ReactNode; footer?: ReactNode; className?: string; contentId?: string }) {
  return <div className="workspace">
    <a className="skip-link" href={`#${contentId}`}>Skip to content</a>
    <header className="workspace-brand"><Link prefetch={false} className="wordmark" href="/" aria-label="Careery home" translate="no">careery<span aria-hidden="true">.</span></Link><Suspense fallback={<Skeleton className="navigation-loading" />}><WorkspaceNavigation /></Suspense></header>
    <main id={contentId} tabIndex={-1} className={`workspace-main ${className}`}>{navigation ? <div className="page-navigation">{navigation}</div> : null}{children}</main>
    {footer ? <footer className="workspace-footer">{footer}</footer> : null}
  </div>;
}
