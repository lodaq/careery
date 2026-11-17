---
name: Careery
description: A local bilingual resume workspace in the tactile Production ledger visual system.
colors:
  background: "oklch(.965 .008 95)"
  foreground: "oklch(.25 .022 155)"
  card: "oklch(.995 .003 95)"
  primary: "oklch(.40 .065 160)"
  primary-foreground: "oklch(.99 .003 95)"
  secondary: "oklch(.925 .015 145)"
  muted: "oklch(.935 .008 95)"
  muted-foreground: "oklch(.46 .018 155)"
  accent: "oklch(.90 .028 155)"
  accent-foreground: "oklch(.29 .045 160)"
  destructive: "oklch(.48 .16 28)"
  border: "oklch(.84 .014 145)"
  input: "oklch(.76 .018 150)"
  sidebar: "oklch(.935 .015 145)"
  chart-1: "var(--primary)"
  chart-2: "var(--muted-foreground)"
  chart-3: "var(--foreground)"
  dark-background: "oklch(.205 .006 155)"
  dark-foreground: "oklch(.93 .006 95)"
  dark-card: "oklch(.30 .012 155)"
  dark-primary: "oklch(.76 .07 160)"
  dark-primary-foreground: "oklch(.19 .025 160)"
  dark-secondary: "oklch(.37 .018 155)"
  dark-muted: "oklch(.255 .009 155)"
  dark-muted-foreground: "oklch(.79 .012 145)"
  dark-accent: "oklch(.39 .04 155)"
  dark-accent-foreground: "oklch(.93 .025 155)"
  dark-destructive: "oklch(.75 .13 28)"
  dark-border: "oklch(.66 .014 155)"
  dark-input: "oklch(.68 .018 155)"
  dark-sidebar: "oklch(.235 .009 155)"
typography:
  headline:
    fontFamily: "Careery Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(28px,3vw,38px)"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-.03em"
  title:
    fontFamily: "Careery Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-.02em"
  body:
    fontFamily: "Careery Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    lineHeight: 1.6
  label:
    fontFamily: "Careery Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
  caption:
    fontFamily: "Careery Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
  supporting:
    fontFamily: "Careery Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
  subheading:
    fontFamily: "Careery Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
  collection-title:
    fontFamily: "Careery Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
  editor-title:
    fontFamily: "Careery Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "23px"
  review-score:
    fontFamily: "Careery Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
  wordmark:
    fontFamily: "Careery Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "26px"
  template-miniature:
    fontFamily: "Georgia, serif"
    fontSize: "10px"
rounded:
  sm: ".225rem"
  md: ".3rem"
  lg: ".375rem"
  xl: ".525rem"
spacing:
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  7: "28px"
  8: "32px"
components:
  workspace-sidebar:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.foreground}"
    width: "256px"
  theme-switch:
    backgroundColor: "{colors.input}"
    height: "18.4px"
    width: "32px"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "36px"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "36px"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "36px"
  input:
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    height: "40px"
  editor-container:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "28px"
---
# Design System: Careery

## Overview

**Creative North Star: "Production ledger"**

Production ledger is a warm, restrained working environment for deliberate career writing. Ink-green text, forest-green actions and fine neutral rules establish hierarchy with solid, tactile 3D bases. The user-approved replacement identity removes the former purple direction.

Compact controls and clear typography keep real document names, content and persistence feedback prominent. The same hierarchy continues on dark neutral-green surfaces; the exported Resume template keeps its own isolated document styling.

**Key Characteristics:**
- Warm neutral surfaces and a restrained forest-green accent.
- Ruled lists, raised containers and pressable controls.
- Locally hosted type, visible focus and restrained motion.

## Colors

Warm paper and ink-green neutrals frame one forest-green accent. The frontmatter preserves the exact canonical OKLCH declarations; dark-prefixed entries capture overrides, with other roles inherited from the light mapping.

### Primary

Forest green marks primary actions, active controls and positive readiness. Primary foreground supplies its contrasting label. The lighter dark-mode green keeps the same functional emphasis.

### Neutral

Background is the working ground; card and popover provide the lighter writing and overlay surfaces. The sidebar uses the sidebar surface; its foreground, accent and border tokens define the navigation rail. Muted surfaces separate proof and supporting information; muted foreground carries secondary copy. Border supplies fine rules; input gives controls a firmer edge. Secondary and accent are low-chroma green supporting surfaces rather than additional brand accents. Destructive is reserved for errors, missing information and destructive actions. Ring aliases primary; card/popover foreground and secondary foreground alias foreground.

