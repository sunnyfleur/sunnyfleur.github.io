# Homepage Project Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current homepage project explorer with a theme-matched featured carousel that feels closer to the reference portfolio: large media-first cards, autoplay muted video on the active card, clear previous/next controls, and direct links into each case study.

**Architecture:** Keep the homepage project section fully data-driven from `projects.json`, but swap the current `filters + spotlight + grid` shell for a `featured rail` shell rendered by `js/portfolio-index.js`. The active card owns the motion state and video playback, while neighboring cards stay on still poster images to keep performance and readability under control.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, `projects.json`, `verify-portfolio.ps1`, GitHub Pages-compatible asset loading

---

## File Structure

**Primary files**
- Modify: `c:/Project/sunnyfleur.github.io/index.html`
- Modify: `c:/Project/sunnyfleur.github.io/js/portfolio-index.js`
- Modify: `c:/Project/sunnyfleur.github.io/css/portfolio-ux.css`
- Modify: `c:/Project/sunnyfleur.github.io/projects.json`
- Modify: `c:/Project/sunnyfleur.github.io/verify-portfolio.ps1`
- Modify: `c:/Project/sunnyfleur.github.io/PORTFOLIO-CONTENT.md`

**Responsibilities**
- `index.html`: homepage portfolio section markup and accessible control containers
- `js/portfolio-index.js`: homepage featured-project rendering, carousel state, active-card media behavior, controls, and responsive logic
- `css/portfolio-ux.css`: carousel layout, card styling, video aspect ratios, arrow controls, and mobile responsive behavior
- `projects.json`: source of truth for card content, preview media, CTA metadata, and which projects appear in the homepage carousel
- `verify-portfolio.ps1`: static verification for required carousel selectors, featured project data, and preview media URLs
- `PORTFOLIO-CONTENT.md`: maintainer-facing instructions for adding homepage project videos and metadata

**Implementation constraints**
- Do not reintroduce hardcoded project cards in `index.html`.
- Keep `project.html` and `js/project-page.js` out of scope for this pass.
- Keep the section visually aligned with the current site theme rather than copying the reference colors directly.
- The current data has only **two** `featured: true` projects with videos. The renderer must support `2+` featured items gracefully instead of assuming exactly three.

---

### Task 1: Lock the homepage carousel data contract

**Files:**
- Modify: `c:/Project/sunnyfleur.github.io/projects.json`
- Modify: `c:/Project/sunnyfleur.github.io/PORTFOLIO-CONTENT.md`
- Modify: `c:/Project/sunnyfleur.github.io/verify-portfolio.ps1`

- [ ] **Step 1: Add failing verification rules for the new homepage data contract**

Add checks in `verify-portfolio.ps1` for:
- at least `2` featured projects
- every featured project has `slug`, `title`, `thumbnail`, `summary`, `video` or `heroImage`
- optional homepage-specific metadata is validated when present

Planned verification fragment:

```powershell
$projects = (Get-Content $projectsPath -Raw | ConvertFrom-Json).projects
$featured = @($projects | Where-Object { $_.featured -eq $true })

if ($featured.Count -lt 2) {
  throw "Homepage carousel requires at least 2 featured projects."
}

foreach ($project in $featured) {
  foreach ($requiredField in @('slug', 'title', 'thumbnail', 'summary')) {
    if (-not $project.$requiredField) {
      throw "Featured project '$($project.slug)' is missing '$requiredField'."
    }
  }

  if (-not $project.video -and -not $project.heroImage) {
    throw "Featured project '$($project.slug)' needs a video or heroImage for the homepage carousel."
  }
}
```

- [ ] **Step 2: Run verification to confirm it fails before the data/schema updates**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\verify-portfolio.ps1
```

Expected:
- FAIL if the current file shape does not yet match the new checks

- [ ] **Step 3: Add homepage-specific fields to featured entries only when needed**

Extend `projects.json` conservatively. Reuse existing fields where possible, and only add new keys for homepage behavior that cannot be derived from existing data.

Target shape:

```json
{
  "slug": "space-conqueror",
  "featured": true,
  "thumbnail": "img/ExampleImages/IM_SpaceConqueror.jpg",
  "video": "https://www.youtube.com/embed/PD-p8LtxGlE",
  "homepageMeta": {
    "duration": "2024",
    "linkLabel": "Case Study"
  },
  "cardSummary": "Space-themed combat prototype focused on encounter pacing, enemy behavior, and multiplayer-ready systems."
}
```

Notes:
- `cardSummary` should be shorter than `summary`
- `homepageMeta.duration` can hold a `year`, `production length`, or short label depending on the project
- keep `video` as the embeddable YouTube URL for active-card playback

- [ ] **Step 4: Update the maintainer guide so future edits stay consistent**

Add a short homepage-carousel section to `PORTFOLIO-CONTENT.md`:

```md
### Homepage featured carousel

