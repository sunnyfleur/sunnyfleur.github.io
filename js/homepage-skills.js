(() => {
  const root = document.querySelector(".skills-section");
  const cards = root ? Array.from(root.querySelectorAll(".skills-card")) : [];
  const detail = root?.querySelector(".skills-section__detail");
  const detailIcon = detail?.querySelector("[data-skill-detail-icon] i");
  const detailLevel = detail?.querySelector("[data-skill-detail-level]");
  const detailTitle = detail?.querySelector("[data-skill-detail-title]");
  const detailText = detail?.querySelector("[data-skill-detail-text]");
  const detailProof = detail?.querySelector("[data-skill-detail-proof]");

  if (!root || !cards.length || !detail || !detailIcon || !detailLevel || !detailTitle || !detailText || !detailProof) {
    return;
  }

  let activeCard = null;
  let detailTimeline = null;

  function prefersReducedMotion() {
    return typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function hasMotionSupport() {
    return !prefersReducedMotion()
      && typeof gsap !== "undefined"
      && typeof gsap.timeline === "function";
  }

  function applyDetailContent(card) {
    const iconClass = (card.dataset.skillIcon || "").trim();

    detailLevel.textContent = card.dataset.skillLevel || "";
    detailTitle.textContent = card.dataset.skillTitle || "";
    detailText.textContent = card.dataset.skillDescription || "";
    detailProof.textContent = card.dataset.skillProof || "";
    detailIcon.className = iconClass || "ph-fill ph-star";
  }

  function getDetailMotionItems() {
    return [
      detail.querySelector(".skills-detail__media"),
      detailLevel,
      detailTitle,
      detailText,
      detailProof,
    ].filter(Boolean);
  }

  function renderDetail(card, options = {}) {
    if (!options.animate || !hasMotionSupport()) {
      applyDetailContent(card);
      return;
    }

    if (detailTimeline) {
      detailTimeline.kill();
    }

    const detailItems = getDetailMotionItems();
    detail.classList.add("is-motion-settling");

    detailTimeline = gsap.timeline({
      defaults: { ease: "power2.out", overwrite: true },
      onComplete: () => {
        detail.classList.remove("is-motion-settling");
        gsap.set(detailItems, { clearProps: "transform,opacity,visibility" });
        detailTimeline = null;
      },
    });

    detailTimeline
      .to(detailItems, {
        autoAlpha: 0,
        y: 6,
        duration: 0.16,
        stagger: 0.02,
      })
      .call(() => applyDetailContent(card))
      .fromTo(
        detailItems,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.42,
          stagger: 0.05,
        }
      );
  }

  function setActive(card, options = {}) {
    if (!card) {
      return;
    }

    if (card === activeCard) {
      return;
    }

    activeCard = card;

    cards.forEach((item) => {
      const isActive = item === card;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    renderDetail(card, { animate: Boolean(options.animate) });

    if (options.animate && hasMotionSupport()) {
      gsap.fromTo(
        card,
        { scale: 0.985 },
        {
          scale: 1,
          duration: 0.22,
          ease: "power2.out",
          overwrite: true,
          clearProps: "transform",
        }
      );
    }
  }

  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => setActive(card, { animate: true }));
    card.addEventListener("focus", () => setActive(card, { animate: true }));
    card.addEventListener("click", () => setActive(card, { animate: true }));
  });

  const defaultCard = cards.find((card) => card.classList.contains("is-active")) || cards[0];
  setActive(defaultCard);
})();
