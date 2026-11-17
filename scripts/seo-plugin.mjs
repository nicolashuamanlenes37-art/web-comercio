/**
 * SEO y analítica en tiempo de build. Toma los datos de src/config.js:
 *   - reemplaza %SITE_URL% en el HTML (vista previa al compartir)
 *   - agrega la URL canónica a cada página pública
 *   - agrega los datos estructurados de la tienda (JSON-LD) en el inicio
 *   - agrega Google Analytics y la verificación de Search Console si están configurados
 *   - genera robots.txt y sitemap.xml
 */
import { STORE, SITE } from '../src/config.js';

// Páginas que Google debe indexar (el panel y la 404 quedan fuera).
// Sin ".html": Cloudflare Pages redirige /terminos.html → /terminos.
const PUBLIC_PAGES = ['/', '/terminos', '/privacidad', '/libro-de-reclamaciones'];

const base = () => SITE.url.replace(/\/+$/, '');
const pagePath = (p) => p.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');

function jsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: STORE.name,
    description: STORE.tagline,
    url: `${base()}/`,
    logo: `${base()}/apple-touch-icon.png`,
    image: `${base()}/og-image.png`,
    telephone: `+${STORE.whatsapp}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Lima', addressCountry: 'PE' },
    areaServed: 'Lima',
    currenciesAccepted: 'PEN',
    paymentAccepted: 'Yape, Plin, Efectivo',
  };
  if (STORE.openingHours?.length) data.openingHours = STORE.openingHours;
  if (STORE.instagram) data.sameAs = [STORE.instagram];
  // Evita que un "<" en los datos cierre la etiqueta <script>
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

function analytics() {
  if (!SITE.gaId) return '';
  const id = JSON.stringify(SITE.gaId);
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(SITE.gaId)}"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${id});</script>`;
}

export function seoPlugin() {
  return {
    name: 'nyd-seo',
    transformIndexHtml(html, ctx) {
      const path = pagePath(ctx.path);
      const isAdmin = path.startsWith('/admin');
      const tags = [];

      if (PUBLIC_PAGES.includes(path)) tags.push(`<link rel="canonical" href="${base()}${path}" />`);
      if (path === '/') {
        if (SITE.googleVerification) {
          tags.push(`<meta name="google-site-verification" content="${SITE.googleVerification.replace(/"/g, '')}" />`);
        }
        tags.push(jsonLd());
      }
      if (!isAdmin) tags.push(analytics());

      return html
        .replaceAll('%SITE_URL%', base())
        .replace('</head>', `    ${tags.filter(Boolean).join('\n    ')}\n  </head>`);
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nDisallow: /admin/\n\nSitemap: ${base()}/sitemap.xml\n`,
      });
      const today = new Date().toISOString().slice(0, 10);
      const urls = PUBLIC_PAGES.map(
        (p) => `  <url><loc>${base()}${p}</loc><lastmod>${today}</lastmod></url>`,
      ).join('\n');
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
    },
  };
}
