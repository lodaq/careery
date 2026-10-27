# Analytics

Mode: Operate. Route: `/analytics`.

Application tracking extends this page with local recorded-history metrics: current
pipeline, submitted/response/interview/offer counts and rates, active workload,
response/outcome/stage medians, six calendar months of submissions, source performance
and older applications without a recorded response. Native monthly meters explicitly
use primary/muted tokens in both themes. Exact counts accompany every bar. Definitions
and cohort exclusions are visible beside the metrics; see docs/application-tracking.md.

An incumbent extension of the Production ledger world in `DESIGN.md`; this brief records the implementation for review, not a newly approved visual direction.

Help the local workspace owner inspect current saved Career Record, Profile and Resume content, find basic content gaps, and open the relevant editor. Refresh reads new saves. Counts describe independently copied content; this surface does not collect telemetry or reconstruct historical activity.

Use the existing workspace shell, semantic theme tokens, local interface font, owned shadcn Table and Button, and the established active navigation treatment. A ruled four-total strip leads into content inventory and coverage, followed by attention items, Resume breakdown, Profile distribution, template usage, recent saved edits and measurement scope. Fine rules and tabular numerals carry hierarchy. The requested shadcn charts extend this treatment with current saved-data comparisons and existing palette aliases.

The View charts link jumps to four horizontal bar charts: Content mix (Career Record entries, Profile copies and visible Resume entries), Resumes by Profile (including Unfiled), Document languages and Template usage. Owned official shadcn Chart containers, tooltips and a content-series legend wrap Recharts. Exact tables remain available. Charts use primary, muted-foreground and foreground aliases, explicit muted axis labels, integer count axes and no series animation. Keyboard inspection has a visible focus outline. Chart code loads on viewport entry with a Load charts button fallback; loading uses the existing Skeleton. Empty workspaces show explicit no-content/no-Resume messages.

At 900px the paired sections and two-column chart grid stack; at 540px the totals become two columns and list metadata stacks. Wide tables scroll within labeled keyboard-focusable regions with visible ring-token outlines. Resume breakdown has a bounded vertical scroll area and sticky header. Links retain visible focus; names can wrap and infer text direction. Empty and zero-denominator states remain explicit.

Implementation evidence: `src/app/analytics/`, `src/components/WorkspaceNavigation.tsx`. Review captures: `.impeccable/review/analytics-desktop.png`, `.impeccable/review/analytics-mobile.png`, and chart-extension captures `.impeccable/review/charts-desktop.png`, `.impeccable/review/charts-mobile.png`, `.impeccable/review/charts-dark.png`, `.impeccable/review/charts-empty.png`.
