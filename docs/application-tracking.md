# Application tracking

Careery's personal job-search workspace adds `/applications`, `/applications/[id]`
and `/today` and extends `/analytics`. It follows the existing Production ledger
design and remains single-user and local. No dependencies or registry components
were installed; existing owned shadcn components are reused without modification.

## Workflow

- Create an application with company and role; it starts Saved with Medium priority.
- Search/filter/sort the table or mobile list; switch View to Board for pipeline work.
  Drag between open stages or use the status selector for any status, including a
  specific closed outcome. Archived records are available through the Archive filter.
- Edit identity/status separately from job details, submitted materials and offers.
  Optional details are grouped into disclosures. Save is explicit; errors retain input.
- Add tasks and log notes, outgoing contact or employer responses on Activity.
  Record rounds with a Scheduled, Completed or Cancelled state and later feedback.
- Record a Resume submission to capture an independent copy of the saved Resume.
  Download its JSON snapshot or inspect its wording. Upload the actual submitted PDF
  when an exact file is needed. Other attachments are downloaded, never executed inline.
- Today shows overdue, due-today, upcoming and undated tasks; interviews and deadlines
  cover the next seven days, with overdue deadlines included. Closed and archived
  records do not contribute workload.

## Data and safety

`data/applications.json` (or `CAREERY_DATA_DIR`) is a separate version-1 store using
the existing serialized, atomic JSON writer. Existing career/workspace data needs no
migration. Each application has a revision; stale writes are rejected. Missing files
start empty, while malformed/unsupported files are preserved and report an error.
Serialization is process-local, matching the existing single-process local app.

Status transitions append timestamped history. Applied/outcome dates are editable;
entering Applied, Interviewing, Offer or Accepted fills a missing applied date.
Reopening clears the previous outcome date. Resume snapshots survive source edits
and deletion. Attachments are stored as base64 in the local application store,
limited to 5 MB each and 20 MB per application. Upload requests verify browser origin
and bound the body size. Downloads use attachment disposition and no-store headers.
Delete removes the application and its history/files; archive preserves them.

Dates and analytics use Africa/Cairo. Interview/activity datetime inputs use the
device timezone and are converted to UTC; rounds retain an interviewer timezone for
display. No email/calendar integrations, scraping, remote notifications, accounts,
cloud synchronization or automatic telemetry are added.

## Analytics definitions

- Submitted cohort: records with an applied date through today, including archived
  records. Missing/future dates are excluded. Deleted records are not retained.
- Response rate: submitted records with an explicitly logged response after applying,
  divided by submitted records. Outgoing contact and notes never imply responses.
- Interview/offer rates: submitted records that reached those milestones, including
  recorded history after a later rejection/withdrawal. Non-cancelled interview rounds
  also establish the interview milestone; offers imply the interview milestone.
- Pipeline is current status across all records, including archived. Active workload
  excludes archived records and Accepted/Rejected/Withdrawn/Position Closed.
- Monthly submissions cover the current Cairo calendar month and previous five months.
  Source comparisons report submitted, response, interview and offer counts with the
  same cohort; blank sources are Unspecified.
- Response/outcome medians use known dates. Stage medians use exited status intervals
  recorded by the app, without reconstructing earlier history. Empty denominators or
  missing timing samples display a dash. No-response attention flags open applications
  at least 14 days old; it is not a claim that an employer has not responded elsewhere.

## Verification

Unit/integration tests cover persistence, concurrent writes, corrupt data preservation,
stale revisions, snapshots, tasks, URL/date validation, cohort metrics and upload origin
and size checks. `e2e/applications.spec.ts` exercises creation, status history, tasks,
response logging, interviews, snapshots/uploads/downloads, Today, Analytics, archive,
board status updates, mobile layouts, dark mode, stale drafts and route JS budgets.
Browser fixtures use a temporary data directory, not personal content.

Verified 2026-10-27: 64 unit/integration tests, lint, typecheck and production build
pass. Both application browser scenarios pass, including task/contact editing,
mobile and dark rendering. Modern initial script gzip totals: Applications 165,108
bytes, application details 177,777, Today 168,776 and Analytics 161,364; all are
within the 180,000-byte gate. The design detector and Next compilation/error checks
report no issues. The board composition and native drag/drop are custom domain UI;
its cards and interactive controls reuse existing registry source.

Broader checks are not all green: the existing budget suite flags Home, Career
Record and Unfiled; the existing Profile workflow finishes but fails its loaded-JS
budget assertion; the Resume workflow times out looking for its TypeScript picker
checkbox. These checks were not changed or weakened in this feature. No claim is
made that the full existing browser suite passes.
