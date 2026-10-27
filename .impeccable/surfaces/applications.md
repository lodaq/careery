# Applications and Today

Mode: Operate. Routes `/applications`, `/applications/[id]` and `/today`.

Extend the established Production ledger world without changing its palette or type.
The application collection uses a ruled table on desktop and compact ruled rows on
mobile. A labeled View selector switches to a five-stage board. Reuse owned shadcn
Card, Table, NativeSelect, Input, Button, Tabs and Collapsible primitives. Search,
status, priority, archive and sort controls form a wrapping toolbar. Creation loads
on demand; job-detail links do not prefetch the entire editor.

Details keep identity/status and next action above tasks and tabs for Overview,
Activity, Interviews, Documents and Offer. Optional overview fields are grouped in
disclosures. Existing confirmation dialogs guard deletion. Explicit saves show
pending, saved or retained-draft error states. Document snapshots are independent.

Today is a ruled agenda of overdue, today, upcoming and undated tasks, followed by
interviews and deadlines. Cairo dates anchor daily work. Closed/archived records
are absent from workload. Empty groups state their absence explicitly.

All colors use existing semantic tokens, repeated board items have 8px radii,
focus remains visible, and mobile navigation wraps. No decorative imagery or motion
is needed for this operational workspace. Browser verification captures live under
`/tmp/careery-application-review/`; those temporary fixtures are not product content.
