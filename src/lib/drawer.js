/**
 * Panel deslizable (.drawer): el pedido en la tienda y los formularios del admin.
 * Se encarga de abrir/cerrar con animación, bloquear el scroll, dejar inactivo
 * el resto de la página, mover el foco y devolverlo al cerrar.
 */
export function createDrawer(el, { onClose } = {}) {
  const panel = el.querySelector('.drawer__panel');
  let opened = false;
  let lastFocus = null;
  let inerted = [];

  // Oculta el panel al terminar la animación de cierre (y no si se volvió a abrir)
  const hideIfClosed = () => {
    if (!opened) el.hidden = true;
  };
  panel.addEventListener('transitionend', (e) => e.target === panel && hideIfClosed());

  const setInert = (on) => {
    if (on) {
      // Los avisos (role="status") siguen activos para que se lean los mensajes
      inerted = [...document.body.children].filter(
        (c) => c !== el && !c.inert && c.tagName !== 'SCRIPT' && !c.matches('[role="status"], [role="alert"]'),
      );
      inerted.forEach((c) => (c.inert = true));
    } else {
      inerted.forEach((c) => (c.inert = false));
      inerted = [];
    }
  };

  function open() {
    // Si ya estaba abierto (el admin cambia el contenido de la hoja) solo se reenfoca
    if (!opened) {
      opened = true;
      lastFocus = document.activeElement;
      setInert(true);
      el.hidden = false;
      requestAnimationFrame(() => el.classList.add('is-open'));
      document.documentElement.classList.add('no-scroll');
    }
    el.querySelector('[data-autofocus], .drawer__head [data-close]')?.focus();
  }

  function close() {
    if (!opened) return;
    opened = false;
    el.classList.remove('is-open');
    document.documentElement.classList.remove('no-scroll');
    setInert(false);
    setTimeout(hideIfClosed, 600); // por si el navegador no anima (movimiento reducido)
    lastFocus?.focus();
    onClose?.();
  }

  el.addEventListener('click', (e) => e.target.closest('[data-close]') && close());
  addEventListener('keydown', (e) => e.key === 'Escape' && opened && close());

  return { open, close, isOpen: () => opened };
}
