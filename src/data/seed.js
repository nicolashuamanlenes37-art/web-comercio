/**
 * Catálogo inicial.
 *
 * - Se usa como respaldo mientras la página no esté conectada a Supabase.
 * - `npm run seed:sql` lo convierte en supabase/seed.sql para cargarlo en la base.
 *
 * Las fotos son genéricas (Unsplash, uso libre) y referenciales.
 * Los precios quedan en null ("Consultar precio") hasta que el cliente
 * los cargue desde el panel de administración.
 */
const img = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${w}&fit=crop&auto=format&q=75`;

export const SEED_CATEGORIES = [
  {
    slug: 'tecnologia',
    name: 'Tecnología',
    tagline: 'Celular, computadora y TV',
    cover: img('1586254116951-5263e2cdb44c', 900),
  },
  {
    slug: 'hogar',
    name: 'Hogar',
    tagline: 'Para tu casa',
    cover: img('1577576223085-3eb295cd414f', 900),
  },
  {
    slug: 'limpieza',
    name: 'Limpieza y cuidado personal',
    tagline: 'Casa limpia, todo en un solo lugar',
    cover: img('1626379481874-3dc5678fa8ca', 900),
  },
  {
    slug: 'bebidas',
    name: 'Bebidas',
    tagline: 'Siempre frías',
    cover: img('1624896276654-2eb0c7e8247c', 900),
  },
  {
    slug: 'harinas',
    name: 'Harinas y superalimentos',
    tagline: 'Naturales del Perú',
    cover: img('1760445528355-19c965df8d4d', 900),
  },
];

export const SEED_PRODUCTS = [
  // Tecnología
  { category: 'tecnologia', name: 'Cable USB tipo C', badge: 'Más vendido', featured: true,
    description: 'Carga y transferencia de datos. Compatible con la mayoría de celulares Android.',
    image: img('1492107376256-4026437926cd') },
  { category: 'tecnologia', name: 'Cable micro USB (V8)',
    description: 'Para celulares, parlantes y accesorios con entrada micro USB.',
    image: img('1595756630452-736bc8ef3693') },
  { category: 'tecnologia', name: 'Cargador de pared USB', featured: true,
    description: 'Cabezal cargador para enchufe. Úsalo con tu cable tipo C o V8.',
    image: img('1583863788434-e58a36330cf0') },
  { category: 'tecnologia', name: 'Audífonos inalámbricos ZYNC', badge: 'Nuevo', featured: true,
    description: 'Audífonos bluetooth con estuche de carga.',
    image: img('1632200004922-bc18602c79fc') },
  { category: 'tecnologia', name: 'Case para iPhone', featured: true,
    description: 'Fundas protectoras en varios colores y modelos.',
    image: img('1535157412991-2ef801c1748b') },
  { category: 'tecnologia', name: 'Teclado para computadora',
    description: 'Teclado USB para PC y laptop.',
    image: img('1541140532154-b024d705b90a') },
  { category: 'tecnologia', name: 'Antena para TV',
    description: 'Antena para señal digital de televisión.',
    image: img('1636230837680-478e71305f22') },

  // Hogar
  { category: 'hogar', name: 'Platos hondos',
    description: 'Platos hondos para sopas y cremas.',
    image: img('1523367438061-01c055ce790c') },
  { category: 'hogar', name: 'Almohada', featured: true,
    description: 'Almohada suave para descansar mejor.',
    image: img('1629949009710-2df14c41a72e') },

  // Limpieza y cuidado personal
  { category: 'limpieza', name: 'Lejía',
    description: 'Desinfecta y blanquea. Varias presentaciones.',
    image: img('1649005011845-ef225c89da86') },
  { category: 'limpieza', name: 'Limpiatodo',
    description: 'Limpiador multiusos para pisos y superficies.',
    image: img('1563453392212-326f5e854473') },
  { category: 'limpieza', name: 'Lavavajillas',
    description: 'Para dejar tu vajilla limpia y sin grasa.',
    image: img('1590610994353-7b0e7546e681') },
  { category: 'limpieza', name: 'Detergente', featured: true,
    description: 'Detergente para ropa blanca y de color.',
    image: img('1624372635310-01d078c05dd9') },
  { category: 'limpieza', name: 'Papel toalla',
    description: 'Rollos de papel toalla absorbente.',
    image: img('1583496597467-d968d2fa33a8') },
  { category: 'limpieza', name: 'Jabón de tocador',
    description: 'Jabones para el cuidado diario.',
    image: img('1650189608237-db034f45e552') },
  { category: 'limpieza', name: 'Pasta dental',
    description: 'Cuidado bucal para toda la familia.',
    image: img('1612705166160-97d3b2e8e212') },

  // Bebidas
  { category: 'bebidas', name: 'Gaseosas y bebidas',
    description: 'Gaseosas, aguas y refrescos. Consulta marcas y tamaños disponibles.',
    image: img('1533007716222-4b465613a984') },

  // Harinas y superalimentos
  { category: 'harinas', name: 'Harina de cúrcuma', featured: true,
    description: 'Cúrcuma en polvo, ideal para golden milk y guisos.',
    image: img('1615485500834-bc10199bc727') },
  { category: 'harinas', name: 'Cacao en polvo',
    description: 'Cacao peruano para bebidas y postres.',
    image: img('1640958899669-12f9b327d38f') },
  { category: 'harinas', name: 'Maca amarilla',
    description: 'Maca andina en polvo.',
    image: img('1595414902678-862fe51c9f27') },
  { category: 'harinas', name: 'Maca negra',
    description: 'Maca negra andina en polvo.',
    image: img('1565498971161-42ae3dbcca75') },
  { category: 'harinas', name: 'Harina de camote',
    description: 'Para panes, tortillas y repostería.',
    image: img('1741112480266-62def497fa27') },
];
