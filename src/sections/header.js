import { $ } from '../lib/dom.js';

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
