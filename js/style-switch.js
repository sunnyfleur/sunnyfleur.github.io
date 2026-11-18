// The Persona theme is on by default: each page sets data-style="persona" on
// <html> and links css/persona.css itself. This script only handles opting
// out. Visit any page with ?style=default to see the earlier look (remembered
// across pages), or ?style=persona to switch back.
(function () {
  const storageKey = "portfolio.style";
  let style = "persona";

  try {
    const requested = new URLSearchParams(window.location.search).get("style");

    if (requested === "default") {
      localStorage.setItem(storageKey, "default");
    } else if (requested === "persona") {
      localStorage.removeItem(storageKey);
    }

    if (localStorage.getItem(storageKey) === "default") {
      style = "default";
    }
  } catch (error) {
    style = "persona";
  }

  // Every Persona rule is scoped to html[data-style="persona"], so dropping the
  // attribute turns the whole layer off.
  if (style === "default") {
    document.documentElement.removeAttribute("data-style");
  } else {
    document.documentElement.setAttribute("data-style", "persona");
  }
})();
