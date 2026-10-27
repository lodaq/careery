'use client';
import { useId, useMemo, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { activeReviews, activityForDay, dayKey, type Library } from './question-model';
export function ActivityCalendar({ events, today }: { events: Library['events']; today: string }) {
  const [month, setMonth] = useState(today.slice(0, 7));
  const [selected, setSelected] = useState(today);
  const headingId = useId();
  const [year, number] = month.split('-').map(Number);
  const start = new Date(Date.UTC(year, number - 1, 1));
  const days = new Date(Date.UTC(year, number, 0)).getUTCDate();
  const offset = (start.getUTCDay() + 6) % 7;
  const counts = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const event of activeReviews(events)) { const key = dayKey(new Date(event.at)); const ids = map.get(key) ?? new Set<string>(); ids.add(event.questionId); map.set(key, ids); }
    return map;
  }, [events]);
  const activity = activityForDay(events, selected);
  function move(delta: number) { const date = new Date(Date.UTC(year, number - 1 + delta, 1)); setMonth(date.toISOString().slice(0, 7)); setSelected(date.toISOString().slice(0, 10)); }
  return <section aria-labelledby={headingId} className="mb-8 border-y border-border py-5">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 id={headingId}>Practice activity</h2><p className="text-sm text-muted-foreground">Daily totals use Cairo time.</p></div>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><div className="min-w-0"><div className="mb-2 flex items-center justify-between gap-2"><Button variant="ghost" aria-label="Previous activity month" onClick={() => move(-1)}><ChevronLeftIcon aria-hidden="true" /></Button><h3 className="font-medium">{new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(start)}</h3><Button variant="ghost" aria-label="Next activity month" onClick={() => move(1)}><ChevronRightIcon aria-hidden="true" /></Button></div>
      <Table><TableHeader><TableRow>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <TableHead key={day} className="px-0 text-center text-xs">{day}</TableHead>)}</TableRow></TableHeader><TableBody>{Array.from({ length: Math.ceil((offset + days) / 7) }, (_, week) => <TableRow key={week}>{Array.from({ length: 7 }, (_, weekday) => {
        const day = week * 7 + weekday - offset + 1; const key = `${month}-${String(day).padStart(2, '0')}`; const count = counts.get(key)?.size ?? 0;
        return <TableCell key={weekday} className="p-0.5 text-center">{day > 0 && day <= days && <Button variant={selected === key ? 'default' : count ? 'secondary' : 'ghost'} className="h-auto min-h-11 w-full flex-col gap-0 px-0 py-1 tabular-nums" aria-pressed={selected === key} aria-current={key === today ? 'date' : undefined} aria-label={`${key}: ${count} questions reviewed`} onClick={() => setSelected(key)}><span>{day}</span><span className="text-xs">{count ? `${count} Q` : '—'}</span></Button>}</TableCell>;
      })}</TableRow>)}</TableBody></Table>
    </div><div aria-live="polite"><h3 className="mb-2 font-medium">{selected}</h3><p className="mb-3 text-sm text-muted-foreground">{activity.distinct} distinct questions · {activity.attempts} attempts</p>{activity.questions.length ? <ul className="grid max-h-72 gap-2 overflow-y-auto text-sm">{activity.questions.map(([id, question]) => <li key={id}>{question}</li>)}</ul> : <p className="text-sm text-muted-foreground">No reviews on this day.</p>}</div></div>
  </section>;
}
