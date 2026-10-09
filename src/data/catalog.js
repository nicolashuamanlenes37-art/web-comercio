import { restEnabled, restSelect } from '../lib/rest.js';
import { SEED_CATEGORIES, SEED_PRODUCTS } from './seed.js';

/**
 * Formato común que usa la página, venga de Supabase o del catálogo local:
 *   categories: [{ id, slug, name, tagline, cover }]
 *   products:   [{ id, name, description, price, image, badge, featured, categoryId }]
 */
const fromSeed = () => ({
  categories: SEED_CATEGORIES.map((c) => ({ ...c, id: c.slug })),
  products: SEED_PRODUCTS.map((p, i) => ({
    id: `p${i + 1}`,
    name: p.name,
    description: p.description || '',
    price: p.price ?? null,
    image: p.image || '',
    badge: p.badge || '',
    featured: Boolean(p.featured),
    categoryId: p.category,
  })),
  source: 'local',
});

async function fromSupabase() {
  const [cats, prods] = await Promise.all([
    restSelect('categories', 'select=id,slug,name,tagline,cover_url&active=eq.true&order=sort,name'),
    restSelect(
      'products',
      'select=id,name,description,price,image_url,badge,featured,category_id&active=eq.true&order=sort,name',
    ),
  ]);

  return {
    categories: cats.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      tagline: c.tagline || '',
      cover: c.cover_url || '',
    })),
    products: prods.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.price === null ? null : Number(p.price),
      image: p.image_url || '',
      badge: p.badge || '',
      featured: p.featured,
      categoryId: p.category_id,
    })),
    source: 'supabase',
  };
}

/** Carga el catálogo. Si Supabase falla, usa el catálogo local para no dejar la página vacía. */
export async function loadCatalog() {
  if (!restEnabled) return fromSeed();
  try {
    return await fromSupabase();
  } catch (err) {
    console.warn('No se pudo cargar el catálogo desde Supabase, usando el local.', err);
    return fromSeed();
  }
}
