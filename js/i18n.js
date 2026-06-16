(function (global, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(global, true);
  } else {
    global.PortfolioI18n = factory(global, false);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (global, isModule) {
  const STORAGE_KEY = "portfolio.language";
  const DEFAULT_LANGUAGE = "en";
  const SUPPORTED_LANGUAGES = ["en", "vi"];
  const CACHE_VERSION = "20260615-i18n";
  let activeLanguage = DEFAULT_LANGUAGE;
  let dictionary = {};
  let readyPromise = Promise.resolve(dictionary);

  function normalizeLanguage(value) {
    const language = String(value || "").trim().toLowerCase();
    return SUPPORTED_LANGUAGES.includes(language) ? language : "";
  }

  function getUrlLanguage() {
    if (!global.location || typeof global.URLSearchParams !== "function") {
      return "";
    }

    return normalizeLanguage(new global.URLSearchParams(global.location.search).get("lang"));
  }

  function storeLanguage(language) {
    try {
      if (global.localStorage) {
        global.localStorage.setItem(STORAGE_KEY, language);
      }
    } catch (error) {}
  }

  function detectLanguage() {
    return getUrlLanguage() || DEFAULT_LANGUAGE;
  }

  function getLanguage() {
    return activeLanguage;
  }

  function getPathValue(source, key) {
    return String(key || "")
      .split(".")
      .filter(Boolean)
      .reduce((node, part) => (node && Object.prototype.hasOwnProperty.call(node, part) ? node[part] : undefined), source);
  }

  function interpolate(value, params) {
    return String(value == null ? "" : value).replace(/\{([a-zA-Z0-9_]+)\}/g, function (_, key) {
      return params && Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : "";
    });
  }

  function t(key, fallback, params) {
    const value = getPathValue(dictionary, key);
    const text = typeof value === "string" ? value : fallback || key;
    return interpolate(text, params);
  }

  function setElementText(element, key) {
    const fallback = element.getAttribute("data-i18n-fallback") || element.textContent;
    const value = t(key, fallback);
    element.textContent = value;
  }

  function setElementAttributes(element) {
    const descriptor = element.getAttribute("data-i18n-attr");

    if (!descriptor) {
      return;
    }

    descriptor.split(";").forEach((entry) => {
      const parts = entry.split(":");
      const attribute = parts[0] && parts[0].trim();
      const key = parts[1] && parts[1].trim();

      if (!attribute || !key) {
        return;
      }

      const fallback = element.getAttribute(attribute) || "";
      element.setAttribute(attribute, t(key, fallback));
    });
  }

  function setElementHtml(element, key) {
    const fallback = element.getAttribute("data-i18n-fallback") || element.innerHTML;
    const value = t(key, fallback);
    element.innerHTML = value.replace(/\n/g, "<br>");
  }

  function localizeUrl(url, language) {
    const targetLanguage = normalizeLanguage(language) || activeLanguage || DEFAULT_LANGUAGE;
    const original = String(url || "");

    if (!original || original.charAt(0) === "#" || /^(mailto|tel|javascript):/i.test(original)) {
      return original;
    }

    if (/^[a-z][a-z0-9+.-]*:/i.test(original) && !/^https?:\/\/portfolio\.local/i.test(original)) {
      return original;
    }

    const base = "https://portfolio.local/";
    let parsed;

    try {
      parsed = new URL(original, base);
    } catch (error) {
      return original;
    }

    if (parsed.origin !== "https://portfolio.local") {
      return original;
    }

    const fileName = parsed.pathname.split("/").pop() || "";
    const shouldLocalize = fileName.endsWith(".html") || parsed.pathname === "/";

    if (!shouldLocalize) {
      return original;
    }

    parsed.searchParams.set("lang", targetLanguage);

    const pathName = parsed.pathname.replace(/^\//, "");
    return pathName + parsed.search + parsed.hash;
  }

  function localizeDocumentLinks(root) {
    if (!root || !root.querySelectorAll) {
      return;
    }

    root.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href");
      const localized = localizeUrl(href, activeLanguage);

      if (localized !== href) {
        link.setAttribute("href", localized);
      }
    });
  }

  function updateLanguageControls(root) {
    if (!root || !root.querySelectorAll) {
      return;
    }

    root.querySelectorAll("[data-language-toggle]").forEach((toggle) => {
      toggle.setAttribute("aria-label", t("controls.languageLabel", "Language"));
    });

    root.querySelectorAll("[data-language-option]").forEach((control) => {
      const language = normalizeLanguage(control.getAttribute("data-language-option"));
      const isActive = language === activeLanguage;
      control.classList.toggle("is-active", isActive);
      control.setAttribute("aria-pressed", isActive ? "true" : "false");
      control.setAttribute("lang", language || DEFAULT_LANGUAGE);
    });
  }

  function apply(root) {
    const target = root || (global.document && global.document);

    if (!target || !target.querySelectorAll) {
      return;
    }

    if (target.documentElement) {
      target.documentElement.lang = activeLanguage;
    }

    target.querySelectorAll("[data-i18n-html]").forEach((element) => {
      setElementHtml(element, element.getAttribute("data-i18n-html"));
    });

    target.querySelectorAll("[data-i18n]").forEach((element) => {
      setElementText(element, element.getAttribute("data-i18n"));
    });

    target.querySelectorAll("[data-i18n-attr]").forEach(setElementAttributes);
    updateLanguageControls(target);
    localizeDocumentLinks(target);
  }

  function setLanguage(language) {
    const normalized = normalizeLanguage(language) || DEFAULT_LANGUAGE;
    activeLanguage = normalized;
    storeLanguage(normalized);

    if (global.document && global.document.documentElement) {
      global.document.documentElement.lang = normalized;
    }
  }

  function mergeIndexedObjects(baseItems, overlayItems, mergeItem) {
    if (!Array.isArray(baseItems)) {
      return baseItems;
    }

    if (!Array.isArray(overlayItems)) {
      return baseItems;
    }

    return baseItems.map((item, index) => mergeItem(item, overlayItems[index]));
  }

  function mergeGalleryItem(baseItem, overlayItem) {
    if (!overlayItem || typeof overlayItem !== "object") {
      return baseItem;
    }

    return Object.assign({}, baseItem, {
      title: overlayItem.title || baseItem.title,
      description: overlayItem.description || baseItem.description,
      imageAlt: overlayItem.imageAlt || baseItem.imageAlt,
    });
  }

  function mergeProject(project, overlay) {
    if (!overlay || typeof overlay !== "object") {
      return project;
    }

    const merged = Object.assign({}, project);
    [
      "title",
      "tagline",
      "summary",
      "cardSummary",
      "type",
      "status",
      "platform",
      "teamSize",
      "problem",
    ].forEach((field) => {
      if (typeof overlay[field] === "string") {
        merged[field] = overlay[field];
      }
    });

    ["role", "contributions", "results"].forEach((field) => {
      if (Array.isArray(overlay[field])) {
        merged[field] = overlay[field];
      }
    });

    if (overlay.homepageMeta && typeof overlay.homepageMeta === "object") {
      merged.homepageMeta = Object.assign({}, project.homepageMeta, overlay.homepageMeta);
    }

    merged.systems = mergeIndexedObjects(project.systems, overlay.systems, function (system, localizedSystem) {
      if (!localizedSystem || typeof localizedSystem !== "object") {
        return system;
      }

      return Object.assign({}, system, {
        title: localizedSystem.title || system.title,
        items: Array.isArray(localizedSystem.items) ? localizedSystem.items : system.items,
      });
    });

    merged.gallery = mergeIndexedObjects(project.gallery, overlay.gallery, mergeGalleryItem);

    merged.galleryGroups = mergeIndexedObjects(project.galleryGroups, overlay.galleryGroups, function (group, localizedGroup) {
      if (!localizedGroup || typeof localizedGroup !== "object") {
        return group;
      }

      return Object.assign({}, group, {
        title: localizedGroup.title || group.title,
        intro: localizedGroup.intro || group.intro,
        items: mergeIndexedObjects(group.items, localizedGroup.items, mergeGalleryItem),
      });
    });

    merged.links = mergeIndexedObjects(project.links, overlay.links, function (link, localizedLink) {
      if (!localizedLink || typeof localizedLink !== "object") {
        return link;
      }

      return Object.assign({}, link, {
        label: localizedLink.label || link.label,
      });
    });

    return merged;
  }

  function mergeProjectPayload(basePayload, overlayPayload) {
    const overlays = overlayPayload && overlayPayload.projects ? overlayPayload.projects : {};
    const projects = Array.isArray(basePayload && basePayload.projects) ? basePayload.projects : [];

    return Object.assign({}, basePayload, {
      projects: projects.map((project) => mergeProject(project, overlays[project.slug])),
    });
  }

  function mergeGamingJourneyData(baseData, overlayData) {
    const chapterOverlays = overlayData && overlayData.chapters ? overlayData.chapters : {};
    const gameOverlays = overlayData && overlayData.games ? overlayData.games : {};

    return Object.assign({}, baseData, {
      chapters: Array.isArray(baseData && baseData.chapters)
        ? baseData.chapters.map((chapter) => Object.assign({}, chapter, chapterOverlays[chapter.id] || {}))
        : [],
      games: Array.isArray(baseData && baseData.games)
        ? baseData.games.map((game) => Object.assign({}, game, gameOverlays[game.title] || {}))
        : [],
    });
  }

  function fetchJson(url) {
    if (typeof global.fetch !== "function") {
      return Promise.reject(new Error("fetch is not available"));
    }

    return global.fetch(url).then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load " + url + ": " + response.status);
      }

      return response.json();
    });
  }

  function versioned(path) {
    return path + (path.includes("?") ? "&" : "?") + "v=" + CACHE_VERSION;
  }

  function getLocalizedProjectPayload(basePayload) {
    if (activeLanguage !== "vi") {
      return Promise.resolve(basePayload);
    }

    return fetchJson(versioned("i18n/projects.vi.json"))
      .then((overlay) => mergeProjectPayload(basePayload, overlay))
      .catch(() => basePayload);
  }

  function getLocalizedGamingJourneyData(baseData) {
    if (activeLanguage !== "vi") {
      return Promise.resolve(baseData);
    }

    return fetchJson(versioned("i18n/gaming-journey.vi.json"))
      .then((overlay) => mergeGamingJourneyData(baseData, overlay))
      .catch(() => baseData);
  }

  function loadDictionary(language) {
    if (typeof global.fetch !== "function") {
      dictionary = {};
      return Promise.resolve(dictionary);
    }

    return fetchJson(versioned("i18n/site." + language + ".json"))
      .then((payload) => {
        dictionary = payload || {};
        return dictionary;
      })
      .catch(() => {
        dictionary = {};
        return dictionary;
      });
  }

  function initialize() {
    setLanguage(detectLanguage());
    readyPromise = loadDictionary(activeLanguage).then(() => {
      if (global.document) {
        apply(global.document);
      }

      return dictionary;
    });
    return readyPromise;
  }

  function whenReady() {
    return readyPromise;
  }

  if (!isModule && global.document) {
    global.document.addEventListener("click", function (event) {
      const control = event.target && event.target.closest && event.target.closest("[data-language-option]");

      if (!control) {
        return;
      }

      event.preventDefault();
      const nextLanguage = normalizeLanguage(control.getAttribute("data-language-option"));

      if (!nextLanguage || nextLanguage === activeLanguage) {
        return;
      }

      setLanguage(nextLanguage);
      const current = global.location.pathname.replace(/^\//, "") + global.location.search + global.location.hash;
      global.location.assign(localizeUrl(current || "index.html", nextLanguage));
    });

    initialize();
  }

  return {
    apply,
    getLanguage,
    getLocalizedGamingJourneyData,
    getLocalizedProjectPayload,
    localizeUrl,
    mergeGamingJourneyData,
    mergeProjectPayload,
    normalizeLanguage,
    setLanguage,
    t,
    whenReady,
  };
});
