# web-comercio

Landing de venta de harinas y superalimentos con pedido por WhatsApp.
Hecha con [Vite](https://vite.dev) y JavaScript sin frameworks.

## Desarrollo

```bash
npm install
npm run dev      # servidor local con recarga
npm run build    # genera /dist para producción
npm run preview  # sirve /dist para revisarlo
```

## Estructura

```
index.html                 Estructura y textos de la página
public/                    Archivos estáticos (favicon, fotos en /images)
src/
  main.js                  Punto de entrada: inicia cada sección
  config.js                Datos de la tienda (WhatsApp, moneda, correo)
  data/products.js         Catálogo, categorías y fotos
  store/cart.js            Estado del pedido
  components/productCard.js Tarjetas de producto
  sections/
    header.js              Header fijo
    hero.js                Constelación 3D, buscador y categorías
    catalog.js             Bandas por categoría y filtros
    cartDrawer.js          Barra y panel del pedido
  lib/                     Utilidades (DOM, formato, WhatsApp, animación)
  styles/
    tokens.css             Colores, tipografía, espacios, radios, sombras
    base.css               Reset y utilidades
    components/            Botones, chips, tarjetas, fotos, panel
    sections/              Estilos por sección
```

## Qué editar

| Qué | Dónde |
| --- | --- |
| Número de WhatsApp, correo, Instagram | `src/config.js` |
| Productos, precios, presentaciones | `src/data/products.js` |
| Fotos | Guardarlas en `public/images/` y usar `image: '/images/curcuma.jpg'` |
| Textos de secciones, preguntas frecuentes | `index.html` |
| Colores y tipografía | `src/styles/tokens.css` |

Las fotos actuales son de [Unsplash](https://unsplash.com) (uso libre) y sirven solo para la vista previa.

## Despliegue

Vercel detecta Vite automáticamente: **Build** `npm run build`, **Output** `dist`.
Cada push a `main` publica una nueva versión.
