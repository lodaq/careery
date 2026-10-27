'use client';
import { useId, useState, useRef } from 'react';
import type { Bilingual } from '../lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { LanguagesIcon } from 'lucide-react';

export function BilingualInput({ name, label, value, required = false, multiline = false }: {
  name: string; label: string; value: Bilingual; required?: boolean; multiline?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const arabicControl = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [arabic, setArabic] = useState(value.ar ?? '');
  const Control = multiline ? Textarea : Input;
  return <Collapsible className="bilingual-field" open={open} onOpenChange={(next) => { setOpen(next); if(next) queueMicrotask(() => arabicControl.current?.focus()); }} onKeyDown={(event) => { if(event.key === 'Escape') { setOpen(false); event.currentTarget.querySelector<HTMLButtonElement>('[data-slot=collapsible-trigger]')?.focus(); } }}>
    <FieldGroup>
      <Field>
        <div className="field-label-row">
          <FieldLabel htmlFor={`${id}-en`}>{label}</FieldLabel>
          <CollapsibleTrigger render={<Button variant="ghost" size="sm" className={arabic.trim() ? 'arabic-badge has-arabic' : 'arabic-badge'} />} aria-label={`${label}: edit Arabic version`}>
            <LanguagesIcon data-icon="inline-start" /> Arabic
          </CollapsibleTrigger>
        </div>
        <Control id={`${id}-en`} name={`${name}.en`} defaultValue={value.en} required={required} maxLength={10000} autoComplete="off" lang="en" />
      </Field>
      <CollapsibleContent keepMounted>
        <Field>
          <FieldLabel htmlFor={`${id}-ar`}>{label} · Arabic <span className="optional">(optional)</span></FieldLabel>
          <Control ref={(node: HTMLInputElement | HTMLTextAreaElement | null) => { arabicControl.current = node; }} id={`${id}-ar`} name={`${name}.ar`} value={arabic} onChange={(event) => setArabic(event.target.value)} maxLength={10000} autoComplete="off" lang="ar" dir="rtl" />
        </Field>
      </CollapsibleContent>
    </FieldGroup>
  </Collapsible>;
}
