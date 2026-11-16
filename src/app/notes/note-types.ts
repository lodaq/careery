export const noteColors = ['default', 'gray', 'amber', 'mint', 'blue', 'rose', 'lilac'] as const;
export type NoteColor = typeof noteColors[number];
export interface NoteItem { id: string; text: string; done: boolean }
export interface Note { id: string; title: string; text: string; pinned: boolean; color: NoteColor; items: NoteItem[]; updatedAt: string }

export const noteColorLabels: Record<NoteColor, string> = { default: 'Default', gray: 'Grey', amber: 'Amber', mint: 'Mint', blue: 'Blue', rose: 'Rose', lilac: 'Lilac' };

export interface NoteDraft { id: string; title: string; text: string; color: NoteColor; items: NoteItem[]; pinned: boolean }

export function emptyDraft(id: string): NoteDraft {
  return { id, title: '', text: '', color: 'default', items: [], pinned: false };
}

/** A quick note keeps its first line as the title, the way a hand-written card does. */
export function splitDraft(draft: NoteDraft): { title: string; text: string } {
  const lines = draft.text.split('\n');
  const title = draft.title.trim() || lines[0]?.trim() || '';
  const body = draft.title.trim() ? draft.text : lines.slice(1).join('\n').trim();
  return { title, text: body };
}
