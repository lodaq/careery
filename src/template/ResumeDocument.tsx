import type { ResolvedDocument, ResolvedText, Section } from '../lib/types';
import './resume-document.css';
const headings: Record<Section, [string, string]> = {
  summary: ['Summary', 'الملخص'], skills: ['Skills', 'المهارات'], experience: ['Experience', 'الخبرة'], education: ['Education', 'التعليم'], projects: ['Projects', 'المشاريع'], certifications: ['Certifications', 'الشهادات'],
};
function Text({ text }: { text: ResolvedText }) {
  return text.missingArabic ? <mark className="resume-missing" lang="en" dir="ltr" title="Missing Arabic version">{text.value}</mark> : <span>{text.value}</span>;
}
export function ResumeDocument({ document }: { document: ResolvedDocument }) {
  const arabic = document.language === 'ar';
  return <article className="resume-document" lang={document.language} dir={arabic ? 'rtl' : 'ltr'} aria-label="Resume preview">
    <header className="resume-block resume-header">
      <h1><Text text={document.name} /></h1>
      {document.headline.value ? <p className="resume-headline"><Text text={document.headline} /></p> : null}
      <div className="resume-contacts">
        {document.location.value ? <p><Text text={document.location} /></p> : null}
        {document.email ? <p><bdi dir="ltr">{document.email}</bdi></p> : null}
        {document.phone ? <p><bdi dir="ltr">{document.phone}</bdi></p> : null}
        {document.links.map((link, index) => <p key={index}><bdi dir="ltr">{link.label ? `${link.label}: ` : ''}{link.url}</bdi></p>)}
      </div>
    </header>
    {document.sections.map((section) => section.kind === 'summary'
      ? document.summary.value ? <section className="resume-block" key="summary"><h2>{headings.summary[arabic ? 1 : 0]}</h2><p><Text text={document.summary} /></p></section> : null
      : section.entries.map((entry, index) => <section className="resume-block" key={entry.id}>
        {index === 0 ? <h2>{headings[section.kind][arabic ? 1 : 0]}</h2> : null}
        <h3><Text text={entry.heading} /></h3>
        {entry.subheading?.value ? <p><Text text={entry.subheading} /></p> : null}
        {entry.date ? <p className="resume-date">{entry.date}</p> : null}
        {entry.url ? <p><bdi dir="ltr">{entry.url}</bdi></p> : null}
        {entry.bullets.length ? <ul>{entry.bullets.map((bullet) => <li key={bullet.id}><Text text={bullet.text} /></li>)}</ul> : null}
      </section>))}
  </article>;
}
