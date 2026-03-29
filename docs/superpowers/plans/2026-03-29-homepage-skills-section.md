# Homepage Skills Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing homepage tools grid with a theme-matched `Skills` section that shows compact skill cards plus a synced detail preview panel.

**Architecture:** Keep the section self-contained in the homepage by rendering static card markup in `index.html`, styling it in `css/portfolio-ux.css`, and using a small dedicated script to sync the active card with the detail panel. Preserve graceful fallback by making the first skill visible in static HTML even if JavaScript never runs.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, existing Phosphor icon font, existing Braxton theme classes and spacing system.

---

## File Structure

- **Modify:** `index.html`
  - Replace the current `My favourite tools` block with a `Skills` section.
  - Add six skill cards as focusable buttons with `data-*` attributes for title, level, description, and icon class.
  - Add a default detail panel seeded with the first skill.
  - Include the new script near the existing homepage scripts.
- **Modify:** `css/portfolio-ux.css`
  - Add a new `skills-section` block with desktop two-column layout and mobile stacked layout.
  - Add card, active-state, and detail-panel styling that matches the current light theme.
- **Create:** `js/homepage-skills.js`
  - Read the skill card dataset.
  - Update the detail preview panel on `mouseenter`, `focus`, and `click`.
  - Maintain `aria-pressed` and active classes.
- **Verify:** `verify-portfolio.ps1`
  - Confirm the homepage still passes current static verification.

### Task 1: Replace the homepage tools block with the new skills markup

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the current section heading and tools grid with a new skills heading and wrapper**

Use a structure like:

```html
<div class="content__block">
  <div class="section-h3 section-h3-grid">
    <h3 class="h3__title animate-in-up">Core Skills</h3>
  </div>
</div>

<div class="content__block block-large">
  <section class="skills-section" aria-label="Core skills">
    <div class="skills-section__grid" role="list">
      <!-- skill buttons -->
    </div>
    <aside class="skills-section__detail" aria-live="polite">
      <!-- default detail content seeded from first skill -->
    </aside>
  </section>
</div>
```

- [ ] **Step 2: Add six skill cards using buttons with data attributes**

Use one button per skill with a structure like:

```html
<button
  class="skills-card is-active"
  type="button"
  data-skill-title="Game Design"
  data-skill-level="Advanced"
  data-skill-description="Design core loops, progression, player goals, and readable feature direction across prototypes and production-facing work."
  data-skill-icon="ph ph-game-controller"
  data-skill-tag="Systems"
  aria-pressed="true">
  <span class="skills-card__icon"><i class="ph ph-game-controller"></i></span>
  <span class="skills-card__title">Game Design</span>
</button>
```

Add the first-pass skill set:
- `Game Design`
- `Level Design`
- `Combat Design`
- `Design Documentation`
- `Unity`
- `AI-assisted Workflow`

- [ ] **Step 3: Seed the default detail panel from the first skill**

Use static fallback content similar to:

```html
<div class="skills-detail__media">
  <span class="skills-detail__icon"><i class="ph ph-game-controller"></i></span>
</div>
<p class="skills-detail__eyebrow">Advanced</p>
<h4 class="skills-detail__title">Game Design</h4>
<p class="skills-detail__text">Design core loops, progression, player goals, and readable feature direction across prototypes and production-facing work.</p>
```

- [ ] **Step 4: Add the new script include after the homepage scripts**

Add:

```html
<script src="js/homepage-skills.js"></script>
```

Place it after `js/portfolio-index.js` and before the cursor scripts so it loads with the rest of the homepage interaction layer.

- [ ] **Step 5: Manual markup check**

Run:

```powershell
Get-Content -Path '.\index.html' | Select-String -Pattern 'skills-section|skills-card|homepage-skills.js' -Context 0,2
```

Expected: new skills section markup and script include are present, old `tools-cards` block is gone from the homepage.

### Task 2: Add theme-matched skills section styling

**Files:**
- Modify: `css/portfolio-ux.css`

- [ ] **Step 1: Add the new section layout styles**

Add a block with responsibilities like:

```css
.skills-section {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(32rem, 0.9fr);
  gap: 1.8rem;
  align-items: start;
}

.skills-section__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.2rem;
}
```

- [ ] **Step 2: Style the cards to match the current portfolio theme**

Add card styles with light surfaces, rounded corners, subtle borders, and restrained hover states. Use the current theme tokens instead of hard-coded colors:

