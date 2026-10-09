import { SUPABASE } from '../config.js';

/**
 * Acceso liviano a la API REST de Supabase para la página pública.
 * (El panel de administración usa el cliente completo, ver lib/supabase.js.)
 */
export const restEnabled = Boolean(SUPABASE.url && SUPABASE.key);

const headers = () => ({
  apikey: SUPABASE.key,
  Authorization: `Bearer ${SUPABASE.key}`,
  'Content-Type': 'application/json',
});

export async function restSelect(table, query) {
  const res = await fetch(`${SUPABASE.url}/rest/v1/${table}?${query}`, { headers: headers() });
  if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function restInsert(table, row) {
  const res = await fetch(`${SUPABASE.url}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
}
