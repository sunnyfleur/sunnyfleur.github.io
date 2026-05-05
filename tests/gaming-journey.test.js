const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  getRenderableChapters,
  createGameCardMarkup,
  createHeroStripMarkup,
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

test('gaming journey layout keeps review feedback on scale and image framing', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'gamepage.html'), 'utf8');
  const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'gaming-journey.css'), 'utf8');

  assert.match(html, /class="back-to-home btn btn-default btn-hover btn-hover-outline"/);
  assert.match(html, /<span class="btn-caption">Trang chủ<\/span>/);

  assert.match(css, /\.journey-hero__lead\s*\{[^}]*font-size:\s*clamp\(1\.35rem,\s*2\.4vw,\s*2\.2rem\)/s);
  assert.match(css, /\.journey-intro p\s*\{[^}]*font-size:\s*clamp\(1\.35rem,\s*2\.2vw,\s*2rem\)/s);
  assert.match(css, /\.journey-chapter__kicker\s*\{[^}]*font-size:\s*clamp\(0\.92rem,\s*1vw,\s*1\.05rem\)/s);
  assert.match(css, /\.journey-chapter__header h2\s*\{[^}]*font-size:\s*clamp\(2\.75rem,\s*5vw,\s*5\.6rem\)/s);
  assert.match(css, /\.journey-chapter__header p:last-child\s*\{[^}]*font-size:\s*clamp\(1\.15rem,\s*1\.35vw,\s*1\.45rem\)/s);

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
