---
name: Careery
description: A local bilingual resume workspace in the Production ledger visual system.
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
  dark-background: "oklch(.19 .012 155)"
  dark-foreground: "oklch(.93 .009 95)"
  dark-card: "oklch(.23 .014 155)"
  dark-primary: "oklch(.76 .07 160)"
  dark-primary-foreground: "oklch(.19 .025 160)"
  dark-secondary: "oklch(.29 .02 155)"
  dark-muted: "oklch(.265 .012 155)"
  dark-muted-foreground: "oklch(.72 .018 145)"
  dark-accent: "oklch(.32 .035 155)"
  dark-accent-foreground: "oklch(.9 .03 155)"
  dark-destructive: "oklch(.75 .13 28)"
  dark-border: "oklch(.37 .017 155)"
  dark-input: "oklch(.48 .02 155)"
  dark-sidebar: "oklch(.21 .018 155)"
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
  sm: ".375rem"
  md: ".5rem"
  lg: ".625rem"
  xl: ".875rem"
spacing:
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  7: "28px"
  8: "32px"
components:
  workspace-header:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    height: "72px"
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

Production ledger is a warm, restrained working environment for deliberate career writing. Ink-green text, forest-green actions and fine neutral rules establish hierarchy without ornamental effects. The user-approved replacement identity removes the former purple direction.

Compact controls and clear typography keep real document names, content and persistence feedback prominent. The same hierarchy continues on dark neutral-green surfaces; the exported Resume template keeps its own isolated document styling.

**Key Characteristics:**
- Warm neutral surfaces and a restrained forest-green accent.
- Ruled lists and flat working panes.
- Locally hosted type, visible focus and restrained motion.

## Colors

Warm paper and ink-green neutrals frame one forest-green accent. The frontmatter preserves the exact canonical OKLCH declarations; dark-prefixed entries capture overrides, with other roles inherited from the light mapping.

### Primary

Forest green marks primary actions, active controls and positive readiness. Primary foreground supplies its contrasting label. The lighter dark-mode green keeps the same functional emphasis.

### Neutral

Background is the working ground; card and popover provide the lighter writing and overlay surfaces. The header uses the background surface; sidebar tokens remain available in the incumbent theme but no longer define the workspace shell. Muted surfaces separate proof and supporting information; muted foreground carries secondary copy. Border supplies fine rules; input gives controls a firmer edge. Secondary and accent are low-chroma green supporting surfaces rather than additional brand accents. Destructive is reserved for errors, missing information and destructive actions. Ring aliases primary; card/popover foreground and secondary foreground alias foreground.

Chart series reuse the existing palette: chart-1 aliases primary, chart-2 muted foreground, and chart-3 foreground. These aliases inherit the matching dark-mode values; axes use muted foreground explicitly.

## Typography

**Body and interface font:** Careery Sans, the locally hosted Geist variable font, with system sans-serif fallbacks. The local font supports weights (100–900); use the observed role tokens above rather than adding another display family.

Page headlines use the responsive headline role. Section titles use the title role; smaller headings use (16px, weight 600). Body text uses the body role; supporting copy commonly uses (12–14px). Standard controls use (14px, weight 500). Page introductions stop at (65ch). Counts use tabular numerals. The wordmark uses a compact heavy treatment (26px, weight 750), reduced to (23px) in the editor shell. The observed size ramp is recorded in frontmatter: caption (12px), supporting copy (13px), control label (14px), body (15px), subheading (16px), collection title (19px), section title (22px), editor title (23px), review score (24px), wordmark (26px), and responsive page headline (28–38px). Template miniature text (10px) is confined to document thumbnails and uses Georgia, serif rather than the interface font.

## Layout

The shell is a single content column with a brand header (minimum 72px high, reduced to 64px at 540px). Normal content has a maximum width (1320px), top padding (24px, reduced to 16px on narrow screens), and responsive horizontal padding (20–64px). Bottom content padding (48px) closes the page without a fixed navigation reserve. Resume collections use ruled rows; Profiles use bordered cards with 24px inner spacing and 20px grid gaps; Profile columns adapt from a minimum (300px). Field pairs use two equal columns with a (20px) gap. Settings has a narrower maximum width (900px) and ruled appearance sections.

The header aligns the wordmark, Today, Applications, Profiles, Career Record and Analytics to the left, with Settings at the far right. The wordmark links Home; there is no separate Home item. Navigation has visible labels and no tooltips. At 1000px and below, navigation wraps beneath the wordmark and onto additional lines as needed. At 400px and below, icons disappear to retain readable labels without overflow. The Dark mode switch lives in Settings → Appearance.

