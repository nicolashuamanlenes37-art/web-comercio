import { esc, icon } from '../lib/dom.js';
import { priceLabel } from '../lib/format.js';
import { cart } from '../store/cart.js';
import { imgSrc } from '../lib/product-image.js';

/** Contenido del botón "+": el ícono, o la cantidad si ya está en el pedido. */
export function paintAddButton(btn, qty) {
  btn.classList.toggle('is-added', qty > 0);
  btn.innerHTML = qty ? `<span>${qty}</span>` : icon.plus;
}

/**
 * Tarjeta de producto del catálogo.
 * Imagen 1:1 con radio interior 20px dentro de una tarjeta de 28px + 8px de margen.
 * `anchor`: agrega id="p-…" para poder saltar a ella (solo en las bandas, no en resultados).
 */
export function productCard(p, { reveal = true, delay = 0, anchor = false } = {}) {
  const qty = cart.qty(p.id);
  const hasPrice = p.price !== null;
  return `
  <article class="product" data-product="${esc(p.id)}"${anchor ? ` id="p-${esc(p.id)}"` : ''} ${reveal ? `data-reveal style="--delay:${delay}s"` : ''}>
    <div class="product__media">
      <img src="${imgSrc(p.image)}" alt="${esc(p.name)}" loading="lazy" decoding="async" width="400" height="400" />
      ${p.badge ? `<span class="product__badge">${esc(p.badge)}</span>` : ''}
    </div>
    <div class="product__body">
      <h3 class="product__name">${esc(p.name)}</h3>
      ${p.description ? `<p class="product__desc">${esc(p.description)}</p>` : ''}
      <div class="product__foot">
        <span class="product__price ${hasPrice ? '' : 'product__price--ask'}">${priceLabel(p.price)}</span>
        <button type="button" class="add-btn ${qty ? 'is-added' : ''}" data-add
          aria-label="Agregar ${esc(p.name)} al pedido">
          ${qty ? `<span>${qty}</span>` : icon.plus}
        </button>
      </div>
    </div>
  </article>`;
}

/** Tarjeta flotante y compacta del hero (decorativa: fuera del orden del teclado). */
export function floatCard(p) {
  return `
  <a class="float-card" href="#p-${esc(p.id)}" data-jump="${esc(p.id)}" tabindex="-1">
    <img src="${imgSrc(p.image)}" alt="" width="240" height="240" fetchpriority="high" />
    <span class="float-card__name">${esc(p.name)}</span>
    <span class="float-card__meta">${priceLabel(p.price)}</span>
  </a>`;
}
