import { $ } from '../lib/dom.js';
import { CATEGORIES, productById } from '../data/products.js';
import { floatCard } from '../components/productCard.js';
import { prefersReducedMotion, hasFinePointer, lerp, clamp } from '../lib/motion.js';
import { setFilter, scrollToProduct } from './catalog.js';

/** Orden de las tarjetas flotantes (posiciones en hero.css → .float-slot--N). */
const CONSTELLATION = ['curcuma', 'maca', 'cacao', 'quinua', 'linaza', 'jengibre', 'lucuma'];

function renderConstellation() {
  $('#constellationScene').innerHTML = CONSTELLATION.map(
    (id, i) => `<div class="float-slot float-slot--${i + 1}"><div class="float-slot__in">${floatCard(productById(id))}</div></div>`,
  ).join('');

  $('#constellationScene').addEventListener('click', (e) => {
    const link = e.target.closest('[data-jump]');
    if (!link) return;
    e.preventDefault();
    scrollToProduct(link.dataset.jump);
  });
}

/** Profundidad 3D: la escena sigue al mouse y las tarjetas se separan al hacer scroll. */
function bindParallax() {
  if (prefersReducedMotion) return;
  const hero = $('#hero');
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  let ticking = false;

  const frame = () => {
    current.x = lerp(current.x, target.x, 0.07);
    current.y = lerp(current.y, target.y, 0.07);
    const progress = clamp(scrollY / hero.offsetHeight);
    hero.style.setProperty('--mx', current.x.toFixed(4));
    hero.style.setProperty('--my', current.y.toFixed(4));
    hero.style.setProperty('--scroll', progress.toFixed(4));
    const settling = Math.abs(current.x - target.x) + Math.abs(current.y - target.y) > 0.001;
    if (settling) requestAnimationFrame(frame);
    else ticking = false;
  };
  const kick = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(frame);
  };

  if (hasFinePointer) {
    hero.addEventListener('pointermove', (e) => {
      target.x = (e.clientX / innerWidth) * 2 - 1;
      target.y = (e.clientY / innerHeight) * 2 - 1;
      kick();
    });
    hero.addEventListener('pointerleave', () => {
      target.x = 0;
      target.y = 0;
      kick();
    });
  }
  addEventListener('scroll', () => scrollY < hero.offsetHeight * 1.2 && kick(), { passive: true });
}

function renderPills() {
  const pills = $('#categoryPills');
  pills.innerHTML =
    `<button class="pill is-active" type="button" data-category="" aria-pressed="true">Todo</button>` +
    CATEGORIES.map(
      (c) => `<button class="pill" type="button" data-category="${c.id}" aria-pressed="false">
        <span class="pill__swatch" style="background:${c.color}"></span>${c.name}</button>`,
    ).join('');

  pills.addEventListener('click', (e) => {
    const btn = e.target.closest('.pill');
    if (!btn) return;
    pills.querySelectorAll('.pill').forEach((p) => {
      const on = p === btn;
      p.classList.toggle('is-active', on);
      p.setAttribute('aria-pressed', on);
    });
    $('#searchInput').value = '';
    setFilter({ category: btn.dataset.category, query: '' }, { scroll: true });
  });
}

function bindSearch() {
  const input = $('#searchInput');
  const resetPills = () =>
    document.querySelectorAll('#categoryPills .pill').forEach((p, i) => {
      p.classList.toggle('is-active', i === 0);
      p.setAttribute('aria-pressed', i === 0);
    });

  $('#searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    input.blur();
    resetPills();
    setFilter({ query: input.value.trim(), category: '' }, { scroll: true });
  });
  input.addEventListener('input', () => {
    if (input.value.trim() === '') setFilter({ query: '', category: '' });
  });
}

export function initHero() {
  renderConstellation();
  renderPills();
  bindSearch();
  bindParallax();
}
