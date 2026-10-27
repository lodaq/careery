import { expect, it } from 'vitest';
import { copyResume, emptyRecord, emptyWorkspace } from './types';
import { formatMonth, resolveResume } from './resolver';
it('resolves all entry kinds, independent order, hidden content, dates and both languages without mutating input', () => {
  const resume = copyResume(emptyRecord(), emptyWorkspace(), 'r', 'Test');
  resume.basics.name = { en: 'Name', ar: 'اسم' }; resume.basics.title = { en: 'Engineer' }; resume.basics.email = 'example@example.com'; resume.basics.links = [{ label: 'Site', url: 'https://example.com' }];
  resume.summary = { en: 'Summary' };
  resume.entries = [
    { id: 'e', kind: 'experience', title: { en: 'Engineer' }, employer: { en: 'Company' }, dates: { start: '2020-01' }, bullets: [{ id: 'b', text: { en: 'Delivered' } }] },
    { id: 'd', kind: 'education', qualification: { en: 'Degree', ar: 'شهادة' }, institution: { en: 'School' }, dates: { start: '2015-09', end: '2019-06' }, bullets: [] },
    { id: 'p', kind: 'projects', name: { en: 'Project' }, description: { en: 'Description' }, url: 'https://example.com', bullets: [] },
    { id: 's', kind: 'skills', name: { en: 'TypeScript' } },
    { id: 'c', kind: 'certifications', name: { en: 'Certificate' }, issuer: { en: 'Issuer' }, date: '2022-03' },
  ];
  const original = structuredClone(resume);
  expect(resolveResume(resume).missingArabicCount).toBe(0);
  expect(resolveResume(resume).sections.find((s) => s.kind === 'experience')?.entries[0].date).toBe('Jan 2020 – Present');
  resume.language = 'ar';
  const arabic = resolveResume(resume);
  expect(arabic.name).toEqual({ value: 'اسم', missingArabic: false });
  expect(arabic.headline).toEqual({ value: 'Engineer', missingArabic: true });
  expect(arabic.missingArabicCount).toBe(11);
  expect(arabic.sections.find((s) => s.kind === 'education')?.entries[0].date).toBe('سبتمبر 2015 – يونيو 2019');
  expect(arabic.email).toBe(resume.basics.email); expect(arabic.links).toEqual(resume.basics.links);
  resume.hiddenEntryIds = ['e']; resume.sectionOrder = ['skills', 'projects'];
  const hidden = resolveResume(resume);
  expect(hidden.sections.map((s) => s.kind)).toEqual(['skills', 'projects']);
  expect(hidden.summary.value).toBe(''); expect(hidden.missingArabicCount).toBe(4);
  expect({ ...resume, language: original.language, hiddenEntryIds: [], sectionOrder: original.sectionOrder }).toEqual(original);
});
it('handles optional dates, translated headlines, categories and missing optional text', () => {
  const resume = copyResume(emptyRecord(), emptyWorkspace(), 'r', 'Test'); resume.language = 'ar'; resume.headline = { en: 'Title', ar: 'عنوان' };
  resume.entries = [{ id: 's', kind: 'skills', name: { en: 'Skill', ar: 'مهارة' }, category: { en: 'Category', ar: 'فئة' } }, { id: 'c', kind: 'certifications', name: { en: 'Certificate' }, issuer: { en: '' } }];
  expect(resolveResume(resume).missingArabicCount).toBe(1);
  expect(formatMonth('invalid', 'en')).toBe('invalid'); expect(formatMonth('2026-12', 'en')).toBe('Dec 2026');
});
it('clears only the locally translated gap and never reads later source translations', () => {
  const record = emptyRecord(); record.basics.name = { en: 'Name' };
  const workspace = emptyWorkspace(), resume = copyResume(record, workspace, 'r', 'Test');
  resume.language = 'ar'; resume.summary = { en: 'Summary' }; resume.headline = { en: 'Headline' };
  expect(resolveResume(resume).missingArabicCount).toBe(3);
  record.basics.name.ar = 'اسم المصدر';
  expect(resolveResume(resume).missingArabicCount).toBe(3);
  resume.basics.name.ar = 'اسم محلي';
  const resolved = resolveResume(resume);
  expect(resolved.missingArabicCount).toBe(2); expect(resolved.name.missingArabic).toBe(false);
  expect(resolved.headline.missingArabic).toBe(true); expect(resolved.summary.missingArabic).toBe(true);
  resume.language = 'en'; expect(resolveResume(resume).name.value).toBe('Name');
  resume.language = 'ar'; expect(resolveResume(resume).name.value).toBe('اسم محلي');
});
it('omits hidden sections and their translation warnings without discarding their content', () => {
  const resume = copyResume(emptyRecord(), emptyWorkspace(), 'hidden', 'Hidden sections');
  resume.language = 'ar'; resume.summary = { en: 'Summary still saved' }; resume.entries = [{ id: 'skill', kind: 'skills', name: { en: 'Skill still saved' } }];
  resume.hiddenSections = ['summary', 'skills'];
  const resolved = resolveResume(resume); expect(resolved.summary.value).toBe(''); expect(resolved.sections.some((section) => section.kind === 'skills')).toBe(false); expect(resolved.missingArabicCount).toBe(0);
  resume.hiddenSections = []; expect(resolveResume(resume).missingArabicCount).toBe(2); expect(resolveResume(resume).summary.value).toBe('Summary still saved');
});
