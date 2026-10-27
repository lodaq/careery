'use client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SortableList } from '@/components/ui/sortable-list';
import { ChevronDownIcon, SaveIcon } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

import { useConfirmAction } from '@/components/ConfirmAction';
const ToggleGroup = lazy(() => import('@/components/ui/toggle-group').then((module) => ({ default: module.ToggleGroup })));
const ToggleGroupItem = lazy(() => import('@/components/ui/toggle-group').then((module) => ({ default: module.ToggleGroupItem })));
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { FieldGroup, FieldLabel } from '@/components/ui/field';

import { flushSync } from 'react-dom';
import { useEffect, useEffectEvent, useId, useRef, useState } from 'react';
import type { CareerEntry, CareerRecord, Profile, Resume, Section } from '../../lib/types';
import { BilingualInput } from '../../components/BilingualInput';
const EntryPicker = lazy(() => import('./EntryPicker').then((module) => ({ default: module.EntryPicker })));
import { EntryFields } from './EntryFields';
import { parseRecord } from './form-data';
import Link from 'next/link';
import '../resumes/resume-studio.css';
import '../../template/resume-document.css';
import { ResumeIcon } from '../resumes/ResumeIcon';
import { lazy, Suspense } from 'react';
const ResumeCustomize = lazy(() => import('../resumes/ResumeCustomize').then((module) => ({ default: module.ResumeCustomize })));
const ResumeReview = lazy(() => import('../resumes/ResumeReview').then((module) => ({ default: module.ResumeReview })));
import { defaultAppearance, parseAppearance } from '../resumes/appearance';
const ResumeNavigation = lazy(() => import('../resumes/ResumeNavigation').then((module) => ({ default: module.ResumeNavigation })));
import { parseAiReview, reviewContent, validatedFindingEdits, validatedFindingSkills, type AiReview } from '../resumes/ai-review';
import type { PdfAsset } from '../resumes/ResumePreview';
const ResumePreview = lazy(() => import('../resumes/ResumePreview').then((module) => ({ default: module.ResumePreview })));

const sections = [
  { kind: 'experience', title: 'Experience', singular: 'experience' },
  { kind: 'education', title: 'Education', singular: 'education' },
  { kind: 'projects', title: 'Projects', singular: 'project' },
  { kind: 'skills', title: 'Skills', singular: 'skill' },
  { kind: 'certifications', title: 'Certifications', singular: 'certification' },
] as const;

