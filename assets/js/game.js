// Misma API que en main.js
const api_key = "174ef211cdd14c5599e4d6fcf65f56a3";
const base_url = "https://api.rawg.io/api";

// Referencias al DOM
const divCargando  = document.getElementById("detalle-cargando");
const divError     = document.getElementById("detalle-error");
const divContenido = document.getElementById("detalle-contenido");
const errorMsg     = document.getElementById("detalle-error-msg");

// Fetch
function llamarAPI(endpoint)
{
    return fetch(base_url + endpoint + "&key=" + api_key);
}

// Leer el ?id= de la URL
const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");

// Armar el HTML del detalle
function mostrarDetalle(juego, screenshots)
{
    let generosHTML = "";
    for (let i = 0; i < juego.genres.length; i++)
    {
        generosHTML += `<span class="tag">${juego.genres[i].name}</span>`;
    }

    let plataformasHTML = "";
    for (let i = 0; i < juego.platforms.length; i++)
    {
        plataformasHTML += `<span class="tag">${juego.platforms[i].platform.name}</span>`;
    }

    let screenshotsHTML = "";
    for (let i = 0; i < screenshots.length; i++)
    {
        screenshotsHTML += `<img class="screenshot-img" src="${screenshots[i].image}" alt="Captura de ${juego.name}" loading="lazy">`;
    }

    let descripcion = "Sin descripción disponible.";
    if (juego.description_raw)
    {
        descripcion = juego.description_raw;
    }

    let rating = "—";
    if (juego.rating)
    {
        rating = "⭐ " + juego.rating;
    }

    let metacritic = "—";
    if (juego.metacritic)
    {
        metacritic = juego.metacritic + " / 100";
    }

    divContenido.innerHTML = `
    <div id="detalle-hero">
        <img id="detalle-hero-img" src="${juego.background_image}" alt="${juego.name}">
        <div id="detalle-hero-overlay"></div>
        <div id="detalle-hero-info">
            <h2 id="detalle-titulo">${juego.name}</h2>
            <p id="detalle-fecha">${juego.released}</p>
        </div>
    </div>

    <div id="detalle-cuerpo">
        <div class="tags-row">${generosHTML}${plataformasHTML}</div>
        <p id="detalle-descripcion">${descripcion}</p>

        <div id="stats-grid">
            <div class="stat-box">
                <p class="stat-label">Rating</p>
                <p class="stat-valor">${rating}</p>
            </div>
            <div class="stat-box">
                <p class="stat-label">Metacritic</p>
                <p class="stat-valor">${metacritic}</p>
            </div>
            <div class="stat-box">
                <p class="stat-label">Reseñas</p>
                <p class="stat-valor">${juego.ratings_count}</p>
            </div>
            <div class="stat-box">
                <p class="stat-label">Tiempo de juego</p>
                <p class="stat-valor">${juego.playtime}h</p>
            </div>
        </div>

        <h4 class="seccion-subtitulo">Capturas de pantalla</h4>
        <div id="screenshots-grid">${screenshotsHTML}</div>
    </div>`;
}

// Cargar el juego
function cargarDetalle()
{
    if (!gameId)
    {
        divCargando.classList.add("oculto");
        divError.classList.remove("oculto");
        errorMsg.textContent = "No se especificó ningún juego.";
        return;
    }

    llamarAPI("/games/" + gameId + "?")
        .then(function(response)
        {
            return response.json();
        })
        .then(function(juego)
        {
            return llamarAPI("/games/" + gameId + "/screenshots?")
                .then(function(response)
                {
                    return response.json();
                })
                .then(function(dataShots)
                {
                    document.title = juego.name + " — GameVault";
                    divCargando.classList.add("oculto");
                    divContenido.classList.remove("oculto");
                    mostrarDetalle(juego, dataShots.results);
                });
        })
        .catch(function(error)
        {
            divCargando.classList.add("oculto");
            divError.classList.remove("oculto");
            errorMsg.textContent = error.message;
        });
}

cargarDetalle();