(async function () {
  const carouselRoot = document.getElementById("portfolio-carousel");
  const viewportRoot = carouselRoot?.querySelector(".portfolio-carousel__viewport");
  const trackRoot = document.getElementById("portfolio-carousel-track");
  const prevButton = document.getElementById("portfolio-carousel-prev");
  const nextButton = document.getElementById("portfolio-carousel-next");
  const statusRoot = document.getElementById("portfolio-carousel-status");
  const fallbackImage = "img/og-image.png";
  const transitionDuration = 560;
  const transitionEasing = "cubic-bezier(0.22, 1, 0.36, 1)";

  if (!carouselRoot || !viewportRoot || !trackRoot || !prevButton || !nextButton || !statusRoot) {
    return;
  }

  function projectUrl(slug) {
    return "project.html?slug=" + encodeURIComponent(slug);
  }

  function extractVideoId(embedUrl) {
    return embedUrl.split("/embed/")[1]?.split("?")[0] || "";
  }

  function buildVideoUrl(embedUrl) {
    const separator = embedUrl.includes("?") ? "&" : "?";
    const videoId = extractVideoId(embedUrl);
    const playlist = videoId ? "&playlist=" + videoId : "";
    return embedUrl + separator + "autoplay=1&mute=1&controls=1&loop=1" + playlist + "&playsinline=1&rel=0&modestbranding=1";
  }

  function visibleCount() {
    return viewportRoot.clientWidth < 768 ? 1 : 3;
  }

  function offsetsForVisibleCount(count) {
    const outer = Math.floor(count / 2) + 1;
    const offsets = [];

    for (let offset = -outer; offset <= outer; offset += 1) {
      offsets.push(offset);
    }

    return offsets;
  }

  function cardWidthForViewport(count) {
    const styles = window.getComputedStyle(trackRoot);
    const gap = parseFloat(styles.columnGap || styles.gap || 0);
    const width = viewportRoot.clientWidth;

    if (count === 1) {
      return Math.max(0, Math.floor(width));
    }

    return Math.max(240, Math.floor((width - gap * (count - 1)) / count));
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
    let playingSlug = "";
    let isAnimating = false;
    let resizeFrame = 0;

    function trackStep() {
      const styles = window.getComputedStyle(trackRoot);
      const gap = parseFloat(styles.columnGap || styles.gap || 0);
      const width = parseFloat(trackRoot.style.getPropertyValue("--portfolio-card-width") || 0);
      return width + gap;
    }

    function baseOffset() {
      return -trackStep();
    }

    function setTrackPosition(offset, animate) {
      trackRoot.style.transition = animate ? `transform ${transitionDuration}ms ${transitionEasing}` : "none";
      trackRoot.style.transform = `translate3d(${offset}px, 0, 0)`;
    }

    function updateStatus() {
      if (!featuredProjects.length) {
        statusRoot.textContent = "Featured projects are being prepared.";
        return;
      }

      statusRoot.textContent = "Project " + (activeIndex + 1) + " of " + featuredProjects.length;
    }

    function updateControls() {
      const disabled = featuredProjects.length <= 1 || isAnimating;
      prevButton.disabled = disabled;
      nextButton.disabled = disabled;
      prevButton.setAttribute("aria-disabled", String(disabled));
      nextButton.setAttribute("aria-disabled", String(disabled));
    }

    function mediaTemplate(project, isPlaying) {
      if (isPlaying && project.video) {
        return `
          <div class="portfolio-feature-card__player-wrap">
            <iframe
              class="portfolio-feature-card__video"
              src="${buildVideoUrl(project.video)}"
              title="${project.title} preview video"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowfullscreen
              loading="lazy"
              referrerpolicy="strict-origin-when-cross-origin"></iframe>
            <button class="portfolio-feature-card__stop" type="button" data-stop-preview="${project.slug}" aria-label="Stop preview for ${project.title}">
              <i class="ph-bold ph-x"></i>
            </button>
          </div>
        `;
      }

      return `
        <div class="portfolio-feature-card__poster-wrap">
          <img class="portfolio-feature-card__image" src="${project.thumbnail || fallbackImage}" alt="${project.title} preview" loading="lazy" decoding="async">
          ${project.video ? `
            <button class="portfolio-feature-card__play-button" type="button" data-play-preview="${project.slug}" aria-label="Play preview for ${project.title}">
              <span class="portfolio-feature-card__play-icon"><i class="ph-fill ph-play"></i></span>
            </button>
          ` : ""}
        </div>
      `;
    }

    function cardTemplate(project) {
      const summary = project.cardSummary || project.summary;
      const metaDuration = project.homepageMeta?.duration || project.year;
      const metaLabel = project.homepageMeta?.linkLabel || project.type;
      const isPlaying = playingSlug === project.slug;

      return `
        <article class="portfolio-feature-card">
          <div class="portfolio-feature-card__media">
            ${mediaTemplate(project, isPlaying)}
          </div>
          <div class="portfolio-feature-card__body">
            <h3 class="portfolio-feature-card__title">${project.title}</h3>
            <div class="portfolio-feature-card__meta" aria-label="Homepage project details">
              <span class="portfolio-feature-card__meta-item"><i class="ph ph-clock"></i><span>${metaDuration}</span></span>
              <span class="portfolio-feature-card__meta-item"><i class="ph ph-link-simple"></i><span>${metaLabel}</span></span>
            </div>
            <p class="portfolio-feature-card__summary">${summary}</p>
            <a class="portfolio-feature-card__view btn btn-default btn-hover btn-hover-accent" href="${projectUrl(project.slug)}" aria-label="View case study for ${project.title}">
              <span class="btn-caption">View Case Study</span>
              <i class="ph-bold ph-arrow-up-right"></i>
            </a>
          </div>
        </article>
      `;
    }

    function attachImageFallbacks() {
      trackRoot.querySelectorAll(".portfolio-feature-card__image").forEach((image) => {
        image.addEventListener("error", (event) => {
          event.currentTarget.src = fallbackImage;
        }, { once: true });
      });
    }

    function windowedProjects() {
      const count = visibleCount();
      const offsets = offsetsForVisibleCount(count);

      return offsets.map((offset) => {
        const index = (activeIndex + offset + featuredProjects.length) % featuredProjects.length;
        return {
          project: featuredProjects[index]
        };
      });
    }

    function renderWindow() {
      if (!featuredProjects.length) {
        trackRoot.innerHTML = '<div class="portfolio-carousel__empty">Featured projects are being prepared.</div>';
        updateControls();
        updateStatus();
        return;
      }

      const count = visibleCount();
      const cardWidth = cardWidthForViewport(count);

      trackRoot.style.setProperty("--portfolio-card-width", `${cardWidth}px`);
      trackRoot.innerHTML = windowedProjects().map(({ project }) => cardTemplate(project)).join("");
      attachImageFallbacks();
      updateStatus();

      requestAnimationFrame(() => {
        setTrackPosition(baseOffset(), false);
        updateControls();
      });
    }

    function animate(direction) {
      if (featuredProjects.length <= 1 || isAnimating) {
        return;
      }

      isAnimating = true;
      playingSlug = "";
      updateControls();

      const step = trackStep();
      const target = direction === "next" ? -(step * 2) : 0;

      requestAnimationFrame(() => {
        setTrackPosition(target, true);
      });

      const handleTransitionEnd = () => {
        trackRoot.removeEventListener("transitionend", handleTransitionEnd);
        activeIndex = direction === "next"
          ? (activeIndex + 1) % featuredProjects.length
          : (activeIndex - 1 + featuredProjects.length) % featuredProjects.length;
        isAnimating = false;
        renderWindow();
      };

      trackRoot.addEventListener("transitionend", handleTransitionEnd, { once: true });
    }

    function queueResizeRender() {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        if (!isAnimating) {
          renderWindow();
        }
      });
    }

    prevButton.addEventListener("click", () => {
      animate("prev");
    });

    nextButton.addEventListener("click", () => {
      animate("next");
    });

    trackRoot.addEventListener("click", (event) => {
      const playButton = event.target.closest("[data-play-preview]");
      const stopButton = event.target.closest("[data-stop-preview]");

      if (playButton) {
        event.preventDefault();
        event.stopPropagation();
        playingSlug = playButton.getAttribute("data-play-preview") || "";
        renderWindow();
        return;
      }

      if (stopButton) {
        event.preventDefault();
        event.stopPropagation();
        playingSlug = "";
        renderWindow();
      }
    });

    carouselRoot.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        animate("prev");
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        animate("next");
      }
    });

    window.addEventListener("resize", queueResizeRender);
    renderWindow();
  } catch (error) {
    console.error("Unable to load homepage featured projects.", error);
    trackRoot.innerHTML = '<div class="portfolio-carousel__empty">The featured project carousel could not be loaded right now.</div>';
    statusRoot.textContent = "";
    prevButton.disabled = true;
    nextButton.disabled = true;
  }
})();
