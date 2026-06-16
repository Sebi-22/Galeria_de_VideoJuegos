// Inicializamos la Api que tiene api.Key
const API_KEY = "174ef211cdd14c5599e4d6fcf65f56a3";
const BASE_URL = "https://api.rawg.io/api";

// Array de Generos 
const Generos = [
    { id: 4,  nombre: "Acción",     emoji: "⚔️" },
    { id: 5,  nombre: "RPG",        emoji: "🧙" },
    { id: 51, nombre: "Indie",      emoji: "🎮" },
    { id: 2,  nombre: "Estrategia", emoji: "♟️" },
    { id: 3,  nombre: "Aventura",   emoji: "🗺️" },
    { id: 7,  nombre: "Puzzle",     emoji: "🧩" },  
    { id: 15, nombre: "Deportes", emoji: "⚽" },
];

// Referencias al DOM
const splash          = document.getElementById("splash");
const splashTexto     = document.getElementById("splash-texto");
const app             = document.getElementById("app");
const galerias        = document.getElementById("galerias");
const bannerError     = document.getElementById("banner-error");
const bannerErrorMsg  = document.getElementById("banner-error-msg");
const btnReintentar   = document.getElementById("btn-reintentar");
const buscadorInput   = document.getElementById("buscador-input");
const buscadorBtn     = document.getElementById("buscador-btn");
const seccionBusqueda = document.getElementById("seccion-busqueda");
const gridBusqueda    = document.getElementById("grid-busqueda");
const btnCerrarBusq   = document.getElementById("btn-cerrar-busqueda");

//Fetch 
function llamarAPI(endpoint)
{
    return fetch(BASE_URL + endpoint + "&key=" + API_KEY);
}
// Loader de carga pricipal
function ocultarSplash()
{
    splash.classList.add("splash-salida");
    setTimeout(function()
    {
        splash.style.display = "none";
    }, 600);
}
// Error 
function mostrarError(mensaje)
{
    bannerErrorMsg.textContent = mensaje;
    bannerError.classList.add("visible");
}

function ocultarError()
{
    bannerError.classList.remove("visible");
}
//  ESTADO PENDIENTE (cards grises mientras carga)
function mostrarPendiente(gridEl)
{
    let html = '<div class="games-grid">';

    for (let i = 0; i < 5; i++)
    {
        html += `
        <div class="card-pendiente">
            <div class="pendiente-img"></div>
            <div class="pendiente-body">
                <div class="pendiente-linea ancho80"></div>
                <div class="pendiente-linea ancho50"></div>
            </div>
        </div>`;
    }

    html += "</div>";
    gridEl.innerHTML = html;
}
// Tarjetas de los juegos
function crearTarjetaJuego(juego)
{
    let imagenHTML = "";

    if (juego.background_image)
    {
        imagenHTML = `<img class="card-img" src="${juego.background_image}" alt="${juego.name}" loading="lazy">`;
    }
    else
    {
        imagenHTML = `<div class="card-img-placeholder">🎮</div>`;
    }

    let año = "—";
    if (juego.released)
    {
        año = juego.released;
    }

    let rating = "Sin rating";
    if (juego.rating)
    {
        rating = "⭐ " + juego.rating;
    }
    return `
    <a class="card" href="game.html?id=${juego.id}">
        ${imagenHTML}
        <div class="card-body">
            <h3 class="card-titulo">${juego.name}</h3>
            <p class="card-meta">${año}</p>
            <p class="card-rating">${rating}</p>
        </div>
    </a>`;
}

// Juegos por genero
function cargarJuegosDeGenero(genero)
{
    const gridEl  = document.getElementById("grid-" + genero.id);
    const countEl = document.getElementById("count-" + genero.id);

    // Estado pendiente: mostrar cards grises
    mostrarPendiente(gridEl);

    llamarAPI("/games?genres=" + genero.id + "&page_size=8&ordering=-rating")
        .then(function(response)
        {
            return response.json();
        })
        .then(function(data)
        {
            // Estado resuelto: mostrar juegos
            countEl.textContent = data.count + " juegos";
            gridEl.innerHTML = "";

            if (data.results.length === 0)
            {
                gridEl.innerHTML = "<p class='sin-resultados'>No hay juegos disponibles.</p>";
                return;
            }

            let html = '<div class="games-grid">';

            for (let i = 0; i < data.results.length; i++)
            {
                html += crearTarjetaJuego(data.results[i]);
            }

            html += "</div>";
            gridEl.innerHTML = html;
        })
        .catch(function(error)
        {
            // Estado rechazado: mostrar error
            gridEl.innerHTML = `
            <div class="error-inline">
                ⚠️ No se pudo cargar ${genero.nombre}. ${error.message}
            </div>`;
        });
}

// Secciones de generos
function construirGalerias()
{
    galerias.innerHTML = "";

    for (let i = 0; i < Generos.length; i++)
    {
        galerias.innerHTML += `
        <section class="genero-seccion">
            <div class="genero-header">
                <h3 class="genero-nombre">
                    ${Generos[i].emoji} ${Generos[i].nombre}
                    <span class="genero-count" id="count-${Generos[i].id}"></span>
                </h3>
            </div>
            <div id="grid-${Generos[i].id}"></div>
        </section>`;
    }

    for (let i = 0; i < Generos.length; i++)
    {
        cargarJuegosDeGenero(Generos[i]);
    }
}
// Buscador de los juegos
function realizarBusqueda()
{
    const query = buscadorInput.value.trim(); // trim elimina los espacios

    if (query === "")
    {
        seccionBusqueda.classList.add("oculto");
        return;
    }

    seccionBusqueda.classList.remove("oculto");
    mostrarPendiente(gridBusqueda);

    llamarAPI("/games?search=" + query + "&page_size=8")
        .then(function(response)
        {
            return response.json();
        })
        .then(function(data)
        {
            gridBusqueda.innerHTML = "";

            if (data.results.length === 0)
            {
                gridBusqueda.innerHTML = "<p class='sin-resultados'>Sin resultados para \"" + query + "\".</p>";
                return;
            }

            let html = '<div class="games-grid">';

            for (let i = 0; i < data.results.length; i++)
            {
                html += crearTarjetaJuego(data.results[i]);
            }

            html += "</div>";
            gridBusqueda.innerHTML = html;
        })
        .catch(function(error)
        {
            gridBusqueda.innerHTML = "<p class='error-inline'>Error al buscar: " + error.message + "</p>";
        });
}

buscadorBtn.addEventListener("click", realizarBusqueda);

buscadorInput.addEventListener("keydown", function(e)
{
    if (e.key === "Enter")
    {
        realizarBusqueda();
    }
});

btnCerrarBusq.addEventListener("click", function()
{
    seccionBusqueda.classList.add("oculto");
    buscadorInput.value = "";
});

// Volver a cargar los juegos
btnReintentar.addEventListener("click", function()
{
    ocultarError();
    construirGalerias();
});

// Incio de la pagina
function init()
{
    splashTexto.textContent = "Conectando con RAWG...";

    llamarAPI("/games?page_size=1")
        .then(function(response)
        {
            return response.json();
        })
        .then(function(data)
        {
            splashTexto.textContent = "¡Listo!";

            setTimeout(function()
            {
                ocultarSplash();
                app.classList.remove("oculto");
                construirGalerias();
            }, 400);
        })
        .catch(function(error)
        {
            ocultarSplash();
            app.classList.remove("oculto");
            mostrarError("No se pudo conectar con la API. " + error.message);
        });
}

init();