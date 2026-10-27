# Careery v1 — revised task list

Revised 2026-10-25 for the same project after confirmed workflow decisions. Tasks 1–7 are implemented; Resume editing and the preview/PDF implementation have also landed as verified slices. The latest pagination verification below now proves exact preview/download parity. Checkpoint 1 was reviewed; the user approved retaining Next.js with a 180 kB JavaScript budget and continuing implementation. Former Tasks 1–5 evidence is retained in `previous-attempt.md`. This is the sole active task list.

Each task must preserve `CONSTRAINTS.md`. Once the scaffold exists, run `pnpm test`, `pnpm typecheck`, and `pnpm lint` for changes; build and runtime checks occur at checkpoints. File lists are estimates; split any non-mechanical slice exceeding five files. Runtime dependency additions beyond the existing approved stack require review under the current dependency rule.

## Task 1: Scaffold the local application

**Description:** Set up Next.js App Router, strict TypeScript, Tailwind, Vitest and React Testing Library. Read the installed Next.js guides before app code; retain AGENTS.md. Bind development to localhost.

**Acceptance criteria:**
- [x] All planned scripts exist; build, lint, typecheck and a meaningful app smoke test pass.
- [x] The home page loads locally without outbound requests; data directory is tracked.

**Verification:** pnpm test; pnpm typecheck; pnpm lint; pnpm build; browser home-page check
**Dependencies:** None
**Files likely touched:** package.json, pnpm-lock.yaml, framework/test configs, src/app/page.tsx
**Estimated scope:** L — mechanical scaffold exception

## Task 2: Prove local PDF generation

**Description:** Use the already specified Playwright/Chromium stack to print a local smoke page before depending on export. Check the runtime dependency ratchet before installation; the browser binary is pre-approved.

**Acceptance criteria:**
- [x] A real A4 PDF has extractable smoke-page text.
- [x] Warm generation meets the 5 s limit; concurrent requests fail gracefully or serialize and release the lock.

**Verification:** Generate and extract a real PDF; time warm generation and exercise concurrent requests
**Dependencies:** 1
**Files likely touched:** src/lib/pdf.ts, src/app/api/pdf/test/route.ts, package.json, pnpm-lock.yaml
**Estimated scope:** M

## Task 3: Persist independent bilingual content

**Description:** Define the Career Record, copied Profile/Resume content, optional Profile association, remembered language and resolved output contracts. Store career-record.json and workspace.json atomically with serialized updates.

**Acceptance criteria:**
- [x] Round-trip and failed-write tests preserve data; simultaneous workspace changes do not overwrite each other.
- [x] Deep-copy tests prove Profile and Resume content is independent, including basics, bilingual slots and bullets.
- [x] Existing user data, if found, is preserved and migrated with a tested migration before writing the new shape.

**Verification:** Focused storage/copy tests plus pnpm test, pnpm typecheck, pnpm lint
**Dependencies:** 1
**Files likely touched:** src/lib/types.ts, src/lib/storage.ts, src/lib/storage.test.ts
**Estimated scope:** M

## Checkpoint: After Task 3

- [x] Tests, typecheck, lint and build pass. Normal production home scripts total 139,217 gzip bytes, within the user-approved 180 kB budget.
- [x] Scaffold verified in desktop/mobile browser with zero WCAG A/AA axe violations; storage independence verified by tests. Editors are not built yet.
- [x] Human reviewed the foundation, approved the revised budget, and requested continued implementation.

## Task 4: Edit Career Record basics and Experience

**Description:** Build bilingual basics and Experience forms with valid-edit autosave and server validation. Keep small client boundaries and use persistence feedback.

**Acceptance criteria:**
- [x] Create, edit and delete Experience with ordered bullets; valid data survives reload/restart.
- [x] Saving/Saved/error reflect real writes; invalid edits and failed writes retain input for correction/retry.

**Verification:** Focused persistence/form tests and browser CRUD, rapid typing and failed-save checks
**Dependencies:** 3
**Files likely touched:** src/app/career-record/page.tsx, src/app/career-record/actions.ts, src/components/BilingualInput.tsx, colocated tests
**Estimated scope:** M

