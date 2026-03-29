# Homepage Skills Section Design

## Overview

Replace the current homepage tools area with a theme-matched `Skills` section that uses a grid of compact cards and a linked detail preview panel.

The section should stay consistent with the current portfolio visual language: light surfaces, rounded cards, restrained shadows, and the existing accent gradient. It must work clearly on desktop and mobile without relying on hover-only behavior.

## Goals

- Present core skills more clearly than a static logo grid.
- Let visitors scan skills quickly, then inspect one skill in more detail without leaving the page.
- Support both design skills and workflow/tooling skills, including `AI-assisted Workflow`.
- Keep the interaction simple and readable on desktop and mobile.

## Non-Goals

- No tooltips, flip cards, or modal interactions.
- No filtering, searching, or category tabs in the first pass.
- No new CMS or external data source in this pass.
- No wider homepage redesign outside this section.

## UX Structure

### Desktop

- Left side: grid of skill cards.
- Right side: persistent detail preview panel.
- Hovering a card updates the detail panel.
- Clicking a card also updates the detail panel so keyboard and non-hover interaction remain clean.
- The first skill is selected by default so the panel is never empty.

### Mobile

- Skill card grid appears first.
- Detail panel moves below the grid.
- Tapping a card updates the panel and marks the card as active.
- No hover dependency.

## Card Content

Each skill card shows only:

- icon or representative image
- skill name

Cards should not show long text, levels, or dense metadata directly in the grid.

## Detail Panel Content

The detail preview panel shows:

- larger icon or image
- skill name
- skill level using text only
- short description of what the skill is used for

Levels should use professional text labels rather than bars or percentages:

- `Advanced`
- `Intermediate`
- `Working Knowledge`

## Content Direction

The section should include skills that are relevant to the portfolio narrative, not generic software logos. Likely first-pass entries:

- Game Design
- Level Design
- Combat Design
- Design Documentation
- Unity
- AI-assisted Workflow

`AI-assisted Workflow` should be positioned professionally, not casually. It should describe the use of tools such as Cursor, Codex, and Claude Code for prototyping, scripting, documentation, and iteration.

## Visual Language

- Use the existing homepage theme tokens and styling language.
- Cards should reuse the site’s current rounded, lightly elevated surface treatment.
- Active or hovered cards should use subtle emphasis only: border tint, shadow adjustment, and a mild background shift.
- The detail panel should visually match current portfolio panels and project cards.
- Avoid neon, loud badges, progress bars, or dashboard styling that would break the portfolio tone.

## Interaction Rules

- One active skill at a time.
- Default active skill is the first item in the list.
- Desktop:
  - `mouseenter` updates active skill
  - `focus` and `click` also update active skill
- Mobile:
  - `tap` updates active skill
- If JavaScript fails, the section should still render all cards and a default visible detail block in static markup.

## Accessibility

- Cards must be keyboard reachable.
- Active state must not rely on color alone.
- Detail updates should not cause layout jumps.
- Text contrast must remain consistent with the rest of the site.

## Implementation Scope

Primary files:

- `index.html`
- `css/portfolio-ux.css`
- `js/app.js` or a new small homepage-skills script if separation is cleaner

Data approach for this pass:

- Keep the skill definitions local to the homepage implementation.
- Do not introduce `skills.json` in the first pass.
- If the section expands later, it can be moved to structured data without changing the visual design.

## Acceptance Criteria

- Homepage contains a `Skills` section replacing the current simple tools grid.
- Desktop shows card grid plus detail panel side by side.
- Mobile shows card grid with detail panel below.
- Hover, focus, and tap correctly update the active skill.
- Section includes a professional `AI-assisted Workflow` entry.
- Styling feels consistent with the current portfolio theme.
- The section remains usable without hover-only assumptions.
