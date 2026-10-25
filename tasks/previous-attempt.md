# Previous implementation — historical record

These checked tasks describe the former implementation, not current functionality. Preserved during the 2026-10-25 revision. The active task list is `todo.md`.

## Task 1: Scaffold Next.js app

**Description:** `pnpm create next-app` (TypeScript strict, Tailwind, App Router, ESLint). Add Vitest + React Testing Library config. Wire scripts: `dev`, `build`, `test` (vitest run), `test:watch`, `typecheck` (tsc --noEmit), `lint`. Create `data/` (git-committed). Minimal home page saying "Careery".

**Acceptance criteria:**
- [x] `pnpm build`, `pnpm typecheck`, `pnpm lint` all pass; `pnpm test` runs one trivial test green
- [x] `pnpm dev` serves the home page; `data/` exists and is not gitignored

**Verification:** run all commands above; browser check of home page.

**Dependencies:** None
**Files likely touched:** scaffold (generated) + `package.json` scripts + `data/.gitkeep`
**Estimated scope:** L (mechanical scaffold — accepted exception)

---

## Task 2: Playwright PDF smoke route

**Description:** Install Playwright + Chromium binary. `src/lib/pdf.ts` helper (launch, print a URL to PDF, return buffer) and `/api/pdf/test` route that prints the home page and streams it as a download. This retires the biggest environment risk (Chromium on this Linux box) before eleven tasks of dependency chain lead to it.

**Acceptance criteria:**
- [x] `curl -o test.pdf localhost:3000/api/pdf/test` yields a valid PDF (`%PDF` magic bytes)
- [x] text extraction contains the home page heading (via `pdf-parse` — no poppler on this machine; 1.9 s generation, concurrent requests both valid)

**Verification:** curl + pdftotext (install poppler if missing); route called twice concurrently doesn't crash.

**Dependencies:** Task 1
**Files likely touched:** `src/lib/pdf.ts`, `src/app/api/pdf/test/route.ts`, `package.json`
**Estimated scope:** S

---

## Task 3: Domain types + atomic storage

**Description:** `src/lib/types.ts` — every shape for all modules: `Bilingual`, `Basics`, the five entry kinds, `CareerRecord`, `Profile` (selection + bilingual overrides + default headline/summary), `Resume` (language, visibility, orders, single-language overrides, own headline/summary), `ResolvedDocument` (+ Arabic-gap flags). `src/lib/storage.ts` — read/atomic-write (temp file + rename) for `data/career-record.json` and `data/profiles.json`.

**Acceptance criteria:**
- [x] Storage round-trip test (write → read → deep-equal) and atomic-write test pass using a temp dir
- [x] Types compile with zero `any`; resolver signature from `SPEC-resumes.md` type-checks

**Verification:** `pnpm test src/lib/storage.test.ts` + `pnpm typecheck`.

**Dependencies:** Task 1
**Files likely touched:** `src/lib/types.ts`, `src/lib/storage.ts`, `src/lib/storage.test.ts`
**Estimated scope:** M

---

## Task 4: Career Record editor — basics + Experience CRUD

**Description:** `BilingualInput` component (en field + optional ar field). Server actions for create/update/delete of Experience entries (employer, title, date range, bilingual bullets). Career Record page: basics form + experience list with inline editing, persisted via storage.

**Acceptance criteria:**
- [x] Full CRUD of an experience entry (bilingual fields, ordered bullets, dates) persists to `data/career-record.json` and survives dev-server restart
- [x] Browser flow works end-to-end; component test renders the form and submits via action

**Verification:** `pnpm test` + browser CRUD walkthrough.

**Dependencies:** Task 3
**Files likely touched:** `src/lib/career-record.ts`, `src/components/BilingualInput.tsx`, `src/app/career-record/page.tsx`, one test file
**Estimated scope:** M

---

## Task 5: Career Record editor — remaining four kinds

**Description:** Education, Projects, Skills (name + optional category, no levels), Certifications forms on the Career Record page with section navigation, reusing `BilingualInput` and the action pattern from Task 4.

**Acceptance criteria:**
- [x] CRUD works for each of the four kinds and persists
- [x] All five entry kinds + basics cover the spec's section taxonomy

**Verification:** `pnpm test` + browser spot-check of each kind.

**Dependencies:** Task 4
**Files likely touched:** career-record actions + page sections, one test file
**Estimated scope:** M

---
