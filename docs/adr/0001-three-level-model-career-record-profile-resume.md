# Three-level model: Career Record → Profile → Resume

> **Status:** Superseded by [0002](0002-independent-content-and-resume-organization.md) on 2026-10-25. Retained as historical rationale; its live inheritance rules no longer apply.

Careery's data model has three levels with the same select-and-override mechanism at each step. The Career Record is the single pool of all career entries, authored once. A Profile (a career track like "Web Developer" or "Technical Support", shown as a tile on the home grid) selects entries from the Career Record and may override their wording. A Resume selects from its Profile and may additionally hide entries, reorder, override wording, and write its own summary. Overrides never mutate the level above and can always be reset.

## Considered Options

- **Independent documents per resume** — rejected: content is duplicated and copies drift apart (wrong dates fixed in one copy, not the others).
- **A single master profile with per-resume variants** — rejected: the user maintains multiple parallel career tracks (web developer, data entry, technical support), which is one level of targeting more than a single master provides.
- **Independent master profiles (silos)** — rejected: the same past employer can be relevant to several tracks; separate silos would mean re-entering and re-fixing the same job in each.
- **Arabic text as per-Resume overrides** — rejected: Arabic wording would be duplicated across every Arabic Resume; bilingual slots in the Career Record keep write-once intact for both languages.

## Consequences

- Editing an entry in the Career Record propagates to every Profile and Resume that doesn't override it — this propagation is the point of the design.
- Bilingual slots mean the editor must flag missing Arabic text for Arabic Resumes rather than backfilling English, so mixed-language PDFs cannot happen by accident.
