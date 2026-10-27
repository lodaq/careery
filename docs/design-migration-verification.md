# Production ledger migration verification

2026-10-26. User selected Production ledger and code-first implementation.

## Scope

App shell, Profile dashboard and editor, Career Record, Resume dashboard,
Resume studio (editing, customization and review), and Unfiled. Personal data,
copy contracts and PDF document styling were preserved. All browser writes used
isolated temporary data; no personal data was edited by this task.

## Registry components

Installed from shadcn/ui, Base UI variant: alert-dialog, badge, button, checkbox,
collapsible, dialog, empty, field, input, label, native-select, progress,
separator, skeleton, slider, tabs, textarea, toggle, toggle-group.

Coss, Cult UI, Magic UI and Velora were searched/verified earlier. The foundation
provides the required primitives, so no duplicate community primitives were
installed. No Radix packages or additional runtime dependencies were required.
Page-specific compositions remain domain code around these library controls;
no interactive primitive was recreated by hand.

Customized owned source in `src/components/ui/`:

- `button.tsx`: disable controls until hydration so early clicks cannot be lost.
- `toggle-group.tsx`: the same hydration guard for grouped modes and filters.
- `slider.tsx`: forward the accessible label to thumbs; use the card theme token.

`components.json` remains on base-nova with no registry overrides.
`src/app/globals.css` replaces the old purple styles with shared light/dark theme
roles, local font loading and responsive workspace styling. The local Geist
font and its OFL license are in `public/fonts/`.

## Evidence

- 38 unit tests pass.
- Lint, typecheck and production build pass.
- Independent Impeccable finish review: **ship**, with no material design fixes.
- Twelve desktop/mobile route accessibility passes plus a dark-mode pass found
  no violations. All tested page widths match the viewport; no page errors.
- Mobile Preview → Back to editing verified at 390 px.
- Browser workflows cover autosave and retry, independent copies, movement and
  deletion, bilingual fields, section order/visibility, style persistence, PDF
  bytes, multi-page output, warm export timing and stale revision handling.

## Remaining performance gate

The final testing build passes 13 of 15 browser tests. The two failures are only
the unchanged 180,000-byte gzip JavaScript assertions, moved to the end of their
workflows so all functional assertions also execute. No assertion was removed
or threshold changed.

| Workflow | Loaded JavaScript (gzip bytes) | Limit |
| --- | ---: | ---: |
| Home | 177,924 | 180,000 |
| Career Record | 175,801 | 180,000 |
| Unfiled | 165,154 | 180,000 |
| Profile workflow | 183,014 | 180,000 |
| Resume/PDF workflow | 187,261 | 180,000 |

Confirmation UI, content selection, customization, review and Resume-only tools
load on demand; broad navigation/list prefetching is disabled. The budget in
CONSTRAINTS.md and tests remains unchanged. Raising it requires the user's
explicit decision.

## Bottom dock and Settings follow-up

Replaced the shell navigation with a centered bottom dock containing Home,
Profiles, Career Record and Settings. Profiles now has its own route, with
Unfiled accessible there. Settings owns the persisted dark-mode switch.

Added Magic UI `dock` and shadcn Base UI `switch`, previewed before individual
installation. The owned `components/ui/dock.tsx` uses semantic tokens,
viewport-relative pointer coordinates and respects reduced motion. Switch
source is unchanged. `motion` is the new dependency; components.json is
unchanged. globals.css adds dock, full-width shell and Settings layout rules.

Lint, typecheck, 38 unit tests and production build pass. The dock/theme and
Resume editor browser tests pass; Profile functionality completes, with only
the unchanged JavaScript budget assertion failing (226,946 gzip bytes versus
180,000). The registry dock introduces Motion runtime overhead. The earlier
measurements above describe the pre-dock build. No budget threshold changed.
Four viewport/theme accessibility checks report no violations or page errors.

## Section tabs and sortable content follow-up

Career Record and Profile sections now use the existing Base UI Tabs, showing
one panel while retaining inactive form controls for autosave. Entries of every
kind and individual achievements use existing Collapsible primitives, closed
initially and open for newly added content. Invalid hidden fields reveal their
section and containing collapsibles.

Installed Cult UI `sortable-list` after previewing its registry source/docs.
Adapted the owned source to generic form rows using its Motion Reorder pattern,
Base UI Button drag handles, keyboard Arrow Up/Down movement with live feedback,
semantic styles and reduced-motion support. Removed the now-unused
react-use-measure dependency introduced by that installation. No Radix added.
Edited `components/ui/tabs.tsx` to use the semantic muted foreground for inactive
labels; no other existing UI source changed in this follow-up. components.json
is unchanged; globals.css adds tab, entry and achievement layout rules.

Lint, typecheck, production build and all 39 unit tests pass. Browser checks
verify pointer entry reordering, keyboard achievement reordering, disk order
persistence, tab draft retention, new-entry expansion, validation reveal,
bilingual CRUD/retry and existing dock/theme behavior. Desktop/mobile and dark
accessibility checks have no violations, overflow or page errors. Independent
scoped design review found no blocking defects. Profile functionality passes;
its unchanged 180,000-byte JavaScript budget assertion reports 240,707 bytes.

## Icon-only dock follow-up

Compared the official Cult UI dock source and Magic UI's icon/tooltip example.
Reused Magic UI Dock per the reuse-first rule and added shadcn Base UI Tooltip.
Workspace links now contain icons only, retain accessible names and reveal
titles on hover/keyboard focus. Dock items are 48px (56px on hover) inside a
72px surface. Existing active states, touch targets and reduced motion remain.
No existing components/ui source changed for this follow-up; tooltip.tsx was
installed unchanged. components.json and theme tokens are unchanged;
globals.css updates dock dimensions. DESIGN.md and its sidecar were refreshed.
Lint, typecheck, build, 39 unit tests and the dock browser test pass. Desktop,
mobile and dark accessibility scans report no violations or page errors.
The previously reported JavaScript budget gate has not been changed.

## Profile tile polish

Kept ruled collection tiles and current content. Aligned actions across rows,
added resilient wrapping and keyboard focus for titles, tightened metadata
spacing with tabular counts, composed Edit Profile from the existing outline
Button and Delete from existing ghost Button plus Tooltip. Confirmation remains
unchanged. No registry installs or components/ui edits; components.json and
theme tokens unchanged. Lint, typecheck and build pass; desktop/mobile/dark scans
report no accessibility violations, overflow or browser errors.

## Entry row polish

Reduced duplicate padding in entry headers and aligned drag handles with the
content using a two-column grid. Titles use the existing 16px role, supporting
text 13px, and expanded fields sit below a rule with responsive padding.
Retained owned Collapsible, Button and SortableList primitives. No installs or
components/ui edits; theme tokens and components.json unchanged. Lint,
typecheck, build, drag/persistence and Resume validation browser checks pass.
Desktop, intermediate and mobile scans found no accessibility violations,
overflow or browser errors. Existing JavaScript budget gate remains unchanged.