```css
.skills-card {
  border: 1px solid var(--portfolio-border);
  border-radius: 2.4rem;
  background: linear-gradient(180deg, color-mix(in srgb, var(--base-tint) 88%, white 12%) 0%, var(--portfolio-surface-strong) 100%);
  box-shadow: var(--portfolio-shadow);
}
```

Also define an active state that changes border, shadow, and background slightly without turning the section into a dashboard.

- [ ] **Step 3: Style the detail panel**

Add a matching detail surface with an icon/media area, level eyebrow, title, and description. Keep typography close to the current project cards so the section feels native to the site.

- [ ] **Step 4: Add responsive behavior**

Add mobile rules so the section stacks to one column and the grid becomes `repeat(2, minmax(0, 1fr))` or `1fr` depending on the existing breakpoint pattern.

Use a structure like:

```css
@media (max-width: 767px) {
  .skills-section {
    grid-template-columns: 1fr;
  }

  .skills-section__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

- [ ] **Step 5: Static CSS check**

Run:

```powershell
Get-Content -Path '.\css\portfolio-ux.css' | Select-String -Pattern 'skills-section|skills-card|skills-detail' -Context 0,2
```

Expected: all three selector groups exist in the UX stylesheet.

### Task 3: Add lightweight skill-panel interaction logic

**Files:**
- Create: `js/homepage-skills.js`

- [ ] **Step 1: Create the script scaffold and select the required DOM nodes**

Start with:

```javascript
(() => {
  const root = document.querySelector('.skills-section');
  const cards = root ? Array.from(root.querySelectorAll('.skills-card')) : [];
  const detail = root?.querySelector('.skills-section__detail');

  if (!root || !cards.length || !detail) {
    return;
  }
})();
```

- [ ] **Step 2: Implement a single renderer for the detail panel**

Create a helper that reads from a card dataset and updates the panel content:

```javascript
function renderDetail(card) {
  detail.querySelector('[data-skill-detail-title]').textContent = card.dataset.skillTitle || '';
  detail.querySelector('[data-skill-detail-level]').textContent = card.dataset.skillLevel || '';
  detail.querySelector('[data-skill-detail-text]').textContent = card.dataset.skillDescription || '';
}
```

Also update the icon container by replacing the icon class from `data-skill-icon`.

- [ ] **Step 3: Implement active-state syncing**

Add one function to clear old active states and set the new one:

```javascript
function setActive(card) {
  cards.forEach((item) => {
    item.classList.toggle('is-active', item === card);
    item.setAttribute('aria-pressed', item === card ? 'true' : 'false');
  });

  renderDetail(card);
}
```

- [ ] **Step 4: Bind desktop and mobile-friendly events**

Bind `mouseenter`, `focus`, and `click` to each card:

```javascript
cards.forEach((card) => {
  card.addEventListener('mouseenter', () => setActive(card));
  card.addEventListener('focus', () => setActive(card));
  card.addEventListener('click', () => setActive(card));
});
```

This keeps desktop hover behavior while still working for keyboard and touch interaction.

- [ ] **Step 5: Verify the script syntax**

Run:

```powershell
node --check .\js\homepage-skills.js
```

Expected: no output, exit code `0`.

### Task 4: Verify the integrated homepage section

**Files:**
- Modify: `index.html`
- Modify: `css/portfolio-ux.css`
- Create: `js/homepage-skills.js`
- Verify: `verify-portfolio.ps1`

- [ ] **Step 1: Confirm the new file is referenced correctly**

Run:

```powershell
Get-Content -Path '.\index.html' | Select-String -Pattern 'js/homepage-skills.js'
```

Expected: one script tag for `js/homepage-skills.js`.

- [ ] **Step 2: Run the portfolio verifier**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\verify-portfolio.ps1
```

Expected: `Portfolio verification passed.`

- [ ] **Step 3: Spot-check local rendering through the existing localhost workflow**

Open:

```powershell
Start-Process 'http://localhost:57302/index.html#resume'
```

Expected:
- the new `Skills` section appears where the old tools block was
- desktop shows grid plus detail panel
- mobile stacks cleanly
- hovering or clicking cards updates the panel

- [ ] **Step 4: Commit the feature**

```bash
git add index.html css/portfolio-ux.css js/homepage-skills.js
git commit -m "Build interactive homepage skills section"
```
