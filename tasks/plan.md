# Implementation Plan: Careery v1 revision

## Overview

Implement the confirmed workflow: create a Resume from copied Profile content or an empty selection, add anything from the Career Record, adjust it independently, autosave, and download a bilingual A4 PDF. Profiles organize multiple Resumes; Unfiled holds those without a Profile. Movement preserves content, and Profile deletion moves its Resumes to Unfiled.

## Current state and history

The current implementation includes the local data foundation, Career Record and Profile editors, Resume organization/editing, and a shared English/Arabic preview and PDF download. Previous implementation history is preserved in `previous-attempt.md`. Current verification evidence is recorded in `todo.md`. The paginated preview now displays the generated PDF itself; short, long and oversized-entry fixtures verify exact counts and identical preview/download bytes.

Requirements were confirmed on 2026-10-25. This revised implementation plan is ready for human review; implementation now covers Tasks 1–13, including exact PDF preview and fresh-process persistence checks. Human review of the finished application remains open. Functional checks pass; the user approved a revised 180 kB first-load JavaScript target against the 139,217-byte baseline and requested continued implementation.

## Architecture Decisions

- Accepted ADR 0002 supersedes live inheritance: copy bilingual content and basics at selection/creation time. Sources may record provenance but never drive existing copies.
- Store Career Record separately and independent Profiles/Resumes plus language preference in one workspace JSON file. Serialize read-modify-write operations; atomic rename alone does not prevent lost updates.
- The pure resolver accepts only a Resume. It selects language, orders visible content and flags missing Arabic. Template and PDF consume one resolved output.
- Autosave acknowledges durable writes, preserves failed edits, and settles before navigation/export. The Saved indicator cannot precede persistence.
- One isolated template serves scaled preview and print output. Local fonts, A4 geometry, page-count feedback, RTL and LTR links must be checked in a real browser and a real PDF.
- Keep the existing Next.js/TypeScript/Tailwind/Playwright/Vitest stack and quality targets. Read installed Next.js documentation before implementation; the installed package is the source for version-specific API guidance.

## Task List

Detailed acceptance criteria, dependencies, verification and file estimates are in `todo.md`.

### Foundation

- Task 1: Scaffold the local application
- Task 2: Prove local PDF generation
- Task 3: Persist independent bilingual content

### Career Record

- Task 4: Edit Career Record basics and Experience
- Task 5: Edit the remaining career sections

### Profiles

- Task 6: Organize Profiles and Unfiled
- Task 7: Edit independent Profile content

### Independent Resumes

- Task 8: Create and organize saved Resumes
- Task 9: Tailor Resume content and ordering
- Task 10: Switch and remember Resume language

### Preview and PDF

- Task 11: Preview the English A4 Resume
- Task 12: Render Arabic and missing-text highlights
- Task 13: Download the latest saved Resume as PDF

## Checkpoints

After Tasks 3, 5, 7, 10 and 13: run tests, typecheck, lint and build; measure applicable constraints; verify working user flows in a browser; review with the human before the next phase. Final verification includes actual English/Arabic PDFs, extraction, visual pagination checks, save-failure behavior, movement, Profile deletion and source independence.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Unexpected live references alter prepared content | High | Deep-copy and source edit/deletion tests at each creation boundary |
| Autosave overwrites newer edits or exports stale state | High | Serialized updates, accurate save feedback, retained failed drafts and export/navigation coordination |
| Profile deletion loses Resumes | High | One atomic workspace update, fixture tests, reload verification |
| Preview and print page counts differ | Medium | Shared A4 geometry, font readiness, real-browser and PDF fixture comparison |
| Entry taller than a page clips or overflows | Medium | Permit that entry to split; verify oversized fixtures |
| Chromium unavailable | High | Early real PDF smoke test; previous results are historical |
| Historical metrics mistaken for current checks | Medium | Label history and remeasure without weakening targets |

## Scope and limits

No live inheritance or reset-to-current-source, duplicate action, AI trimming/tailoring, PDF version history, CV type, DOCX, auth, cloud, public page or billing in v1. Resume editing is persistent; downloading creates no extra saved version. Page overflow and Arabic gaps warn without blocking export. Text extraction supports the ATS goal but cannot guarantee compatibility with every ATS.

## Open Questions

No unresolved product choice blocks this plan. Exact TypeScript shapes are established in Task 3 under the accepted independent-copy model. If user data appears before implementation, inspect it and provide a tested migration. The existing runtime dependency baseline and pre-approved PDF tooling must be reconciled before installation rather than silently weakening the dependency ratchet.
