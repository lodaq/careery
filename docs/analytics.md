# Analytics

`/analytics` is a read-only view over saved local data. It does not track visits,
time, exports, AI reviews or deleted records, and makes no network requests.
Charts load lazily; tables carry the exact counts.

## Workspace analytics

- Totals: Career Record entries, Profiles, Resumes and Unfiled Resumes, each linking
  to its route.
- Content inventory: source entries versus Profile copies versus visible Resume
  entries per section. Hidden entries and hidden sections are excluded from the
  visible total.
- Coverage and reuse: non-empty bilingual fields with Arabic wording, Career Record
  entries copied into any Profile or Resume, achievement count, Resume language mix
  and excluded entries.
- Needs attention: basic content checks per Resume (missing name, headline, all
  contact details, or visible entries; visible English fields without Arabic when
  the Resume is Arabic). These are not a quality score or export guarantee.
- Resume breakdown: language, visible/excluded entries, Arabic gaps and template.
- Recently edited: the five most recent saved edits. Creation dates and earlier
  edits cannot be reconstructed; undated Resumes keep their relative order
  elsewhere and are counted separately here.

Metric definitions for application and search analytics (submitted cohort, response
rate, interview/offer rates, pipeline, monthly submissions and stage medians) are in
[application tracking](application-tracking.md).

## Data

The page reads `career-record.json`, `workspace.json` and `applications.json`
through the normal validated readers. It never writes. Times use `Africa/Cairo`.
Empty states explain what will appear once data exists.

## Verification

- `analytics-data.test.ts` covers workspace inventory, reuse, language mix,
  attention checks and template counts.
- `demo-analytics.test.ts` exercises the populated demo workspace.
- `e2e/demo-analytics.spec.ts` and the analytics portion of
  `e2e/applications.spec.ts` cover populated/empty rendering, charts, mobile, dark
  mode and route JavaScript budgets.
- Recorded modern-browser budgets at commit `ae17fd2` (2026-10-27): Analytics
  161,364 gzip bytes; Today 168,776; Applications 165,108; application details
  177,777. All are below the 180,000-byte gate.
