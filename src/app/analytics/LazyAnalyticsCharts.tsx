'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { AnalyticsChartsProps } from './AnalyticsCharts';
const Charts = dynamic(() => import('./AnalyticsCharts'), { ssr: false, loading: () => <Skeleton className="analytics-chart-placeholder" aria-label="Loading charts" /> });

export function LazyAnalyticsCharts(props: AnalyticsChartsProps) {
  const target = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = target.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={target}>{visible ? <Charts {...props} /> : <div className="analytics-chart-placeholder"><Button variant="outline" onClick={() => setVisible(true)}>Load charts</Button></div>}</div>;
}
