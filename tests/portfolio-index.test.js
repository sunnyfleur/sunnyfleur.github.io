const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  getFeaturedProjects,
  getPortfolioProjects,
  getPortfolioFilters,
  projectMatchesFilter,
  selectSpotlightProject,
} = require('../js/portfolio-index.js');

function getProjectGalleryCount(project) {
  const groupedItems = Array.isArray(project.galleryGroups)
    ? project.galleryGroups.flatMap((group) => Array.isArray(group.items) ? group.items : [])
    : [];

  if (groupedItems.length > 0) {
    return groupedItems.length;
  }

  return Array.isArray(project.gallery) ? project.gallery.length : 0;
}
const sampleProjects = [
  {
    slug: 'space-conqueror',
    title: 'Space Conqueror',
    featured: true,
    year: '2024',
    filters: ['featured', 'prototype', 'unity'],
  },
  {
    slug: 'farm-match',
    title: 'FarmMatch',
    featured: false,
    year: '2025',
    filters: ['archive', 'mobile', 'match'],
  },
  {
    slug: 'huli',
    title: 'Huli',
    featured: true,
    year: '2025',
    filters: ['featured', 'action'],
  },
];

test('getFeaturedProjects returns only featured entries sorted by year descending', () => {
  assert.deepEqual(
    getFeaturedProjects(sampleProjects).map((project) => project.slug),
    ['huli', 'space-conqueror']
  );
});

test('getPortfolioProjects returns all entries sorted by year descending', () => {
  assert.deepEqual(
    getPortfolioProjects(sampleProjects).map((project) => project.slug),
    ['farm-match', 'huli', 'space-conqueror']
  );
});

test('getPortfolioFilters builds an all option plus curated filters only', () => {
  assert.deepEqual(
    getPortfolioFilters(sampleProjects),
    [
      { value: 'all', label: 'All Projects' },
      { value: 'featured', label: 'Featured' },
      { value: 'archive', label: 'Archive' },
      { value: 'mobile', label: 'Mobile' },
      { value: 'prototype', label: 'Prototype' },
    ]
  );
});

test('projectMatchesFilter uses featured property and curated filter values only', () => {
  assert.equal(projectMatchesFilter(sampleProjects[2], 'featured'), true);
  assert.equal(projectMatchesFilter(sampleProjects[2], 'archive'), false);
  assert.equal(projectMatchesFilter(sampleProjects[0], 'prototype'), true);
  assert.equal(projectMatchesFilter(sampleProjects[0], 'unity'), false);
  assert.equal(projectMatchesFilter(sampleProjects[1], 'mobile'), true);
});

test('selectSpotlightProject falls back safely when the requested project is missing', () => {
  assert.equal(
    selectSpotlightProject(sampleProjects, 'farm-match').slug,
    'farm-match'
  );

  assert.equal(
    selectSpotlightProject(sampleProjects, 'missing-slug').slug,
    'farm-match'
  );
});

test('homepage portfolio section no longer renders the featured carousel markup', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.match(html, /id="portfolio-explorer"/);
  assert.doesNotMatch(html, /id="portfolio-carousel"/);
  assert.doesNotMatch(html, /id="portfolio-carousel-track"/);
});

test('portfolio explorer script updates spotlight from grid hover and focus', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'portfolio-index.js'), 'utf8');

  assert.match(source, /data-portfolio-project=/);
  assert.equal(source.includes("cardGridRoot.addEventListener('pointerenter'"), true);
  assert.equal(source.includes("cardGridRoot.addEventListener('focusin'"), true);
});

test('portfolio explorer uses the View Transition API for spotlight changes', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'portfolio-index.js'), 'utf8');

  assert.match(source, /function runPortfolioViewTransition/);
  assert.match(source, /document\.startViewTransition/);
  assert.match(source, /prefers-reduced-motion:\s*reduce/);
  assert.match(source, /runPortfolioViewTransition\(\(\) => \{/);
});

test('portfolio hover spotlight changes do not trigger root view transitions', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'portfolio-index.js'), 'utf8');
  const updateMatch = source.match(/function updateSpotlightFromCard\(card\) \{([\s\S]*?)\n        \}\n\n        filtersRoot/);

  assert.ok(updateMatch, 'Expected updateSpotlightFromCard to exist.');
  assert.doesNotMatch(updateMatch[1], /runPortfolioViewTransition/);
  assert.match(updateMatch[1], /renderSpotlight\(filteredProjects\)/);
  assert.match(updateMatch[1], /syncActiveCards\(\)/);
});

test('portfolio spotlight supports playable video previews', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'portfolio-index.js'), 'utf8');

  assert.match(source, /data-play-preview=/);
  assert.match(source, /data-stop-preview=/);
  assert.equal(source.includes("spotlightRoot.addEventListener('click'"), true);
  assert.match(source, /PortfolioMediaSource/);
});