## Task 5: Edit the remaining career sections

**Description:** Extend Career Record editing to Education, Projects, Skills and Certifications; skills have optional category and no levels.

**Acceptance criteria:**
- [x] All four kinds support bilingual CRUD and autosave across restart.
- [x] Editing or deleting source content leaves stored independent copies unchanged.

**Verification:** Focused source-independence tests and browser CRUD for each kind
**Dependencies:** 4
**Files likely touched:** src/app/career-record/page.tsx, src/app/career-record/actions.ts, section components, colocated tests
**Estimated scope:** M

## Checkpoint: After Task 5

- [x] All tests, typecheck, lint and build pass; applicable numerical constraints measured.
- [x] Browser verifies the completed user flows; independent copies remain unchanged by source edits/deletions.
- [x] Human reviewed the Career Record checkpoint and requested Profile implementation.

## Task 6: Organize Profiles and Unfiled

**Description:** Create the home grid and Profile CRUD with counts and Unfiled navigation. Profile deletion atomically moves associated Resumes to Unfiled and describes that result in its confirmation.

**Acceptance criteria:**
- [x] Profile CRUD persists and counts match stored collections.
- [x] Deleting a populated Profile preserves all Resume content in Unfiled, tested with workspace fixtures.

**Verification:** Focused deletion tests and browser grid/delete walkthrough
**Dependencies:** 5
**Files likely touched:** src/app/page.tsx, src/app/profiles/actions.ts, src/app/unfiled/page.tsx, colocated tests
**Estimated scope:** M

## Task 7: Edit independent Profile content

**Description:** Copy selected Career Record content and basics into Profiles; edit bilingual wording, headline, summary and selection independently with autosave.

**Acceptance criteria:**
- [x] Profile edits preserve the source file; source edits/deletions preserve Profile content.
- [x] Profile content and defaults persist; existing Resume fixtures remain unchanged by Profile edits.

**Verification:** Focused independence tests and browser selection/edit/reload
**Dependencies:** 6
**Files likely touched:** src/app/profiles/[id]/page.tsx, src/app/profiles/actions.ts, Profile editor component, colocated tests
**Estimated scope:** M

## Checkpoint: After Task 7

- [x] All tests, typecheck, lint and build pass; applicable numerical constraints measured.
- [x] Browser verifies the completed user flows; independent copies remain unchanged by source edits/deletions.
- [x] User requested a large populated workspace and Resume implementation after the Profile checkpoint.

## Task 8: Create and organize saved Resumes

**Description:** Create from Profile copies or empty selection in Unfiled, reopen/rename/delete, and move between containers. Keep association separate from content. Do not add a duplicate action.

**Acceptance criteria:**
- [x] Both creation paths persist; a Profile start copies its current content and defaults without live references.
- [x] Moving preserves content, language and ordering and survives restart; deletion affects only the chosen Resume.

**Verification:** Focused create/move/delete tests and browser organization flow
**Dependencies:** 7
**Files likely touched:** src/app/resumes/actions.ts, src/app/profiles/[id]/page.tsx, src/app/unfiled/page.tsx, colocated tests
**Estimated scope:** M

## Task 9: Tailor Resume content and ordering

**Description:** Build the Resume editor to add any Career Record entry, reword local content, and control visibility and all three ordering levels. Resolve only the local Resume.

**Acceptance criteria:**
- [x] A Resume can add source entries absent from its Profile; edits and source deletions never change other copies.
- [x] Resolver is pure, covers visibility/order and immutable inputs, and meets ≥90% line coverage.
- [x] Autosave handles rapid edits and failed persistence without stale overwrite.

**Verification:** Focused resolver/editor tests with coverage; browser add, edit, order and reopen
**Dependencies:** 8
**Files likely touched:** src/app/resumes/[id]/page.tsx, src/app/resumes/actions.ts, src/lib/resolver.ts, src/lib/resolver.test.ts, Resume editor component
**Estimated scope:** M

## Task 10: Switch and remember Resume language

**Description:** Preserve local bilingual edits during language switching. Persist last chosen language (initially English); derive field-level Arabic-gap flags from this Resume only.

