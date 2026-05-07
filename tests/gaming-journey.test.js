const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  createChapterMarkup,
  getRenderableChapters,
  createGameCardMarkup,
  createHeroStripMarkup,
  createJourneyIndexMarkup,
} = require('../js/gaming-journey.js');

test('gaming journey data renders chapters with games and skips empty chapters', () => {
  const data = {
    chapters: [
      {
        id: 'worlds',
        title: 'Worlds I Still Remember',
        description: 'Games that shaped my taste for atmosphere.',
      },
      {
        id: 'empty',
        title: 'Empty Chapter',
        description: 'Should not render.',
      },
    ],
    games: [
      {
        title: 'Elden Ring',
        chapter: 'worlds',
        platform: 'PC',
        hours: '150+',
        year: '2022',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/capsule_616x353.jpg',
        imageSource: 'Steam',
        imageAlt: 'Elden Ring landscape screenshot',
        reflection: 'A strong memory of mystery, danger, and discovery pulling the player forward.',
        tags: ['Worldbuilding', 'Exploration'],
      },
    ],
  };

  const chapters = getRenderableChapters(data);

  assert.equal(chapters.length, 1);
  assert.equal(chapters[0].id, 'worlds');
  assert.equal(chapters[0].games.length, 1);
  assert.equal(chapters[0].games[0].title, 'Elden Ring');
});

test('game card markup includes remote image, source credit, reflection, and design tags', () => {
  const markup = createGameCardMarkup({
    title: 'Cyberpunk 2077',
    platform: 'PC',
    hours: '20+',
    year: '2020',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/capsule_616x353.jpg',
    imageSource: 'Steam',
    imageAlt: 'Cyberpunk 2077 city screenshot',
    reflection: 'A useful case study in ambition, expectation, immersion breaks, and post-launch iteration.',
    tags: ['Expectation', 'Iteration'],
  });

  assert.match(markup, /https:\/\/cdn\.cloudflare\.steamstatic\.com\/steam\/apps\/1091500\/capsule_616x353\.jpg/);
  assert.match(markup, /loading="lazy"/);
  assert.match(markup, /Image: Steam/);
  assert.match(markup, /A useful case study/);
  assert.match(markup, /Expectation/);
  assert.match(markup, /Iteration/);
});

