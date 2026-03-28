(async function () {
  const carouselRoot = document.getElementById("portfolio-carousel");
  const trackRoot = document.getElementById("portfolio-carousel-track");
  const prevButton = document.getElementById("portfolio-carousel-prev");
  const nextButton = document.getElementById("portfolio-carousel-next");
  const statusRoot = document.getElementById("portfolio-carousel-status");
  const fallbackImage = "img/og-image.png";

  if (!carouselRoot || !trackRoot || !prevButton || !nextButton || !statusRoot) {
    return;
  }

  function projectUrl(slug) {
    return "project.html?slug=" + encodeURIComponent(slug);
  }

  function viewportCardCount() {
    if (window.matchMedia("(max-width: 767px)").matches) {
      return 1;
    }

    if (window.matchMedia("(max-width: 1199px)").matches) {
      return 2;
    }

    return 3;
  }

  function extractVideoId(embedUrl) {
    return embedUrl.split("/embed/")[1]?.split("?")[0] || "";
  }

  function buildVideoUrl(embedUrl) {
    const separator = embedUrl.includes("?") ? "&" : "?";
    const videoId = extractVideoId(embedUrl);
    const playlist = videoId ? "&playlist=" + videoId : "";
    return embedUrl + separator + "autoplay=1&mute=1&controls=0&loop=1" + playlist + "&playsinline=1&rel=0&modestbranding=1";
  }

  try {
    const response = await fetch("projects.json");

    if (!response.ok) {
      throw new Error("Unable to fetch project data: " + response.status);
    }

    const payload = await response.json();
    const featuredProjects = (Array.isArray(payload.projects) ? payload.projects : [])
      .filter((project) => project.featured)
      .sort((left, right) => Number(right.year || 0) - Number(left.year || 0));

    let activeIndex = 0;
    let cardsPerView = Math.min(Math.max(1, viewportCardCount()), Math.max(1, featuredProjects.length));
    let viewportMode = cardsPerView;

    function getWindowStart() {
      if (featuredProjects.length <= cardsPerView) {
        return 0;
      }

      const preferredOffset = cardsPerView === 1 ? 0 : Math.floor(cardsPerView / 2);
      const maxStart = featuredProjects.length - cardsPerView;
      return Math.min(Math.max(0, activeIndex - preferredOffset), maxStart);
    }

    function getVisibleProjects() {
      const windowStart = getWindowStart();

      return featuredProjects
        .slice(windowStart, windowStart + cardsPerView)
        .map((project, offset) => ({
          project,
          absoluteIndex: windowStart + offset
        }));
    }

    function cardTemplate(project, absoluteIndex) {
      const isActive = absoluteIndex === activeIndex;
      const summary = project.cardSummary || project.summary;
      const metaDuration = project.homepageMeta?.duration || project.year;
      const metaLabel = project.homepageMeta?.linkLabel || project.type;
      const activeMedia = isActive && project.video;
      const mediaMarkup = activeMedia
        ? `<iframe class="portfolio-feature-card__video" src="${buildVideoUrl(project.video)}" title="${project.title} preview video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`
        : `<img class="portfolio-feature-card__image" src="${project.thumbnail || fallbackImage}" alt="${project.title} preview" loading="lazy" decoding="async">`;

      return `
        <article class="portfolio-feature-card${isActive ? " is-active" : ""}" data-project-index="${absoluteIndex}">
          <a class="portfolio-feature-card__link" href="${projectUrl(project.slug)}" aria-label="Open ${project.title}">
            <div class="portfolio-feature-card__media">
              ${mediaMarkup}
              ${project.video ? '<span class="portfolio-feature-card__play" aria-hidden="true"><i class="ph-fill ph-play"></i></span>' : ""}
            </div>
            <div class="portfolio-feature-card__body">
              <h3 class="portfolio-feature-card__title">${project.title}</h3>
              <div class="portfolio-feature-card__meta" aria-label="Homepage project details">
                <span class="portfolio-feature-card__meta-item"><i class="ph ph-clock"></i><span>${metaDuration}</span></span>
                <span class="portfolio-feature-card__meta-item"><i class="ph ph-link-simple"></i><span>${metaLabel}</span></span>
              </div>
              <p class="portfolio-feature-card__summary">${summary}</p>
              <span class="portfolio-feature-card__cta">View Case Study</span>
            </div>
          </a>
        </article>
      `;
    }

    function attachFallbackImages() {
      trackRoot.querySelectorAll(".portfolio-feature-card__image").forEach((image) => {
        image.addEventListener("error", (event) => {
          event.currentTarget.src = fallbackImage;
        }, { once: true });
      });
    }

    function updateControls() {
      const disabled = featuredProjects.length <= 1;
      prevButton.disabled = disabled;
      nextButton.disabled = disabled;
      prevButton.setAttribute("aria-disabled", String(disabled));
      nextButton.setAttribute("aria-disabled", String(disabled));
    }

    function updateStatus() {
      if (!featuredProjects.length) {
        statusRoot.textContent = "Featured projects are being prepared.";
        return;
      }

      if (featuredProjects.length <= cardsPerView) {
        statusRoot.textContent = "Showing all featured projects";
        return;
      }

      statusRoot.textContent = "Project " + (activeIndex + 1) + " of " + featuredProjects.length;
    }

    function render() {
      cardsPerView = Math.min(Math.max(1, viewportCardCount()), Math.max(1, featuredProjects.length));

      if (!featuredProjects.length) {
        trackRoot.innerHTML = '<div class="portfolio-carousel__empty">Featured projects are being prepared.</div>';
        updateControls();
        updateStatus();
        return;
      }

      const visibleProjects = getVisibleProjects();
      trackRoot.dataset.columns = String(cardsPerView);
      trackRoot.innerHTML = visibleProjects.map(({ project, absoluteIndex }) => cardTemplate(project, absoluteIndex)).join("");
      attachFallbackImages();
      updateControls();
      updateStatus();
    }

    function stepCarousel(delta) {
      if (featuredProjects.length <= 1) {
        return;
      }

      activeIndex = (activeIndex + delta + featuredProjects.length) % featuredProjects.length;
      render();
    }

    prevButton.addEventListener("click", () => {
      stepCarousel(-1);
    });

    nextButton.addEventListener("click", () => {
      stepCarousel(1);
    });

    carouselRoot.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepCarousel(-1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        stepCarousel(1);
      }
    });

    window.addEventListener("resize", () => {
      const nextMode = viewportCardCount();

      if (nextMode !== viewportMode) {
        viewportMode = nextMode;
        render();
      }
    });

    render();
  } catch (error) {
    console.error("Unable to load homepage featured projects.", error);
    trackRoot.innerHTML = '<div class="portfolio-carousel__empty">The featured project carousel could not be loaded right now.</div>';
    statusRoot.textContent = "";
    prevButton.disabled = true;
    nextButton.disabled = true;
  }
})();
