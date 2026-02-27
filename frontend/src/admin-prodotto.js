import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { ensureAuth } from './admin-auth.js';
import {
  adminGetProduct,
  adminGetCategories,
  adminCreateCategory,
  adminGetProductTags,
  adminCreateProduct,
  adminUpdateProduct,
  adminUploadProductMedia,
  adminDeleteProductMedia,
  adminLogout
} from './api.js';

let quill;

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function flattenCategories(list, out = []) {
  list.forEach((c) => {
    out.push({ id: c.id, name: c.name });
    if (c.children && c.children.length) flattenCategories(c.children, out);
  });
  return out;
}

function escapeHtml(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

let productId = null;
let attributes = [];
let tagOptions = [];

async function load() {
  await ensureAuth();

  const id = getQueryParam('id');
  productId = id ? parseInt(id, 10) : null;

  quill = new Quill('#description-editor', {
    theme: 'snow',
    modules: {
      toolbar: [
        [{ header: [2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        ['clean']
      ]
    }
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try { await adminLogout(); } catch (_) {}
    window.location.href = 'admin-login.html';
  });

  const [categoriesRes, tagsRes] = await Promise.all([
    adminGetCategories().catch(() => ({ data: [] })),
    adminGetProductTags().catch(() => ({ data: [] }))
  ]);

  const categoriesRaw = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
  const categories = flattenCategories(categoriesRaw);
  tagOptions = Array.isArray(tagsRes.data) ? tagsRes.data : [];

  const catSelect = document.getElementById('category_id');
  if (catSelect) {
    categories.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      catSelect.appendChild(opt);
    });
  }

  // Nuova categoria al volo
  const newCatBtn = document.getElementById('new-category-btn');
  const newCatForm = document.getElementById('new-category-form');
  const newCatCancel = document.getElementById('new-category-cancel');
  const newCatSave = document.getElementById('new-category-save');
  const newCatFeedback = document.getElementById('new-category-feedback');
  if (newCatBtn && newCatForm) {
    newCatBtn.addEventListener('click', () => {
      newCatForm.style.display = newCatForm.style.display === 'none' ? 'block' : 'none';
    });
    newCatCancel.addEventListener('click', () => {
      newCatForm.style.display = 'none';
      document.getElementById('new-category-name').value = '';
      newCatFeedback.style.display = 'none';
    });
    newCatSave.addEventListener('click', async () => {
      const name = document.getElementById('new-category-name').value.trim();
      if (!name) return;
      newCatSave.disabled = true;
      try {
        const res = await adminCreateCategory({ name });
        const cat = res.data || res;
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        catSelect.appendChild(opt);
        catSelect.value = cat.id;
        newCatForm.style.display = 'none';
        document.getElementById('new-category-name').value = '';
        newCatFeedback.style.display = 'none';
      } catch (err) {
        newCatFeedback.textContent = 'Errore: ' + (err.message || 'Riprova.');
        newCatFeedback.style.display = 'block';
      }
      newCatSave.disabled = false;
    });
  }

  renderTagCheckboxes();
  renderAttributesList();

  if (productId) {
    document.getElementById('page-title').textContent = 'Modifica prodotto';
    document.getElementById('page-lead').textContent = 'Modifica i campi e salva.';
    document.getElementById('media-upload-hint').textContent = 'Aggiungi una o più immagini.';
    const product = await adminGetProduct(productId).then((r) => r.data || r);
    fillForm(product);
    renderMediaList(product.media || []);
  } else {
    attributes = [{ label: '', value: '' }];
    renderAttributesList();
  }

  document.getElementById('add-attribute').addEventListener('click', () => {
    attributes.push({ label: '', value: '' });
    renderAttributesList();
  });

  document.getElementById('product-form').addEventListener('submit', onSubmit);
  document.getElementById('name').addEventListener('blur', () => {
    if (!document.getElementById('slug').value) {
      document.getElementById('slug').value = (document.getElementById('name').value || '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    }
  });

  const mediaInput = document.getElementById('media-upload');
  if (mediaInput) mediaInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file || !productId) return;
    try {
      await adminUploadProductMedia(productId, file);
      const product = await adminGetProduct(productId).then((r) => r.data || r);
      renderMediaList(product.media || []);
      mediaInput.value = '';
    } catch (err) {
      alert('Errore upload: ' + (err.message || 'Riprova.'));
    }
  });
}

function fillForm(p) {
  document.getElementById('product-id').value = p.id || '';
  document.getElementById('name').value = p.name || '';
  document.getElementById('slug').value = p.slug || '';
  document.getElementById('short_description').value = p.short_description || '';
  if (quill) quill.root.innerHTML = p.description || '';
  document.getElementById('description').value = p.description || '';
  document.getElementById('price').value = p.price ?? '';
  document.getElementById('video_url').value = p.video_url || '';
  document.getElementById('category_id').value = p.category_id || '';
  document.getElementById('label').value = p.label || '';
  document.getElementById('is_active').checked = p.is_active !== false;
  document.getElementById('is_featured').checked = p.is_featured === true;
  document.getElementById('sort_order').value = p.sort_order ?? 0;
  document.getElementById('meta_title').value = p.meta_title || '';
  document.getElementById('meta_description').value = p.meta_description || '';
  attributes = Array.isArray(p.attributes) && p.attributes.length
    ? p.attributes.map((a) => ({ label: a.label || '', value: a.value || '' }))
    : [{ label: '', value: '' }];
  renderAttributesList();
  renderTagCheckboxes();
  const tagIds = (p.tags || []).map((t) => t.id);
  tagOptions.forEach((t) => {
    const cb = document.querySelector(`input[name="tag_ids"][value="${t.id}"]`);
    if (cb) cb.checked = tagIds.includes(t.id);
  });
}

function renderTagCheckboxes() {
  const wrap = document.getElementById('product-tags-wrap');
  if (!wrap) return;
  wrap.innerHTML = tagOptions.length
    ? tagOptions.map((t) => `<label class="checkbox-label"><input type="checkbox" name="tag_ids" value="${t.id}" /> ${escapeHtml(t.name)}</label>`).join('')
    : '<p class="form-hint">Nessun tag creato. Aggiungi tag dalla gestione (in futuro).</p>';
}

function renderAttributesList() {
  const list = document.getElementById('attributes-list');
  if (!list) return;
  list.innerHTML = attributes
    .map(
      (a, i) => `
    <div class="attribute-row form-row" data-index="${i}">
      <input type="text" class="input attr-label" placeholder="Label" value="${escapeHtml(a.label)}" />
      <input type="text" class="input attr-value" placeholder="Valore" value="${escapeHtml(a.value)}" />
      <button type="button" class="btn btn-small btn-remove-attr">Rimuovi</button>
    </div>
  `
    )
    .join('');
  list.querySelectorAll('.btn-remove-attr').forEach((btn) => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.closest('.attribute-row').dataset.index, 10);
      attributes.splice(i, 1);
      renderAttributesList();
    });
  });
  list.querySelectorAll('.attr-label, .attr-value').forEach((input, idx) => {
    const isLabel = input.classList.contains('attr-label');
    input.addEventListener('change', () => {
      if (attributes[idx]) {
        if (isLabel) attributes[idx].label = input.value;
        else attributes[idx].value = input.value;
      }
    });
  });
}

