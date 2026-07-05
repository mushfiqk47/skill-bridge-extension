# Cal.com Design System

Cal.com's marketing surface is a clean, friendly modern-SaaS interface anchored on a white canvas with black primary CTAs, custom **Cal Sans** display typography, and light-gray cards holding product UI fragments. This document serves as a machine-readable and human-friendly guide to implementing the system.

---

## 🎨 Color System

### Primitives
These are the raw, HSL-grounded hexadecimal colors that form the foundation of our theme.

| Primitive Token | Hex Value | Role |
| :--- | :--- | :--- |
| `color.primitive.black` | `#111111` | Primary ink for typography and dark elements |
| `color.primitive.dark-gray` | `#242424` | Active state for black components |
| `color.primitive.near-black` | `#101010` | Dark footer and featured card background |
| `color.primitive.elevated-black` | `#1a1a1a` | Elevated components in dark containers |
| `color.primitive.light-gray` | `#f5f5f5` | Standard card surface backgrounds |
| `color.primitive.off-white` | `#f8f9fa` | Soft background borders and pill containers |
| `color.primitive.white` | `#ffffff` | Page canvas floor |
| `color.primitive.hairline-gray` | `#e5e7eb` | Outlines and table dividers |
| `color.primitive.hairline-soft` | `#f3f4f6` | Muted hairline section borders |
| `color.primitive.electric-blue` | `#3b82f6` | Brand blue highlight (used sparingly) |
| `color.primitive.pastel-orange` | `#fb923c` | Testimonial ratings and warning accents |
| `color.primitive.pastel-pink` | `#ec4899` | Category pill options |
| `color.primitive.pastel-violet` | `#8b5cf6` | Category pill options |
| `color.primitive.pastel-emerald` | `#34d399` | Category pill options |

### Semantic Mappings
Semantic tokens give meaning to colors regardless of theme mode.

- **`ink`**: `{color.primitive.black}` — Headings, body titles, active text
- **`body`**: `#374151` — Primary reading paragraphs
- **`muted`**: `#6b7280` — Secondary text, labels, breadcrumbs
- **`muted-soft`**: `#898989` — Fine-print, copyright text
- **`canvas`**: `{color.primitive.white}` — Light page floor
- **`surface-soft`**: `{color.primitive.off-white}` — Nav pill containers
- **`surface-card`**: `{color.primitive.light-gray}` — Card fills, testimonials
- **`surface-strong`**: `{color.primitive.hairline-gray}` — Outlines, borders
- **`surface-dark`**: `{color.primitive.near-black}` — Dark footer, dark card backgrounds
- **`surface-dark-elevated`**: `{color.primitive.elevated-black}` — Cards inside dark surfaces
- **`hairline`**: `{color.primitive.hairline-gray}` — Standard 1px border lines
- **`hairline-soft`**: `{color.primitive.hairline-soft}` — Soft section divider borders
- **`brand-accent`**: `{color.primitive.electric-blue}` — Hyperlink colors, inline accent badges
- **`success`**: `#10b981` — Product status greens
- **`warning`**: `#f59e0b` — Orange validation warnings
- **`error`**: `#ef4444` — Destructive action alerts, error flags
- **`on-primary`**: `{color.primitive.white}` — Labels on black actions
- **`on-dark`**: `{color.primitive.white}` — Text inside dark panels
- **`on-dark-soft`**: `#a1a1aa` — Muted labels inside dark panels

---

## 🔤 Typography System

The system uses **Cal Sans** (600 weight, negative letter-spacing) for display headlines and **Inter** for UI, body reading, and button labels.

### Font Substitutes
If Cal Sans is not available, use:
- **Inter** (weight 600) with `-0.04em` letter-spacing
- **Manrope** (weight 700) with `-0.02em` letter-spacing

### Typography Tokens

| Token Name | Family | Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `typography.display-xl` | Cal Sans | 64px | 600 | 1.05 | -2.0px |
| `typography.display-lg` | Cal Sans | 48px | 600 | 1.10 | -1.5px |
| `typography.display-md` | Cal Sans | 36px | 600 | 1.15 | -1.0px |
| `typography.display-sm` | Cal Sans | 28px | 600 | 1.20 | -0.5px |
| `typography.title-lg` | Inter | 22px | 600 | 1.30 | -0.3px |
| `typography.title-md` | Inter | 18px | 600 | 1.40 | 0.0px |
| `typography.title-sm` | Inter | 16px | 600 | 1.40 | 0.0px |
| `typography.body-md` | Inter | 16px | 400 | 1.50 | 0.0px |
| `typography.body-sm` | Inter | 14px | 400 | 1.50 | 0.0px |
| `typography.caption` | Inter | 13px | 500 | 1.40 | 0.0px |
| `typography.code` | JetBrains Mono | 14px | 400 | 1.50 | 0.0px |
| `typography.button` | Inter | 14px | 600 | 1.00 | 0.0px |
| `typography.nav-link` | Inter | 14px | 500 | 1.40 | 0.0px |

---

## 📐 Spacing & Layout

We enforce a 4px baseline unit with an 8pt dynamic spacer grid.

- **`spacing.xxs`**: 4px — In-badge margins, micro gaps
- **`spacing.xs`**: 8px — Button icons padding, small details
- **`spacing.sm`**: 12px — Group lists margins
- **`spacing.md`**: 16px — Text fields margins, list columns
- **`spacing.lg`**: 24px — Testimonials cards padding
- **`spacing.xl`**: 32px — Main cards inner margins, pricing gaps
- **`spacing.xxl`**: 48px — Pre-footer content bands padding
- **`spacing.section`**: 96px — Vertical gap between page segments

