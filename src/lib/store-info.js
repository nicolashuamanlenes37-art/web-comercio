import { STORE } from '../config.js';
import { bindWhatsAppLinks } from './whatsapp.js';

const prettyPhone = (n) => n.replace(/^51/, '').replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');

/** Rellena datos de contacto comunes a todas las páginas. */
export function initStoreInfo(root = document) {
  root.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
  root.querySelectorAll('[data-store-phone]').forEach((el) => (el.textContent = prettyPhone(STORE.whatsapp)));
  root.querySelectorAll('[data-store-email]').forEach((a) => {
    if (!STORE.email) return a.remove();
    a.href = `mailto:${STORE.email}`;
    a.textContent = STORE.email;
  });
  root.querySelectorAll('[data-store-instagram]').forEach((a) => {
    if (!STORE.instagram) return a.remove();
    a.href = STORE.instagram;
  });
  root.querySelectorAll('[data-legal]').forEach((el) => (el.textContent = STORE.legal[el.dataset.legal] || ''));
  bindWhatsAppLinks(root);
}
