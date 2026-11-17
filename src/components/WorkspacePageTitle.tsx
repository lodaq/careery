'use client';

import { usePathname } from 'next/navigation';

const names: Record<string, string> = {
  today: 'Today', jobs: 'Jobs', applications: 'Applications', profiles: 'Profiles',
  'career-record': 'Career Record', 'interview-questions': 'Interview questions',
  toolbox: 'Toolbox', analytics: 'Analytics', resources: 'Resources', settings: 'Settings',
  resumes: 'Resumes', unfiled: 'Unfiled', render: 'Resume preview',
};

export function WorkspacePageTitle() {
  const pathname = usePathname();
  return <span>{names[pathname.split('/')[1]] ?? 'Home'}</span>;
}
