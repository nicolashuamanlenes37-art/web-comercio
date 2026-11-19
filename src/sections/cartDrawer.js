import { $, esc, icon } from '../lib/dom.js';
import { money, priceLabel, plural } from '../lib/format.js';
import { waLink, orderMessage } from '../lib/whatsapp.js';
import {
  splitPayment,
  validOperation,
  prepareCapture,
  uploadCapture,
  canShareCapture,
  paymentInfo,
  reservationMessage,
} from '../lib/reservation.js';
import { imgSrc } from '../lib/product-image.js';
import { createDrawer } from '../lib/drawer.js';
import { cart } from '../store/cart.js';
import { track } from '../lib/analytics.js';
import { STORE } from '../config.js';

let capture = null; // captura lista para enviar: { blob, ext, type, file }
let preparing = false;
let sending = false;

/* ---------- Estado de la reserva ---------- */

/** Qué le falta al cliente para poder enviar (null = listo). */
function missingStep() {
  if (preparing) return 'Preparando la captura…';
  if (!capture) return 'Sube la captura del pago para continuar.';
  if (!validOperation($('#operationInput').value)) return 'Escribe el número de operación del pago.';
  if (!$('#reserveTerms').checked) return 'Acepta las condiciones de la reserva.';
  return null;
}

function updateSendButton() {
  const lines = cart.lines();
  const btn = $('#sendOrder');
  if (!lines.length) return;
  if (cart.hasUnpriced()) {
    btn.textContent = 'Consultar por WhatsApp';
    btn.disabled = false;
    $('#sendHint').textContent = '';
    return;
  }
  const missing = missingStep();
  btn.textContent = sending ? 'Enviando reserva…' : 'Enviar reserva por WhatsApp';
  btn.disabled = sending || Boolean(missing);
  $('#sendHint').textContent = sending
    ? ''
    : missing ||
      (canShareCapture(capture.file)
        ? `Elige WhatsApp y luego el chat de ${STORE.name} (${paymentInfo().phone}).`
        : 'Se abrirá WhatsApp con tu pedido listo para enviar.');
}

function setCapture(file) {
  const image = file && file.type.startsWith('image/') ? file : null;
  capture = null;
  preparing = Boolean(image);
  $('#reserveError').hidden = true;

  const preview = $('#capturePreview');
  if (preview.src) URL.revokeObjectURL(preview.src);
  preview.hidden = !image;
  if (image) preview.src = URL.createObjectURL(image);
  else preview.removeAttribute('src');
  $('#captureBox').classList.toggle('has-file', Boolean(image));
  $('#captureText').textContent = image ? 'Cambiar captura' : 'Elegir captura';
  updateSendButton();

  if (!image) return;
  prepareCapture(image)
    .then((ready) => {
      if ($('#captureInput').files[0] === file) capture = ready; // ignora si ya eligió otra
    })
    .catch((err) => {
      console.error('No se pudo leer la captura', err);
      showError('No se pudo leer esa imagen. Prueba con otra captura.');
    })
    .finally(() => {
      preparing = false;
      updateSendButton();
    });
}

function resetReserveForm() {
  $('#reserveForm').reset();
  setCapture(null);
  $('#reserveError').hidden = true;
}

/* ---------- Dibujo del pedido ---------- */

function render() {
  const lines = cart.lines();
  const count = cart.count();
  const subtotal = cart.subtotal();
  const unpriced = cart.hasUnpriced();

  const badge = $('#cartBadge');
  badge.hidden = count === 0;
  badge.textContent = count;
  const label = count ? `Ver pedido, ${plural(count, 'producto', 'productos')}` : 'Ver pedido';
  $('#cartButton').setAttribute('aria-label', label);
  $('#orderBar').setAttribute('aria-label', label);

  $('#orderBar').hidden = count === 0;
  document.body.classList.toggle('has-order', count > 0);
  $('#orderBarCount').textContent = count;
  $('#orderBarTotal').textContent =
    subtotal > 0 ? `${plural(count, 'producto', 'productos')} · ${money(subtotal)}` : plural(count, 'producto', 'productos');

  const empty = lines.length === 0;
  $('#drawerEmpty').hidden = !empty || !$('#reserveDone').hidden;
  $('#drawerSummary').hidden = empty;
  $('#drawerFoot').hidden = empty;
  if (!empty) $('#reserveDone').hidden = true;

  $('#drawerSubtotal').textContent = unpriced ? 'Por confirmar' : money(subtotal);
  $('#drawerNote').textContent = unpriced
    ? 'Algunos productos no tienen precio publicado. Consúltanos por WhatsApp y te confirmamos el precio antes de reservar.'
    : 'El costo del delivery se coordina por WhatsApp.';

  // Reserva: el 30 % se calcula sobre el total del pedido (no producto por producto)
  $('#reserveForm').hidden = unpriced || empty;
  if (!unpriced && !empty) {
    const { deposit, balance } = splitPayment(subtotal);
    $('#reserveDeposit').textContent = money(deposit);
    $('#reserveBalance').textContent = money(balance);
  }

  $('#drawerLines').innerHTML = lines
    .map(
      (l) => `
    <li class="line" data-id="${esc(l.product.id)}">
      <img class="line__img" src="${imgSrc(l.product.image)}" alt="" width="56" height="56" />
      <div class="line__info">
        <strong>${esc(l.product.name)}</strong>
        <span>${l.qty > 1 && l.total !== null ? `${l.qty} × ${money(l.product.price)} = ${money(l.total)}` : priceLabel(l.product.price)}</span>
      </div>
      <div class="stepper" aria-label="Cantidad">
        <button type="button" data-step="-1" aria-label="Quitar uno">${icon.minus}</button>
        <span>${l.qty}</span>
        <button type="button" data-step="1" aria-label="Agregar uno">${icon.plus}</button>
      </div>
    </li>`,
    )
    .join('');
  updateSendButton();
}

