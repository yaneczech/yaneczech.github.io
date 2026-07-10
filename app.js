let projects = [];

const projectList = document.querySelector("#project-list");
const projectDetail = document.querySelector("#project-detail");

let activeSlug = normalizeSlug(window.location.hash.replace("#", ""));
let activeScreenIndex = 0;
let annotationsVisible = true;
let lightboxOpen = false;

function normalizeSlug(value) {
  return value ? value.replace(/^projekt-/, "").trim() : "";
}

function getActiveProject() {
  return projects.find((project) => project.slug === activeSlug) || projects[0];
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderProjectList() {
  const activeProject = getActiveProject();

  projectList.innerHTML = projects
    .map((project) => {
      const isActive = project.slug === activeProject.slug;

      return `
        <a class="project-link ${isActive ? "is-active" : ""}" href="#${project.slug}" aria-current="${isActive ? "page" : "false"}">
          <span class="project-link__number">${escapeHtml(project.orderLabel)}</span>
          <span class="project-link__body">
            <span class="project-link__title">${escapeHtml(project.title)}</span>
          </span>
        </a>
      `;
    })
    .join("");
}

function renderProjectDetail() {
  const project = getActiveProject();
  if (!project) return;

  const screen = project.screens?.[activeScreenIndex] || project.screens?.[0];
  const currentIndex = projects.findIndex((item) => item.slug === project.slug);
  const previous = projects[(currentIndex - 1 + projects.length) % projects.length];
  const next = projects[(currentIndex + 1) % projects.length];

  projectDetail.innerHTML = `
    <header class="case-header">
      <h2>${escapeHtml(project.title)}</h2>
      ${project.annotation ? `<p class="case-annotation">${escapeHtml(project.annotation)}</p>` : ""}
    </header>

    <section class="screen-section" aria-label="Anotovaný screenshot">
      ${renderScreenToolbar(project, screen)}
      ${renderScreenFrame(screen, "inline")}
    </section>

    <nav class="case-nav" aria-label="Přepínání projektů">
      <a href="#${previous.slug}" data-project-target="${previous.slug}">
        <span>Předchozí</span>
        ${escapeHtml(previous.title)}
      </a>
      <a href="#${next.slug}" data-project-target="${next.slug}">
        <span>Další</span>
        ${escapeHtml(next.title)}
      </a>
    </nav>

    ${renderLightbox(project, screen)}
  `;

  bindDetailInteractions();
}

function renderScreenToolbar(project, screen) {
  const screens = project.screens || [];

  return `
    <div class="screen-toolbar">
      <div>
        <h3>${escapeHtml(screen?.title || "Ukázka")}</h3>
      </div>

      <div class="screen-actions">
        ${screens.length > 1 ? renderScreenNav(screens) : ""}
        <button class="screen-open" type="button" data-open-lightbox>
          Zvětšit
        </button>
        ${renderAnnotationToggle()}
      </div>
    </div>
  `;
}

function renderScreenNav(screens) {
  return `
    <div class="screen-switcher" role="tablist" aria-label="Screenshoty projektu">
      ${screens
        .map(
          (item, index) => `
            <button
              class="screen-tab ${index === activeScreenIndex ? "is-active" : ""}"
              type="button"
              role="tab"
              aria-selected="${index === activeScreenIndex ? "true" : "false"}"
              data-screen-index="${index}"
            >
              <span>${String(index + 1).padStart(2, "0")}</span>
              ${escapeHtml(item.title || `Ukázka ${index + 1}`)}
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function renderAnnotationToggle() {
  return `
    <button
      class="annotation-toggle ${annotationsVisible ? "is-on" : ""}"
      type="button"
      data-toggle-annotations
      aria-pressed="${annotationsVisible ? "true" : "false"}"
    >
      <span class="annotation-toggle__label">Anotace</span>
      <span class="annotation-toggle__track" aria-hidden="true">
        <span class="annotation-toggle__thumb"></span>
      </span>
      <span class="annotation-toggle__state">${annotationsVisible ? "zapnuto" : "vypnuto"}</span>
    </button>
  `;
}

function renderScreenFrame(screen, idPrefix = "inline") {
  const hasImage = Boolean(screen?.image);
  const hotspots = screen?.hotspots || [];

  return `
    <figure class="screen-frame ${annotationsVisible ? "" : "hide-annotations"}">
      <div class="screen-canvas ${hasImage ? "has-image" : ""}">
        ${
          hasImage
            ? `<img src="${escapeHtml(screen.image)}" alt="${escapeHtml(screen.alt)}" loading="lazy" />`
            : renderPlaceholderScreen()
        }

        <div class="hotspot-layer" aria-label="Anotace screenshotu">
          ${renderHotspots(hotspots, idPrefix)}
        </div>
      </div>
    </figure>
  `;
}

function renderHotspots(hotspots, idPrefix) {
  return hotspots
    .map(
      (hotspot, index) => `
        <button
          class="hotspot"
          type="button"
          style="--x: ${Number(hotspot.x) || 50}%; --y: ${Number(hotspot.y) || 50}%"
          aria-expanded="false"
          aria-describedby="${idPrefix}-hotspot-${index}"
        >
          <span>${index + 1}</span>
        </button>
        <aside
          class="hotspot-tooltip"
          id="${idPrefix}-hotspot-${index}"
          style="--x: ${Number(hotspot.x) || 50}%; --y: ${Number(hotspot.y) || 50}%"
          role="note"
        >
          <strong>${escapeHtml(hotspot.title)}</strong>
          <span>${escapeHtml(hotspot.text)}</span>
        </aside>
      `
    )
    .join("");
}

function renderLightbox(project, screen) {
  return `
    <div
      class="lightbox ${lightboxOpen ? "is-open" : ""}"
      data-lightbox
      role="dialog"
      aria-modal="true"
      aria-hidden="${lightboxOpen ? "false" : "true"}"
      aria-label="Zvětšený screenshot"
    >
      <div class="lightbox-inner">
        <header class="lightbox-bar">
          <div class="lightbox-title">
            <span>${escapeHtml(project.title)}</span>
            <h2>${escapeHtml(screen?.title || "Screenshot")}</h2>
          </div>

          <div class="screen-actions">
            ${renderAnnotationToggle()}
            <button class="lightbox-close" type="button" data-close-lightbox>
              Zavřít
            </button>
          </div>
        </header>

        <div class="lightbox-figure">
          ${renderScreenFrame(screen, "lightbox")}
        </div>
      </div>
    </div>
  `;
}

function renderPlaceholderScreen() {
  return `
    <div class="screen-placeholder" aria-label="Místo pro screenshot">
      <div class="placeholder-bar"></div>
      <div class="placeholder-grid">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p>místo pro screenshot</p>
    </div>
  `;
}

function bindDetailInteractions() {
  document.querySelectorAll("[data-screen-index]").forEach((button) => {
    button.addEventListener("click", (event) => {
      activeScreenIndex = Number(event.currentTarget.dataset.screenIndex) || 0;
      renderProjectDetail();
    });
  });

  document.querySelectorAll("[data-toggle-annotations]").forEach((toggleButton) => {
    toggleButton.addEventListener("click", () => {
      annotationsVisible = !annotationsVisible;
      renderProjectDetail();
    });
  });

  document.querySelectorAll("[data-open-lightbox]").forEach((button) => {
    button.addEventListener("click", () => openLightbox());
  });

  document.querySelectorAll("[data-close-lightbox]").forEach((button) => {
    button.addEventListener("click", () => closeLightbox());
  });

  const lightbox = document.querySelector("[data-lightbox]");
  if (lightbox) {
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
  }

  document.querySelectorAll(".hotspot").forEach((button) => {
    button.addEventListener("click", () => {
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      closeHotspots();
      button.setAttribute("aria-expanded", String(!isExpanded));
      button.classList.toggle("is-open", !isExpanded);
    });
  });
}

function openLightbox() {
  lightboxOpen = true;
  document.body.classList.add("is-lightbox-open");
  renderProjectDetail();
  document.querySelector("[data-close-lightbox]")?.focus();
}

function closeLightbox() {
  lightboxOpen = false;
  document.body.classList.remove("is-lightbox-open");
  renderProjectDetail();
  document.querySelector("[data-open-lightbox]")?.focus();
}

function closeHotspots() {
  document.querySelectorAll(".hotspot").forEach((button) => {
    button.setAttribute("aria-expanded", "false");
    button.classList.remove("is-open");
  });
}

function setActiveProject(slug) {
  const exists = projects.some((project) => project.slug === slug);
  activeSlug = exists ? slug : projects[0]?.slug;
  activeScreenIndex = 0;
  lightboxOpen = false;
  document.body.classList.remove("is-lightbox-open");
  closeHotspots();
  render();
}

function render() {
  renderProjectList();
  renderProjectDetail();
}

async function loadProjects() {
  if (window.portfolioProjectsReady) {
    return window.portfolioProjectsReady;
  }

  if (window.loadPortfolioProjects) {
    return window.loadPortfolioProjects();
  }

  return window.portfolioProjects || [];
}

async function init() {
  try {
    projects = await loadProjects();
    activeSlug = activeSlug || projects[0]?.slug;

    if (!projects.length) {
      projectDetail.innerHTML = `<p class="case-annotation">Nepodařilo se načíst žádné projekty.</p>`;
      return;
    }

    if (!window.location.hash && activeSlug) {
      window.history.replaceState(null, "", `#${activeSlug}`);
    }

    render();
  } catch (error) {
    console.error(error);
    projectDetail.innerHTML = `<p class="case-annotation">Nepodařilo se načíst data projektů. Zkontroluj složku data/projects.</p>`;
  }
}

window.addEventListener("hashchange", () => {
  setActiveProject(normalizeSlug(window.location.hash.replace("#", "")));
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightboxOpen) {
    closeLightbox();
    return;
  }

  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(document.activeElement?.tagName)) return;

  if (lightboxOpen) {
    const project = getActiveProject();
    const screens = project?.screens || [];
    if (screens.length > 1) {
      const direction = event.key === "ArrowRight" ? 1 : -1;
      activeScreenIndex = (activeScreenIndex + direction + screens.length) % screens.length;
      renderProjectDetail();
    }
    return;
  }

  const project = getActiveProject();
  const index = projects.findIndex((item) => item.slug === project.slug);
  const direction = event.key === "ArrowRight" ? 1 : -1;
  const nextProject = projects[(index + direction + projects.length) % projects.length];

  window.location.hash = nextProject.slug;
});

document.addEventListener("click", (event) => {
  const clickedInsideHotspot = event.target.closest(".hotspot") || event.target.closest(".hotspot-tooltip");
  if (!clickedInsideHotspot) closeHotspots();
});

init();
