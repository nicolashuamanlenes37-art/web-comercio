import { esc, icon } from '../lib/dom.js';
import { priceLabel } from '../lib/format.js';
import { cart } from '../store/cart.js';

/** Imagen de reemplazo cuando un producto aún no tiene foto. */
export const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f2f4f5"/><path d="M38 40h24l-2 22H40z" fill="none" stroke="#bbb" stroke-width="2.5" stroke-linejoin="round"/><path d="M44 40v-3a6 6 0 0 1 12 0v3" fill="none" stroke="#bbb" stroke-width="2.5"/></svg>',
  );

const imgSrc = (p) => esc(p.image || PLACEHOLDER);

/**
 * Tarjeta de producto del catálogo.
 * Imagen 1:1 con radio interior 20px dentro de una tarjeta de 28px + 8px de margen.
 */
export function productCard(p, { reveal = true, delay = 0 } = {}) {
  const qty = cart.qty(p.id);
  const hasPrice = p.price !== null;
  return `
  <article class="product" data-product="${esc(p.id)}" id="p-${esc(p.id)}" ${reveal ? `data-reveal style="--delay:${delay}s"` : ''}>
    <div class="product__media">
      <img src="${imgSrc(p)}" alt="${esc(p.name)}" loading="lazy" decoding="async" width="400" height="400" />
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

/** Tarjeta flotante y compacta del hero. */
export function floatCard(p) {
  return `
  <a class="float-card" href="#p-${esc(p.id)}" data-jump="${esc(p.id)}" aria-label="${esc(p.name)}">
    <img src="${imgSrc(p)}" alt="" width="240" height="240" fetchpriority="high" />
    <span class="float-card__name">${esc(p.name)}</span>
    <span class="float-card__meta">${priceLabel(p.price)}</span>
  </a>`;
}
