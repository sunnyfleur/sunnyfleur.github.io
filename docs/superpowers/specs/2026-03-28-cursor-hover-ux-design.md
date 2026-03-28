# Cursor And Hover UX Design

## Goal

Improve the portfolio explorer interaction quality by:

- replacing the current generic-looking custom cursor with a lighter, theme-aligned cursor
- making explorer cards and filters feel more responsive on hover
- reducing false affordance on metadata chips that currently look more clickable than they are

The result should feel more intentional and tactile without becoming flashy or gamey in a distracting way.

## Current Problems

### Cursor

- The current cursor treatment in `css/cursor.css` uses a neon-style ring, solid center dot, and trail effect that reads as generic rather than integrated with the Braxton theme.
- The trail adds visual noise and can pull attention away from the portfolio content.
- The cursor does not communicate different interaction types clearly enough.

### Explorer Hover States

- Portfolio cards in `css/portfolio-ux.css` currently rely mostly on lift, border, and shadow changes.
- The interaction is technically visible but does not create enough lateral “stickiness” when the user moves across cards.
- Filters are interactive, but their hover state is still weaker than the rest of the site’s button language.

### Affordance Confusion

- Metadata chips inside cards visually resemble controls, even though they are informational only.
- This creates unnecessary ambiguity about what is actually clickable.

## Chosen Direction

Use a hybrid precision approach:

- keep a custom cursor on pointer-capable desktop devices
- simplify it into a minimal dot plus soft halo
- strengthen hover response for cards and filters
- visually separate informational chips from interactive controls

This is preferred over removing the custom cursor entirely because the site already has an interaction layer and can benefit from a refined version of it. It is preferred over a more game-like cursor because the portfolio needs to feel designed, not gimmicky.

## Scope

### In Scope

- `css/cursor.css`
- `js/cursor.js`
- `js/cursor-trail.js`
- `css/portfolio-ux.css`
- small supporting changes in `js/portfolio-index.js` if hover states need clearer semantic hooks

### Out Of Scope

- changing the overall homepage information architecture
- redesigning unrelated sections outside the explorer and shared project interactions
- introducing new libraries or heavy animation systems

## Interaction Design

### Cursor Behavior

The custom cursor should be rebuilt around two elements:

- a small precise inner dot
- a larger soft halo that follows with slight smoothing

Behavior rules:

- default state is quiet and low-contrast
- hovering interactive controls expands the halo slightly
- hovering large cards expands the halo more softly than buttons, so it feels like the cursor is locking onto a panel rather than a tiny control
- click state compresses briefly and returns quickly
- the old star-like trail should be removed or reduced to an almost imperceptible accent so the cursor no longer reads as decoration first

### Interactive Hierarchy

The explorer must clearly distinguish three classes of UI:

1. primary controls
   - filter buttons
   - CTA buttons
2. primary destinations
   - full portfolio cards
3. informational metadata
   - type, year, role, platform chips or meta labels

Expected visual hierarchy:

- primary controls keep strong button language
- primary destinations feel hoverable through panel movement, image response, and CTA emphasis
- informational metadata becomes flatter and calmer so it stops pretending to be a button

### Card Hover Response

Each portfolio card should respond as one coherent interactive object:

- subtle upward movement
- slightly deeper shadow
- image scale between roughly `1.02` and `1.04`
- stronger title and CTA emphasis
- optional accent glow or edge highlight that stays thin and controlled

The hover language should feel more like “focus and readiness” than “animation showcase”.

### Filter Hover Response

Filters should become more tactile by:

- improving fill and border feedback on hover
- making active state visually stronger than hover state
- aligning shape, rhythm, and emphasis with existing Braxton controls

## Visual Language

### Cursor Styling

- use existing theme tokens such as `--accent`, `--secondary`, `--stroke-controls`, `--t-bright`, and related rgba conversions when needed
- avoid hardcoded neon orange or effects that do not appear elsewhere on the site
- keep opacity lower than the current implementation

### Metadata Styling

- informational chips should feel closer to tags than buttons
- they should remain readable but visually recede behind the card title and CTA
- hover should not suggest independent clickability

### Motion

- use short transitions, generally around `140ms` to `180ms`
- animate only low-cost properties: `transform`, `opacity`, `box-shadow`, `border-color`, and possibly `background-color`
- avoid bouncy easing or oversized scale jumps

## Accessibility And Fallbacks

- custom cursor behavior should only apply on pointer-capable desktop contexts
- touch devices should keep native cursor or touch behavior without extra visual artifacts
- `prefers-reduced-motion` should reduce or disable smoothing, hover animation amplitude, and cursor effects
- focus-visible states must remain clear even if hover animations are reduced

## Implementation Notes

### Cursor Layer

- simplify the CSS in `css/cursor.css`
- reduce or remove the current trail logic in `js/cursor-trail.js`
- update `js/cursor.js` so it can differentiate at least between generic controls and large card targets

### Explorer Layer

- adjust `css/portfolio-ux.css` to create stronger card hover depth
- reduce false button affordance on metadata chips
- add semantic helper classes or data attributes from `js/portfolio-index.js` only when cursor target sizing cannot be inferred cleanly from existing selectors

## Verification

After implementation:

- verify the explorer still renders correctly from `projects.json`
- run `verify-portfolio.ps1`
- manually inspect the homepage explorer on desktop
- confirm that metadata chips no longer look independently clickable
- confirm the cursor remains usable and non-distracting
- if browser QA is not performed, state that explicitly

## Success Criteria

- the cursor no longer feels like an unrelated decorative effect
- hovering across the explorer feels more tactile and confident
- informational chips read as metadata, not controls
- cards and filters feel intentionally interactive without clashing with the rest of the site

