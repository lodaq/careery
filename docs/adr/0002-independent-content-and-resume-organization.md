# Independent content and movable Resumes

Accepted 2026-10-25. Supersedes [0001](0001-three-level-model-career-record-profile-resume.md).

The Career Record supplies reusable bilingual content. Profiles copy selected content and can edit it independently. A new Resume either copies a Profile's current content, headline, and summary or begins with no selected entries. Any Resume can add content directly from the Career Record, regardless of Profile selection. Existing Profiles and Resumes never change because their source was edited or deleted.

Profiles organize Resumes but do not control their content after creation. Resumes may also live in Unfiled. Moving changes only their container; deleting a Profile moves its Resumes to Unfiled. Downloading a PDF exports the saved Resume without creating another Resume or a version-history entry.

## Considered Options

- **Live inheritance with overrides:** rejected in this revision because source edits could change already prepared Resumes and moving between Profiles would change their meaning.
- **Independent copies:** accepted for predictable editing and movement. Fixes must be applied separately where desired; source corrections do not propagate.
- **Resumes embedded inside Profiles:** replaced by separately stored Resumes with an optional Profile association, so Unfiled and movement do not require copying content between containers.

## Consequences

- Store bilingual content in each copy so language switching does not require reading its former source. Source IDs may record provenance but are not live dependencies.
- The pure resolver reads only a Resume to choose language, apply visibility and ordering, and flag missing Arabic wording. It does not compose three live levels.
- Store Profiles and Resumes in one workspace JSON document so deletion and movement can be atomic. Exact TypeScript shapes will be established before implementation; any existing user data requires migration rather than replacement.
- Reset-to-current-Profile and automatic source-deletion cleanup are removed. Neither can silently rewrite an independent Resume.