function bump() {
  const bar = $('#orderBar');
  bar.classList.remove('is-bump');
  void bar.offsetWidth;
  bar.classList.add('is-bump');
}

/* ---------- Envío ---------- */

function showError(message) {
  const el = $('#reserveError');
  el.textContent = message;
  el.hidden = false;
}

/** Productos sin precio: se envía una consulta normal (sin reserva). */
function sendInquiry() {
  const msg = orderMessage(cart.lines(), cart.subtotal(), cart.hasUnpriced());
  track('whatsapp_order', { items: cart.count(), value: cart.subtotal(), currency: 'PEN' });
  window.open(waLink(msg), '_blank', 'noopener');
}

/** Muestra la confirmación y vacía el pedido. */
function finishReservation(split, againLink) {
  track('reserva_enviada', { items: cart.count(), value: split.total, deposit: split.deposit, currency: 'PEN' });
  $('#reserveAgain').href = againLink;
  $('#reserveDone').hidden = false;
  resetReserveForm();
  cart.clear();
  $('#reserveDone').focus();
}

/**
 * Celular: menú Compartir con la captura como IMAGEN y el pedido escrito debajo.
 * Devuelve false si el cliente lo canceló.
 */
async function sendByShare(lines, split, operation) {
  const text = reservationMessage(lines, split, operation);
  // Respaldo: el pedido queda copiado por si WhatsApp no pega el texto junto a la imagen
  navigator.clipboard?.writeText(text).catch(() => {});
  try {
    await navigator.share({ files: [capture.file], text });
  } catch (err) {
    if (err.name === 'AbortError') return false; // cerró el menú sin compartir
    throw err;
  }
  finishReservation(split, waLink(text));
  return true;
}

/** Computadora (o celular sin menú Compartir): sube la captura y envía su link. */
async function sendByLink(lines, split, operation) {
  // La ventana se abre YA (dentro del clic); si se abre después de subir la foto,
  // el navegador la bloquea como ventana emergente.
  const win = window.open('', '_blank');
  try {
    const captureUrl = await uploadCapture(capture);
    const link = waLink(reservationMessage(lines, split, operation, captureUrl));
    if (win) {
      win.opener = null;
      win.location.href = link;
    } else {
      location.href = link;
    }
    finishReservation(split, link);
  } catch (err) {
    win?.close();
    throw err;
  }
}

async function sendReservation() {
  const missing = missingStep();
  if (missing) return showError(missing);

  const lines = cart.lines();
  const split = splitPayment(cart.subtotal());
  const operation = $('#operationInput').value;
  const share = canShareCapture(capture.file);

  sending = true;
  $('#reserveError').hidden = true;
  updateSendButton();
  try {
    if (share) {
      try {
        await sendByShare(lines, split, operation);
      } catch (err) {
        console.warn('Compartir falló, se envía con link', err);
        await sendByLink(lines, split, operation);
      }
    } else {
      await sendByLink(lines, split, operation);
    }
  } catch (err) {
    console.error('No se pudo enviar la reserva', err);
    showError('No se pudo enviar la reserva. Revisa tu conexión e inténtalo de nuevo.');
  } finally {
    sending = false;
    updateSendButton();
  }
}

/* ---------- Inicio ---------- */

export function initCartDrawer() {
  const drawer = createDrawer($('#drawer'));
  $('#cartButton').addEventListener('click', drawer.open);
  $('#orderBar').addEventListener('click', drawer.open);

  $('#drawerLines').addEventListener('click', (e) => {
    const step = e.target.closest('[data-step]');
    if (!step) return;
    const id = step.closest('.line').dataset.id;
    cart.set(id, cart.qty(id) + Number(step.dataset.step));
    // La lista se vuelve a dibujar: devolver el foco al mismo botón (o a cerrar si se quitó)
    const again = $(`.line[data-id="${CSS.escape(id)}"] [data-step="${step.dataset.step}"]`);
    (again || $('#drawer .drawer__head [data-close]')).focus();
  });

  // Datos de pago (Yape / Plin)
  const pay = paymentInfo();
  $('[data-pay-methods]').textContent = pay.methods;
  $('[data-pay-phone]').textContent = pay.phone;
  $('[data-pay-holder]').textContent = pay.holder;
  $('#copyPhone').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    try {
      await navigator.clipboard.writeText(pay.phone.replace(/\s/g, ''));
      btn.textContent = '¡Copiado!';
    } catch {
      btn.textContent = pay.phone; // sin permiso de portapapeles: al menos se ve el número
    }
  });

  $('#captureInput').addEventListener('change', (e) => setCapture(e.target.files[0]));
  $('#operationInput').addEventListener('input', updateSendButton);
  $('#reserveTerms').addEventListener('change', updateSendButton);
  $('#reserveForm').addEventListener('submit', (e) => e.preventDefault());

  $('#sendOrder').addEventListener('click', () => (cart.hasUnpriced() ? sendInquiry() : sendReservation()));

  cart.onChange((ev) => {
    render();
    if (ev.type === 'add') bump();
  });
  render();
}
