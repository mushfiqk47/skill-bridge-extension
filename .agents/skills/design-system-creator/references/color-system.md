# Color System Reference

## Color Theory for Design Systems

A design system color palette is not a random collection of colors — it's a mathematical, intentional system built for consistency, accessibility, and theming.

## Palette Generation Methods

### Method 1: HSL-Based Generation (Recommended)

Start with a brand hue, then generate a full shade ramp by adjusting Saturation and Lightness:

```
Shade   Lightness    Saturation Adjust
50      97%          Base saturation
100     93%          +2%
200     86%          +3%
300     76%          +3%
400     62%          +1%
500     50%          Base saturation (anchor)
600     42%          -2%
700     35%          -5%
800     27%          -8%
900     20%          -10%
950     12%          -12%
```

The 500 shade is your anchor — the "true" version of the color. Lighter shades go up (backgrounds, hover states), darker shades go down (text, active states).

### Method 2: OKLCH-Based Generation (Advanced)

For perceptually uniform colors, use OKLCH color space:
- **L** (Lightness): 0-1, controls perceived brightness
- **C** (Chroma): 0-0.4, controls saturation
- **H** (Hue): 0-360, the hue angle

OKLCH produces more visually consistent shade ramps — a blue-500 and a green-500 will appear equally "medium" to the human eye.

## Required Color Families

### Primary Palette (8-12 hues minimum)

Every design system needs at minimum:

| Family | Purpose | Typical Hue |
|:-------|:--------|:------------|
| **Primary** | Brand color, main CTAs | Brand-specific |
| **Secondary** | Supporting actions, accents | Complement or analogous to primary |
| **Neutral** | Text, borders, backgrounds | Desaturated gray (can be warm/cool tinted) |
| **Red** | Error, destructive actions | 0-10° |
| **Orange/Amber** | Warning states | 25-45° |
| **Green** | Success, confirmation | 120-150° |
| **Blue** | Info, links (if not primary) | 210-240° |

Each family gets a full shade ramp: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950.

### Neutral Palette (Critical)

The neutral palette is the most-used palette in any system. It handles:
- All text colors
- All background shades
- All border colors
- Disabled states
- Dividers

**Warm vs Cool Neutrals:**
- **Warm neutrals** (slight yellow/red tint): Feels friendly, approachable. Good for consumer products.
- **Cool neutrals** (slight blue tint): Feels professional, technical. Good for enterprise/fintech.
- **True neutrals** (pure gray): Feels modern, minimal. Good for design tools, creative products.

To create tinted neutrals, add 2-5% saturation to a pure gray at your desired hue angle.

## Semantic Color Mapping

### Surface Colors

| Token | Light Mode | Dark Mode | Purpose |
|:------|:-----------|:----------|:--------|
| `bg-primary` | white / neutral-0 | neutral-900 | Main page background |
| `bg-secondary` | neutral-50 | neutral-800 | Subtle section backgrounds |
| `bg-elevated` | white | neutral-800 | Cards, modals, popovers |
| `bg-overlay` | neutral-900/60% | neutral-950/80% | Overlay/scrim behind modals |
| `bg-inverse` | neutral-900 | neutral-50 | Inverted sections |

### Text Colors

| Token | Light Mode | Dark Mode | Purpose |
|:------|:-----------|:----------|:--------|
| `text-primary` | neutral-900 | neutral-50 | Main body text |
| `text-secondary` | neutral-600 | neutral-400 | Supporting text |
| `text-tertiary` | neutral-500 | neutral-500 | Placeholder, hint text |
| `text-disabled` | neutral-400 | neutral-600 | Disabled state |
| `text-inverse` | neutral-0 | neutral-900 | Text on inverse backgrounds |
| `text-link` | primary-600 | primary-400 | Hyperlinks |

### Feedback Colors

| Token | Light Mode | Dark Mode | Purpose |
|:------|:-----------|:----------|:--------|
| `feedback-success-bg` | green-50 | green-950 | Success banner background |
| `feedback-success-text` | green-800 | green-200 | Success message text |
| `feedback-success-border` | green-300 | green-700 | Success banner border |
| `feedback-error-bg` | red-50 | red-950 | Error banner background |
| `feedback-error-text` | red-800 | red-200 | Error message text |
| `feedback-warning-bg` | amber-50 | amber-950 | Warning banner background |
| `feedback-info-bg` | blue-50 | blue-950 | Info banner background |

## Dark Mode Principles

Dark mode is NOT an inversion — it's a re-mapping. Key principles:

1. **Background surfaces use high-shade neutrals** (800-950), NOT black (#000)
2. **Elevation in dark mode = lighter surfaces** — higher elevation = slightly lighter (e.g., 850 → 800 → 750)
3. **Primary/accent colors shift lighter** — use 400-500 range instead of 600-700
4. **Shadows become deeper and more diffuse**, often with a colored tint
5. **Reduce surface contrast** — dark mode surfaces should NOT have stark white borders
6. **Text uses 50-300 range** for readability without being blindingly white
7. **Never use pure black (#000000)** as background — it creates too harsh a contrast

## Contrast Requirements

| Requirement | Ratio | Applies To |
|:------------|:------|:-----------|
| WCAG AA Normal Text | 4.5:1 | Body text, labels, links |
| WCAG AA Large Text | 3:1 | 18px+ or 14px+ bold |
| WCAG AA UI Components | 3:1 | Borders, icons, focus rings |
| WCAG AAA Normal Text | 7:1 | High-contrast mode text |
| Non-text Contrast | 3:1 | Charts, data visualization |

Always verify these pairs:
- `text-primary` on `bg-primary`
- `text-secondary` on `bg-primary`
- `text-primary` on `bg-elevated`
- `action-primary-text` on `action-primary`
- `text-link` on `bg-primary`
- All feedback text on their respective backgrounds