- Set `featured: true` to include a project in the homepage carousel.
- Use `cardSummary` for the short homepage card copy.
- Use the embeddable YouTube URL in `video` if the card should play inline on hover/active state.
- Keep featured card copy short enough to fit in 3 lines on desktop.
```

- [ ] **Step 5: Re-run verification and confirm the data contract is green**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\verify-portfolio.ps1
```

Expected:
- PASS for data checks
- markup-related checks may still fail until Task 2 is complete

- [ ] **Step 6: Commit**

```bash
git add projects.json PORTFOLIO-CONTENT.md verify-portfolio.ps1
git commit -m "Define homepage project carousel data contract"
```

---

### Task 2: Replace the homepage portfolio markup shell

**Files:**
- Modify: `c:/Project/sunnyfleur.github.io/index.html`
- Modify: `c:/Project/sunnyfleur.github.io/verify-portfolio.ps1`

- [ ] **Step 1: Write failing verification for the new homepage carousel DOM**

Add checks that `index.html` contains the new root IDs and control hooks:

```powershell
$indexHtml = Get-Content $indexPath -Raw

foreach ($requiredId in @(
  'portfolio-carousel',
  'portfolio-carousel-track',
  'portfolio-carousel-prev',
  'portfolio-carousel-next',
  'portfolio-carousel-status'
)) {
  if ($indexHtml -notmatch "id=`"$requiredId`"") {
    throw "index.html is missing #$requiredId."
  }
}
```

- [ ] **Step 2: Run verification to confirm the markup check fails**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\verify-portfolio.ps1
```

Expected:
- FAIL with missing carousel IDs

- [ ] **Step 3: Replace the current explorer markup with a carousel shell**

Swap the current `portfolio-explorer` structure in `index.html` for a single featured-carousel shell.

Target markup:

```html
<div class="portfolio-carousel" id="portfolio-carousel" aria-roledescription="carousel">
  <div class="portfolio-carousel__head">
    <div class="portfolio-carousel__copy">
      <p class="h2__subtitle animate-in-up">Featured Projects</p>
      <h2 class="h2__title animate-in-up">Selected work with live preview motion</h2>
      <p class="h2__text animate-in-up">Browse key projects through large media cards, then open the full case study when one catches your eye.</p>
    </div>
    <div class="portfolio-carousel__controls">
      <button id="portfolio-carousel-prev" class="portfolio-carousel__arrow btn" type="button" aria-label="Show previous projects"></button>
      <button id="portfolio-carousel-next" class="portfolio-carousel__arrow btn" type="button" aria-label="Show next projects"></button>
    </div>
  </div>
  <div class="portfolio-carousel__viewport">
    <div id="portfolio-carousel-track" class="portfolio-carousel__track" aria-live="polite"></div>
  </div>
  <p id="portfolio-carousel-status" class="portfolio-carousel__status" aria-live="polite"></p>
</div>
```

- [ ] **Step 4: Keep the section wrapper and anchor stable**

Preserve:
- `<section id="portfolio" ...>`
- existing section title block placement
- surrounding `.content__block` wrappers used by the rest of the page

Do **not** preserve:
- `#portfolio-filters`
- `#portfolio-spotlight`
- `#portfolio-explorer`
- `#portfolio-empty`

- [ ] **Step 5: Re-run verification and confirm the DOM contract is green**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\verify-portfolio.ps1
```

Expected:
- PASS for carousel IDs
- JS behavior still incomplete until Task 3

- [ ] **Step 6: Commit**

```bash
git add index.html verify-portfolio.ps1
git commit -m "Replace homepage project explorer markup with carousel shell"
```

---

### Task 3: Rebuild the homepage renderer around a featured carousel

**Files:**
- Modify: `c:/Project/sunnyfleur.github.io/js/portfolio-index.js`
- Test: `c:/Project/sunnyfleur.github.io/verify-portfolio.ps1`

- [ ] **Step 1: Replace the current root queries with carousel root queries**

Update the startup selectors:

```js
const carouselRoot = document.getElementById("portfolio-carousel");
const trackRoot = document.getElementById("portfolio-carousel-track");
const prevButton = document.getElementById("portfolio-carousel-prev");
const nextButton = document.getElementById("portfolio-carousel-next");
const statusRoot = document.getElementById("portfolio-carousel-status");

