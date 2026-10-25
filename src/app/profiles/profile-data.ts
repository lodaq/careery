import { createHash, randomUUID } from 'node:crypto';
import { readRecord, updateWorkspace } from '../../lib/storage';
import { copyProfile } from '../../lib/types';
import type { Profile } from '../../lib/types';
import { parseRecord } from '../career-record/record-data';

export function profileRevision(profile: Profile): string {
  return createHash('sha256').update(JSON.stringify(profile)).digest('hex');
}
function name(form: FormData, key: string): string {
  const value = form.get(key);
  if (typeof value !== 'string' || !value.trim() || value.length > 100) throw new Error('Enter a Profile name between 1 and 100 characters.');
  return value.trim();
}
export async function createProfile(form: FormData): Promise<{ id?: string; error?: string }> {
  let title: string;
  try { title = name(form, 'name'); } catch (error) { return { error: error instanceof Error ? error.message : 'Check the Profile name.' }; }
  try {
    const record = await readRecord();
    const id = randomUUID();
    await updateWorkspace((workspace) => { workspace.profiles.push(copyProfile(record, id, title, [])); });
    return { id };
  } catch { return { error: 'Could not create the Profile. Check disk access and retry.' }; }
}
export async function saveProfile(id: string, form: FormData): Promise<{ revision?: string; error?: string }> {
  let content, title: string, headline, summary;
  try {
    content = parseRecord(form); title = name(form, 'profileName');
    const slot = (key: string) => {
      const en = form.get(`${key}.en`) ?? '', ar = form.get(`${key}.ar`) ?? '';
      if (typeof en !== 'string' || typeof ar !== 'string' || en.length > 10000 || ar.length > 10000) throw new Error('Headline and summary must contain valid text.');
      return ar.trim() ? { en, ar } : { en };
    };
    headline = slot('headline'); summary = slot('summary');
  } catch (error) { return { error: error instanceof Error ? error.message : 'Check your entered values.' }; }
  let conflict = false;
  try {
    const workspace = await updateWorkspace((workspace) => {
      const profile = workspace.profiles.find((profile) => profile.id === id);
      if (!profile || profileRevision(profile) !== form.get('_revision')) { conflict = true; throw new Error('Changed'); }
      Object.assign(profile, { name: title, basics: content.basics, entries: content.entries, headline, summary });
    });
    const profile = workspace.profiles.find((profile) => profile.id === id);
    if (!profile) throw new Error('Missing Profile');
    return { revision: profileRevision(profile) };
  } catch { return { error: conflict ? 'This Profile changed or was deleted in another tab. Copy unsaved text, then reload.' : 'Could not save. Your edits are still here. Check disk access and retry.' }; }
}
export async function deleteProfile(form: FormData): Promise<{ success?: boolean; error?: string }> {
  let conflict = false;
  try {
    await updateWorkspace((workspace) => {
      const profile = workspace.profiles.find((profile) => profile.id === form.get('id'));
      const count = workspace.resumes.filter((resume) => resume.profileId === profile?.id).length;
      if (!profile || profileRevision(profile) !== form.get('_revision') || String(count) !== form.get('resumeCount')) { conflict = true; throw new Error('Changed'); }
      for (const resume of workspace.resumes) if (resume.profileId === profile.id) resume.profileId = null;
      workspace.profiles = workspace.profiles.filter((item) => item.id !== profile.id);
    });
    return { success: true };
  } catch { return { error: conflict ? 'This Profile or its Resume count changed. Reload before deleting.' : 'Could not delete the Profile. Please retry.' }; }
}
