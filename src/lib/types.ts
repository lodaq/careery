export type Language = 'en' | 'ar';
export interface Bilingual { en: string; ar?: string }
export interface Basics {
  name: Bilingual;
  title: Bilingual;
  location: Bilingual;
  email: string;
  phone: string;
  links: { label: string; url: string }[];
}
export interface Bullet { id: string; text: Bilingual }
export interface DateRange { start: string; end?: string }
interface EntryBase { id: string; sourceId?: string }
export interface Experience extends EntryBase {
  kind: 'experience'; employer: Bilingual; title: Bilingual; dates: DateRange; bullets: Bullet[];
}
export interface Education extends EntryBase {
  kind: 'education'; institution: Bilingual; qualification: Bilingual; dates: DateRange; bullets: Bullet[];
}
export interface Project extends EntryBase {
  kind: 'projects'; name: Bilingual; description: Bilingual; url?: string; bullets: Bullet[];
}
export interface Skill extends EntryBase { kind: 'skills'; name: Bilingual; category?: Bilingual }
export interface Certification extends EntryBase {
  kind: 'certifications'; name: Bilingual; issuer: Bilingual; date?: string; url?: string;
}
export type CareerEntry = Experience | Education | Project | Skill | Certification;
export type Section = CareerEntry['kind'] | 'summary';
export interface CareerRecord { version: 1; basics: Basics; entries: CareerEntry[] }
export interface Profile {
  id: string; name: string; basics: Basics; entries: CareerEntry[]; headline: Bilingual; summary: Bilingual;
}
export interface ResumeAppearance {
  template: 'classic' | 'professional' | 'centered' | 'accent' | 'cream' | 'ledger';
  font: 'sans' | 'serif' | 'mono'; bodySize: number; nameSize: number; accent: string; spacing: number;
}
export interface Resume {
  id: string; name: string; profileId: string | null; language: Language;
  basics: Basics; entries: CareerEntry[]; headline: Bilingual; summary: Bilingual;
  hiddenEntryIds: string[]; sectionOrder: Section[]; updatedAt?: string; appearance?: ResumeAppearance; hiddenSections?: Section[];
}
export interface Workspace {
  version: 1; profiles: Profile[]; resumes: Resume[]; lastLanguage: Language;
}
export interface ResolvedText { value: string; missingArabic: boolean }
export interface ResolvedEntry {
  id: string; heading: ResolvedText; subheading?: ResolvedText;
  date?: string; url?: string; bullets: { id: string; text: ResolvedText }[];
}
export interface ResolvedDocument {
  language: Language; appearance?: ResumeAppearance;
  name: ResolvedText; headline: ResolvedText; summary: ResolvedText; location: ResolvedText;
  email: string; phone: string; links: Basics['links'];
  sections: { kind: Section; entries: ResolvedEntry[] }[];
  missingArabicCount: number;
}

export function emptyBasics(): Basics {
  return { name: { en: '' }, title: { en: '' }, location: { en: '' }, email: '', phone: '', links: [] };
}
export function emptyRecord(): CareerRecord { return { version: 1, basics: emptyBasics(), entries: [] }; }
export function emptyWorkspace(): Workspace { return { version: 1, profiles: [], resumes: [], lastLanguage: 'en' }; }

export function copyProfile(record: CareerRecord, id: string, name: string, entryIds: string[]): Profile {
  return structuredClone({ id, name, basics: record.basics, entries: record.entries.filter((entry) => entryIds.includes(entry.id)), headline: { en: '' }, summary: { en: '' } });
}
export function copyResume(record: CareerRecord, workspace: Workspace, id: string, name: string, profile?: Profile): Resume {
  return structuredClone({
    id, name, profileId: profile?.id ?? null, language: workspace.lastLanguage,
    basics: profile?.basics ?? record.basics, entries: profile?.entries ?? [],
    headline: profile?.headline ?? { en: '' }, summary: profile?.summary ?? { en: '' },
    hiddenEntryIds: [], sectionOrder: ['summary', 'skills', 'experience', 'education', 'projects', 'certifications'],
  });
}
