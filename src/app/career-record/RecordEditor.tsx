'use client';
import { useEffect, useEffectEvent, useId, useRef, useState } from 'react';
import type { CareerEntry, CareerRecord, Profile, Resume, Section } from '../../lib/types';
import { BilingualInput } from '../../components/BilingualInput';
import { EntryPicker } from './EntryPicker';
import { EntryFields } from './EntryFields';
import { parseRecord } from './form-data';
import { ResumePreview, type PdfAsset } from '../resumes/ResumePreview';

const sections = [
  { kind: 'experience', title: 'Experience', singular: 'experience' },
  { kind: 'education', title: 'Education', singular: 'education' },
  { kind: 'projects', title: 'Projects', singular: 'project' },
  { kind: 'skills', title: 'Skills', singular: 'skill' },
  { kind: 'certifications', title: 'Certifications', singular: 'certification' },
] as const;

type SaveAction = (form: FormData) => Promise<{ revision?: string; error?: string }>;
export function RecordEditor({ record, revision, saveAction, profile, resume, profiles = [], availableEntries }: { record: CareerRecord; revision: string; saveAction: SaveAction; profile?: Profile; resume?: Resume; profiles?: { id: string; name: string }[]; availableEntries?: CareerEntry[] }) {
  const editorId = useId();
  const [draft, setDraft] = useState(resume);
  const pdfJob = useRef<{ revision: string; promise: Promise<PdfAsset> } | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [sectionOrder, setSectionOrder] = useState<Section[]>(resume?.sectionOrder ?? ['summary', ...sections.map((section) => section.kind)]);
  const [entries, setEntries] = useState(record.entries);
  const [links, setLinks] = useState(record.basics.links.map((link, index) => ({ ...link, id: `link-${index}` })));
  const [status, setStatus] = useState('Saved');
  const form = useRef<HTMLFormElement>(null);
  const generation = useRef(0), saved = useRef(0), serverRevision = useRef(revision);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const running = useRef<Promise<boolean> | null>(null);

  async function saveNow(): Promise<boolean> {
    clearTimeout(timer.current);
    if (running.current) {
      const success = await running.current;
      return success && generation.current !== saved.current ? saveNow() : success;
    }
    if (generation.current === saved.current) return true;
    if (!form.current?.checkValidity()) { setStatus('Complete the required fields and check invalid values. Your edits have not been saved.'); return false; }
    const data = new FormData(form.current), version = generation.current;
    data.set('_revision', serverRevision.current);
    setStatus('Saving…');
    const operation = (async () => {
      try {
        const result = await saveAction(data);
        if (result.error || !result.revision) { setStatus(result.error ?? 'Could not save. Retry your changes.'); return false; }
        serverRevision.current = result.revision;
        saved.current = version;
        setStatus(generation.current === version ? 'Saved' : 'Unsaved changes');
        return true;
      } catch { setStatus('Could not save. Your edits are still here. Check your connection, then retry.'); return false; }
      finally { running.current = null; }
    })();
    running.current = operation;
    const success = await operation;
    return success && generation.current !== saved.current ? saveNow() : success;
  }
  function changed() {
    if (resume) {
      clearTimeout(previewTimer.current);
      previewTimer.current = setTimeout(() => {
        if (!form.current) return;
        try {
          const data = new FormData(form.current), content = parseRecord(data);
          const slot = (key: string) => ({ en: String(data.get(`${key}.en`) ?? ''), ar: String(data.get(`${key}.ar`) ?? '') });
          setDraft({ ...resume, ...content, name: String(data.get('resumeName') ?? resume.name), language: data.get('language') === 'ar' ? 'ar' : 'en', headline: slot('headline'), summary: slot('summary'), hiddenEntryIds: data.getAll('hiddenEntryId').map(String), sectionOrder: data.getAll('sectionOrder').flatMap((kind) => sectionOrder.filter((section) => section === kind)) });
        } catch { setStatus('Complete invalid fields to update the preview and save.'); }
      }, 0);
    }
    generation.current++;
    setStatus('Unsaved changes');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { void saveNow(); }, 600);
  }
  const flushOnNavigation = useEffectEvent(saveNow);
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => {
      if (generation.current !== saved.current) { event.preventDefault(); event.returnValue = ''; }
    };
    const navigate = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a') : null;
      if (!link || link.target || link.hash || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0 || generation.current === saved.current) return;
      event.preventDefault();
      void flushOnNavigation().then((success) => { if (success) window.location.assign(link.href); });
    };
    window.addEventListener('beforeunload', unload);
    document.addEventListener('click', navigate, true);
    return () => { window.removeEventListener('beforeunload', unload); document.removeEventListener('click', navigate, true); clearTimeout(timer.current); clearTimeout(previewTimer.current); void flushOnNavigation(); };
  }, []);

  function addEntry(kind: CareerEntry['kind']) {
    const id = crypto.randomUUID();
    let entry: CareerEntry;
    switch (kind) {
      case 'experience': entry = { id, kind, employer: { en: '' }, title: { en: '' }, dates: { start: '' }, bullets: [] }; break;
      case 'education': entry = { id, kind, institution: { en: '' }, qualification: { en: '' }, dates: { start: '' }, bullets: [] }; break;
      case 'projects': entry = { id, kind, name: { en: '' }, description: { en: '' }, bullets: [] }; break;
      case 'skills': entry = { id, kind, name: { en: '' } }; break;
      case 'certifications': entry = { id, kind, name: { en: '' }, issuer: { en: '' } }; break;
    }
    setEntries((items) => [...items, entry]); changed();
  }
  async function preparePdf(): Promise<PdfAsset> {
    if (!resume || !await saveNow()) throw new Error('Your latest edits could not be saved. Retry saving before downloading.');
    const revision = serverRevision.current, current = pdfJob.current;
    if (current) {
      if (current.revision === revision) {
        const asset = await current.promise;
        return generation.current !== saved.current || serverRevision.current !== revision ? preparePdf() : asset;
      }
      await current.promise.catch(() => undefined);
      return preparePdf();
    }
    const promise = (async () => {
      const response = await fetch(`/api/resumes/${encodeURIComponent(resume.id)}/pdf?revision=${revision}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('PDF preparation failed, the Resume changed, or another export is running. Please retry.');
      const pages = Number(response.headers.get('X-Resume-Pages'));
      if (!Number.isInteger(pages) || pages < 1) throw new Error('Could not read the PDF page count. Please retry.');
      return { blob: await response.blob(), pages };
    })();
    pdfJob.current = { revision, promise };
    let asset: PdfAsset;
    try { asset = await promise; } finally { if (pdfJob.current?.promise === promise) pdfJob.current = null; }
    return generation.current !== saved.current || serverRevision.current !== revision ? preparePdf() : asset;
  }
  async function download() {
    const asset = await preparePdf(), url = URL.createObjectURL(asset.blob);
    const link = document.createElement('a'); link.href = url; link.download = `${form.current?.querySelector<HTMLInputElement>('[name="resumeName"]')?.value || 'resume'}.pdf`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return asset;
  }
  return <div className={resume ? 'resume-workbench' : 'editor-workbench'}><form ref={form} className="record-editor" onChange={changed} onSubmit={(event) => { event.preventDefault(); void saveNow(); }}>
    <div className="editor-controls"><div className="save-bar">{resume ? <a href={`#${editorId}-preview`}>Preview and download</a> : null}<p role="status" aria-live="polite">{status}</p><button type="submit">Save now / retry</button></div>
    <nav className="section-nav" aria-label={resume ? 'Resume sections' : profile ? 'Profile sections' : 'Career Record sections'}>
      {resume || profile ? <a href={`#${editorId}-details`}>Details</a> : null}
      {availableEntries ? <a href={`#${editorId}-choose-content`}>Choose content</a> : null}
      <a href={`#${editorId}-basics`}>Basics</a>{sections.map((section) => <a key={section.kind} href={`#${editorId}-${section.kind}`}>{section.title} <span className="section-count">{entries.filter((entry) => entry.kind === section.kind).length}</span></a>)}
    </nav></div>
    {resume ? <section id={`${editorId}-details`} tabIndex={-1} className="editor-section" aria-label="Resume details">
      <h2>Resume details</h2>
      <label>Resume name<input name="resumeName" defaultValue={resume.name} required maxLength={100} /></label>
      <div className="field-grid">
        <div className="field-control"><label htmlFor={`${editorId}-language`}>Language</label><select id={`${editorId}-language`} name="language" defaultValue={resume.language}><option value="en">English</option><option value="ar">Arabic</option></select></div>
        <div className="field-control"><label htmlFor={`${editorId}-profile`}>Move to</label><select id={`${editorId}-profile`} name="profileId" defaultValue={resume.profileId ?? ''}><option value="">Unfiled</option>{profiles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
      </div>
      <p>Moving changes where this Resume is listed. Its wording stays the same.</p>

      <BilingualInput name="headline" label="Headline" value={resume.headline} />
      <BilingualInput name="summary" label="Summary" value={resume.summary} multiline />
      <details className="section-order"><summary>Section order</summary><fieldset><legend className="sr-only">Section order</legend>{sectionOrder.map((kind, index) => <div key={kind}><input type="hidden" name="sectionOrder" value={kind} /><span>{kind}</span> <button type="button" disabled={index === 0} aria-label={`Move ${kind} section up`} onClick={() => { setSectionOrder((items) => { const next = [...items]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; }); changed(); }}>Move up</button></div>)}</fieldset></details>
    </section> : null}
    {profile ? <section id={`${editorId}-details`} tabIndex={-1} className="editor-section" aria-labelledby={`${editorId}-profile-details-heading`}>
      <h2 id={`${editorId}-profile-details-heading`}>Profile details</h2>
      <label>Profile name<input name="profileName" defaultValue={profile.name} required maxLength={100} autoComplete="off" /></label>
      <BilingualInput name="headline" label="Default headline" value={profile.headline} />
      <BilingualInput name="summary" label="Default summary" value={profile.summary} multiline />
    </section> : null}
    {availableEntries ? <section id={`${editorId}-choose-content`} tabIndex={-1} className="editor-section" aria-labelledby={`${editorId}-select-content-heading`}>
      <h2 id={`${editorId}-select-content-heading`}>Choose from your Career Record</h2>
      <EntryPicker entries={availableEntries} selectedIds={entries.map((entry) => entry.id)} open={!resume} onToggle={(source, checked) => {
        if (checked) setEntries((items) => [...items, structuredClone(source)]);
        else if (window.confirm(resume ? 'Remove this entry from this Resume?' : 'Remove this copied entry from the Profile? Existing Resumes keep their copies.')) setEntries((items) => items.filter((entry) => entry.id !== source.id));
      }} />
    </section> : null}

    <section id={`${editorId}-basics`} tabIndex={-1} className="editor-section" aria-labelledby={`${editorId}-basics-heading`}>
      <h2 id={`${editorId}-basics-heading`}>Basics</h2><p>Your contact details. Arabic wording is optional.</p>
      <BilingualInput name="name" label="Name" value={record.basics.name} />
      <BilingualInput name="title" label="Professional title" value={record.basics.title} />
      <BilingualInput name="location" label="Location" value={record.basics.location} />
      <div className="field-grid">
        <label>Email<input name="email" type="email" defaultValue={record.basics.email} autoComplete="email" spellCheck={false} maxLength={320} dir="ltr" /></label>
        <label>Phone<input name="phone" type="tel" defaultValue={record.basics.phone} autoComplete="tel" maxLength={100} dir="ltr" /></label>
      </div>
      <h3>Links</h3>
      {links.map((link) => <div className="link-row" key={link.id}>
        <input type="hidden" name="linkId" value={link.id} />
        <label>Link label<input name={`${link.id}.label`} defaultValue={link.label} maxLength={200} autoComplete="off" /></label>
        <label>Web address<input name={`${link.id}.url`} type="url" required defaultValue={link.url} maxLength={2000} spellCheck={false} autoComplete="url" dir="ltr" /></label>
        <button type="button" onClick={() => { if (window.confirm('Remove this link?')) { setLinks((items) => items.filter((item) => item.id !== link.id)); changed(); } }}>Remove link</button>
      </div>)}
      <button type="button" onClick={() => { setLinks((items) => [...items, { id: crypto.randomUUID(), label: '', url: '' }]); changed(); }}>Add link</button>
    </section>
    {sections.map((section) => <section key={section.kind} id={`${editorId}-${section.kind}`} tabIndex={-1} className="editor-section" aria-labelledby={`${editorId}-${section.kind}-heading`}>
      <div className="section-title"><div><h2 id={`${editorId}-${section.kind}-heading`}>{section.title}</h2><p>Add the details you want to keep for future resumes.</p></div>{!profile && !resume ? <button type="button" onClick={() => addEntry(section.kind)}>Add {section.singular}</button> : null}</div>
      {entries.filter((entry) => entry.kind === section.kind).length === 0 ? <p>No {section.singular} added yet.</p> : null}
      {entries.filter((entry) => entry.kind === section.kind).map((entry, index) => <fieldset className="entry-card" key={entry.id}>
        <legend>{section.title} {index + 1}</legend>
        <input type="hidden" name="entryId" value={entry.id} /><input type="hidden" name={`${entry.id}.kind`} value={entry.kind} />
        {resume ? <><label><input type="checkbox" name="hiddenEntryId" value={entry.id} defaultChecked={resume.hiddenEntryIds.includes(entry.id)} />Hide in Resume</label><button type="button" disabled={index === 0} onClick={() => {
          setEntries((items) => { const next = [...items], current = next.findIndex((item) => item.id === entry.id), previous = next.findLastIndex((item, position) => position < current && item.kind === entry.kind); if (previous >= 0) [next[previous], next[current]] = [next[current], next[previous]]; return next; }); changed();
        }}>Move entry up</button></> : null}
        <EntryFields entry={entry} changed={changed} />
        <button className="danger" type="button" onClick={() => { if (window.confirm(resume ? 'Remove this entry from this Resume?' : profile ? 'Remove this copied entry from the Profile? Existing Resumes keep their copies.' : 'Delete this entry from your Career Record? Existing Profiles and Resumes keep their copies.')) { setEntries((items) => items.filter((item) => item.id !== entry.id)); changed(); } }}>Delete {section.singular}</button>
      </fieldset>)}
    </section>)}
  </form>{draft ? <div id={`${editorId}-preview`} className="resume-preview-dock" tabIndex={-1}><ResumePreview resume={draft} editHref={`#${editorId}-details`} preparePdf={preparePdf} download={download} /></div> : null}</div>;
}
