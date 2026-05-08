/* ════════════════════════════════════════════
   AUTOPARTS MX — Geolocalización
   Archivo: geo.js
════════════════════════════════════════════ */

// Sucursales de la tienda (coordenadas reales — ajusta a las tuyas)
const SUCURSALES = [
  { nombre: 'AutoParts MX — Centro',       lat: 31.7384, lng: -106.4872 },
  { nombre: 'AutoParts MX — Juárez Norte', lat: 31.7700, lng: -106.5000 },
  { nombre: 'AutoParts MX — PRONAF',       lat: 31.7250, lng: -106.4600 },
  { nombre: 'AutoParts MX — Periférico',   lat: 31.6950, lng: -106.4200 }
];

let userCoords = null;

/* ══════════════════════════════════════════
   INICIA GEOLOCALIZACIÓN AL HACER CLIC
══════════════════════════════════════════ */
function requestGeo() {
  const btn = document.getElementById('geoBtn');

  if (!navigator.geolocation) {
    showGeoError('Tu navegador no soporta geolocalización.');
    return;
  }

  // Estado: cargando
  btn.disabled   = true;
  btn.innerHTML  = '<span class="geo-btn-icon">⏳</span> OBTENIENDO UBICACIÓN…';
  setGeoValue('geoCity',    'Detectando…', true);
  setGeoValue('geoCoords',  'Detectando…', true);
  setGeoValue('geoAlt',     'Detectando…', true);
  setGeoValue('geoAccuracy','Detectando…', true);

  navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError, {
    enableHighAccuracy: true,
    timeout:            10000,
    maximumAge:         0
  });
}

/* ══════════════════════════════════════════
   ÉXITO — procesa y muestra datos
══════════════════════════════════════════ */
async function onGeoSuccess(pos) {
  const { latitude, longitude, altitude, accuracy } = pos.coords;
  userCoords = { lat: latitude, lng: longitude };

  // ── 1. Coordenadas y altitud ──
  setGeoValue('geoCoords',
    `${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° O`);

  setGeoValue('geoAlt',
    altitude ? `${Math.round(altitude)} m s.n.m.` : 'No disponible');

  // ── 2. Badge de precisión ──
  const accEl = document.getElementById('geoAccuracy');
  accEl.textContent = '';
  const dot = document.createElement('span');
  dot.className = 'geo-dot';
  const txt = document.createTextNode(
    accuracy < 50  ? ` Alta precisión (±${Math.round(accuracy)}m)`  :
    accuracy < 200 ? ` Media precisión (±${Math.round(accuracy)}m)` :
                     ` Baja precisión (±${Math.round(accuracy)}m)`
  );
  accEl.className = 'geo-accuracy ' + (
    accuracy < 50 ? 'ok' : accuracy < 200 ? 'med' : 'low'
  );
  accEl.appendChild(dot);
  accEl.appendChild(txt);
  accEl.style.display = 'inline-flex';

  // ── 3. Reverse geocoding con Nominatim (OpenStreetMap — 100% gratis) ──
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=es`,
      { headers: { 'Accept-Language': 'es' } }
    );
    const geo  = await resp.json();
    const addr = geo.address || {};
    const city = addr.city || addr.town || addr.village || addr.county || 'Ciudad no detectada';
    const state= addr.state || '';
    const country = addr.country || '';
    setGeoValue('geoCity', `${city}${state ? ', '+state : ''}${country ? ' — '+country : ''}`);
  } catch {
    setGeoValue('geoCity', 'No se pudo obtener ciudad');
  }

  // ── 4. Sucursal más cercana ──
  const cercanas = calcularSucursalesCercanas(latitude, longitude);
  renderSucursales(cercanas);

  // ── 5. Actualizar mapa (OpenStreetMap embed) ──
  updateMap(latitude, longitude);

  // ── 6. Restaurar botón ──
  const btn = document.getElementById('geoBtn');
  btn.disabled  = false;
  btn.innerHTML = '<span class="geo-btn-icon">🔄</span> ACTUALIZAR UBICACIÓN';

  gaEvent('geolocation_success', {
    city:     document.getElementById('geoCity').textContent,
    accuracy: Math.round(accuracy)
  });
}

/* ══════════════════════════════════════════
   ERROR DE GEOLOCALIZACIÓN
══════════════════════════════════════════ */
function onGeoError(err) {
  const msgs = {
    1: 'Permiso denegado. Activa la ubicación en tu navegador.',
    2: 'Posición no disponible. Verifica tu conexión.',
    3: 'Tiempo de espera agotado. Intenta de nuevo.'
  };
  showGeoError(msgs[err.code] || 'Error desconocido.');

  const btn = document.getElementById('geoBtn');
  btn.disabled  = false;
  btn.innerHTML = '<span class="geo-btn-icon">📍</span> REINTENTAR';

  gaEvent('geolocation_error', { code: err.code });
}

function showGeoError(msg) {
  setGeoValue('geoCity',     msg);
  setGeoValue('geoCoords',   '—');
  setGeoValue('geoAlt',      '—');
  setGeoValue('geoAccuracy', '—');
}

/* ══════════════════════════════════════════
   DISTANCIA HAVERSINE (km)
══════════════════════════════════════════ */
function haversine(lat1, lng1, lat2, lng2) {
  const R  = 6371;
  const dL = (lat2 - lat1) * Math.PI / 180;
  const dG = (lng2 - lng1) * Math.PI / 180;
  const a  = Math.sin(dL/2)**2 +
             Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dG/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function calcularSucursalesCercanas(lat, lng) {
  return SUCURSALES
    .map(s => ({ ...s, distancia: haversine(lat, lng, s.lat, s.lng) }))
    .sort((a, b) => a.distancia - b.distancia);
}

/* ══════════════════════════════════════════
   RENDER SUCURSALES CERCANAS
══════════════════════════════════════════ */
function renderSucursales(lista) {
  const wrap = document.getElementById('geoBranches');
  wrap.style.display = 'block';
  document.getElementById('geoBranchesList').innerHTML = lista.map(s => `
    <div class="branch-item">
      <span class="branch-name">📍 ${s.nombre}</span>
      <span class="branch-dist">${s.distancia.toFixed(1)} km</span>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════
   ACTUALIZAR MAPA (OpenStreetMap embed)
══════════════════════════════════════════ */
function updateMap(lat, lng) {
  const placeholder = document.getElementById('geoMapPlaceholder');
  const mapFrame    = document.getElementById('geoMapFrame');
  const liveBadge   = document.getElementById('geoLiveBadge');

  // Zoom 15 centrado en el usuario con marcador
  mapFrame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-.02},${lat-.02},${lng+.02},${lat+.02}&layer=mapnik&marker=${lat},${lng}`;

  placeholder.style.display = 'none';
  mapFrame.style.display    = 'block';
  liveBadge.classList.add('visible');
}

/* ══════════════════════════════════════════
   HELPERS DOM
══════════════════════════════════════════ */
function setGeoValue(id, text, isLoading = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className   = 'geo-row-value' + (isLoading ? ' loading' : '');
}
