import { productById } from '../data/products.js';

/**
 * Estado del pedido. Clave: "productoId|gramos" → cantidad.
 * Los módulos se suscriben con onChange() y reaccionan a cada cambio.
 */
const items = new Map();
const listeners = new Set();

const notify = (event) => listeners.forEach((fn) => fn(event));

export const cart = {
  add(productId, grams, qty = 1) {
    const key = `${productId}|${grams}`;
    items.set(key, (items.get(key) || 0) + qty);
    notify({ type: 'add', productId, grams });
  },

  set(key, qty) {
    if (qty <= 0) items.delete(key);
    else items.set(key, qty);
    notify({ type: 'set', key });
  },

  clear() {
    items.clear();
    notify({ type: 'clear' });
  },

  qty(productId, grams) {
    return items.get(`${productId}|${grams}`) || 0;
  },

  lines() {
    return [...items].map(([key, qty]) => {
      const [id, grams] = key.split('|');
      const product = productById(id);
      const size = product.sizes.find((s) => s.grams === Number(grams));
      return { key, product, size, qty, total: size.price * qty };
    });
  },

  count() {
    let n = 0;
    items.forEach((q) => (n += q));
    return n;
  },

  subtotal() {
    return this.lines().reduce((sum, l) => sum + l.total, 0);
  },

  onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