if (!carouselRoot || !trackRoot || !prevButton || !nextButton || !statusRoot) {
  return;
}
```

- [ ] **Step 2: Limit homepage rendering to featured projects and support variable counts**

Create a `featuredProjects` list:

```js
const featuredProjects = projects
  .filter((project) => project.featured)
  .sort((left, right) => Number(right.year || 0) - Number(left.year || 0));

const visibleCount = window.matchMedia("(min-width: 1200px)").matches ? Math.min(3, featuredProjects.length) : 1;
```

Rules:
- desktop: up to `3` visible cards
- tablet: `2`
- mobile: `1`
- do not duplicate cards to fake a third slide

- [ ] **Step 3: Add card markup for media-first featured cards**

Use a lean card template:

```js
function cardTemplate(project, isActive) {
  const summary = project.cardSummary || project.summary;
  const mediaMarkup = isActive && project.video
    ? `<iframe class="portfolio-feature-card__video" src="${videoUrl(project.video)}" title="${project.title} preview video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`
    : `<img class="portfolio-feature-card__image" src="${project.thumbnail || fallbackImage}" alt="${project.title} preview" loading="lazy" decoding="async">`;

  return `
    <article class="portfolio-feature-card${isActive ? " is-active" : ""}">
      <a class="portfolio-feature-card__link" href="${projectUrl(project.slug)}" aria-label="Open ${project.title}">
        <div class="portfolio-feature-card__media">
          ${mediaMarkup}
          <span class="portfolio-feature-card__play" aria-hidden="true"></span>
        </div>
        <div class="portfolio-feature-card__body">
          <h3 class="portfolio-feature-card__title">${project.title}</h3>
          <div class="portfolio-feature-card__meta">
            <span>${project.homepageMeta?.duration || project.year}</span>
            <span>${project.homepageMeta?.linkLabel || project.type}</span>
          </div>
          <p class="portfolio-feature-card__summary">${summary}</p>
          <span class="portfolio-feature-card__cta">View Case Study</span>
        </div>
      </a>
    </article>
  `;
}
```

- [ ] **Step 4: Add carousel state, controls, and status updates**

Implement index-based controls:

```js
let activeIndex = 0;

function clampIndex(nextIndex) {
  if (featuredProjects.length <= visibleCount) return 0;
  if (nextIndex < 0) return featuredProjects.length - visibleCount;
  if (nextIndex > featuredProjects.length - visibleCount) return 0;
  return nextIndex;
}

function updateStatus() {
  const page = activeIndex + 1;
  const pages = Math.max(1, featuredProjects.length - visibleCount + 1);
  statusRoot.textContent = `Showing ${page} of ${pages}`;
}

prevButton.addEventListener("click", () => {
  activeIndex = clampIndex(activeIndex - 1);
  render();
});

nextButton.addEventListener("click", () => {
  activeIndex = clampIndex(activeIndex + 1);
  render();
});
```

- [ ] **Step 5: Convert YouTube embed URLs into muted autoplay preview URLs**

Use a small helper so only the active card plays:

```js
function videoUrl(embedUrl) {
  const separator = embedUrl.includes("?") ? "&" : "?";
  return `${embedUrl}${separator}autoplay=1&mute=1&controls=0&loop=1&playlist=${extractVideoId(embedUrl)}&playsinline=1&rel=0&modestbranding=1`;
}

function extractVideoId(embedUrl) {
  return embedUrl.split("/embed/")[1]?.split("?")[0] || "";
}
```

Behavior:
- active card: autoplay muted loop iframe
- inactive cards: still image only
- no hover autoplay for side cards

- [ ] **Step 6: Add responsive re-rendering**

Re-render when breakpoints change:

```js
let currentMode = getViewportMode();

window.addEventListener("resize", () => {
  const nextMode = getViewportMode();
  if (nextMode !== currentMode) {
    currentMode = nextMode;
    activeIndex = 0;
    render();
  }
});
```

- [ ] **Step 7: Run JS syntax verification**

Run:

```powershell
node --check .\js\portfolio-index.js
```

Expected:
- PASS with no syntax errors

- [ ] **Step 8: Run static verification**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\verify-portfolio.ps1
```

Expected:
- PASS for data and markup

- [ ] **Step 9: Commit**

```bash
git add js/portfolio-index.js verify-portfolio.ps1
git commit -m "Render homepage featured project carousel"
```

---

### Task 4: Restyle the homepage project section to match the site theme

**Files:**
- Modify: `c:/Project/sunnyfleur.github.io/css/portfolio-ux.css`

- [ ] **Step 1: Remove obsolete explorer rules**

Delete or replace rules for:

```css
.portfolio-explorer {}
.portfolio-explorer__controls {}
.portfolio-explorer__layout {}
.portfolio-spotlight {}
.portfolio-card-grid {}
.portfolio-card {}
```

Keep only rules still used elsewhere.