**Acceptance criteria:**
- [x] Switching language is allowed with gaps and preserves edits in both languages; the next Resume uses the remembered choice across restart.
- [x] Local Arabic additions clear exactly their flags; source changes cannot clear flags in an existing copy.

**Verification:** Focused language/gap tests and bilingual browser walkthrough
**Dependencies:** 9
**Files likely touched:** src/lib/resolver.ts, src/lib/resolver.test.ts, Resume editor component, src/app/resumes/actions.ts
**Estimated scope:** M

## Checkpoint: After Task 10

- [x] All tests, typecheck, lint and build pass; applicable numerical constraints measured.
- [x] Browser verifies the completed user flows; independent copies remain unchanged by source edits/deletions.
- [ ] Human review before proceeding to the next phase.

## Task 11: Preview the English A4 Resume

**Description:** Implement one isolated template for preview and printing with local fonts, selectable text, standard headings and pagination. Show a small overflow badge immediately when content exceeds one page.

**Acceptance criteria:**
- [x] Live preview uses resolved local content and isolated template CSS; Tailwind preflight does not alter print geometry.
- [x] Short and overflow fixtures produce correct page indicators; oversized entries can split without clipping.

**Verification:** Template tests and real-browser layout/pagination verification
**Dependencies:** 9
**Files likely touched:** src/template/ResumeDocument.tsx, src/template/resume-document.css, preview component, colocated tests
**Estimated scope:** M

## Task 12: Render Arabic and missing-text highlights

**Description:** Extend the same template to Arabic RTL with Arabic month names and Western digits. Keep URL/email values unchanged and LTR; highlight missing Arabic using local English text.

**Acceptance criteria:**
- [x] RTL fixture renders correctly with LTR links and selectable text; missing fields are highlighted.
- [x] Language switching and gap updates appear immediately; local fonts and styling work without external requests.

**Verification:** Template tests plus visual browser checks in both languages
**Dependencies:** 10, 11
**Files likely touched:** src/template/ResumeDocument.tsx, src/template/resume-document.css, colocated tests
**Estimated scope:** M

## Task 13: Download the latest saved Resume as PDF

**Description:** Wire the print route and download button to the shared template. Settle pending saves before export, use a single-job lock, and stream a named PDF without creating a new Resume or history entry.

**Acceptance criteria:**
- [x] EN/AR PDF downloads match saved preview content and page count, have extractable text, and meet the 5 s warm limit.
- [x] Gaps and overflow remain exportable; normal entries stay together and oversized ones do not clip.
- [x] Save failure prevents stale export with retry; repeated/concurrent export preserves Resume count and releases the lock on errors.

**Verification:** Browser end-to-end; real EN/AR PDF extraction and visual checks; warm timing; pnpm test, pnpm typecheck, pnpm lint, pnpm build
**Dependencies:** 2, 12
**Files likely touched:** src/app/render/[resumeId]/page.tsx, src/app/api/resumes/[id]/pdf/route.ts, src/lib/pdf.ts, download component, colocated tests
**Estimated scope:** M

## Checkpoint: After Task 13

- [x] All tests, typecheck, lint and build pass; applicable numerical constraints measured.
- [x] Browser verifies the completed user flows; independent copies remain unchanged by source edits/deletions.
- [ ] Human review before proceeding to the next phase.

## Career Record verification (2026-10-25)

- 18 Vitest tests: input parsing, stable bilingual textarea labels, rapid-edit sequencing, retry without lost input, optimistic revision conflicts, and source/copy independence.
- Five production browser tests pass: home readiness, home → Career Record instant shell, bilingual CRUD for all five kinds, reload, reordering, save failure/retry, and route asset budgets.
- Testing-build browser-loaded JavaScript: 146,777 gzip bytes on home and Career Record, within 180,000 bytes. Includes the testing API; normal build also succeeds with that API disabled.
- Desktop/mobile checked through agent-browser; 390 px layout has no horizontal overflow and Arabic inputs are RTL. Axe WCAG A/AA: zero violations. Next.js MCP: no compilation or runtime errors in the verification browser.
- A fresh server process restored the browser-saved name and retried phone edit from disk.
- Synthetic browser data uses temporary directories; personal data files were not populated by tests.
- No new runtime dependencies. No source file exceeds 300 lines. Profile and Resume editors remain unimplemented.

