'use client';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { Resume } from '../../lib/types';
import { resolveResume } from '../../lib/resolver';
import { ResumeDocument } from '../../template/ResumeDocument';
export interface PdfAsset { blob: Blob; pages: number }
export function ResumePreview({ resume, preparePdf, download, editHref }: { editHref?: string; resume: Resume; preparePdf: () => Promise<PdfAsset>; download: () => Promise<PdfAsset> }) {
  const document = resolveResume(resume), container = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false), [pdf, setPdf] = useState<{ url: string; pages: number; resume: Resume } | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const mounted = useRef(false);
  const prepare = useEffectEvent(preparePdf);
  useEffect(() => {
    mounted.current = true;
    const node = container.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } });
    observer.observe(node);
    return () => { mounted.current = false; observer.disconnect(); };
  }, []);
  useEffect(() => {
    if (!visible || pdf?.resume === resume) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const asset = await prepare();
        if (!cancelled) { setPdf({ url: URL.createObjectURL(asset.blob), pages: asset.pages, resume }); setError(''); }
      } catch (error) { if (!cancelled) setError(error instanceof Error ? error.message : 'Could not update the PDF preview. Retry.'); }
    }, 1100);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [resume, visible, pdf?.resume]);
  useEffect(() => () => { if (pdf) URL.revokeObjectURL(pdf.url); }, [pdf]);
  const current = pdf?.resume === resume;
  async function run(action: () => Promise<PdfAsset>) {
    setBusy(true); setError('');
    try { const asset = await action(); if (!mounted.current) return; setPdf({ url: URL.createObjectURL(asset.blob), pages: asset.pages, resume }); }
    catch (error) { if (mounted.current) setError(error instanceof Error ? error.message : 'Could not prepare PDF. Please retry.'); }
    finally { if (mounted.current) setBusy(false); }
  }
  return <section ref={container} className="resume-preview-panel" aria-label="Preview and download">
    <div className="preview-toolbar"><h2>Preview</h2>{editHref ? <a className="back-to-editing" href={editHref}>Back to editing</a> : null}
      {current ? <span className={pdf.pages > 1 ? 'preview-badge overflow' : 'preview-badge'}>{pdf.pages === 1 ? '1 page' : `${pdf.pages} pages · over one page`}</span> : <span className="preview-badge">Updating PDF preview…</span>}
      {document.missingArabicCount ? <span className="preview-badge overflow">{document.missingArabicCount} missing Arabic fields</span> : null}
      <button type="button" disabled={busy} onClick={() => { void run(download); }}>{busy ? 'Preparing PDF…' : 'Download PDF'}</button>
    </div>
    {error ? <div><p role="alert">{error}</p><button type="button" disabled={busy} onClick={() => { void run(preparePdf); }}>Retry PDF preview</button></div> : null}
    <p className="optional">PDF pages refresh after saving. Yellow text marks missing Arabic. Longer Resumes can still be downloaded.</p>
    {pdf ? <div className="pdf-pages"><iframe title="Paginated Resume PDF" src={`${pdf.url}#toolbar=0&navpanes=0&view=FitH`} className="pdf-preview-frame" /><p className="optional">{current ? 'These are the exact PDF pages.' : 'Showing the previous PDF while your latest edits are prepared.'} <a href={pdf.url} target="_blank" rel="noreferrer">Open PDF preview in a new tab</a></p></div> : null}
    <details open={!current}><summary>Live text preview</summary><div className="resume-preview-scroll"><div className="resume-preview-paper"><ResumeDocument document={document} /></div></div></details>
  </section>;
}
