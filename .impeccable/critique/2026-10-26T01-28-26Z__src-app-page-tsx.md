---
target: Careery interface
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/home/sebaq/repos/careery/src/app/page.tsx"
target_fingerprint: "sha256:7875e982ffb143382781a44462eb10f66bdb014b2ec96eee3456492428edbdb5"
target_path: /home/sebaq/repos/careery/src/app/page.tsx
timestamp: 2026-10-26T01-28-26Z
slug: src-app-page-tsx
---
Method: dual-agent (A: design_review · B: evidence_review)

Reviewed the populated Profiles home, Career Record, Resumes dashboard and Arabic resume editor at desktop and mobile sizes. The product has useful foundations, but the interface makes users work too hard to reach and finish a resume. Fix navigation and content management before decorative polish.

## Design specificity and overall impression
The Career Record → Profile → independent Resume model, field-level Arabic and PDF preview give Careery a clear purpose. The generic next-chapter hero and lavender cards are category-interchangeable. Make continuing a document and knowing it is ready to send the center of the experience.

## Design health
| Heuristic | Score / 4 | Main finding |
|---|---:|---|
| System status | 3 | Useful autosave feedback; duplicate Save controls |
| Real-world language | 3 | Familiar fields; content model needs explanation |
| Control and freedom | 3 | Safe exits and confirmations; no deletion undo |
| Consistency | 2 | Navigation and density change across routes |
| Error prevention | 3 | Validation and preserved edits are strong |
| Recognition | 2 | Long record and hidden mobile sections hinder discovery |
| Efficiency | 2 | Resume search exists; Career Record needs equivalent tools |
| Minimalism | 2 | Hero, expanded forms and repeated actions consume space |
| Error recovery | 3 | Retry helps; translation warnings need repair links |
| Help | 2 | Local explanations without end-to-end guidance |
| Total | 25/40 | Acceptable; significant improvements needed |

## What works
- Desktop editor and document preview support iterative writing.
- Optional field-level Arabic avoids duplicating the entire form.
- Autosave, preserved edits and independent-content explanations reassure users.

## Priority issues
1. [P1] Repair shared navigation. Home visibly reads ProfilesResumesCareer Record as one string at both sizes; Resumes supplies spacing and an active state. Put spacing, usable hit areas and current-page indication in the shared shell. Sources: src/components/WorkspaceShell.tsx:10; src/app/resumes/resume-dashboard.css:4. Command: $impeccable polish.
2. [P1] Make Career Record manageable at realistic volume. Current demo mobile page is 65,666px tall with 806 input/textarea nodes. Entries open into one enormous form. Use collapsed named summaries, section search and clear Add actions; keep Basics expanded. Source: src/app/career-record/RecordEditor.tsx:211. Command: $impeccable distill.
3. [P2] Let returning users continue immediately. First mobile profile starts around 780px down. Populated home prioritizes Build your Career Record. Reserve the full introduction for an empty workspace; show recent resumes/profiles first and explain the three-layer model beside creation. Sources: src/app/page.tsx:17; src/app/profiles/ProfileGrid.tsx:36. Command: $impeccable onboard.
4. [P2] Make save and output feedback actionable. Saved, Save and Save changes appear together; missing-Arabic status is 9px. Use one save status/retry control and a Review 2 untranslated fields link beside Download. Sources: src/app/career-record/RecordEditor.tsx:148; src/app/resumes/ResumePreview.tsx:48. Command: $impeccable clarify.
5. [P2] Improve mobile studio orientation and legibility. Later sections are hidden in a horizontal strip, support text is tiny, and short forms leave blank space before preview. Add an obvious section selector, raise operational text sizes and use content-driven panel heights. Sources: src/app/resumes/resume-studio.css:55; src/app/resumes/ResumeNavigation.tsx:29. Command: $impeccable adapt.

## Cognitive load and emotional journey
Moderate overall and high in the populated Career Record: chunking, minimal choices and progressive disclosure need attention. Understanding independent copies adds working-memory demand. Home reassures, the record becomes administrative, and the live preview provides the strongest reward. Bring that reward sooner and provide a clear path to ready to send.

## Persona red flags
- Jordan, first timer: must learn Record/Profile/Resume before seeing payoff; the populated home still implies initial setup.
- Sam, accessibility dependent: tiny operational text and repeated Delete Resume buttons without document names. Labels, skip link, live status and keyboard reorder controls are strengths. Screen-reader behavior was not empirically tested.
- Casey, mobile: crowded home navigation, offscreen editing sections and unnecessary space before preview. Autosave helps interruptions.

## Minor observations
Make Save now / retry state-dependent. Avoid implying every resume must fit one page. Reduce persistent Delete prominence in library rows. Add document names to deletion accessible labels.

## Detector evidence
CLI scanned src/app and src/components: two warnings in src/app/resumes/resume-studio.css, overused-font at line 143 and side-tab at line 145. Both represent intentional resume template thumbnails and are false positives for app design.
Browser injection executed on four pages. Home/resume library reported zero anti-patterns; Career Record reported 242, largely hidden date-picker popovers and aggregated em-dashes. Editor reported 63 overlays (64 emitted rule occurrences); many involve scaled preview content. The real operational issue is 9px preview status and translation warnings, plus 10px helper text. No document-level horizontal overflow at 390px on the four views. These counts are not a credible defect total. No persistent human-visible overlay was established; the browser was headless and closed after inspection.

## Questions to consider
What should a returning user continue within five seconds? Could a concrete example explain Record → Profile → Resume? Should bilingual readiness become the defining moment?
