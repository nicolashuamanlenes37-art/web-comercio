import { $ } from '../lib/dom.js';

/* ---------- Hoja (formulario deslizable) ---------- */

let onSheetClose = null;

export function openSheet(title, html, { onClose } = {}) {
  const sheet = $('#sheet');
  $('#sheetTitle').textContent = title;
  $('#sheetBody').innerHTML = html;
  onSheetClose = onClose || null;
  sheet.hidden = false;
  requestAnimationFrame(() => sheet.classList.add('is-open'));
  document.documentElement.classList.add('no-scroll');
  return $('#sheetBody');
}

export function closeSheet() {
  const sheet = $('#sheet');
  if (sheet.hidden) return;
  sheet.classList.remove('is-open');
  document.documentElement.classList.remove('no-scroll');
  $('.drawer__panel', sheet).addEventListener('transitionend', () => (sheet.hidden = true), { once: true });
  onSheetClose?.();
  onSheetClose = null;
}

export function initSheet() {
  $('#sheet').addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeSheet();
  });
  addEventListener('keydown', (e) => e.key === 'Escape' && closeSheet());
}

/* ---------- Avisos ---------- */

let toastTimer;
export function toast(message, { error = false } = {}) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.toggle('toast--error', error);
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('is-visible'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('is-visible');
    setTimeout(() => (el.hidden = true), 300);
  }, 2600);
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
         <button class="btn btn--ghost" type="button" data-answer="no">Cancelar</button>
         <button class="btn btn--danger" type="button" data-answer="yes">${confirmLabel}</button>
       </div>`,
      { onClose: () => !answered && resolve(false) },
    );
    body.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-answer]');
      if (!btn) return;
      answered = true;
      resolve(btn.dataset.answer === 'yes');
      closeSheet();
    });
  });
}

/** Estado de carga en un botón. */
export function busy(button, isBusy, label = 'Guardando…') {
  if (isBusy) {
    button.dataset.label = button.textContent;
    button.textContent = label;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.label || button.textContent;
    button.disabled = false;
  }
}
