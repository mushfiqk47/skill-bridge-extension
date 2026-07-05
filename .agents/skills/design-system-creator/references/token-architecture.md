# Token Architecture Reference

## The 3-Tier Token System

Design tokens are the atomic building blocks of a design system — small, reusable values that encode design decisions. A well-architected token system uses three tiers that progressively add meaning.

## Tier 1: Primitive Tokens (Core / Global)

Raw, context-free values. These are your color palette, raw spacing numbers, and font definitions. They answer "what values exist?" but NOT "where to use them."

**Naming Pattern:** `{category}-{modifier}-{scale}`

```json
{
  "color": {
    "$type": "color",
    "blue": {
      "50":  { "$value": "#eff6ff" },
      "100": { "$value": "#dbeafe" },
      "200": { "$value": "#bfdbfe" },
      "300": { "$value": "#93c5fd" },
      "400": { "$value": "#60a5fa" },
      "500": { "$value": "#3b82f6" },
      "600": { "$value": "#2563eb" },
      "700": { "$value": "#1d4ed8" },
      "800": { "$value": "#1e40af" },
      "900": { "$value": "#1e3a8a" },
      "950": { "$value": "#172554" }
    },
    "neutral": {
      "0":   { "$value": "#ffffff" },
      "50":  { "$value": "#fafafa" },
      "100": { "$value": "#f5f5f5" },
      "200": { "$value": "#e5e5e5" },
      "300": { "$value": "#d4d4d4" },
      "400": { "$value": "#a3a3a3" },
      "500": { "$value": "#737373" },
      "600": { "$value": "#525252" },
      "700": { "$value": "#404040" },
      "800": { "$value": "#262626" },
      "900": { "$value": "#171717" },
      "950": { "$value": "#0a0a0a" }
    }
  },
  "spacing": {
    "$type": "dimension",
    "0":  { "$value": "0px" },
    "1":  { "$value": "4px" },
    "2":  { "$value": "8px" },
    "3":  { "$value": "12px" },
    "4":  { "$value": "16px" },
    "5":  { "$value": "20px" },
    "6":  { "$value": "24px" },
    "8":  { "$value": "32px" },
    "10": { "$value": "40px" },
    "12": { "$value": "48px" },
    "16": { "$value": "64px" }
  }
}
```

**Rules for primitives:**
- Never reference primitives directly in component code
- Generate palettes with mathematical consistency (HSL stepping)
- Include enough shades to support light, dark, and high-contrast modes
- Naming must be visual/descriptive — `blue-500`, not `primary`

---

## Tier 2: Semantic Tokens (Alias / Intent)

Assign meaning to primitive values. These answer "what is this value for?" They reference primitives via aliases.

**Naming Pattern:** `{category}-{element}-{role}-{variant}-{state}`

```json
{
  "color": {
    "bg": {
      "$type": "color",
      "primary":  { "$value": "{color.neutral.0}", "$description": "Main page background" },
      "secondary": { "$value": "{color.neutral.50}", "$description": "Subtle section backgrounds" },
      "elevated": { "$value": "{color.neutral.0}", "$description": "Cards and elevated surfaces" },
      "inverse":  { "$value": "{color.neutral.900}", "$description": "Dark surface for contrast sections" }
    },
    "text": {
      "$type": "color",
      "primary":   { "$value": "{color.neutral.900}", "$description": "Main body text" },
      "secondary": { "$value": "{color.neutral.600}", "$description": "Supporting text, labels" },
      "disabled":  { "$value": "{color.neutral.400}", "$description": "Disabled state text" },
      "inverse":   { "$value": "{color.neutral.0}", "$description": "Text on dark backgrounds" },
      "link":      { "$value": "{color.blue.600}", "$description": "Hyperlinks and interactive text" }
    },
    "action": {
      "$type": "color",
      "primary":       { "$value": "{color.blue.600}", "$description": "Primary CTA backgrounds" },
      "primary-hover": { "$value": "{color.blue.700}", "$description": "Primary CTA hover state" },
      "primary-text":  { "$value": "{color.neutral.0}", "$description": "Text on primary CTA" }
    },
    "border": {
      "$type": "color",
      "default": { "$value": "{color.neutral.200}", "$description": "Standard borders" },
      "strong":  { "$value": "{color.neutral.400}", "$description": "Emphasized borders" },
      "focus":   { "$value": "{color.blue.500}", "$description": "Focus ring color" }
    },
    "feedback": {
      "$type": "color",
      "success": { "$value": "{color.green.600}", "$description": "Success states and messages" },
      "warning": { "$value": "{color.amber.500}", "$description": "Warning states and messages" },
      "error":   { "$value": "{color.red.600}", "$description": "Error states and messages" },
      "info":    { "$value": "{color.blue.500}", "$description": "Informational messages" }
    }
  }
}
```

