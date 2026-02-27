import { adminGetUser } from './api.js';

const LOGIN_PAGE = 'admin-login.html';

/**
 * Verifica che l'utente sia autenticato e con ruolo admin/editor.
 * Se non lo è, reindirizza a admin-login.html.
 * @returns {Promise<object|null>} User object o null se redirect
 */
export async function ensureAuth() {
  try {
    const user = await adminGetUser();
    if (user && ['admin', 'editor'].includes(user.role)) return user;
  } catch (_) {
    // 401 o 403
  }
  window.location.href = LOGIN_PAGE + (window.location.search ? '?next=' + encodeURIComponent(window.location.pathname + window.location.search) : '');
  return null;
}
