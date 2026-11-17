# Accesorios N&D

Catálogo web con pedido por WhatsApp y panel de administración para que el dueño
gestione productos, precios, fotos y categorías desde el celular.

- **Tienda:** `/`
- **Panel:** `/admin/`
- **Legal:** `/terminos.html`, `/privacidad.html`, `/libro-de-reclamaciones.html`
- **Publicada en:** https://accesoriosnyd.pages.dev (Cloudflare Pages)

Hecho con [Vite](https://vite.dev), JavaScript sin frameworks y [Supabase](https://supabase.com)
(base de datos, inicio de sesión y fotos).

---

## 1. Conectar la base de datos (una sola vez)

1. Crear una cuenta en Supabase **con el correo del cliente** (`nicolashuamanlenes37@gmail.com`).
2. **New project** → nombre `accesorios-nyd` → región **South America (São Paulo)** → guardar la contraseña de la base en un lugar seguro.
3. **SQL Editor → New query** → pegar el contenido de `supabase/schema.sql` → **Run**.
4. Nueva consulta → pegar `supabase/seed.sql` → **Run** (carga el catálogo inicial).
5. **Authentication → Users → Add user → Create new user**
   - Correo: `nicolashuamanlenes37@gmail.com`
   - Contraseña: la que usará el cliente
   - Marcar **Auto Confirm User**
6. **Authentication → URL Configuration**
   - Site URL: el dominio de la tienda (ej. `https://accesoriosnyd.pe`)
   - Redirect URLs: agregar `https://TU-DOMINIO/admin/`
7. **Project Settings → API**: copiar **Project URL** y la **Publishable key**.
8. En Cloudflare Pages → **Settings → Variables and Secrets** (tipo *Text*, no *Secret*):
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_PUBLISHABLE_KEY=...
   ```
   y volver a desplegar. Para trabajar en local, copia `.env.example` como `.env.local`.

Mientras no estén estas variables, la tienda funciona con el catálogo de ejemplo de
`src/data/seed.js` y el panel muestra “Panel sin conectar”.

Para agregar otro administrador: crear el usuario en Authentication y añadir su correo
en la tabla `admins` (Table Editor).

## 2. Desarrollo

```bash
npm install
npm run dev       # servidor local
npm run build     # genera /dist
npm run test:db   # prueba el esquema y las reglas de seguridad
npm run seed:sql  # regenera supabase/seed.sql desde src/data/seed.js
```

## 3. Estructura

```
index.html                    Tienda
admin/index.html              Panel de administración
*.html                        Páginas legales
404.html                      Página de error
public/                       Logo, favicon, imagen para compartir
brand/                        Logo en SVG y PNG para redes e impresión
supabase/schema.sql           Tablas, seguridad (RLS) y almacenamiento de fotos
supabase/seed.sql             Catálogo inicial
scripts/seo-plugin.mjs        Canónica, JSON-LD, Analytics, sitemap.xml y robots.txt
src/
  config.js                   Nombre, WhatsApp y datos legales de la tienda
  data/                       Carga del catálogo (Supabase o local)
  sections/                   Header, hero, catálogo, panel del pedido
  admin/                      Panel: productos, categorías, reclamos, fotos
  lib/                        Utilidades (DOM, formato, WhatsApp, REST)
  styles/                     Tokens, componentes y secciones
```

## 4. Qué editar

| Qué | Dónde |
| --- | --- |
| Productos, precios, fotos, categorías | Panel `/admin/` (no requiere tocar código) |
| Número de WhatsApp | `src/config.js` → `whatsapp` |
| Horario de atención | `src/config.js` → `hours` y `openingHours` |
| Dominio de la página | `src/config.js` → `SITE.url` |
| Google Analytics / Search Console | `src/config.js` → `SITE.gaId` / `SITE.googleVerification` |
| Datos legales (nombre, DNI/RUC, dirección) | `src/config.js` → `legal` |
| Textos de “Cómo pedir” y preguntas frecuentes | `index.html` |
| Colores y tipografía | `src/styles/tokens.css` |

## 5. Publicar y aparecer en Google

### Despliegue (Cloudflare Pages)

Cada `git push` a `main` publica solo. Configuración del proyecto en Cloudflare:
preset **Vite**, comando `npm run build`, carpeta `dist`, más las dos variables de Supabase.

### Conectar un dominio propio

1. Comprar el dominio (en Cloudflare → **Domain Registration**, o en otro registrador).
2. Cloudflare → **Workers & Pages → proyecto → Custom domains → Set up a domain**.
3. En `src/config.js` cambiar `SITE.url` por el dominio nuevo (ej. `https://accesoriosnyd.com`) y hacer push.
   Eso actualiza la URL canónica, la vista previa al compartir, `sitemap.xml` y `robots.txt`.
4. Supabase → **Authentication → URL Configuration**: cambiar *Site URL* y agregar `https://DOMINIO/admin/` en *Redirect URLs*.
5. Redirigir `accesoriosnyd.pages.dev` al dominio nuevo (Cloudflare → **Bulk Redirects**, código 301)
   para que Google pase todo al dominio y no queden dos versiones.

### Google Search Console (para aparecer en Google)

1. Entrar a https://search.google.com/search-console con la cuenta del cliente → **Agregar propiedad**.
   - Con dominio propio en Cloudflare: tipo **Dominio** y verificar por DNS (Cloudflare lo hace casi solo).
   - Con `pages.dev`: tipo **Prefijo de URL** → método **Etiqueta HTML** → copiar solo el valor de
     `content="..."` en `SITE.googleVerification`, hacer push y pulsar **Verificar**.
2. **Sitemaps** → enviar `sitemap.xml`.
3. **Inspección de URL** → pegar la URL de inicio → **Solicitar indexación**.

Google tarda de unos días a un par de semanas en mostrar la página.

### Google Analytics 4

1. https://analytics.google.com → crear propiedad *Accesorios N&D* → flujo **Web** → copiar el ID `G-XXXXXXXXXX`.
2. Pegarlo en `SITE.gaId` de `src/config.js` y hacer push.
3. Revisar en **Informes → Tiempo real** que aparezca la visita.

Eventos que ya registra la página: `whatsapp_click` (con la ubicación del botón),
`whatsapp_order` (pedido enviado, con cantidad y subtotal) y `reclamo_enviado`.

### Google Maps (Perfil de Empresa)

Crear el perfil en https://business.google.com con el nombre, teléfono, horario y el link de la página.
Es gratis y es lo que más ayuda a que la encuentren en búsquedas de Lima.

## 6. Seguridad

- Cualquier visitante solo puede **leer** productos y categorías visibles y **registrar** reclamos.
- Crear, editar, borrar y subir fotos solo es posible con una sesión cuyo correo esté en `admins`.
- La clave publicable de Supabase es pública por diseño; la seguridad la dan las reglas RLS.
