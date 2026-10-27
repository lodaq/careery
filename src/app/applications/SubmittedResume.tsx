import type { Resume } from '@/lib/types';
import { resolveResume } from '@/lib/resolver';
export function SubmittedResume({ resume }: { resume: Resume }) {
  const document = resolveResume(resume);
  return <article className="application-submitted-resume" lang={document.language} dir={document.language === 'ar' ? 'rtl' : 'ltr'}><h3>{document.name.value}</h3><p>{document.headline.value}</p><p className="application-note">{document.summary.value}</p>{document.sections.filter((section) => section.kind !== 'summary').map((section) => <section key={section.kind}><h4>{section.kind}</h4>{section.entries.map((entry) => <div key={entry.id}><strong>{entry.heading.value}</strong><p>{entry.subheading?.value} {entry.date}</p><ul>{entry.bullets.map((bullet) => <li key={bullet.id}>{bullet.text.value}</li>)}</ul></div>)}</section>)}</article>;
}
