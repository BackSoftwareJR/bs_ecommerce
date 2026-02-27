const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    ...options
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

/** Richiesta con cookie (sessione) per track view e login. */
async function requestWithCredentials(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body && typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    },
    ...options
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

export function getSettings() {
  return request('/public/settings');
}

export function getProducts(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
  });
  const qs = query.toString();
  return request(`/public/products${qs ? `?${qs}` : ''}`);
}

export function getProductBySlug(slug) {
  return request(`/public/products/${encodeURIComponent(slug)}`);
}

export function getCategories() {
  return request('/public/categories');
}

export function getPages() {
  return request('/public/pages');
}

export function getPageBySlug(slug) {
  return request(`/public/pages/${encodeURIComponent(slug)}`);
}

/** Registra una vista sul prodotto (statistiche). Con cookie per sessione. */
export function trackProductView(slug) {
  return requestWithCredentials(`/public/products/${encodeURIComponent(slug)}/view`, {
    method: 'POST'
  });
}

/** Invia richiesta informazioni su prodotto. */
export function submitContactProduct(payload) {
  return request('/contact/product', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// ——— Admin API (con cookie di sessione) ———
function adminRequest(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const body = options.body;
  const isJson = body && typeof body === 'string';
  return fetch(url, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(isJson ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    },
    ...options
  }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });
}

export function adminGetUser() {
  return adminRequest('/admin/user');
}

export function adminLogin(email, password) {
  return fetch(`${API_BASE}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then((r) => {
    if (!r.ok) throw new Error(r.status === 422 ? 'Credenziali non valide.' : `HTTP ${r.status}`);
    return r.json();
  }).then((r) => r.user || r);
}

export function adminRegister(name, email, password, password_confirmation) {
  return fetch(`${API_BASE}/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, password_confirmation })
  }).then((r) => {
    if (!r.ok) throw new Error(r.status === 422 ? 'Dati non validi.' : `HTTP ${r.status}`);
    return r.json();
  }).then((r) => r.user || r);
}

export function adminLogout() {
  return adminRequest('/logout', { method: 'POST' });
}

export function adminGetProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return adminRequest(`/admin/products${qs ? `?${qs}` : ''}`);
}

export function adminGetProduct(id) {
  return adminRequest(`/admin/products/${id}`);
}

export function adminCreateProduct(data) {
  return adminRequest('/admin/products', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function adminUpdateProduct(id, data) {
  return adminRequest(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export function adminDeleteProduct(id) {
  return adminRequest(`/admin/products/${id}`, { method: 'DELETE' });
}

export function adminProductsReorder(ids) {
  return adminRequest('/admin/products-reorder', {
    method: 'PUT',
    body: JSON.stringify({ ids })
  });
}

export function adminUploadProductMedia(productId, file) {
  const form = new FormData();
  form.append('file', file);
  return fetch(`${API_BASE}/admin/products/${productId}/media`, {
    method: 'POST',
    credentials: 'include',
    body: form
  }).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });
}

export function adminDeleteProductMedia(productId, mediaId) {
  return adminRequest(`/admin/products/${productId}/media/${mediaId}`, {
    method: 'DELETE'
  });
}

export function adminGetCategories() {
  return adminRequest('/admin/categories');
}

export function adminCreateCategory(data) {
  return adminRequest('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function adminGetProductTags() {
  return adminRequest('/admin/product-tags');
}

export function adminGetPages() {
  return adminRequest('/admin/pages');
}

export function adminGetStatsOverview() {
  return adminRequest('/admin/stats/overview');
}

export function adminGetStatsProductViews(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return adminRequest(`/admin/stats/product-views${qs ? `?${qs}` : ''}`);
}

export function adminGetInquiries(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return adminRequest(`/admin/inquiries${qs ? `?${qs}` : ''}`);
}

export function adminUpdateInquiry(id, data) {
  return adminRequest(`/admin/inquiries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export function adminGetSettings() {
  return adminRequest('/admin/settings');
}

export function adminUpdateSettings(settings) {
  return adminRequest('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settings)
  });
}

