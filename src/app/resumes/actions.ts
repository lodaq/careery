'use server';
import { revalidatePath } from 'next/cache';
import { createResume, saveResume, deleteResume } from './resume-data';
function refresh() { revalidatePath('/', 'layout'); }
export async function createResumeAction(form: FormData) { const result = await createResume(form); if (result.id) refresh(); return result; }
export async function saveResumeAction(id: string, form: FormData) { const result = await saveResume(id, form); if (result.revision) refresh(); return result; }
export async function deleteResumeAction(form: FormData) { const result = await deleteResume(form); if (result.success) refresh(); return result; }
