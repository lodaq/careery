'use client';
import { lazy, Suspense, useState } from 'react';
const ConfirmationDialog = lazy(() => import('./ConfirmationDialog'));
export type ConfirmationOptions = { title?: string; action?: string };
/** Shared confirmation keeps destructive actions consistent across content editors. */
export function useConfirmAction() {
  const [pending, setPending] = useState<{ message: string; options?: ConfirmationOptions; resolve: (confirmed: boolean) => void } | null>(null);
  const confirm = (message: string, options?: ConfirmationOptions) => new Promise<boolean>((resolve) => setPending({ message, options, resolve }));
  const finish = (confirmed: boolean) => { pending?.resolve(confirmed); setPending(null); };
  const confirmation = pending ? <Suspense fallback={<p role="status">Opening confirmation…</p>}><ConfirmationDialog message={pending.message} options={pending.options} finish={finish} /></Suspense> : null;
  return { confirm, confirmation };
}