type SaveAction = (form: FormData) => Promise<{ revision?: string; error?: string }>;
export function RecordEditor({ record, revision, saveAction, profile, resume, profiles = [], availableEntries }: { record: CareerRecord; revision: string; saveAction: SaveAction; profile?: Profile; resume?: Resume; profiles?: { id: string; name: string }[]; availableEntries?: CareerEntry[] }) {
  const { confirm, confirmation } = useConfirmAction();
  const editorId = useId();
  const [activeSection, setActiveSection] = useState(resume || profile ? 'details' : 'basics');
  const [previewOnly, setPreviewOnly] = useState(false);
  const [appearance, setAppearance] = useState(resume?.appearance ?? defaultAppearance);
  const [hiddenSections] = useState<Section[]>(resume?.hiddenSections ?? []);
  const [hiddenEntryIds] = useState<string[]>(resume?.hiddenEntryIds ?? []);
  const [language, setLanguage] = useState(resume?.language ?? 'en');
  const lastEditSection = useRef('details');
  function selectSection(section: string) { lastEditSection.current = section; setActiveSection(section); setPreviewOnly(false); }
  const sectionHidden = (section: string) => activeSection !== section;
  const [draft, setDraft] = useState(resume);
  const [summaryOverride, setSummaryOverride] = useState<Resume['summary'] | null>(null);
  const [aiReview, setAiReview] = useState<AiReview | null>(null);
  const [reviewSnapshot, setReviewSnapshot] = useState('');
  const [appliedFindings, setAppliedFindings] = useState<string[]>([]);
  const [entryVersions, setEntryVersions] = useState<Record<string, number>>({});
  const [headlineOverride, setHeadlineOverride] = useState<Resume['headline'] | null>(null);
  const pdfJob = useRef<{ revision: string; promise: Promise<PdfAsset> } | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [sectionOrder, setSectionOrder] = useState<Section[]>(resume?.sectionOrder ?? ['summary', ...sections.map((section) => section.kind)]);
  const [entries, setEntries] = useState(record.entries);
  const [entryText, setEntryText] = useState<Record<string, string>>({});
  const entryHeading = (entry: CareerEntry) => { const key = 'title' in entry ? 'title' : 'qualification' in entry ? 'qualification' : 'name'; const original = 'title' in entry ? entry.title : 'qualification' in entry ? entry.qualification : entry.name; return (entryText[`${entry.id}.${key}.en`] ?? original.en) || (entryText[`${entry.id}.${key}.ar`] ?? original.ar); };
  const [newEntryIds, setNewEntryIds] = useState<string[]>([]);
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
          setDraft({ ...resume, ...content, appearance: parseAppearance(data) ?? resume.appearance, name: String(data.get('resumeName') ?? resume.name), language: data.get('language') === 'ar' ? 'ar' : 'en', headline: slot('headline'), summary: slot('summary'), hiddenEntryIds: data.getAll('hiddenEntryId').map(String), hiddenSections: data.getAll('hiddenSectionId').flatMap((kind) => sectionOrder.filter((section) => section === kind)), sectionOrder: data.getAll('sectionOrder').flatMap((kind) => sectionOrder.filter((section) => section === kind)) });
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
    setEntries((items) => [...items, entry]); setNewEntryIds((items) => [...items, id]); changed();
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
  function currentReviewSnapshot() {
    if (!resume || !form.current) return '';
    const data = new FormData(form.current);
    return JSON.stringify(reviewContent({ ...resume, ...parseRecord(data), language, hiddenEntryIds, hiddenSections, sectionOrder,
      headline: { en: String(data.get('headline.en') ?? ''), ar: String(data.get('headline.ar') ?? '') },
      summary: { en: String(data.get('summary.en') ?? ''), ar: String(data.get('summary.ar') ?? '') } }));
  }
  async function runAiReview(targetRole: string) {
    if (!resume || !await saveNow()) throw new Error('Save your Resume successfully before running a review. Check required fields and retry.');
    const snapshot = currentReviewSnapshot();
    const response = await fetch(`/api/resumes/${encodeURIComponent(resume.id)}/review`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetRole, revision: serverRevision.current }) });
    const result = await response.json();
    if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : 'Could not review. Retry.');
    setAppliedFindings([]); setAiReview(parseAiReview(result.review, result.review.model)); setReviewSnapshot(snapshot);
  }
  async function applyAiFinding(index: number, changeIndex?: number) {
    if (!resume || !form.current || !aiReview || currentReviewSnapshot() !== reviewSnapshot) return;
    let finding = aiReview.findings[index];
    if (!finding) return;
    const snapshot = currentReviewSnapshot();
    const supplied = finding;
    const selected = changeIndex ?? 0;
    if (appliedFindings.includes(`${index}:${selected}`)) return;
    if (changeIndex !== undefined) finding = { ...finding, edits: (finding.edits ?? []).slice(selected, selected + 1), addSkills: (finding.addSkills ?? []).slice(Math.max(0, selected - (finding.edits?.length ?? 0)), selected >= (finding.edits?.length ?? 0) ? selected - (finding.edits?.length ?? 0) + 1 : 0) };
    if (!validatedFindingEdits(draft ?? resume, finding).length && !validatedFindingSkills(draft ?? resume, finding).length) {
      if (!await saveNow()) throw new Error('Save your Resume before applying this suggestion.');
      const response = await fetch(`/api/resumes/${encodeURIComponent(resume.id)}/review`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revision: serverRevision.current, finding }) });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : 'Could not apply this suggestion. Try again.');
      if (result.unavailable) {
        setAiReview((review) => review ? { ...review, findings: review.findings.map((item, position) => position === index ? { ...item, unavailable: true, edits: [], addSkills: [], suggestion: 'No change made: this feedback requires additional facts. Future reviews only include actionable revisions.' } : item) } : review);
        return;
      }
      const generated = parseAiReview(result.review, result.review.model).findings[0];
      if (!generated || generated.section !== finding.section) throw new Error('The revision did not match this suggestion. Try again.');
      finding = generated;
    }
    if (currentReviewSnapshot() !== snapshot) throw new Error('Your Resume changed while preparing the suggestion. Review it again before applying.');
    const data = new FormData(form.current);
    const current = { ...resume, ...parseRecord(data), language, hiddenEntryIds, hiddenSections, sectionOrder,
      headline: { en: String(data.get('headline.en') ?? ''), ar: String(data.get('headline.ar') ?? '') },
      summary: { en: String(data.get('summary.en') ?? ''), ar: String(data.get('summary.ar') ?? '') } };
    const edits = validatedFindingEdits(current, finding).slice(0, 1);
    const skills = edits.length ? [] : validatedFindingSkills(current, finding).slice(0, 1);
    if (!edits.length && !skills.length) throw new Error('No applicable changes were returned. Your Resume is unchanged.');
    for (const edit of edits) data.set(edit.field, edit.after);
    const updated = parseRecord(data);
    for (const skill of skills) updated.entries.push({ id: crypto.randomUUID(), kind: 'skills', name: { en: skill.name, ...(language === 'ar' ? { ar: skill.name } : {}) } });
    const touched = updated.entries.filter((entry) => edits.some((edit) => edit.field.startsWith(`${entry.id}.`))).map((entry) => entry.id);
    flushSync(() => {
      setEntries(updated.entries);
      setEntryVersions((versions) => Object.fromEntries(updated.entries.map((entry) => [entry.id, (versions[entry.id] ?? 0) + (touched.includes(entry.id) ? 1 : 0)])));
      if (edits.some((edit) => edit.field.startsWith('summary.'))) setSummaryOverride({ en: String(data.get('summary.en') ?? ''), ar: String(data.get('summary.ar') ?? '') });
      if (edits.some((edit) => edit.field.startsWith('headline.'))) setHeadlineOverride({ en: String(data.get('headline.en') ?? ''), ar: String(data.get('headline.ar') ?? '') });
      setAiReview((review) => review ? { ...review, findings: review.findings.map((item, position) => position === index ? (changeIndex === undefined ? finding : supplied) : item) } : review);
      setAppliedFindings((indexes) => [...indexes, `${index}:${selected}`]);
    });
    setReviewSnapshot(currentReviewSnapshot());
    changed();
  }
  function applyAiSummary(text: string) {
    if (currentReviewSnapshot() !== reviewSnapshot) return;
    const field = form.current?.querySelector<HTMLTextAreaElement>(`textarea[name="summary.${language}"]`);
    if (!field) return;
    const data = new FormData(form.current!);
    setSummaryOverride({ en: String(data.get('summary.en') ?? ''), ar: String(data.get('summary.ar') ?? ''), [language]: text });
    field.value = text; changed(); selectSection('summary');
    if (language === 'ar') requestAnimationFrame(() => {
      const arabic = form.current?.querySelector<HTMLTextAreaElement>('textarea[name="summary.ar"]');
      const trigger = arabic?.closest('[data-slot=collapsible]')?.querySelector<HTMLButtonElement>('[data-slot=collapsible-trigger]');
      if (trigger?.getAttribute('aria-expanded') === 'false') trigger.click();
    });
  }
  return <><div className={resume ? `resume-workbench${previewOnly ? ' preview-only' : ''}${activeSection === 'customize' ? ' customize-mode' : ''}${activeSection === 'review' ? ' review-mode' : ''}` : 'editor-workbench'}>
    {resume ? <header className="resume-workbench-toolbar"><div className="workbench-title"><Link prefetch={false} href="/" aria-label="Back to workspace"><ResumeIcon kind="back" /></Link><h1>{draft?.name || resume.name}</h1></div><Suspense fallback={<span>Editor modes…</span>}><ToggleGroup className="workbench-modes" aria-label="Editor view" value={[!previewOnly && ['customize','review'].includes(activeSection) ? activeSection : 'edit']} onValueChange={(values) => { const next=values[0]; if (!next) return; setPreviewOnly(false); if(next==='edit') selectSection(lastEditSection.current); else setActiveSection(next); }}><ToggleGroupItem value="edit">Edit</ToggleGroupItem><ToggleGroupItem value="customize">Customize</ToggleGroupItem><ToggleGroupItem value="review">AI Review{aiReview ? <span className="mode-score">{aiReview.score}</span> : null}</ToggleGroupItem></ToggleGroup></Suspense><Button className="mobile-preview" variant="outline" type="button" onClick={() => setPreviewOnly(true)}>Preview</Button><div className="workbench-save-group"><p role="status" aria-live="polite">{status}</p><Button variant="default" type="button" className="workbench-save" onClick={() => { void saveNow(); }}><SaveIcon aria-hidden="true" />Save</Button></div></header> : null}
    <Tabs className="record-tabs" value={activeSection} onValueChange={(value) => selectSection(String(value))}><form ref={form} className="record-editor" onChangeCapture={(event) => { const input = event.target; if (input instanceof HTMLInputElement && /\.(title|qualification|name)\.(en|ar)$/.test(input.name)) setEntryText((current) => ({ ...current, [input.name]: input.value })); }} onInvalidCapture={(event) => { const section = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-editor-section]')?.dataset.editorSection : undefined; if (section) { if (event.target instanceof HTMLElement) { const ancestors: HTMLElement[] = []; let node = event.target.parentElement; while (node && node !== form.current) { if (node.matches('[data-slot=collapsible][data-closed]')) ancestors.unshift(node); node = node.parentElement; } ancestors.forEach((node) => node.querySelector<HTMLButtonElement>('[data-slot=collapsible-trigger]')?.click()); } setPreviewOnly(false); setActiveSection(section); } }} onChange={changed} onSubmit={(event) => { event.preventDefault(); void saveNow(); }}>
    {resume ? <>{Object.entries(appearance).map(([key,value]) => <input key={key} type="hidden" name={`appearance.${key}`} value={value} />)}{sectionOrder.map((kind) => <input key={kind} type="hidden" name="sectionOrder" value={kind} />)}{hiddenSections.map((kind) => <input key={kind} type="hidden" name="hiddenSectionId" value={kind} />)}{hiddenEntryIds.map((id) => <input key={id} type="hidden" name="hiddenEntryId" value={id} />)}</> : null}{entries.map((entry) => <input key={entry.id} type="hidden" name="entryId" value={entry.id} />)}<div className="editor-controls"><div className="save-bar">{resume ? <h2>Edit {activeSection === 'basics' ? 'personal information' : activeSection === 'details' ? 'resume settings' : activeSection.replace('-', ' ')}</h2> : null}{!resume ? <p role="status" aria-live="polite">{status}</p> : null}<Button variant="default" type="submit" aria-label="Save now / retry">{resume ? 'Save changes' : 'Save now / retry'}</Button></div>
    {!resume ? <TabsList variant="line" className="record-section-tabs" aria-label={profile ? 'Profile sections' : 'Career Record sections'}>
      {profile ? <TabsTrigger value="details">Details</TabsTrigger> : null}
      {availableEntries ? <TabsTrigger value="choose-content">Choose content</TabsTrigger> : null}
      <TabsTrigger value="basics">Basics</TabsTrigger>{sections.map((section) => <TabsTrigger key={section.kind} value={section.kind}>{section.title} <span className="section-count">{entries.filter((entry) => entry.kind === section.kind).length}</span></TabsTrigger>)}
    </TabsList> : null}</div>
    {resume ? <Suspense fallback={<span>Loading sections…</span>}><ResumeNavigation active={activeSection} entries={entries} onSelect={selectSection} chooseContent={Boolean(availableEntries)} /></Suspense> : null}
    {resume ? <EditorPanel resume={Boolean(resume)} hidden={resume ? sectionHidden('details') : undefined} value={'details'} data-editor-section="details" id={`${editorId}-details`} tabIndex={-1} className="editor-section" aria-label="Resume details">
      <h2>Resume details</h2>
      <FieldLabel>Resume name<Input name="resumeName" defaultValue={resume.name} required maxLength={100} /></FieldLabel>
      <FieldGroup className="field-grid">
        <div className="field-control"><FieldLabel htmlFor={`${editorId}-language`}>Language</FieldLabel><NativeSelect id={`${editorId}-language`} name="language" value={language} onChange={(event) => setLanguage(event.target.value === 'ar' ? 'ar' : 'en')}><NativeSelectOption value="en">English</NativeSelectOption><NativeSelectOption value="ar">Arabic</NativeSelectOption></NativeSelect></div>
        <div className="field-control"><FieldLabel htmlFor={`${editorId}-profile`}>Move to</FieldLabel><NativeSelect id={`${editorId}-profile`} name="profileId" defaultValue={resume.profileId ?? ''}><NativeSelectOption value="">Unfiled</NativeSelectOption>{profiles.map((item) => <NativeSelectOption key={item.id} value={item.id}>{item.name}</NativeSelectOption>)}</NativeSelect></div>
      </FieldGroup>
      <p>Moving changes where this Resume is listed. Its wording stays the same.</p>
    </EditorPanel> : null}
    {resume ? <EditorPanel resume={Boolean(resume)} hidden={resume ? sectionHidden('customize') : undefined} value={'customize'} data-editor-section="customize" className="editor-section customize-section" aria-label="Customize Resume">{activeSection === 'customize' ? <Suspense fallback={<p>Loading customization…</p>}><ResumeCustomize resume={draft} appearance={appearance} onChange={(value) => { setAppearance(value); changed(); }} language={language} onLanguageChange={setLanguage} layout={<Collapsible className="section-order" defaultOpen><CollapsibleTrigger render={<Button variant="ghost" />}>Section order</CollapsibleTrigger><CollapsibleContent keepMounted><fieldset><legend className="sr-only">Section order</legend><SortableList items={sectionOrder.map((kind) => ({ id: kind }))} label="Resume section order" itemLabel={(item) => `${item.id} section`} onReorder={(items) => { setSectionOrder(items.map((item) => item.id)); changed(); }} renderItem={(item, _index, handle) => <div className="section-order-row">{handle}<span className="layout-section-name">{item.id}</span></div>} /></fieldset></CollapsibleContent></Collapsible>} /></Suspense> : null}</EditorPanel> : null}
    {resume && draft && activeSection === 'review' ? <EditorPanel resume={Boolean(resume)} hidden={resume ? sectionHidden('review') : undefined} value={'review'} data-editor-section="review" className="editor-section review-section" aria-label="Resume review"><Suspense fallback={<p>Loading review…</p>}><ResumeReview resume={draft} onSelect={selectSection} review={aiReview} stale={Boolean(aiReview && JSON.stringify(reviewContent(draft)) !== reviewSnapshot)} onRun={runAiReview} onApplySummary={applyAiSummary} onApplyFinding={applyAiFinding} appliedFindings={appliedFindings} /></Suspense></EditorPanel> : null}
    {resume ? <EditorPanel resume={Boolean(resume)} hidden={resume ? sectionHidden('summary') : undefined} value={'summary'} data-editor-section="summary" className="editor-section" aria-label="Professional summary"><h2>Professional summary</h2><p>A short introduction to what you do and the value you bring.</p><BilingualInput key={summaryOverride ? JSON.stringify(summaryOverride) : 'original-summary'} name="summary" label="Summary" value={summaryOverride ?? resume.summary} multiline /></EditorPanel> : null}
    {profile ? <EditorPanel resume={false} value="details" data-editor-section="details" id={`${editorId}-details`} tabIndex={-1} className="editor-section" aria-labelledby={`${editorId}-profile-details-heading`}>
      <h2 id={`${editorId}-profile-details-heading`}>Profile details</h2>
      <FieldLabel>Profile name<Input name="profileName" defaultValue={profile.name} required maxLength={100} autoComplete="off" /></FieldLabel>
      <BilingualInput name="headline" label="Default headline" value={profile.headline} />
      <BilingualInput name="summary" label="Default summary" value={profile.summary} multiline />
    </EditorPanel> : null}
    {availableEntries ? <EditorPanel resume={Boolean(resume)} hidden={resume ? sectionHidden('choose-content') : undefined} value={'choose-content'} data-editor-section="choose-content" id={`${editorId}-choose-content`} tabIndex={-1} className="editor-section" aria-labelledby={`${editorId}-select-content-heading`}>
      <h2 id={`${editorId}-select-content-heading`}>Choose from your Career Record</h2>
      {(!resume || activeSection === 'choose-content') ? <Suspense fallback={<p>Loading Career Record…</p>}><EntryPicker entries={availableEntries} selectedIds={entries.map((entry) => entry.id)} open={true} onToggle={async (source, checked) => {
        if (checked) setEntries((items) => [...items, structuredClone(source)]);
        else if (await confirm(resume ? 'Remove this entry from this Resume?' : 'Remove this copied entry from the Profile? Existing Resumes keep their copies.')) setEntries((items) => items.filter((entry) => entry.id !== source.id));
      }} /></Suspense> : null}
    </EditorPanel> : null}

    <EditorPanel resume={Boolean(resume)} hidden={resume ? sectionHidden('basics') : undefined} value={'basics'} data-editor-section="basics" id={`${editorId}-basics`} tabIndex={-1} className="editor-section" aria-labelledby={`${editorId}-basics-heading`}>
      <h2 id={`${editorId}-basics-heading`}>{resume ? 'Personal information' : 'Basics'}</h2><p>How employers can reach you. Add an Arabic version where you need one.</p>
      <div className="personal-details-group"><h3>About you</h3>
      <BilingualInput name="name" label="Name" value={record.basics.name} />
      {resume ? <BilingualInput key={JSON.stringify(headlineOverride)} name="headline" label="Headline" value={headlineOverride ?? resume.headline} /> : null}
      {resume ? <><input type="hidden" name="title.en" value={record.basics.title.en} /><input type="hidden" name="title.ar" value={record.basics.title.ar ?? ''} /></> : <BilingualInput name="title" label="Professional title" value={record.basics.title} />}
      </div><div className="personal-details-group"><h3>Contact details</h3>
      <BilingualInput name="location" label="Location" value={record.basics.location} />
      <FieldGroup className="field-grid">
        <FieldLabel>Email<Input name="email" type="email" defaultValue={record.basics.email} autoComplete="email" spellCheck={false} maxLength={320} dir="ltr" /></FieldLabel>
        <FieldLabel>Phone<Input name="phone" type="tel" defaultValue={record.basics.phone} autoComplete="tel" maxLength={100} dir="ltr" /></FieldLabel>
      </FieldGroup>
      </div><div className="personal-details-group"><h3>Professional links</h3><p>Use a clear label such as LinkedIn, GitHub, or Portfolio.</p>
      {links.map((link) => <div className="link-row" key={link.id}>
        <input type="hidden" name="linkId" value={link.id} />
        <FieldLabel>Link label<Input name={`${link.id}.label`} defaultValue={link.label} maxLength={200} autoComplete="off" /></FieldLabel>
        <FieldLabel>Web address<Input name={`${link.id}.url`} type="url" required defaultValue={link.url} maxLength={2000} spellCheck={false} autoComplete="url" dir="ltr" /></FieldLabel>
        <Button variant="outline" type="button" onClick={async () => { if (await confirm('Remove this link?')) { setLinks((items) => items.filter((item) => item.id !== link.id)); changed(); } }}>Remove link</Button>
      </div>)}
      <Button variant="outline" type="button" onClick={() => { setLinks((items) => [...items, { id: crypto.randomUUID(), label: '', url: '' }]); changed(); }}>Add link</Button></div>
    </EditorPanel>
    {sections.map((section) => <EditorPanel resume={Boolean(resume)} hidden={resume ? sectionHidden(section.kind) : undefined} value={section.kind} data-editor-section={section.kind} key={section.kind} id={`${editorId}-${section.kind}`} tabIndex={-1} className="editor-section" aria-labelledby={`${editorId}-${section.kind}-heading`}>
      <div className="section-title"><div><h2 id={`${editorId}-${section.kind}-heading`}>{section.title}</h2><p>{resume ? 'Edit your wording and order for this resume.' : 'Add the details you want to keep for future resumes.'}</p></div>{resume ? <Button variant="outline" type="button" onClick={() => selectSection('choose-content')} aria-label={`Add ${section.singular} from Career Record`}>＋ Add</Button> : !profile ? <Button variant="outline" type="button" onClick={() => addEntry(section.kind)}>Add {section.singular}</Button> : null}</div>
      {entries.filter((entry) => entry.kind === section.kind).length === 0 ? <p>No {section.singular} added yet.</p> : null}
      <SortableList items={entries.filter((entry) => entry.kind === section.kind)} label={`${section.title} entries`} itemLabel={(entry, index) => `${section.singular} ${index + 1}`} onReorder={(ordered) => {
        setEntries((items) => { let index = 0; return items.map((item) => item.kind === section.kind ? ordered[index++] : item); }); changed();
      }} renderItem={(entry, index, handle) => <fieldset className="entry-card" key={entry.id}>
        <legend className="sr-only">{section.title} {index + 1}</legend>
        <Collapsible className="entry-editor" defaultOpen={newEntryIds.includes(entry.id)}><div className="entry-drag-handle">{handle}</div><CollapsibleTrigger render={<Button variant="ghost" />}><span>{entryHeading(entry) || `New ${section.singular}`}<small>{'employer' in entry ? entry.employer.en || entry.employer.ar : 'institution' in entry ? entry.institution.en || entry.institution.ar : 'issuer' in entry ? entry.issuer.en || entry.issuer.ar : entry.kind}</small></span><ChevronDownIcon className="entry-chevron" aria-hidden="true" /></CollapsibleTrigger><CollapsibleContent keepMounted>
        <input type="hidden" name={`${entry.id}.kind`} value={entry.kind} />
        <EntryFields key={`${entry.id}-${entryVersions[entry.id] ?? 0}`} entry={entry} changed={changed} />
        <div className="entry-actions"><Button variant="destructive" className="danger" type="button" onClick={async () => { if (await confirm(resume ? 'Remove this entry from this Resume?' : profile ? 'Remove this copied entry from the Profile? Existing Resumes keep their copies.' : 'Delete this entry from your Career Record? Existing Profiles and Resumes keep their copies.')) { setEntries((items) => items.filter((item) => item.id !== entry.id)); changed(); } }}>Delete {section.singular}</Button></div></CollapsibleContent></Collapsible>
      </fieldset>} />
    </EditorPanel>)}
  </form></Tabs>{draft ? <div id={`${editorId}-preview`} className="resume-preview-dock" tabIndex={-1}><Suspense fallback={<p>Loading preview…</p>}><ResumePreview onTemplateChange={(template) => { setAppearance((current) => ({ ...current, template })); changed(); }} onExpand={() => setPreviewOnly(true)} onEdit={() => selectSection(lastEditSection.current)} resume={draft} editHref={`#${editorId}-details`} preparePdf={preparePdf} download={download} /></Suspense></div> : null}</div>{confirmation}</>;
}

function EditorPanel({ resume, value, children, hidden, id, ...props }: React.ComponentProps<'section'> & { resume: boolean; value: string }) {
  return resume ? <section id={id} hidden={hidden} {...props}>{children}</section> : <TabsContent value={value} keepMounted render={<section {...props} />}>{children}</TabsContent>;
}
