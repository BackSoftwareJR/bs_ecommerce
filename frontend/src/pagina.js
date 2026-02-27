import { getSettings, getPageBySlug } from './api.js';
import { getQueryParam } from './dom.js';

function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}

async function loadPagina() {
  setYear();

  const slug = getQueryParam('slug');
  const titleEl = document.getElementById('page-title');
  const bodyEl = document.getElementById('page-body');
  const footerText = document.getElementById('footer-text');

  if (!slug) return;

  try {
    const [settings, res] = await Promise.all([
      getSettings().catch(() => ({})),
      getPageBySlug(slug)
    ]);

    if (footerText && settings.footer_text)
      footerText.textContent = settings.footer_text.replace(
        /{{year}}/gi,
        new Date().getFullYear().toString()
      );

    const page = res.data || res;

    if (titleEl) titleEl.textContent = page.title || 'Pagina';
    if (bodyEl) bodyEl.innerHTML = page.body || '';
  } catch (err) {
    console.error('Errore caricando la pagina', err);
    if (titleEl) titleEl.textContent = 'Pagina non trovata';
    if (bodyEl)
      bodyEl.innerHTML =
        '<p class="empty-state">Questa pagina non è disponibile.</p>';
  }
}

loadPagina();

