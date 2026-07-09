const mapperProjects = window.portfolioProjects || [];

const projectSelect = document.querySelector("#mapper-project");
const screenSelect = document.querySelector("#mapper-screen");
const uploadInput = document.querySelector("#mapper-upload");
const stage = document.querySelector("#mapper-stage");
const image = document.querySelector("#mapper-image");
const emptyState = document.querySelector("#mapper-empty");
const layer = document.querySelector("#mapper-layer");
const screenTitle = document.querySelector("#mapper-screen-title");
const screenCaption = document.querySelector("#mapper-screen-caption");
const positionText = document.querySelector("#mapper-position");
const list = document.querySelector("#mapper-list");
const count = document.querySelector("#mapper-count");
const output = document.querySelector("#mapper-output");

const state = {
  projectIndex: 0,
  screenIndex: 0,
  hotspots: [],
  previewUrl: "",
  activeIndex: null,
  draggingIndex: null,
  suppressNextClick: false
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cloneHotspots(hotspots = []) {
  return hotspots.map((hotspot, index) => ({
    x: normalizeCoordinate(hotspot.x, 50),
    y: normalizeCoordinate(hotspot.y, 50),
    title: hotspot.title || `Bod ${index + 1}`,
    text: hotspot.text || ""
  }));
}

function normalizeCoordinate(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(100, Math.max(0, Math.round(number * 10) / 10));
}

function getProject() {
  return mapperProjects[state.projectIndex] || mapperProjects[0];
}

function getScreen() {
  const project = getProject();
  return project?.screens?.[state.screenIndex] || project?.screens?.[0];
}

function populateProjects() {
  projectSelect.innerHTML = mapperProjects
    .map(
      (project, index) => `
        <option value="${index}">
          ${escapeHtml(project.orderLabel ? `${project.orderLabel} ` : "")}${escapeHtml(project.title)}
        </option>
      `
    )
    .join("");
}

function populateScreens() {
  const project = getProject();
  const screens = project?.screens || [];

  screenSelect.innerHTML = screens
    .map(
      (screen, index) => `
        <option value="${index}">
          ${escapeHtml(screen.title || `Screenshot ${index + 1}`)}
        </option>
      `
    )
    .join("");

  screenSelect.disabled = screens.length < 2;
}

function loadSelectedScreen() {
  const screen = getScreen();

  state.hotspots = cloneHotspots(screen?.hotspots);
  state.activeIndex = state.hotspots.length ? 0 : null;
  clearPreviewUrl();
  uploadInput.value = "";
  render();
}

function clearPreviewUrl() {
  if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
  state.previewUrl = "";
}

function getImageSource() {
  const screen = getScreen();
  return state.previewUrl || screen?.image || "";
}

function render() {
  renderScreenMeta();
  renderStage();
  renderMarkers();
  renderHotspotList();
  renderOutput();
}

function renderScreenMeta() {
  const screen = getScreen();

  screenTitle.textContent = screen?.title || "Screenshot";
  screenCaption.textContent = screen?.caption || "Klikni do náhledu a získej procentuální souřadnice.";
}

function renderStage() {
  const source = getImageSource();

  if (source) {
    image.src = source;
    image.alt = getScreen()?.alt || "Mapovaný screenshot";
    stage.classList.add("has-image");
    emptyState.setAttribute("aria-hidden", "true");
  } else {
    image.removeAttribute("src");
    image.alt = "";
    stage.classList.remove("has-image");
    emptyState.removeAttribute("aria-hidden");
  }
}

function renderMarkers() {
  layer.innerHTML = state.hotspots
    .map(
      (hotspot, index) => `
        <button
          class="mapper-hotspot ${index === state.activeIndex ? "is-active" : ""}"
          type="button"
          style="--x: ${hotspot.x}%; --y: ${hotspot.y}%"
          data-index="${index}"
          aria-label="Bod ${index + 1}: ${escapeHtml(hotspot.title)}"
        >
          ${index + 1}
        </button>
      `
    )
    .join("");
}

function renderHotspotList() {
  count.textContent = `${state.hotspots.length} ${getPointLabel(state.hotspots.length)}`;

  if (!state.hotspots.length) {
    list.innerHTML = `<p class="mapper-empty-list">Zatím žádné body. Klikni do obrázku pro přidání prvního bodu.</p>`;
    return;
  }

  list.innerHTML = state.hotspots
    .map(
      (hotspot, index) => `
        <article class="mapper-point" data-index="${index}">
          <header class="mapper-point-head">
            <div class="mapper-point-title">
              <span>${index + 1}</span>
              <span>Bod ${index + 1}</span>
            </div>
            <button class="mapper-remove" type="button" data-remove="${index}">
              Odstranit
            </button>
          </header>

          <div class="mapper-coordinates">
            <label class="mapper-field">
              <span>x %</span>
              <input class="mapper-input" type="number" min="0" max="100" step="0.1" value="${hotspot.x}" data-field="x" />
            </label>
            <label class="mapper-field">
              <span>y %</span>
              <input class="mapper-input" type="number" min="0" max="100" step="0.1" value="${hotspot.y}" data-field="y" />
            </label>
          </div>

          <label class="mapper-field">
            <span>Nadpis</span>
            <input class="mapper-input" type="text" value="${escapeHtml(hotspot.title)}" data-field="title" />
          </label>

          <label class="mapper-field">
            <span>Text</span>
            <textarea class="mapper-textarea" data-field="text">${escapeHtml(hotspot.text)}</textarea>
          </label>
        </article>
      `
    )
    .join("");
}

function getPointLabel(total) {
  if (total === 1) return "bod";
  if (total >= 2 && total <= 4) return "body";
  return "bodů";
}

function renderOutput() {
  const normalized = state.hotspots.map((hotspot) => ({
    x: normalizeCoordinate(hotspot.x),
    y: normalizeCoordinate(hotspot.y),
    title: hotspot.title,
    text: hotspot.text
  }));

  output.value = `hotspots: ${JSON.stringify(normalized, null, 2)}`;
}

function getPointerPosition(event) {
  const rect = stage.getBoundingClientRect();
  return {
    x: normalizeCoordinate(((event.clientX - rect.left) / rect.width) * 100),
    y: normalizeCoordinate(((event.clientY - rect.top) / rect.height) * 100)
  };
}

function addHotspot(event) {
  const position = getPointerPosition(event);

  state.hotspots.push({
    x: position.x,
    y: position.y,
    title: `Bod ${state.hotspots.length + 1}`,
    text: ""
  });
  state.activeIndex = state.hotspots.length - 1;

  renderMarkers();
  renderHotspotList();
  renderOutput();
  updatePositionText(position);
}

function updateHotspotPosition(index, event) {
  const hotspot = state.hotspots[index];
  if (!hotspot) return;

  const position = getPointerPosition(event);
  hotspot.x = position.x;
  hotspot.y = position.y;
  updatePositionText(position);
  renderMarkers();
  renderHotspotList();
  renderOutput();
}

function updatePositionText(position) {
  positionText.textContent = `x ${position.x} % / y ${position.y} %`;
}

function bindEvents() {
  projectSelect.addEventListener("change", (event) => {
    state.projectIndex = Number(event.target.value) || 0;
    state.screenIndex = 0;
    populateScreens();
    loadSelectedScreen();
  });

  screenSelect.addEventListener("change", (event) => {
    state.screenIndex = Number(event.target.value) || 0;
    loadSelectedScreen();
  });

  uploadInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    clearPreviewUrl();
    state.previewUrl = file ? URL.createObjectURL(file) : "";
    renderStage();
  });

  stage.addEventListener("click", (event) => {
    if (state.suppressNextClick) {
      state.suppressNextClick = false;
      return;
    }

    if (event.target.closest(".mapper-hotspot")) return;
    addHotspot(event);
  });

  stage.addEventListener("pointerdown", (event) => {
    const button = event.target.closest(".mapper-hotspot");
    if (!button) return;

    event.preventDefault();
    state.suppressNextClick = true;
    state.draggingIndex = Number(button.dataset.index);
    state.activeIndex = state.draggingIndex;
    updateHotspotPosition(state.draggingIndex, event);
  });

  window.addEventListener("pointermove", (event) => {
    if (state.draggingIndex === null) return;
    updateHotspotPosition(state.draggingIndex, event);
  });

  window.addEventListener("pointerup", () => {
    state.draggingIndex = null;
  });

  list.addEventListener("input", (event) => {
    const field = event.target.dataset.field;
    const point = event.target.closest(".mapper-point");
    if (!field || !point) return;

    const index = Number(point.dataset.index);
    const hotspot = state.hotspots[index];
    if (!hotspot) return;

    hotspot[field] =
      field === "x" || field === "y"
        ? normalizeCoordinate(event.target.value)
        : event.target.value;

    state.activeIndex = index;
    renderMarkers();
    renderOutput();
  });

  list.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove]");
    const point = event.target.closest(".mapper-point");

    if (removeButton) {
      const index = Number(removeButton.dataset.remove);
      state.hotspots.splice(index, 1);
      state.activeIndex = state.hotspots.length ? Math.min(index, state.hotspots.length - 1) : null;
      renderMarkers();
      renderHotspotList();
      renderOutput();
      return;
    }

    if (point) {
      state.activeIndex = Number(point.dataset.index);
      renderMarkers();
    }
  });

  document.querySelector("[data-reset]").addEventListener("click", loadSelectedScreen);

  document.querySelector("[data-clear]").addEventListener("click", () => {
    state.hotspots = [];
    state.activeIndex = null;
    renderMarkers();
    renderHotspotList();
    renderOutput();
  });

  document.querySelector("[data-copy]").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    await copyOutput();
    button.textContent = "Zkopírováno";
    window.setTimeout(() => {
      button.textContent = "Kopírovat";
    }, 1400);
  });
}

async function copyOutput() {
  output.select();
  output.setSelectionRange(0, output.value.length);

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(output.value);
    return;
  }

  document.execCommand("copy");
}

function init() {
  if (!mapperProjects.length) {
    screenTitle.textContent = "Chybí projekty";
    screenCaption.textContent = "Nepodařilo se načíst window.portfolioProjects z projects.js.";
    return;
  }

  populateProjects();
  populateScreens();
  loadSelectedScreen();
  bindEvents();
}

window.addEventListener("beforeunload", clearPreviewUrl);

init();
