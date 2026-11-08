# FIXME

No open items (2026-11-08).

## Resolved

- `cn` (`^0.5.0`) is intentional. It is the shadcn-ui class-merge package
  re-exported by `src/lib/utils.ts` and imported by the owned components in
  `src/components/ui/`; it is not a duplicate of a local helper.
- `shadcn` (`^4.22.1`) is a build-time package: `src/app/globals.css` imports
  `shadcn/tailwind.css`. No application JavaScript imports it, so it moved from
  `dependencies` to `devDependencies`.
- The runtime dependency baseline is now recorded in `CONSTRAINTS.md`; the
  earlier three-dependency figure predates the approved UI and feature stack.
