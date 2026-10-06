/* ==========================================================
   CONFIGURACIÓN — editar aquí
   ========================================================== */
const CONFIG = {
  // Número de WhatsApp con código de país, sin "+" ni espacios. Ej: 51987654321
  whatsapp: "51999999999",
  moneda: "S/",
  marca: "raíz andina",
};

// Precios y presentaciones DE EJEMPLO: reemplazar por los reales del cliente.
// Para usar foto real en lugar de la ilustración: agrega  img: "img/curcuma.jpg"  (cuadrada ~1000×1000).
const PRODUCTOS = [
  { id: "curcuma", nombre: "Cúrcuma en polvo", corto: "Cúrcuma", sub: "en polvo", cat: "Raíces", tag: "Más vendido",
    desc: "Color intenso, ideal para golden milk y guisos.", c1: "#F2B21C", c2: "#C9800A",
    tamaños: [{ g: 250, precio: 18 }, { g: 500, precio: 32 }] },
  { id: "maca", nombre: "Maca en polvo", corto: "Maca", sub: "andina", cat: "Raíces",
    desc: "Maca gelatinizada, sabor suave y energía natural.", c1: "#EBDDB4", c2: "#C9B27A",
    tamaños: [{ g: 250, precio: 20 }, { g: 500, precio: 36 }] },
  { id: "jengibre", nombre: "Jengibre en polvo", corto: "Jengibre", sub: "en polvo", cat: "Raíces",
    desc: "Picante y aromático para infusiones y postres.", c1: "#E3C27A", c2: "#B98E3E",
    tamaños: [{ g: 250, precio: 17 }, { g: 500, precio: 30 }] },
  { id: "quinua", nombre: "Harina de quinua", corto: "Quinua", sub: "harina", cat: "Granos andinos",
    desc: "Para panes, panqueques y espesar sopas.", c1: "#EADBBE", c2: "#CDB58A",
    tamaños: [{ g: 500, precio: 14 }, { g: 1000, precio: 26 }] },
  { id: "kiwicha", nombre: "Harina de kiwicha", corto: "Kiwicha", sub: "harina", cat: "Granos andinos",
    desc: "Rica en proteína, con sabor ligeramente tostado.", c1: "#E2C48C", c2: "#B8954F",
    tamaños: [{ g: 500, precio: 15 }, { g: 1000, precio: 28 }] },
  { id: "cacao", nombre: "Cacao en polvo", corto: "Cacao", sub: "100% puro", cat: "Frutos", tag: "Nuevo",
    desc: "Cacao peruano 100%, sin azúcar añadida.", c1: "#7A4A2E", c2: "#3F2215",
    tamaños: [{ g: 250, precio: 19 }, { g: 500, precio: 34 }] },
  { id: "lucuma", nombre: "Lúcuma en polvo", corto: "Lúcuma", sub: "en polvo", cat: "Frutos",
    desc: "Dulzor natural para batidos, helados y postres.", c1: "#EDB46A", c2: "#C47F33",
    tamaños: [{ g: 250, precio: 21 }, { g: 500, precio: 38 }] },
  { id: "linaza", nombre: "Linaza molida", corto: "Linaza", sub: "molida", cat: "Semillas",
    desc: "Fibra y omega 3 para tu desayuno.", c1: "#A87443", c2: "#6E4523",
    tamaños: [{ g: 250, precio: 10 }, { g: 500, precio: 18 }] },
];

/* ==========================================================
   Lógica — no hace falta tocar debajo de esta línea
   ========================================================== */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const fmt = n => `${CONFIG.moneda} ${n.toFixed(2)}`;
