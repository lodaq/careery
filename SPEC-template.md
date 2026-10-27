# Spec: template

One shared ATS layout rendering a `ResolvedDocument` to HTML, with six selectable visual variants and persisted typography, color and spacing. Live preview and `pdf-export` use the same component.

## Objective

- A React component (`src/template/ResumeDocument.tsx`) + dedicated plain CSS (`resume-document.css`, no Tailwind, no preflight leak) rendering a `ResolvedDocument`.
- **A4, single column**, generous margins, standard headings (Summary, Skills, Experience, Education, Projects, Certifications — order taken from the ResolvedDocument).
- URL and email values remain unchanged and render in isolated LTR spans in both languages. Fonts are local; no translation service or remote font request.
- **Two modes by language:** `en` (LTR) and `ar` (RTL: `dir="rtl"`, Arabic font stack, right-aligned). Dates via a formatter: `Jan 2022` / `يناير 2022` (Western digits always).
- **Print behavior:** keep entries together when they fit on a page; entries taller than a printable page may split to avoid clipping. Use this same A4 geometry for preview pagination and the immediate, small overflow badge. Longer Resumes remain exportable.
- **ATS invariants, enforced by construction:** real text only (no text-in-images, no icon fonts for content), no tables/multi-column, standard section headings, machine-readable contact line in the header.
- **Missing-Arabic marking** (settled in review): in an `ar` document, any field whose Arabic slot is missing renders its English text on a yellow highlight — unmistakable in preview *and* in the exported PDF. Export is never blocked; backfilling without a mark never happens.
- New Resumes start with section order: Summary, Skills, Experience, Education, Projects, Certifications (set at creation by `resumes`; reorderable).

Consumes the `ResolvedDocument` shape from `resumes` — nothing else. No fetching, no state beyond language mode.

## Success Criteria

1. Renders fixture ResolvedDocuments in both languages without errors; a fixture with flagged Arabic gaps renders the highlighted English text in both preview and PDF paths (marked, never silent).
2. `dir` flips correctly for `ar`; computed styles confirm single column (no `display: grid/columns` with >1 column) — asserted in a component test.
3. Text is selectable in preview; headings match the canonical list.
4. Browser verification compares preview page count with generated PDF page count for short, overflow, and over-height-entry fixtures; URL/email direction is verified in Arabic.
5. Same component renders identically in preview (scaled) and in the PDF render route (unscaled, print CSS) — verified visually at milestone.

## Boundaries

- Always: keep all styling inside `resume-document.css`; accept only `ResolvedDocument` as props.
- Never: read `data/`, contain business logic, or fork into separate preview/PDF components.

## Open Questions

None — default section order and export-anyway-with-marking both settled in review.
