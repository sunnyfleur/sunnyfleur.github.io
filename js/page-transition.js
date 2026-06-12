(function (global) {
  const transitionKey = "portfolio.projectTransition";
  const maxStateAge = 12000;
  let isTransitioning = false;
  let entryAnimationStarted = false;

  function prefersReducedMotion() {
    return typeof global.matchMedia === "function"
      && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function hasMotionSupport() {
    return !prefersReducedMotion()
      && typeof global.gsap !== "undefined"
      && typeof global.gsap.timeline === "function";
  }

  function getProjectDestination(link) {
    if (!link || typeof link.getAttribute !== "function") {
      return null;
    }

    const href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#") {
      return null;
    }

    try {
      return new URL(href, global.location.href);
    } catch (error) {
      return null;
    }
  }

  function isProjectLink(link) {
    const destination = getProjectDestination(link);

    if (!destination || destination.origin !== global.location.origin) {
      return false;
    }

    const path = destination.pathname.replace(/\/+$/, "");
    return path.endsWith("/project.html")
      && Boolean(destination.searchParams.get("slug"));
  }

  function getImageSource(image) {
    if (!image) {
      return "";
    }

    return image.currentSrc
      || image.getAttribute("src")
      || image.getAttribute("data-src")
      || "";
  }

  function getSafeRect(element) {
    if (!element || typeof element.getBoundingClientRect !== "function") {
      return null;
    }

    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return null;
    }

    return rect;
  }

  function getPortalTargetRect() {
    const viewportWidth = global.innerWidth || document.documentElement.clientWidth || 1024;
    const viewportHeight = global.innerHeight || document.documentElement.clientHeight || 768;
    const width = Math.max(240, Math.min(viewportWidth - 32, 1120, viewportWidth * 0.82));
    const height = Math.max(160, Math.min(width * 0.56, viewportHeight * 0.62));

    return {
      left: (viewportWidth - width) / 2,
      top: Math.max(20, viewportHeight * 0.12),
      width,
      height,
    };
  }

  function getProjectSource(link) {
    const card = link.closest("[data-portfolio-project]");
    const relatedCard = link.closest(".project-related-card");
    const spotlight = link.closest(".portfolio-spotlight");
    const root = card || relatedCard || spotlight || link;
    const image = root.querySelector(".portfolio-card__image, .project-related-card__image, .portfolio-spotlight__image, img");
    const titleElement = root.querySelector(".portfolio-card__title, .project-related-card__title, .portfolio-spotlight__title");
    const rect = getSafeRect(image) || getSafeRect(root) || {
      left: global.innerWidth / 2 - 120,
      top: global.innerHeight / 2 - 80,
      width: 240,
      height: 160,
    };

    return {
      root,
      image,
      rect,
      title: titleElement ? titleElement.textContent.trim() : link.textContent.trim(),
      imageSrc: getImageSource(image),
    };
  }

  function createTransitionOverlay(source, destination) {
    const targetRect = getPortalTargetRect();
    const overlay = document.createElement("div");
    const card = document.createElement("div");
    const image = document.createElement("img");
    const badge = document.createElement("span");
    const label = document.createElement("span");

    overlay.className = "page-transition-overlay";
    overlay.setAttribute("aria-hidden", "true");
    card.className = "page-transition-card";
    image.className = "page-transition-card__image";
    image.alt = "";
    image.decoding = "async";
    image.src = source.imageSrc || "img/og-image.png";
    badge.className = "page-transition-card__badge";
    badge.textContent = "Case study";
    label.className = "page-transition-card__label";
    label.textContent = source.title ? source.title : "Opening case study";

    card.style.left = targetRect.left + "px";
    card.style.top = targetRect.top + "px";
    card.style.width = targetRect.width + "px";
    card.style.height = targetRect.height + "px";

    card.appendChild(image);
    card.appendChild(badge);
    card.appendChild(label);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    document.body.classList.add("page-transition-active");

    return {
      overlay,
      card,
      image,
      badge,
      label,
      startRect: source.rect,
      targetRect,
      destination,
    };
  }

  function storeTransitionState(destination, source) {
    try {
      sessionStorage.setItem(transitionKey, JSON.stringify({
        href: destination.href,
        slug: destination.searchParams.get("slug"),
        title: source.title || "",
        imageSrc: source.imageSrc || "",
        createdAt: Date.now(),
      }));
    } catch (error) {
      return;
    }
  }

  function readTransitionState() {
    let state = null;

    try {
      state = JSON.parse(sessionStorage.getItem(transitionKey) || "null");
      sessionStorage.removeItem(transitionKey);
    } catch (error) {
      state = null;
    }

    if (!state || !state.createdAt || Date.now() - state.createdAt > maxStateAge) {
      return null;
    }

    return state;
  }

  function runProjectExitTransition(event, link) {
    if (isTransitioning) {
      event.preventDefault();
      return;
    }

    const destination = getProjectDestination(link);
    if (!destination) {
      return;
    }

    event.preventDefault();
    isTransitioning = true;

    const source = getProjectSource(link);
    storeTransitionState(destination, source);

    if (!hasMotionSupport()) {
      location.href = destination.href;
      return;
    }

    const transition = createTransitionOverlay(source, destination);
    const pageShell = document.querySelector("#content")
      || document.querySelector("[data-project-page]")
      || document.querySelector("main");
    const startScaleX = Math.max(0.08, transition.startRect.width / transition.targetRect.width);
    const startScaleY = Math.max(0.08, transition.startRect.height / transition.targetRect.height);
    const startX = transition.startRect.left - transition.targetRect.left;
    const startY = transition.startRect.top - transition.targetRect.top;
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: function () {
        location.href = destination.href;
      },
    });

    gsap.set(transition.card, {
      x: startX,
      y: startY,
      scaleX: startScaleX,
      scaleY: startScaleY,
      transformOrigin: "left top",
      autoAlpha: 1,
    });
    gsap.set(transition.image, { scale: 1.035, transformOrigin: "center center" });
    gsap.set(transition.badge, { autoAlpha: 0, y: -8 });
    gsap.set(transition.label, { autoAlpha: 0, y: 8 });

    tl.to(transition.overlay, { autoAlpha: 1, duration: 0.18 }, 0);

    if (pageShell) {
      tl.to(pageShell, { autoAlpha: 0.72, y: 10, scale: 0.995, duration: 0.42 }, 0);
    }

    tl.to(transition.card, {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      duration: 0.52,
      ease: "power3.inOut",
    }, 0.03)
      .to(transition.image, { scale: 1, duration: 0.52, ease: "power3.out" }, 0.03)
      .to(transition.badge, { autoAlpha: 1, y: 0, duration: 0.24 }, 0.22)
      .to(transition.label, { autoAlpha: 1, y: 0, duration: 0.26 }, 0.3);
  }

  function createEntryOverlay(state, heroImage) {
    const portalRect = getPortalTargetRect();
    const heroRect = getSafeRect(heroImage);

    if (!heroRect) {
      return null;
    }

    const overlay = document.createElement("div");
    const card = document.createElement("div");
    const image = document.createElement("img");

    overlay.className = "page-transition-overlay is-entry";
    overlay.setAttribute("aria-hidden", "true");
    card.className = "page-transition-card";
    image.className = "page-transition-card__image";
    image.alt = "";
    image.decoding = "async";
    image.src = state.imageSrc || heroImage.currentSrc || heroImage.src || "img/og-image.png";

    card.style.left = heroRect.left + "px";
    card.style.top = heroRect.top + "px";
    card.style.width = heroRect.width + "px";
    card.style.height = heroRect.height + "px";

    card.appendChild(image);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    return {
      overlay,
      card,
      image,
      startRect: portalRect,
      targetRect: heroRect,
    };
  }

  function runProjectEntryTransition() {
    if (entryAnimationStarted) {
      return;
    }

    const pageRoot = document.querySelector("[data-project-page]");
    if (!pageRoot || pageRoot.getAttribute("data-project-rendered") !== "true") {
      return;
    }

    const state = readTransitionState();
    if (!state) {
      return;
    }

    entryAnimationStarted = true;

    if (!hasMotionSupport()) {
      return;
    }

    const heroImage = document.getElementById("project-hero-image");
    const heroItems = Array.from(document.querySelectorAll(".project-hero__content > *")).filter(Boolean);
    const factItems = Array.from(document.querySelectorAll(".project-fact")).filter(Boolean);
    const entryOverlay = heroImage ? createEntryOverlay(state, heroImage) : null;
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: function () {
        if (entryOverlay && entryOverlay.overlay.parentNode) {
          entryOverlay.overlay.parentNode.removeChild(entryOverlay.overlay);
        }
        gsap.set([heroImage, heroItems, factItems].flat().filter(Boolean), {
          clearProps: "transform,opacity,visibility",
        });
      },
    });

    if (entryOverlay) {
      const startScaleX = Math.max(0.08, entryOverlay.startRect.width / entryOverlay.targetRect.width);
      const startScaleY = Math.max(0.08, entryOverlay.startRect.height / entryOverlay.targetRect.height);
      const startX = entryOverlay.startRect.left - entryOverlay.targetRect.left;
      const startY = entryOverlay.startRect.top - entryOverlay.targetRect.top;

      gsap.set(entryOverlay.overlay, { autoAlpha: 1 });
      gsap.set(entryOverlay.card, {
        x: startX,
        y: startY,
        scaleX: startScaleX,
        scaleY: startScaleY,
        transformOrigin: "left top",
      });
      gsap.set(heroImage, { autoAlpha: 0.01, scale: 1.035 });

      tl.to(entryOverlay.card, {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        duration: 0.54,
        ease: "power3.out",
      }, 0)
        .to(entryOverlay.image, { scale: 1.01, duration: 0.54, ease: "power3.out" }, 0)
        .to(entryOverlay.overlay, { autoAlpha: 0, duration: 0.2 }, 0.46)
        .to(heroImage, { autoAlpha: 1, scale: 1, duration: 0.46, ease: "power3.out" }, 0.12);
    }

    if (heroItems.length) {
      tl.fromTo(heroItems,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.07 },
        entryOverlay ? 0.14 : 0
      );
    }

    if (factItems.length) {
      tl.fromTo(factItems,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.06 },
        entryOverlay ? 0.34 : 0.16
      );
    }
  }

  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const target = event.target;
    if (!target || typeof target.closest !== "function") {
      return;
    }

    const link = target.closest("a");
    if (!isProjectLink(link) || link.target === "_blank") {
      return;
    }

    runProjectExitTransition(event, link);
  });

  global.addEventListener("portfolio:project-rendered", runProjectEntryTransition);
  global.setTimeout(runProjectEntryTransition, 0);
  global.addEventListener("pageshow", function () {
    document.body.classList.remove("page-transition-active");
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
