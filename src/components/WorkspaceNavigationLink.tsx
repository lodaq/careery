'use client';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
export function WorkspaceNavigationLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const active = href === '/profiles' ? pathname.startsWith('/profiles') || pathname === '/unfiled' : pathname.startsWith(href);
  return <SidebarMenuButton tooltip={label} isActive={active} render={<Link href={href} prefetch={false} />} aria-label={label} aria-current={active ? 'page' : undefined} onClick={() => setOpenMobile(false)}>{children}</SidebarMenuButton>;
}
