'use server';
import { revalidatePath } from 'next/cache';
import { createProfile, deleteProfile, saveProfile } from './profile-data';

export async function createProfileAction(form: FormData) {
  const result = await createProfile(form);
  if (result.id) revalidatePath('/');
  return result;
}
export async function deleteProfileAction(form: FormData) {
  const result = await deleteProfile(form);
  if (result.success) { revalidatePath('/'); revalidatePath('/unfiled'); }
  return result;
}
export async function saveProfileAction(id: string, form: FormData) {
  const result = await saveProfile(id, form);
  if (result.revision) { revalidatePath('/'); revalidatePath(`/profiles/${id}`); }
  return result;
}
