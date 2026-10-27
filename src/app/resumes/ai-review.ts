import type { Resume } from '@/lib/types';
import { resolveResume } from '@/lib/resolver';

export const reviewSections = ['basics', 'headline', 'summary', 'experience', 'education', 'projects', 'skills', 'certifications'] as const;
export interface ReviewEdit { field: string; before: string; after: string }
export interface ReviewFinding { unavailable?: boolean; addSkills?: { name: string; evidence: string }[]; edits?: ReviewEdit[]; section: typeof reviewSections[number]; title: string; detail: string; suggestion: string; priority: 'high' | 'medium' | 'low' }
export interface AiReview { score: number; overview: string; strengths: string[]; findings: ReviewFinding[]; summaryRewrite: string; model: string }

/** Only the visible writing is sent; identity and contact fields are omitted. */
export function reviewContent(resume: Resume) {
  const resolved = resolveResume(resume);
  return {
    writingFields: reviewWritingFields(resume),
    language: resume.language,
    headline: resolved.headline.value,
    summary: resolved.summary.value,
    sections: resolved.sections.map((section) => ({ section: section.kind, entries: section.entries.map((entry) => ({ heading: entry.heading.value, context: entry.subheading?.value, dates: entry.date, achievements: entry.bullets.map((bullet) => bullet.text.value) })) })),
  };
}
export function parseAiReview(value: unknown, model: string): AiReview {
  const object = (input: unknown): Record<string, unknown> => {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid review response. Try again.');
    return input as Record<string, unknown>;
  };
  const string = (input: unknown, max = 3000) => {
    if (typeof input !== 'string' || input.length > max) throw new Error('Invalid review response. Try again.');
    return input.trim();
  };
  const data = object(value);
  if (typeof data.score !== 'number' || !Number.isInteger(data.score) || data.score < 0 || data.score > 100 || !Array.isArray(data.findings) || data.findings.length > 12 || !Array.isArray(data.strengths) || data.strengths.length > 6) throw new Error('Invalid review response. Try again.');
  const findings = data.findings.map((item): ReviewFinding => {
    const finding = object(item);
    const section = reviewSections.find((section) => section === finding.section);
    const priority = finding.priority;
    if (!section || !['high', 'medium', 'low'].includes(String(priority))) throw new Error('Invalid review response. Try again.');
    const addSkills = finding.addSkills === undefined ? [] : finding.addSkills;
    if (!Array.isArray(addSkills) || addSkills.length > 12) throw new Error('Invalid review skills.');
    return { addSkills: addSkills.map((value) => { const skill = object(value); return { name: string(skill.name, 100), evidence: string(skill.evidence, 1000) }; }), section, priority: priority as ReviewFinding['priority'], title: string(finding.title, 160), detail: string(finding.detail), suggestion: string(finding.suggestion), edits: finding.edits === undefined ? [] : (() => {
      if (!Array.isArray(finding.edits) || finding.edits.length > 12) throw new Error('Invalid review edits.');
      return finding.edits.map((value) => { const edit = object(value); return { field: string(edit.field, 300), before: string(edit.before), after: string(edit.after) }; });
    })() };
  });
  return { score: data.score, overview: string(data.overview), strengths: data.strengths.map((item) => string(item, 500)), findings, summaryRewrite: string(data.summaryRewrite ?? ''), model: model.slice(0, 160) };
}

/** Explicit allowlist: no identity, dates, URLs, new entries or hidden content. */
export function reviewWritingFields(resume: Resume) {
  const fields: { field: string; value: string; section: string }[] = [];
  const add = (field: string, value: { en: string; ar?: string }, section: string) => {
    const language = resume.language === 'ar' && value.ar?.trim() ? 'ar' : 'en';
    if (value[language]?.trim()) fields.push({ field: `${field}.${language}`, value: value[language]!, section });
  };
  add('headline', resume.headline, 'headline');
  if (!resume.hiddenSections?.includes('summary')) add('summary', resume.summary, 'summary');
  for (const entry of resume.entries) {
    if (resume.hiddenEntryIds.includes(entry.id) || resume.hiddenSections?.includes(entry.kind)) continue;
    // Titles, employers and credentials describe facts; only descriptive writing can be rewritten.
    if (entry.kind === 'projects') add(`${entry.id}.description`, entry.description, entry.kind);
    if ('bullets' in entry) for (const bullet of entry.bullets) add(`${entry.id}.${bullet.id}`, bullet.text, entry.kind);
  }
  return fields;
}
export function validatedFindingEdits(resume: Resume, finding: ReviewFinding): ReviewEdit[] {
  const fields = reviewWritingFields(resume);
  const edits = finding.edits ?? [];
  if (!edits.length || new Set(edits.map((edit) => edit.field)).size !== edits.length) return [];
  return edits.every((edit) => edit.after.trim() && edit.after !== edit.before && fields.some((field) => field.field === edit.field && field.section === finding.section && field.value.trim() === edit.before)) ? edits : [];
}

/** Skill additions must quote an existing visible phrase, rather than invent expertise. */
export function validatedFindingSkills(resume: Resume, finding: ReviewFinding) {
  if (finding.section !== 'skills') return [];
  const content = reviewContent(resume);
  const source = JSON.stringify({ headline: content.headline, summary: content.summary, sections: content.sections }).toLocaleLowerCase();
  const existing = new Set(resume.entries.filter((entry) => entry.kind === 'skills').flatMap((entry) => [entry.name.en.toLocaleLowerCase(), entry.name.ar?.toLocaleLowerCase()]));
  return (finding.addSkills ?? []).filter((skill) => {
    const name = skill.name.trim().toLocaleLowerCase(), evidence = skill.evidence.trim().toLocaleLowerCase();
    if (!name || !evidence.includes(name) || !source.includes(evidence) || existing.has(name)) return false;
    existing.add(name); return true;
  });
}
