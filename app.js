const projects = window.portfolioProjects || [];

const projectList = document.querySelector("#project-list");
const projectDetail = document.querySelector("#project-detail");

let activeSlug = normalizeSlug(window.location.hash.replace("#", "")) || projects[0]?.slug;
let activeScreenIndex = 0;
let annotationsVisible = true;

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
      ${renderScreenFrame(screen)}
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
        ${
          screens.length > 1
            ? `
              <select id="screen-select" aria-label="Vybrat screenshot">
                ${screens
                  .map(
                    (item, index) => `
                      <option value="${index}" ${index === activeScreenIndex ? "selected" : ""}>
                        ${escapeHtml(item.title || `Ukázka ${index + 1}`)}
                      </option>
                    `
                  )
                  .join("")}
              </select>
            `
            : ""
        }
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
      </div>
    </div>
  `;
}

function renderScreenFrame(screen) {
  const hasImage = Boolean(screen?.image);
  const hotspots = screen?.hotspots || [];

  return `
    <figure class="screen-frame ${annotationsVisible ? "" : "hide-annotations"}">
      <div class="screen-canvas">
        ${
          hasImage
            ? `<img src="${escapeHtml(screen.image)}" alt="${escapeHtml(screen.alt)}" loading="lazy" />`
            : renderPlaceholderScreen()
        }

        <div class="hotspot-layer" aria-label="Anotace screenshotu">
          ${hotspots
            .map(
              (hotspot, index) => `
                <button
                  class="hotspot"
                  type="button"
                  style="--x: ${Number(hotspot.x) || 50}%; --y: ${Number(hotspot.y) || 50}%"
                  aria-expanded="false"
                  aria-describedby="hotspot-${index}"
                >
                  <span>${index + 1}</span>
                </button>
                <aside
                  class="hotspot-tooltip"
                  id="hotspot-${index}"
                  style="--x: ${Number(hotspot.x) || 50}%; --y: ${Number(hotspot.y) || 50}%"
                  role="note"
                >
                  <strong>${escapeHtml(hotspot.title)}</strong>
                  <span>${escapeHtml(hotspot.text)}</span>
                </aside>
              `
            )
            .join("")}
        </div>
      </div>
    </figure>
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
  const select = document.querySelector("#screen-select");
  if (select) {
    select.addEventListener("change", (event) => {
      activeScreenIndex = Number(event.target.value) || 0;
      renderProjectDetail();
    });
  }

  const toggleButton = document.querySelector("[data-toggle-annotations]");
  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      annotationsVisible = !annotationsVisible;
      renderProjectDetail();
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
  closeHotspots();
  render();
}

function render() {
  renderProjectList();
  renderProjectDetail();
}

window.addEventListener("hashchange", () => {
  setActiveProject(normalizeSlug(window.location.hash.replace("#", "")));
});

window.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;

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

if (!window.location.hash && activeSlug) {
  window.history.replaceState(null, "", `#${activeSlug}`);
}

render();
