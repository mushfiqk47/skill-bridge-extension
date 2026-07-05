# Component Specifications Reference

## Core Component Set

Every design system needs at minimum these 10 components. Define exact token references for all properties and states.

## Component Anatomy Template

For each component, define:

```
Component: [Name]
├── Anatomy: Visual parts (container, label, icon, helper text)
├── Variants: Sizes (sm, md, lg) + Styles (primary, secondary, ghost)
├── States: default, hover, active, focus, disabled, loading, error
├── Token Map: Exact token for bg, text, border, padding, radius per variant+state
├── Accessibility: ARIA attributes, keyboard behavior
└── Responsive: How it adapts at breakpoints
```

---

## 1. Button

### Variants
| Variant | Purpose |
|:--------|:--------|
| Primary | Main call-to-action |
| Secondary | Supporting actions |
| Tertiary/Ghost | Low-emphasis actions |
| Destructive | Delete, remove, dangerous actions |
| Outline | Medium emphasis, same as secondary with border |

### Sizes
| Size | Height | Padding X | Font Size | Icon Size |
|:-----|:-------|:----------|:----------|:----------|
| sm | 32px | spacing-3 (12px) | label (14px) | 16px |
| md | 40px | spacing-4 (16px) | label (14px) | 20px |
| lg | 48px | spacing-6 (24px) | body (16px) | 24px |

### State Matrix (Primary variant)
| State | Background | Text | Border | Shadow |
|:------|:-----------|:-----|:-------|:-------|
| Default | action-primary | on-action-primary | none | elevation-0 |
| Hover | action-primary-hover | on-action-primary | none | elevation-1 |
| Active | action-primary-active | on-action-primary | none | elevation-0 |
| Focus | action-primary | on-action-primary | focus-ring (2px) | elevation-0 |
| Disabled | bg-disabled | text-disabled | none | none |
| Loading | action-primary (50% opacity) | spinner | none | none |

### Accessibility
- `role="button"` (automatic with `<button>`)
- `aria-disabled="true"` for disabled state (not just visual)
- `aria-busy="true"` during loading
- Keyboard: Enter/Space to activate, Tab to focus
- Min touch target: 44×44px (padding counts)

---

## 2. Input (Text Field)

### Anatomy
Container → Label → Input field → Helper text → Error message

### Sizes
| Size | Height | Padding | Font Size |
|:-----|:-------|:--------|:----------|
| sm | 32px | spacing-2 (8px) | body-small (14px) |
| md | 40px | spacing-3 (12px) | body (16px) |
| lg | 48px | spacing-4 (16px) | body (16px) |

### State Matrix
| State | Background | Border | Label | Helper Text |
|:------|:-----------|:-------|:------|:------------|
| Default | bg-primary | border-default (1px) | text-secondary | text-tertiary |
| Hover | bg-primary | border-strong (1px) | text-secondary | text-tertiary |
| Focus | bg-primary | border-focus (2px) | text-primary | text-tertiary |
| Filled | bg-primary | border-default (1px) | text-secondary | text-tertiary |
| Error | bg-primary | error (2px) | error | error text |
| Disabled | bg-disabled | border-disabled | text-disabled | text-disabled |
| Read-only | bg-secondary | none | text-secondary | text-tertiary |

### Accessibility
- Always pair with `<label>` (never placeholder-only)
- `aria-describedby` linking to helper/error text
- `aria-invalid="true"` for error state
- `aria-required="true"` for required fields

---

## 3. Card

### Variants
| Variant | Border | Shadow | Use |
|:--------|:-------|:-------|:----|
| Default | border-default (1px) | elevation-0 | Static content |
| Elevated | none | elevation-1 | Highlighted content |
| Interactive | border-default | elevation-0 → elevation-2 on hover | Clickable cards |

### Structure
- Padding: spacing-5 (20px) or spacing-6 (24px)
- Border radius: radius-lg (12px)
- Gap between sections: spacing-4 (16px)

---

## 4. Badge / Tag / Chip

### Sizes
| Size | Height | Padding X | Font | Radius |
|:-----|:-------|:----------|:-----|:-------|
| sm | 20px | spacing-1.5 (6px) | caption (12px) | radius-sm |
| md | 24px | spacing-2 (8px) | body-small (14px) | radius-sm |
| lg | 32px | spacing-3 (12px) | label (14px) | radius-md |

### Color Variants
Map to feedback colors: `success`, `warning`, `error`, `info`, `neutral`

---

## 5. Alert / Notification

### Anatomy
Container → Icon → Title → Message → Action → Close button

### Variants by Severity
| Variant | Background | Border (left 4px) | Icon Color | Text Color |
|:--------|:-----------|:-------------------|:-----------|:-----------|
| Info | info-bg | info | info | text-primary |
| Success | success-bg | success | success | text-primary |
| Warning | warning-bg | warning | warning | text-primary |
| Error | error-bg | error | error | text-primary |

### Accessibility
- `role="alert"` for errors and urgent messages
- `role="status"` for informational messages
- Dismissible alerts need accessible close button

---

## 6. Modal / Dialog

### Structure
- Overlay: bg-overlay (scrim)
- Container: bg-elevated, radius-xl, elevation-4
- Header: Title + close button, border-bottom
- Body: Scrollable content area, padding spacing-6
- Footer: Action buttons, border-top, padding spacing-4

### Sizes
| Size | Width | Use |
|:-----|:------|:----|
| sm | 400px | Confirmations, simple forms |
| md | 560px | Standard dialogs |
| lg | 720px | Complex forms, detail views |
| full | 90vw max 1024px | Data-heavy interfaces |

### Accessibility
- `role="dialog"` + `aria-modal="true"`
- `aria-labelledby` pointing to title
- Focus trap: Tab cycles within modal
- Escape key closes modal
- Return focus to trigger element on close

---

## 7. Navigation Components

### Navbar
- Height: 56-64px
- Background: bg-primary or bg-elevated with elevation-1
- Logo area → Nav links → Actions (search, avatar, CTA)

### Sidebar
- Width: 240-280px (expanded), 64px (collapsed)
- Background: bg-secondary or bg-primary
- Nav items: 40px height, spacing-2 internal padding

### Tabs
- Tab height: 40-48px
- Active indicator: 2px bottom border with action-primary color
- Tab gap: spacing-1 (4px)

---

## 8. Tooltip

- Background: bg-inverse (neutral-900 light mode, neutral-100 dark mode)
- Text: text-inverse, caption size
- Padding: spacing-1.5 (6px) spacing-2 (8px)
- Radius: radius-sm (4px)
- Max width: 240px
- Arrow: 6px
- Delay: 300ms appear, 100ms disappear

---

## Component Design Principles

1. **Consistency over creativity** — Components should feel like they belong to the same family
2. **States are not optional** — Every interactive component needs all states defined
3. **Tokens over hardcoded values** — Every property references a token
4. **Content flexibility** — Components should handle text truncation, wrapping, empty states
5. **Accessibility first** — ARIA, keyboard, focus, contrast are requirements, not enhancements
