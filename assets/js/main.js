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

