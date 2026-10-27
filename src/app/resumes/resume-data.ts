import { createHash, randomUUID } from 'node:crypto';
import { readRecord, updateWorkspace } from '../../lib/storage';
import { copyResume, type Resume } from '../../lib/types';
import { parseAppearance } from './appearance';
import { parseRecord } from '../career-record/record-data';
export const resumeRevision = (resume: Resume) => createHash('sha256').update(JSON.stringify(resume)).digest('hex');
export function sortResumes(resumes: Resume[]): Resume[] {
  const time = (resume: Resume) => { const value = Date.parse(resume.updatedAt ?? ''); return Number.isFinite(value) ? value : 0; };
  return [...resumes].sort((left, right) => time(right) - time(left));
}
function title(form: FormData, key: string) {
  const value = form.get(key);
  if (typeof value !== 'string' || !value.trim() || value.length > 100) throw new Error('Enter a Resume name between 1 and 100 characters.');
  return value.trim();
}
export async function createResume(form: FormData) {
  try {
    const name = title(form, 'name'), record = await readRecord(), id = randomUUID();
    await updateWorkspace((workspace) => {
      const profileId = form.get('profileId');
      const profile = workspace.profiles.find((item) => item.id === profileId);
      if (profileId && !profile) throw new Error('Profile no longer exists. Reload and retry.');
      workspace.resumes.push({ ...copyResume(record, workspace, id, name, profile), updatedAt: new Date().toISOString() });
    });
    return { id };
  } catch (error) { return { error: error instanceof Error ? error.message : 'Could not create Resume. Retry.' }; }
}
export async function saveResume(id: string, form: FormData) {
  try {
    const content = parseRecord(form), name = title(form, 'resumeName'), appearance = parseAppearance(form);
    const language = form.get('language');
    if (language !== 'en' && language !== 'ar') throw new Error('Choose English or Arabic.');
    const slot = (key: string) => {
      const en = form.get(`${key}.en`) ?? '', ar = form.get(`${key}.ar`) ?? '';
      if (typeof en !== 'string' || typeof ar !== 'string' || en.length > 10000 || ar.length > 10000) throw new Error('Invalid headline or summary.');
      return ar.trim() ? { en, ar } : { en };
    };
    const headline = slot('headline'), summary = slot('summary');
    const workspace = await updateWorkspace((workspace) => {
      const resume = workspace.resumes.find((item) => item.id === id);
      if (!resume || resumeRevision(resume) !== form.get('_revision')) throw new Error('This Resume changed or was deleted in another tab. Copy unsaved text, then reload.');
      const profileId = String(form.get('profileId') ?? '') || null;
      if (profileId && !workspace.profiles.some((item) => item.id === profileId)) throw new Error('The selected Profile no longer exists.');
      const sectionOrder = form.getAll('sectionOrder').map(String);
      if (sectionOrder.length !== 6 || new Set(sectionOrder).size !== 6 || sectionOrder.some((kind) => !['summary', 'experience', 'education', 'projects', 'skills', 'certifications'].includes(kind))) throw new Error('Invalid section order.');
      const hiddenSections = form.getAll('hiddenSectionId').map(String);
      if (hiddenSections.some((kind) => !sectionOrder.includes(kind))) throw new Error('Invalid hidden section.');
      const hiddenEntryIds = form.getAll('hiddenEntryId').map(String);
      if (hiddenEntryIds.some((key) => !content.entries.some((entry) => entry.id === key))) throw new Error('Invalid hidden entry.');
      if (resume.language !== language) workspace.lastLanguage = language;
      const before = JSON.stringify(resume);
      Object.assign(resume, { name, language, profileId, basics: content.basics, entries: content.entries, headline, summary, hiddenEntryIds, sectionOrder, ...(appearance ? { appearance } : {}), ...(hiddenSections.length || resume.hiddenSections ? { hiddenSections } : {}) });
      if (JSON.stringify(resume) !== before) resume.updatedAt = new Date().toISOString();
    });
    return { revision: resumeRevision(workspace.resumes.find((item) => item.id === id)!) };
  } catch (error) { return { error: error instanceof Error ? error.message : 'Could not save. Your edits remain here. Retry.' }; }
}
export async function deleteResume(form: FormData) {
  try {
    await updateWorkspace((workspace) => {
      const resume = workspace.resumes.find((item) => item.id === form.get('id'));
      if (!resume || resumeRevision(resume) !== form.get('_revision')) throw new Error('Resume changed. Reload before deleting.');
      workspace.resumes = workspace.resumes.filter((item) => item.id !== resume.id);
    });
    return { success: true };
  } catch { return { error: 'Could not delete. Reload and retry.' }; }
}
