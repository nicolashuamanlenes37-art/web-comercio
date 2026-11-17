/**
 * Eventos para Google Analytics 4. Si no hay ID configurado en src/config.js
 * (SITE.gaId), gtag no existe y esto no hace nada.
 */
export function track(event, params = {}) {
  if (typeof window.gtag === 'function') window.gtag('event', event, params);
}

/** Registra los clics en cualquier enlace de WhatsApp de la página. */
export function trackWhatsAppClicks(root = document) {
  root.addEventListener('click', (e) => {
    const a = e.target.closest('[data-wa]');
    if (!a) return;
    const where = a.closest('.wa-fab') ? 'boton_flotante' : a.closest('.topband') ? 'banda_superior' : a.closest('footer') ? 'footer' : 'contenido';
    track('whatsapp_click', { ubicacion: where });
  });
}
