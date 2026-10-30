# Spec: pdf-export

The button. One click → ATS-suitable PDF file downloaded. No print dialog.

## Objective

- A **Download PDF** button on each Resume → server route → **Playwright (headless Chromium)** loads the template render route for that Resume and prints it to PDF with the exact A4 print CSS → response streams `resume-name.pdf` as a download.
- One render route (`/render/[resumeId]`) serves the template at print scale, unauthenticated (localhost-only app), reused by nothing else — the live preview renders the same component directly.
- Wait for pending autosave before rendering; on save failure show a retryable error rather than export stale content. Download never creates a new Resume or a history entry.
- Simple in-flight lock: one PDF job at a time (single user); the button shows busy state. Generated files are streamed, never stored.
- **Gaps don't block export** (settled in review): Resumes with missing Arabic fields export anyway; the template marks those fields (see `SPEC-template.md`) and the editor shows a "N missing Arabic fields" warning badge beside the Download button, which stays enabled.

## Success Criteria

1. Clicking Download yields `<resume-name>.pdf` in the browser's download; file opens as A4 single-column matching the preview.
2. **Text extractability**: `pdftotext` (or `pdf-parse` fallback) on the output contains the Resume's bullets and headings verbatim. This verifies extractable text; compatibility with every ATS cannot be guaranteed.
3. Multi-page Resumes break between entries that fit on one page; an oversized entry may split without clipping. Verify long and oversized-entry fixtures and agreement with preview page count.
4. Arabic PDF: RTL layout preserved, text extractable (may render visually reversed in some extractors — acceptable; the file itself is correct).

## Boundaries

- Ask first: Playwright browser binary install (~150 MB) is a dependency decision — pre-approved via this spec.
- Never: store generated PDFs in the repo; queue systems; cloud PDF services.

## Open Questions

None.