## Profile verification (2026-10-25)

- Tasks 6–7: create, rename/edit, select copied content, bilingual defaults, autosave and delete; home counts and Unfiled render from persisted workspace data.
- A fresh server process restored the browser-created Profile, copied skill and default headline.
- Profile deletion atomically clears only the association on its Resumes. Stale Profile edits and stale deletion counts are rejected without replacing current data.
- 22 Vitest tests and eight production browser tests pass. Browser coverage includes source deletion without Profile loss, Profile edits without Resume changes, deletion to Unfiled, reload persistence, and missing-Profile behavior.
- Loaded JavaScript in the testing build: home 152,499 bytes; Career Record 148,916; Unfiled 145,851; Profile test 144,172. All are below 180,000 gzip bytes.
- Accessibility regression fixed: preserved hidden routes no longer share form/section/main IDs. Browser check found 55 unique IDs out of 55 relevant nodes; mobile axe WCAG A/AA has zero violations and zero incomplete checks, with no horizontal overflow at 390 px.
- Resume lists are visible, but Resume creation/editing/movement and final Resume export remain Tasks 8–13.

## Populated workspace and Resume editing (2026-10-25)

- Added repeatable `pnpm seed:demo`: real workspace contains 80 fictional career entries, 8 Profiles and 54 Resumes, including 6 Unfiled. Rerun preserves IDs and does not duplicate data.
- Implemented Resume creation from current Profile copies or blank Unfiled; list links and confirmed deletion; local bilingual editing, source selection, entry visibility/order, section order, language persistence, moving and autosave with revision conflict protection.
- 23 unit/component tests and 9 production browser tests pass. New browser flow uses the large seed in an isolated directory and verifies create/edit/reload/move/delete. Unit tests prove source independence and stale-save/deletion rejection.
- Existing route budgets remain below 180,000 gzip bytes (home 153,844; Career Record 149,440; Unfiled 146,672; Profile 145,317).
- Preview/resolver, missing-translation highlights, live page warning and final Resume PDF export remain pending. Do not mark Tasks 9–13 fully complete on the basis of this editor slice.

## Shared preview and PDF verification (2026-10-25)

- Pure Resume resolver: 100% statements, branches, functions and lines; includes all five entry kinds, hidden entries, section order, language fallback, Arabic month names, Western years and immutable input checks.
- Shared plain-CSS A4 template renders EN/LTR and AR/RTL with local fonts, selectable text, LTR contact values and highlighted English fallback. Live preview uses the same validated form parser as persistence.
- Download settles pending saves, checks the requested revision, streams the named PDF without creating versions, and retains the existing single-job lock. Missing Resume gives 404; stale revision gives 409; unavailable render gives retryable 503.
- Browser fixtures verify one-page Arabic, long English and oversized English exports; oversized entries split without fixed-height clipping. Save failure blocks downloading and permits retry.
- Real demo PDF: two A4 pages, visibly correct Arabic and yellow fallback marks; extracted email and English achievement text both present. Resolver coverage exceeds the 90% requirement.
- The page-count badge is explicitly approximate. Exact preview page boundaries and exhaustive parity with Chromium pagination remain open; Tasks 11 and 13 are not fully accepted yet.
- No runtime dependencies added; template/resolver contain no data reads or external services.

## Exact PDF pagination verification (2026-10-25)

- Replaced the approximate page count with an exact count from the generated Chromium PDF. The paginated iframe displays the same blob downloaded by the button; browser tests compare the bytes directly.
- Short Arabic, long English and oversized-entry fixtures verify the displayed counts against PDF page objects. The preview refreshes after saving once viewed; stale pages are explicitly labeled while updated content is prepared. Live text remains available.
- Same-revision preview/download requests share an in-flight client job; subsequent requests validate the saved revision again. Failed preparation can retry without discarding drafts. Replaced/unmounted blob URLs are revoked.
- 26 unit/component tests, 10 production browser tests, typecheck, lint and production build pass. A focused component test verifies visibility gating, update labeling, exact counts and URL cleanup.
- Testing-build first-load JS: home 157,557; Career Record and Resume 153,153; Profile 149,044; Unfiled 146,672 gzip bytes. All remain under 180,000. No new runtime dependencies.
- Real dev preview checked visually; Next MCP reports no compilation issues. Axe reports zero violations and one incomplete ARIA-reference check on existing closed Arabic dialogs; do not describe this as zero incomplete checks.

