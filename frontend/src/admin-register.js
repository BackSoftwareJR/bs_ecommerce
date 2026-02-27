import { adminRegister } from './api.js';

const form = document.getElementById('register-form');
const feedback = document.getElementById('register-feedback');

if (form && feedback) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedback.style.display = 'none';
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const password_confirmation = form.password_confirmation.value;
    if (password !== password_confirmation) {
      feedback.textContent = 'Le password non coincidono.';
      feedback.style.display = 'block';
      feedback.className = 'form-feedback error';
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    try {
      await adminRegister(name, email, password, password_confirmation);
      window.location.href = 'admin.html';
    } catch (err) {
      feedback.textContent = err.message || 'Errore nella registrazione.';
      feedback.style.display = 'block';
      feedback.className = 'form-feedback error';
    }
    if (btn) btn.disabled = false;
  });
}
