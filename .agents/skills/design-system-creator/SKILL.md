---
name: design-system-creator
description: Create complete, production-grade design systems from scratch or from existing inputs (brand briefs, URLs, images, JSON tokens, Figma files, or text descriptions). Generates W3C DTCG-compatible design tokens JSON, DESIGN.md reference documents, CSS custom properties, component specifications, and multi-mode theming (light/dark/high-contrast). Use this skill whenever a user asks to create a design system, build a token architecture, generate design tokens, set up a component library foundation, establish brand guidelines for code, create a style guide, scaffold a UI kit, define a visual language, or architect a design system from scratch. Also use when users want to convert a brand brief or mood board into implementable design decisions, or when they ask for a "design system" for any project regardless of framework. Even if the user just says "create a design system" or "set up tokens for my project", this skill applies.
---

# Design System Creator

Create enterprise-grade design systems that bridge the gap between design intent and code implementation. This skill produces multi-format deliverables following industry best practices from [designsystems.com](https://www.designsystems.com/) (Figma's official publication), the W3C Design Tokens Community Group specification, and patterns from leading open systems like Material 3, GitHub Primer, IBM Carbon, and Salesforce Lightning.

## What This Skill Produces

Every design system you create includes these deliverables:

1. **`tokens.json`** — W3C DTCG-compatible design tokens with 3-tier architecture (Primitive → Semantic → Component)
2. **`DESIGN.md`** — Human and AI-readable design system reference document
3. **`variables.css`** — CSS custom properties with light/dark/high-contrast mode support
4. **Component Specification Tables** — Exact values, states, and anatomy for each component

## When to Use This Skill

Use when the user wants to:
- Create a design system from scratch for a new project
- Convert a brand brief, mood board, or style guide into implementable tokens
- Generate a full token architecture with theming support
- Build a design foundation before creating UI components
- Standardize visual decisions across a team or product

Read the appropriate reference files from `references/` when you need deeper guidance on any pillar.

---

## The Process

### Phase 1: Understand the Brief

Before generating anything, gather context. Adapt your questions based on what the user has already provided — skip what's obvious, ask what's ambiguous.

**Brand & Personality:**
- What industry/domain is this for? (SaaS, e-commerce, healthcare, creative, etc.)
- What personality should the system convey? (formal ↔ playful, minimal ↔ rich, technical ↔ approachable)
- Are there existing brand assets? (logo, colors, fonts, guidelines)

**Technical Scope:**
- Target platforms? (web only, web + mobile, cross-platform)
- Framework preferences? (React, Vue, vanilla CSS, Tailwind, etc.)
- Does the system need multi-brand or white-label support?

**Theming Requirements:**
- Light and dark modes? (default: yes, both)
- High contrast / accessibility mode?
- Custom brand modes?

**Scale:**
- How many components are needed initially? (start small: 8-12 core, or comprehensive: 25+)
- Is this for a startup MVP or enterprise-scale product?

If the user provides minimal input (e.g., "create a design system for a fintech app"), make intelligent defaults based on the domain and note your assumptions explicitly.

### Phase 2: Generate the Design System

Follow this 7-step pipeline. For each step, read the corresponding reference file from `references/` if you need detailed guidance.

---

#### Step 1: Color System
**Reference:** `references/color-system.md`

Generate a complete color system with three tiers:

**Tier 1 — Primitives** (raw palette values):
- Generate a harmonious palette of 8-12 hues, each with 10 shades (50-950)
- Use HSL-based generation for mathematical consistency
- Include a neutral gray ramp (10 shades minimum)

**Tier 2 — Semantic Roles** (what colors mean):
- Map primitives to roles: `primary`, `secondary`, `tertiary`, `success`, `warning`, `error`, `info`
- Define surface roles: `background`, `surface`, `surface-elevated`, `surface-overlay`
- Define text roles: `on-primary`, `on-secondary`, `on-surface`, `on-background`, `muted`, `disabled`
- Define border roles: `border-default`, `border-subtle`, `border-strong`, `border-focus`

**Tier 3 — Component** (specific assignments):
- Map semantic roles to components: `button-primary-bg`, `button-primary-bg-hover`, `input-border-focus`, etc.

**Multi-mode mapping:**
- Define all three tiers for each mode (light, dark, high-contrast)
- Dark mode is NOT just inverted light — re-map semantic tokens thoughtfully
- High-contrast mode should meet WCAG AAA (7:1 contrast ratio)

All colors must pass WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text). Verify critical pairs.

