import { ensureAuth } from './admin-auth.js';
import { adminGetSettings, adminUpdateSettings, adminLogout } from './api.js';

const COMMON_KEYS = ['site_name', 'hero_title', 'hero_subtitle', 'footer_text', 'logo_url'];

async function load() {
  await ensureAuth();
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try { await adminLogout(); } catch (_) {}
    window.location.href = 'admin-login.html';
  });

  const wrap = document.getElementById('settings-fields');
  const form = document.getElementById('settings-form');
  const feedback = document.getElementById('settings-feedback');
  if (!wrap || !form) return;

  try {
    const res = await adminGetSettings();
    const data = res.data || res || {};
    const keys = [...new Set([...COMMON_KEYS, ...Object.keys(data)])];
    wrap.innerHTML = keys.map((key) => {
      const val = data[key];
      const value = typeof val === 'object' && val !== null && 'value' in val ? val.value : val;
      const str = value == null ? '' : String(value);
      const escaped = str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
      return `
        <div class="form-group">
          <label for="set-${key}">${key}</label>
          <input id="set-${key}" name="${key}" class="input" value="${escaped}" />
        </div>
      `;
    }).join('');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      feedback.style.display = 'none';
      const payload = {};
      keys.forEach((key) => {
        const input = document.getElementById(`set-${key}`);
        if (input) payload[key] = input.value;
      });
      try {
        await adminUpdateSettings(payload);
        feedback.textContent = 'Impostazioni salvate.';
        feedback.className = 'form-feedback success';
        feedback.style.display = 'block';
      } catch (err) {
        feedback.textContent = err.message || 'Errore.';
        feedback.className = 'form-feedback error';
        feedback.style.display = 'block';
      }
    });
  } catch (err) {
    wrap.innerHTML = '<p class="empty-state">Errore caricamento.</p>';
  }
}

load();
