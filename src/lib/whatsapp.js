import { STORE } from '../config.js';
import { money, weight } from './format.js';

export const waLink = (message) =>
  `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`;

/** Mensaje de pedido con el detalle del carrito. */
export function orderMessage(lines, subtotal) {
  return [
    `Hola ${STORE.name}, quiero hacer este pedido:`,
    '',
    ...lines.map((l) => `• ${l.qty} × ${l.product.name} ${weight(l.size.grams)} — ${money(l.total)}`),
    '',
    `Subtotal: ${money(subtotal)}`,
    '',
    'Mi distrito / ciudad: ',
  ].join('\n');
}

/** Convierte los enlaces marcados con data-wa en enlaces de WhatsApp. */
export function bindWhatsAppLinks(root = document) {
  root.querySelectorAll('[data-wa]').forEach((a) => {
    a.href = waLink(a.dataset.waMsg || `Hola ${STORE.name}, quiero información sobre sus productos`);
    a.target = '_blank';
    a.rel = 'noopener';
  });
}
