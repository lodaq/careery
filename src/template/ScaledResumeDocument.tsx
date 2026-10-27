'use client';
import { useEffect, useRef, useState } from 'react';
import type { ResolvedDocument } from '@/lib/types';
import { ResumeDocument } from './ResumeDocument';

/** Fit the same physical A4 document to the available proof or thumbnail width. */
export function ScaledResumeDocument({ document }: { document: ResolvedDocument }) {
  const container = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const resize = () => { if (node.clientWidth) setScale(Math.min(1, node.clientWidth / (210 * 96 / 25.4))); };
    resize();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }
    const observer = new ResizeObserver(resize); observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={container} className="scaled-resume-document"><div style={{ zoom: scale }}><ResumeDocument document={document} /></div></div>;
}
