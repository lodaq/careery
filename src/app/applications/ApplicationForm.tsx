'use client';
import { useId, useState, type ReactNode, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { SaveIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { applicationAction } from './actions';

export function ApplicationForm({ id = null, revision = 0, operation = 'create', children, label = 'Save', destination, reset = false }: { id?: string | null; revision?: number; operation?: string; children?: ReactNode; label?: string; destination?: string; reset?: boolean }) {
  const router = useRouter(); const [pending, setPending] = useState(false); const [message, setMessage] = useState(''); const [failed, setFailed] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
    const at = data.get('at'); if (typeof at === 'string' && at) data.set('at', new Date(at).toISOString());
    setPending(true); setMessage('Saving…'); setFailed(false);
    try {
      const result = await applicationAction(id, revision, operation, data);
      if (result.error) { setMessage(result.error); setFailed(true); }
      else { setMessage('Saved'); if (reset) form.reset(); if (destination) router.push(destination === 'detail' ? `/applications/${result.id}` : destination); router.refresh(); }
    } catch { setMessage('Could not save. Your input is still here. Please retry.'); setFailed(true); }
    finally { setPending(false); }
  }
  return <form onSubmit={submit} className="application-form"><fieldset disabled={pending}>{children}<div className="application-form-actions"><Button type="submit" disabled={pending}><SaveIcon aria-hidden="true" />{pending ? 'Saving…' : label}</Button><span role={failed ? 'alert' : 'status'} className={failed ? 'text-destructive' : 'text-muted-foreground'}>{message}</span></div></fieldset></form>;
}
export function AppField({ name, label, value = '', type = 'text', required = false, multiline = false, options }: { name: string; label: string; value?: string; type?: string; required?: boolean; multiline?: boolean; options?: readonly string[] }) {
  const id = useId();
  return <div className={`application-field${multiline ? ' application-wide' : ''}`}><Label htmlFor={id}>{label}</Label>{options ? <NativeSelect id={id} name={name} defaultValue={value}>{options.map((option) => <option key={option} value={option}>{option || 'Not specified'}</option>)}</NativeSelect> : multiline ? <Textarea id={id} name={name} defaultValue={value} rows={4} /> : <Input id={id} name={name} type={type} defaultValue={value} required={required} maxLength={type === 'text' ? 500 : undefined} />}</div>;
}
