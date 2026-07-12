import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || process.argv[2] || 8080);
const projectDir = resolve(root, "data/projects");
const manifestPath = join(projectDir, "index.json");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".webp": "image/webp"
};

function send(response, status, body, headers = {}) {
  response.writeHead(status, headers);
  response.end(body);
}

function sendJson(response, status, payload) {
  send(response, status, JSON.stringify(payload), {
    "content-type": "application/json; charset=utf-8"
  });
}

async function readRequestJson(request) {
  let body = "";

  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1_000_000) {
      throw new Error("Request body je příliš velký.");
    }
  }

  return JSON.parse(body || "{}");
}

function safeStaticPath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const requested = pathname === "/" ? "/index.html" : pathname;
  const absolute = normalize(resolve(root, `.${requested}`));

  if (!absolute.startsWith(root)) {
    return null;
  }

  return absolute;
}

async function findProjectFile(slug) {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const files = Array.isArray(manifest.projects) ? manifest.projects : [];

  for (const file of files) {
    const absolute = normalize(resolve(projectDir, file));
    if (!absolute.startsWith(projectDir)) continue;

    const project = JSON.parse(await readFile(absolute, "utf8"));
    if (project.slug === slug) {
      return { absolute, project };
    }
  }

  return null;
}

function normalizeHotspots(hotspots) {
  if (!Array.isArray(hotspots)) {
    throw new Error("Hotspoty musí být pole.");
  }

  return hotspots.map((hotspot, index) => ({
    x: Number.isFinite(Number(hotspot.x)) ? Number(hotspot.x) : 50,
    y: Number.isFinite(Number(hotspot.y)) ? Number(hotspot.y) : 50,
    title: String(hotspot.title || `Bod ${index + 1}`),
    text: String(hotspot.text || "")
  }));
}

async function saveAnnotations(request, response) {
  const payload = await readRequestJson(request);
  const slug = String(payload.slug || "");
  const screenIndex = Number(payload.screenIndex);

  if (!slug || !Number.isInteger(screenIndex) || screenIndex < 0) {
    sendJson(response, 400, { ok: false, error: "Chybí slug projektu nebo index screenu." });
    return;
  }

  const found = await findProjectFile(slug);
  if (!found) {
    sendJson(response, 404, { ok: false, error: `Projekt ${slug} nebyl nalezen.` });
    return;
  }

  const { absolute, project } = found;
  if (!Array.isArray(project.screens) || !project.screens[screenIndex]) {
    sendJson(response, 404, { ok: false, error: `Screenshot ${screenIndex + 1} nebyl nalezen.` });
    return;
  }

  if (typeof payload.projectAnnotation === "string") {
    project.annotation = payload.projectAnnotation;
  }

  if (typeof payload.screenTitle === "string") {
    project.screens[screenIndex].title = payload.screenTitle;
  }

  if (typeof payload.screenCaption === "string") {
    project.screens[screenIndex].caption = payload.screenCaption;
  }

  project.screens[screenIndex].hotspots = normalizeHotspots(payload.hotspots);
  await writeFile(absolute, `${JSON.stringify(project, null, 2)}\n`);

  sendJson(response, 200, {
    ok: true,
    file: absolute.replace(`${root}/`, ""),
    count: project.screens[screenIndex].hotspots.length
  });
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === "GET" && request.url === "/__save-annotations/status") {
      sendJson(response, 200, { ok: true, writable: true });
      return;
    }

    if (request.method === "POST" && request.url === "/__save-annotations") {
      await saveAnnotations(request, response);
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      sendJson(response, 405, { ok: false, error: "Metoda není podporovaná." });
      return;
    }

    const filePath = safeStaticPath(request.url);
    if (!filePath) {
      send(response, 403, "Forbidden");
      return;
    }

    const body = await readFile(filePath);
    send(response, 200, request.method === "HEAD" ? "" : body, {
      "content-type": mimeTypes[extname(filePath)] || "application/octet-stream"
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      send(response, 404, "Not found");
      return;
    }

    console.error(error);
    sendJson(response, 500, { ok: false, error: error.message || "Server error" });
  }
});

server.listen(port, () => {
  console.log(`Annotation server běží na http://localhost:${port}`);
  console.log("Ukládání anotací je dostupné na /annotations.html");
});
