(function () {
  const currentScript = document.currentScript;

  if (!currentScript) {
    return;
  }

  const slug = currentScript.getAttribute("data-project-slug");
  // Retired projects point at a page of their own instead of a case study.
  const redirectPage = currentScript.getAttribute("data-redirect-page");

  if (!slug && !redirectPage) {
    return;
  }

  const i18n = window.PortfolioI18n;
  const params = new URLSearchParams(window.location.search);
  const language = params.get("lang")
    || (i18n && typeof i18n.getLanguage === "function" ? i18n.getLanguage() : "");
  const targetParams = new URLSearchParams();

  if (!redirectPage) {
    targetParams.set("slug", slug);
  }

  if (/^(en|vi)$/i.test(language)) {
    targetParams.set("lang", language.toLowerCase());
  }

  const query = targetParams.toString();
  const page = redirectPage || "project.html";
  const hash = currentScript.getAttribute("data-redirect-hash") || window.location.hash;
  const target = page + (query ? "?" + query : "") + hash;
  window.location.replace(target);
})();
