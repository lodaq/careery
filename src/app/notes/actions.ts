'use server';
import { revalidatePath } from 'next/cache';
import { changeNote, type Note } from './data';
export async function noteAction(operation: string, note: Note) {
  try { await changeNote(operation, note); revalidatePath('/notes'); return { success: true }; }
  catch { return { error: 'Could not save your notes. Your changes are still here; try again.' }; }
}
