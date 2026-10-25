import { expect, it } from 'vitest';
import { parseRecord } from './record-data';

function data() {
  const form = new FormData();
  form.set('name.en', 'Name'); form.set('email', 'name@example.com');
  form.append('entryId', 'experience-1'); form.set('experience-1.kind', 'experience');
  form.set('experience-1.employer.en', 'Company'); form.set('experience-1.title.en', 'Developer');
  form.set('experience-1.start', '2022-01');
  form.append('experience-1.bulletId', 'bullet-1');
  form.set('experience-1.bullet-1.en', 'Built an application');
  form.set('experience-1.bullet-1.ar', 'بناء تطبيق');
  return form;
}
it('parses bilingual Experience and preserves stable bullet IDs', () => {
  const record = parseRecord(data());
  expect(record.entries[0]).toMatchObject({ id: 'experience-1', bullets: [{ id: 'bullet-1', text: { en: 'Built an application', ar: 'بناء تطبيق' } }] });
});
it('rejects invalid dates, contact values and unsafe URLs at the server boundary', () => {
  const form = data(); form.set('experience-1.end', '2020-01');
  expect(() => parseRecord(form)).toThrow('end');
  form.delete('experience-1.end'); form.set('email', 'not-an-email');
  expect(() => parseRecord(form)).toThrow('email');
  form.set('email', ''); form.append('linkId', 'link-1'); form.set('link-1.url', 'javascript:alert(1)');
  expect(() => parseRecord(form)).toThrow('http');
});
it('rejects unknown entry kinds and duplicate IDs instead of losing data', () => {
  const form = data(); form.set('experience-1.kind', 'unknown');
  expect(() => parseRecord(form)).toThrow('kind');
  form.set('experience-1.kind', 'experience'); form.append('entryId', 'experience-1');
  expect(() => parseRecord(form)).toThrow('IDs');
});

it('parses all remaining entry kinds with English and optional Arabic wording', () => {
  const form = new FormData();
  for (const kind of ['education', 'projects', 'skills', 'certifications']) {
    form.append('entryId', kind); form.set(`${kind}.kind`, kind);
  }
  form.set('education.institution.en', 'University'); form.set('education.qualification.en', 'Degree'); form.set('education.start', '2018-09');
  form.set('projects.name.en', 'Portfolio'); form.set('projects.description.en', 'Personal site'); form.set('projects.url', 'https://example.com');
  form.set('skills.name.en', 'JavaScript'); form.set('skills.category.ar', 'تطوير');
  form.set('certifications.name.en', 'Certificate'); form.set('certifications.issuer.en', 'Issuer'); form.set('certifications.date', '2024-05');
  const record = parseRecord(form);
  expect(record.entries.map((entry) => entry.kind)).toEqual(['education', 'projects', 'skills', 'certifications']);
  expect(record.entries[2]).toMatchObject({ category: { en: '', ar: 'تطوير' } });
});
