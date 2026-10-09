/**
 * Acceso discreto al panel desde el logo del footer:
 *   - mantenerlo presionado 2 segundos (dedo o mouse), o
 *   - tocarlo / hacer clic 5 veces seguidas.
 *
 * Es solo un atajo: el panel sigue protegido por correo y contraseña.
 */
const HOLD_MS = 2000;
const TAPS = 5;
const TAP_WINDOW_MS = 2500; // tiempo para completar los 5 toques/clics
const MOVE_TOLERANCE = 12; // px que puede moverse el dedo/mouse sin cancelar
const ADMIN_URL = '/admin/';

export function initSecretAdmin(el) {
  if (!el) return;
  let holdTimer = null;
  let start = null;
  let taps = [];

  const go = () => {
    clearTimeout(holdTimer);
    if (navigator.vibrate) navigator.vibrate(30);
    location.href = ADMIN_URL;
  };
  const cancelHold = () => {
    clearTimeout(holdTimer);
    holdTimer = null;
    start = null;
  };

  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.pointerType === 'mouse') e.preventDefault(); // sin arrastre ni selección en PC

    // Conteo de toques/clics (en pointerdown: no depende de que el navegador dispare "click")
    const now = Date.now();
    taps = taps.filter((t) => now - t < TAP_WINDOW_MS);
    taps.push(now);
    if (taps.length >= TAPS) {
      taps = [];
      go();
      return;
    }

    cancelHold();
    start = { x: e.clientX, y: e.clientY };
    try { el.setPointerCapture(e.pointerId); } catch { /* sin soporte */ }
    holdTimer = setTimeout(go, HOLD_MS);
  });

  el.addEventListener('pointermove', (e) => {
    if (!start) return;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > MOVE_TOLERANCE) cancelHold();
  });
  ['pointerup', 'pointercancel'].forEach((ev) => el.addEventListener(ev, cancelHold));

  // Evita arrastrar la imagen (PC) y el menú de "guardar imagen" (celular)
  el.addEventListener('dragstart', (e) => e.preventDefault());
  el.addEventListener('contextmenu', (e) => e.preventDefault());
}
