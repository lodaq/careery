import { MailIcon, PhoneIcon, MapPinIcon, LinkIcon } from 'lucide-react';
import type { CSSProperties } from 'react';
import { defaultAppearance } from '../app/resumes/appearance';
import type { ResolvedDocument, ResolvedText, Section } from '../lib/types';
import './resume-document.css';
const headings: Record<Section, [string, string]> = {
  summary: ['Summary', 'الملخص'], skills: ['Skills', 'المهارات'], experience: ['Experience', 'الخبرة'], education: ['Education', 'التعليم'], projects: ['Projects', 'المشاريع'], certifications: ['Certifications', 'الشهادات'],
};
function Text({ text }: { text: ResolvedText }) {
  return text.missingArabic ? <mark className="resume-missing" lang="en" dir="ltr" title="Missing Arabic version">{text.value}</mark> : <span>{text.value}</span>;
}
export function ResumeDocument({ document }: { document: ResolvedDocument }) {
  const arabic = document.language === 'ar', appearance = document.appearance ?? defaultAppearance;
  const style: CSSProperties & Record<`--${string}`, string> = { '--resume-body-size': `${appearance.bodySize}pt`, '--resume-name-size': `${appearance.nameSize}pt`, '--resume-accent': appearance.accent, '--resume-spacing': String(appearance.spacing), fontFamily: appearance.font === 'sans' ? 'Arial, Tahoma, sans-serif' : appearance.font === 'mono' ? 'Courier New, Tahoma, monospace' : 'Georgia, Times New Roman, Tahoma, serif' };
  return <article className={`resume-document template-${appearance.template}`} style={style} lang={document.language} dir={arabic ? 'rtl' : 'ltr'} aria-label="Resume preview">
    <header className="resume-block resume-header">
      <h1><Text text={document.name} /></h1>
      {document.headline.value ? <p className="resume-headline"><Text text={document.headline} /></p> : null}
      <div className="resume-contacts">
        {document.location.value ? <p><MapPinIcon aria-hidden="true" /><Text text={document.location} /></p> : null}
        {document.email ? <p><MailIcon aria-hidden="true" /><a href={`mailto:${document.email}`}><bdi dir="ltr">{document.email}</bdi></a></p> : null}
        {document.phone ? <p><PhoneIcon aria-hidden="true" /><a href={`tel:${document.phone.replace(/[^+0-9]/g, '')}`}><bdi dir="ltr">{document.phone}</bdi></a></p> : null}
        {document.links.map((link, index) => <p key={index}><LinkIcon aria-hidden="true" /><a href={link.url}><bdi dir="ltr">{link.label || link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</bdi></a></p>)}
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
