import { resolveResume } from '@/lib/resolver';
import type { Bilingual, CareerEntry, CareerRecord, Workspace } from '@/lib/types';

export const sectionLabels = [
  ['experience', 'Experience'], ['education', 'Education'], ['projects', 'Projects'],
  ['skills', 'Skills'], ['certifications', 'Certifications'],
] as const;

function entryText(entry: CareerEntry): Bilingual[] {
  switch (entry.kind) {
    case 'experience': return [entry.title, entry.employer, ...entry.bullets.map((bullet) => bullet.text)];
    case 'education': return [entry.qualification, entry.institution, ...entry.bullets.map((bullet) => bullet.text)];
    case 'projects': return [entry.name, entry.description, ...entry.bullets.map((bullet) => bullet.text)];
    case 'skills': return [entry.name, ...(entry.category ? [entry.category] : [])];
    case 'certifications': return [entry.name, entry.issuer];
  }
}

export function analyzeWorkspace(record: CareerRecord, workspace: Workspace) {
  const copies = [...workspace.profiles.flatMap((profile) => profile.entries), ...workspace.resumes.flatMap((resume) => resume.entries)];
  const sourceIds = new Set(copies.map((entry) => entry.sourceId ?? entry.id));
  const fields = [record.basics.name, record.basics.title, record.basics.location, ...record.entries.flatMap(entryText)]
    .filter((field) => field.en.trim() || field.ar?.trim());
  const resumes = workspace.resumes.map((resume) => {
    const document = resolveResume(resume);
    const arabic = resolveResume({ ...resume, language: 'ar' });
    const visible = document.sections.reduce((count, section) => count + section.entries.length, 0);
    const issues = [
      !document.name.value.trim() ? 'Missing name' : '',
      !document.headline.value.trim() ? 'Missing headline' : '',
      !document.email.trim() && !document.phone.trim() && !document.links.some((link) => link.url.trim()) ? 'No contact details' : '',
      visible === 0 ? 'No visible entries' : '',
    ].filter(Boolean);
    return {
      id: resume.id, name: resume.name, language: resume.language,
      profile: workspace.profiles.find((profile) => profile.id === resume.profileId)?.name ?? 'Unfiled',
      visible, excluded: resume.entries.length - visible, missingArabic: arabic.missingArabicCount, issues,
      template: resume.appearance?.template ?? 'classic',
      updatedAt: resume.updatedAt && Number.isFinite(Date.parse(resume.updatedAt)) ? resume.updatedAt : undefined,
    };
  });
  return {
    resumes,
    reusedEntries: record.entries.filter((entry) => sourceIds.has(entry.id)).length,
    translation: { translated: fields.filter((field) => field.ar?.trim()).length, total: fields.length },
    bullets: record.entries.reduce((count, entry) => count + ('bullets' in entry ? entry.bullets.length : 0), 0),
    sections: sectionLabels.map(([kind, label]) => ({
      kind, label, record: record.entries.filter((entry) => entry.kind === kind).length,
      profiles: workspace.profiles.reduce((count, profile) => count + profile.entries.filter((entry) => entry.kind === kind).length, 0),
      visible: workspace.resumes.reduce((count, resume) => count + resolveResume(resume).sections.filter((section) => section.kind === kind).reduce((sum, section) => sum + section.entries.length, 0), 0),
    })),
    profiles: workspace.profiles.map((profile) => ({ id: profile.id, name: profile.name, entries: profile.entries.length, resumes: workspace.resumes.filter((resume) => resume.profileId === profile.id).length })),
  };
}