- [ ] **Step 2: Add the new carousel shell styles**

Create new layout rules:

```css
.portfolio-carousel {
  display: grid;
  gap: 1.8rem;
}

.portfolio-carousel__head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1.5rem;
}

.portfolio-carousel__viewport {
  overflow: hidden;
}

.portfolio-carousel__track {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: calc((100% - 2.4rem) / 3);
  gap: 1.2rem;
  transition: transform 0.28s ease;
}
```

- [ ] **Step 3: Add featured-card styles with theme-matched media and CTA**

Add card rules:

```css
.portfolio-feature-card {
  overflow: hidden;
  border-radius: 3rem;
  border: 1px solid var(--stroke-elements);
  background: linear-gradient(180deg, var(--base-tint) 0%, var(--base) 100%);
  box-shadow: 0 18px 40px rgba(15, 23, 35, 0.12);
}

.portfolio-feature-card__media {
  position: relative;
  aspect-ratio: 4 / 3.35;
  overflow: hidden;
}

.portfolio-feature-card__video,
.portfolio-feature-card__image {
  width: 100%;
  height: 100%;
  border: 0;
  object-fit: cover;
  display: block;
}
```

- [ ] **Step 4: Style the active-card video state and inactive poster state**

Add contrast between active and side cards:

```css
.portfolio-feature-card:not(.is-active) .portfolio-feature-card__media::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(17, 23, 35, 0.04), rgba(17, 23, 35, 0.18));
}

.portfolio-feature-card__play {
  position: absolute;
  inset: 50% auto auto 50%;
  width: 7.2rem;
  height: 7.2rem;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%);
}
```

- [ ] **Step 5: Add arrow controls, desktop density, and responsive breakpoints**

Desktop/tablet/mobile layout targets:

```css
@media (max-width: 1199px) {
  .portfolio-carousel__track {
    grid-auto-columns: calc((100% - 1.2rem) / 2);
  }
}

@media (max-width: 767px) {
  .portfolio-carousel__head {
    align-items: start;
    flex-direction: column;
  }

  .portfolio-carousel__track {
    grid-auto-columns: 100%;
  }
}
```

- [ ] **Step 6: Run a selector sanity check**

Run:

```powershell
rg -n "portfolio-carousel|portfolio-feature-card" index.html css\portfolio-ux.css js\portfolio-index.js
```

Expected:
- selectors exist in all three files
- no stale references to removed explorer IDs remain in JS

- [ ] **Step 7: Commit**

```bash
git add css/portfolio-ux.css
git commit -m "Style homepage featured project carousel"
```

---

### Task 5: Verify the homepage carousel end-to-end

**Files:**
- Modify: `c:/Project/sunnyfleur.github.io/verify-portfolio.ps1` (only if missing a final homepage check)

- [ ] **Step 1: Run full static verification**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\verify-portfolio.ps1
```

Expected:
- PASS with no missing files, IDs, or featured-project contract errors

- [ ] **Step 2: Run JS syntax checks**

Run:

```powershell
node --check .\js\portfolio-index.js
node --check .\js\project-page.js
```

Expected:
- PASS for both files

- [ ] **Step 3: Manual browser verification checklist**

Open:

```powershell
start index.html
```

Confirm manually:
- desktop shows `2` or `3` cards depending on available featured items
- only the active card plays muted inline video
- inactive cards show still poster images
- `prev` and `next` move the visible window correctly
- clicking any card opens `project.html?slug=...`
- mobile collapses to one card per view without cropped controls
- no overlap with the sticky site header

- [ ] **Step 4: Final regression scan**

Run:

```powershell
git diff --stat
git status --short
```

Expected:
- only planned homepage-carousel files changed

- [ ] **Step 5: Commit**

```bash
git add index.html js/portfolio-index.js css/portfolio-ux.css projects.json PORTFOLIO-CONTENT.md verify-portfolio.ps1
git commit -m "Launch homepage featured project carousel"
```

---

## Self-Review

**Spec coverage**
- homepage section layout replacement: covered in Tasks 2 and 4
- active-card autoplay video behavior: covered in Task 3
- data-driven content flow from `projects.json`: covered in Task 1
- theme alignment and responsive layout: covered in Task 4
- verification and maintainability: covered in Tasks 1 and 5

**Placeholder scan**
- No `TBD`, `TODO`, or “implement later” placeholders remain in the task steps
- The current content limitation (only two featured video projects) is explicitly called out as a constraint, not left ambiguous

**Type consistency**
- `portfolio-carousel*` DOM IDs are used consistently across HTML, JS, and verification
- `cardSummary` and `homepageMeta` are the only new homepage-specific data fields proposed in the plan
