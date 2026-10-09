import { $, esc } from '../lib/dom.js';
import { floatCard } from '../components/productCard.js';
import { prefersReducedMotion, hasFinePointer, lerp, clamp } from '../lib/motion.js';
import { setFilter, scrollToProduct } from './catalog.js';

const SLOTS = 7; // posiciones definidas en hero.css → .float-slot--N

/** Destacados primero; si no alcanzan, se completa con otros productos con foto. */
function pickConstellation(products) {
  const withImage = products.filter((p) => p.image);
  const featured = withImage.filter((p) => p.featured);
  const rest = withImage.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, SLOTS);
}

function renderConstellation(products) {
  const scene = $('#constellationScene');
  scene.innerHTML = pickConstellation(products)
    .map((p, i) => `<div class="float-slot float-slot--${i + 1}"><div class="float-slot__in">${floatCard(p)}</div></div>`)
    .join('');

  scene.addEventListener('click', (e) => {
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
    hero.style.setProperty('--mx', current.x.toFixed(4));
    hero.style.setProperty('--my', current.y.toFixed(4));
    hero.style.setProperty('--scroll', clamp(scrollY / hero.offsetHeight).toFixed(4));
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

function setActivePill(btn) {
  document.querySelectorAll('#categoryPills .pill').forEach((p) => {
    const on = p === btn;
    p.classList.toggle('is-active', on);
    p.setAttribute('aria-pressed', on);
  });
}

function renderPills(categories, products) {
  const pills = $('#categoryPills');
  const thumbOf = (cat) => cat.cover || products.find((p) => p.categoryId === cat.id && p.image)?.image || '';
  pills.innerHTML =
    `<button class="pill is-active" type="button" data-category="" aria-pressed="true">Todo</button>` +
    categories
      .filter((c) => products.some((p) => p.categoryId === c.id))
      .map((c) => {
        const thumb = thumbOf(c);
        return `<button class="pill" type="button" data-category="${esc(c.id)}" aria-pressed="false">
          ${thumb ? `<img class="pill__thumb" src="${esc(thumb)}" alt="" width="28" height="28" loading="lazy" />` : ''}${esc(c.name)}</button>`;
      })
      .join('');

  pills.addEventListener('click', (e) => {
    const btn = e.target.closest('.pill');
    if (!btn) return;
    setActivePill(btn);
    $('#searchInput').value = '';
    setFilter({ category: btn.dataset.category, query: '' }, { scroll: true });
  });
}

function bindSearch() {
  const input = $('#searchInput');
  $('#searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    input.blur();
    setActivePill($('#categoryPills .pill'));
    setFilter({ query: input.value.trim(), category: '' }, { scroll: true });
  });
  input.addEventListener('input', () => {
    if (input.value.trim() === '') setFilter({});
  });
}

export function initHero({ categories, products }) {
  renderConstellation(products);
  renderPills(categories, products);
  bindSearch();
  bindParallax();
}
