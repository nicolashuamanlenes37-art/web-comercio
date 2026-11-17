/**
 * Muestra el brillo de carga ("hueso") en el lugar de cada foto mientras baja.
 * Vigila también las fotos que se agregan después (catálogo, buscador, panel).
 *
 * @param {string} boxes  selector de las cajas que contienen la foto
 *                        (o de la propia <img> si no tiene caja)
 */
export function initImageLoading(boxes, root = document.body) {
  const handle = (img) => {
    const box = img.closest(boxes);
    if (!box || (img.complete && img.naturalWidth)) return;
    box.classList.add('img-wait');
    const done = () => {
      box.classList.remove('img-wait');
      box.classList.add('img-ready');
    };
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  };

  root.querySelectorAll('img').forEach(handle);
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const n of m.addedNodes) {
        if (n.nodeType !== 1) continue;
        if (n.tagName === 'IMG') handle(n);
        else n.querySelectorAll('img').forEach(handle);
      }
    }
  }).observe(root, { childList: true, subtree: true });
}
