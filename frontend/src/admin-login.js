import { adminLogin } from './api.js';

const form = document.getElementById('login-form');
const feedback = document.getElementById('login-feedback');

if (form && feedback) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedback.style.display = 'none';
    const email = form.email.value.trim();
    const password = form.password.value;
    if (!email || !password) return;
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    try {
      await adminLogin(email, password);
      const next = new URLSearchParams(window.location.search).get('next');
      window.location.href = next && next.startsWith('admin') ? next : 'admin.html';
    } catch (err) {
      feedback.textContent = err.message || 'Errore di accesso.';
      feedback.style.display = 'block';
      feedback.className = 'form-feedback error';
    }
    if (btn) btn.disabled = false;
  });
}