test('portfolio spotlight uses short homepage copy before full project summary', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'portfolio-index.js'), 'utf8');
  const spotlightTemplateMatch = source.match(/function buildSpotlightTemplate\(project, isPlaying\) \{([\s\S]*?)function buildCardTemplate/);

  assert.ok(spotlightTemplateMatch, 'Expected buildSpotlightTemplate to exist.');
  assert.match(
    spotlightTemplateMatch[1],
    /const summary = normalizeText\(project && project\.cardSummary\)\s*\|\|\s*normalizeText\(project && project\.summary\)/,
    'Homepage spotlight should not render the full case-study summary before the CTA.'
  );
});

test('portfolio spotlight prioritizes lightweight thumbnail posters', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'portfolio-index.js'), 'utf8');

  assert.match(
    source,
    /const poster = normalizeText\(project && project\.thumbnail\)\s*\|\|\s*normalizeText\(project && project\.heroImage\)/,
    'Homepage spotlight should render the optimized thumbnail before falling back to the full hero image.'
  );
  assert.match(source, /loading="eager"/);
  assert.match(source, /fetchpriority="high"/);
});

test('portfolio explorer uses hover intent before changing spotlight from pointer movement', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'portfolio-index.js'), 'utf8');

  assert.match(source, /const hoverIntentDelay = 150;/);
  assert.match(source, /clearHoverIntent/);
  assert.equal(source.includes("cardGridRoot.addEventListener('pointerleave'"), true);
  assert.equal(source.includes('setTimeout(() => {'), true);
});

test('portfolio explorer defines GSAP motion hooks for spotlight and card-grid updates', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'portfolio-index.js'), 'utf8');

  assert.match(source, /function hasMotionSupport\(\)/);
  assert.match(source, /function refreshPortfolioMotion\(\)/);
  assert.match(source, /function animatePortfolioExplorerMotion/);
  assert.match(source, /function animatePortfolioSpotlight/);
  assert.match(source, /\.portfolio-spotlight__media/);
  assert.match(source, /\.portfolio-spotlight__body > \*/);
  assert.match(source, /\.portfolio-card/);
  assert.match(source, /autoAlpha:\s*0/);
  assert.match(source, /scale:\s*0\.985/);
  assert.match(source, /stagger:\s*0\.05/);
  assert.match(source, /ScrollTrigger\.refresh/);
});

test('projects data remaps renamed entries to canonical slugs and synced gallery counts', () => {
  const payload = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'projects.json'), 'utf8'));
  const slugs = payload.projects.map((project) => project.slug);
  const farmMatch = payload.projects.find((project) => project.slug === 'farm-match');
  const satisdom = payload.projects.find((project) => project.slug === 'satisdom');
  const goodSort = payload.projects.find((project) => project.slug === 'good-sort');
  const screw = payload.projects.find((project) => project.slug === 'screw');
  const tank = payload.projects.find((project) => project.slug === 'tank');
  const lunarfall = payload.projects.find((project) => project.slug === 'lunarfall-pixel-strategy');

  assert.equal(slugs.includes('bubble-jam'), false);
  assert.equal(slugs.includes('perfect-tidy'), false);
  assert.equal(slugs.includes('fantasy-tactics'), false);

  assert.deepEqual(farmMatch.legacySlugs, ['bubble-jam']);
  assert.equal(farmMatch.thumbnail, 'img/ExampleImages/Thumbs/IM_FarmMatch.jpg');
  assert.equal(farmMatch.video, 'https://drive.google.com/file/d/19SgqRr6oOtx2y5FhDHgH9FDQ3AhO8jeF/preview');
  assert.equal(getProjectGalleryCount(farmMatch), 17);

  assert.deepEqual(satisdom.legacySlugs, ['perfect-tidy']);
  assert.equal(satisdom.thumbnail, 'img/ExampleImages/Thumbs/IM_Satisdom.jpg');
  assert.equal(satisdom.video, 'https://drive.google.com/file/d/1_thUFjzXz22vo3iAT_d92b5mwvyZyK8r/preview');
  assert.equal(getProjectGalleryCount(satisdom), 30);

  assert.deepEqual(lunarfall.legacySlugs, ['fantasy-tactics']);
  assert.equal(getProjectGalleryCount(goodSort), 65);
  assert.equal(getProjectGalleryCount(screw), 35);
  assert.equal(getProjectGalleryCount(tank), 1);
});

test('homepage project thumbnails stay lightweight', () => {
  const payload = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'projects.json'), 'utf8'));
  const maxThumbnailBytes = 250 * 1024;

  for (const project of payload.projects) {
    const thumbnail = project.thumbnail || '';

    if (!thumbnail || /^https?:\/\//.test(thumbnail)) {
      continue;
    }

    const thumbnailPath = path.join(__dirname, '..', thumbnail);
    const stats = fs.statSync(thumbnailPath);

    assert.ok(
      stats.size <= maxThumbnailBytes,
      `${project.slug} thumbnail is ${stats.size} bytes; expected <= ${maxThumbnailBytes}.`
    );
  }
});


