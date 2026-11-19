import { supabase } from '../lib/supabase.js';
import { SUPABASE } from '../config.js';
import { resizeImage } from '../lib/image-resize.js';

/**
 * - Productos: se encuadran completas en un cuadrado blanco de 1000×1000 (6 % de aire),
 *   sin recortar ni deformar. Así cualquier foto se ve igual de ordenada en la tienda.
 * - Portadas de categoría: solo se reducen a máximo 1200 px (se muestran a sangre).
 */
const prepare = (file, { square }) =>
  resizeImage(file, square ? { maxSide: 1000, square: 1000, margin: 0.06 } : { maxSide: 1200 });

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
  const { data, error } = await supabase.storage.from(SUPABASE.bucket).remove([path]);
  // Supabase no da error si no tiene permiso: devuelve una lista vacía
  if (error || !data?.length) console.warn('No se pudo borrar la foto anterior', path, error);
}
