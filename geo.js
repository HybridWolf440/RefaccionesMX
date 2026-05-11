/* ════════════════════════════════════════════
   AUTOPARTS MX — Geolocalización v2.0
   Archivo: geo.js

   SOLUCIÓN SIN SSL:
   Usa IP Geolocation (ip-api.com) como método principal.
   Funciona con HTTP sin certificado SSL.
   Si el sitio tiene HTTPS en el futuro, automáticamente
   usa el GPS del dispositivo para mayor precisión.
════════════════════════════════════════════ */

const SUCURSALES = [
  { nombre: 'AutoParts MX — Centro',       lat: 31.7384, lng: -106.4872 },
  { nombre: 'AutoParts MX — Juárez Norte', lat: 31.7700, lng: -106.5000 },
  { nombre: 'AutoParts MX — PRONAF',       lat: 31.7250, lng: -106.4600 },
  { nombre: 'AutoParts MX — Periférico',   lat: 31.6950, lng: -106.4200 }
];

let userCoords = null;

/* ══════════════════════════════════════════
   BOTÓN PRINCIPAL — detecta el mejor método
══════════════════════════════════════════ */
function requestGeo() {
  const btn = document.getElementById('geoBtn');
  btn.disabled  = true;
  btn.innerHTML = '<span class="geo-btn-icon">⏳</span> OBTENIENDO UBICACIÓN…';

  setGeoValue('geoCity',   'Detectando…', true);
  setGeoValue('geoCoords', 'Detectando…', true);
  setGeoValue('geoAlt',    'No disponible');

  const esHTTPS = location.protocol === 'https:';

  if (esHTTPS && navigator.geolocation) {
    // HTTPS disponible → usar GPS del navegador (máxima precisión)
    navigator.geolocation.getCurrentPosition(onGeoSuccessGPS, onGeoErrorGPS, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  } else {
    // HTTP sin SSL → usar IP Geolocation (funciona siempre)
    usarIPGeolocation();
  }
}

/* ══════════════════════════════════════════
   MÉTODO 1 — IP GEOLOCATION (HTTP/HTTPS)
   Usa ip-api.com: gratis, sin key, sin SSL
══════════════════════════════════════════ */
async function usarIPGeolocation() {
  try {
    // ip-api.com responde con HTTP y HTTPS
    const res  = await fetch('http://ip-api.com/json/?lang=es&fields=status,city,regionName,country,lat,lon,isp,query');
    const data = await res.json();

    if (data.status !== 'success') throw new Error('IP API falló');

    const lat = data.lat;
    const lng = data.lon;
    userCoords = { lat, lng };

    // Ciudad y región
    setGeoValue('geoCity',
      `${data.city}, ${data.regionName} — ${data.country}`);

    // Coordenadas aproximadas por IP
    setGeoValue('geoCoords',
      `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° O`);

    // Badge: precisión por IP es siempre "ciudad"
    mostrarBadgePrecision('ip');

    // Sucursales cercanas
    const cercanas = calcularSucursalesCercanas(lat, lng);
    renderSucursales(cercanas);

    // Mapa
    updateMap(lat, lng);

    // Restaurar botón
    const btn = document.getElementById('geoBtn');
    btn.disabled  = false;
    btn.innerHTML = '<span class="geo-btn-icon">🔄</span> ACTUALIZAR UBICACIÓN';

    gaEvent('geolocation_ip_success', { city: data.city });

  } catch (err) {
    console.warn('IP Geolocation falló, intentando proxy PHP…', err);
    usarPHPProxy();
  }
}

/* ══════════════════════════════════════════
   MÉTODO 2 — PHP PROXY (respaldo)
   Si ip-api.com falla, el servidor PHP lo llama
══════════════════════════════════════════ */
async function usarPHPProxy() {
  try {
    const res  = await fetch('geoip.php');
    const data = await res.json();

    if (!data.lat) throw new Error('PHP proxy sin datos');

    const lat = parseFloat(data.lat);
    const lng  = parseFloat(data.lon);
    userCoords = { lat, lng };

    setGeoValue('geoCity',   `${data.city}, ${data.regionName} — ${data.country}`);
    setGeoValue('geoCoords', `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° O`);
    mostrarBadgePrecision('ip');

    const cercanas = calcularSucursalesCercanas(lat, lng);
    renderSucursales(cercanas);
    updateMap(lat, lng);

    const btn = document.getElementById('geoBtn');
    btn.disabled  = false;
    btn.innerHTML = '<span class="geo-btn-icon">🔄</span> ACTUALIZAR UBICACIÓN';

    gaEvent('geolocation_php_success', { city: data.city });

  } catch (err) {
    console.warn('PHP proxy también falló:', err);
    showGeoError('No se pudo detectar la ubicación. Verifica tu conexión.');
    const btn = document.getElementById('geoBtn');
    btn.disabled  = false;
    btn.innerHTML = '<span class="geo-btn-icon">📍</span> REINTENTAR';
  }
}

/* ══════════════════════════════════════════
   MÉTODO 3 — GPS del navegador (solo HTTPS)
══════════════════════════════════════════ */
async function onGeoSuccessGPS(pos) {
  const { latitude, longitude, altitude, accuracy } = pos.coords;
  userCoords = { lat: latitude, lng: longitude };

  setGeoValue('geoCoords',
    `${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° O`);
  setGeoValue('geoAlt',
    altitude ? `${Math.round(altitude)} m s.n.m.` : 'No disponible');

  mostrarBadgePrecision('gps', accuracy);

  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=es`
    );
    const geo  = await resp.json();
    const addr = geo.address || {};
    const city = addr.city || addr.town || addr.village || addr.county || 'Ciudad no detectada';
    setGeoValue('geoCity',
      `${city}${addr.state ? ', '+addr.state : ''}${addr.country ? ' — '+addr.country : ''}`);
  } catch {
    setGeoValue('geoCity', 'No se pudo obtener ciudad');
  }

  const cercanas = calcularSucursalesCercanas(latitude, longitude);
  renderSucursales(cercanas);
  updateMap(latitude, longitude);

  const btn = document.getElementById('geoBtn');
  btn.disabled  = false;
  btn.innerHTML = '<span class="geo-btn-icon">🔄</span> ACTUALIZAR UBICACIÓN';

  gaEvent('geolocation_gps_success', { accuracy: Math.round(accuracy) });
}

function onGeoErrorGPS(err) {
  // Si GPS falla en HTTPS, intentar por IP
  console.warn('GPS falló, usando IP geolocation…', err);
  usarIPGeolocation();
}

/* ══════════════════════════════════════════
   BADGE DE PRECISIÓN
══════════════════════════════════════════ */
function mostrarBadgePrecision(metodo, accuracy) {
  const accEl = document.getElementById('geoAccuracy');
  if (!accEl) return;

  accEl.innerHTML = '';
  const dot = document.createElement('span');
  dot.className = 'geo-dot';

  let clase = 'med';
  let texto = '';

  if (metodo === 'gps') {
    if (accuracy < 50)       { clase = 'ok';  texto = ` Alta precisión GPS (±${Math.round(accuracy)}m)`; }
    else if (accuracy < 200) { clase = 'med'; texto = ` Media precisión GPS (±${Math.round(accuracy)}m)`; }
    else                     { clase = 'low'; texto = ` Baja precisión GPS (±${Math.round(accuracy)}m)`; }
  } else {
    clase = 'med';
    texto = ' Precisión por IP (nivel ciudad)';
  }

  accEl.className = `geo-accuracy ${clase}`;
  accEl.appendChild(dot);
  accEl.appendChild(document.createTextNode(texto));
  accEl.style.display = 'inline-flex';
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
   RENDER SUCURSALES
══════════════════════════════════════════ */
function renderSucursales(lista) {
  const wrap = document.getElementById('geoBranches');
  if (wrap) wrap.style.display = 'block';
  const listEl = document.getElementById('geoBranchesList');
  if (!listEl) return;
  listEl.innerHTML = lista.map(s => `
    <div class="branch-item">
      <span class="branch-name">📍 ${s.nombre}</span>
      <span class="branch-dist">${s.distancia.toFixed(1)} km</span>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════
   MAPA OpenStreetMap
══════════════════════════════════════════ */
function updateMap(lat, lng) {
  const placeholder = document.getElementById('geoMapPlaceholder');
  const mapFrame    = document.getElementById('geoMapFrame');
  const liveBadge   = document.getElementById('geoLiveBadge');

  mapFrame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-.02},${lat-.02},${lng+.02},${lat+.02}&layer=mapnik&marker=${lat},${lng}`;

  if (placeholder) placeholder.style.display = 'none';
  if (mapFrame)    mapFrame.style.display     = 'block';
  if (liveBadge)   liveBadge.classList.add('visible');
}

/* ══════════════════════════════════════════
   ERROR GENERAL
══════════════════════════════════════════ */
function showGeoError(msg) {
  setGeoValue('geoCity',   msg);
  setGeoValue('geoCoords', '—');
  setGeoValue('geoAlt',    '—');
}

function setGeoValue(id, text, isLoading = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className   = 'geo-row-value' + (isLoading ? ' loading' : '');
}
