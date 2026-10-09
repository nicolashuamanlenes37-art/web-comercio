import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Sitio de varias páginas: tienda, panel y páginas legales.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin/index.html'),
        privacidad: resolve(import.meta.dirname, 'privacidad.html'),
        terminos: resolve(import.meta.dirname, 'terminos.html'),
        reclamaciones: resolve(import.meta.dirname, 'libro-de-reclamaciones.html'),
      },
    },
  },
});