test('chapter markup alternates layout direction and features the first game', () => {
  const chapter = {
    id: 'stories',
    title: 'Stories That Stayed',
    kicker: 'Chapter 02',
    description: 'Character-driven games that changed my standards for tone.',
    accent: '#d84c5f',
    accentSoft: 'rgba(216, 76, 95, 0.14)',
    stamps: ['Character Arc', 'Routine', 'Emotional Payoff'],
    games: [
      {
        title: 'Persona 5 Royal',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1687950/capsule_616x353.jpg',
        imageSource: 'Steam',
        reflection: 'A standard for style and character arcs.',
        tags: ['Style'],
      },
      {
        title: 'L.A. Noire',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/110800/capsule_616x353.jpg',
        imageSource: 'Steam',
        reflection: 'A memorable detective fantasy.',
        tags: ['Tone'],
      },
    ],
  };
  const markup = createChapterMarkup(chapter, 1);
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'gaming-journey.css'), 'utf8');

  assert.match(markup, /<section class="journey-chapter journey-chapter--reverse" id="stories" data-chapter-number="02" style="--chapter-accent: #d84c5f; --chapter-accent-soft: rgba\(216, 76, 95, 0\.14\)">/);
  assert.match(markup, /<article class="journey-card journey-card--feature">/);
  assert.equal((markup.match(/journey-card--feature/g) || []).length, 1);
  assert.ok(markup.indexOf('Persona 5 Royal') < markup.indexOf('L.A. Noire'));
  assert.match(markup, /journey-chapter__stamps/);
  assert.match(markup, /Character Arc/);
  assert.match(markup, /Emotional Payoff/);
  assert.match(markup, /journey-chapter__rail/);
  assert.match(markup, /journey-chapter__rail-number">02<\/span>/);
  assert.match(markup, /journey-chapter__rail-label">Memory stop<\/span>/);
  assert.match(markup, /journey-chapter__transition/);
  assert.match(markup, /Memory stop 02/);
  assert.match(markup, /Character Arc/);

  assert.match(css, /\.journey-chapter--reverse\s*\{/);
  assert.match(css, /\.journey-chapter::before\s*\{[^}]*content:\s*attr\(data-chapter-number\)/s);
  assert.match(css, /\.journey-chapter::before\s*\{[^}]*left:\s*clamp\(44px,\s*5vw,\s*76px\)/s);
  assert.match(css, /\.journey-chapter--reverse::before\s*\{[^}]*left:\s*auto;[^}]*right:\s*clamp\(44px,\s*5vw,\s*76px\)/s);
  assert.match(css, /\.journey-chapter::after\s*\{[^}]*background:\s*linear-gradient\(90deg,\s*var\(--chapter-accent\),\s*transparent\)/s);
  assert.match(css, /\.journey-chapter__header\s*\{[^}]*padding-left:\s*clamp\(42px,\s*4vw,\s*62px\)/s);
  assert.match(css, /\.journey-chapter__rail\s*\{[^}]*position:\s*absolute/s);
  assert.match(css, /\.journey-chapter__rail-line\s*\{[^}]*background:\s*linear-gradient\(180deg,\s*var\(--chapter-accent\),\s*var\(--chapter-accent-soft\)\)/s);
  assert.match(css, /\.journey-chapter__rail-dot\s*\{[^}]*background:\s*var\(--chapter-accent\)/s);
  assert.match(css, /\.journey-chapter--reverse \.journey-chapter__rail\s*\{[^}]*left:\s*auto;[^}]*right:\s*0/s);
  assert.match(css, /\.journey-chapter__stamps\s*\{/);
  assert.match(css, /\.journey-stamp\s*\{[^}]*border:\s*1px solid var\(--chapter-accent\)/s);
  assert.match(css, /\.journey-chapter__transition\s*\{[^}]*grid-column:\s*1 \/ -1;[^}]*grid-row:\s*1/s);
  assert.match(css, /\.journey-chapter__header\s*\{[^}]*grid-row:\s*2/s);
  assert.match(css, /\.journey-shelf\s*\{[^}]*grid-row:\s*2/s);
  assert.match(css, /\.journey-chapter--reverse \.journey-chapter__header\s*\{[^}]*grid-column:\s*2;[^}]*grid-row:\s*2/s);
  assert.match(css, /\.journey-chapter--reverse \.journey-shelf\s*\{[^}]*grid-column:\s*1;[^}]*grid-row:\s*2/s);
  assert.match(css, /\.journey-card--feature\s*\{[^}]*grid-column:\s*1 \/ -1/s);
  assert.match(css, /\.journey-card--feature\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*0\.58fr\) minmax\(260px,\s*0\.42fr\)/s);
});

test('journey index renders chapter navigation and progress affordance', () => {
  const chapters = [
    {
      id: 'worlds',
      title: 'Worlds I Still Remember',
      accent: '#e05a38',
    },
    {
      id: 'stories',
      title: 'Stories That Stayed',
      accent: '#d84c5f',
    },
  ];
  const markup = createJourneyIndexMarkup(chapters);
  const html = fs.readFileSync(path.join(__dirname, '..', 'gamepage.html'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'gaming-journey.css'), 'utf8');

  assert.match(html, /data-gaming-journey-index/);
  assert.match(html, /indexSelector:\s*'\[data-gaming-journey-index\]'/);
  assert.match(markup, /journey-index__progress/);
  assert.match(markup, /data-gaming-journey-progress/);
  assert.match(markup, /href="#worlds"/);
  assert.match(markup, /data-journey-index-link/);
  assert.match(markup, /journey-index__number">01<\/span>/);
  assert.match(markup, /Worlds I Still Remember/);
  assert.match(markup, /style="--chapter-accent: #e05a38"/);

  assert.match(css, /\.journey-index\s*\{[^}]*position:\s*fixed/s);
  assert.match(css, /\.journey-index__progress\s*\{[^}]*height:\s*var\(--journey-progress,\s*0%\)/s);
  assert.match(css, /\.journey-index__link\.is-active\s*\{/);
  assert.match(css, /@media \(max-width:\s*1540px\)\s*\{[^}]*\.journey-index\s*\{[^}]*display:\s*none/s);
});

test('gamepage uses the chapter-led journey shell instead of tier list filters', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'gamepage.html'), 'utf8');

  assert.match(html, /Games That Shaped My Taste/);
  assert.match(html, /gaming-journey\.json/);
  assert.match(html, /js\/gaming-journey\.js/);
  assert.doesNotMatch(html, /S Tier|A Tier|F Tier/);
  assert.doesNotMatch(html, /platform-tabs/);
});

