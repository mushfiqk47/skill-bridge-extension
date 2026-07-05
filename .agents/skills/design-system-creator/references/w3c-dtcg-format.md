# W3C DTCG Token Format Reference

## Overview

The W3C Design Tokens Community Group (DTCG) specification defines a vendor-neutral JSON format for design tokens. Version 2025.10 is the first stable, production-ready release. Files use the `.tokens.json` extension.

## Core Structure

### Token Object

A token is a JSON key with a `$value` property:

```json
{
  "token-name": {
    "$value": "#3b82f6",
    "$type": "color",
    "$description": "Primary brand color for CTAs"
  }
}
```

### Required Properties
- `$value` — The token's value (required)

### Optional Properties
- `$type` — Value type (color, dimension, fontFamily, fontWeight, duration, cubicBezier, shadow, typography, etc.)
- `$description` — Human-readable description of intent
- `$extensions` — Tool-specific metadata (vendor extensions)

## Groups

Groups organize tokens hierarchically. A group is any JSON object WITHOUT a `$value`:

```json
{
  "color": {
    "$type": "color",
    "primary": {
      "$value": "#3b82f6",
      "$description": "Main brand color"
    },
    "secondary": {
      "$value": "#8b5cf6"
    }
  }
}
```

`$type` at group level is inherited by all child tokens.

## Token Types

| Type | Format | Example |
|:-----|:-------|:--------|
| `color` | Hex, RGB, HSL, OKLCH | `"#3b82f6"` |
| `dimension` | Number + unit | `"16px"`, `"1.5rem"` |
| `fontFamily` | String or array | `"Inter"`, `["Inter", "sans-serif"]` |
| `fontWeight` | Number or string | `600`, `"semi-bold"` |
| `duration` | Number + unit | `"200ms"` |
| `cubicBezier` | Array of 4 numbers | `[0.4, 0, 0.2, 1]` |
| `number` | Unitless number | `1.5`, `0.8` |
| `shadow` | Object | See below |
| `typography` | Composite object | See below |
| `border` | Composite object | See below |
| `transition` | Composite object | See below |

### Shadow Type
```json
{
  "$type": "shadow",
  "$value": {
    "color": "#00000019",
    "offsetX": "0px",
    "offsetY": "4px",
    "blur": "6px",
    "spread": "0px"
  }
}
```

### Typography Composite Type
```json
{
  "$type": "typography",
  "$value": {
    "fontFamily": "{font.family.body}",
    "fontSize": "16px",
    "fontWeight": 400,
    "lineHeight": "24px",
    "letterSpacing": "0"
  }
}
```

### Border Composite Type
```json
{
  "$type": "border",
  "$value": {
    "color": "{color.border.default}",
    "width": "1px",
    "style": "solid"
  }
}
```

## Aliases (References)

Tokens can reference other tokens using `{}` syntax:

```json
{
  "color": {
    "blue-500": { "$value": "#3b82f6", "$type": "color" },
    "action-primary": { "$value": "{color.blue-500}", "$type": "color" }
  }
}
```

The path inside `{}` is a dot-separated path through the JSON hierarchy.

### Alias Rules
- References must point to existing tokens
- Circular references are NOT allowed
- A reference resolves to the final `$value`
- Cross-file references are supported (tool-dependent)

## Multi-File Structure

For large systems, split tokens across files:

```
tokens/
├── primitives/
│   ├── colors.tokens.json
│   ├── spacing.tokens.json
│   └── typography.tokens.json
├── semantic/
│   ├── light.tokens.json
│   ├── dark.tokens.json
│   └── shared.tokens.json
└── components/
    ├── button.tokens.json
    └── input.tokens.json
```

For this skill, we output a single consolidated file for simplicity but include comments about how to split.

## Extensions

Vendor-specific data goes in `$extensions`:

```json
{
  "color-primary": {
    "$value": "#3b82f6",
    "$type": "color",
    "$extensions": {
      "com.figma": {
        "hiddenFromPublishing": false,
        "scopes": ["FRAME_FILL", "SHAPE_FILL"]
      }
    }
  }
}
```

## Mode Support

The DTCG spec doesn't directly define "modes" — modes are implemented by having separate token files that remap semantic tokens to different primitives:

```json
// light.tokens.json
{
  "color": {
    "bg-primary": { "$value": "{color.neutral.0}" }
  }
}

// dark.tokens.json
{
  "color": {
    "bg-primary": { "$value": "{color.neutral.900}" }
  }
}
```

Tools like Style Dictionary, Figma Variables, and Tokens Studio handle mode switching.
