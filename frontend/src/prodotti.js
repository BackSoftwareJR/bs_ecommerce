import { getProducts, getCategories } from './api.js';

/* ─────────────────────────────────────────
   Stato globale
───────────────────────────────────────── */
let allProducts   = [];   // cache completa caricata al boot
let allCategories = [];
let activeCategory = null; // { id, name } | null
let searchQuery    = '';
let debounceTimer  = null;

/* ─────────────────────────────────────────
   Utility
───────────────────────────────────────── */
function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}

function escapeHtml(s) {
  if (s == null) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

/** Rimuove tag HTML e normalizza spazi. */
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Normalizza per confronto: lowercase, rimuove accenti. */
function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Evidenzia le occorrenze di `query` nel testo già escaped.
 * Restituisce HTML con <mark> intorno ai match.
 */
function highlight(text, query) {
  if (!query || !text) return escapeHtml(text);
  const escaped = escapeHtml(text);
  const safeQ = escapeHtml(query.trim()).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!safeQ) return escaped;
  return escaped.replace(new RegExp(`(${safeQ})`, 'gi'), '<mark class="sh">$1</mark>');
}

/* ─────────────────────────────────────────
   Filtraggio e ricerca
───────────────────────────────────────── */
/**
 * Applica category + search query a `allProducts`.
 * Logica: category AND ogni termine di ricerca (OR su tutti i campi).
 */
function applyFilters() {
  let list = allProducts;

  // 1. Filtro categoria
  if (activeCategory) {
    list = list.filter((p) => String(p.category_id) === String(activeCategory.id));
  }

  // 2. Filtro ricerca
  const q = norm(searchQuery.trim());
  if (q) {
    const terms = q.split(/\s+/).filter(Boolean);
    list = list.filter((p) => {
      const blob = norm([
        p.name,
        p.model_name,
        p.short_description,
        stripHtml(p.description),
        p.category?.name,
        ...(p.tags || []).map((t) => t.name)
      ].join(' '));
      return terms.every((t) => blob.includes(t));
    });

    // Ordina: nome che inizia con il termine prima
    list = list.slice().sort((a, b) => {
      const aStart = norm(a.name).startsWith(q) ? 0 : 1;
      const bStart = norm(b.name).startsWith(q) ? 0 : 1;
      return aStart - bStart;
    });
  }

  return list;
}