test('gaming journey data stores remote images and source labels for every game', () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'gaming-journey.json'), 'utf8'));

  assert.ok(Array.isArray(data.chapters));
  assert.ok(Array.isArray(data.games));
  assert.ok(data.chapters.length >= 5);
  assert.ok(data.games.length >= 12);

  for (const game of data.games) {
    assert.match(game.image, /^https:\/\//, `${game.title} should use a remote image URL.`);
    assert.match(game.image, /capsule_616x353\.jpg$/, `${game.title} should use landscape poster-scale Steam art.`);
    assert.ok(game.imageSource, `${game.title} should include imageSource.`);
    assert.ok(game.reflection, `${game.title} should include reflection.`);
    assert.ok(Array.isArray(game.tags) && game.tags.length > 0, `${game.title} should include tags.`);
  }
});

test('gaming journey chapters include editorial decoration metadata', () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'gaming-journey.json'), 'utf8'));

  for (const chapter of data.chapters) {
    assert.match(chapter.accent, /^#[0-9a-f]{6}$/i, `${chapter.title} should include a chapter mood accent.`);
    assert.match(chapter.accentSoft, /^rgba\(/, `${chapter.title} should include a soft mood accent.`);
    assert.ok(Array.isArray(chapter.stamps) && chapter.stamps.length >= 2, `${chapter.title} should include editorial stamps.`);
  }
});

test('gamepage follows the shared light and dark color scheme tokens', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'gamepage.html'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'gaming-journey.css'), 'utf8');

  assert.match(html, /localStorage\.getItem\('template\.theme'\)/);
  assert.match(html, /document\.documentElement\.setAttribute\('color-scheme', theme\)/);

  assert.match(css, /--journey-bg:\s*var\(--base\);/);
  assert.match(css, /--journey-text:\s*var\(--t-bright\);/);
  assert.match(css, /--journey-line:\s*var\(--stroke-elements\);/);
  assert.match(css, /\[color-scheme=light\]\s*\{/);
  assert.match(css, /\[color-scheme=dark\]\s*\{/);
  assert.match(css, /linear-gradient\(180deg,\s*var\(--journey-hero-wash\),\s*var\(--journey-bg\)\s+38rem\)/);
  assert.doesNotMatch(css, /--journey-bg:\s*#08080a/);
  assert.doesNotMatch(css, /rgba\(8,\s*8,\s*10/);
});

test('gamepage reuses the main gradient ambience behind the journey content', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'gamepage.html'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'gaming-journey.css'), 'utf8');

  assert.match(html, /<div class="gradient-background journey-gradient-background" aria-hidden="true">\s*<div class="blur"><\/div>\s*<div class="blur"><\/div>\s*<div class="blur"><\/div>\s*<\/div>/);
  assert.match(css, /\.journey-gradient-background\s*\{[^}]*position:\s*fixed;[^}]*z-index:\s*0;[^}]*pointer-events:\s*none/s);
  assert.match(css, /\.journey-gradient-background \.blur\s*\{[^}]*opacity:\s*var\(--journey-ambient-opacity\);[^}]*filter:\s*blur\(clamp\(70px,\s*9vw,\s*130px\)\)/s);
  assert.match(css, /\.journey-gradient-background \.blur:nth-of-type\(1\)\s*\{[^}]*background:\s*var\(--gradient-one\)/s);
  assert.match(css, /\.journey-gradient-background \.blur:nth-of-type\(2\)\s*\{[^}]*background:\s*var\(--gradient-two\)/s);
  assert.match(css, /\.journey-gradient-background \.blur:nth-of-type\(3\)\s*\{[^}]*background:\s*var\(--gradient-three\)/s);
  assert.match(css, /\.game-container\s*\{[^}]*position:\s*relative;[^}]*z-index:\s*1/s);
});