---

## 🟢 Shapes & Radii

A hierarchical radius scale organizes UI elements by size.

- **`rounded.xs`**: 4px — Micro inputs, small flags
- **`rounded.sm`**: 6px — Small actions, dropdown panels
- **`rounded.md`**: 8px — Primary buttons, text inputs, field borders
- **`rounded.lg`**: 12px — Standard cards (features, testimonials, pricing)
- **`rounded.xl`**: 16px — Hero mockup containers, video frames
- **`rounded.pill`**: 9999px — Nav pill outlines, badge pill shapes
- **`rounded.full`**: 9999px — Circular avatars, icon indicators

---

## 🧱 Component Specifications

The design system maps out 26 distinct components.

### 1. Buttons & Links

| Component Key | Background Color | Text Color | Typography | Radius | Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `button-primary` | `{color.semantic.ink}` | `{color.semantic.on-primary}` | `{typography.button}` | `{rounded.md}` | Confident black action pill |
| `button-primary-active` | `{color.primitive.dark-gray}` | `{color.semantic.on-primary}` | `{typography.button}` | `{rounded.md}` | Action active state |
| `button-primary-disabled` | `{color.semantic.surface-strong}` | `{color.semantic.muted}` | `{typography.button}` | `{rounded.md}` | Greyed-out state |
| `button-secondary` | `{color.semantic.canvas}` | `{color.semantic.ink}` | `{typography.button}` | `{rounded.md}` | Hairline border outline |
| `button-icon-circular` | `{color.semantic.canvas}` | `{color.semantic.ink}` | — | `{rounded.full}` | 36x36px circle icon |
| `button-text-link` | `transparent` | `{color.semantic.ink}` | `{typography.button}` | — | Borderless text action |
| `text-link` | `transparent` | `{color.semantic.ink}` | `{typography.body-md}` | — | Inline text link, underline on hover |

### 2. Navigation & Layout Bands

| Component Key | Background Color | Text Color | Typography | Radius | Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `top-nav` | `{color.semantic.canvas}` | `{color.semantic.ink}` | `{typography.nav-link}` | — | Pinned header bar, 64px height |
| `nav-pill-group` | `{color.semantic.surface-soft}` | `{color.semantic.ink}` | `{typography.nav-link}` | `{rounded.pill}` | Inner wrapper around switch tabs |
| `hero-band` | `{color.semantic.canvas}` | `{color.semantic.ink}` | `{typography.display-xl}` | — | Top hero layout panel |
| `cta-band-light` | `{color.semantic.surface-card}` | `{color.semantic.ink}` | `{typography.display-sm}` | `{rounded.lg}` | Pre-footer marketing segment |
| `footer` | `{color.semantic.surface-dark}` | `{color.semantic.on-dark-soft}` | `{typography.body-sm}` | — | Deep near-black footer |

### 3. Display Cards

| Component Key | Background Color | Text Color | Typography | Radius | Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `hero-app-mockup-card` | `{color.semantic.canvas}` | `{color.semantic.ink}` | — | `{rounded.xl}` | Holds standard calendar widget |
| `feature-card` | `{color.semantic.surface-card}` | `{color.semantic.ink}` | `{typography.title-md}` | `{rounded.lg}` | Standard 3-up features block |
| `feature-icon-card` | `{color.semantic.canvas}` | `{color.semantic.ink}` | `{typography.title-sm}` | `{rounded.lg}` | Simple icon border card |
| `product-mockup-card` | `{color.semantic.canvas}` | `{color.semantic.ink}` | — | `{rounded.lg}` | Container showing product screenshots |
| `testimonial-card` | `{color.semantic.surface-card}` | `{color.semantic.ink}` | `{typography.body-md}` | `{rounded.lg}` | Customer recommendation grid card |
| `pricing-tier-card` | `{color.semantic.canvas}` | `{color.semantic.ink}` | `{typography.title-lg}` | `{rounded.lg}` | Default pricing grid card |
| `pricing-tier-card-featured` | `{color.semantic.surface-dark}` | `{color.semantic.on-dark}` | `{typography.title-lg}` | `{rounded.lg}` | Team plan inversion card |

### 4. Interactive & Decorative UI Primitives

| Component Key | Background Color | Text Color | Typography | Radius | Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `text-input` | `{color.semantic.canvas}` | `{color.semantic.ink}` | `{typography.body-md}` | `{rounded.md}` | Input form field, 1px border |
| `text-input-focused` | `{color.semantic.canvas}` | `{color.semantic.ink}` | `{typography.body-md}` | `{rounded.md}` | Darkened borders indicator |
| `category-tab` | `transparent` | `{color.semantic.muted}` | `{typography.nav-link}` | `{rounded.md}` | Inactive navigation sub-pill |
| `category-tab-active` | `{color.semantic.canvas}` | `{color.semantic.ink}` | `{typography.nav-link}` | `{rounded.md}` | White-filled pill inside parent switcher |
| `avatar-circle` | `{color.semantic.surface-card}` | `{color.semantic.ink}` | `{typography.caption}` | `{rounded.full}` | 36px circular avatar placeholder |
| `badge-pill` | `{color.semantic.surface-card}` | `{color.semantic.ink}` | `{typography.caption}` | `{rounded.pill}` | Horizontal category/tag identifier |
| `rating-stars` | `transparent` | `{color.primitive.pastel-orange}`| `{typography.caption}` | — | Testimonial quality rating stars |
