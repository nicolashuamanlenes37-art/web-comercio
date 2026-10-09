import { $, $$, esc, normalize } from '../lib/dom.js';
import { reveal } from '../lib/motion.js';
import { plural } from '../lib/format.js';
import { productCard } from '../components/productCard.js';
import { cart } from '../store/cart.js';

let data = { categories: [], products: [] };
const filter = { query: '', category: '' };

const productsOf = (catId) => data.products.filter((p) => p.categoryId === catId);
const productById = (id) => data.products.find((p) => p.id === id);

/* ---------- Render ---------- */

/** Una banda por categoría: foto de portada (si tiene) + productos. */
function bandHTML(cat, items = productsOf(cat.id)) {
  if (!items.length) return '';
  const cover = cat.cover
    ? `<figure class="tile tile--fill tile--dark" data-reveal>
         <img src="${esc(cat.cover)}" alt="" loading="lazy" decoding="async" />
         <figcaption class="tile__overlay">
           <strong>${esc(cat.name)}</strong>
           <span>${esc(cat.tagline || plural(items.length, 'producto', 'productos'))}</span>
         </figcaption>
       </figure>`
    : '';
  return `
  <section class="band container" id="${esc(cat.slug)}" data-band>
    <div class="band__head">
      <h2 class="band__title">${esc(cat.name)} <span class="band__chev"></span></h2>
      <span class="band__count">${plural(items.length, 'producto', 'productos')}</span>
    </div>
    <div class="grid grid--4">
      ${cover}
      ${items.map((p, i) => productCard(p, { delay: ((i + 1) % 4) * 0.06 })).join('')}
    </div>
  </section>`;
}

function renderBands() {
  const known = new Set(data.categories.map((c) => c.id));
  const orphans = data.products.filter((p) => !known.has(p.categoryId));
  $('#bands').innerHTML =
    data.categories.map((c) => bandHTML(c)).join('') +
    bandHTML({ slug: 'otros', name: 'Otros productos', cover: '' }, orphans);
  reveal($('#bands'));
}

function renderResults() {
  const q = normalize(filter.query);
  const list = data.products.filter(
    (p) =>
      (!filter.category || p.categoryId === filter.category) &&
      (!q || normalize(`${p.name} ${p.description}`).includes(q)),
  );
  const cat = data.categories.find((c) => c.id === filter.category);
  $('#resultsTitle').textContent = cat ? cat.name : `Resultados para “${filter.query}”`;
  $('#resultsGrid').innerHTML = list.map((p, i) => productCard(p, { delay: (i % 8) * 0.04 })).join('');
  $('#resultsEmpty').hidden = list.length > 0;
  reveal($('#results'));
}

/* ---------- Filtro (lo usa el hero) ---------- */

export function setFilter({ query = '', category = '' }, { scroll = false } = {}) {
  filter.query = query;
  filter.category = category;
  const active = Boolean(query || category);
  $('#results').hidden = !active;
  $('#bands').hidden = active;
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

/* ---------- Interacción ---------- */

function refreshProduct(id) {
  const p = productById(id);
  if (!p) return;
  $$(`.product[data-product="${CSS.escape(id)}"]`).forEach((old) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = productCard(p, { reveal: false });
    old.replaceWith(tmp.firstElementChild);
  });
}

function bindEvents() {
  $('#catalogo').addEventListener('click', (e) => {
    const card = e.target.closest('.product');
    if (!card || !e.target.closest('[data-add]')) return;
    const id = card.dataset.product;
    cart.add(id);
    $(`.product[data-product="${CSS.escape(id)}"] [data-add]`)?.classList.add('is-pop');
  });

  cart.onChange((ev) => {
    if (ev.productId) refreshProduct(ev.productId);
  });

  $('#clearFilter').addEventListener('click', () => {
    $('#searchInput').value = '';
    $('#categoryPills .pill')?.click();
  });
}

export function initCatalog(catalog) {
  data = catalog;
  cart.setCatalog(catalog.products);
  renderBands();
  bindEvents();
}
