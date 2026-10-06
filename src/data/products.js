/**
 * Catálogo. Precios y presentaciones son DE EJEMPLO.
 *
 * image: por ahora fotos de stock (Unsplash) para la vista previa.
 *        Cuando lleguen las fotos del cliente, guardarlas en /public/images/
 *        y cambiar por ejemplo a:  image: '/images/curcuma.jpg'
 */
const unsplash = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${w}&fit=crop&auto=format&q=75`;

export const CATEGORIES = [
  { id: 'raices', name: 'Raíces', color: '#E39B0B' },
  { id: 'granos', name: 'Granos andinos', color: '#D9C7A3' },
  { id: 'frutos', name: 'Frutos', color: '#6B3E22' },
  { id: 'semillas', name: 'Semillas', color: '#9A6A3E' },
];

export const PRODUCTS = [
  {
    id: 'curcuma',
    name: 'Cúrcuma en polvo',
    category: 'raices',
    badge: 'Más vendido',
    description: 'Color intenso. Ideal para golden milk, arroces y guisos.',
    image: unsplash('1615485500834-bc10199bc727'),
    sizes: [{ grams: 250, price: 18 }, { grams: 500, price: 32 }],
  },
  {
    id: 'maca',
    name: 'Maca en polvo',
    category: 'raices',
    description: 'Maca andina gelatinizada, de sabor suave.',
    image: unsplash('1595414902678-862fe51c9f27'),
    sizes: [{ grams: 250, price: 20 }, { grams: 500, price: 36 }],
  },
  {
    id: 'jengibre',
    name: 'Jengibre en polvo',
    category: 'raices',
    description: 'Picante y aromático, para infusiones y postres.',
    image: unsplash('1615484478243-c94e896edbae'),
    sizes: [{ grams: 250, price: 17 }, { grams: 500, price: 30 }],
  },
  {
    id: 'quinua',
    name: 'Harina de quinua',
    category: 'granos',
    description: 'Para panes, panqueques y espesar sopas.',
    image: unsplash('1704650311291-0e001b7e2b9f'),
    sizes: [{ grams: 500, price: 14 }, { grams: 1000, price: 26 }],
  },
  {
    id: 'kiwicha',
    name: 'Harina de kiwicha',
    category: 'granos',
    description: 'Rica en proteína, con sabor ligeramente tostado.',
    image: unsplash('1704650312022-ed1a76dbed1b'),
    sizes: [{ grams: 500, price: 15 }, { grams: 1000, price: 28 }],
  },
  {
    id: 'cacao',
    name: 'Cacao en polvo',
    category: 'frutos',
    badge: 'Nuevo',
    description: 'Cacao peruano 100%, sin azúcar añadida.',
    image: unsplash('1640958899669-12f9b327d38f'),
    sizes: [{ grams: 250, price: 19 }, { grams: 500, price: 34 }],
  },
  {
    id: 'lucuma',
    name: 'Lúcuma en polvo',
    category: 'frutos',
    description: 'Dulzor natural para batidos, helados y postres.',
    image: unsplash('1611256244911-9a376830a6b0'),
    sizes: [{ grams: 250, price: 21 }, { grams: 500, price: 38 }],
  },
  {
    id: 'linaza',
    name: 'Linaza',
    category: 'semillas',
    description: 'Fibra y omega 3 para tu desayuno.',
    image: unsplash('1642497393790-c5751b818e1b'),
    sizes: [{ grams: 250, price: 10 }, { grams: 500, price: 18 }],
  },
];

/** Fotos de uso / ambiente para las secciones editoriales. */
export const LIFESTYLE = {
  flour: unsplash('1760445528355-19c965df8d4d', 1200),
  goldenMilk: unsplash('1459933083533-46381576caa9', 900),
  bowls: unsplash('1627308594190-a057cd4bfac8', 900),
  turmericRoot: unsplash('1768729340164-7d83fe18384d', 900),
  cacao: unsplash('1565498971161-42ae3dbcca75', 900),
  pantry: unsplash('1633509907796-ece8a21bdbcb', 900),
};

export const productById = (id) => PRODUCTS.find((p) => p.id === id);
export const categoryById = (id) => CATEGORIES.find((c) => c.id === id);
