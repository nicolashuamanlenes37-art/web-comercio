/**
 * Datos de la tienda. Es el único archivo que hay que tocar
 * para cambiar contacto o nombre.
 */
export const STORE = {
  name: 'Accesorios N&D',
  tagline: 'Accesorios para celular, computadora y hogar, artículos de limpieza y más.',
  // Número de WhatsApp con código de país, sin "+" ni espacios.
  whatsapp: '51916083665',
  currency: 'S/',
  email: '',
  instagram: '',
  city: 'Lima, Perú',

  // Datos del proveedor para el Libro de Reclamaciones y las páginas legales.
  legal: {
    owner: 'Nicolás [apellidos por completar]',
    document: 'DNI / RUC: [por completar]',
    address: '[Dirección del local por completar]',
  },
};

/** Conexión a Supabase (se configura con variables de entorno, ver .env.example). */
export const SUPABASE = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  key: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  bucket: 'productos',
};
