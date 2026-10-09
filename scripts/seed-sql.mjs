// Genera supabase/seed.sql a partir de src/data/seed.js
// Uso: npm run seed:sql
import { writeFileSync } from 'node:fs';
import { SEED_CATEGORIES, SEED_PRODUCTS } from '../src/data/seed.js';

const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);

const lines = [
  '-- Catálogo inicial de Accesorios N&D (generado con `npm run seed:sql`).',
  '-- Ejecutar una sola vez, después de schema.sql.',
  '',
  'insert into public.categories (slug, name, tagline, cover_url, sort) values',
  SEED_CATEGORIES.map((c, i) => `  (${q(c.slug)}, ${q(c.name)}, ${q(c.tagline)}, ${q(c.cover)}, ${i + 1})`).join(',\n'),
  'on conflict (slug) do nothing;',
  '',
  'insert into public.products (category_id, name, description, price, image_url, badge, featured, sort)',
  'select c.id, v.name, v.description, v.price, v.image_url, v.badge, v.featured, v.sort',
  'from (values',
  SEED_PRODUCTS.map(
    (p, i) =>
      `  (${q(p.category)}, ${q(p.name)}, ${q(p.description)}, ${p.price ?? 'null'}::numeric, ${q(p.image)}, ${q(p.badge)}, ${p.featured ? 'true' : 'false'}, ${i + 1})`,
  ).join(',\n'),
  ') as v(category, name, description, price, image_url, badge, featured, sort)',
  'join public.categories c on c.slug = v.category',
  'where not exists (select 1 from public.products p where p.name = v.name);',
  '',
];

writeFileSync(new URL('../supabase/seed.sql', import.meta.url), lines.join('\n'));
console.log(`seed.sql: ${SEED_CATEGORIES.length} categorías, ${SEED_PRODUCTS.length} productos`);
