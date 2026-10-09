import { supabase } from '../lib/supabase.js';
import { SUPABASE } from '../config.js';

const MAX_SIDE = 1200;

/**
 * Reduce la foto antes de subirla (las del celular pesan varios MB).
 * Devuelve un WebP de máximo 1200 px por lado.
 */
async function compress(file) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; // fondo blanco para PNG con transparencia
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.82));
  if (blob && blob.type === 'image/webp') return { blob, ext: 'webp', type: 'image/webp' };
  const jpeg = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  return { blob: jpeg, ext: 'jpg', type: 'image/jpeg' };
}

/** Sube una foto al almacenamiento y devuelve su URL pública. */
export async function uploadImage(file, folder = 'productos') {
  const { blob, ext, type } = await compress(file);
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
