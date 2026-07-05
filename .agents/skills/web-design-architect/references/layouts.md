# Reference Guide: Web Design Layouts & Spatial Structures

This document serves as the layout and spatial organization reference for the Web Design Architect. Use these patterns to guide spatial planning, viewport density, and visual scan direction.

---

## Part 1: Visual Scanning Patterns

Understanding user eye movement is critical for choosing layout structure:

### 1. F-Shape Pattern (Text & Content-Heavy)
*   **Visual scanning path:**
    ```
    [1] ========> [2] (Scan top header/logo to nav)
    |
    [3] =====> (Scan down left edge, read shorter middle bar)
    |
    [4] (Continue reading down the left vertical margin)
    ```
*   **Description:** Users scan horizontally across the top, down the left edge, across a shorter horizontal line in the middle, and then down.
*   **Use Cases:** Blogs, search engine results pages, news article directories.

### 2. Z-Shape Pattern (Conversion-Centric / Hero Pages)
*   **Visual scanning path:**
    ```
    [1] ================> [2] (Scan Logo/Nav to top-right CTA)
                       /
                     /
                   /
                 /
    [3] ================> [4] (Scan diagonally to product image, read bottom CTA)
    ```
*   **Description:** Traces eye path in a Z pattern: top-left to top-right, diagonally down to the bottom-left, and horizontally to the bottom-right.
*   **Use Cases:** Simple landing pages, promotional campaigns, single-button SaaS homepages.

---

## Part 2: The 12 Standard Web Layouts

Use these formats to map out page-level structures based on user intent:

### Two-column Layout
*   **Visual Map:**
    ```
    +---------+---------------------------------+
    | Sidebar | Main Workspace Content          |
    | (240px) |                                 |
    +---------+---------------------------------+
    ```
*   **UX Description:** Left column serves as sidebar navigation/filters; wide right content pane houses primary workspaces.
*   **CSS Recipe:** `grid-template-columns: 240px 1fr;`

### Split Screen Layout
*   **Visual Map:**
    ```
    +-------------------+-------------------+
    | Left Content (50%)| Right Content(50%)|
    +-------------------+-------------------+
    ```
*   **UX Description:** 50/50 vertical division offering equal visual balance. Ideal for logins, signups, or plan comparisons.
*   **CSS Recipe:** `grid-template-columns: 1fr 1fr;`

### Asymmetrical Layout
*   **Visual Map:**
    ```
    +-------------------------+---------+
    | Primary Highlight (75%) | Sec(25%)|
    +-------------------------+---------+
    ```
*   **UX Description:** Uneven column groupings to create focus on a primary focal block (usually highlighted in accent color).
*   **CSS Recipe:** `grid-template-columns: 3fr 1fr;`

### Card or Block Layout
*   **Visual Map:**
    ```
    +---------+  +---------+  +---------+
    | Card 1  |  | Card 2  |  | Card 3  |
    +---------+  +---------+  +---------+
    ```
*   **UX Description:** Modular responsive grid of uniform blocks.
*   **CSS Recipe:** `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));`

### Featured Media Layout
*   **Visual Map:**
    ```
    +---------------------------------+---------+
    | Primary Video/Image Showcase    | Text/   |
    | (70% Width)                     | CTA     |
    +---------------------------------+---------+
    ```
*   **UX Description:** Places massive visual weight on a central video or graphic, flanked by secondary descriptive metadata.
*   **CSS Recipe:** `grid-template-columns: 7fr 3fr;`

---

## Part 3: The 30 Grid & Screen Layout catalog

Apply these spatial patterns to specific components or pages:

