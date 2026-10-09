import './styles/legal.css';

import { $ } from './lib/dom.js';
import { initStoreInfo } from './lib/store-info.js';
import { restEnabled, restInsert } from './lib/rest.js';

initStoreInfo();

/* ---------- Libro de Reclamaciones ---------- */

const form = $('#claimForm');

function newCode() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().slice(0, 5);
  return `R-${ymd}-${rand}`;
}

if (form) {
  const today = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  $('#claimDate').textContent = today;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const error = $('#claimError');
    error.hidden = true;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (!restEnabled) {
      error.textContent = 'El Libro de Reclamaciones no está disponible en este momento. Escríbenos por WhatsApp y registraremos tu reclamo.';
      error.hidden = false;
      return;
    }

    const fd = new FormData(form);
    const text = (k) => String(fd.get(k) || '').trim() || null;
    const code = newCode();
    const amount = text('amount');
    const row = {
      code,
      kind: text('kind'),
      full_name: text('full_name'),
      document: text('document'),
      address: text('address'),
      phone: text('phone'),
      email: text('email'),
      guardian: text('guardian'),
      item: text('item'),
      amount: amount ? Number(amount.replace(',', '.')) : null,
      detail: text('detail'),
      request: text('request'),
    };

    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Enviando…';
    try {
      await restInsert('complaints', row);
      form.hidden = true;
      $('#claimCode').textContent = code;
      $('#claimDone').hidden = false;
      $('#claimDone').scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      console.error(err);
      error.textContent = 'No se pudo registrar. Revisa los datos e intenta otra vez.';
      error.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Enviar';
    }
  });
}
