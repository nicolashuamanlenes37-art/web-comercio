/**
 * Estado del pedido: productoId → cantidad.
 * Los módulos se suscriben con onChange() y reaccionan a cada cambio.
 */
const items = new Map();
const listeners = new Set();
let catalog = new Map();

const notify = (event) => listeners.forEach((fn) => fn(event));

export const cart = {
  /** Registra los productos cargados para poder armar las líneas del pedido. */
  setCatalog(products) {
    catalog = new Map(products.map((p) => [p.id, p]));
  },

  add(productId, qty = 1) {
    items.set(productId, (items.get(productId) || 0) + qty);
    notify({ type: 'add', productId });
  },

  set(productId, qty) {
    if (qty <= 0) items.delete(productId);
    else items.set(productId, qty);
    notify({ type: 'set', productId });
  },

  qty(productId) {
    return items.get(productId) || 0;
  },

  lines() {
    return [...items]
      .filter(([id]) => catalog.has(id))
      .map(([id, qty]) => {
        const product = catalog.get(id);
        return { product, qty, total: product.price === null ? null : product.price * qty };
      });
  },

  count() {
    let n = 0;
    items.forEach((q) => (n += q));
    return n;
  },

  /** Suma de los productos con precio. */
  subtotal() {
    return this.lines().reduce((sum, l) => sum + (l.total ?? 0), 0);
  },

  /** true si algún producto del pedido no tiene precio publicado. */
  hasUnpriced() {
    return this.lines().some((l) => l.total === null);
  },

  onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
