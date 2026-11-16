'use client';

import { UserButton } from '@clerk/nextjs';

export function WorkspaceAccount() {
  return <div className="workspace-account flex min-w-0 flex-wrap items-center gap-3" aria-label="Your account">
    <UserButton showName appearance={{ elements: { userButtonBox: { flexDirection: 'row-reverse', flexWrap: 'nowrap' }, userButtonOuterIdentifier: 'sidebar-account-name', userButtonTrigger: 'text-foreground focus-visible:ring-2 focus-visible:ring-ring', userButtonPopoverCard: 'bg-background text-foreground border-border', userButtonPopoverActionButton: 'text-foreground hover:bg-muted' } }} />
  </div>;
}
