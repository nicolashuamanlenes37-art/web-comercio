# Accesorios N&D

Catálogo web con pedido por WhatsApp y panel de administración para que el dueño
gestione productos, precios, fotos y categorías desde el celular.

- **Tienda:** `/`
- **Panel:** `/admin/`
- **Legal:** `/terminos.html`, `/privacidad.html`, `/libro-de-reclamaciones.html`

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
8. En el hosting (Vercel / Cloudflare) → **Environment Variables**:
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
public/                       Logo, favicon, imagen para compartir
brand/                        Logo en SVG y PNG para redes e impresión
supabase/schema.sql           Tablas, seguridad (RLS) y almacenamiento de fotos
supabase/seed.sql             Catálogo inicial
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
| Datos legales (nombre, DNI/RUC, dirección) | `src/config.js` → `legal` |
| Textos de “Cómo pedir” y preguntas frecuentes | `index.html` |
| Colores y tipografía | `src/styles/tokens.css` |

## 5. Seguridad

- Cualquier visitante solo puede **leer** productos y categorías visibles y **registrar** reclamos.
- Crear, editar, borrar y subir fotos solo es posible con una sesión cuyo correo esté en `admins`.
- La clave publicable de Supabase es pública por diseño; la seguridad la dan las reglas RLS.