/* ─────────────────────────────────────────
   Render prodotti
───────────────────────────────────────── */
function renderProducts() {
  const grid  = document.getElementById('products-grid');
  const empty = document.getElementById('products-empty');
  const count = document.getElementById('catalog-count');
  const title = document.getElementById('catalog-title');
  if (!grid || !empty) return;

  const list = applyFilters();
  const q    = searchQuery.trim();

  // Titolo toolbar
  if (title) {
    if (q) {
      title.textContent = `Risultati per "${q}"`;
    } else if (activeCategory) {
      title.textContent = activeCategory.name;
    } else {
      title.textContent = 'Tutti i prodotti';
    }
  }
  if (count) count.textContent = list.length ? `(${list.length})` : '';

  if (!list.length) {
    grid.innerHTML = '';
    empty.innerHTML = q
      ? `Nessun risultato per <strong>"${escapeHtml(q)}"</strong>. Prova con altri termini.`
      : 'Nessun prodotto disponibile al momento.';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  grid.innerHTML = list
    .map((p) => {
      const img = Array.isArray(p.media) ? p.media[0] : null;
      const nameHtml  = q ? highlight(p.name, q) : escapeHtml(p.name);
      const modelHtml = p.model_name
        ? `<p class="hw-pcard-model">${q ? highlight(p.model_name, q) : escapeHtml(p.model_name)}</p>`
        : '';
      return `
        <a href="./prodotto.html?slug=${encodeURIComponent(p.slug)}" class="hw-pcard">
          <div class="hw-pcard-img">
            ${img?.url
              ? `<img src="${img.url}" alt="${escapeHtml(img.alt || p.name)}" loading="lazy" />`
              : `<div class="hw-pcard-placeholder"></div>`}
          </div>
          <div class="hw-pcard-body">
            <h3 class="hw-pcard-name">${nameHtml}</h3>
            ${modelHtml}
            <span class="hw-pcard-link">Scopri di più</span>
          </div>
        </a>`;
    })
    .join('');
}

/* ─────────────────────────────────────────
   Sidebar categorie
───────────────────────────────────────── */
function renderSidebar() {
  const nav = document.getElementById('category-nav');
  if (!nav) return;

  // Conta prodotti per categoria (dalla cache)
  const countById = {};
  allProducts.forEach((p) => {
    if (p.category_id) countById[p.category_id] = (countById[p.category_id] || 0) + 1;
  });

  let html = `<div class="catalog-cat-group">
    <div class="catalog-cat-head ${!activeCategory ? 'active' : ''}" data-action="all">
      Tutti i prodotti
      <span class="catalog-cat-badge">${allProducts.length}</span>
    </div>
  </div>`;

  allCategories.forEach((cat) => {
    const children   = Array.isArray(cat.children) ? cat.children.filter((c) => c.is_active) : [];
    const isActiveCat   = activeCategory && String(activeCategory.id) === String(cat.id);
    const isActiveChild = children.some((c) => activeCategory && String(activeCategory.id) === String(c.id));
    const isOpen = isActiveCat || isActiveChild;
    const catCount = countById[cat.id] || 0;

    if (children.length > 0) {
      const childrenHtml = children.map((child) => {
        const childCount = countById[child.id] || 0;
        const isActive = activeCategory && String(activeCategory.id) === String(child.id);
        return `<button class="catalog-cat-child ${isActive ? 'active' : ''}"
                        data-cat-id="${child.id}" data-cat-name="${escapeHtml(child.name)}">
                  ${escapeHtml(child.name)}
                  ${childCount ? `<span class="catalog-cat-badge">${childCount}</span>` : ''}
                </button>`;
      }).join('');
      html += `<div class="catalog-cat-group">
        <div class="catalog-cat-head ${isOpen ? 'open' : ''} ${isActiveCat ? 'active' : ''}"
             data-cat-id="${cat.id}" data-cat-name="${escapeHtml(cat.name)}" data-has-children="1">
          <span>${escapeHtml(cat.name)}</span>
          <span class="catalog-cat-icon">${isOpen ? '−' : '+'}</span>
        </div>
        <div class="catalog-cat-children ${isOpen ? 'open' : ''}">${childrenHtml}</div>
      </div>`;
    } else {
      html += `<div class="catalog-cat-group">
        <div class="catalog-cat-head ${isActiveCat ? 'active' : ''}"
             data-cat-id="${cat.id}" data-cat-name="${escapeHtml(cat.name)}">
          ${escapeHtml(cat.name)}
          ${catCount ? `<span class="catalog-cat-badge">${catCount}</span>` : ''}
        </div>
      </div>`;
    }
  });

  nav.innerHTML = html;
  attachSidebarEvents(nav);
}

function attachSidebarEvents(nav) {
  nav.querySelectorAll('.catalog-cat-head').forEach((el) => {
    el.addEventListener('click', () => {
      if (el.dataset.action === 'all') {
        activeCategory = null;
        renderSidebar();
        renderProducts();
        return;
      }
      if (el.dataset.hasChildren === '1') {
        el.classList.toggle('open');
        const childrenDiv = el.nextElementSibling;
        if (childrenDiv) childrenDiv.classList.toggle('open');
        const icon = el.querySelector('.catalog-cat-icon');
        if (icon) icon.textContent = el.classList.contains('open') ? '−' : '+';
      } else {
        activeCategory = { id: el.dataset.catId, name: el.dataset.catName };
        renderSidebar();
        renderProducts();
      }
    });
  });

  nav.querySelectorAll('.catalog-cat-child').forEach((el) => {
    el.addEventListener('click', () => {
      activeCategory = { id: el.dataset.catId, name: el.dataset.catName };
      renderSidebar();
      renderProducts();
    });
  });
}

/* ─────────────────────────────────────────
   Barra di ricerca
───────────────────────────────────────── */
function initSearch() {
  const input     = document.getElementById('catalog-search');
  const clearBtn  = document.getElementById('catalog-search-clear');
  const wrap      = document.getElementById('catalog-search-wrap');
  if (!input) return;

  input.addEventListener('input', () => {
    const val = input.value;
    searchQuery = val;

    // Mostra/nascondi clear button
    if (clearBtn) clearBtn.classList.toggle('visible', val.length > 0);
    if (wrap) wrap.classList.toggle('has-value', val.length > 0);

    // Debounce 150 ms
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      renderProducts();
    }, 150);
  });

  clearBtn?.addEventListener('click', () => {
    input.value = '';
    searchQuery = '';
    clearBtn.classList.remove('visible');
    wrap?.classList.remove('has-value');
    input.focus();
    renderProducts();
  });

  // ESC svuota
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      searchQuery = '';
      clearBtn?.classList.remove('visible');
      wrap?.classList.remove('has-value');
      renderProducts();
    }
  });
}

/* ─────────────────────────────────────────
   Bootstrap
───────────────────────────────────────── */
async function init() {
  setYear();

  const qs    = new URLSearchParams(window.location.search);
  const catId = qs.get('category_id');

  try {
    // Carica TUTTO in parallelo (per_page=500 per abilitare la ricerca client-side)
    const [catRes, prodRes] = await Promise.all([
      getCategories().catch(() => ({ data: [] })),
      getProducts({ per_page: 500 }).catch(() => ({ data: [] }))
    ]);

    allCategories = Array.isArray(catRes.data) ? catRes.data.filter((c) => c.is_active) : [];
    allProducts   = Array.isArray(prodRes.data) ? prodRes.data : [];

    // Arricchisci i prodotti con il riferimento categoria per il search blob
    const catMap = {};
    const addCats = (cats) => cats.forEach((c) => {
      catMap[c.id] = c;
      if (c.children) addCats(c.children);
    });
    addCats(allCategories);
    allProducts.forEach((p) => { if (p.category_id) p.category = catMap[p.category_id] || null; });

    // Pre-seleziona categoria da URL
    if (catId) {
      outer: for (const cat of allCategories) {
        if (String(cat.id) === catId) { activeCategory = { id: catId, name: cat.name }; break; }
        for (const child of (cat.children || [])) {
          if (String(child.id) === catId) { activeCategory = { id: catId, name: child.name }; break outer; }
        }
      }
    }

    initSearch();
    renderSidebar();
    renderProducts();
  } catch (err) {
    console.error('Errore init prodotti', err);
  }
}

init();
