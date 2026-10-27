'use client';
import { useId } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import type { Question, Tag } from './question-model';
export function QuestionEditor({ question, tags, pending, save, cancel }: { question?: Question; tags: Tag[]; pending: boolean; save: (form: FormData) => Promise<void>; cancel: () => void }) {
  const id = useId();
  return <form action={save} className="mb-6 grid gap-5 rounded-lg border border-border bg-card p-5 sm:p-6">
    <h2>{question ? 'Edit question' : 'Add question'}</h2>
    <input type="hidden" name="operation" value={question ? 'edit' : 'create'} />
    {question && <><input type="hidden" name="id" value={question.id} /><input type="hidden" name="revision" value={question.revision} /></>}
    <fieldset disabled={pending} className="grid min-w-0 gap-4">
      <div className="grid gap-2"><label htmlFor={`${id}-question`}>Question</label><Input id={`${id}-question`} name="question" defaultValue={question?.question} required maxLength={500} autoFocus /></div>
      <div className="grid gap-2"><label htmlFor={`${id}-answer`}>Answer</label><Textarea id={`${id}-answer`} name="answer" defaultValue={question?.answer} required maxLength={10000} rows={7} /></div>
      <div className="grid max-w-xs gap-2"><label htmlFor={`${id}-frequency`}>Times asked in interviews</label><Input id={`${id}-frequency`} name="frequency" type="number" min={0} step={1} max={Number.MAX_SAFE_INTEGER} defaultValue={question?.frequency ?? 0} required /><p className="text-sm text-muted-foreground">Your manual total; practice does not change it.</p></div>
      <fieldset className="grid gap-3"><legend className="mb-2">Tags</legend><div className="flex flex-wrap gap-x-5 gap-y-3">{tags.map((tag) => <label key={tag.id} className="flex min-h-8 items-center gap-2 text-sm"><span className="inline-flex"><Checkbox name="tagIds" value={tag.id} defaultChecked={question?.tagIds.includes(tag.id)} /></span>{tag.name}</label>)}</div></fieldset>
      <div className="flex flex-wrap gap-2"><Button type="submit">{pending ? 'Saving…' : 'Save question'}</Button><Button type="button" variant="outline" onClick={cancel}>Cancel</Button></div>
    </fieldset>
  </form>;
}
