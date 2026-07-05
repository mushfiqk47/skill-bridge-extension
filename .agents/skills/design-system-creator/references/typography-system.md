# Typography System Reference

## Choosing Typefaces

Typography accounts for 85-90% of most screens. Choose fonts with care.

### Recommended Font Pairings by Industry

| Industry | Heading Font | Body Font | Personality |
|:---------|:-------------|:----------|:------------|
| **SaaS / Tech** | Inter | Inter | Clean, neutral |
| **Fintech** | DM Sans | Inter | Trustworthy, modern |
| **Healthcare** | Outfit | Source Sans 3 | Approachable, clear |
| **Creative** | Sora | Plus Jakarta Sans | Modern, distinctive |
| **Enterprise** | IBM Plex Sans | IBM Plex Sans | Structured, reliable |
| **E-commerce** | Poppins | Nunito Sans | Friendly, readable |
| **Startup** | Geist | Geist | Sharp, contemporary |

## Building the Type Scale

### Modular Scale Method

Choose a base size (16px) and a ratio, then multiply:

| Ratio | Name | Feel |
|:------|:-----|:-----|
| 1.125 | Major Second | Tight, dense UIs |
| 1.200 | Minor Third | Compact, business apps |
| 1.250 | Major Third | **Balanced, most common** |
| 1.333 | Perfect Fourth | Spacious, content-heavy |
| 1.618 | Golden Ratio | Very dramatic headlines |

**Example with 1.250 ratio, 16px base:**

| Step | Size | Token |
|:-----|:-----|:------|
| -2 | 10px | caption |
| -1 | 13px | body-small |
| 0 | 16px | body (base) |
| +1 | 20px | body-large / heading-3 |
| +2 | 25px | heading-2 |
| +3 | 32px | heading-1 |
| +4 | 40px | display-small |
| +5 | 48px | display-large |

Round to nearest 4px-divisible value for grid alignment.

## Font Weights

Limit to 3-4 weights:

| Weight | Value | Usage |
|:-------|:------|:------|
| Regular | 400 | Body text |
| Medium | 500 | Labels, emphasized |
| Semibold | 600 | Headings |
| Bold | 700 | Display text |

## Line Heights

| Content Type | Ratio | Example (16px) |
|:-------------|:------|:---------------|
| Display | 1.1-1.2 | 20px |
| Headings | 1.2-1.3 | 24px |
| Body Text | 1.4-1.6 | 24px |
| Compact UI | 1.2-1.4 | 20px |

**Rule:** All line-heights divisible by 4px for baseline grid alignment.

## Responsive Typography

Only display/heading sizes scale. Body stays fixed.

| Token | Mobile | Desktop | Scales? |
|:------|:-------|:--------|:--------|
| display-large | 36px | 64px | ✓ |
| heading-1 | 24px | 32px | ✓ |
| body | 16px | 16px | ✗ |
| caption | 12px | 12px | ✗ |

### Fluid Typography

```css
--font-display-large: clamp(36px, 5vw + 1rem, 72px);
--font-heading-1: clamp(28px, 3vw + 1rem, 40px);
--font-body: 16px; /* Fixed */
```

## Letter Spacing

| Size Range | Spacing | Reason |
|:-----------|:--------|:-------|
| Display (36px+) | -0.02em to -0.04em | Tighten large text |
| Headings (20-36px) | -0.01em to -0.02em | Slight tightening |
| Body (14-18px) | 0 | Normal |
| Caption (10-12px) | 0.01em to 0.02em | Loosen small text |
| All-caps | 0.05em to 0.1em | Always needs tracking |

## Typography Token Structure

```json
{
  "typography": {
    "heading-1": {
      "$type": "typography",
      "$value": {
        "fontFamily": "{font.family.heading}",
        "fontSize": "32px",
        "fontWeight": 600,
        "lineHeight": "40px",
        "letterSpacing": "-0.02em"
      }
    }
  }
}
```
