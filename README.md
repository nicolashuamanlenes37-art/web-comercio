# web-comercio — Landing de harinas y superalimentos

Sitio estático (HTML + CSS + JS, sin dependencias). Vercel lo despliega tal cual: no requiere build.

## Archivos
- `index.html`: estructura y textos de la página.
- `styles.css`: sistema visual (colores, radios, sombras).
- `app.js`: **configuración** (WhatsApp y productos) y lógica del catálogo y el pedido.

## Qué editar
1. **WhatsApp:** en `app.js`, `CONFIG.whatsapp` → número con código de país, sin `+` (ej. `51987654321`).
2. **Productos y precios:** en `app.js`, lista `PRODUCTOS`.
3. **Fotos:** guárdalas en `img/` (cuadradas, ~1000×1000, .jpg o .webp) y añade `img: "img/curcuma.jpg"` al producto.
4. **Nombre / textos / contacto:** en `index.html` (busca "Raíz Andina", "contacto@ejemplo.com", "Instagram").

## Ver en local
Abre `index.html` en el navegador, o ejecuta `npx serve .`

## Despliegue
Vercel → Add New → Project → importar este repo → Framework: **Other** → Deploy.
Cada `git push` a `main` vuelve a publicar.
