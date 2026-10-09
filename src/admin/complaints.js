import { $, esc } from '../lib/dom.js';
import { money } from '../lib/format.js';
import { supabase } from '../lib/supabase.js';
import { openSheet, closeSheet, toast, showError, busy } from './ui.js';
import { state } from './state.js';

const date = (iso) =>
  new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

/** Días hábiles (lunes a viernes) transcurridos desde que se registró. */
function businessDaysSince(iso) {
  let days = 0;
  const d = new Date(iso);
  const today = new Date();
  while (d < today) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6 && d <= today) days++;
  }
  return days;
}

export async function fetchComplaints() {
  const { data, error } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  state.complaints = data;
}

export function renderComplaints() {
  const pending = state.complaints.filter((c) => c.status !== 'atendido').length;
  const badge = $('#complaintsBadge');
  badge.hidden = pending === 0;
  badge.textContent = pending;

  $('#complaintRows').innerHTML = state.complaints.length
    ? state.complaints
        .map((c) => {
          const days = businessDaysSince(c.created_at);
          const late = c.status !== 'atendido' && days >= 10;
          return `
      <li class="row" data-id="${c.id}">
        <button class="row__main" type="button" data-open>
          <span class="status status--${c.status.replace(' ', '-')}">${esc(c.status)}</span>
          <span class="row__text">
            <strong>${esc(c.code)} · ${esc(c.kind)}</strong>
            <span>${esc(c.full_name)} · ${date(c.created_at)}${
              c.status !== 'atendido' ? ` · <b class="${late ? 'is-late' : ''}">${days} días hábiles</b>` : ''
            }</span>
          </span>
        </button>
      </li>`;
        })
        .join('')
    : '<li class="rows__empty">No hay reclamos registrados.</li>';
}

function detailHTML(c) {
  const item = (label, value) => (value ? `<div><dt>${label}</dt><dd>${esc(value)}</dd></div>` : '');
  return `
  <dl class="detail">
    ${item('Código', c.code)}
    ${item('Fecha', new Date(c.created_at).toLocaleString('es-PE'))}
    ${item('Tipo', c.kind)}
    ${item('Nombre', c.full_name)}
    ${item('Documento', c.document)}
    ${item('Domicilio', c.address)}
    ${item('Teléfono', c.phone)}
    ${item('Correo', c.email)}
    ${item('Padre / madre (menor de edad)', c.guardian)}
    ${item('Producto o servicio', c.item)}
    ${item('Monto reclamado', c.amount !== null ? money(Number(c.amount)) : '')}
    ${item('Detalle', c.detail)}
    ${item('Pedido del consumidor', c.request)}
  </dl>
  <form class="form" id="complaintForm">
    <label class="field">
      <span>Estado</span>
      <select name="status">
        ${['pendiente', 'en proceso', 'atendido'].map((s) => `<option ${s === c.status ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
    </label>
    <label class="field">
      <span>Respuesta / acciones tomadas</span>
      <textarea name="response" rows="4" maxlength="2000" placeholder="Qué se respondió al cliente y cuándo">${esc(c.response || '')}</textarea>
    </label>
    <div class="sheet__actions">
      <a class="btn btn--ghost" href="mailto:${esc(c.email)}?subject=${encodeURIComponent(`Respuesta a su ${c.kind} ${c.code}`)}">Responder por correo</a>
      <button class="btn btn--accent" type="submit">Guardar</button>
    </div>
  </form>`;
}

function openDetail(c) {
  const body = openSheet(`${c.kind === 'queja' ? 'Queja' : 'Reclamo'} ${c.code}`, detailHTML(c));
  const form = body.querySelector('#complaintForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const status = String(fd.get('status'));
    const row = {
      status,
      response: String(fd.get('response')).trim() || null,
      answered_at: status === 'atendido' ? c.answered_at || new Date().toISOString() : null,
    };
    const submit = form.querySelector('[type="submit"]');
    busy(submit, true);
    const { error } = await supabase.from('complaints').update(row).eq('id', c.id);
    busy(submit, false);
    if (error) return showError(error);
    Object.assign(c, row);
    renderComplaints();
    closeSheet();
    toast('Reclamo actualizado');
  });
}

export function initComplaints() {
  $('#complaintRows').addEventListener('click', (e) => {
    const row = e.target.closest('.row');
    if (row && e.target.closest('[data-open]')) openDetail(state.complaints.find((c) => String(c.id) === row.dataset.id));
  });
}
