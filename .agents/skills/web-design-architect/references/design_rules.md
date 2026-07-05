# Reference Guide: The 35 UI Design Elegance Rules

This document details the 35 rules of the UI Elegance Formula, accessibility standards, and visual hierarchies. Use these rules to audit layouts and codebase styles.

---

## Category 1: Spacing & Visual Hierarchy

*   **Rule 1: Embrace negative space**
    *   *Instruction:* Spacing is structural. Separate sections with generous margins. Let content breathe to reduce cognitive load.
*   **Rule 2: Simplicity through meaningful reduction**
    *   *Instruction:* Remove unnecessary decorative styling, double borders, and heavy boxes.
*   **Rule 8: Golden Ratio & Rule of Thirds**
    *   *Instruction:* Divide layout viewports into pleasing ratios (e.g. 60/40 or 70/30).
*   **Rule 14: Use size, weight, and contrast for hierarchy**
    *   *Instruction:* Ensure titles, body copy, and subtitles have distinct visual weights. Headings must be bold and oversized; body copy must be readable.
*   **Rule 17: Enforce 60-30-10 Color Rule**
    *   *Instruction:* 60% dominant background tone, 30% structure/text tone, 10% vivid accent color for CTAs.
*   **Rule 21: Utilize grid systems**
    *   *Instruction:* Align columns using an 8px grid scaling system for margins, padding, and size offsets.
*   **Rule 24: Flat 2.0 (Lean Flat Design)**
    *   *Instruction:* Keep layout vector flat but add subtle drop shadows or borders to define affordances.
*   **Rule 26: Consistent Component Styling**
    *   *Instruction:* Use identical borders, border-radii, shadows, and padding across all buttons and form inputs.

---

## Category 2: Usability & Psychology

*   **Rule 3: Empathy-driven user experiences**
    *   *Instruction:* Focus on what is easy for the user, not what is easy for the database schema.
*   **Rule 9: Grouping by proximity**
    *   *Instruction:* Keep related tools and controls close to each other.
*   **Rule 10: Intuitive flow**
    *   *Instruction:* Lead eye movement along logical paths (Z-shape for landings, F-shape for content).
*   **Rule 12: Jakob's Law (Tried & tested patterns)**
    *   *Instruction:* Use standard design conventions (e.g., search inputs in header, user profile top right).
*   **Rule 15: Don't make users think**
    *   *Instruction:* Keep commands self-explanatory; interactive widgets must look immediately clickable.
*   **Rule 18: MAYA Principle (Most Advanced Yet Acceptable)**
    *   *Instruction:* Design modern, state-of-the-art visual layouts but anchor them in familiar patterns.
*   **Rule 20: Real-world physical affordances**
    *   *Instruction:* Buttons should feel like buttons, sliders like sliders.
*   **Rule 23: Progressive Disclosure**
    *   *Instruction:* Hide advanced configurations behind toggles or menu tabs to prevent visual clutter.
*   **Rule 33: Consolidation**
    *   *Instruction:* Audit and merge redundant form fields, menus, or options.

---

## Category 3: Access, Operations & Inclusivity

*   **Rule 6: Comprehensive design systems**
    *   *Instruction:* Never use ad-hoc colors or typography sizes. Use standardized CSS variables/tokens.
*   **Rule 11: Quantitative user analytics**
    *   *Instruction:* Validate updates with heatmap, click, or conversion data.
*   **Rule 13: Personalization & customization**
    *   *Instruction:* Allow custom configurations (e.g. Light/Dark mode).
*   **Rule 16: Contextual hints and tips**
    *   *Instruction:* Use inline popovers, tooltips, or help modals rather than forcing users to search docs.
*   **Rule 22: Inclusive Design (Accessibility / a11y)**
    *   *Instruction:* Keep text-to-background contrast at a minimum of 4.5:1. Provide clean focus rings for keyboards.
*   **Rule 25: Consistent operation**
    *   *Instruction:* Keep shortcuts, gestures, and scrolling behavior identical.
*   **Rule 27: Micro-experience details**
    *   *Instruction:* Define hover transitions (e.g. `transition: all 0.2s ease`).

---

## Category 4: Lifecycle, Feed & Feedback

*   **Rule 7: Gamification loops**
    *   *Instruction:* Incorporate progress milestones, checklists, and visual feedback loops.
*   **Rule 28: Clear visual flow direction**
    *   *Instruction:* Use visual cues pointing directly to primary CTA buttons.
*   **Rule 29: Process duration reduction**
    *   *Instruction:* Shorten workflows to reduce cognitive drag.
*   **Rule 30: Onboarding and Offboarding**
    *   *Instruction:* Design warm onboarding paths and simple deletion steps.
*   **Rule 31: Human feedback responses**
    *   *Instruction:* Output warm greetings and constructive success/error notifications.
*   **Rule 32: Micro-interactions for complex states**
    *   *Instruction:* Animations for file drops, upload state ticks, and spinner steps.
*   **Rule 34: Personalized data feeds**
    *   *Instruction:* Tailor dashboards to the logged-in user.
*   **Rule 35: Social integrations**
    *   *Instruction:* Incorporate social sharing, document invitations, and collaborative links.

---

## Category 5: Advanced UI Animations & Keyframe Recipes

Enforce these smooth micro-interaction styles to elevate visual fidelity:

### 1. Modal Slide & Fade-In (Smooth Entrance)
```css
.modal-entrance {
  animation: modal-slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes modal-slide-in {
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
```

### 2. Skeleton Loading Shimmer (Anti-Flicker Loading State)
```css
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--bg-60) 25%,
    hsl(0, 0%, 90%) 37%,
    var(--bg-60) 63%
  );
  background-size: 400% 100%;
  animation: shimmer-load 1.4s ease infinite;
}

@keyframes shimmer-load {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
```

### 3. Micro-Interaction Hover Lift (Affordance Shift)
```css
.hover-lift {
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