---

#### Step 2: Typography System
**Reference:** `references/typography-system.md`

- **Font Selection**: Choose 1-2 typeface families (1 for headings, 1 for body — or 1 for both if it has sufficient weight range)
- **Type Scale**: Use a modular scale ratio (e.g., 1.25 Major Third, 1.333 Perfect Fourth) to generate sizes
- **Weight System**: Define 3-4 weights maximum (Regular 400, Medium 500, Semibold 600, Bold 700)
- **Line Heights**: All line-heights must be divisible by 4 (for 4pt baseline grid compatibility)
- **Responsive Rules**: Define how the scale adjusts at breakpoints (typically only display/heading sizes change)

Minimum type scale definitions:
| Token | Role | Typical Size |
|:------|:-----|:-------------|
| `display-large` | Hero headlines | 48-72px |
| `display-small` | Section heroes | 36-48px |
| `heading-1` | Page titles | 28-36px |
| `heading-2` | Section headers | 22-28px |
| `heading-3` | Subsection headers | 18-22px |
| `body-large` | Emphasized body text | 18px |
| `body` | Standard body text | 16px |
| `body-small` | Secondary text | 14px |
| `label` | Button text, form labels | 14px |
| `caption` | Helper text, timestamps | 12px |
| `overline` | Category labels, tags | 10-12px |

---

#### Step 3: Spacing & Layout System
**Reference:** `references/spacing-and-grids.md`

