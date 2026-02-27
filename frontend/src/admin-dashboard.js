import { ensureAuth } from './admin-auth.js';
import {
  adminGetProducts,
  adminGetPages,
  adminGetStatsOverview,
  adminLogout
} from './api.js';

async function loadDashboard() {
  await ensureAuth();

  const cardsEl = document.getElementById('cards');
  const latestProductsEl = document.getElementById('latest-products');
  const latestPagesEl = document.getElementById('latest-pages');
  const logoutBtn = document.getElementById('logout-btn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await adminLogout();
        window.location.href = 'admin-login.html';
      } catch (_) {
        window.location.href = 'admin-login.html';
      }
    });
  }

  if (!cardsEl || !latestProductsEl || !latestPagesEl) return;

  try {
    const [statsRes, productsRes, pagesRes] = await Promise.all([
      adminGetStatsOverview().catch(() => ({ data: {} })),
      adminGetProducts({ per_page: 20 }).catch(() => ({ data: [] })),
      adminGetPages().catch(() => ({ data: [] }))
    ]);

    const stats = statsRes.data || statsRes || {};
    const products = Array.isArray(productsRes.data) ? productsRes.data : [];
    const pages = Array.isArray(pagesRes.data) ? pagesRes.data : [];

    cardsEl.innerHTML = `
      <div class="admin-cards">
        <div class="admin-card">
          <span class="admin-card-label">Prodotti attivi</span>
          <span class="admin-card-value">${stats.products_count ?? products.length}</span>
        </div>
        <div class="admin-card">
          <span class="admin-card-label">Pagine</span>
          <span class="admin-card-value">${stats.pages_count ?? pages.length}</span>
        </div>
        <div class="admin-card">
          <span class="admin-card-label">Richieste nuove</span>
          <span class="admin-card-value">${stats.inquiries_new_count ?? 0}</span>
        </div>
        <div class="admin-card">
          <span class="admin-card-label">Viste (30 gg)</span>
          <span class="admin-card-value">${stats.product_views_last_30_days ?? 0}</span>
        </div>
      </div>
    `;

    latestProductsEl.innerHTML = `
      <h2 class="admin-title" id="prodotti">Prodotti</h2>
      ${
        products.length
          ? `<div class="admin-table-wrap">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Prezzo</th>
                    <th>Stato</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${products
                    .slice(0, 10)
                    .map((p) => {
                      const price = typeof p.price === 'number' ? `€ ${p.price.toFixed(2)}` : p.price || '';
                      return `
                        <tr>
                          <td>${escapeHtml(p.name)}</td>
                          <td>${price}</td>
                          <td>
                            <span class="badge ${p.is_active ? 'badge-success' : 'badge-muted'}">
                              ${p.is_active ? 'Attivo' : 'Nascosto'}
                            </span>
                          </td>
                          <td>
                            <a href="./admin-prodotto.html?id=${p.id}">Modifica</a>
                            &middot;
                            <a href="./prodotto.html?slug=${encodeURIComponent(p.slug)}" target="_blank">Vetrina</a>
                          </td>
                        </tr>
                      `;
                    })
                    .join('')}
                </tbody>
              </table>
            </div>
            <p style="margin-top:12px;"><a href="./admin-prodotti.html">Vedi tutti i prodotti →</a></p>`
          : '<p class="empty-state">Nessun prodotto. <a href="./admin-prodotto.html">Aggiungi il primo</a>.</p>'
      }
    `;

    latestPagesEl.innerHTML = `
      <h2 class="admin-title" id="pagine">Pagine</h2>
      ${
        pages.length
          ? `<div class="admin-table-wrap">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Titolo</th>
                    <th>Slug</th>
                    <th>Stato</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${pages
                    .slice(0, 10)
                    .map((p) => `
                      <tr>
                        <td>${escapeHtml(p.title)}</td>
                        <td><code>${escapeHtml(p.slug)}</code></td>
                        <td>
                          <span class="badge ${p.is_active ? 'badge-success' : 'badge-muted'}">
                            ${p.is_active ? 'Attiva' : 'Nascosta'}
                          </span>
                        </td>
                        <td>
                          <a href="./pagina.html?slug=${encodeURIComponent(p.slug)}" target="_blank">Vetrina</a>
                        </td>
                      </tr>
                    `)
                    .join('')}
                </tbody>
              </table>
            </div>
            <p style="margin-top:12px;"><a href="./admin-pagine.html">Gestisci pagine →</a></p>`
          : '<p class="empty-state">Nessuna pagina.</p>'
      }
    `;
  } catch (err) {
    console.error('Errore caricando la dashboard admin', err);
    if (cardsEl) cardsEl.innerHTML = '<p class="empty-state">Impossibile caricare i dati.</p>';
  }
}

function escapeHtml(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

loadDashboard();
