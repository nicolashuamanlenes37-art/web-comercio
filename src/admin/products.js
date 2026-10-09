import { $, esc, normalize } from '../lib/dom.js';
import { priceLabel } from '../lib/format.js';
import { supabase } from '../lib/supabase.js';
import { PLACEHOLDER } from '../components/productCard.js';
import { openSheet, closeSheet, confirmSheet, toast, showError, busy } from './ui.js';
import { imageFieldHTML, bindImageField } from './imageField.js';
import { uploadImage, deleteImage } from './images.js';
import { state } from './state.js';

/* ---------- Datos ---------- */

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort')
    .order('name');
  if (error) throw error;
  state.products = data;
}

/* ---------- Lista ---------- */

const categoryName = (id) => state.categories.find((c) => c.id === id)?.name || 'Sin categoría';

export function renderProducts() {
  const q = normalize($('#productSearch').value.trim());
  const cat = $('#productFilter').value;
  const list = state.products.filter(
    (p) => (!cat || p.category_id === cat || (cat === 'none' && !p.category_id)) && (!q || normalize(p.name).includes(q)),
  );

  $('#productRows').innerHTML = list.length
    ? list
        .map(
          (p) => `
      <li class="row ${p.active ? '' : 'row--off'}" data-id="${p.id}">
        <button class="row__main" type="button" data-edit>
          <img class="row__img" src="${esc(p.image_url || PLACEHOLDER)}" alt="" width="56" height="56" loading="lazy" />
          <span class="row__text">
            <strong>${esc(p.name)}</strong>
            <span>${esc(categoryName(p.category_id))} · ${priceLabel(p.price === null ? null : Number(p.price))}</span>
          </span>
        </button>
        <label class="switch" title="Visible en la tienda">
          <input type="checkbox" data-toggle ${p.active ? 'checked' : ''} aria-label="Visible en la tienda" />
          <span></span>
        </label>
      </li>`,
        )
        .join('')
    : `<li class="rows__empty">No hay productos${q || cat ? ' con ese filtro' : ''}.</li>`;
}

export function renderCategoryFilter() {
  const sel = $('#productFilter');
  const value = sel.value;
  sel.innerHTML =
    '<option value="">Todas</option>' +
    state.categories.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('') +
    '<option value="none">Sin categoría</option>';
  sel.value = value;
}

/* ---------- Formulario ---------- */

function formHTML(p = {}) {
  const options = state.categories
    .map((c) => `<option value="${c.id}" ${c.id === p.category_id ? 'selected' : ''}>${esc(c.name)}</option>`)
    .join('');
  return `
  <form class="form" id="productForm" novalidate>
    ${imageFieldHTML(p.image_url)}
    <label class="field">
      <span>Nombre</span>
      <input name="name" required maxlength="80" value="${esc(p.name || '')}" placeholder="Ej. Cable USB tipo C 1 m" />
    </label>
    <label class="field">
      <span>Categoría</span>
      <select name="category_id">${options}<option value="" ${p.id && !p.category_id ? 'selected' : ''}>Sin categoría</option></select>
    </label>
    <label class="field">
      <span>Precio (S/) <em>Déjalo vacío para mostrar “Consultar precio”</em></span>
      <input name="price" type="number" inputmode="decimal" min="0" step="0.10" value="${p.price ?? ''}" placeholder="0.00" />
    </label>
    <label class="field">
      <span>Descripción corta</span>
      <textarea name="description" rows="3" maxlength="300" placeholder="Para qué sirve, medidas, colores…">${esc(p.description || '')}</textarea>
    </label>
    <div class="field-row">
      <label class="field">
        <span>Etiqueta</span>
        <input name="badge" maxlength="20" value="${esc(p.badge || '')}" placeholder="Nuevo, Oferta…" />
      </label>
      <label class="field">
        <span>Orden</span>
        <input name="sort" type="number" inputmode="numeric" value="${p.sort ?? 0}" />
      </label>
    </div>
    <label class="check"><input type="checkbox" name="active" ${p.active !== false ? 'checked' : ''} /> Visible en la tienda</label>
    <label class="check"><input type="checkbox" name="featured" ${p.featured ? 'checked' : ''} /> Destacado en la portada</label>
    <p class="form-error" data-error hidden></p>
    <div class="sheet__actions">
      ${p.id ? '<button class="btn btn--ghost btn--danger-text" type="button" data-delete>Eliminar</button>' : ''}
      <button class="btn btn--accent" type="submit">${p.id ? 'Guardar cambios' : 'Crear producto'}</button>
    </div>
  </form>`;
}

