# Homepage Multi-Source Video Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add homepage carousel support for YouTube, Google Drive, and local video files while keeping the public `projects.json` schema to a single `video` field.

**Architecture:** Extract media-source detection into a small standalone resolver module that works in both the browser and Node-based verification. Then update the homepage carousel renderer to call the resolver and choose the correct player type: iframe for YouTube and Drive, native `<video>` for local/direct video files, and poster fallback for unsupported values. Keep the project-detail page out of scope for this pass.

**Tech Stack:** Static HTML, vanilla JavaScript, existing homepage carousel markup in `index.html`, `projects.json`, Node for lightweight verification scripts, PowerShell verifier.

---

## File Structure

- **Create:** `js/media-source.js`
  - Shared source resolver with no DOM dependency.
  - Exports functions for Node testing and also exposes a browser global for homepage usage.
- **Modify:** `index.html`
  - Load `js/media-source.js` before `js/portfolio-index.js`.
- **Modify:** `js/portfolio-index.js`
  - Replace the current YouTube-only `buildVideoUrl` path with source-aware rendering.
  - Preserve the current poster-first play interaction.
- **Create:** `tests/media-source-resolver.test.js`
  - Lightweight Node assertions for URL/path inference and normalization.
- **Modify:** `PORTFOLIO-CONTENT.md`
  - Document supported `video` input formats for content authors.

### Task 1: Add a standalone media-source resolver

**Files:**
- Create: `js/media-source.js`
- Create: `tests/media-source-resolver.test.js`

- [ ] **Step 1: Write the failing Node test for resolver behavior**

Create `tests/media-source-resolver.test.js` with exact assertions like:

```javascript
const assert = require('node:assert/strict');
const { resolveMediaSource } = require('../js/media-source.js');

assert.deepEqual(
  resolveMediaSource('https://www.youtube.com/watch?v=OjqH6ry5Txc').kind,
  'youtube'
);

assert.equal(
  resolveMediaSource('https://drive.google.com/file/d/FILE123/view?usp=sharing').embedSrc,
  'https://drive.google.com/file/d/FILE123/preview'
);

assert.equal(
  resolveMediaSource('img/previews/demo.mp4').kind,
  'file'
);

assert.equal(
  resolveMediaSource('').kind,
  'unknown'
);

console.log('media-source resolver tests passed');
```

- [ ] **Step 2: Run the test to confirm it fails before implementation**

Run:

```powershell
node .\tests\media-source-resolver.test.js
```

Expected: FAIL because `js/media-source.js` does not exist yet or `resolveMediaSource` is undefined.

- [ ] **Step 3: Implement the resolver module**

Create `js/media-source.js` with a structure like:

```javascript
(function (globalScope) {
  function normalizeYouTube(url) {
    // return { kind: 'youtube', src, embedSrc, id }
  }

  function normalizeDrive(url) {
    // return { kind: 'drive', src, embedSrc, id }
  }

  function normalizeFile(path) {
    // return { kind: 'file', src, embedSrc: path }
  }

  function resolveMediaSource(input) {
    const value = String(input || '').trim();
    if (!value) return { kind: 'unknown', src: '', embedSrc: '' };
    // detect youtube / drive / file / unknown
  }

  const api = { resolveMediaSource };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  globalScope.PortfolioMediaSource = api;
})(typeof window !== 'undefined' ? window : globalThis);
```

The implemented detection must support:
- `youtube.com/embed/...`
- `youtube.com/watch?v=...`
- `youtu.be/...`
- `drive.google.com/file/d/<id>/view`
- `drive.google.com/open?id=<id>`
- `drive.google.com/uc?id=<id>`
- direct/local `.mp4`, `.webm`, `.mov`

- [ ] **Step 4: Run the resolver test again**

Run:

```powershell
node .\tests\media-source-resolver.test.js
```

Expected: PASS with `media-source resolver tests passed`.

- [ ] **Step 5: Commit the isolated resolver work**

