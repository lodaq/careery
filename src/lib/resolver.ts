import type { Bilingual, Language, Resume, ResolvedDocument, ResolvedEntry } from './types';

export function formatMonth(value: string, language: Language): string {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value);
  if (!match) return value;
  const months = language === 'ar'
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[Number(match[2]) - 1]} ${match[1]}`;
}
export function resolveResume(resume: Resume): ResolvedDocument {
  const language = resume.language;
  let missingArabicCount = 0;
  const text = (slot?: Bilingual) => {
    const missingArabic = language === 'ar' && !slot?.ar?.trim() && Boolean(slot?.en.trim());
    if (missingArabic) missingArabicCount++;
    return { value: language === 'ar' && slot?.ar?.trim() ? slot.ar : slot?.en ?? '', missingArabic };
  };
  const name = text(resume.basics.name), headline = text(resume.headline.en || resume.headline.ar ? resume.headline : resume.basics.title);
  const location = text(resume.basics.location);
  const summary = resume.sectionOrder.includes('summary') && !resume.hiddenSections?.includes('summary') ? text(resume.summary) : { value: '', missingArabic: false };
  const sections = resume.sectionOrder.filter((kind) => !resume.hiddenSections?.includes(kind)).map((kind) => ({ kind, entries: resume.entries.filter((entry) => entry.kind === kind && !resume.hiddenEntryIds.includes(entry.id)).map((entry): ResolvedEntry => {
    const result: ResolvedEntry = { id: entry.id, heading: { value: '', missingArabic: false }, bullets: 'bullets' in entry ? entry.bullets.map((bullet) => ({ id: bullet.id, text: text(bullet.text) })) : [] };
    switch (entry.kind) {
      case 'experience': result.heading = text(entry.title); result.subheading = text(entry.employer); break;
      case 'education': result.heading = text(entry.qualification); result.subheading = text(entry.institution); break;
      case 'projects': result.heading = text(entry.name); result.subheading = text(entry.description); result.url = entry.url; break;
      case 'skills': result.heading = text(entry.name); result.subheading = text(entry.category); break;
      case 'certifications': result.heading = text(entry.name); result.subheading = text(entry.issuer); result.url = entry.url; if (entry.date) result.date = formatMonth(entry.date, language); break;
    }
    if ('dates' in entry) result.date = `${formatMonth(entry.dates.start, language)} – ${entry.dates.end ? formatMonth(entry.dates.end, language) : language === 'ar' ? 'حتى الآن' : 'Present'}`;
    return result;
  }) }));
  return { language, appearance: resume.appearance, name, headline, summary, location, email: resume.basics.email, phone: resume.basics.phone, links: resume.basics.links, sections, missingArabicCount };
}
