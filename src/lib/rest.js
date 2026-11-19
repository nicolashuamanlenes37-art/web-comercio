import { SUPABASE } from '../config.js';

/**
 * Acceso liviano a la API REST de Supabase para la página pública.
 * (El panel de administración usa el cliente completo, ver lib/supabase.js.)
 */
const TIMEOUT_MS = 10000;

const headers = () => ({
  apikey: SUPABASE.key,
  Authorization: `Bearer ${SUPABASE.key}`,
  'Content-Type': 'application/json',
});

export async function restSelect(table, query) {
  const res = await fetch(`${SUPABASE.url}/rest/v1/${table}?${query}`, {
    headers: headers(),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function restInsert(table, row) {
  const res = await fetch(`${SUPABASE.url}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=minimal' },
    body: JSON.stringify(row),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
}

/** Sube un archivo a un bucket de Storage (solo crea, nunca reemplaza) y devuelve su URL pública. */
export async function restUpload(bucket, path, blob, contentType) {
  const res = await fetch(`${SUPABASE.url}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE.key,
      Authorization: `Bearer ${SUPABASE.key}`,
      'Content-Type': contentType,
      'x-upsert': 'false',
    },
    body: blob,
    signal: AbortSignal.timeout(30000), // fotos desde datos móviles
  });
  if (!res.ok) throw new Error(`upload: ${res.status} ${await res.text()}`);
  return `${SUPABASE.url}/storage/v1/object/public/${bucket}/${path}`;
}
