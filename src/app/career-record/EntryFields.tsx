'use client';
import { useState } from 'react';
import type { CareerEntry } from '../../lib/types';
import { BilingualInput } from '../../components/BilingualInput';

export function EntryFields({ entry, changed }: { entry: CareerEntry; changed: () => void }) {
  const [bullets, setBullets] = useState('bullets' in entry ? entry.bullets : []);
  return <>
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
      <label>Issued month<input type="month" name={`${entry.id}.date`} defaultValue={entry.date ?? ''} /></label>
    </> : null}
    {entry.kind === 'projects' || entry.kind === 'certifications' ? <label>Web address<input type="url" name={`${entry.id}.url`} defaultValue={entry.url ?? ''} maxLength={2000} autoComplete="url" dir="ltr" spellCheck={false} /></label> : null}
    {'dates' in entry ? <div className="field-grid">
      <label>Start month (required)<input type="month" name={`${entry.id}.start`} defaultValue={entry.dates.start} required /></label>
      <label>End month <span className="optional">(leave empty for present)</span><input type="month" name={`${entry.id}.end`} defaultValue={entry.dates.end ?? ''} /></label>
    </div> : null}
    {'bullets' in entry ? <div className="bullet-fields">
      <h3>Achievements</h3>
      {bullets.map((bullet, index) => <div className="bullet-row" key={bullet.id}>
        <input type="hidden" name={`${entry.id}.bulletId`} value={bullet.id} />
        <BilingualInput name={`${entry.id}.${bullet.id}`} label={`Achievement ${index + 1}`} value={bullet.text} required multiline />
        <div className="row-actions">
          <button type="button" disabled={index === 0} onClick={() => { setBullets((items) => { const next = [...items]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; }); changed(); }}>Move up</button>
          <button type="button" onClick={() => { if (window.confirm('Remove this achievement?')) { setBullets((items) => items.filter((item) => item.id !== bullet.id)); changed(); } }}>Remove achievement</button>
        </div>
      </div>)}
      <button type="button" onClick={() => { setBullets((items) => [...items, { id: crypto.randomUUID(), text: { en: '' } }]); changed(); }}>Add achievement</button>
    </div> : null}
  </>;
}
