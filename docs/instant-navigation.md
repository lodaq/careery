# instant-nav rig: Careery

- BUILD: `CAREERY_INSTANT_TEST=1 CAREERY_BUILD_DIR=.next-build NEXT_TELEMETRY_DISABLED=1 pnpm build`.
- EXPOSE: `CAREERY_INSTANT_TEST=1` enables the testing API at build time only. Normal builds leave it disabled.
- RUN: `pnpm exec playwright test`; Playwright owns a fresh `next start` on loopback port 3100, refuses existing servers, and stops it after the suite.
- TEST USER: local-only; no authentication, feature flags, remote services or personal fixtures. Home loads an editable Profile grid; the Career Record editor uses isolated synthetic test data.
- DRIFT: none for the current static home; home, Profile and Career Record read the isolated data directory passed to the test server; no personal fixtures are used.
- CONTRACTS: initial load `/`: main heading and Your Profiles heading visible under `instant()`; the live grid streams separately. Soft navigation through the home “Build your Career Record” Link: Career Record heading and loading status visible while editable fields are hidden; fields become visible after release. The gate remains valid after the budget tests warm the server. Initial-load deferred-content assertions were not stable on a warm Next 16.4.3 server; only the client navigation gate is claimed for the editor. Ordinary initial-load behavior is exercised by CRUD and budget tests. No optimization differential is claimed because this is a new route, not an existing delayed shell refactor.
- LOOP: edit → build with testing API → test (managed production server) → server stops. Development uses `.next` separately and can remain running.
- LIVENESS: n/a; fresh local build and managed start.
- WALLS: Next 16.4.3 and @next/playwright 16.4.3; Chromium installed via `pnpm exec playwright install chromium`. Browser CLI is user-installed under `~/.local/bin`; use its version-matched instructions. No credentials needed.

- DATA: Playwright creates a temporary data directory and passes it as `CAREERY_DATA_DIR` to its managed server. Fixtures do not touch the user's `data/` directory. Set `CAREERY_E2E_DATA_DIR` only to an isolated verification directory when reproducing.
- BUDGET: `e2e/budget.spec.ts` sums gzip sizes of actually loaded modern-browser static script assets after each page is usable; the limit includes framework code and prefetched code. The unit is decimal kB: 180,000 bytes.

- PROFILE CHECKS: Profile CRUD browser test starts in Career Record, navigates through home to a Profile, and asserts unique IDs even for preserved hidden pages. It seeds prepared Resume fixtures to verify independent content and deletion to Unfiled without claiming the not-yet-built Resume editor works.
