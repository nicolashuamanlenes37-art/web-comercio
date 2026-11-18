import { esc } from './dom.js';

/** Imagen de reemplazo cuando un producto aún no tiene foto. */
export const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f2f4f5"/><path d="M38 40h24l-2 22H40z" fill="none" stroke="#bbb" stroke-width="2.5" stroke-linejoin="round"/><path d="M44 40v-3a6 6 0 0 1 12 0v3" fill="none" stroke="#bbb" stroke-width="2.5"/></svg>',
  );

/** URL de foto lista para insertar en HTML, con la imagen de reemplazo si no tiene. */
export const imgSrc = (url) => esc(url || PLACEHOLDER);
