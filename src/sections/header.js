import { $, esc } from '../lib/dom.js';

/** Sombra del header al hacer scroll. */
export function initHeader() {
  const header = $('#header');
  let last = null;
  const update = () => {
    const scrolled = scrollY > 8;
    if (scrolled !== last) header.classList.toggle('is-scrolled', (last = scrolled));
  };
  addEventListener('scroll', update, { passive: true });
  update();
}

/** Enlaces del menú y del footer a las primeras categorías. */
export function renderCategoryLinks(categories) {
  const links = categories
    .slice(0, 4)
    .map((c) => `<a href="#${esc(c.slug)}">${esc(c.name)}</a>`)
    .join('');
  const nav = $('#headerNav');
  if (nav) nav.innerHTML = links + '<a href="#como-pedir">Cómo pedir</a>';
  const foot = $('#footerCategories');
  if (foot) foot.innerHTML = '<h3>Tienda</h3>' + links;
}
