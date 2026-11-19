/**
 * Datos de la tienda. Es el único archivo que hay que tocar
 * para cambiar contacto o nombre.
 */
export const STORE = {
  name: 'Accesorios N&D',
  tagline: 'Tecnología, hogar, limpieza, bebidas y harinas en un solo lugar.',
  // Número de WhatsApp con código de país, sin "+" ni espacios.
  whatsapp: '51918460597',
  currency: 'S/',
  email: '',
  instagram: '',
  city: 'Lima, Perú',
  payments: ['Yape', 'Plin', 'efectivo'],
  // Horario de atención. Ej.: 'Lunes a sábado, 9:00 a 19:00'. Vacío = no se muestra.
  hours: 'Lunes a sábado, de 8:00 a. m. a 6:00 p. m.',
  // El mismo horario para Google (formato schema.org). Ej.: ['Mo-Sa 09:00-19:00']
  openingHours: ['Mo-Sa 08:00-18:00'],

  // Datos del proveedor para el Libro de Reclamaciones y las páginas legales.
  legal: {
    owner: 'Nicolás Ricardo Huaman Lenes',
    document: 'RUC 10452759221',
    // Tienda solo online (sin local). Vacío = no se muestra.
    address: '',
  },
};

/**
 * Datos para Google y analítica.
 * Al comprar el dominio, solo hay que cambiar `url` aquí y volver a desplegar:
 * se actualizan la URL canónica, la vista previa al compartir, el sitemap y robots.txt.
 */
export const SITE = {
  url: 'https://accesoriosnyd.pages.dev',
  // ID de Google Analytics 4 (G-XXXXXXXXXX). Vacío = sin analítica.
  gaId: '',
  // Código de Google Search Console (método "Etiqueta HTML", solo el valor de content).
  googleVerification: '',
};

// En el navegador Vite reemplaza import.meta.env; en vite.config (Node) no existe.
const env = import.meta.env || {};

/** Conexión a Supabase (se configura con variables de entorno, ver .env.example). */
export const SUPABASE = {
  url: env.VITE_SUPABASE_URL || '',
  key: env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  bucket: 'productos',
};

/** true cuando la página está conectada a Supabase (si no, usa el catálogo de ejemplo). */
export const hasSupabase = Boolean(SUPABASE.url && SUPABASE.key);
