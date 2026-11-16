'use server';
import { revalidatePath } from 'next/cache';
import { changeNote, type Note } from '../notes/data';
export async function lessonAction(operation: string, note: Note) {
  try { await changeNote(operation, note, undefined, 'lessons.json'); revalidatePath('/lessons'); return { success: true }; }
  catch { return { error: 'Could not save your lesson. Try again.' }; }
}
