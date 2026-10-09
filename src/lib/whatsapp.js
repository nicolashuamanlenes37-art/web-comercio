import { STORE } from '../config.js';
import { money } from './format.js';

export const waLink = (message) =>
  `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`;

/** Mensaje de pedido con el detalle del carrito. */
export function orderMessage(lines, subtotal, hasUnpriced) {
  return [
    `Hola ${STORE.name}, quiero hacer este pedido:`,
    '',
    ...lines.map(
      (l) => `• ${l.qty} × ${l.product.name}${l.total === null ? ' (consultar precio)' : ` — ${money(l.total)}`}`,
    ),
    '',
    subtotal > 0 ? `Subtotal${hasUnpriced ? ' (sin los productos por consultar)' : ''}: ${money(subtotal)}` : null,
    'Mi distrito / ciudad: ',
  ]
    .filter((line) => line !== null)
    .join('\n');
}

/** Convierte los enlaces marcados con data-wa en enlaces de WhatsApp. */
export function bindWhatsAppLinks(root = document) {
  root.querySelectorAll('[data-wa]').forEach((a) => {
    a.href = waLink(a.dataset.waMsg || `Hola ${STORE.name}, quiero información sobre sus productos`);
    a.target = '_blank';
    a.rel = 'noopener';
  });
}
