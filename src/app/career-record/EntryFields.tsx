'use client';
import { useConfirmAction } from '@/components/ConfirmAction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, FieldLabel } from '@/components/ui/field';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SortableList } from '@/components/ui/sortable-list';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import type { CareerEntry } from '../../lib/types';
import { BilingualInput } from '../../components/BilingualInput';

export function EntryFields({ entry, changed }: { entry: CareerEntry; changed: () => void }) {
  const { confirm, confirmation } = useConfirmAction();
  const [newBulletIds, setNewBulletIds] = useState<string[]>([]);
  const [bullets, setBullets] = useState('bullets' in entry ? entry.bullets : []);
  return <>{confirmation}
    {entry.kind === 'experience' ? <>
      <BilingualInput name={`${entry.id}.employer`} label="Employer" value={entry.employer} required />
      <BilingualInput name={`${entry.id}.title`} label="Job title" value={entry.title} required />
    </> : null}
    {entry.kind === 'education' ? <>
      <BilingualInput name={`${entry.id}.institution`} label="Institution" value={entry.institution} required />
      <BilingualInput name={`${entry.id}.qualification`} label="Qualification" value={entry.qualification} required />
    </> : null}
    {'name' in entry ? <BilingualInput name={`${entry.id}.name`} label={entry.kind === 'skills' ? 'Skill' : 'Name'} value={entry.name} required /> : null}
    {entry.kind === 'projects' ? <BilingualInput name={`${entry.id}.description`} label="Description" value={entry.description} required multiline /> : null}
    {entry.kind === 'skills' ? <BilingualInput name={`${entry.id}.category`} label="Category" value={entry.category ?? { en: '' }} /> : null}
    {entry.kind === 'certifications' ? <>
      <BilingualInput name={`${entry.id}.issuer`} label="Issuer" value={entry.issuer} required />
      <FieldLabel>Issued month<Input type="month" name={`${entry.id}.date`} defaultValue={entry.date ?? ''} /></FieldLabel>
    </> : null}
    {entry.kind === 'projects' || entry.kind === 'certifications' ? <FieldLabel>Web address<Input type="url" name={`${entry.id}.url`} defaultValue={entry.url ?? ''} maxLength={2000} autoComplete="url" dir="ltr" spellCheck={false} /></FieldLabel> : null}
    {'dates' in entry ? <FieldGroup className="field-grid">
      <FieldLabel>Start month<Input type="month" name={`${entry.id}.start`} defaultValue={entry.dates.start} required /></FieldLabel>
      <FieldLabel>End month<Input type="month" name={`${entry.id}.end`} defaultValue={entry.dates.end ?? ''} /><span className="optional">Leave empty for present</span></FieldLabel>
    </FieldGroup> : null}
    {'bullets' in entry ? <div className="bullet-fields">
      <div className="achievement-section-heading"><h3>Achievements</h3><Button variant="outline" type="button" onClick={() => { const id = crypto.randomUUID(); setNewBulletIds((items) => [...items, id]); setBullets((items) => [...items, { id, text: { en: '' } }]); changed(); }}>Add achievement</Button></div>
      <SortableList items={bullets} label="Achievements" itemLabel={(_bullet, index) => `achievement ${index + 1}`} onReorder={(items) => { setBullets(items); changed(); }} renderItem={(bullet, index, handle) => <Collapsible className="bullet-row" key={bullet.id} onChangeCapture={(event) => { const input = event.target; if (input instanceof HTMLTextAreaElement && input.name.startsWith(`${entry.id}.${bullet.id}.`)) { const language = input.name.endsWith('.ar') ? 'ar' : 'en'; setBullets((items) => items.map((item) => item.id === bullet.id ? { ...item, text: { ...item.text, [language]: input.value } } : item)); } }} defaultOpen={newBulletIds.includes(bullet.id)}>
        <div className="achievement-header">{handle}<CollapsibleTrigger render={<Button variant="ghost" />}><span>Achievement {index + 1}<small>{bullet.text.en || bullet.text.ar || 'New achievement'}</small></span><ChevronDownIcon className="entry-chevron" aria-hidden="true" /></CollapsibleTrigger></div>
        <CollapsibleContent keepMounted>
        <input type="hidden" name={`${entry.id}.bulletId`} value={bullet.id} />
        <BilingualInput name={`${entry.id}.${bullet.id}`} label={`Achievement ${index + 1}`} value={bullet.text} required multiline />
        <div className="row-actions achievement-actions">

          <Button variant="destructive" type="button" onClick={async () => { if (await confirm('Remove this achievement?')) { setBullets((items) => items.filter((item) => item.id !== bullet.id)); changed(); } }}>Remove achievement</Button>
        </div>
      </CollapsibleContent></Collapsible>} />

    </div> : null}
  </>;
}
