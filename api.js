/* ════════════════════════════════════════════
   AUTOPARTS MX — api.js v4.3
   Imágenes servidas directamente desde img/productos/
════════════════════════════════════════════ */

let allProducts  = [];
let activeFilter = 'all';
let sortOrder    = 'default';

const STOCK_CLASSES = { 'En stock':'in-stock', 'Pocas piezas':'low-stock', 'Sin stock':'no-stock' };
const CAT_EMOJIS    = { 'Motor':'🔧', 'Frenos':'🛞', 'Eléctrico':'⚡', 'Suspensión':'🚗', 'Performance':'🏁' };

/* ═══════════════════════════════════
   1. CARGA PRODUCTOS DESDE productos.json
═══════════════════════════════════ */
async function fetchProducts() {
  const grid    = document.getElementById('productsGrid');
  const load    = document.getElementById('loadingProducts');
  const badge   = document.getElementById('apiStatusBadge');
  const countEl = document.getElementById('catalogCount');

  if (grid)  grid.innerHTML = '';
  if (load)  load.style.display = 'flex';
  if (badge) badge.style.display = 'none';

  try {
    const res  = await fetch('productos.json');
    const data = await res.json();
    allProducts = data.productos || data;

    if (badge) {
      badge.style.display = 'inline-flex';
      badge.className     = 'api-status ok';
      document.getElementById('apiStatusText').textContent = 'Catálogo cargado ✓';
    }
    if (countEl) countEl.textContent = `${allProducts.length} productos`;

    const catParam = new URLSearchParams(window.location.search).get('cat');
    if (catParam) {
      activeFilter = catParam;
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.cat === catParam);
      });
    }

    gaEvent('catalog_load', { products: allProducts.length });

  } catch (err) {
    console.warn('Error cargando productos.json:', err);
    if (badge) {
      badge.style.display = 'inline-flex';
      badge.className     = 'api-status err';
      document.getElementById('apiStatusText').textContent = 'Error de conexión';
    }
    gaEvent('catalog_error');
  }

  if (load) load.style.display = 'none';
  filterAndRender();
}

/* ═══════════════════════════════════
   2. FILTRADO + ORDENAMIENTO
═══════════════════════════════════ */
function filterAndRender() {
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
  let lista = [...allProducts];

  if (activeFilter !== 'all')
    lista = lista.filter(p => p.categoria === activeFilter);

  if (q) lista = lista.filter(p =>
    p.nombre.toLowerCase().includes(q) ||
    p.marca.toLowerCase().includes(q)  ||
    p.sku.toLowerCase().includes(q)    ||
    (p.descripcion    && p.descripcion.toLowerCase().includes(q)) ||
    (p.compatibilidad && p.compatibilidad.join(' ').toLowerCase().includes(q))
  );

  if (sortOrder === 'precio-asc')  lista.sort((a,b) => a.precio - b.precio);
  if (sortOrder === 'precio-desc') lista.sort((a,b) => b.precio - a.precio);
  if (sortOrder === 'nombre')      lista.sort((a,b) => a.nombre.localeCompare(b.nombre));
  if (sortOrder === 'nuevo')       lista = lista.filter(p => p.nuevo).concat(lista.filter(p => !p.nuevo));

  const countEl = document.getElementById('catalogCount');
  if (countEl) countEl.textContent = `${lista.length} producto${lista.length !== 1 ? 's' : ''}`;

  renderProducts(lista);
}

function filterProducts() { filterAndRender(); }

function setFilter(cat, btn) {
  activeFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  filterAndRender();
  gaEvent('filter_category', { category: cat });
}

function setSort(val) {
  sortOrder = val;
  filterAndRender();
}

/* ═══════════════════════════════════
   3. RENDER TARJETAS
   imagen.php?id={id} sirve el JPG via PHP
═══════════════════════════════════ */
function renderProducts(lista) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  if (!lista.length) {
    grid.innerHTML = `<p style="color:var(--muted);font-size:.9rem;grid-column:1/-1;padding:40px 0">No se encontraron refacciones con esos criterios.</p>`;
    return;
  }

  grid.innerHTML = lista.map(p => {
    const stockCls = STOCK_CLASSES[p.stock] || 'in-stock';
    const emoji    = CAT_EMOJIS[p.categoria] || '🔩';

    // Ruta directa — imágenes en la carpeta img/
    const imgSrc = `img/${p.id}.jpg`;

    const precioAnteriorHtml = p.precio_anterior
      ? `<div class="product-price-old">$${Number(p.precio_anterior).toLocaleString('es-MX', {minimumFractionDigits:2})}</div>`
      : '';

    return `
      <div class="product-card">
        <div class="product-thumb">
          <img
            src="${imgSrc}"
            alt="${p.nombre}"
            loading="lazy"
            onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex';"
          />
          <span class="img-fallback" style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;font-size:4rem;background:var(--surface);">${emoji}</span>
          <span class="stock-badge ${stockCls}">${p.stock}</span>
          ${p.nuevo ? '<span class="new-badge">NUEVO</span>' : ''}
        </div>
        <div class="product-info">
          <div class="product-brand">${p.marca} · ${p.categoria}</div>
          <div class="product-name">${p.nombre}</div>
          <div class="product-desc">${p.descripcion || ''}</div>
          <div class="product-sku">SKU: ${p.sku} · ${p.origen || ''}</div>
          <div class="product-footer">
            <div class="product-price-wrap">
              ${precioAnteriorHtml}
              <div class="product-price">$${Number(p.precio).toLocaleString('es-MX', {minimumFractionDigits:2})}</div>
            </div>
            <button class="product-btn"
              onclick="gaEvent('cotizar',{item_id:'${p.sku}',item_name:'${p.nombre.replace(/'/g,"&#39;")}',value:${p.precio}})">
              + Cotizar
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}