1.  **Grid:** Columns and rows of equal width/height (galleries, shop lists).
2.  **Stacked:** Vertical stacked blocks stretching 100% width (mobile screens, feeds).
3.  **Tabbed:** Separated content views switched by horizontal buttons.
4.  **Card-based:** Standalone cards grouping media, headers, description text, and actions.
5.  **FAB (Floating Action Button):** Hovering circle in corner for primary commands (e.g. Compose).
6.  **Split Screen:** Screen split into two or more equal panels.
7.  **Liquid/Responsive:** Dynamic viewport scaling, wrapping, and grid reconfiguration.
8.  **Full-screen:** Immersive 100vh image/video background overlay.
9.  **Masonry:** Columns with variable block heights.
10. **Overlay:** Temporary popover layer (modal dialog, alert, cookie policy).
11. **Circular:** Radial button arrangement around a central point (smartwatch/game picking).
12. **Canvas:** Infinite zoomable drag-and-drop board (Miro, Figma).
13. **Multi-panel:** Collapsible toolbars, sidebar panels, and edit workspaces (VS Code, Photoshop).
14. **Hierarchical:** Tree diagrams, parent-child flows, sitemaps.
15. **Scattered/Freeform:** Overlapping creative layouts without rigid grids.
16. **Infinite Scroll:** Continuous ajax-loaded content lists (Twitter, Instagram).
17. **Ribbon:** Horizontal category/toolbar directly below main header (Word, Excel).
18. **Timeline:** Alternating chronological cards along a vertical track.
19. **Parallax:** Scrolling foreground layer moves faster than background depth.
20. **Fixed Sidebar:** Navigation sidebar remains locked while content scrolls.
21. **Sticky Header/Footer:** Sticky top header and sticky bottom toolbar.
22. **Off-canvas:** Hidden sidebar sliding in from edge on click.
23. **Cover Flow:** 3D carousel rendering cover sheets at angles.
24. **Stepped/Nested:** Progressive wizard steps (form checkouts, onboarding steps).
25. **Catalog:** Standard retail listing of cards with images, prices, and buy buttons.
26. **Empty State:** UI layout shown when cart/feed is empty (encourages call-to-actions).
27. **Map-based:** Fullscreen map canvas with pinning overlay controls.
28. **Comparison:** Columns aligned side-by-side with features checked (pricing plan sheet).
29. **Form-based:** Single column vertical stack of input fields.
30. **Chat-based:** Message thread list with input footer box.

---

## Part 4: CSS Container Queries (Component-Level Responsiveness)

Use container queries to make components adapt contextually based on parent size, not viewport width:

### 1. Establish Container Context
Apply `container-type` to parent wrappers:
```css
.card-wrapper-container {
  container-type: inline-size;
  container-name: product-card-container;
}
```

### 2. Style Based on Parent Width
```css
/* Mobile view by default (narrow container) */
.product-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

/* Horizontal card in wider layout slots */
@container product-card-container (min-width: 450px) {
  .product-card {
    flex-direction: row;
    align-items: center;
    gap: var(--space-md);
  }
  .product-card-image {
    width: 150px;
    height: 150px;
  }
}
```

---

## Part 5: Localization & RTL (Right-to-Left) Layout Mirroring

To make layouts globally accessible and ready for RTL languages (Arabic, Hebrew), never use absolute directional properties. Enforce modern **CSS Logical Properties**:

### 1. Logical Spacing & Positioning
Instead of physical directions (`left`/`right`), use logical properties which automatically flip when the document's `<html dir="rtl">` attribute changes:

| Physical CSS Property | Modern Logical CSS Equivalent |
| :--- | :--- |
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `padding-left` | `padding-inline-start` |
| `padding-right` | `padding-inline-end` |
| `left` | `inset-inline-start` |
| `right` | `inset-inline-end` |
| `text-align: left` | `text-align: start` |
| `text-align: right` | `text-align: end` |
| `border-left` | `border-inline-start` |
| `border-right` | `border-inline-end` |

### 2. Flexbox & Grid Adaptation
Flexbox directions and Grid columns naturally flow start-to-end based on the document direction. Avoid using absolute float structures. Ensure column order flips logically by relying on native CSS Grid tracks.
