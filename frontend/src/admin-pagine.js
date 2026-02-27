import { ensureAuth } from './admin-auth.js';
import { adminGetPages, adminLogout } from './api.js';

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

  const wrap = document.getElementById('pages-list');
  if (!wrap) return;
  try {
    const res = await adminGetPages();
    const list = Array.isArray(res.data) ? res.data : [];
    if (!list.length) {
      wrap.innerHTML = '<p class="empty-state">Nessuna pagina. La gestione crea/modifica sarà disponibile in una prossima versione.</p>';
      return;
    }
    wrap.innerHTML = `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>Titolo</th><th>Slug</th><th>Stato</th><th></th></tr>
          </thead>
          <tbody>
            ${list.map((p) => `
              <tr>
                <td>${escapeHtml(p.title)}</td>
                <td><code>${escapeHtml(p.slug)}</code></td>
                <td><span class="badge ${p.is_active ? 'badge-success' : 'badge-muted'}">${p.is_active ? 'Attiva' : 'Nascosta'}</span></td>
                <td><a href="./pagina.html?slug=${encodeURIComponent(p.slug)}" target="_blank">Apri</a></td>
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
