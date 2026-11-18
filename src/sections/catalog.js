import { $, $$, esc, normalize } from '../lib/dom.js';
import { reveal } from '../lib/motion.js';
import { plural } from '../lib/format.js';
import { productCard, paintAddButton } from '../components/productCard.js';
import { cart } from '../store/cart.js';
import { waLink } from '../lib/whatsapp.js';
import { STORE } from '../config.js';

let data = { categories: [], products: [] };
const filter = { query: '', category: '' };

const productsOf = (catId) => data.products.filter((p) => p.categoryId === catId);

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
      ${items.map((p, i) => productCard(p, { delay: ((i + 1) % 4) * 0.06, anchor: true })).join('')}
    </div>
  </section>`;
}

function renderBands() {
  const orphans = data.products.filter((p) => !p.categoryId);
  $('#bands').removeAttribute('aria-busy');
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
  $('#resultsStatus').textContent = plural(list.length, 'producto encontrado', 'productos encontrados');
  reveal($('#results'));
}

/* ---------- Filtro (lo usan el buscador y las categorías del hero) ---------- */

/** Marca el botón de la categoría activa ("Todo" si no hay ninguna). */
function syncPills() {
  $$('#categoryPills .pill').forEach((pill) => {
    const on = pill.dataset.category === filter.category;
    pill.classList.toggle('is-active', on);
    pill.setAttribute('aria-pressed', on);
  });
}

export function setFilter({ query = '', category = '' }, { scroll = false } = {}) {
  filter.query = query;
  filter.category = category;
  const active = Boolean(query || category);
  $('#results').hidden = !active;
  $('#bands').hidden = active;
  if (active) renderResults();
  else $('#resultsGrid').innerHTML = '';
  syncPills();
  if (scroll) $('#catalogo').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Quita búsqueda y categoría: vuelve al catálogo completo. */
function clearFilter() {
  $('#searchInput').value = '';
  setFilter({});
}

export function scrollToProduct(id) {
  clearFilter();
  const el = document.getElementById(`p-${id}`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.remove('is-highlight');
  void el.offsetWidth;
  el.classList.add('is-highlight');
}

/* ---------- Interacción ---------- */

/** Actualiza el botón "+" de todas las tarjetas de ese producto (sin redibujarlas). */
function refreshProduct(id) {
  const qty = cart.qty(id);
  $$(`.product[data-product="${CSS.escape(id)}"] [data-add]`).forEach((btn) => paintAddButton(btn, qty));
}

function bindEvents() {
  $('#catalogo').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    cart.add(btn.closest('.product').dataset.product);
    btn.classList.remove('is-pop');
    void btn.offsetWidth;
    btn.classList.add('is-pop');
  });

  cart.onChange((ev) => {
    if (ev.productId) refreshProduct(ev.productId);
  });

  $('#clearFilter').addEventListener('click', clearFilter);
}

/** Si el catálogo no carga (sin internet o falla del servidor), ofrece reintentar o pedir por WhatsApp. */
export function showCatalogError() {
  const msg = `Hola ${STORE.name}, quiero ver su catálogo de productos`;
  $('#categoryPills').replaceChildren();
  $('#bands').removeAttribute('aria-busy');
  $('#bands').innerHTML = `
  <section class="band container catalog-error" role="alert">
    <h2 class="band__title">No pudimos cargar el catálogo</h2>
    <p>Revisa tu conexión e intenta otra vez, o escríbenos y te enviamos los productos por WhatsApp.</p>
    <div class="catalog-error__actions">
      <button class="btn btn--accent" type="button" data-retry>Reintentar</button>
      <a class="btn btn--ghost" href="${esc(waLink(msg))}" target="_blank" rel="noopener">Pedir por WhatsApp</a>
    </div>
  </section>`;
  $('#bands [data-retry]').addEventListener('click', () => location.reload());
}

export function initCatalog(catalog) {
  data = catalog;
  cart.setCatalog(catalog.products);
  renderBands();
  bindEvents();
}
