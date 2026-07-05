# Elevation & Motion Reference

## Elevation System (Shadows)

Elevation creates visual hierarchy through depth. Higher elevation = more importance/focus.

### 6-Level Elevation Scale

| Level | Token | Use Case | Light Mode Shadow |
|:------|:------|:---------|:------------------|
| 0 | `elevation-0` | Flat surfaces, backgrounds | `none` |
| 1 | `elevation-1` | Cards, raised sections | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` |
| 2 | `elevation-2` | Dropdowns, sticky headers | `0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)` |
| 3 | `elevation-3` | Popovers, floating panels | `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` |
| 4 | `elevation-4` | Modals, dialogs | `0 20px 25px rgba(0,0,0,0.1), 0 8px 10px rgba(0,0,0,0.04)` |
| 5 | `elevation-5` | Toast notifications | `0 25px 50px rgba(0,0,0,0.15), 0 12px 24px rgba(0,0,0,0.08)` |

### Dark Mode Shadows

Dark mode shadows are deeper, more diffuse, and often tinted:

| Level | Dark Mode Shadow |
|:------|:-----------------|
| 0 | `none` |
| 1 | `0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)` |
| 2 | `0 4px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)` |
| 3 | `0 10px 15px rgba(0,0,0,0.5), 0 4px 6px rgba(0,0,0,0.3)` |
| 4 | `0 20px 25px rgba(0,0,0,0.5), 0 8px 10px rgba(0,0,0,0.3)` |
| 5 | `0 25px 50px rgba(0,0,0,0.6), 0 12px 24px rgba(0,0,0,0.4)` |

In dark mode, elevation is also indicated by surface lightness — higher elevation = slightly lighter background:
- Level 0: `neutral-900`
- Level 1: `neutral-850` (mix 5% white)
- Level 2: `neutral-800`
- Level 3: `neutral-750` (mix 10% white)

## Border Radius Scale

| Token | Value | Use |
|:------|:------|:----|
| `radius-none` | 0px | Sharp corners, tables |
| `radius-sm` | 4px | Chips, small badges |
| `radius-md` | 8px | **Default** — buttons, inputs, cards |
| `radius-lg` | 12px | Large cards, sections |
| `radius-xl` | 16px | Modals, large containers |
| `radius-2xl` | 24px | Pill shapes, large buttons |
| `radius-full` | 9999px | Circles, fully rounded pills |

### Concentric Radius Rule
Inner radius = outer radius - padding. A card with `radius-lg` (12px) and `padding: 16px` should have inner elements at `radius-sm` (4px) or less.

## Motion Tokens

### Duration Scale

| Token | Value | Use |
|:------|:------|:----|
| `duration-instant` | 100ms | Micro-interactions (hover color change) |
| `duration-fast` | 150ms | Tooltips appearing, focus rings |
| `duration-normal` | 250ms | **Default** — most transitions |
| `duration-slow` | 400ms | Modal open/close, page transitions |
| `duration-glacial` | 700ms | Complex animations, skeleton loaders |

### Easing Curves

| Token | Value | Use |
|:------|:------|:----|
| `ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | General purpose (Material standard) |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elements exiting the screen |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering the screen |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Elements that stay on screen |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful, bouncy interactions |
| `ease-linear` | `linear` | Progress bars, loading spinners |

### What to Animate

| Property | Animation Feel | Duration |
|:---------|:--------------|:---------|
| `opacity` | Fade in/out | fast-normal |
| `transform` | Slide, scale, rotate | normal |
| `background-color` | Hover state change | instant-fast |
| `border-color` | Focus state | instant |
| `box-shadow` | Elevation change | normal |
| `max-height` | Accordion expand | normal-slow |

### Reduced Motion

Always respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Motion Principles
- Entrance: ease-out (fast start, gentle stop)
- Exit: ease-in (gentle start, fast exit)
- State change: ease-in-out or instant
- Never animate layout-triggering properties (width, height, top, left) — use `transform` instead
- Duration increases with travel distance
- Small elements = faster, large elements = slightly slower
