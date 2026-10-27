# Interview questions

Mode: Operate / Read. Route `/interview-questions`.
Primary target: `src/app/interview-questions/page.tsx`.

Extend the existing Production ledger palette, type, spacing and focus vocabulary.
Use the owned shadcn Base UI Table, Button, Input, NativeSelect, Checkbox, Badge,
Textarea and Collapsible controls. No new theme tokens, UI source or decorative
motion are introduced. The activity calendar is a domain composition of Table
and Button, rather than a new date-picker primitive.

The library is a ruled table, not a card grid. TanStack Table v9 owns column definitions, header groups, answer-expansion state and stable-ID row models; owned shadcn controls render the markup. Filtering and review-priority sorting remain shared with the practice queue. Columns show question, multiple
tags, review status, next review in Cairo time, manual interview frequency and
Practice/Edit/Delete actions. Question disclosures reveal full answers and
technical source links. On narrow screens the table scrolls horizontally inside
its own container. The search input occupies its own mobile row; tag checkboxes
and labels stay inline, with the group wrapping naturally. The question editor loads on demand to preserve the initial JavaScript budget.

Search matches question and answer text. Multiple selected tag filters match any
selected tag. Status filters distinguish New, Due and Scheduled. Review-priority
sorting shows due questions first, then new questions, then scheduled questions;
due date, descending interview frequency and title resolve ordering within groups.
Frequency sorting is also available. Untagged questions remain accessible.

Question creation and editing use explicit inline forms. Frequency is a manual,
nonnegative whole-number count of interviews where the question was asked; practice
does not increment it. Tags support create, rename and confirmed delete. Deleting
a tag keeps its questions; deleting a question keeps past review activity. Starter
answers are editable guides, not claims about the user's experience. The existing
18 general/behavioral starters are preserved, with 45 technical guides added once.

Practice opens an inline focused section above the library. Filtered sessions
include all due questions and up to ten new questions; individual practice is
available even before a question is due. Recall precedes Reveal answer, followed
by Again, Hard, Good or Easy with a next-review preview. FSRS runs on the server at
90% target retention with 1-minute/10-minute learning and 10-minute relearning
steps. Each rating saves immediately. Revealing, skipping or leaving does not
count as a review. Show waiting/completion states and allow ending at any time.

Focus moves to the question heading when practice advances. Failed saves retain
the current question and a stable submission ID for retry. A saved browser session
can be resumed after reload. Undo last rating reverses its scheduling and activity
contribution without erasing the historical event. Stale edits and reviews must
report conflicts instead of overwriting newer changes.

Today's summary distinguishes unique questions from total attempts. The lazy-loaded
monthly activity calendar shows distinct-question counts for each day and selected
day details. Daily boundaries use Africa/Cairo; persisted timestamps use UTC.
Repeated attempts increase attempts but count a question only once per day.
Question wording edits retain learning progress, and historical question text
remains visible after deletion.

Light and dark mode use the established semantic tokens. Keyboard access, visible
focus, labeled controls, pending feedback and actionable errors are required.
No daily goal, streak, AI grading or automatic interview linking is part of this
surface. The TanStack migration has a user-approved route-specific 185 kB gzip initial JavaScript budget; other routes retain their 180 kB limit.
