'use client';
import { metaHelper, rowExpandingFeature, tableFeatures, useTable, type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { displayDue, questionStatus, type Question, type Tag } from './question-model';
type TableContext = { tags: Tag[]; now: Date; disabled: boolean; edit: (q: Question) => void; remove: (q: Question) => void; practice: (q: Question) => void };
const features = tableFeatures({ rowExpandingFeature, tableMeta: metaHelper<TableContext>() });

const columns: ColumnDef<typeof features, Question>[] = [
    { accessorKey: 'question', header: 'Question', cell: ({ row }) => <><Button variant="ghost" className="h-auto min-h-10 w-full justify-start whitespace-normal text-left font-medium" aria-expanded={row.getIsExpanded()} aria-controls={`question-answer-${row.id}`} onClick={row.getToggleExpandedHandler()}>{row.original.question}</Button>{row.getIsExpanded() && <div id={`question-answer-${row.id}`}><p className="max-w-prose whitespace-pre-wrap break-words py-3 leading-relaxed">{row.original.answer}</p>{row.original.source && <a href={row.original.source} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4">Answer reference</a>}</div>}</> },
    { accessorKey: 'tagIds', header: 'Tags', cell: ({ row, table }) => <div className="flex flex-wrap gap-1 py-2">{row.original.tagIds.length ? row.original.tagIds.map((id) => <Badge key={id} variant="secondary">{table.options.meta!.tags.find((tag) => tag.id === id)?.name}</Badge>) : <span className="text-muted-foreground">Untagged</span>}</div> },
    { id: 'status', header: 'Status', cell: ({ row, table }) => <span className="block py-2">{questionStatus(row.original, table.options.meta!.now)}</span> },
    { id: 'due', header: 'Next review · Cairo', cell: ({ row }) => <span className="block py-2">{row.original.card ? displayDue(row.original.card.due) : 'Not reviewed'}</span> },
    { accessorKey: 'frequency', header: 'Times asked', cell: ({ row }) => <span className="block py-2 tabular-nums">{row.original.frequency}</span> },
    { id: 'actions', header: 'Actions', cell: ({ row, table }) => <div className="flex gap-1"><Button variant="outline" size="sm" disabled={table.options.meta!.disabled} aria-label={`Practice: ${row.original.question}`} onClick={() => table.options.meta!.practice(row.original)}>Practice</Button><Button variant="ghost" size="sm" disabled={table.options.meta!.disabled} aria-label={`Edit: ${row.original.question}`} onClick={() => table.options.meta!.edit(row.original)}>Edit</Button><Button variant="ghost" size="sm" disabled={table.options.meta!.disabled} aria-label={`Delete: ${row.original.question}`} onClick={() => table.options.meta!.remove(row.original)}>Delete</Button></div> },
];

export function QuestionsTable({ questions, tags, now, disabled, edit, remove, practice }: { questions: Question[]; tags: Tag[]; now: Date; disabled: boolean; edit: (q: Question) => void; remove: (q: Question) => void; practice: (q: Question) => void }) {
  const table = useTable({ features, columns, data: questions, getRowCanExpand: () => true, autoResetExpanded: false, meta: { tags, now, disabled, edit, remove, practice }, getRowId: (question) => question.id });
  return <Table><TableCaption>{questions.length} questions · Scroll horizontally on smaller screens to reach every column.</TableCaption>
    <TableHeader>{table.getHeaderGroups().map((group) => <TableRow key={group.id}>{group.headers.map((header) => <TableHead key={header.id}>{header.isPlaceholder ? null : <table.FlexRender header={header} />}</TableHead>)}</TableRow>)}</TableHeader>
    <TableBody>{table.getRowModel().rows.map((row) => <TableRow key={row.id}>{row.getAllCells().map((cell) => <TableCell key={cell.id} className={cell.column.id === 'question' ? 'min-w-64 max-w-lg whitespace-normal align-top' : cell.column.id === 'tagIds' ? 'min-w-36 max-w-56 whitespace-normal align-top' : 'align-top'}><table.FlexRender cell={cell} /></TableCell>)}</TableRow>)}</TableBody>
  </Table>;
}
