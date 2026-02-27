import { getSettings, getProductBySlug, trackProductView, submitContactProduct } from './api.js';
import { getQueryParam } from './dom.js';

function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}

/** Ritorna URL embed per YouTube o Vimeo. */
function getVideoEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const u = url.trim();
  const ytMatch = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

function renderTags(tags) {
  if (!Array.isArray(tags) || !tags.length) return '';
  return `
    <div class="product-detail-tags">
      ${tags.map((t) => `<span class="product-detail-tag">${escapeHtml(t.name)}</span>`).join('')}
    </div>
  `;
}

function renderAttributes(attributes) {
  if (!Array.isArray(attributes) || !attributes.length) return '';
  return `
    <div class="product-detail-attributes">
      <h3 class="product-detail-attributes-title">Caratteristiche</h3>
      <ul class="product-detail-attributes-list">
        ${attributes.map((a) => `
          <li><strong>${escapeHtml(a.label)}</strong>${a.value ? ` — ${escapeHtml(a.value)}` : ''}</li>
        `).join('')}
      </ul>
    </div>
  `;
}

function escapeHtml(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function renderContactForm(product) {
  return `
    <form id="product-contact-form" class="admin-form product-contact-form">
      <div class="form-group">
        <label for="pc-name">Nome</label>
        <input id="pc-name" name="name" class="input" required />
      </div>
      <div class="form-group">
        <label for="pc-email">Email</label>
        <input id="pc-email" name="email" type="email" class="input" required />
      </div>
      <div class="form-group">
        <label for="pc-message">Messaggio</label>
        <textarea id="pc-message" name="message" rows="4" class="input" required>Buongiorno, vorrei maggiori informazioni su: ${escapeHtml(product.name)}.</textarea>
      </div>
      <button type="submit" class="btn btn-primary" id="pc-submit">Richiedi informazioni</button>
      <p class="product-contact-feedback" id="pc-feedback" style="display:none;"></p>
    </form>
  `;
}

async function loadProdotto() {
  setYear();

  const slug = getQueryParam('slug');
  const container = document.getElementById('product-detail');
  const footerText = document.getElementById('footer-text');

  if (!slug || !container) return;

  try {
    const [settings, res] = await Promise.all([
      getSettings().catch(() => ({})),
      getProductBySlug(slug)
    ]);

    if (footerText && settings.footer_text)
      footerText.textContent = settings.footer_text.replace(
        /{{year}}/gi,
        new Date().getFullYear().toString()
      );

    const product = res.data || res;
    const media = Array.isArray(product.media) ? product.media : [];
    const main = media[0];
    const tags = product.tags || [];
    const attributes = product.attributes || [];
    const videoEmbedUrl = getVideoEmbedUrl(product.video_url);

    const price =
      typeof product.price === 'number'
        ? `€ ${product.price.toFixed(2)}`
        : product.price || '';

    container.innerHTML = `
      <div class="product-detail-gallery">
        ${
          main && main.url
            ? `<img src="${main.url}" alt="${escapeHtml(main.alt || product.name)}" class="product-detail-main-image" />`
            : `<div class="product-detail-placeholder"></div>`
        }
        ${
          media.length > 1
            ? `<div class="product-detail-thumbs">
              ${media
                .map(
                  (m, i) =>
                    `<img src="${m.url}" alt="${escapeHtml(m.alt || product.name)}" class="product-detail-thumb ${i === 0 ? 'active' : ''}" data-index="${i}" />`
                )
                .join('')}
            </div>`
            : ''
        }
      </div>
      <div class="product-detail-info">
        ${renderTags(tags)}
        ${product.label ? `<span class="product-detail-label">${escapeHtml(product.label)}</span>` : ''}
        <h1 class="product-detail-title">${escapeHtml(product.name)}</h1>
        <p class="product-detail-price">
          <span class="current">${price}</span>
          ${
            product.compare_at_price
              ? `<span class="compare">€ ${Number(product.compare_at_price).toFixed(2)}</span>`
              : ''
          }
        </p>
        ${
          product.short_description
            ? `<p class="product-detail-short">${escapeHtml(product.short_description)}</p>`
            : ''
        }
        ${renderAttributes(attributes)}
        ${videoEmbedUrl ? `
          <div class="product-detail-video">
            <h3 class="product-detail-video-title">Video</h3>
            <div class="product-detail-video-wrap">
              <iframe src="${videoEmbedUrl}" title="Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
          </div>
        ` : ''}
        <div class="product-detail-body">
          ${product.description || ''}
        </div>
        <hr class="product-detail-hr" />
        <h2 class="section-title product-detail-form-title">Richiedi informazioni</h2>
        ${renderContactForm(product)}
      </div>
    `;

    // Thumb click: cambia immagine principale
    const thumbs = container.querySelectorAll('.product-detail-thumb');
    const mainImg = container.querySelector('.product-detail-main-image');
    if (mainImg && thumbs.length) {
      thumbs.forEach((thumb, i) => {
        thumb.addEventListener('click', () => {
          thumbs.forEach((t) => t.classList.remove('active'));
          thumb.classList.add('active');
          mainImg.src = thumb.src;
          mainImg.alt = thumb.alt;
        });
      });
    }

    // Form contatto: invio reale
    const form = document.getElementById('product-contact-form');
    const feedback = document.getElementById('pc-feedback');
    const submitBtn = document.getElementById('pc-submit');
    if (form && feedback) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        feedback.style.display = 'block';
        feedback.textContent = 'Invio in corso...';
        feedback.className = 'product-contact-feedback';
        if (submitBtn) submitBtn.disabled = true;
        try {
          const fd = new FormData(form);
          await submitContactProduct({
            product_slug: product.slug,
            name: fd.get('name') || '',
            email: fd.get('email') || '',
            message: fd.get('message') || ''
          });
          feedback.textContent = 'Richiesta inviata. Verrai ricontattato al più presto.';
          feedback.classList.add('success');
          form.reset();
        } catch (err) {
          feedback.textContent = 'Errore nell\'invio. Riprova più tardi.';
          feedback.classList.add('error');
        }
        if (submitBtn) submitBtn.disabled = false;
      });
    }

    // Traccia vista (una volta per sessione, in background)
    trackProductView(slug).catch(() => {});
  } catch (err) {
    console.error('Errore caricando il prodotto', err);
    if (container) {
      container.innerHTML = '<p class="empty-state">Prodotto non trovato.</p>';
    }
  }
}

loadProdotto();
