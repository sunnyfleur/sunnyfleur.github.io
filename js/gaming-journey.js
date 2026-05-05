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

  function createGameCardMarkup(game) {
    const title = escapeHtml(game.title || 'Untitled game');
    const image = escapeHtml(game.image || FALLBACK_IMAGE);
    const imageAlt = escapeHtml(game.imageAlt || `${game.title || 'Game'} screenshot`);
    const imageSource = escapeHtml(game.imageSource || '');
    const reflection = escapeHtml(game.reflection || '');
    const sourceMarkup = imageSource
      ? `<figcaption class="journey-card__source">Image: ${imageSource}</figcaption>`
      : '';

    return `
      <article class="journey-card">
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
    const games = chapter.games.map(createGameCardMarkup).join('');

    return `
      <section class="journey-chapter" id="${escapeHtml(chapter.id)}">
        <div class="journey-chapter__header">
          <p class="journey-chapter__kicker">${escapeHtml(label)}</p>
          <h2>${escapeHtml(chapter.title)}</h2>
          <p>${escapeHtml(chapter.description || '')}</p>
        </div>
        <div class="journey-shelf">
          ${games}
        </div>
      </section>
    `;
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
    const rootElement = document.querySelector(rootSelector);
    const heroElement = document.querySelector(heroSelector);
    const chapters = getRenderableChapters(data);

    if (!rootElement) {
      return;
    }

    if (heroElement) {
      heroElement.innerHTML = createHeroStripMarkup(data.games);
    }

    if (!chapters.length) {
      rootElement.innerHTML = '<p class="journey-empty">No game memories are ready to show yet.</p>';
      return;
    }

    rootElement.innerHTML = chapters.map(createChapterMarkup).join('');
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
    createGameCardMarkup,
    createHeroStripMarkup,
    getRenderableChapters,
    loadGamingJourney,
    renderGamingJourney,
  };
});
