import { getSettings, getProducts } from './api.js';

function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}

async function loadHome() {
  setYear();

  try {
    const [settings, products] = await Promise.all([
      getSettings().catch(() => ({})),
      getProducts({ featured: 1, per_page: 8 }).catch(() => ({ data: [] }))
    ]);

    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const footerText = document.getElementById('footer-text');
    const grid = document.getElementById('featured-products');

    if (heroTitle && settings.hero_title)
      heroTitle.textContent = settings.hero_title;
    if (heroSubtitle && settings.hero_subtitle)
      heroSubtitle.textContent = settings.hero_subtitle;
    if (footerText && settings.footer_text)
      footerText.textContent = settings.footer_text.replace(
        /{{year}}/gi,
        new Date().getFullYear().toString()
      );

    if (!grid) return;

    const list = Array.isArray(products.data) ? products.data : [];
    if (!list.length) {
      grid.innerHTML = '';
      return;
    }

    grid.innerHTML = list
      .map((p) => {
        const img = p.media && p.media[0];
        const price =
          typeof p.price === 'number'
            ? `€ ${p.price.toFixed(2)}`
            : p.price || '';
        return `
          <a href="./prodotto.html?slug=${encodeURIComponent(
            p.slug
          )}" class="product-card">
            <div class="product-card-image">
              ${
                img && img.url
                  ? `<img src="${img.url}" alt="${(img.alt || p.name)
                      .replace(/"/g, '&quot;')}" loading="lazy" />`
                  : `<div class="product-card-placeholder"></div>`
              }
            </div>
            <div class="product-card-body">
              <h3 class="product-card-title">${p.name}</h3>
              <p class="product-card-desc">${p.short_description || ''}</p>
              <span class="product-card-price">${price}</span>
            </div>
          </a>
        `;
      })
      .join('');
  } catch (err) {
    console.error('Errore caricando la home', err);
  }
}

loadHome();

