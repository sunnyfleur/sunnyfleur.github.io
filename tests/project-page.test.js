const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  findProjectBySlug,
  getProjectSectionVisibility,
  getProjectGalleryModel,
  getGalleryImageOrientation,
  getGalleryLayoutVariant,
  normalizeGalleryLayout,
  hasRenderableLinks,
  getRenderableTextList,
  getRenderableSystems,
  getRenderableGallery,
  normalizePhotoSwipeSize,
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
  assert.deepEqual(
    getRenderableTextList(['Own combat', ' ', '', 'Tune pacing']),
    ['Own combat', 'Tune pacing']
  );

  assert.equal(
    getRenderableSystems([
      { title: '', items: ['', ' '] },
      { title: 'Combat', items: ['Own combo timing', ' '] },
    ]).length,
    1
  );

  assert.equal(
    getRenderableGallery([
      { title: 'No asset yet' },
      { image: 'img/shot.jpg', title: 'Shot' },
    ]).length,
    1
  );
});


test('project gallery model uses grouped gallery data only when multiple valid groups exist', () => {
  const groupedModel = getProjectGalleryModel({
    galleryGroups: [
      {
        title: 'Level Design',
        intro: 'Puzzle board exploration and sequencing.',
        items: [
          { image: 'img/level-01.png', title: 'Board 01' },
        ],
      },
      {
        title: 'Data Extraction',
        intro: 'Spreadsheet and level tracking artifacts.',
        items: [
          { image: 'img/data-01.png', title: 'Tracking Sheet', layout: 'wide' },
        ],
      },
    ],
  });

  assert.equal(groupedModel.mode, 'grouped');
  assert.equal(groupedModel.groups.length, 2);
  assert.equal(groupedModel.groups[0].title, 'Level Design');
  assert.equal(groupedModel.groups[0].intro, 'Puzzle board exploration and sequencing.');
  assert.equal(groupedModel.groups[1].items[0].layout, 'wide');

  const singleGroupFallback = getProjectGalleryModel({
    galleryGroups: [
      {
        title: 'Only Group',
        intro: 'Should render like the legacy flat gallery.',
        items: [
          { image: 'img/only-group.png', title: 'Only Item' },
        ],
      },
    ],
  });

  assert.equal(singleGroupFallback.mode, 'flat');
  assert.equal(singleGroupFallback.groups.length, 0);
  assert.equal(singleGroupFallback.items.length, 1);
});

test('project section visibility treats grouped gallery content as renderable gallery media', () => {
  const visibility = getProjectSectionVisibility({
    gallery: [],
    galleryGroups: [
      {
        title: 'Level Design',
        intro: 'Puzzle board exploration and sequencing.',
        items: [
          { image: 'img/level-01.png', title: 'Board 01' },
        ],
      },
      {
        title: 'Data Extraction',
        intro: 'Spreadsheet and level tracking artifacts.',
        items: [
          { image: 'img/data-01.png', title: 'Tracking Sheet' },
        ],
      },
    ],
  });

  assert.equal(visibility.gallery, true);
});

test('farm-match detail gallery uses lightweight thumbnails with full-size lightbox images', () => {
  const payload = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'projects.json'), 'utf8'));
  const farmMatch = payload.projects.find((project) => project.slug === 'farm-match');
  const maxThumbnailBytes = 70 * 1024;

  assert.ok(farmMatch, 'Expected farm-match project to exist.');
  assert.ok(Array.isArray(farmMatch.gallery), 'Expected farm-match to use a flat gallery.');

  for (const item of farmMatch.gallery) {
    assert.match(item.image, /^img\/ExampleImages\/FarmMatch\/Thumbs\//);
    assert.doesNotMatch(item.fullImage, /\/Thumbs\//);
    assert.notEqual(item.image, item.fullImage);

    const thumbnailPath = path.join(__dirname, '..', item.image);
    const stats = fs.statSync(thumbnailPath);

    assert.ok(
      stats.size <= maxThumbnailBytes,
      `${item.image} is ${stats.size} bytes; expected <= ${maxThumbnailBytes}.`
    );
  }
});
test('hero actions stay hidden when a project has no valid links', () => {
  assert.equal(hasRenderableLinks([]), false);
  assert.equal(hasRenderableLinks([{ label: 'Broken link only' }]), false);
  assert.equal(
    hasRenderableLinks([{ label: 'Case Study', url: 'https://example.com/case-study' }]),
    true
  );
});

test('gallery helpers normalize lightbox size strings and infer orientation', () => {
  assert.equal(normalizePhotoSwipeSize(' 251x478 '), '251x478');
  assert.equal(normalizePhotoSwipeSize('bad-size'), '');
  assert.equal(normalizePhotoSwipeSize('0x200'), '');

  assert.equal(getGalleryImageOrientation(251, 478), 'portrait');
  assert.equal(getGalleryImageOrientation(1920, 1080), 'landscape');
  assert.equal(getGalleryImageOrientation(600, 600), 'square');
  assert.equal(getGalleryImageOrientation(0, 600), '');
});

