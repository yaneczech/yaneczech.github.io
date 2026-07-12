let projects = [];

const projectList = document.querySelector("#project-list");
const projectDetail = document.querySelector("#project-detail");

let activeSlug = normalizeSlug(window.location.hash.replace("#", ""));
let activeScreenIndex = 0;
let lightboxOpen = false;
let lightboxZoom = false;
const annotationVisibility = new Map();

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

  const screens = project.screens?.length ? project.screens : [null];
  const screen = screens[activeScreenIndex] || screens[0];
  const currentIndex = projects.findIndex((item) => item.slug === project.slug);
  const previous = projects[(currentIndex - 1 + projects.length) % projects.length];
  const next = projects[(currentIndex + 1) % projects.length];

  projectDetail.innerHTML = `
    <header class="case-header">
      <h2>${escapeHtml(project.title)}</h2>
      ${project.annotation ? `<p class="case-annotation">${escapeHtml(project.annotation)}</p>` : ""}
    </header>

    <div class="screen-stack" aria-label="Anotované screenshoty">
      ${screens
        .map(
          (item, index) => `
            <section class="screen-section" aria-label="${escapeHtml(item?.title || `Screenshot ${index + 1}`)}">
              ${renderScreenFrame(item, `inline-${index}`, index)}
              ${renderScreenToolbar(item, index)}
            </section>
          `
        )
        .join("")}
    </div>

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

function renderScreenToolbar(screen, index) {
  return `
    <div class="screen-toolbar">
      <div>
        <h3>${escapeHtml(screen?.title || "Ukázka")}</h3>
      </div>

      <div class="screen-actions">
        ${renderAnnotationToggle(index)}
        <button class="screen-open" type="button" data-open-lightbox="${index}" title="Zvětšit">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="M6.995 10.852L5.133 9.008l-3.026 2.98L.062 9.972v5.903h5.987l-2.076-2.047zM9.961.008l2.097 2.087l-3.053 3.033l1.88 1.88l3.057-3.038l1.967 1.996V.008z"/></svg>
        </button>
      </div>
    </div>
  `;
}

function getScreenKey(index = activeScreenIndex) {
  return `${activeSlug}:${index}`;
}

function areAnnotationsVisible(index = activeScreenIndex) {
  const key = getScreenKey(index);
  return annotationVisibility.has(key) ? annotationVisibility.get(key) : true;
}

function toggleScreenAnnotations(index = activeScreenIndex) {
  annotationVisibility.set(getScreenKey(index), !areAnnotationsVisible(index));
}

function renderAnnotationToggle(index = activeScreenIndex) {
  const isVisible = areAnnotationsVisible(index);

  return `
    <button
      class="annotation-toggle ${isVisible ? "is-on" : ""}"
      type="button"
      data-toggle-annotations
      data-screen-index="${index}"
      aria-pressed="${isVisible ? "true" : "false"}"
    >
      <span class="annotation-toggle__label">Anotace</span>
      <span class="annotation-toggle__track" aria-hidden="true">
        <span class="annotation-toggle__thumb"></span>
      </span>
      <span class="annotation-toggle__state">${isVisible ? "zapnuto" : "vypnuto"}</span>
    </button>
  `;
}

function renderScreenFrame(screen, idPrefix = "inline", index = activeScreenIndex) {
  const hasImage = Boolean(screen?.image);
  const hotspots = screen?.hotspots || [];

  return `
    <figure class="screen-frame ${areAnnotationsVisible(index) ? "" : "hide-annotations"}">
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
            ${renderAnnotationToggle(activeScreenIndex)}
            ${renderZoomToggle(Boolean(screen?.image))}
            <button class="lightbox-close" type="button" data-close-lightbox title="Zavřít">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><!-- Icon from SmartIcons Glyph by SmartIcons - https://creativecommons.org/licenses/by-sa/4.0/ --><path fill="currentColor" fill-rule="evenodd" d="M15.995 1.852L14.133.008l-3.026 2.98L9.062.972v5.903h5.987l-2.076-2.047zM.961 9.008l2.097 2.087l-3.053 3.033l1.88 1.88l3.057-3.038l1.967 1.996V9.008z"/></svg>
            </button>
          </div>
        </header>

        <div class="lightbox-figure" data-lightbox-figure>
          ${renderScreenFrame(screen, "lightbox", activeScreenIndex)}
        </div>
      </div>
    </div>
  `;
}

function renderZoomToggle(hasImage) {
  return `
    <button
      class="zoom-toggle ${lightboxZoom ? "is-on" : ""}"
      type="button"
      data-toggle-zoom
      aria-pressed="${lightboxZoom ? "true" : "false"}"
      title="${lightboxZoom ? "Vypnout lupu" : "Zapnout lupu"}"
      aria-label="${lightboxZoom ? "Vypnout lupu" : "Zapnout lupu"}"
      ${hasImage ? "" : "disabled"}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" aria-hidden="true"><g fill="currentColor" fill-rule="evenodd"><path d="M16.025 7.5c0-4.143-3.356-7.5-7.499-7.5a7.5 7.5 0 0 0-7.499 7.5a7.5 7.5 0 0 0 7.5 7.5c2.219 0 7.5-.052 7.5-.052zm-7.553 5.529a5.506 5.506 0 1 1 .002-11.012a5.506 5.506 0 0 1-.002 11.012m6.487.929h-1v-1h1z"/><path d="M7.844 3.044c-2.119 0-3.839 1.616-3.839 3.608c0 .25.026.496.077.73c.186.84.529.691.529-.158c0-1.998 1.719-3.609 3.84-3.609c.905 0 .608-.571-.607-.571"/></g></svg>
      <span>${lightboxZoom ? "Vypnout" : "Lupa"}</span>
    </button>
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
  document.querySelectorAll("[data-toggle-annotations]").forEach((toggleButton) => {
    toggleButton.addEventListener("click", (event) => {
      toggleScreenAnnotations(Number(event.currentTarget.dataset.screenIndex) || 0);
      renderProjectDetail();
    });
  });

  document.querySelectorAll("[data-open-lightbox]").forEach((button) => {
    button.addEventListener("click", (event) => openLightbox(Number(event.currentTarget.dataset.openLightbox) || 0));
  });

  document.querySelectorAll("[data-close-lightbox]").forEach((button) => {
    button.addEventListener("click", () => closeLightbox());
  });

  document.querySelectorAll("[data-toggle-zoom]").forEach((button) => {
    button.addEventListener("click", () => toggleLightboxZoom());
  });

  const lightbox = document.querySelector("[data-lightbox]");
  if (lightbox) {
    lightbox.classList.toggle("is-zoomed", lightboxZoom);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
  }

  bindLightboxPan();

  document.querySelectorAll(".hotspot").forEach((button) => {
    button.addEventListener("click", () => {
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      closeHotspots();
      button.setAttribute("aria-expanded", String(!isExpanded));
      button.classList.toggle("is-open", !isExpanded);
    });
  });
}

