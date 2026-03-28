(async function () {
  const explorerRoot = document.getElementById("portfolio-explorer");
  const filtersRoot = document.getElementById("portfolio-filters");
  const spotlightRoot = document.getElementById("portfolio-spotlight");
  const emptyRoot = document.getElementById("portfolio-empty");
  const fallbackImage = "img/og-image.png";

  if (!explorerRoot || !filtersRoot || !spotlightRoot || !emptyRoot) {
    return;
  }

  const filterLabels = {
    all: "All",
    featured: "Featured",
    prototype: "Prototype",
    unity: "Unity",
    systems: "Systems",
    worldbuilding: "Worldbuilding",
    "case-study": "Case Study",
    archive: "Archive",
    horror: "Horror",
    tactics: "Tactics"
  };

  function projectUrl(slug) {
    return "project.html?slug=" + encodeURIComponent(slug);
  }

  try {
    const response = await fetch("projects.json");

    if (!response.ok) {
      throw new Error("Unable to fetch project data: " + response.status);
    }

    const payload = await response.json();
    const projects = (Array.isArray(payload.projects) ? payload.projects : [])
      .slice()
      .sort((left, right) => {
        if (left.featured !== right.featured) {
          return left.featured ? -1 : 1;
        }

        return Number(right.year || 0) - Number(left.year || 0);
      });

    const filters = [
      "all",
      ...Object.keys(filterLabels).filter((key) => {
        if (key === "all") {
          return false;
        }

        return projects.some((project) => (project.filters || []).includes(key));
      })
    ];

    let activeFilter = "all";
    let spotlightSlug = projects[0] ? projects[0].slug : "";

    function getFilteredProjects() {
      if (activeFilter === "all") {
        return projects;
      }

      return projects.filter((project) => (project.filters || []).includes(activeFilter));
    }

    function renderFilters() {
      filtersRoot.innerHTML = "";

      filters.forEach((filterKey) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "portfolio-filter";
        button.textContent = filterLabels[filterKey] || filterKey;
        button.setAttribute("aria-pressed", filterKey === activeFilter ? "true" : "false");

        if (filterKey === activeFilter) {
          button.classList.add("is-active");
        }

        button.addEventListener("click", () => {
          activeFilter = filterKey;
          render();
        });

        filtersRoot.appendChild(button);
      });
    }

    function renderSpotlight(project) {
      if (!project) {
        spotlightRoot.innerHTML = "";
        return;
      }

      const roleSummary = Array.isArray(project.role) ? project.role.join(" / ") : project.role;
      const actionLabel = project.type === "Archive" ? "Open Archive Entry" : "View Case Study";

      spotlightRoot.innerHTML = `
        <img class="portfolio-spotlight__image" src="${project.heroImage || fallbackImage}" alt="${project.title} hero image" loading="eager" decoding="async">
        <div class="portfolio-spotlight__body">
          <div class="portfolio-meta-row">
            <span class="portfolio-pill">${project.type}</span>
            <span class="portfolio-pill">${project.year}</span>
          </div>
          <div class="portfolio-spotlight__intro">
            <p class="project-section__eyebrow">${project.status}</p>
            <h3 class="portfolio-spotlight__title">${project.title}</h3>
            <p class="portfolio-spotlight__lede">${project.tagline}</p>
          </div>
          <p class="portfolio-spotlight__summary">${project.summary}</p>
          <dl class="portfolio-facts">
            <div class="portfolio-fact">
              <dt class="portfolio-fact__label">Role</dt>
              <dd class="portfolio-fact__value">${roleSummary}</dd>
            </div>
            <div class="portfolio-fact">
              <dt class="portfolio-fact__label">Platform</dt>
              <dd class="portfolio-fact__value">${project.platform}</dd>
            </div>
            <div class="portfolio-fact">
              <dt class="portfolio-fact__label">Team</dt>
              <dd class="portfolio-fact__value">${project.teamSize}</dd>
            </div>
          </dl>
          <div class="portfolio-spotlight__actions">
            <a class="btn btn-default btn-hover btn-hover-accent" href="${projectUrl(project.slug)}">
              <span class="btn-caption">${actionLabel}</span>
              <i class="ph-bold ph-arrow-right"></i>
            </a>
            <a class="btn btn-default btn-hover btn-hover-outline" href="${projectUrl(project.slug)}#project-gallery">
              <span class="btn-caption">Browse Gallery</span>
              <i class="ph-bold ph-images"></i>
            </a>
          </div>
        </div>
      `;
    }

    function renderCards(filteredProjects) {
      explorerRoot.innerHTML = "";

      filteredProjects.forEach((project) => {
        const roleSummary = Array.isArray(project.role) ? project.role.join(" / ") : project.role;
        const card = document.createElement("article");
        card.className = "portfolio-card";

        card.innerHTML = `
          <a class="portfolio-card__link" href="${projectUrl(project.slug)}" aria-label="Open ${project.title}">
            <div class="portfolio-card__media">
              <img class="portfolio-card__image" src="${project.thumbnail || fallbackImage}" alt="${project.title} thumbnail" loading="lazy" decoding="async">
            </div>
            <div class="portfolio-card__body">
              <div class="portfolio-meta-row">
                <span class="portfolio-pill">${project.type}</span>
                <span class="portfolio-pill">${project.year}</span>
              </div>
              <div class="portfolio-card__intro">
                <h3 class="portfolio-card__title">${project.title}</h3>
                <p class="portfolio-card__tagline">${project.tagline}</p>
              </div>
              <div class="portfolio-card__meta" aria-label="Project details">
                <span class="portfolio-card__meta-item">${roleSummary}</span>
                <span class="portfolio-card__meta-item">${project.platform}</span>
              </div>
              <p class="portfolio-card__description">${project.summary}</p>
              <span class="portfolio-card__cta">
                <span>Open case study</span>
                <i class="ph-bold ph-arrow-up-right"></i>
              </span>
            </div>
          </a>
        `;

        card.addEventListener("mouseenter", () => {
          spotlightSlug = project.slug;
          renderSpotlight(project);
        });

        card.addEventListener("focusin", () => {
          spotlightSlug = project.slug;
          renderSpotlight(project);
        });

        explorerRoot.appendChild(card);
      });

      spotlightRoot.querySelector(".portfolio-spotlight__image")?.addEventListener("error", (event) => {
        event.currentTarget.src = fallbackImage;
      }, { once: true });

      explorerRoot.querySelectorAll(".portfolio-card__image").forEach((image) => {
        image.addEventListener("error", (event) => {
          event.currentTarget.src = fallbackImage;
        }, { once: true });
      });
    }

    function render() {
      const filteredProjects = getFilteredProjects();
      const spotlightProject = filteredProjects.find((project) => project.slug === spotlightSlug) || filteredProjects[0];

      if (spotlightProject) {
        spotlightSlug = spotlightProject.slug;
      }

      renderFilters();
      renderSpotlight(spotlightProject);
      renderCards(filteredProjects);
      emptyRoot.hidden = filteredProjects.length > 0;
    }

    render();
  } catch (error) {
    console.error("Unable to load portfolio explorer data.", error);
    spotlightRoot.innerHTML = "";
    explorerRoot.innerHTML = "";
    filtersRoot.innerHTML = "";
    emptyRoot.hidden = false;
    emptyRoot.textContent = "The project explorer could not be loaded right now.";
  }
})();
