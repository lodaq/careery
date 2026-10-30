# Spec: profiles

Profiles provide reusable career-specific content and organize independent Resumes.

## Objective

- Home lists Profiles with entry and Resume counts, plus an accessible Unfiled area. Add, rename/edit, and delete Profiles.
- Select Career Record entries to copy into a Profile. Copy bilingual content and basics; edit or remove Profile content independently. Profile headline and summary are bilingual defaults copied into new Resumes.
- Starting a Resume from a Profile preselects its current content. Later Profile edits, removals, or Career Record changes do not affect existing Resumes.
- Deleting a Profile confirms that its Resumes will move to Unfiled, then performs that move and deletion atomically. No Resume is deleted by this operation.
- Autosave edits with Saving/Saved/error feedback; Saved means persistence succeeded.

Owns Profile operations in `data/workspace.json`, containing separate Profile and Resume collections and the remembered language preference. Resume organization uses an optional Profile ID, not embedded Resume content. Shared storage serializes read-modify-write operations and writes atomically.

## Success Criteria

1. Profile CRUD and independently copied content persist across restart; editing or deleting source entries leaves Profile content intact and Profile edits leave the Career Record intact.
2. New Resumes receive the current Profile content as a deep copy; subsequent changes on either side leave the other unchanged.
3. Profile deletion moves all associated Resumes to Unfiled with content unchanged, including on reload; the confirmation describes this behavior.
4. Autosave accurately reports success and failure without losing rapid successive edits.

## Boundaries

- Never write Career Record content or propagate Profile changes to existing Resumes.
- Removing an entry from a Profile never restricts what a Resume can select from the Career Record.
- No automatic synchronization or reset to a live source.
