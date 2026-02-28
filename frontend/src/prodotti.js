import { getProducts, getCategories } from './api.js';

function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}

function escapeHtml(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

let allCategories = [];
let activeCategory = null; // { id, name } oppure null = tutti

/** Renderizza la sidebar con le categorie (accordion stile Huawei). */
function renderSidebar() {
  const nav = document.getElementById('category-nav');
  if (!nav) return;

  let html = `<div class="catalog-cat-group">
    <div class="catalog-cat-head ${!activeCategory ? 'active' : ''}" data-action="all">
      Tutti i prodotti
    </div>
  </div>`;

  allCategories.forEach((cat) => {
    const children = Array.isArray(cat.children) ? cat.children.filter((c) => c.is_active) : [];
    const isActiveCat = activeCategory && String(activeCategory.id) === String(cat.id);
    const isActiveChild = children.some((c) => activeCategory && String(activeCategory.id) === String(c.id));
    const isOpen = isActiveCat || isActiveChild;

    if (children.length > 0) {
      html += `<div class="catalog-cat-group">
        <div class="catalog-cat-head ${isOpen ? 'open' : ''} ${isActiveCat ? 'active' : ''}"
             data-cat-id="${cat.id}" data-cat-name="${escapeHtml(cat.name)}" data-has-children="1">
          <span>${escapeHtml(cat.name)}</span>
          <span class="catalog-cat-icon">${isOpen ? '−' : '+'}</span>
        </div>
        <div class="catalog-cat-children ${isOpen ? 'open' : ''}">
          ${children
            .map(
              (child) => `
            <button class="catalog-cat-child ${activeCategory && String(activeCategory.id) === String(child.id) ? 'active' : ''}"
                    data-cat-id="${child.id}" data-cat-name="${escapeHtml(child.name)}">
              ${escapeHtml(child.name)}
            </button>`
            )
            .join('')}
        </div>
      </div>`;
    } else {
      html += `<div class="catalog-cat-group">
        <div class="catalog-cat-head ${isActiveCat ? 'active' : ''}"
             data-cat-id="${cat.id}" data-cat-name="${escapeHtml(cat.name)}">
          ${escapeHtml(cat.name)}
        </div>
      </div>`;
    }
  });

  nav.innerHTML = html;

  /* ── Event listeners ── */
  nav.querySelectorAll('.catalog-cat-head').forEach((el) => {
    el.addEventListener('click', () => {
      if (el.dataset.action === 'all') {
        activeCategory = null;
        renderSidebar();
        loadProducts();
        return;
      }

      const hasChildren = el.dataset.hasChildren === '1';

      if (hasChildren) {
        // Apri/chiudi accordion senza filtrare
        el.classList.toggle('open');
        const childrenDiv = el.nextElementSibling;
        if (childrenDiv) childrenDiv.classList.toggle('open');
        const icon = el.querySelector('.catalog-cat-icon');
        if (icon) icon.textContent = el.classList.contains('open') ? '−' : '+';
      } else {
        // Filtro diretto
        activeCategory = { id: el.dataset.catId, name: el.dataset.catName };
        renderSidebar();
        loadProducts();
      }
    });
  });

  nav.querySelectorAll('.catalog-cat-child').forEach((el) => {
    el.addEventListener('click', () => {
      activeCategory = { id: el.dataset.catId, name: el.dataset.catName };
      renderSidebar();
      loadProducts();
    });
  });
}

/** Renderizza la griglia prodotti in stile Huawei. */
function renderProducts(list) {
  const grid = document.getElementById('products-grid');
  const empty = document.getElementById('products-empty');
  const count = document.getElementById('catalog-count');
  const title = document.getElementById('catalog-title');

  if (!grid || !empty) return;

  if (title) title.textContent = activeCategory ? activeCategory.name : 'Tutti i prodotti';
  if (count) count.textContent = list.length ? `(${list.length})` : '';

  if (!list.length) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  grid.innerHTML = list
    .map((p) => {
      const img = p.media && p.media[0];
      const modelHtml = p.model_name
        ? `<p class="hw-pcard-model">${escapeHtml(p.model_name)}</p>`
        : '';
      return `
        <a href="./prodotto.html?slug=${encodeURIComponent(p.slug)}" class="hw-pcard">
          <div class="hw-pcard-img">
            ${
              img && img.url
                ? `<img src="${img.url}" alt="${escapeHtml(img.alt || p.name)}" loading="lazy" />`
                : `<div class="hw-pcard-placeholder"></div>`
            }
          </div>
          <div class="hw-pcard-body">
            <h3 class="hw-pcard-name">${escapeHtml(p.name)}</h3>
            ${modelHtml}
            <span class="hw-pcard-link">Scopri di più</span>
          </div>
        </a>`;
    })
    .join('');
}

/** Carica prodotti (con eventuale filtro categoria). */
async function loadProducts() {
  const grid = document.getElementById('products-grid');
  if (grid) grid.innerHTML = '<p class="catalog-loading">Caricamento...</p>';

  try {
    const params = {};
    if (activeCategory) params.category_id = activeCategory.id;
    const res = await getProducts(params);
    renderProducts(Array.isArray(res.data) ? res.data : []);
  } catch {
    const empty = document.getElementById('products-empty');
    if (grid) grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
  }
}

/** Inizializzazione principale. */
async function init() {
  setYear();

  // Leggi eventuale category_id dalla querystring
  const qs = new URLSearchParams(window.location.search);
  const catId = qs.get('category_id');

  try {
    const [catRes, prodRes] = await Promise.all([
      getCategories().catch(() => ({ data: [] })),
      getProducts(catId ? { category_id: catId } : {}).catch(() => ({ data: [] }))
    ]);

    allCategories = Array.isArray(catRes.data) ? catRes.data.filter((c) => c.is_active) : [];

    // Pre-seleziona categoria da URL
    if (catId) {
      outer: for (const cat of allCategories) {
        if (String(cat.id) === catId) {
          activeCategory = { id: catId, name: cat.name };
          break;
        }
        const children = Array.isArray(cat.children) ? cat.children : [];
        for (const child of children) {
          if (String(child.id) === catId) {
            activeCategory = { id: catId, name: child.name };
            break outer;
          }
        }
      }
    }

    renderSidebar();
    renderProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
  } catch (err) {
    console.error('Errore inizializzazione prodotti', err);
  }
}

init();
