export function getQueryParam(name) {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const value = params.get(name);
  return value === null ? null : value;
}

export function setText(id, text) {
  const el = document.getElementById(id);
  if (el && text != null) el.textContent = text;
}

export function setHtml(id, html) {
  const el = document.getElementById(id);
  if (el && html != null) el.innerHTML = html;
}

