# Populated analytics verification

Verified 2026-10-27. The existing local data was expanded by 50 fictional
applications, 20 Resumes and 20 Career Record entries. Totals are 50 applications,
74 Resumes, eight Profiles and 100 Career Record entries. All existing records
were compared with the pre-population backup and preserved unchanged. The seed
command is additive and idempotent; it does not refresh existing demo IDs.
Backup: `/tmp/careery-before-population.QaYvcW/`.

## Application reconciliation

The fixed-date fixture and rendered Analytics page agree:

| Metric | Expected / observed |
| --- | ---: |
| Submitted | 40 |
| Recorded responses | 24 (60%) |
| Reached interviews | 22 (55%) |
| Reached offers | 10 (25%) |
| Accepted | 3 |
| Active opportunities | 36 |
| Archived | 6 |
| Open tasks on active applications | 72 |
| Overdue tasks | 12 |
| Upcoming interviews | 10 |
| Median response time | 3 days |
| Median time to outcome | 18 days |
| No response after 14 days | 12 |

Pipeline: Saved 10, Applied 12, Interviewing 10, Offer 5, Accepted 3,
Rejected 6, Withdrawn 2, Position Closed 2. Each of five sources contributes
eight submissions. Fixture assertions also verify source-specific responses,
interviews and offers, the six monthly totals and completed stage medians.

## Actual workspace reconciliation

An independent traversal of the populated local JSON was compared with rendered
Analytics tables; it does not call the production analytics helpers.

| Section | Career Record | Profile copies | Visible Resume entries |
| --- | ---: | ---: | ---: |
| Experience | 16 | 13 | 135 |
| Education | 10 | 6 | 73 |
| Projects | 22 | 18 | 161 |
| Skills | 36 | 64 | 276 |
| Certifications | 16 | 12 | 36 |

Arabic coverage: 284 / 305 non-empty bilingual fields (93%). Reused source
entries: 100 / 100. Resume languages: 47 English, 27 Arabic. Six Resumes are
Unfiled. Actual template totals: Classic 57, Professional 4, Centered 3, Accent 3,
Cream 3, Ledger 4. These preserve existing user edits; a pristine seed fixture
has slightly different language/template totals, verified separately.

## Regression coverage

- The hydration test first reproduced the exact Grammarly body-attribute warning.
  Body-only hydration suppression retains extension attributes; a real mismatch
  inside `<main>` still produces a diagnostic.
- The production browser test injects extension attributes before hydration,
  checks displayed metrics/source rows, loads all workspace charts and verifies
  the populated mobile application list without overflow or console errors.
- Seeding tests verify duplicate prevention and preservation of edited demo IDs.
- All 67 unit/component/integration tests, lint, typecheck and production build
  pass. The populated-data production browser scenario passes.
- Two existing lazy-editor assertions now allow five seconds for their modules
  to load under the full test suite; their behavioral assertions are unchanged.

No UI components or dependencies were installed, and no owned `components/ui/`
source was edited. Dates in the live demonstration move relative to the seed
date; the automated fixture freezes the date to keep metric expectations stable.
