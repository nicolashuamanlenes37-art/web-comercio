/**
 * Acceso discreto al panel desde el logo del footer:
 *   - mantenerlo presionado 2 segundos, o
 *   - tocarlo 5 veces seguidas.
 *
 * Es solo un atajo: el panel sigue protegido por correo y contraseña.
 */
const HOLD_MS = 2000;
const TAPS = 5;
const TAP_WINDOW_MS = 1500;
const ADMIN_URL = '/admin/';

export function initSecretAdmin(el) {
  if (!el) return;
  let holdTimer = null;
  let taps = [];

  const go = () => {
    if (navigator.vibrate) navigator.vibrate(30);
    location.href = ADMIN_URL;
  };
  const cancelHold = () => {
    clearTimeout(holdTimer);
    holdTimer = null;
  };

  el.addEventListener('pointerdown', () => {
    cancelHold();
    holdTimer = setTimeout(go, HOLD_MS);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => el.addEventListener(ev, cancelHold));

  el.addEventListener('click', () => {
    const now = Date.now();
    taps = taps.filter((t) => now - t < TAP_WINDOW_MS);
    taps.push(now);
    if (taps.length >= TAPS) {
      taps = [];
      go();
    }
  });

  // Evita el menú de "guardar imagen" al mantener presionado en el celular
  el.addEventListener('contextmenu', (e) => e.preventDefault());
}
