# Careery

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A person maintaining their own career information and preparing job-specific
Resumes in English or Arabic. Careery is a single-user, local application;
Profiles represent career-specific content collections, not user accounts.

## Product Purpose

Keep reusable bilingual career content, tailor independent Resumes for particular
jobs, and export A4 PDFs. Success means preparing a document with deliberate
wording and predictable output without changing previously prepared Resumes.

## Positioning

A personal, local-first resume workspace built around reusable English/Arabic
content and independent copies. Source edits never silently change a Profile or
Resume that already copied that content.

## Operating Context

Run locally with `pnpm dev` on loopback. Personal content is stored in JSON files
under `data/`, with atomic writes and no cloud, accounts, or database.

The core workflow is Career Record → independently editable Profile content →
job-specific Resume → A4 PDF. Resumes may also start empty and receive content
directly from the Career Record. Profiles organize Resumes; Unfiled holds Resumes
without a Profile. Moving a Resume changes its container, not its content.

## Capabilities and Constraints

- Career Record holds reusable career information with English and optional
  Arabic wording. Profiles and Resumes copy content independently.
- Tailor Resume wording, selected entries, visibility, ordering, section order,
  and document language. Deleting a Profile moves its Resumes to Unfiled.
- Edits autosave with Saving, Saved, and error/retry feedback. Never report Saved
  before persistence succeeds. Export uses the latest successfully saved content.
- Preview and PDF export share the same document template. PDFs use A4,
  single-column layout, standard section headings, and selectable text. Aim for
  one page; warn on overflow without blocking longer documents. Do not claim
  universal ATS compatibility.
- App content stays local by default: no telemetry, analytics, or remote fonts.
  User-initiated AI Review is the explicit exception: it sends saved visible
  Resume wording and an optional target role to OpenRouter, excluding identity
  and contact fields. The server holds the API key; feedback never applies itself. PDF generation uses local headless Chromium.
- UI tooling and component precedence come from AGENTS.md: Next.js App Router,
  strict TypeScript, Tailwind v4, shadcn/ui on Base UI, and the approved registries.
  Keep the Resume template's plain CSS isolated from app styles.
- Light and dark mode are required. Keep motion restrained and honor reduced
  motion. Server Components remain the default.
- CONSTRAINTS.md owns numerical quality gates. Older statements there forbidding
  UI libraries or recording three runtime dependencies predate the user-approved
  stack; AGENTS.md is the authority for UI tooling.
- Accounts, cloud hosting, DOCX export, and automatic copy propagation are outside
  current scope. Application tracking now supports a personal job search with
  local tasks, interviews, submissions and outcome analytics. General PDF history
  remains deferred. AI Review is optional and user-initiated.
- Primary device mix and any audience beyond personal use remain undecided.

## Brand Commitments

The product name is Careery. Use the domain terms Career Record, Profile, Resume,
Unfiled, and Move as defined in GLOSSARY.md. A Resume is job-specific; do not use
CV as its synonym. Do not introduce marketing claims or a broader audience
without confirmation.

## Evidence on Hand

- docs/specs/README.md and docs/specs/SPEC-*.md describe the product requirements and module contracts.
- GLOSSARY.md defines product language; docs/adr/0002-independent-content-and-resume-organization.md
  records the independent-copy model.
- Existing app routes, tests, and src/template/ provide implementation evidence;
  older progress statements in the README/specs can lag current code.
- `data/` contains editable personal content and fictional demo content. Keep
  fictional examples labeled; never present them as customer proof.
- No customer testimonials, market benchmarks, or universal ATS guarantees have
  been established.

## Product Principles

1. Preserve authorship: wording and content selection remain deliberate user
   choices; copies never change because a source changed.
2. Keep organization separate from content: moving or unfiling a Resume must not
   rewrite it.
3. Make persistence and output trustworthy: save status reflects reality, and
   preview and export represent the saved document.
4. Keep personal information local and the workflow simple, minimal, and fast.
5. Treat bilingual completeness explicitly: expose missing Arabic instead of
   silently substituting unmarked English.

## Accessibility & Inclusion

- Fully keyboard navigable with visible focus states, labeled controls, and
  WCAG AA contrast.
- English documents use LTR; Arabic documents use RTL, Arabic month names, and
  Western digits. Email and URL values remain unchanged and LTR.
- Remember each Resume's language choice, initially English. Missing Arabic is
  flagged in the editor and visibly highlighted as English if exported anyway.
- Honor `prefers-reduced-motion`.
