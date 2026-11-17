# Careery design system

Use this system to design a landing page that feels part of Careery, a bilingual English/Arabic career and resume app.

## Visual direction

“Production ledger”: warm paper surfaces, ink-green text, forest-green actions, fine rules, crisp rounded corners, and tactile 3D bases. Restrained, deliberate, readable. Preserve this identity in light and dark mode. Avoid purple, unrelated accent palettes, decorative motion, and oversized pill controls.

## Colors

Use semantic tokens throughout. These are the current implemented values from src/app/globals.css (including dark-mode overrides, which differ from older DESIGN.md values). Unspecified dark roles inherit their light declarations and resolve through aliases.

```css
:root {
color-scheme: light;
  --background: oklch(.965 .008 95); --foreground: oklch(.25 .022 155);
  --card: oklch(.995 .003 95); --card-foreground: var(--foreground);
  --popover: var(--card); --popover-foreground: var(--foreground);
  --primary: oklch(.40 .065 160); --primary-foreground: oklch(.99 .003 95);
  --secondary: oklch(.925 .015 145); --secondary-foreground: var(--foreground);
  --muted: oklch(.935 .008 95); --muted-foreground: oklch(.46 .018 155);
  --accent: oklch(.90 .028 155); --accent-foreground: oklch(.29 .045 160);
  --destructive: oklch(.48 .16 28); --border: oklch(.84 .014 145);
  --input: oklch(.76 .018 150); --ring: var(--primary); --radius: .375rem;
  --sidebar: oklch(.935 .015 145); --sidebar-foreground: var(--foreground);
  --sidebar-primary: var(--primary); --sidebar-primary-foreground: var(--primary-foreground);
  --sidebar-accent: var(--accent); --sidebar-accent-foreground: var(--accent-foreground);
  --sidebar-border: var(--border); --sidebar-ring: var(--ring);
  --ink: var(--foreground); --surface: var(--background); --line: var(--border);
  --chart-1: var(--primary); --chart-2: var(--muted-foreground); --chart-3: var(--foreground);
  --action: var(--primary); --translation-fill: var(--accent); --translation-line: var(--border);
}
.dark {
color-scheme: dark;
  --background: oklch(.205 .006 155); --foreground: oklch(.93 .006 95);
  --card: oklch(.30 .012 155); --popover: oklch(.35 .014 155);
  --primary: oklch(.76 .07 160); --primary-foreground: oklch(.19 .025 160);
  --secondary: oklch(.37 .018 155); --muted: oklch(.255 .009 155);
  --muted-foreground: oklch(.79 .012 145); --accent: oklch(.39 .04 155);
  --accent-foreground: oklch(.93 .025 155); --destructive: oklch(.75 .13 28);
  --border: oklch(.66 .014 155); --input: oklch(.68 .018 155);
  --control-border: var(--border);
  --sidebar: oklch(.235 .009 155);
}
```

## Typography

Careery Sans is locally hosted Geist variable (weights 100–900). Font stack: `"Careery Sans", ui-sans-serif, system-ui, sans-serif`. Use the fallback if the font file is unavailable; do not add a separate display family.

| Role | Size | Weight / leading |
|---|---|---|
| Page headline | clamp(28px, 3vw, 38px) | 650 / 1.2; tracking -0.03em |
| Section title | 22px | 600 / 1.3; tracking -0.02em |
| Small heading | 16px | 600 |
| Body | 15px | normal / 1.6 |
| Control label | 14px | 500 |
| Supporting / caption | 13px / 12px | normal |
| Wordmark | 26px | 750 |

Use sentence case, introductions no wider than 65ch, and tabular numerals for counts. Document miniatures may use Georgia; document typography stays independent of the interface.

## Spacing and shape

Spacing scale: 8, 12, 16, 20, 24, 28, 32px. Use 12px action gaps, 16px card padding, 20px grid gaps, and 28px large-container padding (20px on narrow screens). Main content maximum width: 1320px; reading content: 760px. Adapt the composition to a public landing page; it does not need the app sidebar.

Base radius: 6px. Small: 3.6px; medium: 4.8px; large: 6px; extra-large: 8.4px. Controls are crisp; badges and switch thumbs retain their semantic rounded shapes. Use fine semantic borders and ruled layouts.

## Mandatory depth hierarchy

- Cards, large containers, and dialogs: stationary raised faces with solid 6px downward bases.
- Primary/standard action buttons: 4px bases; depress halfway on hover and fully on activation.
- Compact controls, tabs, navigation, toggles, and expanders: 2px bases. Selected/pressed/expanded controls stay depressed.
- Inputs and switch tracks: recessed. Thumbs and badges: raised.
- Reserve space beneath bases. Static cards do not travel or imply clickability.
- Text, chart marks, and document content remain flat. Resume previews and exported documents retain their isolated template styling; app depth and colors must not leak into the document.

Shared depth tokens:

```css
:root {
  --depth-card: 6px;
  --depth-action: 4px;
  --depth-control: 2px;
  --depth-base: color-mix(in oklch, var(--border), var(--foreground) 35%);
  --depth-primary: color-mix(in oklch, var(--primary), var(--foreground) 45%);
  --depth-destructive: color-mix(in oklch, var(--destructive), var(--background) 35%);
}
.dark {
  --depth-base: color-mix(in oklch, var(--background), black 35%);
  --depth-primary: color-mix(in oklch, var(--primary), black 55%);
  --depth-destructive: color-mix(in oklch, var(--destructive), black 55%);
}
/* Raised container: box-shadow: 0 var(--depth-card) 0 var(--depth-base); */
```

## Controls, interaction, and accessibility

Primary buttons use primary/primary-foreground; secondary uses secondary; quiet controls use card faces. Standard buttons are at least 36px high; inputs at least 40px. Coarse-pointer targets are at least 44px. Disabled controls reduce opacity and never depress. Invalid states use destructive borders/rings.

Use visible keyboard focus outlines with the ring token, accessible labels, semantic headings and links, and explicit selected states. Preserve forced-color borders. Support Arabic RTL; email addresses and URLs remain LTR. Stack columns and wrap content on narrow screens.

Transitions: 150ms. Hover travel applies only on hover-capable devices. Reduced motion removes travel and transition duration while preserving immediate state feedback.

## Component vocabulary

Reuse owned components first. The foundation is shadcn/ui on Base UI, followed by coss ui; Cult UI and Magic UI are available for appropriate specialist components, then Velora UI. Preserve the shared tactile theme when composing library components. Base UI composes through `render`, not Radix `asChild`. Apply colors and depth through shared theme tokens rather than page-specific treatments.

This is a design reference, not a component-source bundle. Screenshots and font binaries are not embedded.
