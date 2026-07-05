# Spacing & Grids Reference

## The 8pt Spatial System

The 8pt grid is the most widely adopted spatial system. All sizing and spacing values are multiples of 8px, with a 4px half-step for fine adjustments.

### Why 8pt?
- Visually distinct increments (easy to eyeball the difference between 8px and 16px)
- Clean scaling at 1.5x and 2x device resolutions (no half-pixel rendering)
- Divisible by 2 and 4 for sub-grids
- Adopted by Material Design, Apple HIG, and most enterprise systems

### Spacing Scale

| Token | Value | Use For |
|:------|:------|:--------|
| `spacing-0` | 0px | No spacing |
| `spacing-0.5` | 2px | Hairline gaps, dense UI |
| `spacing-1` | 4px | Icon padding, tight gaps |
| `spacing-2` | 8px | Between related items, small padding |
| `spacing-3` | 12px | Form field gaps, compact padding |
| `spacing-4` | 16px | Standard internal padding |
| `spacing-5` | 20px | Card padding, section gaps |
| `spacing-6` | 24px | Component spacing |
| `spacing-8` | 32px | Section padding |
| `spacing-10` | 40px | Large section gaps |
| `spacing-12` | 48px | Major section separation |
| `spacing-16` | 64px | Page-level spacing |
| `spacing-20` | 80px | Hero section padding |
| `spacing-24` | 96px | Full section separation |

### T-Shirt Size Aliases

| Alias | Maps To | Value |
|:------|:--------|:------|
| `xs` | spacing-1 | 4px |
| `sm` | spacing-2 | 8px |
| `md` | spacing-4 | 16px |
| `lg` | spacing-6 | 24px |
| `xl` | spacing-8 | 32px |
| `2xl` | spacing-12 | 48px |
| `3xl` | spacing-16 | 64px |

## Element vs Content Sizing

### Element-First (Strict Height)
Button height is 40px. Padding adjusts to fit.
Best for: Buttons, form inputs, chips — elements with predictable content.

### Content-First (Strict Padding)
Padding is 16px top/bottom. Element height varies with content.
Best for: Cards, table cells, text containers — elements with variable content.

## Grid Systems

### 12-Column Grid

The 12-column grid is standard because 12 divides evenly by 2, 3, 4, and 6.

| Viewport | Columns | Gutter | Margin | Max Width |
|:---------|:--------|:-------|:-------|:----------|
| Mobile (< 640px) | 4 | 16px | 16px | 100% |
| Tablet (640-1024px) | 8 | 24px | 24px | 100% |
| Desktop (1024-1440px) | 12 | 24px | 32px | 1280px |
| Wide (> 1440px) | 12 | 32px | auto | 1440px |

### Responsive Breakpoints

| Token | Value | Target |
|:------|:------|:-------|
| `breakpoint-sm` | 640px | Large phones, landscape |
| `breakpoint-md` | 768px | Tablets portrait |
| `breakpoint-lg` | 1024px | Tablets landscape, small laptops |
| `breakpoint-xl` | 1280px | Laptops, desktops |
| `breakpoint-2xl` | 1536px | Large desktops |

### Container Max Widths

| Token | Value | Use |
|:------|:------|:----|
| `container-sm` | 640px | Narrow content (forms, text) |
| `container-md` | 768px | Articles, blog posts |
| `container-lg` | 1024px | Standard page content |
| `container-xl` | 1280px | Full-width dashboards |
| `container-2xl` | 1440px | Maximum content width |

## Layout Patterns

### Stack (Vertical)
Items arranged vertically with consistent gap. Use `spacing-4` (16px) as default gap.

### Row (Horizontal)
Items arranged horizontally. Use `spacing-3` (12px) for related items, `spacing-6` (24px) for distinct groups.

### Sidebar Layout
Main content + fixed-width sidebar. Sidebar width: 240-320px. Gap: `spacing-6` (24px).

### Grid Layout
Auto-fill grid for cards. Minimum card width: 280px. Gap: `spacing-4` to `spacing-6`.

## Box Sizing

Always use `box-sizing: border-box` globally. This means padding and borders are included in the element's total width/height, matching how Figma measures elements.

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```
