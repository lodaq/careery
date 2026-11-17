# Careery

![Status: Under development](https://img.shields.io/badge/status-under_development-orange)

An authenticated career and resume platform: keep reusable English/Arabic career content, organize editable Profiles and independent Resumes, tailor a Resume, and download an A4 PDF.

The app includes Career Record editing, independent Profiles and Resumes, bilingual PDF export, application tracking, interview practice, analytics, and job-search resources. See the task list for implementation and verification notes.

- [Project specification](docs/specs/README.md) and linked module specs
- [Domain language](GLOSSARY.md)
- [Independent content decision](docs/adr/0002-independent-content-and-resume-organization.md)
- Feature guides: [applications](docs/application-tracking.md), [interview questions](docs/interview-questions.md), [analytics](docs/analytics.md), [Resume AI review](docs/resume-ai-review.md)
- [Quality constraints](CONSTRAINTS.md)
- [Implementation plan](tasks/plan.md) and [task cards](tasks/todo.md)

Tooling: Next.js App Router, strict TypeScript, Tailwind for the app, isolated plain CSS for the Resume template, local JSON persistence, and Playwright PDF export.
## Development status

Careery is a personal app under active development, with Clerk authentication and server-side JSON storage separated by user ID. Back up personal data separately and review the implementation notes before relying on a workflow. Resume data and PDFs can contain sensitive career information.

## Project layout

- `src/app/`: routes with their feature components, actions, data access, and tests.
- `src/components/`: shared components; `ui/` contains owned registry components.
- `src/lib/`: shared types, storage, PDF generation, and resume resolution.
- `src/template/`: resume rendering and print styles.
- `docs/`: specifications, feature guides, tooling references, and architecture decisions.
- `e2e/`: browser tests; `scripts/`: demo-data tools; `tasks/`: plans and open notes.
- `public/`: static assets; `data/`: ignored local personal data; `data/backups/` holds pre-restore copies.

## Run locally

Requires Node.js 20.9+ and Bun 1.4.4.

```sh
bun install
bunx playwright install chromium
NEXT_TELEMETRY_DISABLED=1 bun run dev
```

Open http://127.0.0.1:3000. The development server binds only to loopback. The `/career-record` page edits bilingual content with automatic saving, validation and retry. It prevents stale tabs from overwriting newer saves. The home page creates and lists Profiles; Profile editors select Career Record copies and edit them independently. Deleting a Profile moves its Resumes to Unfiled. Resume PDF downloads use `/api/resumes/[id]/pdf`.

`/settings` downloads a single JSON backup of every local store and restores one. A restore validates the file with the app's readers, replaces only the stores in the bundle, and copies the replaced files to `data/backups/` first. Keep backup files private; they contain personal career information.

## Verify

```sh
bun run test
bun run typecheck
bun run lint
CAREERY_BUILD_DIR=.next-build NEXT_TELEMETRY_DISABLED=1 bun run build
```

The separate build directory preserves the running development server. For the production readiness test, build with `CAREERY_INSTANT_TEST=1` as documented in [navigation test guide](docs/instant-navigation.md), then run `bunx playwright test`.

`data/` contains editable personal data and is ignored by Git. Existing local data is preserved; a fresh checkout starts empty. Back up this directory separately. Tests use isolated temporary directories. Storage rejects legacy `profiles.json` until an explicit migration is provided. Downloaded documentation caches in `llms.txt/` are also ignored; consult the official documentation links in `AGENTS.md`.

### Fictional demo data and Resume editing

Run `bun run seed:demo` to add 80 bilingual career entries, 8 Profiles, and 54 Resumes (including 6 Unfiled). Demo content is clearly fictional. The seed preserves existing IDs and personal content; rerunning it does not duplicate demo entries. Stop other writers while seeding.

Open a Profile or Unfiled to create, reopen, or delete Resumes. The Resume editor supports independent bilingual wording, Career Record selection, hiding and ordering entries, section order, language choice, autosave, and moving between Profiles and Unfiled. The live A4 preview and PDF download share one template. Arabic uses RTL with unchanged LTR email/URL values; missing Arabic shows highlighted local English. The paginated preview shows the generated PDF itself, with an exact page count and a small overflow warning. It refreshes after saving; the selectable live text preview remains available while it updates. Download waits for autosave and offers retry after failures. Preview and download use identical PDF bytes, including page boundaries. Browsers without embedded PDF support can open the preview in a new tab.

Saved Resume lists put the most recently edited items first. Existing undated Resumes retain their relative order until edited; no historical edit dates are invented. Opening previews and downloading PDFs do not update edit times.

### Authentication

Create a Clerk application and set the two keys in `.env.example` in `.env.local`. All signed-in users can access the app. Each user's data is stored privately under `CAREERY_DATA_DIR/users/<Clerk user ID>` (default: `data/users/<Clerk user ID>`), including backups. No owner user ID is needed.

Existing files at the data root are preserved and are never exposed to new accounts. To migrate existing data, stop the server and copy the workspace JSON files into the intended user's directory, or restore a previously exported backup while signed in as that user. Never copy another person's files into a user's directory.

On Vercel, set `CAREERY_STORAGE=blob` and connect a **private** Vercel Blob store to production. The Blob connection supplies storage credentials; user JSON stores and pre-restore backups remain private under each Clerk user ID. Conditional writes reject concurrent changes instead of overwriting them. Local development continues using disk storage. Existing local data is not uploaded automatically; export and restore a backup while signed in to migrate it.

Set `CAREERY_SITE_URL` to the production HTTPS origin. PDF export on Vercel uses packaged serverless Chromium and only renders this trusted origin, forwarding the signed-in session only to that origin. The PDF function has a 60-second execution budget. Set Clerk and optional OpenRouter credentials in Vercel environment settings; use Clerk production keys before opening the service beyond development/testing.

Deploy with `vercel --prod` after running the verification commands below. `.vercelignore` and output tracing exclusions keep local data, credentials and generated artifacts out of the deployment.

## Search indexing

Set `CAREERY_SITE_URL` to the HTTPS production origin. Home and Resources are the public sitemap entries; account-content pages use noindex metadata, and API responses (including PDFs) use X-Robots-Tag. Clerk middleware initializes sessions; storage checks the authenticated user before reading or writing account data. Search directives do not replace authorization.

### Deployment verification (2026-11-16)

Lint, typecheck, build and 113 tests passed. Temporary Clerk test users verified production backup download, repeated full restores with recovery snapshots, user isolation, protected storage and English/Arabic Chromium PDF exports. Signed-out visitors reach Clerk sign-in, and unauthenticated backup requests return 401. Test accounts were removed afterward. The final recheck could not directly verify or remove private Blob test records because production Blob credentials are unavailable locally. Local personal data was not migrated.

Dependency audit reports 10 existing transitive findings. The high-severity Zod finding is in the shadcn CLI dependency tree (4.1.11); the runtime Blob dependency resolves Zod 4.6.7. The remaining findings concern development CLI/lint dependencies, not exposed application handlers. Dependency upgrades are deferred to a separate tooling update; review by 2026-11-23. The deployed app currently uses the existing Clerk development instance. Vercel's request-body limit also applies to large backup restores and attachment uploads.

### Jobs feed

Jobs discovers software engineering, school/university teaching, tutoring,
instructional design and corporate training roles from Jobicy's free public API.
Only explicit worldwide/Anywhere or Egypt eligibility is included. This source
covers remote work, not Egypt on-site jobs. Category matching uses role titles;
review the source listing before applying. No account content is sent to Jobicy.

The shared Next.js cache revalidates on requests after one hour, with old results
available during refresh (up to one day). Opening/filtering the page checks the
cache; no background scheduler runs when nobody uses the feed. The discovery
window is seven days with a three-hour source delay. Older listings leaving the
feed are not classified as closed. Pagination is deduplicated by source ID;
source failures show a retry state rather than publishing incomplete results.
