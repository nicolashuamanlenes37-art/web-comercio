import { $, esc, normalize } from '../lib/dom.js';
import { supabase } from '../lib/supabase.js';
import { PLACEHOLDER } from '../components/productCard.js';
import { openSheet, closeSheet, confirmSheet, toast, showError, busy } from './ui.js';
import { imageFieldHTML, bindImageField } from './imageField.js';
import { uploadImage, deleteImage } from './images.js';
import { renderProducts, renderCategoryFilter } from './products.js';
import { state } from './state.js';

export async function fetchCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('sort').order('name');
  if (error) throw error;
  state.categories = data;
}

/** "Limpieza y hogar" → "limpieza-y-hogar" (único). */
function slugify(name, ignoreId) {
  const base = normalize(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'categoria';
  let slug = base;
  for (let i = 2; state.categories.some((c) => c.slug === slug && c.id !== ignoreId); i++) slug = `${base}-${i}`;
  return slug;
}

const countOf = (id) => state.products.filter((p) => p.category_id === id).length;

export function renderCategories() {
  $('#categoryRows').innerHTML = state.categories.length
    ? state.categories
        .map(
          (c) => `
      <li class="row ${c.active ? '' : 'row--off'}" data-id="${c.id}">
        <button class="row__main" type="button" data-edit>
          <img class="row__img" src="${esc(c.cover_url || PLACEHOLDER)}" alt="" width="56" height="56" loading="lazy" />
          <span class="row__text">
            <strong>${esc(c.name)}</strong>
            <span>${countOf(c.id)} productos · orden ${c.sort}${c.active ? '' : ' · oculta'}</span>
          </span>
        </button>
      </li>`,
        )
        .join('')
    : '<li class="rows__empty">Aún no hay categorías.</li>';
}

function formHTML(c = {}) {
  return `
  <form class="form" id="categoryForm" novalidate>
    ${imageFieldHTML(c.cover_url, 'Foto de portada (opcional)')}
    <label class="field">
      <span>Nombre</span>
      <input name="name" required maxlength="60" value="${esc(c.name || '')}" placeholder="Ej. Accesorios para celular" />
    </label>
    <label class="field">
      <span>Frase corta (opcional)</span>
      <input name="tagline" maxlength="80" value="${esc(c.tagline || '')}" placeholder="Ej. Cables, cargadores y más" />
    </label>
    <label class="field">
      <span>Orden en la tienda</span>
      <input name="sort" type="number" inputmode="numeric" value="${c.sort ?? state.categories.length + 1}" />
    </label>
    <label class="check"><input type="checkbox" name="active" ${c.active !== false ? 'checked' : ''} /> Visible en la tienda</label>
    <p class="form-error" data-error hidden></p>
    <div class="sheet__actions">
      ${c.id ? '<button class="btn btn--ghost btn--danger-text" type="button" data-delete>Eliminar</button>' : ''}
      <button class="btn btn--accent" type="submit">${c.id ? 'Guardar cambios' : 'Crear categoría'}</button>
    </div>
  </form>`;
}

function refreshAll() {
  renderCategories();
  renderCategoryFilter();
  renderProducts();
}

function openForm(cat) {
  const body = openSheet(cat ? 'Editar categoría' : 'Nueva categoría', formHTML(cat || {}));
  const form = body.querySelector('#categoryForm');
  const imageField = bindImageField(form);
  const error = form.querySelector('[data-error]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get('name')).trim();
    if (!name) {
      error.textContent = 'Escribe el nombre de la categoría.';
      error.hidden = false;
      return;
    }
    error.hidden = true;
    const submit = form.querySelector('[type="submit"]');
    busy(submit, true);
    try {
      let cover_url = String(fd.get('image_url')) || null;
      if (imageField.file) {
        busy(submit, true, 'Subiendo foto…');
        cover_url = await uploadImage(imageField.file, 'categorias');
      }
      const row = {
        name,
        tagline: String(fd.get('tagline')).trim() || null,
        sort: Number(fd.get('sort')) || 0,
        active: fd.get('active') === 'on',
        cover_url,
      };
      if (!cat) row.slug = slugify(name);

      const query = cat
        ? supabase.from('categories').update(row).eq('id', cat.id)
        : supabase.from('categories').insert(row);
      const { error: dbError } = await query;
      if (dbError) throw dbError;

      if (cat && cat.cover_url !== cover_url) await deleteImage(cat.cover_url);
      await fetchCategories();
      refreshAll();
      closeSheet();
      toast(cat ? 'Cambios guardados' : 'Categoría creada');
    } catch (err) {
      showError(err);
    } finally {
      busy(submit, false);
    }
  });

  form.querySelector('[data-delete]')?.addEventListener('click', async () => {
    const n = countOf(cat.id);
    const ok = await confirmSheet(
      'Eliminar categoría',
      `¿Eliminar <b>${esc(cat.name)}</b>?${n ? ` Sus ${n} productos no se borran: quedarán como “Sin categoría” hasta que los muevas.` : ''}`,
    );
    if (!ok) return;
    const { error: dbError } = await supabase.from('categories').delete().eq('id', cat.id);
    if (dbError) return showError(dbError, 'No se pudo eliminar.');
    await deleteImage(cat.cover_url);
    state.products.forEach((p) => p.category_id === cat.id && (p.category_id = null));
    await fetchCategories();
    refreshAll();
    toast('Categoría eliminada');
  });
}

export function initCategories() {
  $('#newCategory').addEventListener('click', () => openForm(null));
  $('#categoryRows').addEventListener('click', (e) => {
    const row = e.target.closest('.row');
    if (row && e.target.closest('[data-edit]')) openForm(state.categories.find((c) => c.id === row.dataset.id));
  });
}
