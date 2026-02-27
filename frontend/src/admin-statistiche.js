import { ensureAuth } from './admin-auth.js';
import { adminGetStatsProductViews, adminLogout } from './api.js';

function escapeHtml(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

async function load() {
  await ensureAuth();
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try { await adminLogout(); } catch (_) {}
    window.location.href = 'admin-login.html';
  });

  const wrap = document.getElementById('stats-views');
  if (!wrap) return;
  try {
    const res = await adminGetStatsProductViews({ days: 30, limit: 20 });
    const list = Array.isArray(res.data) ? res.data : [];
    if (!list.length) {
      wrap.innerHTML = '<p class="empty-state">Nessun dato di visualizzazione.</p>';
      return;
    }
    wrap.innerHTML = `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>Prodotto</th><th>Viste (30 gg)</th><th></th></tr>
          </thead>
          <tbody>
            ${list.map((r) => `
              <tr>
                <td>${escapeHtml(r.product_name)}</td>
                <td>${r.views}</td>
                <td><a href="./prodotto.html?slug=${encodeURIComponent(r.product_slug || '')}" target="_blank">Vetrina</a></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    wrap.innerHTML = '<p class="empty-state">Errore caricamento.</p>';
  }
}

load();
