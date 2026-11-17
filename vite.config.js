import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { seoPlugin } from './scripts/seo-plugin.mjs';

// Sitio de varias páginas: tienda, panel, páginas legales y 404.
export default defineConfig({
  plugins: [seoPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin/index.html'),
        privacidad: resolve(import.meta.dirname, 'privacidad.html'),
        terminos: resolve(import.meta.dirname, 'terminos.html'),
        reclamaciones: resolve(import.meta.dirname, 'libro-de-reclamaciones.html'),
        notFound: resolve(import.meta.dirname, '404.html'),
      },
    },
  },
});
