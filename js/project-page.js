(function (global) {
  const fallbackImage = "img/og-image.png";

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function normalizeText(value) {
    if (typeof value === "string") {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }

    return "";
  }

  function getRenderableTextList(items) {
    return asArray(items)
      .map(normalizeText)
      .filter(Boolean);
  }

  function getRenderableSystems(items) {
    return asArray(items)
      .map((system) => {
        const title = normalizeText(system && system.title);
        const systemItems = getRenderableTextList(system && system.items);

        if (systemItems.length === 0) {
          return null;
        }

        return {
          title: title || "System",
          items: systemItems,
        };
      })
      .filter(Boolean);
  }

  function normalizePhotoSwipeSize(value) {
    const match = /^(\d+)\s*x\s*(\d+)$/i.exec(normalizeText(value));

    if (!match) {
      return "";
    }

    const width = Number(match[1]);
    const height = Number(match[2]);

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      return "";
    }

    return width + "x" + height;
  }

  function getPhotoSwipeDimensions(value) {
    const size = normalizePhotoSwipeSize(value);

    if (!size) {
      return null;
    }

    const parts = size.split("x");
    const width = Number(parts[0]);
    const height = Number(parts[1]);

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      return null;
    }

    return { width, height };
  }

  function getGalleryImageOrientation(width, height) {
    const safeWidth = Number(width);
    const safeHeight = Number(height);

    if (!Number.isFinite(safeWidth) || !Number.isFinite(safeHeight) || safeWidth <= 0 || safeHeight <= 0) {
      return "";
    }

    if (safeWidth === safeHeight) {
      return "square";
    }

    return safeWidth > safeHeight ? "landscape" : "portrait";
  }

  function normalizeGalleryLayout(value) {
    const layout = normalizeText(value).toLowerCase();

    if (["portrait", "landscape", "square", "wide"].includes(layout)) {
      return layout;
    }

    return "";
  }

  function getGalleryLayoutVariant(layoutHint, width, height) {
    const normalizedLayout = normalizeGalleryLayout(layoutHint);

    if (normalizedLayout) {
      return normalizedLayout;
    }

    const safeWidth = Number(width);
    const safeHeight = Number(height);

    if (!Number.isFinite(safeWidth) || !Number.isFinite(safeHeight) || safeWidth <= 0 || safeHeight <= 0) {
      return "";
    }

    const ratio = safeWidth / safeHeight;

    if (ratio >= 2.1) {
      return "wide";
    }

    if (ratio >= 1.12) {
      return "landscape";
    }

    if (ratio <= 0.8) {
      return "portrait";
    }

    return "square";
  }

  function getRenderableGallery(items) {
    return asArray(items)
      .map((item) => {
        const image = normalizeText(item && item.image);
        const fullImage = normalizeText(item && item.fullImage) || image;
        const size = normalizePhotoSwipeSize(item && item.size);
        const dimensions = getPhotoSwipeDimensions(size);

        if (!image && !fullImage) {
          return null;
        }

        return {
          image: image || fullImage,
          fullImage: fullImage || image,
          title: normalizeText(item && item.title),
          description: normalizeText(item && item.description),
          size,
          layout: getGalleryLayoutVariant(item && item.layout, dimensions && dimensions.width, dimensions && dimensions.height),
        };
      })
      .filter(Boolean);
  }

  function getRenderableGalleryGroups(items) {
    return asArray(items)
      .map((group, index) => {
        const galleryItems = getRenderableGallery(group && group.items);

        if (galleryItems.length === 0) {
          return null;
        }

        return {
          title: normalizeText(group && group.title) || "Gallery Group " + (index + 1),
          intro: normalizeText(group && group.intro),
          items: galleryItems,
        };
      })
      .filter(Boolean);
  }

  function getProjectGalleryModel(project) {
    const galleryGroups = getRenderableGalleryGroups(project && project.galleryGroups);

    if (galleryGroups.length >= 2) {
      return {
        mode: "grouped",
        groups: galleryGroups,
        items: [],
      };
    }

    if (galleryGroups.length === 1) {
      return {
        mode: "flat",
        groups: [],
        items: galleryGroups[0].items,
      };
    }

    const galleryItems = getRenderableGallery(project && project.gallery);

    if (galleryItems.length > 0) {
      return {
        mode: "flat",
        groups: [],
        items: galleryItems,
      };
    }

    return {
      mode: "empty",
      groups: [],
      items: [],
    };
  }

  function getRenderableLinks(items) {
    return asArray(items)
      .map((link) => {
        const url = normalizeText(link && link.url);

        if (!url) {
          return null;
        }

        return {
          label: normalizeText(link && link.label) || "Open link",
          url,
          kind: normalizeText(link && link.kind),
        };
      })
      .filter(Boolean);
  }

  function getLegacySlugs(project) {
    return asArray(project && project.legacySlugs)
      .map(normalizeText)
      .filter(Boolean);
  }

  function findProjectBySlug(projects, requestedSlug) {
    const projectList = asArray(projects);
    const normalizedSlug = normalizeText(requestedSlug);

    if (projectList.length === 0) {
      return null;
    }

    if (!normalizedSlug) {
      return projectList[0];
    }

    return (
      projectList.find((entry) => normalizeText(entry && entry.slug) === normalizedSlug)
      || projectList.find((entry) => getLegacySlugs(entry).includes(normalizedSlug))
      || projectList[0]
    );
  }

  function hasRenderableLinks(items) {
    return getRenderableLinks(items).length > 0;
  }

  function getProjectSectionVisibility(project) {
    return {
      overview: Boolean(normalizeText(project && project.problem)),
      video: Boolean(normalizeText(project && project.video)),
      contributions: getRenderableTextList(project && project.contributions).length > 0,
      systems: getRenderableSystems(project && project.systems).length > 0,
      results: getRenderableTextList(project && project.results).length > 0,
      gallery: getProjectGalleryModel(project).mode !== "empty",
    };
  }

  const projectPageApi = {
    findProjectBySlug,
    getProjectGalleryModel,
    getProjectSectionVisibility,
    getGalleryImageOrientation,
    getGalleryLayoutVariant,
    getRenderableGallery,
    getRenderableLinks,
    getRenderableSystems,
    getRenderableTextList,
    hasRenderableLinks,
    normalizeGalleryLayout,
    normalizePhotoSwipeSize,
    normalizeText,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = projectPageApi;
  }

  global.ProjectPageUtils = projectPageApi;

  if (typeof document === "undefined") {
    return;
  }

  function projectUrl(slug) {
    return "project.html?slug=" + encodeURIComponent(slug);
  }

  function prefersReducedMotion() {
    return typeof global.matchMedia === "function"
      && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function isElementVisibleForMotion(element) {
    return Boolean(element && !element.hidden && !element.closest("[hidden]"));
  }

  function setMotionReady(elements, isReady) {
    elements.filter(Boolean).forEach((element) => {
      element.classList.toggle("is-motion-ready", Boolean(isReady));
    });
  }

  function initProjectScrollStorytelling() {
    if (prefersReducedMotion()) {
      return;
    }

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      return;
    }

    if (!gsap.utils || typeof gsap.fromTo !== "function" || typeof gsap.to !== "function") {
      return;
    }

    if (typeof gsap.registerPlugin === "function") {
      gsap.registerPlugin(ScrollTrigger);
    }

    const visibleSections = gsap.utils.toArray(".project-section").filter(isElementVisibleForMotion);
    const sectionShells = visibleSections
      .map((section) => section.querySelector(".project-section__shell"))
      .filter(isElementVisibleForMotion);
    const detailItems = gsap.utils
      .toArray(".project-system-card, .project-gallery-item, .project-related-card")
      .filter(isElementVisibleForMotion);
    const heroContentItems = gsap.utils.toArray(".project-hero__content > *").filter(isElementVisibleForMotion);
    const heroFactItems = gsap.utils.toArray(".project-fact").filter(isElementVisibleForMotion);

    if (typeof ScrollTrigger.batch === "function" && sectionShells.length > 0) {
      ScrollTrigger.batch(sectionShells, {
        start: "top 84%",
        once: true,
        onEnter: (batch) => {
          setMotionReady(batch, true);
          gsap.fromTo(
            batch,
            { y: 36, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.64,
              stagger: 0.08,
              ease: "power2.out",
              overwrite: true,
              clearProps: "transform,opacity,visibility",
              onComplete: () => setMotionReady(batch, false),
            }
          );
        },
      });
    }

    if (typeof ScrollTrigger.batch === "function" && detailItems.length > 0) {
      ScrollTrigger.batch(detailItems, {
        start: "top 88%",
        once: true,
        onEnter: (batch) => {
          setMotionReady(batch, true);
          gsap.fromTo(
            batch,
            { y: 24, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.42,
              stagger: 0.06,
              ease: "power2.out",
              overwrite: true,
              clearProps: "transform,opacity,visibility",
              onComplete: () => setMotionReady(batch, false),
            }
          );
        },
      });
    }

    if (heroContentItems.length > 0) {
      setMotionReady(heroContentItems, true);
      gsap.fromTo(
        heroContentItems,
        { y: 22, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.64,
          stagger: 0.07,
          ease: "power3.out",
          overwrite: true,
          clearProps: "transform,opacity,visibility",
          onComplete: () => setMotionReady(heroContentItems, false),
          scrollTrigger: {
            trigger: ".project-page__hero",
            start: "top 72%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    if (heroFactItems.length > 0) {
      setMotionReady(heroFactItems, true);
      gsap.fromTo(
        heroFactItems,
        { y: 14, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.42,
          stagger: 0.07,
          ease: "power2.out",
          overwrite: true,
          clearProps: "transform,opacity,visibility",
          onComplete: () => setMotionReady(heroFactItems, false),
          scrollTrigger: {
            trigger: ".project-snapshot",
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    const heroImg = document.getElementById("project-hero-image");
    if (heroImg) {
      heroImg.style.willChange = "transform";
      gsap.to(heroImg, {
        yPercent: 5,
        scale: 1.018,
        ease: "none",
        scrollTrigger: {
          trigger: ".project-page__hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    if (typeof ScrollTrigger.refresh === "function") {
      ScrollTrigger.refresh();
    }
  }

  function initProjectScrollProgress() {
    let progressBar = document.querySelector(".project-scroll-progress");
    if (!progressBar) {
      progressBar = document.createElement("div");
      progressBar.className = "project-scroll-progress";
      document.body.appendChild(progressBar);
    }

    let frame = null;

    function updateProgress() {
      frame = null;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;
      progressBar.style.transform = "scaleX(" + progress.toFixed(4) + ")";
    }

    function requestUpdate() {
      if (frame !== null) {
        return;
      }

      const requestFrame = global.requestAnimationFrame || function (callback) {
        return global.setTimeout(callback, 16);
      };
      frame = requestFrame(updateProgress);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    updateProgress();
  }

  function setTextContent(id, value, fallbackText) {
    const element = document.getElementById(id);

    if (!element) {
      return;
    }

    element.textContent = normalizeText(value) || normalizeText(fallbackText);
  }

  function setOptionalTextContent(id, value) {
    const element = document.getElementById(id);

    if (!element) {
      return;
    }

    const text = normalizeText(value);
    element.textContent = text;
    element.hidden = !text;
    element.style.display = text ? "" : "none";
  }

  function buildList(root, items) {
    if (!root) {
      return;
    }

    root.innerHTML = "";

    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      root.appendChild(li);
    });
  }

  function setSectionVisibility(id, isVisible) {
    const element = document.getElementById(id);

    if (!element) {
      return;
    }

    element.hidden = !isVisible;
    element.style.display = isVisible ? "" : "none";
  }

  function setSectionVisibilityByChild(id, isVisible) {
    const child = document.getElementById(id);

    if (!child) {
      return;
    }

    const section = child.closest(".project-section");

    if (section) {
      section.hidden = !isVisible;
      section.style.display = isVisible ? "" : "none";
    }
  }

  function setNavVisibility(sectionId, isVisible) {
    const selector = 'a[href="#' + sectionId + '"]';

    document.querySelectorAll(selector).forEach((link) => {
      link.hidden = !isVisible;
      link.style.display = isVisible ? "" : "none";

      const item = link.closest("li");
      if (item) {
        item.hidden = !isVisible;
        item.style.display = isVisible ? "" : "none";
      }
    });
  }

  function syncSectionNavContainerVisibility() {
    const sectionNav = document.querySelector(".project-section-nav");

    if (!sectionNav) {
      return;
    }

    const visibleLinks = Array.from(sectionNav.querySelectorAll(".project-section-nav__link")).filter(
      (link) => !link.hidden
    );

    sectionNav.hidden = visibleLinks.length === 0;
    sectionNav.style.display = visibleLinks.length === 0 ? "none" : "";
  }

  function createGalleryFigure(item, projectTitle) {
    const figure = document.createElement("figure");
    figure.className = "project-gallery-item gallery__item";
    figure.setAttribute("itemprop", "associatedMedia");
    figure.setAttribute("itemscope", "");
    figure.setAttribute("itemtype", "http://schema.org/ImageObject");

    if (item.layout) {
      figure.setAttribute("data-layout", item.layout);
    }

    const link = document.createElement("a");
    link.className = "gallery__link";
    link.href = item.fullImage || item.image || fallbackImage;
    link.setAttribute("itemprop", "contentUrl");
    link.setAttribute("data-size", item.size || "1400x1000");

    const image = document.createElement("img");
    image.className = "gallery__image";
    image.src = item.image || item.fullImage || fallbackImage;
    image.alt = item.title || (normalizeText(projectTitle) || "Project") + " gallery image";
    image.loading = "lazy";
    image.decoding = "async";
    image.setAttribute("itemprop", "thumbnail");

    const syncGalleryMediaState = function () {
      const orientation = getGalleryImageOrientation(image.naturalWidth, image.naturalHeight);
      const naturalSize = normalizePhotoSwipeSize(image.naturalWidth + "x" + image.naturalHeight);
      const naturalLayout = getGalleryLayoutVariant(item.layout, image.naturalWidth, image.naturalHeight);

      if (orientation) {
        figure.setAttribute("data-orientation", orientation);
      } else {
        figure.removeAttribute("data-orientation");
      }

      if (naturalLayout) {
        figure.setAttribute("data-layout", naturalLayout);
      } else {
        figure.removeAttribute("data-layout");
      }

      if (naturalSize) {
        link.setAttribute("data-size", naturalSize);
      }
    };

    image.addEventListener("load", syncGalleryMediaState);
    image.onerror = function () {
      image.onerror = null;
      image.src = fallbackImage;
    };

    if (image.complete) {
      syncGalleryMediaState();
    }

    link.appendChild(image);

    const caption = document.createElement("figcaption");
    caption.className = "gallery__descr";
    caption.setAttribute("itemprop", "caption description");

    const heading = document.createElement("h5");
    heading.textContent = item.title || "Gallery Image";
    caption.appendChild(heading);

    const description = document.createElement("p");
    description.className = "small";
    description.textContent = item.description || "Visual reference from the project.";
    caption.appendChild(description);

    figure.appendChild(link);
    figure.appendChild(caption);

    return figure;
  }

  function createGalleryGrid(items, projectTitle) {
    const grid = document.createElement("div");
    grid.className = "project-gallery-grid my-gallery";
    grid.setAttribute("itemscope", "");
    grid.setAttribute("itemtype", "http://schema.org/ImageGallery");

    items.forEach((item) => {
      grid.appendChild(createGalleryFigure(item, projectTitle));
    });

    return grid;
  }

  function renderGallery(root, projectTitle, galleryModel) {
    if (!root) {
      return;
    }

    root.innerHTML = "";
    root.setAttribute("data-gallery-mode", galleryModel.mode);

    if (galleryModel.mode === "grouped") {
      galleryModel.groups.forEach((group) => {
        const article = document.createElement("article");
        article.className = "project-gallery-group";

        const header = document.createElement("div");
        header.className = "project-gallery-group__header";

        const title = document.createElement("h3");
        title.className = "project-gallery-group__title";
        title.textContent = group.title;
        header.appendChild(title);

        if (group.intro) {
          const intro = document.createElement("p");
          intro.className = "project-gallery-group__intro";
          intro.textContent = group.intro;
          header.appendChild(intro);
        }

        article.appendChild(header);
        article.appendChild(createGalleryGrid(group.items, projectTitle));
        root.appendChild(article);
      });
      return;
    }

    if (galleryModel.mode === "flat") {
      root.appendChild(createGalleryGrid(galleryModel.items, projectTitle));
    }
  }

  (async function () {
    const pageRoot = document.querySelector("[data-project-page]");

    if (!pageRoot) {
      return;
    }

    try {
      const response = await fetch("projects.json?v=20260504-gallery-thumbs");

      if (!response.ok) {
        throw new Error("Unable to fetch project data: " + response.status);
      }

      const payload = await response.json();
      const projects = asArray(payload.projects);
      const params = new URLSearchParams(window.location.search);
      const requestedSlug = params.get("slug");
      const project = findProjectBySlug(projects, requestedSlug);

      if (!project) {
        pageRoot.innerHTML = '<p class="portfolio-empty">No project data found.</p>';
        return;
      }

      if (requestedSlug && requestedSlug !== project.slug && window.history && window.history.replaceState) {
        window.history.replaceState({}, "", projectUrl(project.slug));
      }

      const roleSummary = getRenderableTextList(project.role).join(" / ") || normalizeText(project.role) || "TBD";
      const toolsSummary = getRenderableTextList(project.tools).join(", ") || normalizeText(project.tools) || "TBD";
      const contributions = getRenderableTextList(project.contributions);
      const systems = getRenderableSystems(project.systems);
      const results = getRenderableTextList(project.results);
      const links = getRenderableLinks(project.links);
      const galleryModel = getProjectGalleryModel(project);
      const heroImage = normalizeText(project.heroImage) || fallbackImage;
      const visibility = getProjectSectionVisibility(project);

      const titleText = (normalizeText(project.title) || "Untitled Project") + " | Tran Hoang Kiet Portfolio";
      const descriptionMeta = document.querySelector('meta[name="description"]');
      const titleMeta = document.querySelector('meta[property="og:title"]');
      const descriptionOgMeta = document.querySelector('meta[property="og:description"]');
      const imageMeta = document.querySelector('meta[property="og:image"]');
      const urlMeta = document.querySelector('meta[property="og:url"]');

      document.title = titleText;

      if (descriptionMeta) {
        descriptionMeta.setAttribute("content", normalizeText(project.summary) || normalizeText(project.tagline));
      }

      if (titleMeta) {
        titleMeta.setAttribute("content", titleText);
      }

      if (descriptionOgMeta) {
        descriptionOgMeta.setAttribute("content", normalizeText(project.summary) || normalizeText(project.tagline));
      }

      if (imageMeta) {
        imageMeta.setAttribute("content", new URL(heroImage, window.location.href).href);
      }

      if (urlMeta) {
        urlMeta.setAttribute("content", new URL(projectUrl(project.slug), window.location.href).href);
      }

      document.getElementById("project-back-link").setAttribute("href", "index.html#portfolio");
      setTextContent("project-type", project.type, "Project");
      setTextContent("project-year", project.year, "Year");
      setTextContent("project-status", project.status, "Status");
      setTextContent("project-title", project.title, "Untitled Project");
      setOptionalTextContent("project-tagline", project.tagline);
      setOptionalTextContent("project-summary", project.summary);
      setTextContent("project-platform", project.platform, "TBD");
      setTextContent("project-role", roleSummary, "TBD");
      setTextContent("project-team", project.teamSize, "TBD");
      setTextContent("project-tools", toolsSummary, "TBD");
      setTextContent("project-problem", visibility.overview ? project.problem : "", "");

      setSectionVisibility("project-overview", visibility.overview);
      setSectionVisibility("project-video-wrap", visibility.video);
      setSectionVisibility("project-contributions-anchor", visibility.contributions);
      setSectionVisibility("project-systems-anchor", visibility.systems);
      setSectionVisibilityByChild("project-results", visibility.results);
      setSectionVisibility("project-gallery", visibility.gallery);

      setNavVisibility("project-overview", visibility.overview);
      setNavVisibility("project-contributions-anchor", visibility.contributions);
      setNavVisibility("project-systems-anchor", visibility.systems);
      setNavVisibility("project-gallery", visibility.gallery);
      syncSectionNavContainerVisibility();

      const heroImageElement = document.getElementById("project-hero-image");
      if (heroImageElement) {
        heroImageElement.src = heroImage;
        heroImageElement.alt = (normalizeText(project.title) || "Project") + " hero image";
        heroImageElement.loading = "eager";
        heroImageElement.decoding = "async";
        heroImageElement.onerror = function () {
          heroImageElement.onerror = null;
          heroImageElement.src = fallbackImage;
        };
      }

      const videoFrame = document.getElementById("project-video");
      if (videoFrame) {
        if (visibility.video) {
          videoFrame.src = normalizeText(project.video);
        } else {
          videoFrame.removeAttribute("src");
        }
      }

      buildList(document.getElementById("project-contributions"), contributions);
      buildList(document.getElementById("project-results"), results);

      const systemsRoot = document.getElementById("project-systems");
      if (systemsRoot) {
        systemsRoot.innerHTML = "";

        systems.forEach((system) => {
          const article = document.createElement("article");
          article.className = "project-system-card";

          const title = document.createElement("h4");
          title.textContent = system.title;
          article.appendChild(title);

          const list = document.createElement("ul");
          list.className = "project-list";

          system.items.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item;
            list.appendChild(li);
          });

          article.appendChild(list);
          systemsRoot.appendChild(article);
        });
      }

      const actionsRoot = document.getElementById("project-actions");
      if (actionsRoot) {
        actionsRoot.innerHTML = "";
        actionsRoot.hidden = !hasRenderableLinks(project.links);
        actionsRoot.style.display = hasRenderableLinks(project.links) ? "" : "none";

        links.forEach((link) => {
          const anchor = document.createElement("a");
          anchor.className = "btn btn-default btn-hover btn-hover-accent";
          anchor.href = link.url;
          anchor.innerHTML = '<span class="btn-caption">' + link.label + '</span><i class="ph-bold ph-arrow-square-out"></i>';

          if (link.kind === "download") {
            anchor.setAttribute("download", "");
          } else {
            anchor.setAttribute("target", "_blank");
            anchor.setAttribute("rel", "noopener noreferrer");
          }

          actionsRoot.appendChild(anchor);
        });
      }

      renderGallery(document.getElementById("project-gallery-grid"), project.title, galleryModel);

      if (typeof global.initPhotoSwipeFromDOM === "function") {
        global.initPhotoSwipeFromDOM(".my-gallery", { refreshOnly: true });
      }

      const relatedRoot = document.getElementById("project-related-grid");
      if (relatedRoot) {
        relatedRoot.innerHTML = "";

        projects
          .filter((entry) => entry.slug !== project.slug)
          .slice(0, 3)
          .forEach((entry) => {
            const article = document.createElement("article");
            article.className = "project-related-card";
            article.innerHTML = `
          <a class="project-related-card__link" href="${projectUrl(entry.slug)}">
            <div class="project-related-card__media">
              <img class="project-related-card__image" src="${entry.thumbnail || fallbackImage}" alt="${entry.title} thumbnail" loading="lazy" decoding="async">
            </div>
            <div class="project-related-card__body">
              <div class="portfolio-meta-row">
                <span class="portfolio-pill">${entry.type || "Project"}</span>
                <span class="portfolio-pill">${entry.year || "TBD"}</span>
              </div>
              <h4 class="project-related-card__title">${entry.title || "Untitled Project"}</h4>
              <p class="project-related-card__summary">${entry.tagline || "Open this project to read the full case study."}</p>
              <span class="project-related-card__cta">
                <span>Open project</span>
                <i class="ph-bold ph-arrow-right"></i>
              </span>
            </div>
          </a>
        `;
            relatedRoot.appendChild(article);
          });
      }

      const navLinks = Array.from(document.querySelectorAll(".project-section-nav__link")).filter(
        (link) => !link.hidden
      );
      const observedSections = [];

      navLinks.forEach((link) => {
        const target = document.querySelector(link.getAttribute("href"));
        if (target && !target.hidden) {
          observedSections.push(target);
        }
      });

      if (navLinks.length > 0) {
        navLinks[0].classList.add("is-active");
      }

      if (observedSections.length > 0) {
        const sectionObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                navLinks.forEach((link) => {
                  link.classList.remove("is-active");
                });

                const activeLink = document.querySelector(
                  '.project-section-nav__link[href="#' + entry.target.id + '"]'
                );

                if (activeLink && !activeLink.hidden) {
                  activeLink.classList.add("is-active");
                }
              }
            });
          },
          { rootMargin: "-20% 0px -60% 0px" }
        );

        observedSections.forEach((section) => {
          sectionObserver.observe(section);
        });
      }

      initProjectScrollProgress();
      initProjectScrollStorytelling();
      pageRoot.setAttribute("data-project-rendered", "true");

      if (typeof global.dispatchEvent === "function" && typeof global.CustomEvent === "function") {
        global.dispatchEvent(new CustomEvent("portfolio:project-rendered", {
          detail: { slug: project.slug },
        }));
      }
    } catch (error) {
      console.error("Unable to load project page data.", error);
      pageRoot.innerHTML = `
      <section class="project-section">
        <div class="project-section__panel">
          <h1>Project details could not be loaded</h1>
          <p class="project-section__lead">Try returning to the portfolio explorer and opening the case study again.</p>
          <a class="btn btn-default btn-hover btn-hover-accent" href="index.html#portfolio">
            <span class="btn-caption">Back to portfolio</span>
            <i class="ph-bold ph-arrow-left"></i>
          </a>
        </div>
      </section>
    `;
    }
  })();
})(typeof globalThis !== "undefined" ? globalThis : this);