```bash
git add js/media-source.js tests/media-source-resolver.test.js
git commit -m "Add homepage media source resolver"
```

### Task 2: Integrate the resolver into the homepage carousel

**Files:**
- Modify: `index.html`
- Modify: `js/portfolio-index.js`

- [ ] **Step 1: Load the resolver before the homepage carousel script**

Update `index.html` so script order includes:

```html
<script src="js/media-source.js"></script>
<script src="js/portfolio-index.js"></script>
```

- [ ] **Step 2: Remove the current YouTube-only helpers from `js/portfolio-index.js`**

Delete or replace the existing functions:

```javascript
function extractVideoId(embedUrl) { ... }
function buildVideoUrl(embedUrl) { ... }
```

Replace them with calls to `window.PortfolioMediaSource.resolveMediaSource(project.video)`.

- [ ] **Step 3: Add source-aware media URL builders**

Inside `js/portfolio-index.js`, create narrow helpers such as:

```javascript
function buildYouTubePlayerUrl(resolved) {
  const separator = resolved.embedSrc.includes('?') ? '&' : '?';
  const playlist = resolved.id ? '&playlist=' + resolved.id : '';
  return resolved.embedSrc + separator + 'autoplay=1&mute=1&controls=1&loop=1' + playlist + '&playsinline=1&rel=0&modestbranding=1';
}

function buildDrivePlayerUrl(resolved) {
  const separator = resolved.embedSrc.includes('?') ? '&' : '?';
  return resolved.embedSrc + separator + 'usp=sharing';
}
```

- [ ] **Step 4: Update `mediaTemplate` to render by source kind**

Implement rendering like:

```javascript
function mediaTemplate(project, isPlaying) {
  const resolved = window.PortfolioMediaSource.resolveMediaSource(project.video);

  if (isPlaying && resolved.kind === 'youtube') {
    return `<iframe class="portfolio-feature-card__video" src="${buildYouTubePlayerUrl(resolved)}" ...></iframe>`;
  }

  if (isPlaying && resolved.kind === 'drive') {
    return `<iframe class="portfolio-feature-card__video" src="${buildDrivePlayerUrl(resolved)}" ...></iframe>`;
  }

  if (isPlaying && resolved.kind === 'file') {
    return `<video class="portfolio-feature-card__video" src="${resolved.embedSrc}" autoplay muted controls loop playsinline></video>`;
  }

  return posterTemplate(project, resolved.kind !== 'unknown');
}
```

Keep the current stop button behavior for active media.

- [ ] **Step 5: Verify the homepage script syntax**

Run:

```powershell
node --check .\js\portfolio-index.js
```

Expected: no output, exit code `0`.

### Task 3: Document the authoring workflow and verify the integrated result

**Files:**
- Modify: `PORTFOLIO-CONTENT.md`
- Verify: `verify-portfolio.ps1`
- Verify: local homepage preview

- [ ] **Step 1: Add author guidance for `video` values**

Append a concise section to `PORTFOLIO-CONTENT.md` with concrete accepted examples:

```markdown
## Video Sources

The `video` field accepts:
- YouTube watch URLs
- YouTube embed URLs
- Google Drive share URLs
- local `.mp4`, `.webm`, or `.mov` paths
```

Also include one example for each supported form.

- [ ] **Step 2: Re-run the homepage data verifier**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\verify-portfolio.ps1
```

Expected: `Portfolio verification passed.`

- [ ] **Step 3: Spot-check the homepage locally**

Open:

```powershell
Start-Process 'http://localhost:57302/index.html#portfolio'
```

Expected:
- existing YouTube embed URLs still play
- YouTube watch URLs now play
- Google Drive share URLs open in-card as iframe previews
- local video files play in a native `<video>` player
- unsupported values stay on the poster instead of showing a broken embed

- [ ] **Step 4: Commit the integration pass**

```bash
git add index.html js/portfolio-index.js PORTFOLIO-CONTENT.md
git commit -m "Support multi-source homepage preview videos"
```
