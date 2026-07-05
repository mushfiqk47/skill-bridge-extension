# Iconography Reference

## Icon System Design Rules

Icons are language-independent visual shortcuts. They must be consistent, clear, and systematic.

## Size System

Build all icons at one base size, then allow scaling:

| Size | Use |
|:-----|:----|
| 16px | Inline text, dense tables, compact UI |
| 20px | Navigation items, list icons |
| 24px | **Base size** — standard UI icons |
| 32px | Feature highlights, empty states |
| 40px | Marketing, onboarding illustrations |

## Grid & Alignment

- Build on a pixel grid (all points align to whole pixels)
- Use an optical grid with padding equal to stroke weight (e.g., 2px padding in a 24px frame)
- Center the dominant visual mass both vertically and horizontally
- Different shapes extend to different grid edges:
  - Squares: fill the full grid
  - Circles: extend 1px beyond square bounds
  - Tall/narrow shapes: extend to top/bottom edges
  - Wide shapes: extend to left/right edges

## Style Consistency

Pick ONE style and use it everywhere:

| Style | Best For | Recognizability |
|:------|:---------|:----------------|
| **Outlined (stroked)** | Detail-rich icons, elegant aesthetic | Good at 24px+ |
| **Filled (solid)** | Small sizes, high recognizability | Best at all sizes |
| **Two-tone** | Brand differentiation, marketing | Moderate |

### Stroke Rules (for outlined icons)
- All strokes must be the same weight (1.5px or 2px)
- Space between strokes ≥ stroke weight
- Never make outlined icons smaller than 12px
- Use consistent end caps (rounded OR squared, not both)
- Use consistent corner joins (rounded OR mitered, not both)

## Color

- **Product icons:** Single color only (inherits from text color token)
- **Marketing icons:** Maximum 2 colors
- Anything with 3+ colors is an illustration, not an icon

## Naming Convention

Name icons by what they **show**, not what they **represent**:
- ✓ `stopwatch` (not `speed`)
- ✓ `lightbulb` (not `idea`)
- ✓ `magnifying-glass` (not `search`)

Use dashes for multi-word names: `arrow-right`, `chevron-down`, `user-plus`

### Organization Pattern
```
icon-{category}-{name}
```
Categories: `nav`, `action`, `status`, `content`, `social`, `file`

## Recommended Icon Libraries

| Library | Style | Count | License |
|:--------|:------|:------|:--------|
| [Lucide](https://lucide.dev) | Outlined, 1.5px stroke | 1500+ | MIT |
| [Phosphor](https://phosphoricons.com) | 6 weights (thin→fill) | 1200+ | MIT |
| [Material Symbols](https://fonts.google.com/icons) | Variable weight/fill | 2500+ | Apache 2.0 |
| [Heroicons](https://heroicons.com) | Outlined + Solid | 300+ | MIT |
| [Tabler Icons](https://tabler.io/icons) | Outlined, 2px stroke | 5000+ | MIT |

Choose a library that matches your system's personality and stroke weight.

## Implementation

- Export as SVG for web (Figma produces minimal SVGs)
- Use `currentColor` for fill/stroke to inherit text color
- Wrap in a consistent component with size prop
- Include `aria-hidden="true"` for decorative icons
- Include `aria-label` or `<title>` for meaningful icons