The Resume workbench divides editing and proof into persistent panes. A section rail (158px) sits within editing. The toolbar spans both panes and save state remains visible. Sections switch the editing pane while proof stays anchored; edit and proof areas scroll independently. Live-text proof is the default, with optional paginated PDF proof. The dedicated Resume studio hides the global header and uses a centered Edit / Customize / AI Review switcher above the two panes. Its maximum width is 1680px, with 24px horizontal padding. Editing keeps a 170–220px section rail; Customize and AI Review use the entire left pane. The proof fits the physical A4 document to available width without changing the export template.

At (980px) modes span a second toolbar row and edit and proof stack with explicit Preview and Back to editing actions. At (900px) normal content adopts narrower horizontal spacing. At (540px) fields stack and the section rail becomes horizontally scrollable. At (1800px) the workbench and section rail widen. These are observed layout breakpoints, not a new framework scale.

## Elevation & Depth

Working pages are flat: tonal surfaces, fine borders and ruled separators carry depth. Dialogs and alert dialogs use a foreground ring with a dimmed, softly blurred backdrop rather than a large cast shadow. Focus uses primary-colored outlines and registry rings. Registry overlay transitions last (100ms); global reduced-motion rules shorten animations and transitions to (.01ms). Standard buttons retain their subtle one-pixel active press. Header navigation has no magnification or decorative motion.

## Shapes

Controls and entry containers use modest rounded corners from the radius scale. Larger editor containers use the extra-large radius. Badges remain pill-shaped as supplied by the registry. Resume collection rows use straight horizontal rules. Profile tiles use the owned shadcn Card with a full semantic border, 24px inner spacing, and a quiet action footer without a divider or tinted fill. They use a wrapping 18px, medium-weight title with visible focus and hover underline, tabular metadata, and bottom-aligned actions: a forest-green Edit Profile link with no visible button border plus a ghost trash button with a Base UI tooltip. Preserve the contrast between compact rounded controls and structural ruled layouts.

## Components

### Buttons

Owned shadcn Base UI buttons provide primary, outline, secondary, ghost, destructive and link variants. Standard buttons use the large radius, horizontal padding (10px), and an app minimum height (36px). Coarse pointers raise buttons and toggle items to (44px). Primary hover lowers opacity; outline and ghost hover use muted surfaces. Keyboard focus uses the ring token; disabled controls reduce opacity. Button and toggle-group hydration guards keep actions disabled until the client is ready.

### Chips

Registry badges communicate language and compact status with primary, secondary, outline or destructive styling. Preview metadata also uses small muted badges. Overflow and missing-information messages use destructive color.

### Cards / Containers

Domain composition uses owned registry controls within bordered editor sections, entry fieldsets and ruled lists. Editor sections use the card surface, extra-large corners and (28px) padding, reduced to (20px) on narrow screens. Within the workbench the active editing pane has square internal edges. These are layout containers, not a separately installed Card primitive.

### Inputs / Fields

Inputs, native selects, textareas, checkboxes, sliders and field labels come from shadcn source. Inputs and selects have a minimum height (40px), raised to (44px) on coarse pointers. Inputs use transparent light backgrounds and a toned input background in dark mode. Focus shifts the border to ring and adds a ring; invalid controls use destructive borders/rings. Textareas grow with content. The owned slider forwards its accessible label to the thumb and uses card for the thumb fill.

### Navigation

Header navigation uses owned shadcn ghost buttons rendered as links, with visible text labels and 44px minimum targets. Today, Applications, Profiles, Career Record and Analytics follow the wordmark; Settings aligns to the opposite edge. The active route uses accent and accent foreground. Header links wrap on phones rather than squeezing labels. Section navigation reuses registry buttons with explicit selected state. Toggle groups provide language and mode choices; the Applications toolbar uses labeled native selects for filters and its table/board view.

### Settings switch

The shadcn Base UI Switch controls Dark mode in Settings → Appearance. Its pill track is (32px × 18.4px), with a circular thumb (16px). Checked uses primary and unchecked uses input; the thumb uses background with dark-mode foreground adjustments. A visible field label and supporting description explain the saved browser preference. Keyboard focus uses the same ring vocabulary as other controls.

### Section tabs and sortable entries

Career Record and Profile editors use existing shadcn Base UI line tabs. Only the related section is visible; inactive form values remain mounted for autosave. The ruled tab strip scrolls horizontally, with controls at least (40px) high and horizontal padding (12px). Active tabs use foreground text and a fine underline; inactive tabs use semantic muted foreground in both themes, with foreground hover and visible focus rings. Profile-specific Details and Choose content tabs appear when applicable.

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
- Do apply app colors through the semantic theme tokens in src/app/globals.css.
- Do reuse existing shadcn Base UI controls before adding approved registry components.
- Do preserve light/dark hierarchy, visible focus and reduced-motion behavior.
- Do keep Arabic RTL support and LTR email/URL values intact.

### Don't:
- Don't reintroduce the replaced purple identity.
- Don't add decorative motion or effects for their own sake.
- Don't substitute Radix asChild examples for Base UI render composition.
- Don't let app theme styling leak into the exported Resume template.
