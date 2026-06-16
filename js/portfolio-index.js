(function (global) {
  const fallbackImage = 'img/og-image.png';
  const hoverIntentDelay = 150;
  const curatedPortfolioFilters = [
    { value: 'featured', label: 'Featured' },
    { value: 'archive', label: 'Archive' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'prototype', label: 'Prototype' },
    { value: 'unannounced', label: 'Unannounced' },
    { value: 'case-study', label: 'Case Study' },
  ];

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function normalizeText(value) {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (typeof value === 'number') {
      return String(value);
    }

    return '';
  }

  function normalizeFilterValue(value) {
    return normalizeText(value).toLowerCase();
  }

  function escapeHtml(value) {
    return normalizeText(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatFilterLabel(value) {
    return normalizeText(value)
      .split(/[-\s]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  function projectYearValue(project) {
    const parsedYear = Number.parseInt(normalizeText(project && project.year), 10);
    return Number.isFinite(parsedYear) ? parsedYear : 0;
  }

  function compareProjects(left, right) {
    const yearDelta = projectYearValue(right) - projectYearValue(left);

    if (yearDelta !== 0) {
      return yearDelta;
    }

    return normalizeText(left && left.title).localeCompare(normalizeText(right && right.title));
  }

  function getPortfolioProjects(projects) {
    return asArray(projects)
      .filter((project) => normalizeText(project && project.slug) && normalizeText(project && project.title))
      .slice()
      .sort(compareProjects);
  }

  function getFeaturedProjects(projects) {
    return getPortfolioProjects(projects).filter((project) => Boolean(project && project.featured));
  }

  function projectHasCuratedFilter(project, filterValue) {
    const normalizedFilter = normalizeFilterValue(filterValue);

    if (!normalizedFilter) {
      return false;
    }

    if (normalizedFilter === 'featured') {
      return Boolean(project && project.featured);
    }

    return asArray(project && project.filters)
      .map(normalizeFilterValue)
      .includes(normalizedFilter);
  }

  function getPortfolioFilters(projects) {
    return [
      { value: 'all', label: 'All Projects' },
      ...curatedPortfolioFilters.filter((filterOption) =>
        getPortfolioProjects(projects).some((project) => projectHasCuratedFilter(project, filterOption.value))
      ),
    ];
  }

  function projectMatchesFilter(project, filterValue) {
    const normalizedFilter = normalizeFilterValue(filterValue);

    if (!normalizedFilter || normalizedFilter === 'all') {
      return true;
    }

    if (!curatedPortfolioFilters.some((filterOption) => filterOption.value === normalizedFilter)) {
      return false;
    }

    return projectHasCuratedFilter(project, normalizedFilter);
  }

  function selectSpotlightProject(projects, requestedSlug) {
    const sortedProjects = getPortfolioProjects(projects);
    const requested = normalizeText(requestedSlug);

    if (!sortedProjects.length) {
      return null;
    }

    return sortedProjects.find((project) => project.slug === requested) || sortedProjects[0];
  }

  function projectUrl(slug) {
    return 'project.html?slug=' + encodeURIComponent(slug);
  }

  function listSummary(value, fallbackText) {
    const items = asArray(value).map(normalizeText).filter(Boolean);

    if (items.length) {
      return items.join(' / ');
    }

    return normalizeText(value) || fallbackText;
  }

  function getResolvedMediaFactory(resolveMediaSource) {
    return function getResolvedMedia(videoValue) {
      if (typeof resolveMediaSource !== 'function') {
        return {
          kind: 'unknown',
          src: normalizeText(videoValue),
          embedSrc: '',
          id: '',
        };
      }

      return resolveMediaSource(videoValue);
    };
  }

  function isPlayableMedia(resolvedMedia) {
    return ['youtube', 'drive', 'file'].includes(resolvedMedia.kind);
  }

  function buildYouTubePlayerUrl(resolvedMedia) {
    const separator = resolvedMedia.embedSrc.includes('?') ? '&' : '?';
    const playlist = resolvedMedia.id ? '&playlist=' + encodeURIComponent(resolvedMedia.id) : '';
    return resolvedMedia.embedSrc
      + separator
      + 'autoplay=1&mute=1&controls=1&loop=1'
      + playlist
      + '&playsinline=1&rel=0&modestbranding=1';
  }

  function buildDrivePlayerUrl(resolvedMedia) {
    const separator = resolvedMedia.embedSrc.includes('?') ? '&' : '?';
    return resolvedMedia.embedSrc + separator + 'usp=sharing';
  }

  const portfolioIndexApi = {
    getFeaturedProjects,
    getPortfolioProjects,
    getPortfolioFilters,
    projectMatchesFilter,
    selectSpotlightProject,
    normalizeText,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = portfolioIndexApi;
  }

  global.PortfolioIndexUtils = portfolioIndexApi;

  if (typeof document === 'undefined') {
    return;
  }

  const explorerRoot = document.getElementById('portfolio-explorer');
  const filtersRoot = document.getElementById('portfolio-filters');
  const spotlightRoot = document.getElementById('portfolio-spotlight');
  const cardGridRoot = document.getElementById('portfolio-card-grid');
  const i18n = global.PortfolioI18n;
  const resolveMediaSource = global.PortfolioMediaSource && global.PortfolioMediaSource.resolveMediaSource;
  const getResolvedMedia = getResolvedMediaFactory(resolveMediaSource);
  const hasExplorer = Boolean(explorerRoot && filtersRoot && spotlightRoot && cardGridRoot);

  if (!hasExplorer) {
    return;
  }

  function attachImageFallbacks(root, selector) {
    if (!root) {
      return;
    }

    root.querySelectorAll(selector).forEach((image) => {
      image.addEventListener('error', (event) => {
        event.currentTarget.src = fallbackImage;
      }, { once: true });
    });
  }

  function translate(key, fallback, params) {
    return i18n && typeof i18n.t === 'function'
      ? i18n.t(key, fallback, params)
      : fallback;
  }

  function localizeInternalUrl(url) {
    return i18n && typeof i18n.localizeUrl === 'function'
      ? i18n.localizeUrl(url, i18n.getLanguage && i18n.getLanguage())
      : url;
  }

  function localizedProjectUrl(slug) {
    return localizeInternalUrl(projectUrl(slug));
  }

  function localizedFilterLabel(filterOption) {
    const keyByValue = {
      all: 'portfolio.allProjects',
      featured: 'portfolio.featured',
      archive: 'portfolio.archive',
      mobile: 'portfolio.mobile',
      prototype: 'portfolio.prototype',
      unannounced: 'portfolio.unannounced',
      'case-study': 'portfolio.caseStudy',
    };

    return translate(keyByValue[filterOption.value], filterOption.label);
  }

  function buildSpotlightMediaTemplate(project, isPlaying) {
    const title = normalizeText(project && project.title) || 'Project';
    const slug = normalizeText(project && project.slug);
    const poster = normalizeText(project && project.thumbnail)
      || normalizeText(project && project.heroImage)
      || fallbackImage;
    const resolvedMedia = getResolvedMedia(project && project.video);

    if (isPlaying && resolvedMedia.kind === 'youtube') {
      return `
        <div class="portfolio-spotlight__player-wrap">
          <iframe
            class="portfolio-spotlight__video"
            src="${escapeHtml(buildYouTubePlayerUrl(resolvedMedia))}"
            title="${escapeHtml(title)} preview video"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowfullscreen
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"></iframe>
          <button class="portfolio-feature-card__stop" type="button" data-stop-preview="${escapeHtml(slug)}" aria-label="${escapeHtml(translate('portfolio.stopPreview', 'Stop preview for {title}', { title }))}">
            <i class="ph-bold ph-x"></i>
          </button>
        </div>
      `;
    }

    if (isPlaying && resolvedMedia.kind === 'drive') {
      return `
        <div class="portfolio-spotlight__player-wrap">
          <iframe
            class="portfolio-spotlight__video"
            src="${escapeHtml(buildDrivePlayerUrl(resolvedMedia))}"
            title="${escapeHtml(title)} preview video"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowfullscreen
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"></iframe>
          <button class="portfolio-feature-card__stop" type="button" data-stop-preview="${escapeHtml(slug)}" aria-label="${escapeHtml(translate('portfolio.stopPreview', 'Stop preview for {title}', { title }))}">
            <i class="ph-bold ph-x"></i>
          </button>
        </div>
      `;
    }

    if (isPlaying && resolvedMedia.kind === 'file') {
      return `
        <div class="portfolio-spotlight__player-wrap">
          <video
            class="portfolio-spotlight__video"
            src="${escapeHtml(resolvedMedia.embedSrc)}"
            autoplay
            muted
            controls
            loop
            playsinline
            preload="metadata"></video>
          <button class="portfolio-feature-card__stop" type="button" data-stop-preview="${escapeHtml(slug)}" aria-label="${escapeHtml(translate('portfolio.stopPreview', 'Stop preview for {title}', { title }))}">
            <i class="ph-bold ph-x"></i>
          </button>
        </div>
      `;
    }

    return `
      <div class="portfolio-spotlight__poster-wrap">
        <img class="portfolio-spotlight__image" src="${escapeHtml(poster)}" alt="${escapeHtml(title)} spotlight" loading="eager" decoding="async" fetchpriority="high">
        ${isPlayableMedia(resolvedMedia) ? `
          <button class="portfolio-feature-card__play-button" type="button" data-play-preview="${escapeHtml(slug)}" aria-label="${escapeHtml(translate('portfolio.playPreview', 'Play preview for {title}', { title }))}">
            <span class="portfolio-feature-card__play-icon"><i class="ph-fill ph-play"></i></span>
          </button>
        ` : ''}
      </div>
    `;
  }

  function buildSpotlightTemplate(project, isPlaying) {
    const type = normalizeText(project && project.type) || 'Project';
    const year = normalizeText(project && project.year) || 'TBD';
    const title = normalizeText(project && project.title) || 'Untitled Project';
    const tagline = normalizeText(project && project.tagline) || 'Open the case study for the full breakdown.';
    const summary = normalizeText(project && project.cardSummary) || normalizeText(project && project.summary) || 'Project summary is being prepared.';
    const platform = normalizeText(project && project.platform) || 'TBD';
    const role = listSummary(project && project.role, 'TBD');
    const status = normalizeText(project && project.status) || 'TBD';
    const slug = normalizeText(project && project.slug);

    return `
      <div class="portfolio-spotlight__media">
        ${buildSpotlightMediaTemplate(project, isPlaying)}
      </div>
      <div class="portfolio-spotlight__body">
        <div class="portfolio-spotlight__intro">
          <div class="portfolio-meta-row">
            <span class="portfolio-pill">${escapeHtml(type)}</span>
            <span class="portfolio-pill">${escapeHtml(year)}</span>
          </div>
          <h3 class="portfolio-spotlight__title">${escapeHtml(title)}</h3>
          <p class="portfolio-spotlight__lede">${escapeHtml(tagline)}</p>
        </div>
        <p class="portfolio-spotlight__summary">${escapeHtml(summary)}</p>
        <dl class="portfolio-facts">
          <div class="portfolio-fact">
            <dt class="portfolio-fact__label">${escapeHtml(translate('portfolio.platform', 'Platform'))}</dt>
            <dd class="portfolio-fact__value">${escapeHtml(platform)}</dd>
          </div>
          <div class="portfolio-fact">
            <dt class="portfolio-fact__label">${escapeHtml(translate('portfolio.role', 'Role'))}</dt>
            <dd class="portfolio-fact__value">${escapeHtml(role)}</dd>
          </div>
          <div class="portfolio-fact">
            <dt class="portfolio-fact__label">${escapeHtml(translate('portfolio.status', 'Status'))}</dt>
            <dd class="portfolio-fact__value">${escapeHtml(status)}</dd>
          </div>
        </dl>
        <div class="portfolio-spotlight__actions">
          <a class="btn btn-default btn-hover btn-hover-accent" href="${escapeHtml(localizedProjectUrl(slug))}" aria-label="${escapeHtml(translate('portfolio.openCaseFor', 'Open case study for {title}', { title }))}">
            <span class="btn-caption">${escapeHtml(translate('portfolio.openCaseStudy', 'Open Case Study'))}</span>
            <i class="ph-bold ph-arrow-up-right"></i>
          </a>
        </div>
      </div>
    `;
  }

  function buildCardTemplate(project, activeSlug) {
    const type = normalizeText(project && project.type) || 'Project';
    const year = normalizeText(project && project.year) || 'TBD';
    const title = normalizeText(project && project.title) || 'Untitled Project';
    const tagline = normalizeText(project && project.tagline) || type;
    const summary = normalizeText(project && project.cardSummary) || normalizeText(project && project.summary) || 'Project summary is being prepared.';
    const thumbnail = normalizeText(project && project.thumbnail) || fallbackImage;
    const slug = normalizeText(project && project.slug);
    const isActive = slug === activeSlug;

    return `
      <article class="portfolio-card${isActive ? ' is-active' : ''}" data-portfolio-project="${escapeHtml(slug)}">
        <a class="portfolio-card__link" href="${escapeHtml(localizedProjectUrl(slug))}" aria-label="${escapeHtml(translate('portfolio.openCaseFor', 'Open case study for {title}', { title }))}">
          <div class="portfolio-card__media">
            <img class="portfolio-card__image" src="${escapeHtml(thumbnail)}" alt="${escapeHtml(title)} thumbnail" loading="lazy" decoding="async" fetchpriority="low">
          </div>
          <div class="portfolio-card__body">
            <div class="portfolio-card__intro">
              <div class="portfolio-meta-row">
                <span class="portfolio-pill">${escapeHtml(type)}</span>
                <span class="portfolio-pill">${escapeHtml(year)}</span>
              </div>
              <h4 class="portfolio-card__title">${escapeHtml(title)}</h4>
              <p class="portfolio-card__tagline">${escapeHtml(tagline)}</p>
            </div>
            <p class="portfolio-card__description">${escapeHtml(summary)}</p>
            <span class="portfolio-card__cta">
              <span>${escapeHtml(translate('portfolio.openProject', 'Open project'))}</span>
              <i class="ph-bold ph-arrow-right"></i>
            </span>
          </div>
        </a>
      </article>
    `;
  }

  function closestProjectCard(target) {
    if (!target || typeof target.closest !== 'function') {
      return null;
    }

    return target.closest('[data-portfolio-project]');
  }

  function prefersReducedMotion() {
    return typeof global.matchMedia === 'function'
      && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function runPortfolioViewTransition(update) {
    if (typeof update !== 'function') {
      return;
    }

    if (prefersReducedMotion() || !document.startViewTransition) {
      update();
      return;
    }

    try {
      const transition = document.startViewTransition(update);

      if (transition && transition.finished && typeof transition.finished.catch === 'function') {
        transition.finished.catch(() => {});
      }
    } catch (error) {
      update();
    }
  }

  function hasMotionSupport() {
    return !prefersReducedMotion()
      && typeof global.gsap !== 'undefined'
      && typeof global.gsap.timeline === 'function';
  }

  function refreshPortfolioMotion() {
    if (typeof global.ScrollTrigger === 'undefined' || typeof global.ScrollTrigger.refresh !== 'function') {
      return;
    }

    const refresh = () => {
      global.ScrollTrigger.refresh();
    };

    if (typeof global.requestAnimationFrame === 'function') {
      global.requestAnimationFrame(refresh);
      return;
    }

    refresh();
  }

  function animatePortfolioSpotlight() {
    if (!hasMotionSupport()) {
      refreshPortfolioMotion();
      return;
    }

    const media = spotlightRoot.querySelector('.portfolio-spotlight__media');
    const bodyItems = Array.from(spotlightRoot.querySelectorAll('.portfolio-spotlight__body > *'));
    const motionItems = [media, ...bodyItems].filter(Boolean);

    if (!motionItems.length) {
      refreshPortfolioMotion();
      return;
    }

    spotlightRoot.setAttribute('data-motion-ready', 'true');
    global.gsap.killTweensOf(motionItems);

    const timeline = global.gsap.timeline({
      defaults: { ease: 'power2.out', overwrite: true },
      onComplete: () => {
        global.gsap.set(motionItems, { clearProps: 'transform,opacity,visibility' });
        refreshPortfolioMotion();
      },
    });

    if (media) {
      timeline.fromTo(
        media,
        { autoAlpha: 0, scale: 0.985 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.42,
          ease: 'power3.out',
        },
        0
      );
    }

    if (bodyItems.length) {
      timeline.fromTo(
        bodyItems,
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.42,
          stagger: 0.05,
        },
        media ? 0.06 : 0
      );
    }
  }

  function animatePortfolioExplorerMotion(options = {}) {
    if (!hasMotionSupport()) {
      refreshPortfolioMotion();
      return;
    }

    const cards = Array.from(cardGridRoot.querySelectorAll('.portfolio-card'));

    animatePortfolioSpotlight();

    if (!cards.length) {
      return;
    }

    if (options.includeFilters) {
      const filters = Array.from(filtersRoot.querySelectorAll('.portfolio-filter'));
      global.gsap.fromTo(
        filters,
        { autoAlpha: 0, y: 8 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.22,
          stagger: 0.04,
          ease: 'power2.out',
          overwrite: true,
          clearProps: 'transform,opacity,visibility',
        }
      );
    }

    global.gsap.fromTo(
      cards,
      { autoAlpha: 0, y: 18 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.42,
        stagger: 0.05,
        ease: 'power2.out',
        overwrite: true,
        clearProps: 'transform,opacity,visibility',
      }
    );
  }

  try {
    const ready = i18n && typeof i18n.whenReady === 'function' ? i18n.whenReady() : Promise.resolve();

    ready.then(() => fetch('projects.json'))
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to fetch project data: ' + response.status);
        }

        return response.json();
      })
      .then((payload) => {
        return i18n && typeof i18n.getLocalizedProjectPayload === 'function'
          ? i18n.getLocalizedProjectPayload(payload)
          : payload;
      })
      .then((payload) => {
        const allProjects = getPortfolioProjects(payload && payload.projects);
        const portfolioFilters = getPortfolioFilters(allProjects);
        let activeFilter = 'all';
        let spotlightSlug = normalizeText(allProjects[0] && allProjects[0].slug);
        let playingSlug = '';
        let hoverIntentTimer = 0;
        let hoverIntentSlug = '';

        function getFilteredProjects() {
          return allProjects.filter((project) => projectMatchesFilter(project, activeFilter));
        }

        function syncActiveCards() {
          cardGridRoot.querySelectorAll('[data-portfolio-project]').forEach((card) => {
            const isActive = normalizeText(card.getAttribute('data-portfolio-project')) === spotlightSlug;
            card.classList.toggle('is-active', isActive);
          });
        }

        function renderSpotlight(projects) {
          const spotlightProject = selectSpotlightProject(projects, spotlightSlug);

          if (!projects.length || !spotlightProject) {
            spotlightSlug = '';
            playingSlug = '';
            spotlightRoot.innerHTML = '<div class="portfolio-empty">' + escapeHtml(translate('portfolio.noProjects', 'No projects match this filter yet.')) + '</div>';
            return;
          }

          spotlightSlug = normalizeText(spotlightProject.slug);

          if (playingSlug !== spotlightSlug) {
            playingSlug = '';
          }

          spotlightRoot.innerHTML = buildSpotlightTemplate(spotlightProject, playingSlug === spotlightSlug);
          attachImageFallbacks(spotlightRoot, '.portfolio-spotlight__image');
        }

        function renderCards(projects) {
          if (!projects.length) {
            cardGridRoot.innerHTML = '<div class="portfolio-empty">' + escapeHtml(translate('portfolio.noProjects', 'No projects match this filter yet.')) + '</div>';
            return;
          }

          cardGridRoot.innerHTML = projects.map((project) => buildCardTemplate(project, spotlightSlug)).join('');
          attachImageFallbacks(cardGridRoot, '.portfolio-card__image');
          syncActiveCards();
        }

        function renderFilters() {
          filtersRoot.innerHTML = portfolioFilters
            .map((filterOption) => {
              const isActive = filterOption.value === activeFilter;
              return `
                <button
                  class="portfolio-filter${isActive ? ' is-active' : ''}"
                  type="button"
                  data-portfolio-filter="${escapeHtml(filterOption.value)}"
                  aria-pressed="${isActive ? 'true' : 'false'}">
                  ${escapeHtml(localizedFilterLabel(filterOption))}
                </button>
              `;
            })
            .join('');
        }

        function renderExplorer(options = {}) {
          const filteredProjects = getFilteredProjects();
          renderFilters();
          renderSpotlight(filteredProjects);
          renderCards(filteredProjects);

          if (options.animate) {
            animatePortfolioExplorerMotion({ includeFilters: Boolean(options.includeFilters) });
            return;
          }

          refreshPortfolioMotion();
        }

        function clearHoverIntent() {
          if (hoverIntentTimer) {
            global.clearTimeout(hoverIntentTimer);
            hoverIntentTimer = 0;
          }

          hoverIntentSlug = '';
        }

        function scheduleHoverIntent(card) {
          const requestedSlug = normalizeText(card && card.getAttribute('data-portfolio-project'));

          if (!requestedSlug || requestedSlug === spotlightSlug || requestedSlug === hoverIntentSlug) {
            return;
          }

          clearHoverIntent();
          hoverIntentSlug = requestedSlug;
          hoverIntentTimer = global.setTimeout(() => {
            hoverIntentTimer = 0;
            hoverIntentSlug = '';
            updateSpotlightFromCard(card);
          }, hoverIntentDelay);
        }

        function updateSpotlightFromCard(card) {
          clearHoverIntent();
          const requestedSlug = normalizeText(card && card.getAttribute('data-portfolio-project'));
          const filteredProjects = getFilteredProjects();
          const nextProject = selectSpotlightProject(filteredProjects, requestedSlug);
          const nextSlug = normalizeText(nextProject && nextProject.slug);

          if (!nextSlug || nextSlug === spotlightSlug) {
            return;
          }

          spotlightSlug = nextSlug;
          playingSlug = '';
          renderSpotlight(filteredProjects);
          syncActiveCards();
          animatePortfolioSpotlight();
        }

        filtersRoot.addEventListener('click', (event) => {
          const filterButton = event.target && typeof event.target.closest === 'function'
            ? event.target.closest('[data-portfolio-filter]')
            : null;

          if (!filterButton) {
            return;
          }

          activeFilter = normalizeFilterValue(filterButton.getAttribute('data-portfolio-filter')) || 'all';
          clearHoverIntent();
          playingSlug = '';
          runPortfolioViewTransition(() => {
            renderExplorer({ animate: true, includeFilters: true });
          });
        });

        cardGridRoot.addEventListener('pointerenter', (event) => {
          const card = closestProjectCard(event.target);
          const previousCard = closestProjectCard(event.relatedTarget);

          if (!card || card === previousCard) {
            return;
          }

          scheduleHoverIntent(card);
        }, true);

        cardGridRoot.addEventListener('pointerleave', (event) => {
          const card = closestProjectCard(event.target);
          const nextCard = closestProjectCard(event.relatedTarget);

          if (!card || card === nextCard) {
            return;
          }

          clearHoverIntent();
        }, true);

        cardGridRoot.addEventListener('focusin', (event) => {
          clearHoverIntent();
          const card = closestProjectCard(event.target);

          if (!card) {
            return;
          }

          updateSpotlightFromCard(card);
        });

        spotlightRoot.addEventListener('click', (event) => {
          const playButton = event.target.closest('[data-play-preview]');
          const stopButton = event.target.closest('[data-stop-preview]');

          if (playButton) {
            event.preventDefault();
            event.stopPropagation();
            playingSlug = normalizeText(playButton.getAttribute('data-play-preview'));
            runPortfolioViewTransition(() => {
              renderSpotlight(getFilteredProjects());
              animatePortfolioSpotlight();
            });
            return;
          }

          if (stopButton) {
            event.preventDefault();
            event.stopPropagation();
            playingSlug = '';
            runPortfolioViewTransition(() => {
              renderSpotlight(getFilteredProjects());
              animatePortfolioSpotlight();
            });
          }
        });

        renderExplorer({ animate: true, includeFilters: true });
      })
      .catch((error) => {
        console.error('Unable to load homepage portfolio data.', error);
        filtersRoot.innerHTML = '';
        spotlightRoot.innerHTML = '<div class="portfolio-empty">' + escapeHtml(translate('portfolio.loadError', 'The project explorer could not be loaded right now.')) + '</div>';
        cardGridRoot.innerHTML = '';
      });
  } catch (error) {
    console.error('Unable to initialize homepage portfolio.', error);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