const fmtG = g => (g >= 1000 ? `${g / 1000} kg` : `${g} g`);
const waLink = msg => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
const byId = id => PRODUCTOS.find(p => p.id === id);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* ---------- Ilustración de empaque doypack (SVG) ---------- */
let uid = 0;
const BODY = "M34 14 Q34 8 40 8 H160 Q166 8 166 14 L172 222 Q174 244 152 244 H48 Q26 244 28 222 Z";
function pouch(p, peso) {
  const id = `pp${uid++}`;
  const w = peso ?? fmtG(p.tamaños[0].g);
  return `<svg class="pouch" viewBox="0 0 200 262" role="img" aria-label="${p.nombre}">
  <defs>
    <linearGradient id="${id}b" x1="0" x2="1">
      <stop offset="0" stop-color="#d8cdb9"/><stop offset=".16" stop-color="#efe7da"/>
      <stop offset=".45" stop-color="#faf6ef"/><stop offset=".8" stop-color="#ebe2d3"/><stop offset="1" stop-color="#cbbfa9"/>
    </linearGradient>
    <linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.c1}"/><stop offset="1" stop-color="${p.c2}"/></linearGradient>
    <clipPath id="${id}c"><path d="${BODY}"/></clipPath>
  </defs>
  <ellipse cx="100" cy="252" rx="68" ry="7" fill="#000" opacity=".14"/>
  <path d="${BODY}" fill="url(#${id}b)"/>
  <g clip-path="url(#${id}c)">
    <rect x="0" y="0" width="200" height="22" fill="#000" opacity=".05"/>
    <path d="M10 214 Q100 232 190 214 V262 H10Z" fill="#000" opacity=".06"/>
    <rect x="58" y="0" width="14" height="262" fill="#fff" opacity=".35"/>
    <rect x="76" y="0" width="4" height="262" fill="#fff" opacity=".25"/>
    <rect x="0" y="40" width="200" height="4" fill="${p.c1}"/>
  </g>
  <line x1="36" y1="30" x2="164" y2="30" stroke="#000" stroke-opacity=".14" stroke-width="1.2" stroke-dasharray="3 2.5"/>
  <text x="100" y="66" text-anchor="middle" font-size="10.5" font-weight="600" letter-spacing="-.4" fill="#0b0b0b">${CONFIG.marca}<tspan fill="#e39b0b">●</tspan></text>
  <text x="100" y="96" text-anchor="middle" font-size="22" font-weight="700" letter-spacing="-1.3" fill="#0b0b0b">${p.corto}</text>
  <text x="100" y="111" text-anchor="middle" font-size="9.5" fill="#625e5b" letter-spacing="-.2">${p.sub}</text>
  <rect x="56" y="122" width="88" height="92" rx="44" fill="url(#${id}w)" filter="url(#grain)"/>
  <rect x="56.5" y="122.5" width="87" height="91" rx="43.5" fill="none" stroke="#000" stroke-opacity=".1"/>
  <path d="M70 140 Q76 128 92 126" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round" fill="none"/>
  <text x="100" y="234" text-anchor="middle" font-size="9.5" font-weight="600" fill="#0b0b0b">${w}</text>
</svg>`;
}

/* ---------- Enlaces de WhatsApp ---------- */
$$("[data-wa]").forEach(a => {
  a.href = waLink(a.dataset.msg || "Hola, quiero información sobre sus productos");
  a.target = "_blank"; a.rel = "noopener";
});
$("#year").textContent = new Date().getFullYear();

/* ---------- Escena 3D del hero ---------- */
const scene = $("#scene");
const HERO_ITEMS = [
  ["o1", "curcuma"], ["o2", "maca"], ["o3", "cacao"], ["o4", "lucuma"],
];
scene.innerHTML =
  HERO_ITEMS.map(([cls, id], i) =>
    `<div class="orb ${cls}"><div class="orb__in"><div class="orb__bob">${pouch(byId(id))}</div></div></div>`).join("") +
  [["o5", "#F2B21C", "#C9800A"], ["o6", "#7A4A2E", "#3F2215"], ["o7", "#EBDDB4", "#C9B27A"], ["o8", "#EDB46A", "#C47F33"]]
    .map(([cls, a, b]) => `<div class="orb ${cls} ${cls === "o7" || cls === "o6" ? "orb--blur" : ""}"><div class="orb__in"><div class="orb__bob"><div class="chip" style="background:radial-gradient(circle at 35% 30%, ${a}, ${b})"></div></div></div></div>`).join("");

$("#featurePouch").innerHTML = pouch(byId("curcuma"), "250 g");
$("#ctaPouches").innerHTML = ["maca", "curcuma", "cacao"].map(id => `<div>${pouch(byId(id))}</div>`).join("");