Chart series reuse the existing palette: chart-1 aliases primary, chart-2 muted foreground, and chart-3 foreground. These aliases inherit the matching dark-mode values; axes use muted foreground explicitly.

## Typography

**Body and interface font:** Careery Sans, the locally hosted Geist variable font, with system sans-serif fallbacks. The local font supports weights (100–900); use the observed role tokens above rather than adding another display family.

Page headlines use the responsive headline role. Section titles use the title role; smaller headings use (16px, weight 600). Body text uses the body role; supporting copy commonly uses (12–14px). Standard controls use (14px, weight 500). Page introductions stop at (65ch). Counts use tabular numerals. The wordmark uses a compact heavy treatment (26px, weight 750), reduced to (23px) in the editor shell. The observed size ramp is recorded in frontmatter: caption (12px), supporting copy (13px), control label (14px), body (15px), subheading (16px), collection title (18px), section title (22px), editor title (23px), review score (24px), wordmark (26px), and responsive page headline (28–38px). Template miniature text (10px) is confined to document thumbnails and uses Georgia, serif rather than the interface font.

## Layout

The public landing page at `/` follows the approved HTML reference: a raised header, forest-green ruled hero with overlapping flat document previews, feature cards, sample analytics, bilingual preview tabs and a final call to action. Signed-in users continue to Today. Its headline scales from 34px to 64px; small document-preview text scales from 8px to 12px. The 18px logo glyph and pill badges retain their supplied forms. Hero surfaces use `--hero-plate`, `--hero-rule` and `--depth-on-primary`, recomputed in both modes. Document-preview colors remain isolated from app theme colors.

The workspace uses the official shadcn Base UI Sidebar, with a 232px expanded desktop rail, a 68px icon rail when collapsed, and a 288px mobile Sheet below 768px. SidebarHeader holds the wordmark, SidebarContent holds the scrollable navigation, and SidebarFooter holds the account menu with the avatar to the left of the name; sign out lives inside that menu. Browser tab titles use the root metadata template “Careery | Current page”; every route declares its page title. A shared header contains the sidebar toggle followed by the page’s existing title and description. Move page headings into that header through PageHeading, preserving dynamic text and rendering only one h1; do not repeat them in the page body. The toggle sits 12px from the main area’s left edge. SidebarHeader holds a 36px icon beside a compact Careery wordmark, The collapse trigger lives in the main header. In icon mode, hide the wordmark and destination labels, preserve the logo and 52px navigation targets, show destination tooltips, and keep the header toggle available. Account controls reduce to the avatar. Mobile uses the same header menu trigger and the registry Sheet, with its close control inside the sidebar.

Selecting a destination closes the mobile panel. Preserve focus trapping and Escape behavior from the Sheet.

Navigation follows Today, Applications, Profiles, Career Record, Interview questions, Analytics, Resources, Settings. Use shadcn Base UI Sidebar functionality: icon collapse, tooltips, mobile Sheet, keyboard shortcut, SidebarGroup composition and SidebarRail. Keep Careery’s 3D styling: 2px solid bases, rounded faces, hover travel and depressed selected states. Do not replace the tactile appearance with registry default flat styling. Account actions remain bottom-aligned. Main content fills the remaining width with responsive horizontal padding and a maximum width of 1320px. Footer follows the flexible main content and stays at the bottom of short pages. Home content has a 760px reading measure and 32–72px top spacing.

Use 12px action gaps. Preserve existing editor section margins when adding depth; never globally replace container margins with the shadow height. Profile cards use 16px inner spacing and 20px grid gaps. Field pairs use two equal columns with a 20px gap and stack on narrow screens. Settings has a maximum width of 900px. The Dark mode switch lives in Settings → Appearance.

The Resume workbench divides editing and proof into persistent panes. A section rail (158px) sits within editing. The toolbar spans both panes and save state remains visible. Sections switch the editing pane while proof stays anchored; edit and proof areas scroll independently. Live-text proof is the default, with optional paginated PDF proof. The dedicated Resume studio hides the global header and uses a centered Edit / Customize / AI Review switcher above the two panes. Its maximum width is 1680px, with 24px horizontal padding. Editing keeps a 170–220px section rail; Customize and AI Review use the entire left pane. The proof fits the physical A4 document to available width without changing the export template.

At (980px) modes span a second toolbar row and edit and proof stack with explicit Preview and Back to editing actions. At (900px) normal content adopts narrower horizontal spacing. At (540px) fields stack and the section rail becomes horizontally scrollable. At (1800px) the workbench and section rail widen. These are observed layout breakpoints, not a new framework scale.

## Elevation & Depth