test('gallery helpers normalize editorial layout hints and infer layout variants', () => {
  assert.equal(normalizeGalleryLayout(' Wide '), 'wide');
  assert.equal(normalizeGalleryLayout('LANDSCAPE'), 'landscape');
  assert.equal(normalizeGalleryLayout('bad-layout'), '');

  assert.equal(getGalleryLayoutVariant('', 1919, 537), 'wide');
  assert.equal(getGalleryLayoutVariant('', 1538, 849), 'landscape');
  assert.equal(getGalleryLayoutVariant('', 600, 600), 'square');
  assert.equal(getGalleryLayoutVariant('', 455, 591), 'portrait');
  assert.equal(getGalleryLayoutVariant('wide', 455, 591), 'wide');

  const gallery = getRenderableGallery([
    { image: 'img/shot-a.jpg', layout: 'Wide' },
    { image: 'img/shot-b.jpg', layout: '???' },
  ]);

  assert.equal(gallery[0].layout, 'wide');
  assert.equal(gallery[1].layout, '');
});

test('findProjectBySlug resolves legacy slugs to the canonical project entry', () => {
  const projects = [
    { slug: 'farm-match', legacySlugs: ['bubble-jam'] },
    { slug: 'lunarfall-pixel-strategy', legacySlugs: ['fantasy-tactics'] },
    { slug: 'satisdom', legacySlugs: ['perfect-tidy'] },
  ];

  assert.equal(findProjectBySlug(projects, 'bubble-jam').slug, 'farm-match');
  assert.equal(findProjectBySlug(projects, 'fantasy-tactics').slug, 'lunarfall-pixel-strategy');
  assert.equal(findProjectBySlug(projects, 'perfect-tidy').slug, 'satisdom');
  assert.equal(findProjectBySlug(projects, 'farm-match').slug, 'farm-match');
});

test('project page keeps legacy slug support and canonical URL replacement logic in source', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'project-page.js'), 'utf8');

  assert.match(source, /legacySlugs/);
  assert.equal(source.includes('window.history && window.history.replaceState'), true);
  assert.equal(source.includes('projectUrl(project.slug)'), true);
});

test('project detail major sections use the narrative shell structure and shared styles', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'project.html'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'portfolio-ux.css'), 'utf8');

  assert.match(html, /project-section__shell/);
  assert.match(html, /project-section__header/);
  assert.match(html, /project-section__body/);

  assert.match(css, /\.project-section__shell\s*\{/);
  assert.match(css, /\.project-section__header\s*\{/);
  assert.match(css, /\.project-section__body\s*\{/);
  assert.match(css, /\.project-section__body--wide\s*\{/);
});

test('project detail template uses restrained labels and a lightweight facts strip', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'project.html'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'portfolio-ux.css'), 'utf8');

  assert.equal(
    (html.match(/project-section__eyebrow/g) || []).length,
    0,
    'Case-study sections should rely on headings instead of repeated eyebrow labels.'
  );

  assert.doesNotMatch(html, /<p class="project-hero__eyebrow">Quick Facts<\/p>/);
  assert.match(css, /\.project-snapshot\s*\{[^}]*box-shadow:\s*none;/s);
  assert.match(css, /\.project-snapshot\s*\{[^}]*background:\s*transparent;/s);
  assert.match(css, /\.project-section__shell\s*\{[^}]*box-shadow:\s*none;/s);
});

test('portfolio UX stylesheet enables progressive view transitions', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'portfolio-ux.css'), 'utf8');

  assert.match(css, /::view-transition-old\(root\)/);
  assert.match(css, /::view-transition-new\(root\)/);
  assert.match(css, /view-transition-name:\s*portfolio-project-media/);
  assert.match(css, /view-transition-name:\s*portfolio-project-title/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test('project page initializes ScrollTrigger storytelling with a reduced-motion guard', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'project-page.js'), 'utf8');

  assert.match(source, /function initProjectScrollStorytelling/);
  assert.match(source, /prefers-reduced-motion:\s*reduce/);
  assert.match(source, /ScrollTrigger\.batch/);
  assert.match(source, /\.project-section__shell/);
  assert.match(source, /ScrollTrigger\.refresh/);
});

test('project page motion polish animates hero facts and detail cards with subtle timing', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'project-page.js'), 'utf8');

  assert.match(source, /const heroFactItems = gsap\.utils\.toArray\("\.project-fact"\)/);
  assert.match(source, /duration:\s*0\.42/);
  assert.match(source, /stagger:\s*0\.07/);
  assert.match(source, /start:\s*"top 88%"/);
  assert.match(source, /once:\s*true/);
  assert.match(source, /autoAlpha:\s*0/);
  assert.match(source, /autoAlpha:\s*1/);
});

test('project page motion uses scoped will-change and throttled scroll progress', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'project-page.js'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'portfolio-ux.css'), 'utf8');

  assert.doesNotMatch(css, /transition:\s*all\b/);
  assert.doesNotMatch(css, /\.project-fact,\s*\n\.project-system-card,\s*\n\.project-gallery-item,\s*\n\.project-related-card\s*\{\s*will-change:\s*transform,\s*opacity;/);
  assert.match(css, /\.is-motion-ready/);

  assert.match(source, /function initProjectScrollProgress/);
  assert.match(source, /requestAnimationFrame/);
  assert.doesNotMatch(source, /progressBar\.style\.width\s*=\s*progress\s*\+\s*"%"/);
});

