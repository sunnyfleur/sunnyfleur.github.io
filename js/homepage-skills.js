(() => {
  const root = document.querySelector(".skills-section");
  const cards = root ? Array.from(root.querySelectorAll(".skills-card")) : [];
  const detail = root?.querySelector(".skills-section__detail");
  const detailIcon = detail?.querySelector("[data-skill-detail-icon] i");
  const detailLevel = detail?.querySelector("[data-skill-detail-level]");
  const detailTitle = detail?.querySelector("[data-skill-detail-title]");
  const detailText = detail?.querySelector("[data-skill-detail-text]");

  if (!root || !cards.length || !detail || !detailIcon || !detailLevel || !detailTitle || !detailText) {
    return;
  }

  function renderDetail(card) {
    const iconClass = (card.dataset.skillIcon || "").trim();

    detailLevel.textContent = card.dataset.skillLevel || "";
    detailTitle.textContent = card.dataset.skillTitle || "";
    detailText.textContent = card.dataset.skillDescription || "";
    detailIcon.className = iconClass || "ph-fill ph-star";
  }

  function setActive(card) {
    cards.forEach((item) => {
      const isActive = item === card;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    renderDetail(card);
  }

  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => setActive(card));
    card.addEventListener("focus", () => setActive(card));
    card.addEventListener("click", () => setActive(card));
  });

  const defaultCard = cards.find((card) => card.classList.contains("is-active")) || cards[0];
  setActive(defaultCard);
})();
