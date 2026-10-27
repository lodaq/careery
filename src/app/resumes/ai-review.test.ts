import { expect, it } from 'vitest';
import { copyResume, emptyRecord, emptyWorkspace } from '@/lib/types';
import { parseAiReview, reviewContent } from './ai-review';
const valid = { score: 75, overview: 'Clear focus.', strengths: ['Specific work.'], findings: [{ section: 'summary', title: 'Tighten wording', detail: 'A repeated phrase.', suggestion: 'Remove the repeated phrase.', priority: 'medium' }], summaryRewrite: 'A concise summary.' };
it('validates model output before it can be rendered or applied', () => {
  expect(parseAiReview(valid, 'test/model').score).toBe(75);
  for (const invalid of [{ ...valid, score: 101 }, { ...valid, score: '75' }, { ...valid, findings: [{ ...valid.findings[0], section: 'unknown' }] }, { ...valid, strengths: ['x'.repeat(501)] }, { ...valid, overview: null }]) expect(() => parseAiReview(invalid, 'test')).toThrow('Invalid review');
});
it('excludes identity, contact data, links and hidden writing from outgoing content', () => {
  const record = emptyRecord(); record.basics.name.en = 'PRIVATE NAME'; record.basics.email = 'private@example.com'; record.basics.phone = 'SECRET PHONE'; record.basics.location.en = 'PRIVATE ADDRESS'; record.basics.links = [{ label: 'Private', url: 'https://private.example.com' }];
  const resume = copyResume(record, emptyWorkspace(), 'r', 'PRIVATE TITLE');
  resume.summary.en = 'Visible summary'; resume.entries = [{ id: 'secret', kind: 'skills', name: { en: 'HIDDEN SKILL' } }, { id: 'visible', kind: 'skills', name: { en: 'TypeScript' } }]; resume.hiddenEntryIds = ['secret'];
  const outgoing = JSON.stringify(reviewContent(resume));
  expect(outgoing).toContain('TypeScript'); expect(outgoing).toContain('Visible summary');
  for (const secret of ['PRIVATE', 'private@example.com', 'SECRET PHONE', 'private.example.com', 'HIDDEN SKILL']) expect(outgoing).not.toContain(secret);
});

it('allows only exact existing descriptive fields in the finding section', async () => {
  const { validatedFindingEdits } = await import('./ai-review');
  const resume = copyResume(emptyRecord(), emptyWorkspace(), 'r', 'Review');
  resume.summary.en = 'Original summary.';
  const finding = parseAiReview({ ...valid, findings: [{ ...valid.findings[0], edits: [{ field: 'summary.en', before: 'Original summary.', after: 'Concise summary.' }] }] }, 'test').findings[0];
  expect(validatedFindingEdits(resume, finding)).toHaveLength(1);
  expect(validatedFindingEdits(resume, { ...finding, section: 'projects' })).toEqual([]);
  resume.summary.en = 'Changed by user.';
  expect(validatedFindingEdits(resume, finding)).toEqual([]);
  for (const field of ['basics.name.en', '__proto__.en', 'new-cert.name.en']) expect(validatedFindingEdits(resume, { ...finding, edits: [{ field, before: 'Changed by user.', after: 'Invented' }] })).toEqual([]);
});

it('extracts only existing visible skill phrases and rejects invented or duplicate skills', async () => {
  const { validatedFindingSkills } = await import('./ai-review');
  const resume = copyResume(emptyRecord(), emptyWorkspace(), 'r', 'Review');
  resume.summary.en = 'Built accessible interfaces with TypeScript.';
  const finding = parseAiReview({ ...valid, findings: [{ ...valid.findings[0], section: 'skills', addSkills: [
    { name: 'TypeScript', evidence: 'Built accessible interfaces with TypeScript.' },
    { name: 'React', evidence: 'Built accessible interfaces with TypeScript.' },
    { name: 'TypeScript', evidence: 'Built accessible interfaces with TypeScript.' },
  ] }] }, 'test').findings[0];
  expect(validatedFindingSkills(resume, finding).map((skill) => skill.name)).toEqual(['TypeScript']);
  resume.hiddenSections = ['summary'];
  expect(validatedFindingSkills(resume, finding)).toEqual([]);
});