/* ---------- Statement: palabras que se encienden ---------- */
const st = $("#statementText");
st.innerHTML = st.textContent.trim().split(/\s+/).map(w => `<span class="sw">${w}</span>`).join(" ");
const words = $$(".sw", st);

/* ---------- Bucle de movimiento (parallax + scroll) ---------- */
const hero = $("#hero"), feature = $("#destacado"), header = $("#header"), bar = $("#progress"), filters = $("#filters");
const m = { tx: 0, ty: 0, x: 0, y: 0 };
let running = false;

if (finePointer && !reduce) {
  addEventListener("pointermove", e => {
    m.tx = (e.clientX / innerWidth) * 2 - 1;
    m.ty = (e.clientY / innerHeight) * 2 - 1;
    kick();
  }, { passive: true });
}
addEventListener("scroll", kick, { passive: true });
addEventListener("resize", kick, { passive: true });

function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }

function frame() {
  const vh = innerHeight, sy = scrollY;

  // Barra de progreso + header
  const max = document.documentElement.scrollHeight - vh;
  bar.style.transform = `scaleX(${max > 0 ? sy / max : 0})`;
  header.classList.toggle("is-scrolled", sy > 10);
  if (filters) filters.classList.toggle("is-stuck", filters.getBoundingClientRect().top <= 70);

  let moving = false;
  if (!reduce) {
    // Hero: mouse + scroll
    const hh = hero.offsetHeight;
    if (sy < hh * 1.2) {
      m.x = lerp(m.x, m.tx, 0.08);
      m.y = lerp(m.y, m.ty, 0.08);
      hero.style.setProperty("--mx", m.x.toFixed(4));
      hero.style.setProperty("--my", m.y.toFixed(4));
      hero.style.setProperty("--p", clamp(sy / hh).toFixed(4));
      moving = Math.abs(m.x - m.tx) > 0.001 || Math.abs(m.y - m.ty) > 0.001;
    }
    // Destacado: giro del empaque
    const fr = feature.getBoundingClientRect();
    if (fr.top < vh && fr.bottom > 0) {
      const fp = clamp((vh - fr.top) / (vh + fr.height));
      feature.style.setProperty("--fp", fp.toFixed(4));
    }
  }
  // Statement
  const sr = st.getBoundingClientRect();
  if (sr.top < vh && sr.bottom > 0) {
    const sp = reduce ? 1 : clamp((vh * 0.85 - sr.top) / (sr.height + vh * 0.35));
    const n = Math.round(sp * words.length);
    words.forEach((w, i) => w.classList.toggle("on", i < n));
  }

  if (moving) requestAnimationFrame(frame); else running = false;
}
kick();

/* ---------- Revelado al hacer scroll ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
const observeReveal = root => $$("[data-reveal]", root).forEach(el => io.observe(el));
observeReveal(document);

/* ---------- Partículas de polvo (solo cuando la sección es visible) ---------- */
(function dust() {
  const cv = $("#dust"); if (!cv || reduce) return;
  const ctx = cv.getContext("2d");
  let W, H, parts = [], visible = false, raf;
  const DPR = Math.min(devicePixelRatio || 1, 2);
  const count = innerWidth < 700 ? 34 : 70;
  function size() {
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  function spawn(p = {}) {
    p.x = Math.random() * W; p.y = H + Math.random() * H * 0.6;
    p.r = 0.8 + Math.random() * 2.6; p.v = 0.25 + Math.random() * 0.7;
    p.a = 0.15 + Math.random() * 0.55; p.s = Math.random() * Math.PI * 2; return p;
  }
  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.y -= p.v; p.s += 0.01; p.x += Math.sin(p.s) * 0.3;
      if (p.y < -10) spawn(p);
      ctx.globalAlpha = p.a * clamp(p.y / H * 1.6);
      ctx.fillStyle = "#F2B21C";
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    if (visible) raf = requestAnimationFrame(tick);
  }
  size(); parts = Array.from({ length: count }, () => { const p = spawn(); p.y = Math.random() * H; return p; });
  addEventListener("resize", size, { passive: true });
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    cancelAnimationFrame(raf); if (visible) tick();
  }).observe(cv);
})();

