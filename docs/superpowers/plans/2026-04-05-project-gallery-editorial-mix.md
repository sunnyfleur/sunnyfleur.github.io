# Project Gallery Editorial Mix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the project detail gallery into an editorial mix layout that handles mixed portrait, landscape, square, and extra-wide images cleanly while keeping the lightbox on true image dimensions.

**Architecture:** Keep PhotoSwipe sizing logic separate from on-page gallery composition. `js/project-page.js` will infer or normalize gallery layout variants and stamp `data-layout` attributes on cards, while `css/portfolio-ux.css` will translate those variants into a staggered desktop grid and simpler tablet/mobile fallbacks.

**Tech Stack:** Static HTML, vanilla JavaScript, CSS Grid, Node test runner, PhotoSwipe

---

### Task 1: Lock Layout Variant Rules With Tests

**Files:**
- Modify: `C:\Project\sunnyfleur.github.io\tests\project-page.test.js`

- [ ] Add failing tests for layout hint normalization and inferred editorial variants.
- [ ] Run `node --test tests/project-page.test.js` and confirm the new test fails for the expected missing behavior.

### Task 2: Add Gallery Layout Inference In Project Rendering

**Files:**
- Modify: `C:\Project\sunnyfleur.github.io\js\project-page.js`

- [ ] Add helpers that normalize explicit layout hints and infer variants from image dimensions.
- [ ] Extend gallery item normalization to carry optional `layout`.
- [ ] Stamp `data-layout` on gallery cards from JSON overrides when present, otherwise derive from loaded image size.
- [ ] Re-run `node --test tests/project-page.test.js` until green.

### Task 3: Apply Editorial Mix CSS

**Files:**
- Modify: `C:\Project\sunnyfleur.github.io\css\portfolio-ux.css`

- [ ] Replace the uniform two-column gallery rules with a staggered editorial grid tuned for portrait, landscape, square, and wide cards.
- [ ] Preserve a simpler two-column tablet grid and one-column mobile fallback.

### Task 4: Refresh Asset Loading And Verify

**Files:**
- Modify: `C:\Project\sunnyfleur.github.io\project.html`

- [ ] Bump cache-busting query params if the changed CSS or JS would otherwise stay stale in the browser.
- [ ] Run `node --test tests/project-page.test.js`.
- [ ] Run `node tests/gallery-init.test.js`.
- [ ] Run `powershell -ExecutionPolicy Bypass -File .\verify-portfolio.ps1`.
- [ ] Confirm `http://127.0.0.1:57302/project.html?slug=screw` returns `200`.
