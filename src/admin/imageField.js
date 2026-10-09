import { esc } from '../lib/dom.js';
import { PLACEHOLDER } from '../components/productCard.js';

/**
 * Campo de foto: vista previa + "Elegir foto" (galería o cámara) + "Usar enlace".
 * El archivo elegido queda en `field.file` hasta que se guarda el formulario.
 */
export function imageFieldHTML(current, label = 'Foto') {
  return `
  <div class="image-field" data-image-field>
    <span class="image-field__label">${label}</span>
    <div class="image-field__preview">
      <img src="${esc(current || PLACEHOLDER)}" alt="" data-preview />
    </div>
    <div class="image-field__actions">
      <label class="btn btn--ghost btn--sm">
        <input type="file" accept="image/*" data-file hidden />
        Elegir foto
      </label>
      <button class="btn btn--ghost btn--sm" type="button" data-use-url>Usar enlace</button>
      ${current ? '<button class="link-btn" type="button" data-clear>Quitar</button>' : ''}
    </div>
    <input class="image-field__url" type="url" placeholder="https://… (enlace de una imagen)" data-url value="" hidden />
    <input type="hidden" name="image_url" value="${esc(current || '')}" />
  </div>`;
}

export function bindImageField(root) {
  const field = root.querySelector('[data-image-field]');
  const preview = field.querySelector('[data-preview]');
  const hidden = field.querySelector('input[name="image_url"]');
  const urlInput = field.querySelector('[data-url]');
  field.file = null;

  field.querySelector('[data-file]').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    field.file = file;
    preview.src = URL.createObjectURL(file);
  });

  field.querySelector('[data-use-url]').addEventListener('click', () => {
    urlInput.hidden = !urlInput.hidden;
    if (!urlInput.hidden) urlInput.focus();
  });

  urlInput.addEventListener('change', () => {
    const url = urlInput.value.trim();
    if (!/^https?:\/\//i.test(url)) return;
    field.file = null;
    hidden.value = url;
    preview.src = url;
  });

  field.querySelector('[data-clear]')?.addEventListener('click', () => {
    field.file = null;
    hidden.value = '';
    preview.src = PLACEHOLDER;
  });

  return field;
}
