/**
 * Plugin de build: todo lo que la página necesita para estar en internet.
 * Toma los datos de src/config.js y de las variables de entorno de Supabase.
 *
 *   - Inserta los bloques repetidos de HTML (<!-- include:nombre -->, en src/partials/)
 *   - Agrega a todas las páginas los íconos, el manifest y el color del navegador
 *   - Reemplaza los datos de la tienda (%STORE_TAGLINE%, %PAYMENTS_OR%…) y agrega la URL canónica
 *   - Agrega los datos de la tienda para Google (JSON-LD) y la verificación de Search Console
 *   - Genera robots.txt, sitemap.xml, manifest.webmanifest y _headers (seguridad y caché)
 */
import { readFileSync } from 'node:fs';
import { STORE, SITE } from '../src/config.js';
import { prettyPhone, listText } from '../src/lib/format.js';

// Páginas que Google debe indexar (el panel y la 404 quedan fuera).
// Sin ".html": Cloudflare Pages redirige /terminos.html → /terminos.
const PUBLIC_PAGES = ['/', '/terminos', '/privacidad', '/libro-de-reclamaciones'];

const base = () => SITE.url.replace(/\/+$/, '');
const pagePath = (p) => p.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');

/** Datos de src/config.js que se escriben en el HTML: %NOMBRE% → valor */
const tokens = () => ({
  SITE_URL: base(),
  STORE_TAGLINE: STORE.tagline,
  STORE_CITY: STORE.city,
  STORE_PHONE: prettyPhone(STORE.whatsapp),
  PAYMENTS_AND: listText(STORE.payments),
  PAYMENTS_OR: listText(STORE.payments, 'disjunction'),
});
const escHtml = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const fillTokens = (html) => {
  const values = tokens();
  return html.replace(/%([A-Z_]+)%/g, (match, key) => (key in values ? escHtml(values[key]) : match));
};

/**
 * Vista previa al compartir el enlace (WhatsApp, Facebook, Instagram, X, Telegram…).
 * Usa el <title> y la descripción de cada página, y la imagen con el logo de public/og-image.png.
 */
function socialTags(html, path) {
  const attr = (v) => escHtml(v.replace(/&amp;/g, '&'));
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1] ?? STORE.name;
  const description = html.match(/<meta name="description" content="(.*?)"/s)?.[1] ?? STORE.tagline;
  const image = `${base()}/og-image.png`;
  return [
    '<meta property="og:type" content="website" />',
    '<meta property="og:locale" content="es_PE" />',
    `<meta property="og:site_name" content="${attr(STORE.name)}" />`,
    `<meta property="og:url" content="${base()}${path}" />`,
    `<meta property="og:title" content="${attr(title)}" />`,
    `<meta property="og:description" content="${attr(description)}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:secure_url" content="${image}" />`,
    '<meta property="og:image:type" content="image/png" />',
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta property="og:image:alt" content="Logo de ${attr(STORE.name)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${attr(title)}" />`,
    `<meta name="twitter:description" content="${attr(description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ].join('\n    ');
}

const COMMON_HEAD = [
  '<meta name="theme-color" content="#ffffff" />',
  '<link rel="icon" href="/favicon.svg" type="image/svg+xml" />',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
  '<link rel="manifest" href="/manifest.webmanifest" />',
];

/** Reemplaza <!-- include:nombre --> o <!-- include:nombre x4 --> (repetido) por src/partials/nombre.html */
const INCLUDE = /<!--\s*include:([\w-]+)(?:\s+x(\d+))?\s*-->/g;
function includePartials(html, depth = 0) {
  if (depth > 5) throw new Error('include: demasiados niveles');
  return html.replace(INCLUDE, (_, name, times = 1) => {
    const file = readFileSync(new URL(`../src/partials/${name}.html`, import.meta.url), 'utf8').trim();
    return includePartials(file, depth + 1).repeat(Number(times));
  });
}

function jsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore', // tienda solo online: sin dirección de local
    name: STORE.name,
    description: STORE.tagline,
    url: `${base()}/`,
    logo: `${base()}/icon-512.png`,
    image: `${base()}/og-image.png`,
    telephone: `+${STORE.whatsapp}`,
    address: { '@type': 'PostalAddress', addressLocality: STORE.city.split(',')[0], addressCountry: 'PE' },
    areaServed: STORE.city.split(',')[0],
    currenciesAccepted: 'PEN',
    paymentAccepted: STORE.payments.join(', '),
  };
  if (STORE.openingHours?.length) data.openingHours = STORE.openingHours;
  if (STORE.instagram) data.sameAs = [STORE.instagram];
  // Evita que un "<" en los datos cierre la etiqueta <script>
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

/** Cabeceras HTTP para Cloudflare Pages (archivo _headers). */
function headers(supabaseUrl) {
  const ga = SITE.gaId;
  const csp = [
    "default-src 'self'",
    `script-src 'self'${ga ? ' https://www.googletagmanager.com' : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    `connect-src 'self'${supabaseUrl ? ` ${supabaseUrl}` : ''}${
      ga ? ' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com' : ''
    }`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');

  return `/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/admin/*
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-store
`;
}

export function seoPlugin() {
  let supabaseUrl = '';
  return {
    name: 'nyd-site',
    configResolved(config) {
      supabaseUrl = (config.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
    },
    transformIndexHtml(html, ctx) {
      const path = pagePath(ctx.path);
      const tags = [...COMMON_HEAD];

      if (PUBLIC_PAGES.includes(path)) tags.push(`<link rel="canonical" href="${base()}${path}" />`);
      if (path === '/') {
        // La tienda pide el catálogo a Supabase apenas carga: abrir la conexión antes
        if (supabaseUrl) tags.push(`<link rel="preconnect" href="${supabaseUrl}" crossorigin />`);
        if (SITE.googleVerification) {
          tags.push(`<meta name="google-site-verification" content="${SITE.googleVerification.replace(/"/g, '')}" />`);
        }
        tags.push(jsonLd());
      }

      let out = fillTokens(includePartials(html));
      // La vista previa va justo después del <title>: algunas apps solo leen el inicio de la página
      if (PUBLIC_PAGES.includes(path)) out = out.replace('</title>', `</title>\n    ${socialTags(out, path)}`);
      return out.replace('</head>', `    ${tags.join('\n    ')}\n  </head>`);
    },
    generateBundle() {
      const emit = (fileName, source) => this.emitFile({ type: 'asset', fileName, source });

      emit('robots.txt', `User-agent: *\nDisallow: /admin/\n\nSitemap: ${base()}/sitemap.xml\n`);

      const today = new Date().toISOString().slice(0, 10);
      const urls = PUBLIC_PAGES.map((p) => `  <url><loc>${base()}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n');
      emit(
        'sitemap.xml',
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      );

      emit(
        'manifest.webmanifest',
        JSON.stringify(
          {
            name: STORE.name,
            short_name: 'N&D',
            description: STORE.tagline,
            lang: 'es-PE',
            start_url: '/',
            scope: '/',
            display: 'standalone',
            background_color: '#ffffff',
            theme_color: '#ffffff',
            icons: [
              { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
              { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
              { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            ],
          },
          null,
          2,
        ),
      );

      emit('_headers', headers(supabaseUrl));
    },
  };
}
