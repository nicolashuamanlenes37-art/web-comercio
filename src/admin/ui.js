import { $ } from '../lib/dom.js';
import { createDrawer } from '../lib/drawer.js';

/* ---------- Hoja (formulario deslizable) ---------- */

let sheet = null;
let onSheetClose = null;

export function initSheet() {
  sheet = createDrawer($('#sheet'), {
    onClose: () => {
      const fn = onSheetClose;
      onSheetClose = null;
      fn?.();
    },
  });
}

/** Abre la hoja con un contenido nuevo (reemplaza al anterior si ya estaba abierta). */
export function openSheet(title, html, { onClose } = {}) {
  $('#sheetTitle').textContent = title;
  $('#sheetBody').innerHTML = html;
  onSheetClose = onClose || null;
  sheet.open();
  return $('#sheetBody');
}

export const closeSheet = () => sheet.close();

/* ---------- Avisos ---------- */

let toastTimers = [];
export function toast(message, { error = false } = {}) {
  const el = $('#toast');
  toastTimers.forEach(clearTimeout);
  el.textContent = message;
  el.classList.toggle('toast--error', error);
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('is-visible'));
  toastTimers = [
    setTimeout(() => el.classList.remove('is-visible'), 2600),
    setTimeout(() => (el.hidden = true), 2900),
  ];
}

/** Muestra un error de Supabase de forma entendible. */
export function showError(err, fallback = 'No se pudo guardar. Intenta otra vez.') {
  console.error(err);
  const msg = String(err?.message || '');
  if (/row-level security|permission/i.test(msg)) return toast('Tu cuenta no tiene permiso para esto.', { error: true });
  if (/Failed to fetch|NetworkError/i.test(msg)) return toast('Sin conexión a internet.', { error: true });
  toast(fallback, { error: true });
}

/** Confirmación dentro de la hoja (sin ventanas del navegador). */
export function confirmSheet(title, message, confirmLabel = 'Eliminar') {
  return new Promise((resolve) => {
    let answered = false;
    const body = openSheet(
      title,
      `<p class="sheet__text">${message}</p>
       <div class="sheet__actions">
         <button class="btn btn--ghost" type="button" data-answer="no" data-autofocus>Cancelar</button>
         <button class="btn btn--danger" type="button" data-answer="yes">${confirmLabel}</button>
       </div>`,
      { onClose: () => !answered && resolve(false) },
    );
    // El listener va en los botones de ESTA confirmación (no en la hoja, que se reutiliza)
    body.querySelectorAll('[data-answer]').forEach((btn) =>
      btn.addEventListener('click', () => {
        answered = true;
        resolve(btn.dataset.answer === 'yes');
        closeSheet();
      }),
    );
  });
}

/** Estado de carga en un botón. Se puede llamar varias veces (cambia el texto). */
export function busy(button, isBusy, label = 'Guardando…') {
  if (isBusy) {
    button.dataset.label ??= button.textContent;
    button.textContent = label;
    button.disabled = true;
  } else {
    if (button.dataset.label !== undefined) button.textContent = button.dataset.label;
    delete button.dataset.label;
    button.disabled = false;
  }
}
