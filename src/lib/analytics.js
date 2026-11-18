import { SITE } from '../config.js';

/**
 * Google Analytics 4. Se activa solo si hay un ID en src/config.js (SITE.gaId).
 * Se inicia desde aquí (sin <script> en línea) para que la política de seguridad
 * de la página no tenga que permitir scripts incrustados.
 */
export function initAnalytics() {
  if (!SITE.gaId || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', SITE.gaId);

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(SITE.gaId)}`;
  document.head.append(script);
}

/** Registra un evento (no hace nada si Analytics está apagado). */
export function track(event, params = {}) {
  window.gtag?.('event', event, params);
}

/** Registra los clics en cualquier enlace de WhatsApp de la página. */
export function trackWhatsAppClicks(root = document) {
  root.addEventListener('click', (e) => {
    const a = e.target.closest('[data-wa]');
    if (!a) return;
    const where = a.closest('.wa-fab')
      ? 'boton_flotante'
      : a.closest('.topband')
        ? 'banda_superior'
        : a.closest('footer')
          ? 'footer'
          : 'contenido';
    track('whatsapp_click', { ubicacion: where });
  });
}
