import { ensureAuth } from './admin-auth.js';
import { adminGetProducts, adminLogout } from './api.js';

function escapeHtml(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

async function load() {
  await ensureAuth();

  const wrap = document.getElementById('products-table-wrap');
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try { await adminLogout(); } catch (_) {}
    window.location.href = 'admin-login.html';
  });

  if (!wrap) return;
  try {
    const res = await adminGetProducts({ per_page: 100 });
    const list = Array.isArray(res.data) ? res.data : [];
    if (!list.length) {
      wrap.innerHTML = '<p class="empty-state">Nessun prodotto. <a href="./admin-prodotto.html">Aggiungi il primo</a>.</p>';
      return;
    }
    wrap.innerHTML = `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Prezzo</th>
              <th>Tag / Etichetta</th>
              <th>Stato</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${list.map((p) => {
              const price = typeof p.price === 'number' ? `€ ${p.price.toFixed(2)}` : p.price || '';
              const tags = (p.tags || []).map((t) => t.name).join(', ');
              const label = p.label ? `[${p.label}]` : '';
              return `
                <tr>
                  <td>${escapeHtml(p.name)}</td>
                  <td>${price}</td>
                  <td>${escapeHtml(tags || label || '—')}</td>
                  <td>
                    <span class="badge ${p.is_active ? 'badge-success' : 'badge-muted'}">${p.is_active ? 'Attivo' : 'Nascosto'}</span>
                  </td>
                  <td>
                    <a href="./admin-prodotto.html?id=${p.id}">Modifica</a>
                    &middot;
                    <a href="./prodotto.html?slug=${encodeURIComponent(p.slug)}" target="_blank">Vetrina</a>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    console.error(err);
    wrap.innerHTML = '<p class="empty-state">Errore nel caricamento.</p>';
  }
}

load();
