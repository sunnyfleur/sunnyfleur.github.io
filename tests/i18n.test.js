const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const rootDir = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

test('i18n runtime exposes language, URL, and overlay helpers', () => {
  const runtimePath = path.join(rootDir, 'js', 'i18n.js');

  assert.ok(fs.existsSync(runtimePath), 'Expected js/i18n.js to exist.');

  const i18n = require(runtimePath);

  assert.equal(i18n.normalizeLanguage('vi'), 'vi');
  assert.equal(i18n.normalizeLanguage('en'), 'en');
  assert.equal(i18n.normalizeLanguage('fr'), '');
  assert.equal(i18n.localizeUrl('project.html?slug=screw#gallery', 'vi'), 'project.html?slug=screw&lang=vi#gallery');
  assert.equal(i18n.localizeUrl('https://example.com/case', 'vi'), 'https://example.com/case');
  assert.equal(i18n.localizeUrl('#contact', 'vi'), '#contact');
  assert.equal(typeof i18n.mergeProjectPayload, 'function');
  assert.equal(typeof i18n.mergeGamingJourneyData, 'function');
});

test('i18n runtime uses English as the default entry language', async () => {
  const runtimeSource = readText('js/i18n.js');
  const storedValues = new Map([['portfolio.language', 'vi']]);
  const context = {
    URL,
    URLSearchParams,
    location: {
      search: '',
      pathname: '/index.html',
      hash: '',
    },
    localStorage: {
      getItem(key) {
        return storedValues.get(key) || null;
      },
      setItem(key, value) {
        storedValues.set(key, value);
      },
    },
    fetch() {
      return Promise.resolve({
        ok: true,
        json() {
          return Promise.resolve({});
        },
      });
    },
    document: {
      documentElement: {
        lang: '',
      },
      addEventListener() {},
      querySelectorAll() {
        return [];
      },
    },
  };

  vm.createContext(context);
  vm.runInContext(runtimeSource, context);
  await context.PortfolioI18n.whenReady();

  assert.equal(context.PortfolioI18n.getLanguage(), 'en');
  assert.equal(context.document.documentElement.lang, 'en');
});

test('i18n runtime still honors explicit Vietnamese URL language', async () => {
  const runtimeSource = readText('js/i18n.js');
  const context = {
    URL,
    URLSearchParams,
    location: {
      search: '?lang=vi',
      pathname: '/index.html',
      hash: '',
    },
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {},
    },
    fetch() {
      return Promise.resolve({
        ok: true,
        json() {
          return Promise.resolve({});
        },
      });
    },
    document: {
      documentElement: {
        lang: '',
      },
      addEventListener() {},
      querySelectorAll() {
        return [];
      },
    },
  };

  vm.createContext(context);
  vm.runInContext(runtimeSource, context);
  await context.PortfolioI18n.whenReady();

  assert.equal(context.PortfolioI18n.getLanguage(), 'vi');
  assert.equal(context.document.documentElement.lang, 'vi');
});

test('site dictionaries include core UI and SEO labels for both languages', () => {
  const requiredKeys = [
    'meta.index.title',
    'meta.project.description',
    'nav.home',
    'nav.portfolio',
    'nav.about',
    'nav.resume',
    'nav.contact',
    'controls.languageLabel',
    'portfolio.openCaseStudy',
    'project.sections.overview',
    'journey.heroTitle',
    'contact.submit',
  ];

  for (const language of ['en', 'vi']) {
    const dictionary = readJson(`i18n/site.${language}.json`);

    for (const key of requiredKeys) {
      const value = key.split('.').reduce((node, part) => node && node[part], dictionary);
      assert.equal(typeof value, 'string', `${language} missing ${key}`);
      assert.ok(value.trim(), `${language} ${key} should not be empty`);
    }
  }
});

test('Vietnamese project overlay covers every shared project slug', () => {
  const base = readJson('projects.json');
  const overlay = readJson('i18n/projects.vi.json');

  assert.ok(overlay.projects && typeof overlay.projects === 'object');

  for (const project of base.projects) {
    const localized = overlay.projects[project.slug];
    assert.ok(localized, `Missing Vietnamese overlay for ${project.slug}`);
    assert.equal(typeof localized.tagline, 'string', `${project.slug} needs a localized tagline`);
    assert.equal(typeof localized.summary, 'string', `${project.slug} needs a localized summary`);
    assert.ok(Array.isArray(localized.role), `${project.slug} needs localized role labels`);
  }
});

test('Vietnamese gaming journey overlay covers every chapter and game', () => {
  const base = readJson('gaming-journey.json');
  const overlay = readJson('i18n/gaming-journey.vi.json');

  for (const chapter of base.chapters) {
    assert.ok(overlay.chapters[chapter.id], `Missing localized chapter ${chapter.id}`);
    assert.equal(typeof overlay.chapters[chapter.id].title, 'string');
  }

  for (const game of base.games) {
    assert.ok(overlay.games[game.title], `Missing localized game ${game.title}`);
    assert.equal(typeof overlay.games[game.title].reflection, 'string');
  }

  assert.match(overlay.chapters.worlds.title, /Những thế giới/);
  assert.match(overlay.games['Red Dead Redemption 2'].reflection, /thế giới sống động/);
  assert.doesNotMatch(JSON.stringify(overlay), /Nh\?|G\?c|thi\?t|ng\?\?i|C\?m|\?\?/);
});

test('portfolio-facing pages include the bilingual runtime and language control', () => {
  const pages = ['index.html', 'project.html', 'gamepage.html', 'game.html'];

  for (const page of pages) {
    const html = readText(page);
    assert.match(html, /js\/i18n\.js/, `${page} should load the i18n runtime`);
    assert.match(html, /data-language-toggle/, `${page} should expose a language toggle`);
  }

  for (const page of ['product_BubbleJam.html', 'product_HororCarnival.html', 'product_HowMobFeel.html', 'product_SpaceConquer.html', 'FantasyTactics.html']) {
    const html = readText(page);
    assert.match(html, /js\/i18n\.js/, `${page} should load the i18n runtime before redirecting`);
  }
});

test('excluded support pages are not pulled into the bilingual UI pass', () => {
  for (const page of ['d.html', 'project-template.html', 'palette-preview.html', 'portfolio-guide.html']) {
    const html = readText(page);
    assert.doesNotMatch(html, /data-language-toggle/, `${page} should stay outside V1 public portfolio i18n`);
  }
});

test('portfolio-facing files do not contain mojibake artifacts', () => {
  const files = [
    'index.html',
    'project.html',
    'gamepage.html',
    'game.html',
    'game-embed.html',
    'js/i18n.js',
    'js/portfolio-index.js',
    'js/project-page.js',
    'js/gaming-journey.js',
    'i18n/site.en.json',
    'i18n/site.vi.json',
    'i18n/projects.vi.json',
    'i18n/gaming-journey.vi.json',
  ];
  const mojibakeMarkers = [
    '\u00c3',
    '\u00c2',
    '\u00c4\u0090',
    '\u00c4\u2018',
    'ch\u00e1\u00bb',
    'n\u00e1\u00bb',
  ];

  for (const file of files) {
    const text = readText(file);
    for (const marker of mojibakeMarkers) {
      assert.equal(text.includes(marker), false, `${file} contains likely mojibake marker ${marker}`);
    }
  }
});
