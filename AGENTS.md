<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## UI stack & design system

All UI is built from five shadcn-registry libraries. Components are copied into
the repo as source we own (no UI packages to install). shadcn/ui is the
foundation and runs on **Base UI**, not Radix.

### Which library to use, in this order

1. Existing components in `components/ui/` and `components/` (reuse first).
2. shadcn/ui (Base UI): forms, dialogs, tables, navigation, layout.
3. coss ui: Base UI primitives and pre-composed "particles". Use when shadcn
   lacks the piece. Never install a second copy of a primitive shadcn already
   provides.
4. Cult UI: motion-rich niche components (AI prompt inputs, Halo form controls,
   shader heroes, device mockups).
5. Magic UI: landing-page effects (marquee, blur-fade, globe, etc.).
6. Velora UI (velora.colorlib.com only): read its docs to see what exists.

Never recreate by hand something a library above already provides. If you must
hand-build a component, say so in your summary.

### Installing

Use the shadcn CLI with the official registries only:

- shadcn/ui: `npx shadcn@latest add <name>`
- coss ui: `npx shadcn@latest add @coss/<name>`
- Cult UI: `npx shadcn@latest add @cult-ui/<name>`
- Magic UI: `npx shadcn@latest add @magicui/<name>`
- Velora UI: `npx shadcn@latest add https://velora.colorlib.com/r/<name>.json`

Rules:

- Add components one at a time. Never run bulk installs
  (`shadcn init @coss/style`, `shadcn add @coss/ui`); they overwrite our theme
  and components.
- Never pass `--overwrite` without asking. Check `components/ui/` for filename
  collisions first (two libraries may both ship `button`, `dialog`, etc.).
- Preview before installing: `npx shadcn@latest view @namespace/<name>`.
- Never use 21st.dev mirror install URLs.
- After an install, check `git diff` for changes to `components.json` and
  `app/globals.css` (tokens, keyframes) and mention them in your summary.
- Installed source is owned code: edit it in place, minimally, and note the edit.

### Docs first, no guessing

Read a component's docs before using it, and use only documented props and
exports. Do not invent APIs.

- shadcn/ui: https://ui.shadcn.com/docs/components (use the Base UI variant)
- coss ui: https://coss.com/ui/docs/components/<name>.md
- Cult UI: names in https://www.cult-ui.com/llms.txt; docs at
  https://www.cult-ui.com/docs/components/<name>.md
- Magic UI: https://magicui.design/docs/components
- Velora UI: https://velora.colorlib.com

### Base UI, not Radix

- Base UI composes with the `render` prop, not Radix's `asChild`. Never paste
  Radix-style examples; translate them first.
- coss docs include Radix-to-Base UI migration notes; use them when adapting.
- Don't add `@radix-ui/*` packages unless a library's component requires one.
  If it does, flag it in your summary.

### Implementation rules

- Tailwind CSS v4 and shadcn theme tokens only (`bg-background`,
  `text-foreground`, `border-border`, `ring-ring`). No hard-coded colors.
  Apply visual decisions by editing theme tokens in `app/globals.css`, not
  per component.
- Light and dark mode must both work.
- Animated components use `motion`; honor `prefers-reduced-motion`.
- Keep pages and layouts as Server Components. Components that use hooks,
  state or `motion` need `"use client"` (Cult UI components already include it).
  Push client boundaries down to the smallest leaf.
- Keyboard access, visible focus states and labels on every interactive element.

### Done means

The lint, typecheck and build scripts in `package.json` all pass, and your
final summary lists every component installed with its library, plus any files
edited in `components/ui/`.

## Design workflow (Impeccable)

Impeccable owns design judgment; this file owns the toolchain.

- Before any UI work, read `PRODUCT.md` (audience, goals, principles),
  `DESIGN.md` (visual system) and any page brief in `.impeccable/surfaces/`,
  if they exist. They are not loaded automatically.
- For design work (new pages, redesigns, polish, critique, audit), use
  `$impeccable <command>` instead of improvising.
- Precedence:
  - Libraries, installation, Next.js/Base UI rules, "Done means": this file wins.
  - Visual decisions (palette, type, spacing, tone, motion intensity):
    DESIGN.md and PRODUCT.md win.
  - If the two seem to conflict (e.g. a design direction needs a component the
    stack doesn't provide), stop and ask. Don't silently work around either.
- Build Impeccable's designs out of the library components above. Never
  hand-build what a library provides, and apply colors and type through theme
  tokens.
- After I approve a visual change, refresh the record with
  `$impeccable document`.
- Design hook findings: fix them. If a finding is intentional (e.g. a glow in a
  library component), say so and record a scoped ignore with a reason. Don't
  contort the design to silence the detector.
