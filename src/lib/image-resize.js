/**
 * Reduce una foto en el navegador antes de subirla (las del celular pesan varios MB).
 * Devuelve WebP si el navegador lo soporta, si no JPEG.
 *
 * @param {File} file
 * @param {object} opts
 * @param {number} opts.maxSide  lado mayor máximo en px
 * @param {number} [opts.square] si se indica, encuadra la foto completa en un cuadrado blanco de ese tamaño
 * @param {number} [opts.margin] aire alrededor dentro del cuadrado (0.06 = 6 % por lado)
 * @param {boolean} [opts.jpeg] fuerza JPEG (para compartir: WhatsApp toma los WebP como stickers)
 */
export async function resizeImage(file, { maxSide, square = 0, margin = 0, jpeg = false }) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';

  if (square) {
    canvas.width = canvas.height = square;
    const box = square * (1 - margin * 2);
    const scale = Math.min(box / bitmap.width, box / bitmap.height);
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, square, square);
    ctx.drawImage(bitmap, Math.round((square - w) / 2), Math.round((square - h) / 2), w, h);
  } else {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    ctx.fillStyle = '#fff'; // fondo blanco para PNG con transparencia
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  }
  bitmap.close?.();

  if (!jpeg) {
    const webp = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85));
    if (webp && webp.type === 'image/webp') return { blob: webp, ext: 'webp', type: 'image/webp' };
  }
  const jpg = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));
  return { blob: jpg, ext: 'jpg', type: 'image/jpeg' };
}
