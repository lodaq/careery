import type { Metadata } from 'next';
import { ArrowUpRightIcon } from 'lucide-react';
import { WorkspaceShell } from '@/components/WorkspaceShell';

export const metadata: Metadata = { title: 'Resources | Careery' };

const groups = [
  {
    title: 'Research companies & salaries',
    resources: [
      { name: 'Mokabla', url: 'https://www.mokabla.com/ar/companies', description: 'Explore companies on Mokabla’s Arabic company directory before applying or interviewing.' },
      { name: 'Glassdoor', url: 'https://www.glassdoor.com/', description: 'Read employee reviews, reported salaries and interview experiences to prepare questions about a company.' },
      { name: 'Levels.fyi', url: 'https://www.levels.fyi/', description: 'Compare reported compensation and career levels, especially for technology roles, before negotiating an offer.' },
    ],
  },
  {
    title: 'Find your next role',
    resources: [
      { name: 'WUZZUF', url: 'https://wuzzuf.net/', description: 'Find jobs in Egypt and explore employers hiring locally.' },
      { name: 'Bayt', url: 'https://www.bayt.com/', description: 'Search jobs across the Middle East and North Africa.' },
      { name: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs/', description: 'Find openings, set job alerts and discover people in your network at companies you are considering.' },
      { name: 'Wellfound', url: 'https://wellfound.com/jobs', description: 'Explore startup jobs, including remote opportunities, and learn about the teams behind them.' },
    ],
  },
  {
    title: 'Prepare for interviews',
    resources: [
      { name: 'LeetCode', url: 'https://leetcode.com/', description: 'Practice coding problems and technical interview questions for software engineering roles.' },
      { name: 'Big Interview', url: 'https://biginterview.com/', description: 'Practice interview answers and learn how to structure examples from your experience.' },
    ],
  },
  {
    title: 'Improve your Resume',
    resources: [
      { name: 'Jobscan', url: 'https://www.jobscan.co/', description: 'Compare Resume wording with a job description to identify relevant skills and keywords. Review suggestions before changing your wording.' },
      { name: 'Harvard career resources', url: 'https://careerservices.fas.harvard.edu/channels/create-a-resume-cv-or-cover-letter/', description: 'Use practical guides and examples to strengthen Resume bullet points and cover letters.' },
    ],
  },
];

export default function ResourcesPage() {
  return <WorkspaceShell contentId="resources-content">
    <h1>Resources</h1>
    <p className="page-intro">Useful websites and tools for finding a role, researching employers and preparing your next application.</p>
    <p className="text-sm text-muted-foreground">These links open external websites. Some services require an account or payment. Check what you share before uploading personal documents.</p>
    <div className="max-w-4xl">
      {groups.map(({ title, resources }, index) => <section key={title} className="mt-8" aria-labelledby={`resource-group-${index}`}>
        <h2 id={`resource-group-${index}`}>{title}</h2>
        <ul className="m-0 list-none divide-y divide-border border-y border-border p-0">
          {resources.map(({ name, url, description }) => <li key={url} className="py-4">
            <h3 className="m-0"><a href={url} rel="noreferrer" className="plain-link gap-2 text-primary underline-offset-4 hover:underline">{name}<ArrowUpRightIcon aria-hidden="true" className="size-4 shrink-0" /></a></h3>
            <p className="m-0 max-w-prose text-sm text-muted-foreground">{description}</p>
          </li>)}
        </ul>
      </section>)}
    </div>
  </WorkspaceShell>;
}
