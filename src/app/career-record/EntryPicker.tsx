'use client';
import { useId, useState } from 'react';
import type { CareerEntry } from '../../lib/types';
const kinds = [['experience', 'Experience'], ['education', 'Education'], ['projects', 'Projects'], ['skills', 'Skills'], ['certifications', 'Certifications']] as const;
export function EntryPicker({ entries, selectedIds, open, onToggle }: { entries: CareerEntry[]; selectedIds: string[]; open: boolean; onToggle: (entry: CareerEntry, checked: boolean) => void }) {
  const id = useId(), [query, setQuery] = useState(''), [kind, setKind] = useState('all');
  const search = query.trim().toLowerCase();
  const matches = entries.filter((entry) => (kind === 'all' || entry.kind === kind) && (!search || JSON.stringify(entry).toLowerCase().includes(search)));
  const selected = entries.filter((entry) => selectedIds.includes(entry.id)).length;
  return <details open={open}><summary>Browse {entries.length} available entries</summary>
    <p>Selected entries become independent copies. You can adjust their wording below.</p>
    <div className="entry-filters" onChange={(event) => event.stopPropagation()}>
      <label htmlFor={`${id}-search`}>Search Career Record</label><input id={`${id}-search`} type="search" value={query} placeholder="Search English or Arabic wording" onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') event.preventDefault(); }} />
      <label htmlFor={`${id}-kind`}>Entry type</label><select id={`${id}-kind`} value={kind} onChange={(event) => setKind(event.target.value)}><option value="all">All types</option>{kinds.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      {query || kind !== 'all' ? <button type="button" onClick={() => { setQuery(''); setKind('all'); }}>Clear filters</button> : null}
    </div>
    <p aria-live="polite">{matches.length} of {entries.length} entries shown · {selected} selected</p>
    {!entries.length ? <p>Your Career Record has no entries yet. Existing copied content is kept.</p> : !matches.length ? <p>No matching entries. Try another search or clear the filters.</p> : null}
    {matches.map((source) => <label className="entry-choice" key={source.id}><input type="checkbox" checked={selectedIds.includes(source.id)} onChange={(event) => onToggle(source, event.target.checked)} /><span>{'name' in source ? source.name.en : 'employer' in source ? `${source.title.en} at ${source.employer.en}` : `${source.qualification.en} at ${source.institution.en}`} <span className="optional">({source.kind})</span></span></label>)}
  </details>;
}