/* ---------- Inclinación 3D de tarjetas (solo con mouse) ---------- */
function bindTilt(card) {
  if (!finePointer || reduce) return;
  card.addEventListener("pointermove", e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    card.classList.add("is-tilting");
    card.style.setProperty("--ry", `${(px - 0.5) * 12}deg`);
    card.style.setProperty("--rx", `${(0.5 - py) * 10}deg`);
    card.style.setProperty("--gx", `${px * 100}%`);
    card.style.setProperty("--gy", `${py * 100}%`);
  });
  card.addEventListener("pointerleave", () => {
    card.classList.remove("is-tilting");
    card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg");
  });
}

/* ---------- Catálogo ---------- */
const estado = { cat: "Todos", q: "", talla: {}, carrito: {} };
const CAT_COLOR = { "Raíces": "radial-gradient(circle at 35% 30%, #F2B21C, #C9800A)", "Granos andinos": "radial-gradient(circle at 35% 30%, #EADBBE, #CDB58A)", "Frutos": "radial-gradient(circle at 35% 30%, #7A4A2E, #3F2215)", "Semillas": "radial-gradient(circle at 35% 30%, #A87443, #6E4523)" };
const cats = ["Todos", ...new Set(PRODUCTOS.map(p => p.cat))];
$("#pills").innerHTML = cats.map(c => `
  <button class="pill ${c === "Todos" ? "pill--all" : ""}" data-cat="${c}" aria-pressed="${c === estado.cat}">
    ${c === "Todos" ? "" : `<span class="pill__dot" style="--c:${CAT_COLOR[c] || "#ddd"}"></span>`}${c}
  </button>`).join("");
$("#pills").addEventListener("click", e => {
  const b = e.target.closest(".pill"); if (!b) return;
  estado.cat = b.dataset.cat;
  $$(".pill").forEach(p => p.setAttribute("aria-pressed", p === b));
  render(true);
});
$("#q").addEventListener("input", e => { estado.q = e.target.value.trim(); render(true); });

const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function cardHTML(p, i, animate) {
  const t = estado.talla[p.id] ?? 0;
  const tam = p.tamaños[t];
  const key = `${p.id}|${tam.g}`;
  const cant = estado.carrito[key] || 0;
  const media = p.img
    ? `<img src="${p.img}" alt="${p.nombre}" loading="lazy" />`
    : `<div class="card__pouch">${pouch(p, fmtG(tam.g))}</div>`;
  return `
    <article class="card" data-id="${p.id}" ${animate ? `data-reveal style="--c1:${p.c1};--d:${(i % 4) * 0.07}s"` : `style="--c1:${p.c1}"`}>
      <div class="card__img">${media}${p.tag ? `<span class="card__tag">${p.tag}</span>` : ""}</div>
      <div class="card__body">
        <h3 class="card__name">${p.nombre}</h3>
        <p class="card__desc">${p.desc}</p>
        <div class="size" role="group" aria-label="Presentación">
          ${p.tamaños.map((s, j) => `<button data-size="${p.id}:${j}" aria-pressed="${j === t}">${fmtG(s.g)}</button>`).join("")}
        </div>
        <div class="card__row">
          <span class="card__price">${fmt(tam.precio)}</span>
          <button class="add ${cant ? "is-in" : ""}" data-add="${key}" aria-label="Agregar ${p.nombre} ${fmtG(tam.g)} al pedido">
            ${cant ? `${cant} <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5L20 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
                   : `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`}
          </button>
        </div>
      </div>
    </article>`;
}

let firstRender = true;
function render(filtering) {
  const q = norm(estado.q);
  const lista = PRODUCTOS.filter(p =>
    (estado.cat === "Todos" || p.cat === estado.cat) &&
    (!q || norm(`${p.nombre} ${p.desc} ${p.cat}`).includes(q)));
  $("#empty").hidden = lista.length > 0;
  const grid = $("#grid");
  grid.innerHTML = lista.map((p, i) => cardHTML(p, i, firstRender || filtering)).join("");
  if (firstRender || filtering) {
    if (filtering) requestAnimationFrame(() => $$("[data-reveal]", grid).forEach(el => el.classList.add("in")));
    else observeReveal(grid);
  }
  $$(".card", grid).forEach(bindTilt);
  firstRender = false;
}

// Actualiza una sola tarjeta (sin re-renderizar todo)
function refreshCard(id) {
  const old = $(`.card[data-id="${id}"]`); if (!old) return;
  const tmp = document.createElement("div");
  tmp.innerHTML = cardHTML(byId(id), 0, false);
  const card = tmp.firstElementChild;
  old.replaceWith(card); bindTilt(card);
  return card;
}

$("#grid").addEventListener("click", e => {
  const s = e.target.closest("[data-size]");
  if (s) { const [id, i] = s.dataset.size.split(":"); estado.talla[id] = +i; refreshCard(id); return; }
  const a = e.target.closest("[data-add]");
  if (a) addToCart(a.dataset.add, a);
});

function addToCart(key, fromEl) {
  estado.carrito[key] = (estado.carrito[key] || 0) + 1;
  const id = key.split("|")[0];
  const card = refreshCard(id);
  const btn = card && $(".add", card);
  if (btn) btn.classList.add("pop");
  flyTo(fromEl || btn);
  actualizarCarrito(true);
  if (navigator.vibrate) navigator.vibrate(12);
}

function flyTo(fromEl) {
  if (reduce || !fromEl) return;
  const from = fromEl.getBoundingClientRect();
  const target = $("#cartBadge").getBoundingClientRect();
  const showing = $("#cartbar").classList.contains("show");
  const tx = showing ? target.left + target.width / 2 : innerWidth / 2;
  const ty = showing ? target.top + target.height / 2 : innerHeight - 40;
  const dot = document.createElement("div");
  dot.className = "fly"; document.body.appendChild(dot);
  const x0 = from.left + from.width / 2 - 9, y0 = from.top + from.height / 2 - 9;
  const dx = tx - 9 - x0, dy = ty - 9 - y0;
  dot.animate([
    { transform: `translate(${x0}px, ${y0}px) scale(1)` },
    { transform: `translate(${x0 + dx * 0.5}px, ${y0 + Math.min(dy * 0.5, 0) - 120}px) scale(1.3)`, offset: 0.45 },
    { transform: `translate(${x0 + dx}px, ${y0 + dy}px) scale(.4)`, opacity: 0.4 },
  ], { duration: 700, easing: "cubic-bezier(.5,0,.5,1)" }).onfinish = () => dot.remove();
}

$("#featureAdd").addEventListener("click", e => addToCart(`curcuma|${byId("curcuma").tamaños[0].g}`, e.currentTarget));
$("#featurePrice").textContent = fmt(byId("curcuma").tamaños[0].precio);

function lineasCarrito() {
  return Object.entries(estado.carrito).map(([key, cant]) => {
    const [id, g] = key.split("|");
    const p = byId(id);
    const tam = p.tamaños.find(x => x.g === +g);
    return { p, tam, cant, sub: tam.precio * cant };
  });
}

function actualizarCarrito(bump) {
  const lineas = lineasCarrito();
  const unidades = lineas.reduce((a, l) => a + l.cant, 0);
  const total = lineas.reduce((a, l) => a + l.sub, 0);
  const barEl = $("#cartbar");
  barEl.classList.toggle("show", unidades > 0);
  $("#cartBadge").textContent = unidades;
  $("#cartCount").textContent = `${unidades} ${unidades === 1 ? "producto" : "productos"}`;
  $("#cartTotal").textContent = `${fmt(total)} + envío`;
  if (bump && unidades > 1) { barEl.classList.remove("bump"); void barEl.offsetWidth; barEl.classList.add("bump"); }
}

$("#sendOrder").addEventListener("click", () => {
  const lineas = lineasCarrito();
  const total = lineas.reduce((a, l) => a + l.sub, 0);
  const msg = [
    "Hola, quiero hacer este pedido:", "",
    ...lineas.map(l => `• ${l.cant} × ${l.p.nombre} ${fmtG(l.tam.g)} — ${fmt(l.sub)}`),
    "", `Subtotal: ${fmt(total)}`, "", "Mi distrito / ciudad: ",
  ].join("\n");
  window.open(waLink(msg), "_blank", "noopener");
});

render(false);
