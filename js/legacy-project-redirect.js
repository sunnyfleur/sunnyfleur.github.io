(function () {
  const currentScript = document.currentScript;

  if (!currentScript) {
    return;
  }

  const slug = currentScript.getAttribute("data-project-slug");

  if (!slug) {
    return;
  }

  const i18n = window.PortfolioI18n;
  const params = new URLSearchParams(window.location.search);
  const language = params.get("lang")
    || (i18n && typeof i18n.getLanguage === "function" ? i18n.getLanguage() : "");
  const targetParams = new URLSearchParams();
  targetParams.set("slug", slug);

  if (/^(en|vi)$/i.test(language)) {
    targetParams.set("lang", language.toLowerCase());
  }

  const target = "project.html?" + targetParams.toString() + window.location.hash;
  window.location.replace(target);
})();
