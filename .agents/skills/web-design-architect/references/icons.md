# Reference Guide: Typography, Colors & Iconography Styles

This document outlines standard visual tokens, color rules, typography hierarchies, and the 10 icon styles.

---

## Part 1: Design Tokens CSS Boilerplate

Copy and paste these CSS properties into your core stylesheet (e.g. `index.css`) to scaffold your design system:

```css
:root {
  /* --- Spacing Scale (8px Grid steps) --- */
  --space-xs: 0.25rem;  /* 4px */
  --space-sm: 0.5rem;   /* 8px */
  --space-md: 1rem;     /* 16px */
  --space-lg: 1.5rem;   /* 24px */
  --space-xl: 2rem;     /* 32px */
  --space-2xl: 3rem;    /* 48px */
  --space-3xl: 4rem;    /* 64px */

  /* --- Typography Scale --- */
  --font-family-sans: 'Inter', -apple-system, sans-serif;
  --font-family-display: 'Outfit', sans-serif;
  
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.25rem;    /* 20px */
  --text-xl: 1.5rem;     /* 24px */
  --text-2xl: 2.25rem;   /* 36px */
  --text-3xl: 3.5rem;    /* 56px */

  /* --- Primitive Colors (Hardcoded Tones) --- */
  --color-violet-500: hsl(262, 80%, 50%);
  --color-violet-600: hsl(262, 80%, 42%);
  --color-slate-100: hsl(210, 20%, 96%);
  --color-slate-900: hsl(222, 47%, 10%);
  --color-white: hsl(0, 0%, 100%);

  /* --- Semantic Colors (Meaningful Intent Aliases) --- */
  --bg-60: var(--color-slate-100);       /* 60% Dominant Base */
  --text-30: var(--color-slate-900);     /* 30% Structural Text */
  --card-30: var(--color-white);         /* 30% Card container */
  --accent-10: var(--color-violet-500);  /* 10% Accent CTA */
  --accent-hover: var(--color-violet-600);
  --focus-ring: hsla(262, 80%, 50%, 0.4);

  /* --- Component Colors (Object-Specific Mapping) --- */
  --button-primary-bg: var(--accent-10);
  --button-primary-bg-hover: var(--accent-hover);
  --button-primary-text: var(--color-white);

  /* --- Shadows --- */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

  /* --- Border Radii --- */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark Mode Color System Override */
    --bg-60: var(--color-slate-900);      /* Deep Charcoal Blue */
    --text-30: var(--color-slate-100);    /* Slate white */
    --card-30: hsl(222, 47%, 14%);        /* Elevated Dark Card */
    --accent-10: hsl(262, 80%, 58%);      /* Vivid Accent CTA */
    --accent-hover: hsl(262, 80%, 65%);
  }
}
```

---

## Part 1.5: TailwindCSS Configuration Mapping

To map the design tokens to **TailwindCSS**, extend your `tailwind.config.js` to inherit the semantic CSS variables:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  darkMode: 'media', // syncs with system theme
  theme: {
    extend: {
      colors: {
        // Semantic HSL variable mappings
        base60: 'var(--bg-60)',
        text30: 'var(--text-30)',
        card30: 'var(--card-30)',
        accent10: 'var(--accent-10)',
        'accent-hover': 'var(--accent-hover)',
      },
      spacing: {
        // Spacing scale mapping
        xs: 'var(--space-xs)',   // 4px
        sm: 'var(--space-sm)',   // 8px
        md: 'var(--space-md)',   // 16px
        lg: 'var(--space-lg)',   // 24px
        xl: 'var(--space-xl)',   // 32px
        '2xl': 'var(--space-2xl)', // 48px
        '3xl': 'var(--space-3xl)', // 64px
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      }
    },
  },
  plugins: [],
}
```

---

## Part 2: Typography Guidelines

*   **Font Pairing Examples:**
    *   *SaaS/Tech:* **Outfit** (headings) paired with **Inter** (body text).
    *   *Creative/Editorial:* **Playfair Display** (headings) paired with **Open Sans** or **Lato** (body text).
*   **Reading Optimization Rules:**
    *   Set body lines to maximum width of `65ch` (characters) for comfortable line lengths.
    *   Keep body line-height at `1.6` to ensure spacing between rows.

---

## Part 3: Responsive SVG Guidelines

When writing SVGs inline for icons or graphics:
1.  **Never hardcode fixed `width` or `height` attributes** on the parent `<svg>` tag. This breaks fluid scaling.
2.  **Always specify the `viewBox` attribute** (e.g. `viewBox="0 0 24 24"`) so the browser knows the coordinate system ratio.
3.  **Set dimensions in CSS** or parent classes:
    ```html
    <svg viewBox="0 0 24 24" class="icon-primary" fill="currentColor">
      <path d="..." />
    </svg>
    ```
    ```css
    .icon-primary {
      width: 1.5rem;  /* 24px */
      height: 1.5rem;
      transition: fill 0.2s ease;
    }
    ```

4.  **Optimize SVG Files:** If you are importing SVG graphic assets or icons from vector editors (Figma, Illustrator), clean and optimize them using the bundled script `scripts/optimize_svg.py` to strip metadata, delete fixed width/height attributes, and compute fluid `viewBox` coordinates:
    *   *Usage:* `python scripts/optimize_svg.py path/to/icon.svg [path/to/output.svg]`

---

## Part 4: The 10 Icon Styles

Select iconography based on layout tone:

| Style Name | Description & Key Visuals | Typical Use Cases | SVG / CSS Code Implementation Recipe |
| :--- | :--- | :--- | :--- |
| **1. Linear** | Clean consistent strokes, transparent fill. | SaaS dashboards, navigation menus. | Set `fill="none"` and `stroke="currentColor" stroke-width="2"`. |
| **2. Bold** | Solid filled silhouettes. High contrast. | Selected nav items, active CTAs. | Set `fill="currentColor" stroke="none"`. |
| **3. Duo Color** | Linear outlines using two distinct colors. | Subtle branding highlights. | Separate SVG groups with primary and secondary color classes. |
| **4. Bulk** | Solid accents (e.g. dark lid) + 15% opacity matching fill for body. | Soft, friendly modern UIs. | `fill="currentColor" fill-opacity="0.15"` for body, `opacity="1"` for lids. |
| **5. Gestalt** | Fragmented open paths relying on proximity. | Portfolios, luxury brands. | Manual coordinate SVGs with gap segments. |
| **6. 3D** | High fidelity models with textures and reflections. | Landing pages, key hero banners. | Rendered WebP/PNG assets with lighting maps. |
| **7. Skeuomorphic** | Realistic glass/wood/plastic with shadows/depth. | Desktop OS bins, simulation apps. | Nested shadows, inner gradients. |
| **8. Clay** | Claymorphism. Puffed-up matte look with inner highlights. | Web3 sites, playful mobile apps. | CSS: `box-shadow: inset 3px 3px 5px rgba(255,255,255,0.4), inset -3px -3px 5px rgba(0,0,0,0.15), 5px 5px 10px rgba(0,0,0,0.1)`. |
| **9. Illustrated** | Storytelling flat cartoons with offsets & coloring. | Tutorial steps, empty state cards. | Multi-element custom filled vectors. |
| **10. Glassy** | Glassmorphism. Frosted glass, white borders. | Dark mode dashboards, fintech apps. | CSS: `backdrop-filter: blur(12px); background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15)`. |
