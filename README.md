# Careery

![Status: Under development](https://img.shields.io/badge/status-under_development-orange)

A personal, local-first resume builder: keep reusable English/Arabic career content, organize editable Profiles and independent Resumes, tailor a Resume, and download an A4 PDF.

The app includes Career Record editing, independent Profiles and Resumes, bilingual PDF export, application tracking, interview practice, analytics, and job-search resources. See the task list for implementation and verification notes.

- [Project specification](docs/specs/README.md) and linked module specs
- [Domain language](GLOSSARY.md)
- [Independent content decision](docs/adr/0002-independent-content-and-resume-organization.md)
- [Quality constraints](CONSTRAINTS.md)
- [Implementation plan](tasks/plan.md) and [task cards](tasks/todo.md)

Tooling: Next.js App Router, strict TypeScript, Tailwind for the app, isolated plain CSS for the Resume template, local JSON persistence, and Playwright PDF export.
## Development status

Careery is a personal app under active development, with local JSON storage rather than a hosted account service. Back up personal data separately and review the implementation notes before relying on a workflow. Resume data and PDFs can contain sensitive career information.

## Project layout

- `src/app/`: routes with their feature components, actions, data access, and tests.
- `src/components/`: shared components; `ui/` contains owned registry components.
- `src/lib/`: shared types, storage, PDF generation, and resume resolution.
- `src/template/`: resume rendering and print styles.
- `docs/`: specifications, feature guides, tooling references, and architecture decisions.
- `e2e/`: browser tests; `scripts/`: demo-data tools; `tasks/`: plans and open notes.
- `public/`: static assets; `data/`: ignored local personal data.

## Run locally

Requires Node.js 20.9+ and pnpm 12.14.0.

```sh
pnpm install
pnpm exec playwright install chromium
NEXT_TELEMETRY_DISABLED=1 pnpm dev
```

Open http://127.0.0.1:3000. The development server binds only to loopback. The `/career-record` page edits bilingual content with automatic saving, validation and retry. It prevents stale tabs from overwriting newer saves. The home page creates and lists Profiles; Profile editors select Career Record copies and edit them independently. Deleting a Profile moves its Resumes to Unfiled. Resume PDF downloads use `/api/resumes/[id]/pdf`.

## Verify

```sh
pnpm test
pnpm typecheck
pnpm lint
CAREERY_BUILD_DIR=.next-build NEXT_TELEMETRY_DISABLED=1 pnpm build
```

The separate build directory preserves the running development server. For the production readiness test, build with `CAREERY_INSTANT_TEST=1` as documented in [navigation test guide](docs/instant-navigation.md), then run `pnpm exec playwright test`.

`data/` contains editable personal data and is ignored by Git. Existing local data is preserved; a fresh checkout starts empty. Back up this directory separately. Tests use isolated temporary directories. Storage rejects legacy `profiles.json` until an explicit migration is provided. Downloaded documentation caches in `llms.txt/` are also ignored; consult the official documentation links in `AGENTS.md`.

### Fictional demo data and Resume editing

Run `pnpm seed:demo` to add 80 bilingual career entries, 8 Profiles, and 54 Resumes (including 6 Unfiled). Demo content is clearly fictional. The seed preserves existing IDs and personal content; rerunning it does not duplicate demo entries. Stop other writers while seeding.

Open a Profile or Unfiled to create, reopen, or delete Resumes. The Resume editor supports independent bilingual wording, Career Record selection, hiding and ordering entries, section order, language choice, autosave, and moving between Profiles and Unfiled. The live A4 preview and PDF download share one template. Arabic uses RTL with unchanged LTR email/URL values; missing Arabic shows highlighted local English. The paginated preview shows the generated PDF itself, with an exact page count and a small overflow warning. It refreshes after saving; the selectable live text preview remains available while it updates. Download waits for autosave and offers retry after failures. Preview and download use identical PDF bytes, including page boundaries. Browsers without embedded PDF support can open the preview in a new tab.

Saved Resume lists put the most recently edited items first. Existing undated Resumes retain their relative order until edited; no historical edit dates are invented. Opening previews and downloading PDFs do not update edit times.
