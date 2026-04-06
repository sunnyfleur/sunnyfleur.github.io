# Project Detail Auto-Hide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement auto-hide behavior for incomplete project detail sections and keep header/sidebar navigation aligned with only the sections that still render.

**Architecture:** Keep the page on the shared `project.html` + `js/project-page.js` flow, but factor section-visibility decisions into pure helper functions so the visibility rules can be tested outside the browser. Use those helpers to hide empty sections before binding navigation state and before rendering fallback placeholder content.

**Tech Stack:** Static HTML, vanilla JavaScript, Node built-in `node:test`, PowerShell verification script `verify-portfolio.ps1`

---

### Task 1: Add test-first visibility helpers

**Files:**
- Modify: `js/project-page.js`
- Create: `tests/project-page.test.js`

- [ ] **Step 1: Write the failing test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getProjectSectionVisibility,
  getRenderableTextList,
  getRenderableSystems,
  getRenderableGallery,
} = require('../js/project-page.js');

test('getProjectSectionVisibility hides empty optional sections', () => {
  const visibility = getProjectSectionVisibility({
    problem: '   ',
    video: '',
    contributions: ['', '   '],
    systems: [{ title: '', items: ['', ' '] }],
    results: [],
    gallery: [{ title: 'Only caption' }],
  });

  assert.deepEqual(visibility, {
    overview: false,
    video: false,
    contributions: false,
    systems: false,
    results: false,
    gallery: false,
  });
});

test('renderable helpers keep meaningful items only', () => {
  assert.deepEqual(getRenderableTextList(['Own combat', ' ', '', 'Tune pacing']), ['Own combat', 'Tune pacing']);
  assert.equal(getRenderableSystems([
    { title: '', items: ['', ' '] },
    { title: 'Combat', items: ['Own combo timing', ' '] },
  ]).length, 1);
  assert.equal(getRenderableGallery([
    { title: 'No asset yet' },
    { image: 'img/shot.jpg', title: 'Shot' },
  ]).length, 1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/project-page.test.js`
Expected: FAIL because the helper exports do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```js
function getRenderableTextList(items) {
  return asArray(items)
    .map(normalizeText)
    .filter(Boolean);
}

function getRenderableSystems(items) {
  return asArray(items)
    .map((system) => ({
      title: normalizeText(system && system.title),
      items: getRenderableTextList(system && system.items),
    }))
    .filter((system) => system.items.length > 0);
}

function getRenderableGallery(items) {
  return asArray(items).filter((item) => normalizeText(item && (item.image || item.fullImage)));
}

function getProjectSectionVisibility(project) {
  return {
    overview: Boolean(normalizeText(project && project.problem)),
    video: Boolean(normalizeText(project && project.video)),
    contributions: getRenderableTextList(project && project.contributions).length > 0,
    systems: getRenderableSystems(project && project.systems).length > 0,
    results: getRenderableTextList(project && project.results).length > 0,
    gallery: getRenderableGallery(project && project.gallery).length > 0,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/project-page.test.js`
Expected: PASS

### Task 2: Use helper decisions to hide empty sections and sync nav

**Files:**
- Modify: `js/project-page.js`

- [ ] **Step 1: Wire section visibility into the render flow**

```js
const contributions = getRenderableTextList(project.contributions);
const systems = getRenderableSystems(project.systems);
const results = getRenderableTextList(project.results);
const gallery = getRenderableGallery(project.gallery);
const visibility = getProjectSectionVisibility(project);

setSectionVisibility('project-overview', visibility.overview);
setSectionVisibility('project-video-wrap', visibility.video);
setSectionVisibility('project-contributions-anchor', visibility.contributions);
setSectionVisibility('project-systems-anchor', visibility.systems);
setSectionVisibilityByChild('project-results', visibility.results);
setSectionVisibility('project-gallery', visibility.gallery);
```

- [ ] **Step 2: Hide matching nav links in both menus**

```js
setNavVisibility('project-overview', visibility.overview);
setNavVisibility('project-contributions-anchor', visibility.contributions);
setNavVisibility('project-systems-anchor', visibility.systems);
setNavVisibility('project-gallery', visibility.gallery);

var sectionNav = document.querySelector('.project-section-nav');
if (sectionNav) {
  var visibleLinks = Array.from(sectionNav.querySelectorAll('a')).filter((link) => !link.hidden);
  sectionNav.hidden = visibleLinks.length === 0;
}
```

- [ ] **Step 3: Remove placeholder fallback content for hidden sections and keep active-link logic on visible targets only**

```js
if (observedSections.length > 0) {
  // unchanged observer setup, but only for nav links where both link and target are visible
}
```

- [ ] **Step 4: Run targeted verification**

Run: `node --test tests/project-page.test.js`
Expected: PASS

### Task 3: Run portfolio verification and inspect changed files

**Files:**
- Modify: `js/project-page.js`
- Create: `tests/project-page.test.js`

- [ ] **Step 1: Run static portfolio verification**

Run: `powershell -ExecutionPolicy Bypass -File .\verify-portfolio.ps1`
Expected: `Portfolio verification passed.`

- [ ] **Step 2: Review the final diff**

Run: `git diff -- js/project-page.js tests/project-page.test.js`
Expected: only the helper export, visibility logic, and tests for auto-hide behavior.