- **Base Unit**: 4px (with primary scale at 8px increments)
- **Spacing Scale**: `0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128`
- **Naming Convention**: Use t-shirt sizes (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`) or numeric (`spacing-1` through `spacing-16`)
- **Layout Rules**:
  - Container max-widths: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1440px`
  - Column grid: 12-column for desktop, 4-column for mobile
  - Gutter widths: 16px mobile, 24px tablet, 32px desktop
- **Responsive Breakpoints**: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1536px`

---

#### Step 4: Elevation & Motion
**Reference:** `references/elevation-and-motion.md`

**Elevation (Shadows):**
- Define 5-6 elevation levels (0 = flat, 5 = floating overlay)
- Each level has a shadow definition: `offset-x offset-y blur spread color`
- Dark mode shadows use deeper, more diffuse values (not just darker)

**Border Radius:**
- Define a radius scale: `none: 0`, `sm: 4px`, `md: 8px`, `lg: 12px`, `xl: 16px`, `full: 9999px`

**Motion Tokens:**
- Duration scale: `instant: 100ms`, `fast: 200ms`, `normal: 300ms`, `slow: 500ms`, `glacial: 800ms`
- Easing curves: `ease-in`, `ease-out`, `ease-in-out`, `spring` (define cubic-bezier values)
- Default transition: `all 200ms ease-in-out`

---

#### Step 5: Iconography Specification
**Reference:** `references/iconography.md`

Don't design individual icons — define the system rules:
- **Base Size**: 24px (with variants at 16, 20, 24, 32, 40)
- **Grid**: Icons built on pixel grid aligned to base unit
- **Stroke Weight**: 1.5-2px for outlined style
- **Style**: Consistent (all outlined OR all filled, never mixed)
- **Color**: Single color, inherits from text color token
- **Naming**: `icon-{category}-{name}` (e.g., `icon-nav-home`, `icon-action-edit`)
- **Recommended Library**: Suggest an icon library matching the system's style (e.g., Lucide, Phosphor, Material Symbols)

---

#### Step 6: Component Specifications
**Reference:** `references/component-specs.md`

Define the core component set with exact token references for every property and state:

**Minimum Core Components** (always include):
1. Button (primary, secondary, tertiary, destructive, ghost)
2. Input (text, textarea, select, checkbox, radio, toggle)
3. Card (container, interactive, elevated)
4. Badge / Tag / Chip
5. Avatar
6. Alert / Toast / Notification
7. Modal / Dialog
8. Tooltip
9. Navigation (navbar, sidebar, breadcrumb, tabs)
10. List / Table

For each component define:
- **Anatomy**: Visual breakdown of parts (container, label, icon, etc.)
- **Variants**: Size variants (sm, md, lg), style variants
- **States**: Default, hover, active/pressed, focused, disabled, loading, error
- **Token Mapping**: Exact token references for bg, text, border, padding, radius per variant+state
- **Accessibility**: Required ARIA attributes, keyboard behavior, focus order

---

#### Step 7: Accessibility Compliance
**Reference:** `references/accessibility-checklist.md`

Verify and document:
- All text/background pairs meet WCAG AA (4.5:1) — flag any that don't
- Focus indicators are visible (minimum 2px outline with 3:1 contrast against adjacent colors)
- Touch targets are minimum 44×44px on mobile
- Interactive elements are keyboard-navigable
- Color is never the sole indicator of state (use icons, text, patterns)
- Define `prefers-reduced-motion` behavior for all motion tokens
- Include `prefers-contrast: more` mappings for high-contrast mode

---

### Phase 3: Output the Deliverables

Generate the following files in the user's project directory:

#### 1. `design-system/tokens.json`
W3C DTCG-compatible JSON with `$value`, `$type`, `$description` properties. Use the template from `templates/tokens.template.json` as the structural starting point. Include all three tiers and all modes.

#### 2. `design-system/DESIGN.md`
Use the template from `templates/design-system.template.md`. This should be a comprehensive but scannable reference document that any AI coder or human developer can use to implement the system correctly.

#### 3. `design-system/variables.css`
CSS custom properties organized by category with `@media (prefers-color-scheme: dark)` and `[data-theme="dark"]` support. Use the template from `templates/css-variables.template.css`.

#### 4. Component specs
Include inline in DESIGN.md or as a separate `design-system/components.md` if the system is large.

---

### Phase 4: Review & Iterate

After generating, proactively review your own output:

1. **Contrast Check**: Verify every text/surface color pair passes WCAG AA
2. **Token Consistency**: Ensure no hardcoded values — every component spec references a token
3. **Completeness**: Verify all modes have complete token coverage (no missing dark mode values)
4. **Naming Consistency**: All tokens follow the same naming convention throughout
5. **Cross-references**: DESIGN.md, tokens.json, and variables.css should tell the same story

Present a summary to the user showing:
- Total tokens generated (primitives, semantics, components)
- Components specified
- Modes supported
- Any assumptions made
- Recommended next steps (implementation, Figma setup, etc.)

---

## Adapting to Input Type

The skill handles different starting points:

**From scratch (no input):**
Use the interview questions. Make smart defaults and document every assumption.

**From a URL:**
Visit the site, extract the existing visual language, then enhance it into a proper system with full token architecture. Cross-reference with the `extract-design-system` skill patterns.

**From a brand brief / description:**
Parse the brand adjectives and constraints, translate them into visual decisions.

**From existing tokens (JSON):**
Parse the input, identify gaps, restructure into 3-tier architecture, add missing modes.

**From a Figma file (if Figma MCP is available):**
Use `get_design_context` and `get_variable_defs` to extract existing design decisions, then systematize and fill gaps.

---

## Quality Standards

A design system produced by this skill should be:

- **Complete**: No placeholder values — every token has a real, considered value
- **Consistent**: Naming conventions are uniform, values follow mathematical scales
- **Semantic**: Every value has a clear purpose documented via `$description` or `Usage:` tags
- **Accessible**: WCAG AA minimum, with AAA high-contrast mode available
- **Themeable**: Light and dark modes at minimum, with architecture supporting additional modes
- **Implementable**: A developer should be able to implement from the output without ambiguity
- **Portable**: W3C DTCG JSON is tool-agnostic — works with Style Dictionary, Figma, any framework

---

## Reference Files

Read these when you need deeper guidance on a specific pillar. Don't load them all upfront — read on demand.

| File | When to Read |
|:-----|:-------------|
| `references/token-architecture.md` | When structuring the 3-tier token system |
| `references/color-system.md` | When generating the color palette and modes |
| `references/typography-system.md` | When defining the type scale and font decisions |
| `references/spacing-and-grids.md` | When defining spatial rules and layout grids |
| `references/iconography.md` | When specifying the icon system |
| `references/elevation-and-motion.md` | When defining shadows, radius, and animations |
| `references/component-specs.md` | When defining component anatomy and states |
| `references/accessibility-checklist.md` | When verifying WCAG compliance |
| `references/w3c-dtcg-format.md` | When structuring the tokens.json output |
| `references/open-systems-catalog.md` | When seeking inspiration from existing systems |
