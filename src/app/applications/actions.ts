'use server';
import { revalidatePath } from 'next/cache';
import { changeApplication, createApplication } from './application-data';
export async function applicationAction(id: string | null, revision: number, operation: string, form: FormData): Promise<{ error?: string; id?: string; success?: boolean }> {
  try {
    const values: Record<string, string> = {};
    for (const [key, val] of form.entries()) if (typeof val === 'string') values[key] = val;
    if (id) await changeApplication(id, revision, operation, values);
    else { const app = await createApplication(values); id = app.id; }
    for (const path of ['/applications', '/today', '/analytics', `/applications/${id}`]) revalidatePath(path);
    return { success: true, id };
  } catch (error) { return { error: error instanceof Error ? error.message : 'Could not save. Please retry.' }; }
}
