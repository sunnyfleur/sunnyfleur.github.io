(function () {
  const currentScript = document.currentScript;

  if (!currentScript) {
    return;
  }

  const slug = currentScript.getAttribute("data-project-slug");

  if (!slug) {
    return;
  }

  const target = "project.html?slug=" + encodeURIComponent(slug) + window.location.hash;
  window.location.replace(target);
})();
