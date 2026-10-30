# FIXME

## Suspicious runtime dependencies in `package.json`

`package.json` lists two dependencies that look unintended:

- `cn` (`^0.5.0`) — the project already has its own `cn` helper in
  `src/lib/utils.ts` (the standard `clsx` + `tailwind-merge` implementation
  copied by shadcn). Importing from the `cn` npm package instead of the local
  helper would be a mistake.
- `shadcn` (`^4.22.1`) — this is the CLI used to install components. It is a
  build-time tool, not something the app imports at runtime, so it belongs in
  `devDependencies` (or nowhere, if invoked via `npx shadcn@latest`).

Neither appears to be required for the app to build or run, but they inflate
the dependency count that `CONSTRAINTS.md` tracks ("runtime dep count must not
grow"). They also pull transitive packages into the lockfile.

Do not remove without checking:

1. Whether any source file imports `cn` from the package rather than from
   `@/lib/utils`.
2. Whether any shadcn registry component installed into `src/components/ui/`
   imports something the `shadcn` package provides at runtime.
3. The recorded dependency count and budget in `CONSTRAINTS.md`, which would
   need updating if the dependencies are dropped.