Sidebar items use 52px heights and 24px icons in both states; minimized items are exactly 52×52px with balanced rail gutters. Center minimized buttons, logo and account avatar horizontally. Keep left padding and icon alignment constant; do not switch justification or apply collapsed-only size/padding overrides. Restore the saved sidebar_state cookie across page navigation; selecting a destination must not expand the desktop sidebar. Only explicit toggle actions change its state. Sidebar width, menu width/padding, and label reveal share a 240ms ease-out transition. Reduced motion makes these immediate.

The app uses a user-approved tactile 3D system, inspired by the supplied Factually and CodePen button references. This is mandatory for new UI and UX work. Preserve the green palette, local typography, sentence-case labels, and light/dark support.

Use the shared tokens in `src/app/globals.css`: `--depth-card: 6px`, `--depth-action: 4px`, and `--depth-control: 2px`. Solid downward bases, semantic borders, and rounded faces create depth; this deliberately permits hard offset shadows. Base colors derive from the current theme through `--depth-base`, `--depth-primary`, and `--depth-destructive`. Never hard-code per-page colors or depth values.

Cards, editor containers and dialogs remain raised and stationary. Action buttons depress halfway on hover and fully on activation. Compact navigation buttons, tabs, toggles, checkboxes, expanders and drag handles use 2px depth. Selected tabs and navigation, pressed toggles and expanded headers remain depressed. Inputs and switch tracks are recessed; thumbs and badges are raised. Reserve space beneath the base so neighboring content does not overlap it. Do not animate static cards or make them appear clickable.

Transitions last 150ms. Hover travel applies only to hover-capable devices. Reduced motion disables travel and transition duration while retaining immediate depth and color feedback. Keep visible keyboard outlines, disabled states and forced-color borders. Text, labels, table cells, chart marks and exported Resume content remain flat; depth belongs to controls and their surrounding containers.

## Shapes

The shared base radius is 6px (small 3.6px, medium 4.8px, large 6px, extra-large 8.4px). Keep controls crisp rather than pill-shaped; badges and switch thumbs retain their semantic shapes.

Controls and entry containers use modest rounded corners from the radius scale. Larger editor containers use the extra-large radius. Badges remain pill-shaped as supplied by the registry. Resume collection rows use straight horizontal rules. Profile tiles use the owned shadcn Card with a full semantic border, 16px inner spacing, and a quiet action footer without a divider or tinted fill. They use a wrapping 18px, medium-weight title with visible focus and hover underline, tabular metadata, and bottom-aligned actions: a forest-green Edit Profile control with a compact raised face plus a raised ghost trash button with a Base UI tooltip. Preserve the contrast between compact rounded controls and structural ruled layouts.

## Components

### Buttons

Owned shadcn Base UI buttons provide primary, outline, secondary, ghost, destructive and link variants. All button variants participate in the tactile system. Primary and destructive actions retain semantic filled faces; secondary uses its supporting surface; quieter variants use card faces. Standard actions have 4px bases; ghost/link controls, popup triggers and expanders use 2px bases. The owned Button exposes `data-variant` for shared styling. Preserve Base UI composition, existing labels and hydration guards.

Standard controls retain 36px minimum height and coarse-pointer targets of 44px. Focus uses the theme ring and visible outline. Disabled controls retain reduced opacity and never depress. Do not substitute the reference's uppercase Rubik labels or remote font imports.

### Chips

Registry badges communicate language and compact status with primary, secondary, outline or destructive styling. Preview metadata also uses small muted badges. Overflow and missing-information messages use destructive color.

### Cards / Containers

Domain composition uses owned registry controls within bordered editor sections, entry fieldsets and ruled lists. Editor sections use the card surface, extra-large corners and (28px) padding, reduced to (20px) on narrow screens. Within the workbench the active editing pane has square internal edges. These are layout containers, not a separately installed Card primitive.

### Notes board

The Notes surface is a Keep-style board: one composer bar, a search field, and a masonry grid of note cards. The composer expands in place and keeps the first line as the note title, so a quick thought needs no form. Cards carry their own surface, ink and shadow base, so a coloured note keeps the shared tactile depth: `--note-gray`, `--note-amber`, `--note-mint`, `--note-blue`, `--note-rose` and `--note-lilac`, each with a matching `-base` tone, are theme tokens in `src/app/globals.css` for light and dark mode. Secondary text on a coloured card tints from that card's ink instead of grey. Card actions appear on hover and stay visible on coarse pointers, and pinned notes lead the grid. The grid uses CSS columns, so cards never overlap and their order stays stable.

### Inputs / Fields

