# Constraints

Last reviewed: 2026-10-25 by sebaq

User's standing rules, made checkable: **simple code, minimal code, fast app.**

## Floor (always enforced, no setup required)

- No suppression comments: `@ts-ignore`, `eslint-disable`, empty `catch {}`
- No unimplemented stubs (`throw new Error("Not implemented")`) where the spec says something works
- No skipped or deleted tests without a reason in the commit message
- No secrets or editable personal data in source; keep local `data/` files ignored by Git and back them up separately.
- This file is not weakened to make a change pass

## Enforced with numbers

| Dimension | Rule | Checked by | Runs at |
|-----------|------|-----------|---------|
| Types | Zero type errors | `pnpm typecheck` | every edit |
| Lint | Zero errors, zero warnings | `pnpm lint` | every edit |
| Tests | All pass | `pnpm test` | every edit |
| Resolver coverage | `src/lib/resolver.ts` ≥ 90% lines | `pnpm test -- src/lib/resolver.test.ts --coverage` | task end |
| Client JS | ≤ 180 kB gzip first-load per route; `/interview-questions` ≤ 185 kB (modern-browser initial scripts, including framework) | `pnpm build` output, read at task end | task end |
| PDF generation | ≤ 5 s per resume, warm browser | timing script at `src/lib/pdf.ts` task end | task end |
| Dependencies | Runtime dep count must not grow (recorded below) | diff of `package.json` dependencies at review | review |

User-approved exception (2026-10-27): the TanStack questions table may exceed 180 kB. Its route-specific ceiling is 185,000 gzip bytes; all other routes retain the 180,000-byte ceiling.

Reasons: 180 kB includes the measured 139 kB Next.js baseline and leaves roughly 41 kB for interactivity. The user approved keeping Next.js and revising this budget on 2026-10-25; Server Components remain the default. 5 s keeps the direct-download button feeling instant. The dep ratchet encodes "minimal code": every new dependency is a ask-first decision per `docs/specs/README.md`.

## Historical measurements, not current implementation evidence

The implementation measured below is no longer in the repository. Preserve these reference values; remeasure after scaffolding. No checks can run until package scripts exist. The numerical quality targets above remain unchanged.

| Metric | Former implementation (2026-10-25, post Task 5) | Direction |
|--------|-------|-----------|
| Runtime dependencies | 3 (next, react, react-dom) | must not grow |
| Lines of code in `src/` | 1005 | must not grow by >10% per feature task |
| Files in `src/` over 300 lines | 0 (largest: types.ts at 241) | zero is the goal; any is flagged at review |

## Simplicity rules (review-enforced, stated so no session forgets)

1. Server Components by default; `"use client"` only where interactivity requires it.
2. `src/lib/types.ts`, `storage.ts`, `resolver.ts`, `pdf.ts` are the only shared modules. A new shared module needs a reason spoken out loud first.
3. No UI component library, no state library, no form library — Tailwind classes + server actions + `useState` until that genuinely hurts.
4. Comments only for constraints the code can't show.
5. Any file over 300 lines gets looked at with suspicion at review.

## Notes

- No CI: this is a single-user localhost app. All gates run in the dev loop and at task end.
- No security scanners: no secrets, no network surface, no deploy target. If Careery ever gets hosted, revisit.

## Current foundation measurements (2026-10-25)

- Runtime dependencies: 3 (`next`, `react`, `react-dom`); unchanged from the recorded baseline. PDF and test tooling are development dependencies for this localhost project.
- Normal production home initial script assets: 139,217 gzip bytes, excluding the legacy nomodule asset. The former 100 kB target was not met. The user-approved current 180 kB target is met. Next.js 16.4.3 no longer reports first-load sizes in its route table, so this measurement sums gzip sizes of script assets referenced by generated home HTML.
- Warm PDF smoke generation: 1.09 seconds; one A4 page with extractable heading. Concurrent requests yield one PDF and one retryable 503, followed by successful retry.
- Eight Vitest tests, typecheck, lint, normal and testing-API production builds pass; one production `instant()` readiness test passes. No dynamic-route optimization is claimed.
- Desktop/mobile automated accessibility check: zero violations; mobile width 390 px with no horizontal overflow. Next.js MCP reports no compilation or runtime errors.

## Career Record checkpoint measurements (2026-10-25)

- User-approved budget: 180 kB gzip per route, including framework scripts.
- Browser-loaded JavaScript in the testing build: 146,777 bytes for home and Career Record (including the testing API). Automated browser tests enforce ≤180,000 bytes; normal build leaves the testing API disabled.
- 18 Vitest tests and five production browser tests pass. Typecheck, lint and production build pass. No new runtime dependencies; all source files remain below 300 lines.
- The Career Record supports bilingual CRUD for all five entry kinds, contact links, ordered achievements, valid-edit autosave, failed-save retry, and stale-tab conflict protection. Tests confirm source edits/deletions leave saved Profile/Resume data byte-identical.

## Profile checkpoint measurements (2026-10-25)

- 22 Vitest tests and eight production browser tests pass; typecheck, lint and build pass. Runtime dependencies remain three and all source files are under 300 lines.
- Testing-build loaded JavaScript ranges from 144,172 to 152,499 gzip bytes across home, Career Record, Profile and Unfiled checks, within the user-approved 180,000-byte limit.
- Browser verification covered preserved-page ID uniqueness, RTL Arabic fields, mobile width and axe accessibility; zero violations or incomplete checks after the ID fix.
- Profile/Resume copying and deletion behavior are verified with isolated fixtures. Resume editing remains the next implementation phase.

## Resume editor redesign checkpoint (2026-10-25)

- Tadween-inspired three-pane resume studio: native section navigation, independently scrolling section editor and persistent PDF/live preview. Collapsed entries retain all form values; sidebar navigation never submits the form. Mobile has horizontally scrolling section navigation and a Preview view.
- 35 Vitest tests pass. All 14 production browser scenarios pass (12 on the initial full run, the content-picker scenario after adapting its navigation to the new sidebar, and the new editor-layout/draft/invalid-field scenario on the final normal build). Coverage reports all 45 resolver statements covered; line coverage remains above 90%.
- Typecheck, zero-warning lint, and normal production build pass. Desktop/mobile axe audits report zero violations and zero incomplete checks; mobile document width is 390 px at a 390 px viewport. Next.js MCP reports no runtime or compilation errors.
- Normal production resume initial modern-browser scripts: 149,317 gzip bytes, excluding the non-loaded legacy nomodule asset. Browser-loaded scripts in the testing build measured 155,197 gzip bytes on the resume route. Both are below 180,000 bytes; PDF/browser checks retain the warm export ≤5-second assertion.
- Runtime dependencies remain three. Source lines grew from 1,758 to 1,902 (8.2%); all edited source files remain below 300 lines. No personal workspace data was changed for testing; all browser writes used isolated fixtures.
