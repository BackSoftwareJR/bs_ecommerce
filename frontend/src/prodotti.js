import { getSettings, getProducts } from './api.js';
import { getQueryParam } from './dom.js';

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

async function loadProdotti() {
  setYear();

  const grid = document.getElementById('products-grid');
  const empty = document.getElementById('products-empty');
  const footerText = document.getElementById('footer-text');

  const categoryId = getQueryParam('category_id');
  const tag = getQueryParam('tag');
  const params = {};
  if (categoryId) params.category_id = categoryId;
  if (tag) params.tag = tag;

  try {
    const [settings, products] = await Promise.all([
      getSettings().catch(() => ({})),
      getProducts(params).catch(() => ({ data: [] }))
    ]);

    if (footerText && settings.footer_text)
      footerText.textContent = settings.footer_text.replace(
        /{{year}}/gi,
        new Date().getFullYear().toString()
      );

    if (!grid || !empty) return;

    const list = Array.isArray(products.data) ? products.data : [];
    if (!list.length) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';
    grid.innerHTML = list
      .map((p) => {
        const img = p.media && p.media[0];
        const price =
          typeof p.price === 'number'
            ? `€ ${p.price.toFixed(2)}`
            : p.price || '';
        const tags = Array.isArray(p.tags) ? p.tags : [];
        const tagHtml = tags.length
          ? `<div class="product-card-tags">${tags.map((t) => `<span class="product-card-tag">${escapeHtml(t.name)}</span>`).join('')}</div>`
          : '';
        const labelHtml = p.label ? `<span class="product-card-label">${escapeHtml(p.label)}</span>` : '';
        return `
          <a href="./prodotto.html?slug=${encodeURIComponent(p.slug)}" class="product-card">
            <div class="product-card-image">
              ${img && img.url
                ? `<img src="${img.url}" alt="${escapeHtml(img.alt || p.name)}" loading="lazy" />`
                : `<div class="product-card-placeholder"></div>`}
              ${tagHtml || labelHtml ? `<div class="product-card-badges">${tagHtml}${labelHtml}</div>` : ''}
            </div>
            <div class="product-card-body">
              <h3 class="product-card-title">${escapeHtml(p.name)}</h3>
              <p class="product-card-desc">${p.short_description || ''}</p>
              <span class="product-card-price">${price}</span>
            </div>
          </a>
        `;
      })
      .join('');
  } catch (err) {
    console.error('Errore caricando i prodotti', err);
    if (grid && empty) {
      grid.innerHTML = '';
      empty.style.display = 'block';
    }
  }
}

loadProdotti();

