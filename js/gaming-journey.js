(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GamingJourney = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const FALLBACK_IMAGE = './img/og-image.png';
  const HERO_TILE_LAYOUT = [
    { modifier: 'portrait-feature', source: 'poster' },
    { modifier: 'landscape-wide', source: 'landscape' },
    { modifier: 'portrait-stack', source: 'poster' },
    { modifier: 'landscape-mid', source: 'landscape' },
    { modifier: 'portrait-lower', source: 'poster' },
    { modifier: 'portrait-accent', source: 'poster' },
  ];

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function asList(value) {
    return Array.isArray(value) ? value.filter(Boolean) : [];
  }

  function getRenderableChapters(data) {
    const chapters = asList(data && data.chapters);
    const games = asList(data && data.games);

    return chapters
      .map((chapter) => {
        const chapterGames = games.filter((game) => game && game.chapter === chapter.id);
        return Object.assign({}, chapter, { games: chapterGames });
      })
      .filter((chapter) => chapter.id && chapter.title && chapter.games.length > 0);
  }

  function createTagsMarkup(tags) {
    return asList(tags)
      .map((tag) => `<span class="journey-tag">${escapeHtml(tag)}</span>`)
      .join('');
  }

  function createStampsMarkup(stamps) {
    const stampsMarkup = asList(stamps)
      .map((stamp) => `<span class="journey-stamp">${escapeHtml(stamp)}</span>`)
      .join('');

    return stampsMarkup
      ? `<div class="journey-chapter__stamps" aria-hidden="true">${stampsMarkup}</div>`
      : '';
  }

  function createChapterTransitionMarkup(chapter, index) {
    const chapterNumber = String(index + 1).padStart(2, '0');
    const transitionLabel = asList(chapter.stamps)[0] || chapter.title || 'Design reference';

    return `
        <div class="journey-chapter__transition" aria-hidden="true">
          <span>Memory stop ${chapterNumber}</span>
          <span class="journey-chapter__transition-line"></span>
          <span>${escapeHtml(transitionLabel)}</span>
        </div>
    `;
  }

  function isSafeCssColor(value) {
    return typeof value === 'string'
      && /^(#[0-9a-fA-F]{3,8}|rgba?\([\d\s.,%]+\)|[a-zA-Z]+)$/.test(value.trim());
  }

  function createChapterStyleAttribute(chapter) {
    const declarations = [];

    if (isSafeCssColor(chapter.accent)) {
      declarations.push(`--chapter-accent: ${chapter.accent.trim()}`);
    }

    if (isSafeCssColor(chapter.accentSoft)) {
      declarations.push(`--chapter-accent-soft: ${chapter.accentSoft.trim()}`);
    }

    return declarations.length
      ? ` style="${escapeHtml(declarations.join('; '))}"`
      : '';
  }

  function createMetaMarkup(game) {
    return [
      game.platform,
      game.hours ? `${game.hours} hours` : '',
      game.year,
    ]
      .filter(Boolean)
      .map((item) => `<span>${escapeHtml(item)}</span>`)
      .join('');
  }

  function createGameCardMarkup(game, options) {
    const isFeatured = Boolean(options && options.featured);
    const isWide = Boolean(options && options.wide);
    const cardClass = [
      'journey-card',
      isFeatured ? 'journey-card--feature' : '',
      !isFeatured && isWide ? 'journey-card--wide' : '',
    ].filter(Boolean).join(' ');
    const title = escapeHtml(game.title || 'Untitled game');
    const image = escapeHtml(game.image || FALLBACK_IMAGE);
    const imageAlt = escapeHtml(game.imageAlt || `${game.title || 'Game'} screenshot`);
    const imageSource = escapeHtml(game.imageSource || '');
    const reflection = escapeHtml(game.reflection || '');
    const sourceMarkup = imageSource
      ? `<figcaption class="journey-card__source">Image: ${imageSource}</figcaption>`
      : '';

    return `
      <article class="${cardClass}">
        <figure class="journey-card__media">
          <img src="${image}" alt="${imageAlt}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'">
          ${sourceMarkup}
        </figure>
        <div class="journey-card__body">
          <h3 class="journey-card__title">${title}</h3>
          <div class="journey-card__meta">${createMetaMarkup(game)}</div>
          ${reflection ? `<p class="journey-card__reflection">${reflection}</p>` : ''}
          <div class="journey-card__tags">${createTagsMarkup(game.tags)}</div>
        </div>
      </article>
    `;
  }

  function createChapterMarkup(chapter, index) {
    const label = chapter.kicker || `Chapter ${String(index + 1).padStart(2, '0')}`;
    const chapterNumber = String(index + 1).padStart(2, '0');
    const chapterClass = index % 2 === 1
      ? 'journey-chapter journey-chapter--reverse'
      : 'journey-chapter';
    const chapterStyle = createChapterStyleAttribute(chapter);
    const stamps = createStampsMarkup(chapter.stamps);
    const games = asList(chapter.games);
    const spotlight = games.length
      ? createGameCardMarkup(games[0], { featured: true })
      : '';
    const shelfGames = games
      .slice(1)
      .map((game, gameIndex) => createGameCardMarkup(game, { wide: (gameIndex + 1) % 7 === 0 }))
      .join('');

    return `
      <section class="${chapterClass}" id="${escapeHtml(chapter.id)}" data-chapter-number="${chapterNumber}"${chapterStyle}>
        ${createChapterTransitionMarkup(chapter, index)}
        <div class="journey-chapter__opening">
          <div class="journey-chapter__header">
            <div class="journey-chapter__rail" aria-hidden="true">
              <span class="journey-chapter__rail-line"></span>
              <span class="journey-chapter__rail-dot"></span>
              <span class="journey-chapter__rail-number">${chapterNumber}</span>
              <span class="journey-chapter__rail-label">Memory stop</span>
            </div>
            <p class="journey-chapter__kicker">${escapeHtml(label)}</p>
            <h2>${escapeHtml(chapter.title)}</h2>
            <p>${escapeHtml(chapter.description || '')}</p>
            ${stamps}
          </div>
          <div class="journey-chapter__spotlight">
            ${spotlight}
          </div>
        </div>
        <div class="journey-shelf">
          ${shelfGames}
        </div>
      </section>
    `;
  }

  function createJourneyIndexMarkup(chapters) {
    const items = asList(chapters)
      .filter((chapter) => chapter && chapter.id && chapter.title)
      .map((chapter, index) => {
        const number = String(index + 1).padStart(2, '0');
        const activeClass = index === 0 ? ' is-active' : '';
        const current = index === 0 ? ' aria-current="true"' : '';
        const style = isSafeCssColor(chapter.accent)
          ? ` style="--chapter-accent: ${escapeHtml(chapter.accent.trim())}"`
          : '';

        return `
          <li class="journey-index__item">
            <a class="journey-index__link${activeClass}" href="#${escapeHtml(chapter.id)}" data-journey-index-link data-target="${escapeHtml(chapter.id)}"${current}${style}>
              <span class="journey-index__number">${number}</span>
              <span class="journey-index__title">${escapeHtml(chapter.title)}</span>
            </a>
          </li>
        `;
      })
      .join('');

    return `
      <nav class="journey-index__panel" aria-label="Game journey chapters">
        <span class="journey-index__eyebrow">Journey map</span>
        <div class="journey-index__body">
          <span class="journey-index__track" aria-hidden="true">
            <span class="journey-index__progress" data-gaming-journey-progress></span>
          </span>
          <ol class="journey-index__list">
            ${items}
          </ol>
        </div>
      </nav>
    `;
  }

  function setupJourneyIndexProgress(indexElement) {
    if (!indexElement || typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const links = Array.from(indexElement.querySelectorAll('[data-journey-index-link]'));
    const progress = indexElement.querySelector('[data-gaming-journey-progress]');
    const sections = links
      .map((link) => document.getElementById(link.getAttribute('data-target')))
      .filter(Boolean);

    if (!links.length || !sections.length || !progress) {
      return;
    }

    function setActive(activeIndex) {
      links.forEach((link, index) => {
        const isActive = index === activeIndex;
        link.classList.toggle('is-active', isActive);
        if (isActive) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function update() {
      const viewportAnchor = window.scrollY + window.innerHeight * 0.42;
      let activeIndex = 0;

      sections.forEach((section, index) => {
        if (section.offsetTop <= viewportAnchor) {
          activeIndex = index;
        }
      });

      const firstTop = sections[0].offsetTop;
      const lastSection = sections[sections.length - 1];
      const lastBottom = lastSection.offsetTop + lastSection.offsetHeight;
      const range = Math.max(lastBottom - firstTop - window.innerHeight * 0.36, 1);
      const progressValue = clamp(((viewportAnchor - firstTop) / range) * 100, 0, 100);

      indexElement.style.setProperty('--journey-progress', `${progressValue.toFixed(2)}%`);
      setActive(activeIndex);
    }

    let frame = null;
    function requestUpdate() {
      if (frame !== null) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = null;
        update();
      });
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    requestUpdate();
  }

  function getHeroImage(game, tile) {
    if (tile.source === 'poster') {
      return game.posterImage || game.image || FALLBACK_IMAGE;
    }

    return game.image || game.posterImage || FALLBACK_IMAGE;
  }

  function createHeroStripMarkup(games) {
    return asList(games)
      .slice(0, HERO_TILE_LAYOUT.length)
      .map((game, index) => {
        const tile = HERO_TILE_LAYOUT[index];
        return `
        <figure class="journey-hero__tile journey-hero__tile--${tile.modifier}">
          <img src="${escapeHtml(getHeroImage(game, tile))}" alt="${escapeHtml(game.imageAlt || game.title || 'Game image')}" loading="eager" decoding="async" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'">
        </figure>
      `;
      })
      .join('');
  }

  function renderGamingJourney(data, options) {
    const rootSelector = (options && options.rootSelector) || '[data-gaming-journey]';
    const heroSelector = (options && options.heroSelector) || '[data-gaming-hero-strip]';
    const indexSelector = (options && options.indexSelector) || '[data-gaming-journey-index]';
    const rootElement = document.querySelector(rootSelector);
    const heroElement = document.querySelector(heroSelector);
    const indexElement = document.querySelector(indexSelector);
    const chapters = getRenderableChapters(data);

    if (!rootElement) {
      return;
    }

    if (heroElement) {
      heroElement.innerHTML = createHeroStripMarkup(data.games);
    }

    if (!chapters.length) {
      rootElement.innerHTML = '<p class="journey-empty">No game memories are ready to show yet.</p>';
      if (indexElement) {
        indexElement.innerHTML = '';
      }
      return;
    }

    rootElement.innerHTML = chapters.map(createChapterMarkup).join('');
    if (indexElement) {
      indexElement.innerHTML = createJourneyIndexMarkup(chapters);
      setupJourneyIndexProgress(indexElement);
    }
  }

  async function loadGamingJourney(options) {
    const dataUrl = (options && options.dataUrl) || 'gaming-journey.json';
    const rootSelector = (options && options.rootSelector) || '[data-gaming-journey]';
    const rootElement = document.querySelector(rootSelector);

    try {
      const response = await fetch(dataUrl);
      if (!response.ok) {
        throw new Error(`Failed to load ${dataUrl}: ${response.status}`);
      }

      const data = await response.json();
      renderGamingJourney(data, options);
    } catch (error) {
      if (rootElement) {
        rootElement.innerHTML = `
          <div class="journey-error">
            <h2>Game journey unavailable</h2>
            <p>The collection data could not be loaded. Please try again later.</p>
          </div>
        `;
      }
      if (typeof console !== 'undefined') {
        console.error(error);
      }
    }
  }

  return {
    createChapterMarkup,
    createGameCardMarkup,
    createHeroStripMarkup,
    createJourneyIndexMarkup,
    getRenderableChapters,
    loadGamingJourney,
    renderGamingJourney,
  };
});
