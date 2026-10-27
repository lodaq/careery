import { expect, it } from 'vitest';
import { copyResume, emptyRecord, emptyWorkspace } from '@/lib/types';
import { analyzeWorkspace } from './analytics-data';

it('handles an empty workspace without invented percentages or activity', () => {
  const result = analyzeWorkspace(emptyRecord(), emptyWorkspace());
  expect(result.resumes).toEqual([]);
  expect(result.reusedEntries).toBe(0);
  expect(result.translation).toEqual({ translated: 0, total: 0 });
  expect(result.sections.every((section) => section.record === 0 && section.visible === 0)).toBe(true);
});

it('counts visible content, independent copies, translation gaps and known timestamps without mutation', () => {
  const record = emptyRecord(), workspace = emptyWorkspace();
  record.entries = [{ id: 's', kind: 'skills', name: { en: 'TypeScript', ar: 'تايب سكريبت' } }];
  const resume = copyResume(record, workspace, 'r', 'Engineer');
  resume.entries = [structuredClone(record.entries[0]), { id: 'local', kind: 'skills', name: { en: 'Local skill' } }];
  resume.basics.name = { en: 'Name' }; resume.language = 'ar'; resume.updatedAt = '2026-10-27T10:00:00.000Z';
  resume.hiddenEntryIds = ['local'];
  workspace.resumes = [resume, { ...structuredClone(resume), id: 'r2', updatedAt: 'invalid', hiddenSections: ['skills'] }];
  const before = structuredClone({ record, workspace });
  const result = analyzeWorkspace(record, workspace);
  expect(result.reusedEntries).toBe(1);
  expect(result.translation).toEqual({ translated: 1, total: 1 });
  expect(result.sections.find((section) => section.kind === 'skills')).toMatchObject({ record: 1, visible: 1, profiles: 0 });
  expect(result.resumes[0]).toMatchObject({ visible: 1, excluded: 1, missingArabic: 1, updatedAt: resume.updatedAt });
  expect(result.resumes[1]).toMatchObject({ visible: 0, excluded: 2, updatedAt: undefined });
  expect({ record, workspace }).toEqual(before);
});

it('recognizes source IDs and checks Arabic coverage even for English Resumes', () => {
  const record = emptyRecord(), workspace = emptyWorkspace();
  record.entries = [{ id: 'source', kind: 'skills', name: { en: 'Skill' } }];
  const resume = copyResume(record, workspace, 'r', 'English');
  resume.entries = [{ id: 'copy', sourceId: 'source', kind: 'skills', name: { en: 'Edited skill' } }];
  workspace.resumes = [resume];
  expect(analyzeWorkspace(record, workspace).reusedEntries).toBe(1);
  expect(analyzeWorkspace(record, workspace).resumes[0].missingArabic).toBe(1);
});