Inputs, native selects, textareas, checkboxes, sliders and field labels come from shadcn source. Inputs and selects have a minimum height (40px), raised to (44px) on coarse pointers. Inputs use transparent light backgrounds and a toned input background in dark mode. Focus shifts the border to ring and adds a ring; invalid controls use destructive borders/rings. Textareas grow with content. The owned slider forwards its accessible label to the thumb and uses card for the thumb fill.

### Navigation

Navigation uses the official shadcn SidebarMenu, SidebarMenuItem and Base UI SidebarMenuButton rendered as Next.js links. Active destinations expose `aria-current="page"` and `isActive`, with depressed depth and accent fill. Labels remain visible in the desktop sidebar and mobile Sheet. Keep ordinary link semantics and keyboard focus. Section navigation reuses registry controls with explicit selected state.

### Settings switch

The shadcn Base UI Switch controls Dark mode in Settings → Appearance. Its pill track is (32px × 18.4px), with a circular thumb (16px). Checked uses primary and unchecked uses input; the thumb uses background with dark-mode foreground adjustments. A visible field label and supporting description explain the saved browser preference. Keyboard focus uses the same ring vocabulary as other controls.

### Section tabs and sortable entries

Career Record and Profile editors use existing shadcn Base UI tabs. Only the related section is visible; inactive form values remain mounted for autosave. The ruled tab strip scrolls horizontally, with controls at least (40px) high and horizontal padding (12px). Tabs use raised faces; active tabs remain depressed with accent fill. Preserve keyboard selection, horizontal scrolling and visible focus rings. Profile-specific Details and Choose content tabs appear when applicable.

Existing entries of every kind and their achievements begin collapsed. Click the labeled summary to expand its related fields; newly added entries open for immediate editing. Summaries show the entry heading and muted secondary context, with a rotating chevron. Resume entry triggers have a minimum height (56px) with a full-width target beside a separate 44px drag handle; other entry triggers have a minimum height (60px); achievement triggers have a minimum (48px). Hidden collapsible content stays mounted so saving preserves it.

The owned Cult UI sortable-list adaptation arranges form rows with a (12px) gap. Each row has a distinct shadcn Base UI ghost-button grip handle: drag with the pointer or focus the handle and press Arrow Up / Arrow Down. Keyboard moves announce the resulting position. Handles use grab/grabbing cursors and disable touch panning on the handle only. Position changes use a short spring (0.2s, zero bounce); reduced motion removes layout animation. Chevron rotation takes (0.15s), subject to the global reduced-motion override. Domain rows reuse Tabs, Collapsible and Button controls rather than hand-built interactive primitives.

Entry rows use a compact two-column header: a centered muted drag handle beside a wrapping 16px title and 13px supporting line. Expanded fields sit below a fine rule with 24px padding (16px on narrow screens). Header controls remain separate so editing never starts a drag.

### Charts

The owned official shadcn Chart source provides Recharts containers, tooltips and legends. Horizontal bars use semantic chart aliases, fine grid rules and integer count axes. Series do not animate; the accessibility layer supports keyboard inspection with a visible focus outline. Exact labeled tables accompany the visual summaries. Chart content loads when it enters the viewport, with a labeled Load charts button as a manual fallback. The Analytics surface brief records its composition and empty states.

### Editing and proof

The studio follows the reference composition while retaining the green palette. Segmented mode and customization controls sit on muted surfaces, with card-filled active items. Customize uses bordered 24px content groups and real document miniatures in the template gallery. AI Review uses an optional target-role form, clearly labeled data disclosure, strengths and actionable suggestion cards. Its writing score uses the existing review-score type step, never a fabricated readiness score. Results do not modify wording without an explicit apply action.

The workbench keeps section selection, editing and proof coordinated. Preview keeps its own toolbar and muted surrounding surface; document typography and colors belong to the isolated Resume template. Registry collapsibles expose optional details and content entries; dialogs handle editing overlays, and alert dialogs protect destructive decisions. Domain layout is composed around registry controls; interactive primitives are not hand-recreated.

## Do's and Don'ts

### Do:
- Do apply the shared 3D depth hierarchy to all new controls and containers.
- Do apply app colors through the semantic theme tokens in src/app/globals.css.
- Do reuse existing shadcn Base UI controls before adding approved registry components.
- Do preserve light/dark hierarchy, visible focus and reduced-motion behavior.
- Do keep Arabic RTL support and LTR email/URL values intact.

### Don't:
- Don't reintroduce the replaced purple identity.
- Don't add decorative motion or effects for their own sake.
- Don't substitute Radix asChild examples for Base UI render composition.
- Don't let app theme styling leak into the exported Resume template.
