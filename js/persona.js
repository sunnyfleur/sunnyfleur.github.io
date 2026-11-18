// Persona theme extras: cut-out "ransom note" letters for hero titles, a
// controller glyph as hero art, and the themed portrait and logo. Loaded
// on every page; does nothing when the visitor opted out of the Persona style.
(function () {
  const styles = ["ink", "paper", "red", "plain", "ink", "red", "paper", "plain"];
  const tilts = [-6, 4, -2, 5, -4, 2, -5, 3, 0];

  // Turns the first line of a title (up to the first <br>) into cut-out
  // letters. With wordLimit, only that many leading words are cut out and the
  // rest of the line stays as plain text.
  function buildRansom(title, wordLimit) {
    if (!title || title.querySelector(".p-ransom-line")) {
      return;
    }

    const firstLine = [];
    for (const node of Array.from(title.childNodes)) {
      if (node.nodeName === "BR") {
        break;
      }
      firstLine.push(node);
    }

    const words = firstLine.map((node) => node.textContent).join("").trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      return;
    }

    const cutWords = wordLimit ? words.slice(0, wordLimit) : words;
    const restText = wordLimit ? words.slice(wordLimit).join(" ") : "";

    const wrapper = document.createElement("span");
    wrapper.className = "p-ransom-line";

    const spoken = document.createElement("span");
    spoken.className = "p-sr";
    spoken.textContent = cutWords.join(" ");
    wrapper.appendChild(spoken);

    let index = 0;
    for (const word of cutWords) {
      const wordSpan = document.createElement("span");
      wordSpan.className = "p-ransom";
      wordSpan.setAttribute("aria-hidden", "true");

      for (const char of Array.from(word)) {
        const charSpan = document.createElement("span");
        charSpan.className = "p-ransom__char p-ransom__char--" + styles[index % styles.length];
        charSpan.style.setProperty("--p-tilt", tilts[index % tilts.length] + "deg");
        charSpan.textContent = char;
        wordSpan.appendChild(charSpan);
        index += 1;
      }

      if (wrapper.childNodes.length > 1) {
        const space = document.createElement("span");
        space.className = "p-ransom__space";
        space.setAttribute("aria-hidden", "true");
        wrapper.appendChild(space);
      }
      wrapper.appendChild(wordSpan);
    }

    firstLine.forEach((node) => node.remove());
    if (restText) {
      title.insertBefore(document.createTextNode(" " + restText), title.firstChild);
    }
    title.insertBefore(wrapper, title.firstChild);
  }

  // The language toggle rewrites titles; rebuild the letters afterwards.
  function keepRansom(selector, wordLimit) {
    const title = document.querySelector(selector);
    if (!title) {
      return;
    }

    const observer = new MutationObserver(() => {
      observer.disconnect();
      buildRansom(title, wordLimit);
      observer.observe(title, { childList: true });
    });

    buildRansom(title, wordLimit);
    observer.observe(title, { childList: true });
  }

  function addHeroIcon() {
    const art = document.querySelector(".intro-art");
    if (!art || art.querySelector(".p-hero-icon")) {
      return;
    }

    const icon = document.createElement("i");
    icon.className = "ph-fill ph-game-controller p-hero-icon";
    icon.setAttribute("aria-hidden", "true");
    art.appendChild(icon);
  }

  // Use the Persona-styled portrait when it has been added to the repo.
  function swapAvatar() {
    const avatar = document.querySelector(".avatar__image img");
    if (!avatar) {
      return;
    }

    const styled = new Image();
    styled.onload = () => {
      avatar.src = styled.src;
    };
    styled.src = "img/avatars/avatar-persona-event.jpg";
  }

  // The profile card shows the same cat mark as the favicon.
  function swapLogo() {
    const holder = document.querySelector(".avatar__logo .logo__image");
    if (!holder || holder.querySelector(".p-logo")) {
      return;
    }

    const logo = document.createElement("img");
    logo.className = "p-logo";
    logo.src = "img/favicon/android-icon-192.png";
    logo.alt = "";
    logo.width = 192;
    logo.height = 192;
    holder.appendChild(logo);
  }

  function init() {
    // js/style-switch.js removes the attribute when the visitor opted out.
    if (document.documentElement.getAttribute("data-style") !== "persona") {
      return;
    }

    addHeroIcon();
    swapAvatar();
    swapLogo();
    keepRansom(".headline__title");
    keepRansom(".journey-hero h1", 1);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
