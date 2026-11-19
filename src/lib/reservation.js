import { STORE, SUPABASE } from '../config.js';
import { money, prettyPhone, listText } from './format.js';
import { resizeImage } from './image-resize.js';
import { restUpload } from './rest.js';

const { percent } = STORE.reservation;

/**
 * Divide el total en adelanto (30 %) y saldo (70 %).
 * Se calcula sobre el TOTAL del pedido, en céntimos, para que siempre sumen exacto.
 */
export function splitPayment(total) {
  const cents = Math.round(total * 100);
  const deposit = Math.round((cents * percent) / 100);
  return { total: cents / 100, deposit: deposit / 100, balance: (cents - deposit) / 100 };
}

/** N.° de operación de Yape/Plin: dígitos o letras, 4 a 20 caracteres. */
export const validOperation = (value) => /^[0-9A-Za-z-]{4,20}$/.test(value.trim());

/**
 * Prepara la captura apenas el cliente la elige: la reduce (legible y liviana) a JPEG.
 * Se hace antes del clic en "Enviar" porque el celular solo permite abrir el menú
 * Compartir justo al tocar el botón, sin esperas de por medio.
 */
export async function prepareCapture(file) {
  const { blob, ext, type } = await resizeImage(file, { maxSide: 1600, jpeg: true });
  return { blob, ext, type, file: new File([blob], `captura-adelanto.${ext}`, { type }) };
}

/** Sube la captura ya preparada y devuelve el link para verla (envío desde computadora). */
export const uploadCapture = ({ blob, ext, type }) =>
  restUpload(SUPABASE.captures, `capturas/${crypto.randomUUID()}.${ext}`, blob, type);

/**
 * ¿Se puede enviar la captura como imagen con el menú Compartir del celular?
 * Solo en pantallas táctiles: en computadora se usa el link.
 */
export const canShareCapture = (file) =>
  matchMedia('(pointer: coarse)').matches && Boolean(navigator.canShare?.({ files: [file] }));

/** Datos de pago que se muestran al cliente. */
export const paymentInfo = () => ({
  methods: listText(STORE.reservation.methods, 'disjunction'),
  phone: prettyPhone(STORE.reservation.phone),
  holder: STORE.reservation.holder,
});

/**
 * Mensaje de WhatsApp con el pedido reservado.
 * Sin captureUrl, la captura va adjunta como imagen (menú Compartir del celular).
 */
export function reservationMessage(lines, { total, deposit, balance }, operation, captureUrl = null) {
  return [
    `Hola ${STORE.name}, quiero reservar este pedido:`,
    '',
    ...lines.map((l) => `• ${l.qty} × ${l.product.name} — ${money(l.total)}`),
    '',
    `Total: ${money(total)}`,
    `Adelanto pagado (${percent} %): ${money(deposit)}`,
    `N.° de operación: ${operation.trim()}`,
    captureUrl ? `Captura del pago: ${captureUrl}` : 'Captura del pago: va en esta imagen.',
    `Saldo a pagar al recibir (${100 - percent} %): ${money(balance)}`,
    '',
    'Mi nombre: ',
    'Mi distrito / dirección de entrega: ',
  ].join('\n');
}
