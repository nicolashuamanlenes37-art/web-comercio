import { $, esc, icon } from '../lib/dom.js';
import { money, weight, plural } from '../lib/format.js';
import { waLink, orderMessage } from '../lib/whatsapp.js';
import { cart } from '../store/cart.js';

let lastFocus = null;

function render() {
  const lines = cart.lines();
  const count = cart.count();
  const subtotal = cart.subtotal();

  // Header
  const badge = $('#cartBadge');
  badge.hidden = count === 0;
  badge.textContent = count;

  // Barra flotante
  $('#orderBar').hidden = count === 0;
  $('#orderBarCount').textContent = count;
  $('#orderBarTotal').textContent = `${plural(count, 'producto', 'productos')} · ${money(subtotal)}`;

  // Panel
  $('#drawerEmpty').hidden = lines.length > 0;
  $('#sendOrder').disabled = lines.length === 0;
  $('#drawerSubtotal').textContent = money(subtotal);
  $('#drawerLines').innerHTML = lines
    .map(
      (l) => `
    <li class="line" data-key="${l.key}">
      <img class="line__img" src="${esc(l.product.image)}" alt="" width="64" height="64" />
      <div class="line__info">
        <strong>${esc(l.product.name)}</strong>
        <span>${weight(l.size.grams)} · ${money(l.size.price)}</span>
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
  $('#drawer .drawer__head .icon-btn').focus();
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
      const key = step.closest('.line').dataset.key;
      const line = cart.lines().find((l) => l.key === key);
      cart.set(key, line.qty + Number(step.dataset.step));
    }
  });

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('#drawer').hidden) closeDrawer();
  });

  $('#sendOrder').addEventListener('click', () => {
    window.open(waLink(orderMessage(cart.lines(), cart.subtotal())), '_blank', 'noopener');
  });

  cart.onChange((ev) => {
    render();
    if (ev.type === 'add') bump();
  });
  render();
}
