import { $, esc, icon } from '../lib/dom.js';
import { money, priceLabel, plural } from '../lib/format.js';
import { waLink, orderMessage } from '../lib/whatsapp.js';
import { PLACEHOLDER } from '../components/productCard.js';
import { cart } from '../store/cart.js';

let lastFocus = null;

function render() {
  const lines = cart.lines();
  const count = cart.count();
  const subtotal = cart.subtotal();
  const unpriced = cart.hasUnpriced();

  const badge = $('#cartBadge');
  badge.hidden = count === 0;
  badge.textContent = count;

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
      <img class="line__img" src="${esc(l.product.image || PLACEHOLDER)}" alt="" width="56" height="56" />
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

export function openDrawer() {
  lastFocus = document.activeElement;
  const drawer = $('#drawer');
  drawer.hidden = false;
  requestAnimationFrame(() => drawer.classList.add('is-open'));
  document.documentElement.classList.add('no-scroll');
  $('#drawer [data-close].icon-btn').focus();
}

export function closeDrawer() {
  const drawer = $('#drawer');
  drawer.classList.remove('is-open');
  document.documentElement.classList.remove('no-scroll');
  $('.drawer__panel', drawer).addEventListener('transitionend', () => (drawer.hidden = true), { once: true });
  lastFocus?.focus();
}

export function initCartDrawer() {
  $('#cartButton').addEventListener('click', openDrawer);
  $('#orderBar').addEventListener('click', openDrawer);

  $('#drawer').addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) return closeDrawer();
    const step = e.target.closest('[data-step]');
    if (step) {
      const id = step.closest('.line').dataset.id;
      cart.set(id, cart.qty(id) + Number(step.dataset.step));
    }
  });

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('#drawer').hidden) closeDrawer();
  });

  $('#sendOrder').addEventListener('click', () => {
    const msg = orderMessage(cart.lines(), cart.subtotal(), cart.hasUnpriced());
    window.open(waLink(msg), '_blank', 'noopener');
  });

  cart.onChange((ev) => {
    render();
    if (ev.type === 'add') bump();
  });
  render();
}
