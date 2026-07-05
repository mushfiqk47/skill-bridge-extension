# Accessibility Checklist Reference

## WCAG Compliance Levels

| Level | Target | When |
|:------|:-------|:-----|
| **WCAG AA** | Required | All design systems, minimum standard |
| **WCAG AAA** | Recommended | High-contrast mode, government, healthcare |

## Color & Contrast

### Contrast Ratio Requirements

| Content | AA Minimum | AAA Target |
|:--------|:-----------|:-----------|
| Normal text (< 18px) | 4.5:1 | 7:1 |
| Large text (≥ 18px or ≥ 14px bold) | 3:1 | 4.5:1 |
| UI components & graphical objects | 3:1 | — |
| Non-text (icons, borders, controls) | 3:1 | — |
| Inactive/disabled elements | No requirement | — |

### Critical Color Pairs to Verify

Always check these combinations in both light and dark mode:
- `text-primary` on `bg-primary`
- `text-secondary` on `bg-primary`
- `text-primary` on `bg-elevated` (cards)
- Button text on button background (all variants)
- Link text on surrounding background
- Placeholder text on input background
- Error text on error background
- Icon color on surrounding background
- Focus ring on surrounding background

### Color Independence Rule
Color must NEVER be the sole indicator of meaning. Always pair with:
- Icons (✓ for success, ✗ for error)
- Text labels ("Required", "Error: Invalid email")
- Patterns or shapes (striped progress bars, different chart markers)

## Focus Indicators

### Requirements
- Visible on ALL interactive elements (buttons, links, inputs, tabs, etc.)
- Minimum 2px width
- 3:1 contrast ratio against adjacent colors
- Must be visible in both light and dark mode
- Must not be obscured by other elements

### Recommended Focus Style
```css
:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}
```

Use `:focus-visible` (not `:focus`) to show focus rings only for keyboard navigation.

## Touch Targets

| Element | Minimum Size | Spacing |
|:--------|:-------------|:--------|
| Buttons, links, controls | 44 × 44px | 8px between targets |
| Mobile navigation items | 48 × 48px | — |
| Icons as buttons | 44 × 44px (padding counts) | 8px |
| Form inputs | 44px height minimum | — |

The 44px is the TOTAL interactive area including padding — a 32px button with 6px padding on each side = 44px.

## Keyboard Navigation

### Required Keyboard Support

| Key | Action |
|:----|:-------|
| Tab | Move focus to next interactive element |
| Shift+Tab | Move focus to previous element |
| Enter | Activate buttons, submit forms, follow links |
| Space | Activate buttons, toggle checkboxes |
| Escape | Close modals, popovers, dropdowns |
| Arrow keys | Navigate within menus, tabs, radio groups |

### Tab Order
- Follow visual reading order (top-to-bottom, left-to-right)
- Never use `tabindex > 0` — it breaks natural order
- Use `tabindex="0"` for custom interactive elements
- Use `tabindex="-1"` for programmatically focusable elements

## ARIA Patterns

### Common ARIA Roles

| Component | Role | Required Properties |
|:----------|:-----|:-------------------|
| Button | `button` | — (automatic with `<button>`) |
| Link | `link` | — (automatic with `<a href>`) |
| Modal | `dialog` | `aria-modal="true"`, `aria-labelledby` |
| Alert | `alert` | — (auto-announced by screen readers) |
| Tab list | `tablist` | — |
| Tab | `tab` | `aria-selected`, `aria-controls` |
| Tab panel | `tabpanel` | `aria-labelledby` |
| Menu | `menu` | — |
| Menu item | `menuitem` | — |
| Tooltip | `tooltip` | `aria-describedby` on trigger |

### Form Accessibility Checklist
- [ ] Every input has a visible `<label>` (not just placeholder)
- [ ] Required fields marked with `aria-required="true"`
- [ ] Error messages linked via `aria-describedby`
- [ ] Error state indicated via `aria-invalid="true"`
- [ ] Helper text linked via `aria-describedby`
- [ ] Field groups wrapped in `<fieldset>` with `<legend>`

## Motion & Animation

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- Provide `prefers-reduced-motion` alternative for ALL animations
- Essential motion (progress indicators) can use subtle alternatives
- Decorative motion should be fully removed

## High-Contrast Mode

### `prefers-contrast: more`
- Increase all text contrast to 7:1 (AAA)
- Strengthen borders (1px → 2px, use stronger border color)
- Increase focus ring width (2px → 3px)
- Remove decorative shadows
- Increase font weight if at low sizes

### Token Remapping for High Contrast
| Token | Normal | High Contrast |
|:------|:-------|:--------------|
| text-primary | neutral-900 | neutral-950 |
| text-secondary | neutral-600 | neutral-800 |
| border-default | neutral-200 | neutral-500 |
| border-focus | blue-500 | blue-700 (3px) |

## Screen Reader Considerations

- Use semantic HTML (`<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>`)
- Heading hierarchy: single `<h1>`, logical nesting (no skipping levels)
- Images: descriptive `alt` text or `alt=""` for decorative
- Icons: `aria-hidden="true"` for decorative, descriptive label for meaningful
- Live regions: `aria-live="polite"` for updates, `"assertive"` for urgent
- Skip navigation link as first focusable element
