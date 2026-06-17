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
    { id: 15, nombre: "Deportes",   emoji: "⚽" },
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

// Fetch
function llamarAPI(endpoint)
{
    return fetch(BASE_URL + endpoint + "&key=" + API_KEY);
}

// Splash
function ocultarSplash()
{
    splash.classList.add("splash-salida");
    setTimeout(function()
    {
        splash.style.display = "none";
    }, 600);
}

// Error global
function mostrarError(mensaje)
{
    bannerErrorMsg.textContent = mensaje;
    bannerError.classList.add("visible");
}

function ocultarError()
{
    bannerError.classList.remove("visible");
}

// Estado pendiente
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

// Tarjetas de juegos
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

// Cargar juegos de un género
function cargarJuegosDeGenero(genero)
{
    const gridEl  = document.getElementById("grid-" + genero.id);
    const countEl = document.getElementById("count-" + genero.id);

    mostrarPendiente(gridEl);

    let pagina = 2;

    llamarAPI("/games?genres=" + genero.id + "&page_size=8&ordering=-rating")
        .then(function(response)
        {
            return response.json();
        })
        .then(function(data)
        {
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

            const btnVerMas = document.getElementById("ver-mas-" + genero.id);
            btnVerMas.addEventListener("click", function()
            {
                verMasJuegos(genero, pagina);
                pagina = pagina + 1;
            });
        })
        .catch(function(error)
        {
            gridEl.innerHTML = `
            <div class="error-inline">
                ⚠️ No se pudo cargar ${genero.nombre}. ${error.message}
            </div>`;
        });
}

// Ver más juegos de un género
function verMasJuegos(genero, pagina)
{
    const gridEl    = document.getElementById("grid-" + genero.id);
    const btnVerMas = document.getElementById("ver-mas-" + genero.id);

    btnVerMas.textContent = "Cargando...";
    btnVerMas.disabled = true;

    llamarAPI("/games?genres=" + genero.id + "&page_size=8&ordering=-rating&page=" + pagina)
        .then(function(response)
        {
            return response.json();
        })
        .then(function(data)
        {
            let html = "";

            for (let i = 0; i < data.results.length; i++)
            {
                html += crearTarjetaJuego(data.results[i]);
            }

            gridEl.querySelector(".games-grid").innerHTML += html;

            btnVerMas.textContent = "Ver más";
            btnVerMas.disabled = false;

            if (!data.next)
            {
                btnVerMas.style.display = "none";
            }
        })
        .catch(function(error)
        {
            btnVerMas.textContent = "Error, reintentar";
            btnVerMas.disabled = false;
        });
}

// Construir galerías
function construirGalerias()
{
    galerias.innerHTML = "";

    let htmlTotal = "";

    for (let i = 0; i < Generos.length; i++)
    {
        htmlTotal += `
        <section class="genero-seccion">
            <div class="genero-header">
                <h3 class="genero-nombre">
                    ${Generos[i].emoji} ${Generos[i].nombre}
                    <span class="genero-count" id="count-${Generos[i].id}"></span>
                </h3>
                <button class="btn-ver-mas" id="ver-mas-${Generos[i].id}">Ver más</button>
            </div>
            <div id="grid-${Generos[i].id}"></div>
        </section>`;
    }

    galerias.innerHTML = htmlTotal;

    for (let i = 0; i < Generos.length; i++)
    {
        cargarJuegosDeGenero(Generos[i]);
    }
}

// Buscador
function realizarBusqueda()
{
    const query = buscadorInput.value.trim();// trim (con esto elimino los espacios)

    if (query === "")
    {
        seccionBusqueda.classList.add("oculto");
        galerias.classList.remove("oculto");
        return;
    }

    seccionBusqueda.classList.remove("oculto");
    galerias.classList.add("oculto");
    cerrarSugerencias();
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

// Sugerencias mientras escribís
let timerBusqueda = null;

buscadorInput.addEventListener("input", function()
{
    const query = buscadorInput.value.trim();

    if (query === "")
    {
        cerrarSugerencias();
        return;
    }

    clearTimeout(timerBusqueda);
    timerBusqueda = setTimeout(function()
    {
        llamarAPI("/games?search=" + query + "&page_size=6")
            .then(function(response)
            {
                return response.json();
            })
            .then(function(data)
            {
                mostrarSugerencias(data.results);
            })
            .catch(function(error)
            {
                cerrarSugerencias();
            });
    }, 400);
});

function mostrarSugerencias(juegos)
{
    const lista = document.getElementById("lista-sugerencias");

    if (juegos.length === 0)
    {
        cerrarSugerencias();
        return;
    }

    let html = "";

    for (let i = 0; i < juegos.length; i++)
    {
        let imagen = "";
        if (juegos[i].background_image)
        {
            imagen = juegos[i].background_image;
        }

        let rating = "";
        if (juegos[i].rating)
        {
            rating = "⭐ " + juegos[i].rating;
        }

        html += `
        <div class="sugerencia" data-id="${juegos[i].id}">
            <img class="sugerencia-img" src="${imagen}" alt="${juegos[i].name}">
            <div class="sugerencia-info">
                <span class="sugerencia-nombre">${juegos[i].name}</span>
                <span class="sugerencia-rating">${rating}</span>
            </div>
        </div>`;
    }

    lista.innerHTML = html;
    lista.classList.remove("oculto");

    const items = lista.querySelectorAll(".sugerencia");
    for (let i = 0; i < items.length; i++)
    {
        items[i].addEventListener("click", function()
        {
            const id = items[i].getAttribute("data-id");
            window.location.href = "game.html?id=" + id;
        });
    }
}

function cerrarSugerencias()
{
    const lista = document.getElementById("lista-sugerencias");
    lista.innerHTML = "";
    lista.classList.add("oculto");
}

// Listeners
buscadorBtn.addEventListener("click", realizarBusqueda);

buscadorInput.addEventListener("keydown", function(e)
{
    if (e.key === "Enter")
    {
        cerrarSugerencias();
        realizarBusqueda();
    }
});

btnCerrarBusq.addEventListener("click", function()
{
    seccionBusqueda.classList.add("oculto");
    galerias.classList.remove("oculto");
    buscadorInput.value = "";
    cerrarSugerencias();
});

document.addEventListener("click", function(e)
{
    const wrapper = document.getElementById("buscador-wrapper");
    if (!wrapper.contains(e.target))
    {
        cerrarSugerencias();
    }
});

// Reintentar
btnReintentar.addEventListener("click", function()
{
    ocultarError();
    construirGalerias();
});

// Inicio
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