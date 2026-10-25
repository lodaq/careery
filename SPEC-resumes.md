# Spec: resumes

Independently editable, job-specific Resumes under a Profile or in Unfiled.

## Objective

- Create, rename/edit, and delete Resumes. Create from a Profile's copied content or start with no selected entries. A blank Resume can live in Unfiled; Profile content is optional.
- Add any Career Record entry to any Resume, even if absent from its Profile. Copy bilingual values and retain local edits in the Resume only. Capture basics locally so contact edits elsewhere cannot change a prepared Resume.
- Edit wording, headline, summary, visibility, section order, entry order, and bullet order. Retain English and Arabic slots locally so switching languages preserves previous work.
- Move between Profiles or to/from Unfiled. Only the Profile association changes; content, language, visibility, and ordering stay identical. Moving does not duplicate or initialize content from the destination.
- Each Resume renders one language (`en` or `ar`). Start with the last chosen language, initially English; remember explicit choices across restart. Switching is permitted with incomplete Arabic text.
- Autosave with Saving/Saved/error feedback. Serialize updates so older writes cannot overwrite newer edits; retain unsaved edits on failure and allow retry. Navigation and export must settle pending edits rather than silently discard them.
- Lists show most recently edited Resumes first. New Resumes and actual edits receive a persisted optional `updatedAt` ISO timestamp; unchanged saves do not change it. Existing Resumes without timestamps keep their relative order after dated items, without inventing historical dates.
- Reopen saved Resumes for editing. Downloading exports the existing Resume and creates no additional copy or version-history record.
- The pure `src/lib/resolver.ts` exposes `resolveResume(resume) → ResolvedDocument`: local visibility/order, language selection, final wording, and field-level Arabic-gap flags. It reads no Profile or Career Record and mutates no inputs.
- Missing Arabic uses the local English value with a yellow highlight in preview/PDF and a warning count in the editor. Filling Arabic in this Resume clears its flag; changing a source does not.
- Aim for one page. Show a small overflow badge as soon as rendered content exceeds one A4 page, without blocking edits or export. No trimming suggestions in v1.

## Success Criteria

1. Create by either path, add content outside a Profile, edit/reopen, delete, and move with persistence across restart. Source edit/deletion and Profile changes cannot alter existing Resume content.
2. Resolver tests cover language slots, field-level gaps, visibility and all ordering levels, input immutability, and English/Arabic edits surviving language switches; ≥ 90% line coverage per constraints.
3. Autosave tests cover rapid edits, navigation/export while saving, and failed writes/retry; no premature Saved indication or stale overwrite.
4. Remembered language, immediate overflow badge, and highlighted fallback work in the browser; gaps and extra pages never block export.

## Boundaries

- No live inheritance, source-driven cleanup, or reset-to-current-Profile behavior. Source IDs are provenance only.
- Persist editable bilingual Resume content; derive `ResolvedDocument` on demand. Do not persist derived output or PDF versions.
- No duplicate action in v1; movement is the chosen organization operation.