function collectAttributes() {
  const rows = document.querySelectorAll('.attribute-row');
  return Array.from(rows).map((row) => ({
    label: row.querySelector('.attr-label')?.value?.trim() || '',
    value: row.querySelector('.attr-value')?.value?.trim() || ''
  })).filter((a) => a.label);
}

function collectTagIds() {
  return Array.from(document.querySelectorAll('input[name="tag_ids"]:checked')).map((cb) => parseInt(cb.value, 10));
}

async function onSubmit(e) {
  e.preventDefault();
  const feedback = document.getElementById('form-feedback');
  feedback.style.display = 'none';
  const attrs = collectAttributes();
  const tagIds = collectTagIds();
  const payload = {
    name: document.getElementById('name').value.trim(),
    slug: document.getElementById('slug').value.trim() || null,
    short_description: document.getElementById('short_description').value.trim() || null,
    description: quill ? quill.root.innerHTML.trim() : (document.getElementById('description').value.trim() || null),
    price: parseFloat(document.getElementById('price').value) || 0,
    compare_at_price: null,
    video_url: document.getElementById('video_url').value.trim() || null,
    category_id: document.getElementById('category_id').value ? parseInt(document.getElementById('category_id').value, 10) : null,
    label: document.getElementById('label').value.trim() || null,
    is_active: document.getElementById('is_active').checked,
    is_featured: document.getElementById('is_featured').checked,
    sort_order: parseInt(document.getElementById('sort_order').value, 10) || 0,
    meta_title: document.getElementById('meta_title').value.trim() || null,
    meta_description: document.getElementById('meta_description').value.trim() || null,
    attributes: attrs,
    tag_ids: tagIds
  };

  try {
    if (productId) {
      await adminUpdateProduct(productId, payload);
      feedback.textContent = 'Prodotto aggiornato.';
    } else {
      const res = await adminCreateProduct(payload);
      const id = res.data?.id || res.id;
      feedback.textContent = 'Prodotto creato.';
      if (id) {
        window.history.replaceState(null, '', `?id=${id}`);
        productId = id;
        document.getElementById('product-id').value = id;
      }
    }
    feedback.className = 'form-feedback success';
    feedback.style.display = 'block';
  } catch (err) {
    feedback.textContent = err.message || 'Errore nel salvataggio.';
    feedback.className = 'form-feedback error';
    feedback.style.display = 'block';
  }
}

function renderMediaList(media) {
  const wrap = document.getElementById('media-list');
  if (!wrap) return;
  if (!media.length) {
    wrap.innerHTML = '<p class="form-hint">Nessuna immagine.</p>';
    return;
  }
  wrap.innerHTML = `
    <div class="media-list">
      ${media.map((m) => `
        <div class="media-item" data-id="${m.id}">
          <img src="${escapeHtml(m.url)}" alt="" class="media-thumb" />
          <button type="button" class="btn btn-small btn-remove-media" data-id="${m.id}">Elimina</button>
        </div>
      `).join('')}
    </div>
  `;
  wrap.querySelectorAll('.btn-remove-media').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Eliminare questa immagine?')) return;
      const id = parseInt(btn.dataset.id, 10);
      try {
        await adminDeleteProductMedia(productId, id);
        btn.closest('.media-item').remove();
      } catch (err) {
        alert('Errore: ' + (err.message || 'Riprova.'));
      }
    });
  });
}

load();