**Rules for semantics:**
- Always reference primitives via aliases `{color.blue.500}`, never hardcode hex values
- Include a `$description` explaining usage intent for every token
- These are what switch between modes — light and dark define different mappings
- The naming should be role-based, never visual (`text-primary`, not `text-dark-gray`)

---

## Tier 3: Component Tokens (Specific)

Map semantic tokens to specific component properties. These answer "what exact value does this button's background use?"

**Naming Pattern:** `{component}-{variant}-{element}-{state}`

```json
{
  "button": {
    "primary": {
      "bg": {
        "default": { "$value": "{color.action.primary}", "$description": "Primary button background" },
        "hover":   { "$value": "{color.action.primary-hover}", "$description": "Primary button hover background" },
        "active":  { "$value": "{color.blue.800}", "$description": "Primary button pressed background" },
        "disabled":{ "$value": "{color.neutral.200}", "$description": "Primary button disabled background" }
      },
      "text": {
        "default": { "$value": "{color.action.primary-text}", "$description": "Primary button text" },
        "disabled":{ "$value": "{color.text.disabled}", "$description": "Primary button disabled text" }
      },
      "border-radius": { "$value": "{radius.md}" },
      "padding-x":     { "$value": "{spacing.4}" },
      "padding-y":     { "$value": "{spacing.2}" }
    }
  }
}
```

**Rules for component tokens:**
- Always reference semantic tokens, never primitives directly
- Define every state explicitly — no implicit inheritance
- Component tokens are optional for smaller systems — semantic tokens can be used directly
- These tokens make it trivial for any developer to implement a component pixel-perfectly

---

## Multi-Mode Architecture

Modes change the mapping between semantic tokens and primitive tokens. The primitive palette stays the same — what changes is which primitives the semantic tokens point to.

```
Light Mode:                          Dark Mode:
bg-primary → neutral.0 (#fff)       bg-primary → neutral.900 (#171717)
text-primary → neutral.900          text-primary → neutral.50
action-primary → blue.600           action-primary → blue.400
border-default → neutral.200        border-default → neutral.700
```

**Key principles:**
- Dark mode is NOT simply inverting the scale numbers
- Dark mode surfaces use 800-950 range, but text uses 50-200
- Saturated colors (blue, green, red) shift lighter in dark mode for readability on dark surfaces
- Shadows in dark mode are more diffuse and deeper, often using a tinted shadow
- High-contrast mode boosts contrast to 7:1+ (WCAG AAA)

---

## Naming Convention Guide

Use this consistent pattern across all tokens:

```
{category}-{property}-{element}-{variant}-{modifier}-{state}
```

Only include segments that are needed:

| Full Path | Readable As |
|:----------|:------------|
| `color.bg.primary` | Background color, primary surface |
| `color.text.secondary` | Text color, secondary importance |
| `color.action.primary.hover` | Action color, primary variant, hover state |
| `spacing.md` | Spacing, medium size |
| `typography.heading-1.font-size` | Typography, heading 1, font size |
| `button.primary.bg.hover` | Button component, primary variant, bg, hover |

**Forbidden patterns:**
- Avoid using color names at semantic/component level: `button-blue-bg` ✗
- Avoid platform-specific values: `button-ios-padding` ✗
- Avoid abbreviated names that sacrifice clarity: `btn-p-bg-h` ✗
