'use client';
import { lazy, Suspense, useState } from 'react';
const ConfirmationDialog = lazy(() => import('./ConfirmationDialog'));
/** Shared confirmation keeps destructive actions consistent across content editors. */
export function useConfirmAction() {
  const [pending, setPending] = useState<{ message: string; resolve: (confirmed: boolean) => void } | null>(null);
  const confirm = (message: string) => new Promise<boolean>((resolve) => setPending({ message, resolve }));
  const finish = (confirmed: boolean) => { pending?.resolve(confirmed); setPending(null); };
  const confirmation = pending ? <Suspense fallback={<p role="status">Opening confirmation…</p>}><ConfirmationDialog message={pending.message} finish={finish} /></Suspense> : null;
  return { confirm, confirmation };
}
