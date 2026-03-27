(async function () {
  const pageRoot = document.querySelector("[data-project-page]");
  const fallbackImage = "img/og-image.png";

  if (!pageRoot) {
    return;
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function projectUrl(slug) {
    return "project.html?slug=" + encodeURIComponent(slug);
  }

  function setTextContent(id, value, fallbackText) {
    const element = document.getElementById(id);

    if (!element) {
      return;
    }

    element.textContent = value || fallbackText || "";
  }

  function buildList(root, items, emptyMessage) {
    root.innerHTML = "";

    if (items.length === 0) {
      const li = document.createElement("li");
      li.textContent = emptyMessage;
      root.appendChild(li);
      return;
    }

    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      root.appendChild(li);
    });
  }

  try {
    const response = await fetch("projects.json");

    if (!response.ok) {
      throw new Error("Unable to fetch project data: " + response.status);
    }

    const payload = await response.json();
    const projects = asArray(payload.projects);
    const params = new URLSearchParams(window.location.search);
    const requestedSlug = params.get("slug");
    const project = projects.find((entry) => entry.slug === requestedSlug) || projects[0];

    if (!project) {
      pageRoot.innerHTML = "<p class=\"portfolio-empty\">No project data found.</p>";
      return;
    }

    if (requestedSlug && requestedSlug !== project.slug && window.history && window.history.replaceState) {
      window.history.replaceState({}, "", projectUrl(project.slug));
    }

    const roleSummary = asArray(project.role).join(" / ") || project.role || "TBD";
    const toolsSummary = asArray(project.tools).join(", ") || project.tools || "TBD";
    const contributions = asArray(project.contributions);
    const systems = asArray(project.systems);
    const results = asArray(project.results);
    const links = asArray(project.links);
    const gallery = asArray(project.gallery);
    const heroImage = project.heroImage || fallbackImage;

    const titleText = project.title + " | Tran Hoang Kiet Portfolio";
    const descriptionMeta = document.querySelector("meta[name=\"description\"]");
    const titleMeta = document.querySelector("meta[property=\"og:title\"]");
    const descriptionOgMeta = document.querySelector("meta[property=\"og:description\"]");
    const imageMeta = document.querySelector("meta[property=\"og:image\"]");
    const urlMeta = document.querySelector("meta[property=\"og:url\"]");

    document.title = titleText;

    if (descriptionMeta) {
      descriptionMeta.setAttribute("content", project.summary || project.tagline || "");
    }

    if (titleMeta) {
      titleMeta.setAttribute("content", titleText);
    }

    if (descriptionOgMeta) {
      descriptionOgMeta.setAttribute("content", project.summary || project.tagline || "");
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
    setTextContent("project-tagline", project.tagline, "This case study is still being assembled.");
    setTextContent("project-summary", project.summary, "");
    setTextContent("project-platform", project.platform, "TBD");
    setTextContent("project-role", roleSummary, "TBD");
    setTextContent("project-team", project.teamSize, "TBD");
    setTextContent("project-tools", toolsSummary, "TBD");
    setTextContent("project-problem", project.problem, "Detailed framing for this project is still being added.");

    const heroImageElement = document.getElementById("project-hero-image");
    heroImageElement.src = heroImage;
    heroImageElement.alt = project.title + " hero image";
    heroImageElement.loading = "eager";
    heroImageElement.decoding = "async";
    heroImageElement.onerror = function () {
      heroImageElement.onerror = null;
      heroImageElement.src = fallbackImage;
    };

    const videoWrap = document.getElementById("project-video-wrap");
    const videoFrame = document.getElementById("project-video");

    if (project.video) {
      videoWrap.hidden = false;
      videoFrame.src = project.video;
    } else {
      videoWrap.hidden = true;
      videoFrame.removeAttribute("src");
    }

    buildList(
      document.getElementById("project-contributions"),
      contributions,
      "Contribution details are being consolidated for this project."
    );

    const systemsRoot = document.getElementById("project-systems");
    systemsRoot.innerHTML = "";

    if (systems.length === 0) {
      const emptyCard = document.createElement("article");
      emptyCard.className = "project-system-card";

      const title = document.createElement("h4");
      title.textContent = "Documentation in progress";
      emptyCard.appendChild(title);

      const list = document.createElement("ul");
      list.className = "project-list";
      const li = document.createElement("li");
      li.textContent = "This project is visible in the new portfolio flow while the deeper system breakdown is being rewritten.";
      list.appendChild(li);
      emptyCard.appendChild(list);
      systemsRoot.appendChild(emptyCard);
    } else {
      systems.forEach((system) => {
        const article = document.createElement("article");
        article.className = "project-system-card";

        const title = document.createElement("h4");
        title.textContent = system.title || "System";
        article.appendChild(title);

        const list = document.createElement("ul");
        list.className = "project-list";

        asArray(system.items).forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item;
          list.appendChild(li);
        });

        article.appendChild(list);
        systemsRoot.appendChild(article);
      });
    }

    buildList(
      document.getElementById("project-results"),
      results,
      "Outcome notes are being documented for this archive entry."
    );

    const actionsRoot = document.getElementById("project-actions");
    actionsRoot.innerHTML = "";

    if (links.length === 0) {
      const fallback = document.createElement("a");
      fallback.className = "btn btn-default btn-hover btn-hover-outline";
      fallback.href = "index.html#contact";
      fallback.innerHTML = "<span class=\"btn-caption\">Contact Me</span><i class=\"ph-bold ph-chat-dots\"></i>";
      actionsRoot.appendChild(fallback);
    } else {
      links.forEach((link) => {
        const anchor = document.createElement("a");
        anchor.className = "btn btn-default btn-hover btn-hover-accent";
        anchor.href = link.url;
        anchor.innerHTML = "<span class=\"btn-caption\">" + (link.label || "Open link") + "</span><i class=\"ph-bold ph-arrow-square-out\"></i>";

        if (link.kind === "download") {
          anchor.setAttribute("download", "");
        } else {
          anchor.setAttribute("target", "_blank");
          anchor.setAttribute("rel", "noopener noreferrer");
        }

        actionsRoot.appendChild(anchor);
      });
    }

    const galleryRoot = document.getElementById("project-gallery-grid");
    galleryRoot.innerHTML = "";

    if (gallery.length === 0) {
      galleryRoot.innerHTML = "<p class=\"portfolio-empty\">Gallery assets are still being collected for this project.</p>";
    } else {
      gallery.forEach((item) => {
        const figure = document.createElement("figure");
        figure.className = "project-gallery-item gallery__item";
        figure.setAttribute("itemprop", "associatedMedia");
        figure.setAttribute("itemscope", "");
        figure.setAttribute("itemtype", "http://schema.org/ImageObject");

        const link = document.createElement("a");
        link.className = "gallery__link";
        link.href = item.fullImage || item.image || fallbackImage;
        link.setAttribute("itemprop", "contentUrl");
        link.setAttribute("data-size", item.size || "1400x1000");

        const image = document.createElement("img");
        image.className = "gallery__image";
        image.src = item.image || item.fullImage || fallbackImage;
        image.alt = item.title || project.title + " gallery image";
        image.loading = "lazy";
        image.decoding = "async";
        image.setAttribute("itemprop", "thumbnail");
        image.onerror = function () {
          image.onerror = null;
          image.src = fallbackImage;
        };
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
        galleryRoot.appendChild(figure);
      });
    }

    const relatedRoot = document.getElementById("project-related-grid");
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
  } catch (error) {
    console.error("Unable to load project page data.", error);
    pageRoot.innerHTML = `
      <section class="project-section">
        <div class="project-section__panel">
          <p class="project-section__eyebrow">Unavailable</p>
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
