import { STORE } from '../config.js';
import { prettyPhone } from './format.js';
import { bindWhatsAppLinks } from './whatsapp.js';
import { initAnalytics, trackWhatsAppClicks } from './analytics.js';

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
    a.target = '_blank';
    a.rel = 'noopener';
  });
  root.querySelectorAll('[data-store-hours]').forEach((el) => {
    if (!STORE.hours) return el.remove();
    el.textContent = `Horario: ${STORE.hours}`;
  });
  root.querySelectorAll('[data-legal]').forEach((el) => {
    const value = STORE.legal[el.dataset.legal];
    if (!value) return el.remove();
    el.textContent = value;
  });
  bindWhatsAppLinks(root);
  initAnalytics();
  trackWhatsAppClicks(root);
}
