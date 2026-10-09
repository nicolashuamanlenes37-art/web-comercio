import { supabase } from '../lib/supabase.js';
import { SUPABASE } from '../config.js';

const MAX_SIDE = 1200;
const SQUARE = 1000; // tamaño final de las fotos de producto
const MARGIN = 0.06; // aire alrededor del producto (6 % por lado)

async function toBlob(canvas) {
  const webp = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85));
  if (webp && webp.type === 'image/webp') return { blob: webp, ext: 'webp', type: 'image/webp' };
  const jpeg = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));
  return { blob: jpeg, ext: 'jpg', type: 'image/jpeg' };
}

/**
 * Prepara la foto antes de subirla (las del celular pesan varios MB).
 *
 * - Productos: la encuadra en un cuadrado blanco de 1000×1000, centrada y completa,
 *   sin recortar ni deformar. Así cualquier foto (alta, ancha o cuadrada) se ve igual
 *   de ordenada en la tienda.
 * - Portadas de categoría: solo la reduce a máximo 1200 px (se muestran a sangre).
 */
async function prepare(file, { square }) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (square) {
    canvas.width = canvas.height = SQUARE;
    const box = SQUARE * (1 - MARGIN * 2);
    const scale = Math.min(box / bitmap.width, box / bitmap.height);
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, SQUARE, SQUARE);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, Math.round((SQUARE - w) / 2), Math.round((SQUARE - h) / 2), w, h);
  } else {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    ctx.fillStyle = '#fff'; // fondo blanco para PNG con transparencia
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  }
  bitmap.close?.();
  return toBlob(canvas);
}

/** Sube una foto al almacenamiento y devuelve su URL pública. */
export async function uploadImage(file, folder = 'productos') {
  const { blob, ext, type } = await prepare(file, { square: folder === 'productos' });
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(SUPABASE.bucket).upload(path, blob, {
    contentType: type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(SUPABASE.bucket).getPublicUrl(path).data.publicUrl;
}

/** Borra la foto si fue subida a nuestro almacenamiento (las de enlaces externos se ignoran). */
export async function deleteImage(url) {
  const marker = `/storage/v1/object/public/${SUPABASE.bucket}/`;
  if (!url || !url.includes(marker)) return;
  const path = decodeURIComponent(url.split(marker)[1].split('?')[0]);
  const { error } = await supabase.storage.from(SUPABASE.bucket).remove([path]);
  if (error) console.warn('No se pudo borrar la foto anterior', error);
}
