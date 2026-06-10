// =============================================
//  GAMEVAULT — main.js
// =============================================

const API_KEY = "174ef211cdd14c5599e4d6fcf65f56a3"; // <- Pegá tu key de rawg.io
const BASE    = "https://api.rawg.io/api";

// IDs de géneros que querés mostrar (podés editar)
const GENRE_IDS = [
  { id: 4,   name: "Acción",     emoji: "⚔️" },
  { id: 5,   name: "RPG",        emoji: "🧙" },
  { id: 51,  name: "Indie",      emoji: "🎮" },
  { id: 2,   name: "Estrategia", emoji: "♟️" },
  { id: 3,   name: "Aventura",   emoji: "🗺️" },
];

// ──────────────────────────────────────────────
//  REFERENCIAS AL DOM
// ──────────────────────────────────────────────
const splash        = document.getElementById("splash");
const progressFill  = document.getElementById("progress-fill");
const splashText    = document.getElementById("splash-text");
const app           = document.getElementById("app");
const detailPage    = document.getElementById("detail-page");
const galleriesEl   = document.getElementById("galleries");
const errorBanner   = document.getElementById("error-banner");
const errorMsg      = document.getElementById("error-msg");
const errorRetry    = document.getElementById("error-retry");
const heroStats     = document.getElementById("hero-stats");
const searchInput   = document.getElementById("search-input");
const searchBtn     = document.getElementById("search-btn");
const searchSection = document.getElementById("search-results-section");
const searchGrid    = document.getElementById("search-results-grid");
const closeSearch   = document.getElementById("close-search-btn");
const backBtn       = document.getElementById("back-btn");
const detailContent = document.getElementById("detail-content");
const breadcrumb    = document.getElementById("detail-breadcrumb");

