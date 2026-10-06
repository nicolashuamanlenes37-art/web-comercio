import { esc, icon } from '../lib/dom.js';
import { money, weight } from '../lib/format.js';
import { cart } from '../store/cart.js';

/** Presentación elegida por producto (se mantiene entre re-renders). */
export const selectedSize = new Map();
const sizeOf = (p) => p.sizes[selectedSize.get(p.id) ?? 0];

/**
 * Tarjeta de producto del catálogo.
 * Imagen 1:1 con radio interior 20px dentro de una tarjeta de 28px + 8px de margen.
 */
export function productCard(p, { reveal = true, delay = 0 } = {}) {
  const size = sizeOf(p);
  const qty = cart.qty(p.id, size.grams);
  return `
  <article class="product" data-product="${p.id}" ${reveal ? `data-reveal style="--delay:${delay}s"` : ''}>
    <div class="product__media">
      <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" decoding="async" width="400" height="400" />
      ${p.badge ? `<span class="product__badge">${esc(p.badge)}</span>` : ''}
    </div>
    <div class="product__body">
      <h3 class="product__name">${esc(p.name)}</h3>
      <p class="product__desc">${esc(p.description)}</p>
      <div class="segmented" role="radiogroup" aria-label="Presentación de ${esc(p.name)}">
        ${p.sizes
          .map(
            (s, i) =>
              `<button type="button" role="radio" aria-checked="${s === size}" data-size="${i}">${weight(s.grams)}</button>`,
          )
          .join('')}
      </div>
      <div class="product__foot">
        <span class="product__price">${money(size.price)}</span>
        <button type="button" class="add-btn ${qty ? 'is-added' : ''}" data-add
          aria-label="Agregar ${esc(p.name)} ${weight(size.grams)} al pedido">
          ${qty ? `<span>${qty}</span>` : icon.plus}
        </button>
      </div>
    </div>
  </article>`;
}

/** Tarjeta flotante y compacta del hero. */
export function floatCard(p) {
  const size = p.sizes[0];
  return `
  <a class="float-card" href="#p-${p.id}" data-jump="${p.id}" aria-label="${esc(p.name)}">
    <img src="${esc(p.image)}" alt="" width="240" height="240" fetchpriority="high" />
    <span class="float-card__name">${esc(p.name.replace(/ en polvo$/, ''))}</span>
    <span class="float-card__meta">desde ${money(size.price)}</span>
  </a>`;
}
