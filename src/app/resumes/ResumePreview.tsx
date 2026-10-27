'use client';
import { Maximize2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';

import { useState } from 'react';
import { ResumeIcon } from './ResumeIcon';
import { defaultAppearance, templates } from './appearance';
import type { Resume, ResumeAppearance } from '../../lib/types';
import { resolveResume } from '../../lib/resolver';
import { ScaledResumeDocument } from '../../template/ScaledResumeDocument';
export interface PdfAsset { blob: Blob; pages: number }
export function ResumePreview({ resume, download, editHref, onExpand, onEdit, onTemplateChange }: { onTemplateChange?: (template: ResumeAppearance['template']) => void; onExpand?: () => void; onEdit?: () => void; editHref?: string; resume: Resume; preparePdf: () => Promise<PdfAsset>; download: () => Promise<PdfAsset> }) {
  const document = resolveResume(resume);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function run() {
    setBusy(true); setError('');
    try { await download(); } catch (error) { setError(error instanceof Error ? error.message : 'Could not download PDF. Please retry.'); } finally { setBusy(false); }
  }
  return <section className="resume-preview-panel" aria-label="Preview and download">
    <div className="preview-toolbar"><h2><ResumeIcon kind="eye" /> Resume Preview</h2>{onExpand ? <Button variant="outline" type="button" className="preview-expand" aria-label="Preview" title="Expand preview" onClick={onExpand}><Maximize2Icon data-icon="inline-start" /></Button> : null}{onEdit ? <Button variant="ghost" type="button" className="back-to-editing" onClick={onEdit}>Back to editing</Button> : editHref ? <a className="back-to-editing" href={editHref}>Back to editing</a> : null}
      {onTemplateChange ? <NativeSelect className="preview-template-select" aria-label="Resume template" value={resume.appearance?.template ?? defaultAppearance.template} onChange={(event) => { const selected = templates.find(([key]) => key === event.target.value); if (selected) onTemplateChange(selected[0]); }}>{templates.map(([key, name]) => <NativeSelectOption key={key} value={key}>{name}</NativeSelectOption>)}</NativeSelect> : null}
      <Button variant="outline" type="button" disabled={busy} onClick={() => { void run(); }}>{busy ? 'Preparing PDF…' : 'Download PDF'}</Button>
    </div>
    <div className="resume-preview-scroll"><div className="resume-preview-paper"><ScaledResumeDocument document={document} /></div></div>
    {error ? <p role="alert">{error}</p> : null}
  </section>;
}
