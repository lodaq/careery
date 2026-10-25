'use client';
import Link from 'next/link';
import { useId } from 'react';
import type { ReactNode } from 'react';

export function WorkspaceShell({ children, navigation, footer, className = '' }: { children: ReactNode; navigation?: ReactNode; footer?: ReactNode; className?: string }) {
  const mainId = useId();
  return <div className="workspace">
    <a className="skip-link" href={`#${mainId}`}>Skip to content</a>
    <header className="workspace-header"><Link className="wordmark" href="/" aria-label="Careery home" translate="no">careery<span aria-hidden="true">.</span></Link>{navigation ?? <span className="local-note">Your personal career workspace</span>}</header>
    <main id={mainId} tabIndex={-1} className={`workspace-main ${className}`}>{children}</main>
    {footer ? <footer className="workspace-footer">{footer}</footer> : null}
  </div>;
}
