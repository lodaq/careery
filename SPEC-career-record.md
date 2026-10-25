# Spec: career-record

The single pool of career entries, authored once. Everything else reads from here; nothing else writes here.

## Objective

CRUD UI + storage for the user's career data:

- **Basics** (one reusable source set, copied into Profiles/Resumes): name, title, email, phone, location, links. Bilingual where it makes sense (name/location), plain fields otherwise (email/phone are language-neutral).
- **Entries** in five kinds — Experience, Education, Projects, Skills, Certifications. Every text field on an entry is a `Bilingual` slot (`en` required, `ar` optional). Experience entries carry date range, employer, title, and an ordered list of bullets (each bullet a `Bilingual` slot). Skills are `name + optional category` — no proficiency levels in v1.
- **Summary text is NOT stored here** — summaries belong to Profiles/Resumes.

Owns the storage layer: `src/lib/storage.ts` (JSON read + atomic write) and `data/career-record.json`. Other modules import storage helpers but never write this file.

## Success Criteria

1. Create, edit, and delete entries of all five kinds through the UI; changes persist to `data/career-record.json` and survive a dev-server restart.
2. Every text field accepts English and optional Arabic; leaving `ar` empty is valid and unremarkable.
3. Storage round-trips losslessly (unit test: write → read → deep-equal) and writes are atomic (temp file + rename).
4. The JSON shape is documented by the TypeScript types in `src/lib/types.ts` — types are the contract, no parallel docs.

## Boundaries

- Always: validate inputs client-side before write; validate again on the server; keep entry IDs stable for selection and provenance. Autosave valid edits with persistence feedback; source deletion or editing leaves existing copies intact.
- Never: compute or store anything document-specific (selection state, summaries, ordering) — that belongs to `profiles`/`resumes`.

## Open Questions

None — skills-without-levels was settled during grilling prep; veto here if you want levels.
