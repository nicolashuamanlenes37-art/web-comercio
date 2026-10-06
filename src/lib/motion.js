/** Preferencias del dispositivo y utilidades de animación. */
export const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const hasFinePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/** Revela elementos [data-reveal] cuando entran en pantalla. */
const observer = prefersReducedMotion
  ? null
  : new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-visible');
          observer.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    );

export function reveal(root = document) {
  root.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => {
    if (observer) observer.observe(el);
    else el.classList.add('is-visible');
  });
}
