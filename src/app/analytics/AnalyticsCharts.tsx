'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { analyzeWorkspace } from './analytics-data';

export interface AnalyticsChartsProps {
  sections: ReturnType<typeof analyzeWorkspace>['sections'];
  profiles: { name: string; resumes: number }[];
  languages: { label: string; count: number }[];
  templates: { label: string; count: number }[];
}
const contentConfig = {
  record: { label: 'Career Record', color: 'var(--chart-1)' },
  profiles: { label: 'Profile copies', color: 'var(--chart-2)' },
  visible: { label: 'Visible in Resumes', color: 'var(--chart-3)' },
} satisfies ChartConfig;
const countConfig = { count: { label: 'Resumes', color: 'var(--chart-1)' } } satisfies ChartConfig;

function Distribution({ data, label }: { data: { label: string; count: number }[]; label: string }) {
  return <ChartContainer role="region" config={countConfig} className="analytics-chart" aria-label={label}>
    <BarChart accessibilityLayer data={data} layout="vertical" margin={{ right: 16, left: 4 }}>
      <CartesianGrid horizontal={false} />
      <XAxis tick={{ fill: 'var(--muted-foreground)' }} type="number" allowDecimals={false} tickLine={false} axisLine={false} />
      <YAxis tick={{ fill: 'var(--muted-foreground)' }} dataKey="label" type="category" width={112} tickLine={false} axisLine={false} tickFormatter={(value: string) => value.length > 18 ? `${value.slice(0, 17)}…` : value} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <Bar dataKey="count" fill="var(--color-count)" radius={3} isAnimationActive={false} />
    </BarChart>
  </ChartContainer>;
}
export default function AnalyticsCharts({ sections, profiles, languages, templates }: AnalyticsChartsProps) {
  const hasResumes = languages.some((item) => item.count > 0);
  return <div className="analytics-chart-grid">
    <section aria-labelledby="content-chart-title"><h3 id="content-chart-title">Content mix</h3><p className="analytics-description">Compare source entries, Profile copies and visible Resume entries.</p>
      {sections.some((item) => item.record || item.profiles || item.visible) ? <ChartContainer role="region" config={contentConfig} className="analytics-chart analytics-content-chart" aria-label="Content counts by section">
        <BarChart accessibilityLayer data={sections} layout="vertical" margin={{ right: 16, left: 4 }}>
          <CartesianGrid horizontal={false} />
          <XAxis tick={{ fill: 'var(--muted-foreground)' }} type="number" allowDecimals={false} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: 'var(--muted-foreground)' }} dataKey="label" type="category" width={96} tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {Object.keys(contentConfig).map((key) => <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={3} isAnimationActive={false} />)}
        </BarChart>
      </ChartContainer> : <p>No saved content to chart yet.</p>}
    </section>
    <section aria-labelledby="profile-chart-title"><h3 id="profile-chart-title">Resumes by Profile</h3><p className="analytics-description">See how your saved Resumes are organized, including Unfiled.</p>{hasResumes ? <Distribution data={profiles.map((profile) => ({ label: profile.name, count: profile.resumes }))} label="Resume counts by Profile" /> : <p>No Resumes to chart yet.</p>}</section>
    <section aria-labelledby="language-chart-title"><h3 id="language-chart-title">Document languages</h3><p className="analytics-description">The selected language for each saved Resume.</p>{hasResumes ? <Distribution data={languages} label="Resume counts by language" /> : <p>No Resumes to chart yet.</p>}</section>
    <section aria-labelledby="template-chart-title"><h3 id="template-chart-title">Template usage</h3><p className="analytics-description">Compare the document templates used in your workspace.</p>{hasResumes ? <Distribution data={templates} label="Resume counts by template" /> : <p>No Resumes to chart yet.</p>}</section>
  </div>;
}