function bindLightboxPan() {
  const figure = document.querySelector("[data-lightbox-figure]");
  if (!figure || !lightboxZoom) return;

  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let scrollLeft = 0;
  let scrollTop = 0;

  figure.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    if (event.target.closest("button, a")) return;

    isPanning = true;
    startX = event.clientX;
    startY = event.clientY;
    scrollLeft = figure.scrollLeft;
    scrollTop = figure.scrollTop;
    figure.classList.add("is-panning");
    figure.setPointerCapture(event.pointerId);
  });

  figure.addEventListener("pointermove", (event) => {
    if (!isPanning) return;

    figure.scrollLeft = scrollLeft - (event.clientX - startX);
    figure.scrollTop = scrollTop - (event.clientY - startY);
  });

  function stopPanning(event) {
    if (!isPanning) return;

    isPanning = false;
    figure.classList.remove("is-panning");
    if (event?.pointerId != null && figure.hasPointerCapture(event.pointerId)) {
      figure.releasePointerCapture(event.pointerId);
    }
  }

  figure.addEventListener("pointerup", stopPanning);
  figure.addEventListener("pointercancel", stopPanning);
  figure.addEventListener("pointerleave", stopPanning);
}

function toggleLightboxZoom() {
  lightboxZoom = !lightboxZoom;
  renderProjectDetail();

  if (lightboxZoom) {
    requestAnimationFrame(() => {
      const figure = document.querySelector("[data-lightbox-figure]");
      if (!figure) return;

      figure.scrollLeft = Math.max(0, (figure.scrollWidth - figure.clientWidth) / 2);
      figure.scrollTop = 0;
      document.querySelector("[data-toggle-zoom]")?.focus();
    });
  }
}

function openLightbox(index = 0) {
  const project = getActiveProject();
  const screens = project?.screens || [];
  activeScreenIndex = screens[index] ? index : 0;
  lightboxOpen = true;
  lightboxZoom = false;
  document.body.classList.add("is-lightbox-open");
  renderProjectDetail();
  document.querySelector("[data-close-lightbox]")?.focus();
}

function closeLightbox() {
  lightboxOpen = false;
  lightboxZoom = false;
  document.body.classList.remove("is-lightbox-open");
  renderProjectDetail();
  document.querySelector(`[data-open-lightbox="${activeScreenIndex}"]`)?.focus();
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
  lightboxZoom = false;
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
      lightboxZoom = false;
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
