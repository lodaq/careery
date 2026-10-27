'use client';
import { Button } from '@/components/ui/button';
export default function QuestionsError({ reset }: { reset: () => void }) {
  return <section><h1>Interview questions could not be loaded</h1><p role="alert">Check that your local data is available. Existing files have been preserved.</p><Button onClick={reset}>Try again</Button></section>;
}