test('gaming journey layout keeps review feedback on scale and image framing', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'gamepage.html'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'gaming-journey.css'), 'utf8');

  assert.match(html, /class="back-to-home btn btn-default btn-hover btn-hover-outline"/);
  assert.match(html, /<span class="btn-caption">Trang chủ<\/span>/);

  assert.match(css, /\.journey-hero__lead\s*\{[^}]*font-size:\s*clamp\(1\.25rem,\s*1\.9vw,\s*1\.85rem\)/s);
  assert.match(css, /\.journey-intro p\s*\{[^}]*font-size:\s*clamp\(1\.18rem,\s*1\.65vw,\s*1\.55rem\)/s);
  assert.match(css, /\.journey-chapter__kicker\s*\{[^}]*font-size:\s*clamp\(0\.82rem,\s*0\.9vw,\s*0\.92rem\)/s);
  assert.match(css, /\.journey-chapter__header h2\s*\{[^}]*font-size:\s*clamp\(2\.65rem,\s*4\.2vw,\s*4\.6rem\)/s);
  assert.match(css, /\.journey-chapter__header p:last-child\s*\{[^}]*font-size:\s*clamp\(1rem,\s*1\.12vw,\s*1\.2rem\)/s);
  assert.match(css, /\.journey-card__title\s*\{[^}]*font-size:\s*clamp\(1\.18rem,\s*1vw,\s*1\.3rem\)/s);
  assert.match(css, /\.journey-card__reflection\s*\{[^}]*font-size:\s*clamp\(0\.96rem,\s*0\.88vw,\s*1\.02rem\)/s);
  assert.match(css, /\.journey-card::before\s*\{[^}]*background:\s*linear-gradient\(135deg,\s*transparent,\s*color-mix\(in srgb,\s*var\(--chapter-accent\)\s*22%,\s*transparent\),\s*transparent\)/s);
  assert.match(css, /\.journey-card:hover::before\s*\{[^}]*opacity:\s*1/s);
  assert.match(css, /\.journey-card:hover \.journey-card__reflection\s*\{[^}]*color:\s*var\(--journey-text\)/s);

  assert.match(css, /\.journey-card__media\s*\{[^}]*aspect-ratio:\s*16 \/ 9/s);
  assert.match(css, /\.journey-card__media img\s*\{[^}]*object-fit:\s*cover/s);
  assert.match(css, /\.journey-hero__tile img\s*\{[^}]*object-fit:\s*cover/s);
});

test('hero strip mixes portrait and landscape artwork instead of loose numbered tiles', () => {
  const markup = createHeroStripMarkup([
    {
      title: 'Red Dead Redemption 2',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/capsule_616x353.jpg',
      posterImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/library_600x900.jpg',
    },
    {
      title: 'Elden Ring',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/capsule_616x353.jpg',
      posterImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900.jpg',
    },
    {
      title: 'The Witcher 3',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/capsule_616x353.jpg',
      posterImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/library_600x900.jpg',
    },
    {
      title: 'Persona 5 Royal',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1687950/capsule_616x353.jpg',
      posterImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1687950/library_600x900.jpg',
    },
    {
      title: 'Persona 3 Reload',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2161700/capsule_616x353.jpg',
      posterImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2161700/library_600x900.jpg',
    },
    {
      title: 'L.A. Noire',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/110800/capsule_616x353.jpg',
      posterImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/110800/library_600x900.jpg',
    },
  ]);
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'gaming-journey.css'), 'utf8');

  assert.match(markup, /journey-hero__tile--portrait-feature/);
  assert.match(markup, /journey-hero__tile--landscape-wide/);
  assert.match(markup, /journey-hero__tile--portrait-lower/);
  assert.match(markup, /library_600x900\.jpg/);
  assert.match(markup, /capsule_616x353\.jpg/);
  assert.doesNotMatch(markup, /journey-hero__tile--1/);

  assert.match(css, /\.journey-hero__strip\s*\{[^}]*grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /\.journey-hero__tile--portrait-feature\s*\{[^}]*grid-column:\s*1 \/ span 5;[^}]*grid-row:\s*1 \/ span 10/s);
  assert.match(css, /\.journey-hero__tile--landscape-wide\s*\{[^}]*grid-column:\s*6 \/ span 7;[^}]*grid-row:\s*1 \/ span 4/s);
});

test('gaming journey data keeps landscape card art and adds portrait hero art', () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'gaming-journey.json'), 'utf8'));

  for (const game of data.games.slice(0, 7)) {
    assert.match(game.image, /capsule_616x353\.jpg$/, `${game.title} should keep landscape artwork for chapter cards.`);
    assert.match(game.posterImage, /library_600x900\.jpg$/, `${game.title} should include portrait artwork for the hero collage.`);
  }
});
