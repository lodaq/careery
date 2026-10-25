# Careery — Capability Map & Project Spec

> **Status (2026-10-25):** Requirements revised and confirmed with the user. The app scaffold, Career Record editor, Profile management, Unfiled, PDF smoke route, bilingual copy contracts, and atomic JSON storage are implemented; Resume creation/editing and final Resume PDF export remain planned. Earlier implementation results are historical, not current completion evidence. The user wants the existing direction revised and implemented.

Personal, local-first resume builder. Copy bilingual Career Record content into independent Profiles or Resumes; organize Resumes under Profiles or in Unfiled; tailor and export an A4 single-column PDF. See `GLOSSARY.md` and accepted `docs/adr/0002-independent-content-and-resume-organization.md`.

## Capability Map

| Module id | Responsibility | Depends on |
|---|---|---|
| `career-record` | Entry CRUD for all sections with EN/AR text slots; JSON persistence in `data/` | — |
| `profiles` | Home grid, Profile CRUD, independently copied content; deletion moves Resumes to Unfiled | `career-record` |
| `resumes` | Independent Resume CRUD, Unfiled, movement, content selection, autosave, remembered language; pure Resume resolver and missing-Arabic flags | `profiles` |
| `template` | The one ATS template: A4, single column, EN + RTL-Arabic rendering (Arabic month names, Western digits) | `resumes` (its resolved-data shape) |
| `pdf-export` | "Download PDF" button → server route → Playwright → file download | `template` |

**Build order:** `career-record` → `profiles` → `resumes` → `template` → `pdf-export`. `template` may be developed in parallel against a resolved-data fixture, then wired up.

## Tech Stack

- Next.js (App Router) + TypeScript strict, run locally with `pnpm dev`. No auth, no cloud, no database.
- Storage: JSON files in `data/` (`career-record.json`, `workspace.json`), git-committed, written atomically (temp file + rename).
- Tailwind for the app UI. The resume template is dedicated plain CSS — Tailwind preflight must not leak into it (print fidelity).
- PDF: Playwright (headless Chromium) server-side.
- Tests: Vitest + React Testing Library.

Quality bar (simple, minimal, fast) is encoded with numbers and commands in `CONSTRAINTS.md` — it is canonical over this file on quality matters.

## Commands

Commands are available. See README.md for loopback startup and separate development/production build directories.

```
Dev:       pnpm dev
Build:     pnpm build
Test:      pnpm test            # vitest run
Watch:     pnpm test:watch
Typecheck: pnpm typecheck       # tsc --noEmit
Lint:      pnpm lint
```

## Project Structure

```
src/app/         → Routes: home grid and Unfiled, Career Record editor, Profile editor, Resume editor, PDF render route
src/components/  → App UI components
src/template/    → Resume template component + its CSS (isolated from app UI)
src/lib/         → Domain types, resolver, storage (JSON read/atomic write)
data/            → career-record.json, workspace.json (git-committed, personal data)
docs/adr/        → Architecture decision records
SPEC-*.md        → Module specs (this file is the index)
```

Tests are colocated with source (`*.test.ts` / `*.test.tsx`).

## Code Style

Named exports except Next.js file conventions and configuration files that require default exports; data shapes as `interface`, unions as `type`; no classes; kebab-case files for libs/routes, PascalCase for components; comments only for constraints the code can't show.

```ts
export interface Bilingual {
  en: string;
  ar?: string; // Arabic slot — optional everywhere, flagged when an Arabic Resume needs it
}

/** Pure: resolves one independent Resume without reading its former sources. */
export function resolveDocument(
  resume: Resume,
): ResolvedDocument;
```

## Testing Strategy

- **Resolver** (`resumes` module) is pure logic — ≥ 90% line coverage per `CONSTRAINTS.md`: visibility, ordering, language selection, missing-Arabic flagging, input immutability. Copy independence is tested at creation and storage boundaries.
- **Storage** — unit tests with a temp `data/` dir: round-trip, atomic write, serialized updates, content-preserving movement, and Profile deletion to Unfiled.
- **Editors** — light RTL component tests (render, mutate, persist via mocked storage).
- **Runtime** — browser verification with DevTools at each module milestone; **PDF** — generate a real file and verify text extractability (`pdftotext`, fallback `pdf-parse`).
- Autosave tests cover rapid edits, failure/retry, navigation and export waiting for pending saves; never display Saved before persistence succeeds.

## Global Invariants (all modules)

1. Single column, A4, real selectable text, standard section headings — designed for ATS text extraction, without claiming compatibility with every ATS.
2. Arabic Resumes render RTL with Arabic month names and Western digits (يناير 2022).
3. Copies are independent: source edits/deletions never change existing Profiles or Resumes. Moving preserves Resume content; deleting a Profile moves its Resumes to Unfiled.
4. Missing Arabic slots are flagged in the editor; if exported anyway, they render visibly marked (highlighted English text) in the PDF — never silently backfilled with English.
5. Nothing leaves the machine: no telemetry, analytics, remote fonts, or network calls except localhost.
6. Edits save automatically with Saving/Saved/error feedback. Export uses the latest successfully saved content.
7. Aim for one page; immediately show a small warning on overflow without blocking longer Resumes.
8. English is LTR, Arabic RTL; URL and email values remain unchanged and LTR. Remember the last Resume language choice, initially English.

## Boundaries

- **Always:** run `pnpm test` + `pnpm typecheck` before commits; update `GLOSSARY.md`/ADRs when the model changes; migrate `data/` JSON when its shape changes.
- **Ask first:** new dependencies; changing `data/` JSON shape; changing module boundaries in this map.
- **Never:** auth/accounts in v1; automatic propagation between independent copies; committing generated PDFs; DOCX export.

## Deferred (recorded, not spec'd)

PDF version history → CV document type → AI trimming/tailoring suggestions (paste JD) → ATS checker → AI mock interviews → application tracking. Permanently out: public personal page, credit billing.
