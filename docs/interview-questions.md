# Interview questions

`/interview-questions` is a local question-and-answer library with spaced-repetition
practice. It follows the existing Production ledger design and is single-user; it
adds `data/interview-questions.json` and no dependencies beyond `ts-fsrs`, which was
approved with the October 2026 feature work.

## Library

- Add, edit and delete a question with an answer, tags and a manual interview
  frequency count. Starter and technical questions are seeded on first use; their
  answers are described in the UI as guides to personalize.
- Search matches question and answer text. Filter by review status (New, Due,
  Scheduled) and by any selected tag; sort by review priority or frequency.
- Tags can be created, renamed and deleted. Deleting a tag removes it from questions
  and increments their revisions.
- The activity calendar shows distinct questions and attempts per Cairo day.
  Opening a day lists the questions reviewed; the calendar is derived from saved
  review events, so undoing a review removes it there too.

## Practice

- Practice uses FSRS with a 90% target retention, short-term learning steps and no
  fuzzing. Revealing an answer never records a review.
- The queue is due questions first, then up to ten new questions, in due/frequency
  order. Ratings are Again, Hard, Good, Easy and each shows its next review time in
  Cairo.
- A session is stored in the browser and offers Resume/Discard after a reload.
  Session state is the remaining question IDs, the current question and the last
  review ID; the saved library remains the source of truth.
- Each rating is written with a submission ID, so a retry after a failed response
  cannot double-count. Only the most recent rating in a session for a question can
  be undone, and an undo is stored as an event rather than deleting history.
- Stale revisions from another tab are rejected with a reload path; the draft
  question stays on screen after a failed save.

## Data and safety

`data/interview-questions.json` uses the existing serialized, atomic JSON writer
with schema version 2. Older files without a schema are migrated on first read
(starter tags and technical questions are added). Malformed or unsupported data is
preserved and reported instead of overwritten. No network requests are made by the
library or practice sessions.

## Verification

- `question-data.test.ts`, `practice-data.test.ts`, `PracticeSession.test.tsx` and
  `QuestionsTable.test.tsx` cover migration, revisions, tag changes, scheduling,
  duplicate submissions, undo rules, session recovery and table interaction.
- `e2e/interview-questions.spec.ts` covers tags, frequency, practice recovery, undo,
  preserved daily history, mobile layout and route JavaScript budget.
- Last full feature verification: 82 unit tests, lint, typecheck and production
  build at commit `ae17fd2` (2026-10-27). Current suite count is recorded in
  `CONSTRAINTS.md`.
