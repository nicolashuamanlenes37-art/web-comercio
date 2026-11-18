import { $, esc, icon } from '../lib/dom.js';
import { money, priceLabel, plural } from '../lib/format.js';
import { waLink, orderMessage } from '../lib/whatsapp.js';
import { imgSrc } from '../lib/product-image.js';
import { createDrawer } from '../lib/drawer.js';
import { cart } from '../store/cart.js';
import { track } from '../lib/analytics.js';

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

  $('#drawerEmpty').hidden = lines.length > 0;
  $('#sendOrder').disabled = lines.length === 0;
  $('#drawerSubtotal').textContent = subtotal > 0 ? money(subtotal) : 'Por confirmar';
  $('#drawerNote').textContent = unpriced
    ? 'Los productos sin precio y el envío se confirman por WhatsApp.'
    : 'El costo de envío se confirma por WhatsApp.';
  $('#drawerLines').innerHTML = lines
    .map(
      (l) => `
    <li class="line" data-id="${esc(l.product.id)}">
      <img class="line__img" src="${imgSrc(l.product.image)}" alt="" width="56" height="56" />
      <div class="line__info">
        <strong>${esc(l.product.name)}</strong>
        <span>${priceLabel(l.product.price)}</span>
      </div>
      <div class="stepper" aria-label="Cantidad">
        <button type="button" data-step="-1" aria-label="Quitar uno">${icon.minus}</button>
        <span>${l.qty}</span>
        <button type="button" data-step="1" aria-label="Agregar uno">${icon.plus}</button>
      </div>
    </li>`,
    )
    .join('');
}

function bump() {
  const bar = $('#orderBar');
  bar.classList.remove('is-bump');
  void bar.offsetWidth;
  bar.classList.add('is-bump');
}

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

  $('#sendOrder').addEventListener('click', () => {
    const msg = orderMessage(cart.lines(), cart.subtotal(), cart.hasUnpriced());
    track('whatsapp_order', {
      items: cart.lines().reduce((n, l) => n + l.qty, 0),
      value: cart.subtotal(),
      currency: 'PEN',
    });
    window.open(waLink(msg), '_blank', 'noopener');
  });

  cart.onChange((ev) => {
    render();
    if (ev.type === 'add') bump();
  });
  render();
}
