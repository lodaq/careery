'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RefreshAnalytics() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <Button variant="outline" disabled={pending} onClick={() => startTransition(() => router.refresh())}><RefreshCwIcon data-icon="inline-start" aria-hidden="true" />{pending ? 'Refreshing…' : 'Refresh analytics'}</Button>;
}
