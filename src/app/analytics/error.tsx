'use client';
import { Button } from '@/components/ui/button';
export default function AnalyticsError({ reset }: { reset: () => void }) {
  return <div role="alert"><h1>Analytics could not load</h1><p>Check that your local data files are readable, then try again.</p><Button onClick={reset}>Try again</Button></div>;
}
