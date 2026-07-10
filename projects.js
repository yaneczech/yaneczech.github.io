const PROJECT_MANIFEST_URL = "data/projects/index.json";

async function fetchJson(url) {
  const response = await fetch(String(url), { cache: "no-cache" });

  if (!response.ok) {
    throw new Error(`Nepodařilo se načíst ${url} (${response.status})`);
  }

  return response.json();
}

async function loadPortfolioProjects() {
  if (Array.isArray(window.portfolioProjects)) {
    return window.portfolioProjects;
  }

  const manifest = await fetchJson(PROJECT_MANIFEST_URL);
  const files = manifest.projects || [];

  const manifestUrl = new URL(PROJECT_MANIFEST_URL, window.location.href);
  const projects = await Promise.all(files.map((file) => fetchJson(new URL(file, manifestUrl).href)));

  window.portfolioProjects = projects;
  return projects;
}

window.loadPortfolioProjects = loadPortfolioProjects;
window.portfolioProjectsReady = loadPortfolioProjects();
