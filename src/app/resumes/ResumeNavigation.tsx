'use client';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';
import type { CareerEntry } from '../../lib/types';
const navigation = [
  ['details', 'Resume settings', 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4'],
  ['basics', 'Personal info', 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M5 21v-3a7 7 0 0 1 14 0v3'],
  ['summary', 'Summary', 'M6 3h9l4 4v14H6zM9 11h7M9 15h7'],
  ['skills', 'Skills', 'M6 5h2m-2 7h2m-2 7h2M13 5h5m-5 7h5m-5 7h5'],
  ['experience', 'Experience', 'M8 7V3h8v4M3 7h18v13H3zM3 12h18M10 12v3h4v-3'],
  ['education', 'Education', 'm2 9 10-6 10 6-10 6zM6 12v6l6 3 6-3v-6'],
  ['projects', 'Projects', 'M9 18h6m-5 3h4M8 14a7 7 0 1 1 8 0l-1 3H9z'],
  ['certifications', 'Certifications', 'M17 8a5 5 0 1 1-10 0 5 5 0 0 1 10 0M8 12l-1 9 5-3 5 3-1-9'],
] as const;
export function ResumeNavigation({ active, entries, onSelect, chooseContent }: {
  active: string; entries: CareerEntry[]; onSelect: (section: string) => void; chooseContent: boolean;
}) {
  const navigationRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = navigationRef.current;
    if (!nav) return;
    const reveal = () => {
      const selected = nav.querySelector<HTMLElement>('[aria-current="page"]');
      if (selected && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = selected.offsetLeft - (nav.clientWidth - selected.offsetWidth) / 2;
    };
    reveal();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(reveal); observer.observe(nav);
    return () => observer.disconnect();
  }, [active]);
  return <nav ref={navigationRef} className="resume-section-nav" aria-label="Resume sections">
    <p className="nav-caption">YOUR RESUME</p>
    {navigation.map(([key, title, path]) => <Button variant="ghost" type="button" key={key} aria-current={active === key ? 'page' : undefined} onClick={() => onSelect(key)}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>
      <span>{title}</span>{entries.some((entry) => entry.kind === key) ? <small>{entries.filter((entry) => entry.kind === key).length}</small> : null}<span aria-hidden="true" className="nav-chevron">›</span>
    </Button>)}
    {chooseContent ? <Button variant="ghost" type="button" className="choose-content-link" aria-current={active === 'choose-content' ? 'page' : undefined} onClick={() => onSelect('choose-content')}><span aria-hidden="true">＋</span> Choose content</Button> : null}
    <p className="nav-footnote">This resume is your own copy. Changes stay here.</p>
  </nav>;
}
