import type { Bilingual, CareerEntry, CareerRecord, DateRange } from '../../lib/types';

export function parseRecord(form: FormData): CareerRecord {
  function text(key: string, required = false): string {
    const value = form.get(key) ?? '';
    if (typeof value !== 'string' || value.length > 10_000) throw new Error(`${key}: text is too long or invalid.`);
    if (required && !value.trim()) throw new Error(`${key}: English text is required.`);
    return value;
  }
  function bilingual(key: string, required = false): Bilingual {
    const en = text(`${key}.en`, required), ar = text(`${key}.ar`);
    return ar.trim() ? { en, ar } : { en };
  }
  function ids(key: string): string[] {
    const values = form.getAll(key);
    if (values.length > 500 || values.some((value) => typeof value !== 'string' || !/^[a-zA-Z0-9-]{1,100}$/.test(value))) throw new Error('Invalid entry IDs.');
    const strings = values.map(String);
    if (new Set(strings).size !== strings.length) throw new Error('Duplicate IDs are not allowed.');
    return strings;
  }
  function url(key: string): string {
    const value = text(key).trim();
    if (!value) return '';
    try {
      const parsed = new URL(value);
      if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error();
    } catch { throw new Error(`${key}: use a full http or https URL.`); }
    return value;
  }
  function month(key: string, required = false): string {
    const value = text(key, required);
    if (value && !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) throw new Error(`${key}: use a valid month.`);
    return value;
  }
  function dates(id: string): DateRange {
    const start = month(`${id}.start`, true), end = month(`${id}.end`);
    if (end && end < start) throw new Error('The end month must be after the start month.');
    return end ? { start, end } : { start };
  }
  const email = text('email').trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
  const entries = ids('entryId').map((id): CareerEntry => {
    const kind = text(`${id}.kind`);
    const bullets = () => ids(`${id}.bulletId`).map((bulletId) => ({ id: bulletId, text: bilingual(`${id}.${bulletId}`, true) }));
    switch (kind) {
      case 'experience': return { id, kind, employer: bilingual(`${id}.employer`, true), title: bilingual(`${id}.title`, true), dates: dates(id), bullets: bullets() };
      case 'education': return { id, kind, institution: bilingual(`${id}.institution`, true), qualification: bilingual(`${id}.qualification`, true), dates: dates(id), bullets: bullets() };
      case 'projects': return { id, kind, name: bilingual(`${id}.name`, true), description: bilingual(`${id}.description`, true), url: url(`${id}.url`), bullets: bullets() };
      case 'skills': {
        const category = bilingual(`${id}.category`);
        return { id, kind, name: bilingual(`${id}.name`, true), ...(category.en || category.ar ? { category } : {}) };
      }
      case 'certifications': return { id, kind, name: bilingual(`${id}.name`, true), issuer: bilingual(`${id}.issuer`, true), date: month(`${id}.date`), url: url(`${id}.url`) };
      default: throw new Error('Unknown entry kind.');
    }
  });
  return {
    version: 1,
    basics: {
      name: bilingual('name'), title: bilingual('title'), location: bilingual('location'),
      email, phone: text('phone'), links: ids('linkId').map((id) => {
        const address = url(`${id}.url`);
        if (!address) throw new Error('Enter a web address or remove the empty link.');
        return { label: text(`${id}.label`), url: address };
      }),
    },
    entries,
  };
}
