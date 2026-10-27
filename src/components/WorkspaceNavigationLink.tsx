'use client';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
export function WorkspaceNavigationLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = href === '/profiles' ? pathname.startsWith('/profiles') || pathname === '/unfiled' : pathname.startsWith(href);
  return <Button variant="ghost" className={`navigation-link${href === '/settings' ? ' navigation-settings' : ''}`} render={<Link href={href} prefetch={false} />} nativeButton={false} role="link" aria-label={label} aria-current={active ? 'page' : undefined}>{children}</Button>;
}
