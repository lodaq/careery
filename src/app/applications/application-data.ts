import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { dataDirectory, readJson, readWorkspace, updateJson } from '@/lib/storage';
import { cairoDate, closedStatuses, detailFields, statuses } from './application-types';
import type { ApplicationStore, JobApplication, ApplicationStatus, ApplicationEvent, Interview, Contact } from './application-types';

export async function readApplications(): Promise<ApplicationStore> {
  const store = await readJson<ApplicationStore>(join(dataDirectory(), 'applications.json'), () => ({ version: 1, applications: [] }));
  if (!Array.isArray(store.applications) || store.applications.some((app) => !app.id || !statuses.includes(app.status) || !Number.isInteger(app.revision) || !app.details || ![app.tasks, app.events, app.interviews, app.contacts, app.documents].every(Array.isArray))) throw new Error('Invalid application data; original file was preserved.');
  return store;
}
const update = (mutate: (store: ApplicationStore) => void) => updateJson(join(dataDirectory(), 'applications.json'), readApplications, mutate);
const value = (values: Record<string, string>, key: string) => (values[key] ?? '').trim();
function required(values: Record<string, string>, key: string, label = key) { const text = value(values, key); if (!text) throw new Error(`${label} is required.`); if (text.length > 500) throw new Error(`${label} is too long.`); return text; }
function date(text: string) { if (text && (!/^\d{4}-\d{2}-\d{2}$/.test(text) || !Number.isFinite(Date.parse(text)) || new Date(text).toISOString().slice(0, 10) !== text)) throw new Error('Enter a valid date.'); return text; }
function url(text: string) { if (text) { let parsed: URL; try { parsed = new URL(text); } catch { throw new Error('Enter a complete http or https URL.'); } if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Only http and https URLs are supported.'); } return text; }
function event(app: JobApplication, kind: ApplicationEvent['kind'], text: string, at: string, status?: ApplicationStatus) { app.events.push({ id: randomUUID(), kind, text, at, ...(status ? { status } : {}) }); }

export async function createApplication(values: Record<string, string>) {
  const now = new Date().toISOString();
  const app: JobApplication = { id: randomUUID(), revision: 1, company: required(values, 'company', 'Company'), role: required(values, 'role', 'Job title'), status: 'Saved', priority: 'Medium', arrangement: '', archived: false, createdAt: now, updatedAt: now, details: {}, tasks: [], events: [], interviews: [], contacts: [], documents: [] };
  event(app, 'status', 'Saved application', now, 'Saved');
  await update((store) => store.applications.push(app)); return app;
}
export async function changeApplication(id: string, revision: number, operation: string, values: Record<string, string>) {
  const now = new Date().toISOString();
  const snapshot = operation === 'snapshot' ? (await readWorkspace()).resumes.find((resume) => resume.id === values.resumeId) : undefined;
  return update((store) => {
    const app = store.applications.find((item) => item.id === id);
    if (!app) throw new Error('Application no longer exists.');
    if (app.revision !== revision) throw new Error('This application changed in another tab. Reload before saving; your draft is still here.');
    if (operation === 'delete') { store.applications = store.applications.filter((item) => item.id !== id); return; }
    if (operation === 'edit') {
      app.company = required(values, 'company', 'Company'); app.role = required(values, 'role', 'Job title');
      for (const key of Object.keys(detailFields) as (keyof typeof detailFields)[]) if (key in values) {
        let text = value(values, key); if (text.length > 100_000) throw new Error(`${detailFields[key]} is too long.`);
        if (key.endsWith('Date') || ['deadline', 'offerDeadline'].includes(key)) text = date(text);
        if (['jobUrl', 'sourceUrl', 'portfolio'].includes(key)) text = url(text);
        app.details[key] = text;
      }
      if ('priority' in values) { if (!['Low', 'Medium', 'High'].includes(values.priority)) throw new Error('Invalid priority.'); app.priority = values.priority as JobApplication['priority']; }
      if ('arrangement' in values) { if (!['', 'Remote', 'Hybrid', 'On-site'].includes(values.arrangement)) throw new Error('Invalid work arrangement.'); app.arrangement = values.arrangement as JobApplication['arrangement']; }
    }
    if (['edit', 'status'].includes(operation) && 'status' in values) {
      if (!statuses.includes(values.status as ApplicationStatus)) throw new Error('Invalid application status.');
      const status = values.status as ApplicationStatus;
      if (status !== app.status) {
        if (closedStatuses.includes(app.status) && !closedStatuses.includes(status)) app.details.outcomeDate = '';
        event(app, 'status', `${app.status} → ${status}`, now, status); app.status = status;
        if (['Applied', 'Interviewing', 'Offer', 'Accepted'].includes(status) && !app.details.appliedDate) app.details.appliedDate = cairoDate();
        if (closedStatuses.includes(status) && !app.details.outcomeDate) app.details.outcomeDate = cairoDate();
      }
    } else if (operation === 'archive') app.archived = !app.archived;
    else if (operation === 'task') {
      const task = { id: values.itemId || randomUUID(), title: required(values, 'title', 'Task'), due: date(value(values, 'due')) };
      if (values.itemId) { const existing = app.tasks.find((item) => item.id === values.itemId); if (!existing) throw new Error('Task not found.'); Object.assign(existing, task); } else app.tasks.push(task);
    }
    else if (operation === 'toggleTask') { const task = app.tasks.find((item) => item.id === values.itemId); if (!task) throw new Error('Task not found.'); task.completedAt = task.completedAt ? undefined : now; }
    else if (operation === 'event') {
      const kind = value(values, 'kind'); if (!['note', 'email', 'call', 'message', 'response'].includes(kind)) throw new Error('Invalid activity type.');
      const at = value(values, 'at') || now; if (!Number.isFinite(Date.parse(at))) throw new Error('Invalid activity time.');
      event(app, kind as ApplicationEvent['kind'], required(values, 'text', 'Activity'), new Date(at).toISOString());
    } else if (operation === 'contact') {
      const contact: Contact = { id: randomUUID(), name: required(values, 'name', 'Contact name'), role: value(values, 'contactRole'), email: value(values, 'email'), linkedin: url(value(values, 'linkedin')), phone: value(values, 'phone'), relationship: value(values, 'relationship') };
      if (values.itemId) { const index = app.contacts.findIndex((item) => item.id === values.itemId); if (index < 0) throw new Error('Contact not found.'); contact.id = values.itemId; app.contacts[index] = contact; } else app.contacts.push(contact);
    } else if (operation === 'interview') {
      const kind = values.kind; if (!['Interview', 'Assessment'].includes(kind)) throw new Error('Invalid interview type.');
      const at = value(values, 'at'); if (at && !Number.isFinite(Date.parse(at))) throw new Error('Invalid interview time.');
      const item: Interview = { id: randomUUID(), kind: kind as Interview['kind'], title: required(values, 'title', 'Round / assessment title'), at: at ? new Date(at).toISOString() : '', timezone: value(values, 'timezone') || 'Africa/Cairo', duration: value(values, 'duration'), interviewers: value(values, 'interviewers'), location: value(values, 'location'), deadline: date(value(values, 'deadline')), preparation: value(values, 'preparation'), questions: value(values, 'questions'), feedback: value(values, 'feedback'), result: value(values, 'result') };
      if (values.state && !['Scheduled', 'Completed', 'Cancelled'].includes(values.state)) throw new Error('Invalid round state.');
      item.state = (values.state || 'Scheduled') as Interview['state'];
      try { new Intl.DateTimeFormat('en', { timeZone: item.timezone }); } catch { throw new Error('Enter a valid IANA timezone, for example Africa/Cairo.'); }
      if (values.itemId) { const index = app.interviews.findIndex((entry) => entry.id === values.itemId); if (index < 0) throw new Error('Round not found.'); item.id = values.itemId; app.interviews[index] = item; } else app.interviews.push(item);
    } else if (operation === 'snapshot') {
      if (!snapshot) throw new Error('Resume no longer exists.');
      app.documents.push({ id: randomUUID(), name: snapshot.name, createdAt: now, resume: structuredClone(snapshot) });
    } else if (operation === 'attachment') {
      const content = values.content ?? ''; const size = Buffer.from(content, 'base64').length;
      if (!size || size > 5 * 1024 * 1024 || app.documents.reduce((sum, document) => sum + (document.size ?? 0), 0) + size > 20 * 1024 * 1024) throw new Error('Files must be under 5 MB each and 20 MB per application.');
      app.documents.push({ id: randomUUID(), name: required(values, 'name', 'Filename'), createdAt: now, content, size });
    } else if (operation === 'removeItem') {
      const collection = values.collection;
      if (collection === 'tasks') app.tasks = app.tasks.filter((item) => item.id !== values.itemId);
      else if (collection === 'interviews') app.interviews = app.interviews.filter((item) => item.id !== values.itemId);
      else if (collection === 'contacts') app.contacts = app.contacts.filter((item) => item.id !== values.itemId);
      else if (collection === 'documents') app.documents = app.documents.filter((item) => item.id !== values.itemId);
      else throw new Error('Invalid collection.');
    } else if (!['edit', 'status', 'archive'].includes(operation)) throw new Error('Unknown application action.');
    app.revision++; app.updatedAt = now;
  });
}
