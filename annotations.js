let mapperProjects = [];

const projectSelect = document.querySelector("#mapper-project");
const projectAnnotationInput = document.querySelector("#mapper-project-annotation");
const screenSelect = document.querySelector("#mapper-screen");
const screenTitleInput = document.querySelector("#mapper-screen-title-input");
const screenCaptionInput = document.querySelector("#mapper-screen-caption-input");
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
const saveButton = document.querySelector("[data-save]");
const saveStatus = document.querySelector("#mapper-save-status");

const state = {
  projectIndex: 0,
  screenIndex: 0,
  hotspots: [],
  previewUrl: "",
  activeIndex: null,
  draggingIndex: null,
  suppressNextClick: false,
  canSave: false
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

function getNormalizedHotspots() {
  return state.hotspots.map((hotspot) => ({
    x: normalizeCoordinate(hotspot.x),
    y: normalizeCoordinate(hotspot.y),
    title: hotspot.title,
    text: hotspot.text
  }));
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
  renderEditorFields();
  render();
}

function renderEditorFields() {
  const project = getProject();
  const screen = getScreen();

  projectAnnotationInput.value = project?.annotation || "";
  screenTitleInput.value = screen?.title || "";
  screenCaptionInput.value = screen?.caption || "";
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

  screenTitle.textContent = screenTitleInput.value || screen?.title || "Screenshot";
  screenCaption.textContent =
    screenCaptionInput.value || screen?.caption || "Klikni do náhledu a získej procentuální souřadnice.";
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
  output.value = `"hotspots": ${JSON.stringify(getNormalizedHotspots(), null, 2)}`;
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

  projectAnnotationInput.addEventListener("input", () => {
    const project = getProject();
    if (project) project.annotation = projectAnnotationInput.value;
  });

  screenTitleInput.addEventListener("input", () => {
    const screen = getScreen();
    if (screen) screen.title = screenTitleInput.value;
    populateScreens();
    screenSelect.value = String(state.screenIndex);
    renderScreenMeta();
  });

  screenCaptionInput.addEventListener("input", () => {
    const screen = getScreen();
    if (screen) screen.caption = screenCaptionInput.value;
    renderScreenMeta();
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

  saveButton.addEventListener("click", saveCurrentHotspots);
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

async function loadProjects() {
  if (window.portfolioProjectsReady) {
    return window.portfolioProjectsReady;
  }

  if (window.loadPortfolioProjects) {
    return window.loadPortfolioProjects();
  }

  return window.portfolioProjects || [];
}

function setSaveStatus(message, type = "") {
  saveStatus.textContent = message;
  saveStatus.classList.toggle("is-ok", type === "ok");
  saveStatus.classList.toggle("is-error", type === "error");
}

async function detectSaveSupport() {
  try {
    const response = await fetch("/__save-annotations/status", { cache: "no-cache" });
    const payload = await response.json();
    state.canSave = Boolean(response.ok && payload.writable);
  } catch {
    state.canSave = false;
  }

  saveButton.disabled = !state.canSave;
  setSaveStatus(
    state.canSave
      ? "Přímé ukládání je aktivní. Tlačítko uloží hotspoty do JSON souboru vybraného projektu."
      : "Přímé ukládání není aktivní. Spusť lokálně: node tools/annotation-server.mjs",
    state.canSave ? "ok" : ""
  );
}

async function saveCurrentHotspots() {
  if (!state.canSave) return;

  const project = getProject();
  if (!project) return;

  saveButton.disabled = true;
  setSaveStatus("Ukládám…");

  try {
    const response = await fetch("/__save-annotations", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        slug: project.slug,
        screenIndex: state.screenIndex,
        projectAnnotation: projectAnnotationInput.value,
        screenTitle: screenTitleInput.value,
        screenCaption: screenCaptionInput.value,
        hotspots: getNormalizedHotspots()
      })
    });
    const payload = await response.json();

    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Uložení selhalo.");
    }

    project.annotation = projectAnnotationInput.value;
    project.screens[state.screenIndex].title = screenTitleInput.value;
    project.screens[state.screenIndex].caption = screenCaptionInput.value;
    project.screens[state.screenIndex].hotspots = cloneHotspots(getNormalizedHotspots());
    populateScreens();
    screenSelect.value = String(state.screenIndex);
    setSaveStatus(`Uloženo do ${payload.file} (${payload.count} bodů).`, "ok");
  } catch (error) {
    console.error(error);
    setSaveStatus(error.message || "Uložení selhalo.", "error");
  } finally {
    saveButton.disabled = !state.canSave;
  }
}

async function init() {
  mapperProjects = await loadProjects();

  if (!mapperProjects.length) {
    screenTitle.textContent = "Chybí projekty";
    screenCaption.textContent = "Nepodařilo se načíst projekty ze složky data/projects.";
    return;
  }

  populateProjects();
  populateScreens();
  loadSelectedScreen();
  bindEvents();
  await detectSaveSupport();
}

window.addEventListener("beforeunload", clearPreviewUrl);

init().catch((error) => {
  console.error(error);
  screenTitle.textContent = "Chyba načtení";
  screenCaption.textContent = "Nepodařilo se načíst data projektů. Zkontroluj data/projects/index.json.";
});