// ──────────────────────────────────────────────
//  HELPERS DE FETCH
// ──────────────────────────────────────────────
async function apiFetch(path) {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${BASE}${path}${sep}key=${API_KEY}`);
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  return res.json();
}

// ──────────────────────────────────────────────
//  SPLASH: animar progreso
// ──────────────────────────────────────────────
function setProgress(pct, text) {
  progressFill.style.width = pct + "%";
  if (text) splashText.textContent = text;
}

function hideSplash() {
  splash.classList.add("fade-out");
  setTimeout(() => splash.style.display = "none", 650);
}

// ──────────────────────────────────────────────
//  ERROR BANNER
// ──────────────────────────────────────────────
function showError(msg) {
  errorMsg.textContent = msg;
  errorBanner.classList.remove("hidden");
}
function hideError() {
  errorBanner.classList.add("hidden");
}

// ──────────────────────────────────────────────
//  SKELETON: placeholder mientras carga un género
// ──────────────────────────────────────────────
function createSkeletonGrid(count = 5) {
  const grid = document.createElement("div");
  grid.className = "games-grid";
  for (let i = 0; i < count; i++) {
    grid.innerHTML += `
      <div class="skeleton-card" aria-hidden="true">
        <div class="skeleton skeleton-img"></div>
        <div class="skeleton-body">
          <div class="skeleton skeleton-line w80"></div>
          <div class="skeleton skeleton-line w50"></div>
          <div class="skeleton skeleton-line w60"></div>
        </div>
      </div>`;
  }
  return grid;
}

// ──────────────────────────────────────────────
//  RENDERIZAR UNA CARD DE JUEGO
// ──────────────────────────────────────────────
function createGameCard(game) {
  const card = document.createElement("article");
  card.className = "game-card";
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `Ver detalle de ${game.name}`);

  const imgSrc = game.background_image;
  const rating = game.rating ? `⭐ ${game.rating.toFixed(1)}` : "Sin rating";
  const year   = game.released ? game.released.slice(0, 4) : "—";

  card.innerHTML = `
    ${imgSrc
      ? `<img class="card-img" src="${imgSrc}" alt="Imagen de ${game.name}" loading="lazy">`
      : `<div class="card-img-placeholder" aria-hidden="true">🎮</div>`
    }
    <div class="card-body">
      <p class="card-title">${game.name}</p>
      <p class="card-meta">${year}</p>
      <p class="card-rating">${rating}</p>
    </div>`;

  // Click o Enter → abrir detalle
  const openDetail = () => showDetailPage(game.id, game.name);
  card.addEventListener("click", openDetail);
  card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") openDetail(); });

  return card;
}

// ──────────────────────────────────────────────
//  SECCIÓN DE GÉNERO (con carga independiente)
// ──────────────────────────────────────────────
function createGenreSection(genre) {
  const section = document.createElement("section");
  section.className = "genre-section";
  section.setAttribute("aria-labelledby", `genre-title-${genre.id}`);

  section.innerHTML = `
    <div class="genre-header">
      <h3 id="genre-title-${genre.id}" class="genre-name">
        ${genre.emoji} ${genre.name}
        <span class="genre-count" id="count-${genre.id}"></span>
      </h3>
      <button class="see-all-btn" data-genre="${genre.id}" data-name="${genre.emoji} ${genre.name}">
        Ver todos →
      </button>
    </div>
    <div id="grid-${genre.id}"></div>`;

  return section;
}

// ──────────────────────────────────────────────
//  CARGAR JUEGOS DE UN GÉNERO
// ──────────────────────────────────────────────
async function loadGenreGames(genre) {
  const gridEl   = document.getElementById(`grid-${genre.id}`);
  const countEl  = document.getElementById(`count-${genre.id}`);

  // Estado: pendiente → skeletons
  gridEl.appendChild(createSkeletonGrid(5));

  try {
    const data = await apiFetch(`/games?genres=${genre.id}&page_size=8&ordering=-rating`);

    // Estado: resuelto → mostrar cards
    gridEl.innerHTML = "";
    countEl.textContent = `${data.count.toLocaleString()} juegos`;

    if (data.results.length === 0) {
      gridEl.innerHTML = `<p style="color:var(--text3);font-size:0.85rem;">No hay juegos disponibles.</p>`;
      return;
    }

    const grid = document.createElement("div");
    grid.className = "games-grid";
    data.results.forEach(game => grid.appendChild(createGameCard(game)));
    gridEl.appendChild(grid);

  } catch (err) {
    // Estado: rechazado → mensaje de error inline
    gridEl.innerHTML = `
      <div style="
        background: rgba(248,113,113,0.07);
        border: 1px solid rgba(248,113,113,0.2);
        border-radius: 8px; padding: 12px 16px;
        font-size: 0.82rem; color: var(--danger);
        display: flex; align-items: center; gap: 8px;
      " role="alert">
        ⚠️ No se pudo cargar ${genre.name}. ${err.message}
      </div>`;
  }
}

// ──────────────────────────────────────────────
//  PÁGINA DE DETALLE
// ──────────────────────────────────────────────
async function showDetailPage(gameId, gameName) {
  // Ocultar app, mostrar detalle
  app.classList.add("hidden");
  detailPage.classList.remove("hidden");
  breadcrumb.textContent = gameName;
  window.scrollTo(0, 0);

  // Skeleton de carga
  detailContent.innerHTML = `
    <div style="padding:20px; max-width:800px; margin:0 auto;">
      <div class="skeleton" style="height:280px; border-radius:0; margin:-20px -20px 20px; width:calc(100% + 40px);"></div>
      <div style="padding:0 20px; display:flex; flex-direction:column; gap:10px;">
        <div class="skeleton skeleton-line w80" style="height:28px;"></div>
        <div class="skeleton skeleton-line w50" style="height:16px;"></div>
        <div class="skeleton skeleton-line" style="height:12px; width:100%;"></div>
        <div class="skeleton skeleton-line w80" style="height:12px;"></div>
      </div>
    </div>`;

  try {
    // Fetch en paralelo: detalle + screenshots
    const [game, shots] = await Promise.all([
      apiFetch(`/games/${gameId}`),
      apiFetch(`/games/${gameId}/screenshots`)
    ]);

    renderDetail(game, shots.results || []);

  } catch (err) {
    detailContent.innerHTML = `
      <div style="padding:40px 20px; text-align:center;">
        <p style="font-size:2rem;">😵</p>
        <p style="color:var(--danger); margin-top:12px;">No se pudo cargar el juego.</p>
        <p style="color:var(--text3); font-size:0.8rem; margin-top:6px;">${err.message}</p>
      </div>`;
  }
}

function renderDetail(game, screenshots) {
  const genres    = (game.genres || []).map(g => `<span class="detail-tag">${g.name}</span>`).join("");
  const platforms = (game.platforms || []).map(p => `<span class="detail-tag">${p.platform.name}</span>`).join("");
  const desc      = game.description_raw
    ? game.description_raw.slice(0, 400) + (game.description_raw.length > 400 ? "…" : "")
    : "Sin descripción disponible.";

  const screenshotsHTML = screenshots.length
    ? `<h4 style="font-size:0.85rem; color:var(--text2); margin-bottom:10px;">Capturas de pantalla</h4>
       <div class="screenshots-grid">
         ${screenshots.slice(0, 6).map(s =>
           `<img class="screenshot-img" src="${s.image}" alt="Captura de ${game.name}" loading="lazy">`
         ).join("")}
       </div>`
    : "";

  detailContent.innerHTML = `
    <div class="detail-hero">
      ${game.background_image
        ? `<img class="detail-hero-img" src="${game.background_image}" alt="Imagen de portada de ${game.name}">`
        : ""}
      <div class="detail-hero-overlay"></div>
      <div class="detail-hero-info">
        <h2 class="detail-game-title">${game.name}</h2>
        <p class="detail-game-studio">${game.released ? game.released.slice(0,4) : "—"} · ${(game.developers || []).map(d => d.name).join(", ") || "Desarrollador desconocido"}</p>
      </div>
    </div>
    <div class="detail-body">
      <div class="detail-tags">${genres}${platforms}</div>
      <p class="detail-desc">${desc}</p>
      <div class="detail-stats">
        <div class="detail-stat">
          <div class="detail-stat-label">Rating RAWG</div>
          <div class="detail-stat-val">⭐ ${game.rating?.toFixed(1) || "—"}</div>
        </div>
        <div class="detail-stat">
          <div class="detail-stat-label">Metacritic</div>
          <div class="detail-stat-val">${game.metacritic || "—"} / 100</div>
        </div>
        <div class="detail-stat">
          <div class="detail-stat-label">Reseñas</div>
          <div class="detail-stat-val">${(game.ratings_count || 0).toLocaleString()}</div>
        </div>
        <div class="detail-stat">
          <div class="detail-stat-label">Tiempo de juego</div>
          <div class="detail-stat-val">${game.playtime ? game.playtime + "h avg" : "—"}</div>
        </div>
      </div>
      ${screenshotsHTML}
    </div>`;
}

// ──────────────────────────────────────────────
//  BUSCADOR
// ──────────────────────────────────────────────
let searchTimer = null;

async function performSearch(query) {
  if (!query.trim()) {
    searchSection.classList.add("hidden");
    return;
  }

  searchSection.classList.remove("hidden");
  searchGrid.innerHTML = "";
  searchGrid.appendChild(createSkeletonGrid(4));
  window.scrollTo({ top: 0, behavior: "smooth" });

  try {
    const data = await apiFetch(`/games?search=${encodeURIComponent(query)}&page_size=8`);
    searchGrid.innerHTML = "";
    if (data.results.length === 0) {
      searchGrid.innerHTML = `<p style="color:var(--text3);font-size:0.85rem;grid-column:1/-1;">Sin resultados para "${query}".</p>`;
      return;
    }
    const grid = document.createElement("div");
    grid.className = "games-grid";
    data.results.forEach(game => grid.appendChild(createGameCard(game)));
    searchGrid.innerHTML = "";
    searchGrid.appendChild(grid);
  } catch (err) {
    searchGrid.innerHTML = `<p style="color:var(--danger);font-size:0.85rem;">Error al buscar: ${err.message}</p>`;
  }
}

searchBtn.addEventListener("click", () => performSearch(searchInput.value));
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") performSearch(searchInput.value);
  // Búsqueda con debounce al escribir
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => performSearch(searchInput.value), 500);
});
closeSearch.addEventListener("click", () => {
  searchSection.classList.add("hidden");
  searchInput.value = "";
});

// ──────────────────────────────────────────────
//  BOTÓN VOLVER
// ──────────────────────────────────────────────
backBtn.addEventListener("click", () => {
  detailPage.classList.add("hidden");
  app.classList.remove("hidden");
});

// ──────────────────────────────────────────────
//  INICIALIZACIÓN
// ──────────────────────────────────────────────
async function init() {
  hideError();
  setProgress(10, "Cargando géneros…");

  try {
    // Primer fetch: obtener info general (géneros + primer página de juegos)
    setProgress(30, "Conectando con RAWG…");
    const gamesData = await apiFetch("/games?page_size=1"); // solo para stats globales
    setProgress(60, "Cargando juegos…");

    // Mostrar stats en el hero
    heroStats.innerHTML = `
      <div class="hero-stat">
        <div class="hero-stat-val">${(gamesData.count / 1000).toFixed(0)}k+</div>
        <div class="hero-stat-label">Juegos</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-val">${GENRE_IDS.length}</div>
        <div class="hero-stat-label">Géneros</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-val">4.8★</div>
        <div class="hero-stat-label">Promedio</div>
      </div>`;

    setProgress(90, "Preparando galerías…");

    // Construir secciones de géneros en el DOM
    galleriesEl.innerHTML = "";
    GENRE_IDS.forEach(genre => {
      const section = createGenreSection(genre);
      galleriesEl.appendChild(section);
    });

    setProgress(100, "¡Listo!");

    // Esconder splash y mostrar app
    setTimeout(() => {
      hideSplash();
      app.classList.remove("hidden");

      // Cargar juegos de cada género de forma independiente (no bloquea el render)
      GENRE_IDS.forEach(genre => loadGenreGames(genre));
    }, 400);

  } catch (err) {
    setProgress(100, "");
    hideSplash();
    app.classList.remove("hidden");
    showError(`No se pudo conectar con la API. ${err.message}`);
  }
}

// Botón reintentar
errorRetry.addEventListener("click", () => {
  hideError();
  GENRE_IDS.forEach(genre => loadGenreGames(genre));
});

// Arrancar
init();