## Final persistence and export checks (2026-10-25)

- A production browser test starts an isolated server on port 3102, edits and moves a Resume, stops that process, starts a fresh one, and verifies Arabic text, language, entry order, visibility, section order and Profile association. A newly created Resume uses the remembered Arabic preference.
- Real concurrent PDF requests return one 200 and one retryable 503; a following request succeeds and workspace Resume count remains unchanged. Unit tests verify context cleanup and lock release after printer and failed-render errors.
- Fixed a preview object-URL leak when navigating away before a manual PDF request completes. A component regression test verifies no URL is allocated after unmount.
- Local Arabic additions clear only their own missing-translation flags; later Career Record translations leave copied Resume flags unchanged. Resolver coverage remains 100% across statements, branches, functions and lines.
- 11 production browser tests pass, including the restart test. Testing-build gzip bytes: home 157,567; Career Record and Resume 153,163; Profile 149,055; Unfiled 146,672 (all below 180,000). Runtime dependencies remain three.
- Tasks 1–13 now have implementation and automated acceptance evidence. Human review of the finished application remains open; no commit or deployment has been performed.

## Final code review follow-up (2026-10-25)

- Reviewed editor/autosave, content selection, PDF preparation and Resume persistence against the agreed copy/edit/export workflow using the code-review-and-quality skill.
- Fixed an export race: when a user changes content while Chromium is preparing a PDF, the client now detects the newer edit/revision, saves it and regenerates instead of downloading the obsolete result. Shared in-flight requests perform the same freshness check.
- Regression test deliberately delays the old render, edits the headline, and verifies a second request uses the new revision and only the fresh PDF reaches the download anchor.
- 30 unit/component tests pass; typecheck, lint and testing-API production build pass. No runtime dependencies added.
- Final browser rerun: all 11 production tests pass. Tested route scripts remain below the 180,000-byte budget (largest: home 157,582 gzip bytes; Resume 153,178). Dev runtime compilation check reports no issues.

## Large-record usability follow-up (2026-10-25)

- Added English/Arabic full-text search and an entry-type filter to the copied-content picker shared by Profiles and Resumes. Result and selection counts remain visible; filters can be cleared in one click.
- Filtering is presentation-only: it never removes selected entries, writes workspace data, or triggers autosave. A component regression test verifies these boundaries.
- Mobile browser check at 390 px shows no horizontal overflow. All Arabic-badge ARIA control references were manually verified to point to existing dialog elements (the previous axe incomplete check concerns closed native dialogs, rather than missing IDs).
- 31 unit/component tests, typecheck and lint pass. No new runtime dependencies.
- All 12 browser scenarios now pass across the full run and corrected picker-test rerun. The Arabic search test explicitly filters Skills before asserting eight matches; an all-type search correctly also finds Arabic wording in other entry kinds. Persisted workspace bytes remain identical after filtering and reload. Tested home JS is 158,036 gzip bytes, below the 180,000-byte limit.

## Editor layout and navigation follow-up (2026-10-25)

- Resume editing uses a two-column workbench on screens at least 1200 px wide, with a sticky PDF preview beside the editable content. Narrow screens retain the continuous editor and preview flow.
- Save feedback, retry/save action and horizontally scrollable section navigation remain visible while editing. Added Details and Choose content jumps plus entry counts for each section. Anchor targets accept keyboard focus and leave room for the controls.
- Language and Profile selectors now use consistently styled, labeled controls. Section ordering is expandable beneath headline/summary, keeping everyday wording edits easier to reach.
- Manual desktop check at 1440 px: save controls pinned at y=0, preview at y=16, selected section begins below the controls. Mobile at 390 px: no horizontal page overflow; section begins at y=210 below the controls ending at y=171; target receives keyboard focus. Arabic modal Escape restores focus to its badge.
- 31 unit/component tests, typecheck, lint and testing-API build pass. Runtime dependency count remains unchanged.
- Final layout browser rerun: all 12 production scenarios pass, including persistence across restart with the expandable order control. Loaded gzip JS stays within budget (home 158,157; Resume/Career Record 153,753; Profile 149,656; Unfiled 146,672 bytes). Next MCP reports no compilation issues.

