import { $, $$, esc, normalize } from '../lib/dom.js';
import { reveal } from '../lib/motion.js';
import { PRODUCTS, LIFESTYLE, categoryById, productById } from '../data/products.js';
import { productCard, selectedSize } from '../components/productCard.js';
import { cart } from '../store/cart.js';

const filter = { query: '', category: '' };

/* ---------- Render ---------- */

function renderBands() {
  $$('[data-grid]').forEach((grid) => {
    const cats = grid.dataset.grid.split(',');
    const cards = PRODUCTS.filter((p) => cats.includes(p.category))
      .map((p, i) => productCard(p, { delay: (i + 1) * 0.06 }))
      .join('');
    grid.insertAdjacentHTML('beforeend', cards); // conserva la foto de la banda
  });
  $$('[data-lifestyle]').forEach((img) => {
    img.src = LIFESTYLE[img.dataset.lifestyle];
  });
  // Cada producto tiene un ancla para los enlaces del hero
  $$('[data-band] .product').forEach((el) => (el.id = `p-${el.dataset.product}`));
}

function renderResults() {
  const q = normalize(filter.query);
  const list = PRODUCTS.filter(
    (p) =>
      (!filter.category || p.category === filter.category) &&
      (!q || normalize(`${p.name} ${p.description}`).includes(q)),
  );
  const title = filter.category
    ? categoryById(filter.category).name
    : `Resultados para “${esc(filter.query)}”`;

  $('#resultsTitle').innerHTML = title;
  $('#resultsGrid').innerHTML = list.map((p, i) => productCard(p, { delay: i * 0.04 })).join('');
  $('#resultsEmpty').hidden = list.length > 0;
  reveal($('#results'));
}

/* ---------- Filtro (lo usa el hero) ---------- */

export function setFilter({ query = '', category = '' }, { scroll = false } = {}) {
  filter.query = query;
  filter.category = category;
  const active = Boolean(query || category);

  $('#results').hidden = !active;
  $$('[data-band]').forEach((band) => (band.hidden = active));
  if (active) renderResults();
  if (scroll) $('#catalogo').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function scrollToProduct(id) {
  setFilter({});
  const el = document.getElementById(`p-${id}`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.remove('is-highlight');
  void el.offsetWidth;
  el.classList.add('is-highlight');
}

/* ---------- Interacción en las tarjetas ---------- */

/** Vuelve a pintar todas las copias de un producto (puede estar en banda y en resultados). */
function refreshProduct(id) {
  const p = productById(id);
  $$(`.product[data-product="${id}"]`).forEach((old) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = productCard(p, { reveal: false });
    const card = tmp.firstElementChild;
    card.id = old.id;
    old.replaceWith(card);
  });
}

function bindCards() {
  $('#catalogo').addEventListener('click', (e) => {
    const card = e.target.closest('.product');
    if (!card) return;
    const id = card.dataset.product;

    const sizeBtn = e.target.closest('[data-size]');
    if (sizeBtn) {
      selectedSize.set(id, Number(sizeBtn.dataset.size));
      refreshProduct(id);
      return;
    }

    if (e.target.closest('[data-add]')) {
      const p = productById(id);
      const size = p.sizes[selectedSize.get(id) ?? 0];
      cart.add(id, size.grams);
      const btn = $(`.product[data-product="${id}"] [data-add]`);
      btn?.classList.add('is-pop');
    }
  });

  cart.onChange((ev) => {
    if (ev.productId) refreshProduct(ev.productId);
    else PRODUCTS.forEach((p) => refreshProduct(p.id));
  });

  $('#clearFilter').addEventListener('click', () => {
    $('#searchInput').value = '';
    $('#categoryPills .pill')?.click();
  });
}

export function initCatalog() {
  renderBands();
  bindCards();
  reveal();
}
