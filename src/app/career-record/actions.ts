'use server';

import { updateRecord } from '../../lib/storage';
import { parseRecord, recordRevision } from './record-data';

export async function saveCareerRecord(form: FormData): Promise<{ revision?: string; error?: string }> {
  let next;
  try { next = parseRecord(form); }
  catch (error) { return { error: error instanceof Error ? error.message : 'Check the entered values.' }; }
  let conflict = false;
  try {
    const saved = await updateRecord((record) => {
      if (form.get('_revision') !== recordRevision(record)) {
        conflict = true;
        throw new Error('Revision conflict');
      }
      Object.assign(record, next);
    });
    return { revision: recordRevision(saved) };
  } catch {
    return { error: conflict ? 'The Career Record changed in another tab. Copy your unsaved text, then reload before editing again.' : 'Could not save. Your edits are still here. Check disk access, then retry.' };
  }
}
