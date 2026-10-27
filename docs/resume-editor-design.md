# Resume builder redesign

The user supplied Tadween screenshots as the visual reference. The linked private dashboard could not be inspected, so screenshots define the visual target. The builder uses a centered lavender workspace, dark plum actions, compact Edit/Customize/Review navigation, a section sidebar, focused forms and a persistent PDF preview. Mobile uses horizontal section navigation and stacked editing/preview panes.

Customize contains Style, Layout and Template views. Six visual variants share the same A4 single-column rendering component and export path. Local font choices, body/name size, accent color and line spacing persist in optional Resume appearance metadata. Layout supports section ordering, drag handles, keyboard move controls, visibility and language selection. Hiding a section preserves its content and excludes it from rendering and missing-translation counts.

Review provides six local completeness checks and links back to editing. It deliberately has no fabricated AI score. AI writing/review services, Awards and a new Languages entry kind are outside this redesign.

All editing and customization sections remain mounted while hidden, preserving FormData and unsaved fields. Invalid hidden inputs reveal their section and entry. Arabic badges retain their translation dialogs and populated state. Existing independent copies, autosave, revision checks and exact PDF downloads remain intact. Existing JSON needs no migration; appearance and hiddenSections are optional.

Verification: 37 unit/component tests, resolver coverage 100%, 15 isolated production browser scenarios, typecheck and lint. Browser scenarios cover customization persistence, language, section visibility, CRUD, ordering, restart and PDF export. Desktop/mobile audits report zero confirmed accessibility violations; closed native translation dialogs require manual review of their aria-controls references, which point to mounted dialog elements. Mobile width 390px has no horizontal page overflow. No runtime dependencies were added; all measured route bundles remain below 180,000 gzip bytes.