function openForm(product) {
  const body = openSheet(product ? 'Editar producto' : 'Nuevo producto', formHTML(product || {}));
  const form = body.querySelector('#productForm');
  const imageField = bindImageField(form);
  const error = form.querySelector('[data-error]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get('name')).trim();
    const priceRaw = String(fd.get('price')).trim().replace(',', '.');
    if (!name) {
      error.textContent = 'Escribe el nombre del producto.';
      error.hidden = false;
      return;
    }
    if (priceRaw && (isNaN(Number(priceRaw)) || Number(priceRaw) < 0)) {
      error.textContent = 'El precio debe ser un número, por ejemplo 15.50.';
      error.hidden = false;
      return;
    }
    error.hidden = true;

    const submit = form.querySelector('[type="submit"]');
    busy(submit, true);
    try {
      let image_url = String(fd.get('image_url')) || null;
      if (imageField.file) {
        busy(submit, true, 'Subiendo foto…');
        image_url = await uploadImage(imageField.file);
      }
      const row = {
        name,
        category_id: fd.get('category_id') || null,
        price: priceRaw === '' ? null : Number(priceRaw),
        description: String(fd.get('description')).trim() || null,
        badge: String(fd.get('badge')).trim() || null,
        sort: Number(fd.get('sort')) || 0,
        active: fd.get('active') === 'on',
        featured: fd.get('featured') === 'on',
        image_url,
      };

      const query = product
        ? supabase.from('products').update(row).eq('id', product.id)
        : supabase.from('products').insert(row);
      const { error: dbError } = await query;
      if (dbError) throw dbError;

      if (product && product.image_url !== image_url) await deleteImage(product.image_url);
      await fetchProducts();
      renderProducts();
      closeSheet();
      toast(product ? 'Cambios guardados' : 'Producto creado');
    } catch (err) {
      showError(err);
    } finally {
      busy(submit, false);
    }
  });

  form.querySelector('[data-delete]')?.addEventListener('click', async () => {
    const ok = await confirmSheet('Eliminar producto', `¿Eliminar <b>${esc(product.name)}</b>? Esta acción no se puede deshacer.`);
    if (!ok) return;
    const { error: dbError } = await supabase.from('products').delete().eq('id', product.id);
    if (dbError) return showError(dbError, 'No se pudo eliminar.');
    await deleteImage(product.image_url);
    await fetchProducts();
    renderProducts();
    toast('Producto eliminado');
  });
}

/* ---------- Eventos ---------- */

export function initProducts() {
  $('#newProduct').addEventListener('click', () => openForm(null));
  $('#productSearch').addEventListener('input', renderProducts);
  $('#productFilter').addEventListener('change', renderProducts);

  $('#productRows').addEventListener('click', (e) => {
    const row = e.target.closest('.row');
    if (row && e.target.closest('[data-edit]')) openForm(state.products.find((p) => p.id === row.dataset.id));
  });

  $('#productRows').addEventListener('change', async (e) => {
    const toggle = e.target.closest('[data-toggle]');
    if (!toggle) return;
    const id = toggle.closest('.row').dataset.id;
    const { error } = await supabase.from('products').update({ active: toggle.checked }).eq('id', id);
    if (error) {
      toggle.checked = !toggle.checked;
      return showError(error);
    }
    const p = state.products.find((x) => x.id === id);
    p.active = toggle.checked;
    toggle.closest('.row').classList.toggle('row--off', !p.active);
    toast(p.active ? 'Ahora se ve en la tienda' : 'Oculto de la tienda');
  });
}
