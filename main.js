'use strict';

// ── Config ────────────────────────────────────────────────────────────────────
const CONFIG = {
  API_BASE: 'https://api.openweathermap.org/data/2.5/weather',
  API_KEY:  'b08daf2c9c63883af713e551803a1606',
  UNITS:    'metric',
};

// ── DOM refs (cached once) ────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const DOM = {
  form:        document.querySelector('#city-form'),
  input:       $('search-input'),
  loading:     document.querySelector('.loading'),
  error:       document.querySelector('.error'),
  weather:     document.querySelector('.weather'),
  behavior:    $('behavior'),
  icon:        $('weather-icon'),
  temp:        $('temp'),
  humidity:    $('humidity'),
  windSpeed:   $('wind-speed'),
  city:        $('city'),
};

// ── State ─────────────────────────────────────────────────────────────────────
let isLoading = false;

// ── Event listener ────────────────────────────────────────────────────────────
DOM.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = DOM.input.value.trim();
  if (!city || isLoading) return;
  await fetchAndRender(city);
});

// ── Core flow ─────────────────────────────────────────────────────────────────
async function fetchAndRender(city) {
  setLoadingState(true);

  const data = await getWeatherData(city);

  setLoadingState(false);

  if (data) {
    renderWeather(data);
  } else {
    DOM.error.hidden = false;
  }
}

// ── API ───────────────────────────────────────────────────────────────────────
function buildUrl(city) {
  const url = new URL(CONFIG.API_BASE);
  url.searchParams.set('q',     city);
  url.searchParams.set('appid', CONFIG.API_KEY);
  url.searchParams.set('units', CONFIG.UNITS);
  return url.href;
}

async function getWeatherData(city) {
  try {
    const res = await fetch(buildUrl(city));
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function setLoadingState(loading) {
  isLoading = loading;
  DOM.loading.hidden  = !loading;
  DOM.error.hidden    = true;
  DOM.weather.hidden  = true;
}

function renderWeather(data) {
  // OpenWeatherMap response shape
  const weatherId   = data.weather?.[0]?.id;
  const description = data.weather?.[0]?.description ?? '';
  const temp        = Math.round(data.main?.temp ?? 0);
  const humidity    = data.main?.humidity ?? 0;
  const windSpeed   = Math.round((data.wind?.speed ?? 0) * 3.6); // m/s → km/h
  const cityName    = data.name ?? '';

  DOM.behavior.textContent  = capitalise(description);
  DOM.temp.textContent      = temp;
  DOM.humidity.textContent  = humidity;
  DOM.windSpeed.textContent = windSpeed;
  DOM.city.textContent      = cityName;
  DOM.city.title            = cityName;

  // Icon — fall back to OWM icon if custom asset unavailable
  const iconCode = data.weather?.[0]?.icon ?? '01d';
  DOM.icon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  DOM.icon.alt = capitalise(description);

  DOM.weather.hidden = false;
}

function capitalise(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}