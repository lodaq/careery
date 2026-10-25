'use client';
import { useId, useRef, useState } from 'react';
import type { Bilingual } from '../lib/types';

export function BilingualInput({ name, label, value, required = false, multiline = false }: {
  name: string; label: string; value: Bilingual; required?: boolean; multiline?: boolean;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [arabic, setArabic] = useState(value.ar ?? '');
  const hasArabic = Boolean(arabic.trim());
  const Input = multiline ? 'textarea' : 'input';
  return <div className="bilingual-field">
    <div className="field-control"><label htmlFor={`${id}-en`}>{label} · English{required ? ' (required)' : ''}</label>
      <div className="translation-input-row">
        <Input id={`${id}-en`} name={`${name}.en`} defaultValue={value.en} required={required} maxLength={10000} autoComplete="off" lang="en" />
        <button type="button" className={`arabic-badge${hasArabic ? ' has-arabic' : ''}`} aria-label={`${label}: edit Arabic version`} aria-haspopup="dialog" aria-controls={`${id}-dialog`} title={hasArabic ? 'Arabic version added' : 'Add Arabic version'} onClick={() => dialog.current?.showModal()}>ar<span className="sr-only">{hasArabic ? ' — Arabic version added' : ' — no Arabic version yet'}</span></button>
      </div>
    </div>
    <dialog ref={dialog} id={`${id}-dialog`} className="translation-dialog" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>{label} — Arabic version</h2>
      <label htmlFor={`${id}-ar`}>{label} · Arabic <span className="optional">(optional)</span></label>
      <Input id={`${id}-ar`} name={`${name}.ar`} value={arabic} onChange={(event) => setArabic(event.target.value)} maxLength={10000} autoComplete="off" lang="ar" dir="rtl" />
      <p className="optional">Changes save automatically. Clear this field to remove the Arabic version.</p>
      <button type="button" onClick={() => dialog.current?.close()}>Done</button>
    </dialog>
  </div>;
}
