'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Field, FieldLabel } from '@/components/ui/field';

import { useId, useState } from 'react';
import type { CareerEntry } from '../../lib/types';
const kinds = [['experience', 'Experience'], ['education', 'Education'], ['projects', 'Projects'], ['skills', 'Skills'], ['certifications', 'Certifications']] as const;
export function EntryPicker({ entries, selectedIds, open, onToggle }: { entries: CareerEntry[]; selectedIds: string[]; open: boolean; onToggle: (entry: CareerEntry, checked: boolean) => void }) {
  const id = useId(), [query, setQuery] = useState(''), [kind, setKind] = useState('all');
  const search = query.trim().toLowerCase();
  const matches = entries.filter((entry) => (kind === 'all' || entry.kind === kind) && (!search || JSON.stringify(entry).toLowerCase().includes(search)));
  const selected = entries.filter((entry) => selectedIds.includes(entry.id)).length;
  return <Collapsible defaultOpen={open}><CollapsibleTrigger render={<Button variant="ghost" />}>Browse {entries.length} available entries</CollapsibleTrigger><CollapsibleContent keepMounted>
    <p>Selected entries become independent copies. You can adjust their wording below.</p>
    <div className="entry-filters" onChange={(event) => event.stopPropagation()}>
      <FieldLabel htmlFor={`${id}-search`}>Search Career Record</FieldLabel><Input id={`${id}-search`} type="search" value={query} placeholder="Search English or Arabic wording" onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') event.preventDefault(); }} />
      <FieldLabel htmlFor={`${id}-kind`}>Entry type</FieldLabel><NativeSelect id={`${id}-kind`} value={kind} onChange={(event) => setKind(event.target.value)}><NativeSelectOption value="all">All types</NativeSelectOption>{kinds.map(([value, label]) => <NativeSelectOption key={value} value={value}>{label}</NativeSelectOption>)}</NativeSelect>
      {query || kind !== 'all' ? <Button variant="outline" type="button" onClick={() => { setQuery(''); setKind('all'); }}>Clear filters</Button> : null}
    </div>
    <p aria-live="polite">{matches.length} of {entries.length} entries shown · {selected} selected</p>
    {!entries.length ? <p>Your Career Record has no entries yet. Existing copied content is kept.</p> : !matches.length ? <p>No matching entries. Try another search or clear the filters.</p> : null}
    {matches.map((source) => <Field orientation="horizontal" className="entry-choice" key={source.id}><Checkbox id={`${id}-${source.id}`} aria-label={`${'name' in source ? source.name.en : 'employer' in source ? `${source.title.en} at ${source.employer.en}` : `${source.qualification.en} at ${source.institution.en}`} (${source.kind})`} checked={selectedIds.includes(source.id)} onCheckedChange={(checked) => onToggle(source, checked)} /><FieldLabel htmlFor={`${id}-${source.id}`}><span>{'name' in source ? source.name.en : 'employer' in source ? `${source.title.en} at ${source.employer.en}` : `${source.qualification.en} at ${source.institution.en}`} <span className="optional">({source.kind})</span></span></FieldLabel></Field>)}
  </CollapsibleContent></Collapsible>;
}
