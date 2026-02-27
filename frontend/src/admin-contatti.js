import { ensureAuth } from './admin-auth.js';
import { adminGetInquiries, adminUpdateInquiry, adminLogout } from './api.js';

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

  const wrap = document.getElementById('inquiries-list');
  if (!wrap) return;
  try {
    const res = await adminGetInquiries({ per_page: 50 });
    const list = Array.isArray(res.data) ? res.data : [];
    if (!list.length) {
      wrap.innerHTML = '<p class="empty-state">Nessuna richiesta.</p>';
      return;
    }
    wrap.innerHTML = `
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Prodotto</th>
              <th>Messaggio</th>
              <th>Stato</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${list.map((i) => `
              <tr>
                <td>${new Date(i.created_at).toLocaleDateString('it-IT')}</td>
                <td>${escapeHtml(i.name)}</td>
                <td><a href="mailto:${escapeHtml(i.email)}">${escapeHtml(i.email)}</a></td>
                <td>${i.product ? escapeHtml(i.product.name) : '—'}</td>
                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;">${escapeHtml((i.message || '').slice(0, 80))}…</td>
                <td><span class="badge badge-${i.status === 'new' ? 'success' : 'muted'}">${i.status}</span></td>
                <td>
                  <select class="input input-small inquiry-status" data-id="${i.id}">
                    <option value="new" ${i.status === 'new' ? 'selected' : ''}>new</option>
                    <option value="read" ${i.status === 'read' ? 'selected' : ''}>read</option>
                    <option value="closed" ${i.status === 'closed' ? 'selected' : ''}>closed</option>
                  </select>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    wrap.querySelectorAll('.inquiry-status').forEach((sel) => {
      sel.addEventListener('change', async () => {
        const id = parseInt(sel.dataset.id, 10);
        try {
          await adminUpdateInquiry(id, { status: sel.value });
        } catch (_) {}
      });
    });
  } catch (err) {
    wrap.innerHTML = '<p class="empty-state">Errore caricamento.</p>';
  }
}

load();
