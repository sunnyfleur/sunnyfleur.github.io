# Cursor And Hover UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the portfolio explorer cursor and hover behavior so interaction feels cleaner, clearer, and more aligned with the existing Braxton theme.

**Architecture:** Keep the current static-site structure and improve the existing cursor/explorer layers instead of replacing them. Use a lighter cursor state model in JavaScript, calmer token-driven cursor styling in CSS, and stronger but controlled hover states in the explorer card/filter layer.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, PowerShell verification, Node syntax checks

---

### Task 1: Rebuild the cursor runtime state model

**Files:**
- Modify: `c:/Project/sunnyfleur.github.io/js/cursor.js`
- Modify: `c:/Project/sunnyfleur.github.io/js/cursor-trail.js`

- [ ] **Step 1: Gate the custom cursor to pointer-capable desktop contexts**

Add `matchMedia('(pointer: fine)')`, `matchMedia('(hover: hover)')`, and `matchMedia('(prefers-reduced-motion: reduce)')` checks in `js/cursor.js` so the custom cursor only initializes where it makes sense.

- [ ] **Step 2: Replace static hover bindings with delegated interaction targeting**

Update `js/cursor.js` to detect cursor target type from `closest()` selectors instead of binding listeners to a fixed node list. Support at least: generic controls, explorer cards, and non-interactive state.

- [ ] **Step 3: Add smoother cursor movement and shorter click feedback**

Move the outer halo with `requestAnimationFrame` smoothing, keep the inner dot more direct, and convert click feedback into a short compressed state.

- [ ] **Step 4: Reduce the trail implementation to a minimal accent layer**

Update `js/cursor-trail.js` so the trail is either removed or reduced to a very low-noise effect that respects the enabled state and reduced-motion contexts.

- [ ] **Step 5: Run JS syntax verification**

Run: `node --check js/cursor.js` and `node --check js/cursor-trail.js`
Expected: no syntax errors

### Task 2: Restyle the cursor layer to match the theme

**Files:**
- Modify: `c:/Project/sunnyfleur.github.io/css/cursor.css`

- [ ] **Step 1: Replace the neon ring styling with a dot + halo treatment**

Use theme tokens such as `--accent`, `--secondary`, `--stroke-controls`, and `--base` instead of the current neon-like hardcoded appearance.

- [ ] **Step 2: Add explicit visual states for control hover, card hover, click, and inactivity**

Define CSS states that react to body-level cursor classes so buttons/filters and large cards feel different under the cursor.

- [ ] **Step 3: Improve the cursor toggle button styling**

Restyle `.cursor-toggle` so it feels like part of the site UI instead of a utility overlay from another system.

- [ ] **Step 4: Add reduced-motion and coarse-pointer fallbacks**

Ensure the cursor layer backs off cleanly for reduced-motion users and touch-first contexts.

### Task 3: Strengthen explorer hover while reducing false affordance

**Files:**
- Modify: `c:/Project/sunnyfleur.github.io/css/portfolio-ux.css`
- Modify: `c:/Project/sunnyfleur.github.io/js/portfolio-index.js` only if semantic hooks are needed

- [ ] **Step 1: Make metadata chips read as informational tags**

Reduce the visual weight of explorer chips so they no longer look like standalone buttons.

- [ ] **Step 2: Deepen portfolio card hover response**

Add coordinated hover feedback for panel, image, title, and CTA so cards feel like strong click targets when scanning laterally.

- [ ] **Step 3: Improve filter hover and active feedback**

Strengthen filter feedback so hover is more tactile and active state remains clearly stronger than hover.

- [ ] **Step 4: Run portfolio verification**

Run: `powershell -ExecutionPolicy Bypass -File .\verify-portfolio.ps1`
Expected: `Portfolio verification passed.`

### Task 4: Final review and preview handoff

**Files:**
- No new source files required unless a temporary local preview helper is needed and then removed before commit

- [ ] **Step 1: Check git diff scope**

Run: `git diff --stat`
Expected: changes limited to cursor and explorer interaction files plus this plan file if retained

- [ ] **Step 2: Open the local portfolio for visual review**

Open the homepage explorer through a local static server so `projects.json` still loads and the updated hover/cursor behavior can be inspected.

- [ ] **Step 3: Summarize what changed and what still needs browser validation**

Report the interaction changes, list verification commands run, and call out any manual browser QA gaps explicitly.