## Single-page mobile navigation follow-up (2026-10-25)

- Kept the confirmed one-scrolling-page mobile design. Preview now includes a Back to editing anchor; it returns to Resume details and transfers keyboard focus to that section without remounting the editor.
- Preview actions remain sticky while reading long content. The optional live text view reflows to the available width; the exact paginated PDF continues to use the shared A4 print layout.
- Improved Profile/Unfiled Resume rows with separated language badges, readable names, and consistently placed delete controls; creation forms wrap to fit smaller screens.
- Manual mobile checks at 390 px: text preview fits a 334 px container, no horizontal page overflow, zero tablists, return link focuses Resume details, and Unfiled displays all six demo rows without overflow. Next MCP reports no compilation issues.
- 31 unit/component tests and all 12 production browser scenarios pass; typecheck, lint and normal production build succeed. Client JS remains below budget (largest route: home 158,204 gzip bytes). No new runtime dependencies.
- Awaiting the user's preference before changing saved Resume ordering; current creation order is preserved.

## Recent-edit ordering follow-up (2026-10-25)

- Applied the recommended recent-edit ordering after the user requested continued work. Profile and Unfiled lists sort dated Resumes newest first; equal/absent/invalid timestamps retain stable relative order, and read-only sorting never rewrites workspace storage.
- Added backward-compatible optional `updatedAt` metadata. Creation and real persisted changes stamp server time; unchanged saves preserve both timestamp and revision. No historical timestamps were filled into existing data.
- Unit tests cover stable sorting, immutable input, default and previously edited no-op saves, real changes and creation timestamps. Browser tests cover both containers, editing a legacy Resume, promotion to first position and reload persistence.
- 33 unit/component tests and all 13 production browser scenarios pass; typecheck and lint pass. Testing-build route JS remains under 180,000 gzip bytes (largest observed: Profile 161,279). Runtime dependency count remains three.

## Tadween reference redesign (2026-10-25)

- Implemented compact Edit/Customize/Review navigation, sidebar editing, lavender styling and persistent PDF preview using the supplied screenshots.
- Added six shared-layout visual variants, saved typography/color/spacing controls, section visibility, drag ordering and a local readiness checklist. Arabic badge dialogs and independent Resume content remain supported.
- Verified 37 tests, resolver 100% coverage, 15 production browser scenarios, typecheck/lint, and desktop/mobile rendering. Route bundles remain below 180,000 gzip bytes, with no new runtime dependencies.

## Resume library reference (2026-10-25)

- Added /resumes with screenshot-inspired compact navigation, lavender background, searchable cards, profile/unfiled filters and an expandable creation form. Profiles remain at / and existing Profile/Unfiled workflows remain available.
- Search and organization filter composition covered by a component test. All 38 tests, typecheck, lint and production build pass. Real browser confirmed six Unfiled results, creation form expansion, no overflow at 390px, zero axe violations/incomplete checks and no Next compilation issues.

## Compact translation controls and visual consistency (2026-10-25)

- Moved all shared BilingualInput Arabic controls beside field labels; inputs/textareas now fill the available width. Badges are 26×22px with populated styling, accessible labels, keyboard focus and larger coarse-pointer hit regions.
- Unified shared lavender/plum tokens and inherited app control fonts; aligned primary actions, input borders and translation dialogs. Resume document typography remains separate.
- Verified 38 tests, typecheck/lint, native dialog open/close, and no horizontal overflow at 320/768/1024/1440px. Axe reports no confirmed violations; the pre-existing closed native dialog aria-controls check requires manual review, and references resolve to mounted dialogs. Next reports no compilation issues.
