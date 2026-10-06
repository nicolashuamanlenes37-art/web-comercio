/* ==========================================================
   CONFIGURACIÓN — editar aquí
   ========================================================== */
const CONFIG = {
  // Número de WhatsApp con código de país, sin "+" ni espacios. Ej: 51987654321
  whatsapp: "51999999999",
  moneda: "S/",
};

// Precios y presentaciones de ejemplo: reemplazar por los reales del cliente.
// Para usar foto real: agrega  img: "img/curcuma.jpg"  (cuadrada, 1000×1000 recomendada).
const PRODUCTOS = [
  { id: "curcuma", nombre: "Cúrcuma en polvo", cat: "Raíces", tag: "Más vendido",
    desc: "Color intenso, ideal para golden milk y guisos.", c1: "#F2B21C", c2: "#C9800A",
    tamaños: [{ g: 250, precio: 18 }, { g: 500, precio: 32 }] },
  { id: "maca", nombre: "Maca en polvo", cat: "Raíces",
    desc: "Maca andina gelatinizada, sabor suave.", c1: "#EFE2BE", c2: "#D4BE86",
    tamaños: [{ g: 250, precio: 20 }, { g: 500, precio: 36 }] },
  { id: "jengibre", nombre: "Jengibre en polvo", cat: "Raíces",
    desc: "Picante y aromático para infusiones y postres.", c1: "#E9CF8E", c2: "#BF9A4F",
    tamaños: [{ g: 250, precio: 17 }, { g: 500, precio: 30 }] },
  { id: "quinua", nombre: "Harina de quinua", cat: "Granos andinos",
    desc: "Para panes, panqueques y espesar sopas.", c1: "#F0DFC2", c2: "#D8C29A",
    tamaños: [{ g: 500, precio: 14 }, { g: 1000, precio: 26 }] },
  { id: "kiwicha", nombre: "Harina de kiwicha", cat: "Granos andinos",
    desc: "Rica en proteína, sabor tostado.", c1: "#E6CB95", c2: "#BE9C5C",
    tamaños: [{ g: 500, precio: 15 }, { g: 1000, precio: 28 }] },
  { id: "cacao", nombre: "Cacao en polvo", cat: "Frutos",
    desc: "Cacao peruano 100%, sin azúcar.", c1: "#7A4A2E", c2: "#4A2817",
    tamaños: [{ g: 250, precio: 19 }, { g: 500, precio: 34 }] },
  { id: "lucuma", nombre: "Lúcuma en polvo", cat: "Frutos",
    desc: "Dulzor natural para batidos y helados.", c1: "#EDB46A", c2: "#C9853B",
    tamaños: [{ g: 250, precio: 21 }, { g: 500, precio: 38 }] },
  { id: "linaza", nombre: "Linaza molida", cat: "Semillas",
    desc: "Fibra y omega 3 para tu desayuno.", c1: "#A87443", c2: "#6E4523",
    tamaños: [{ g: 250, precio: 10 }, { g: 500, precio: 18 }] },
];

/* ==========================================================
   Lógica — no hace falta tocar debajo de esta línea
   ========================================================== */
const $ = (s, el = document) => el.querySelector(s);
const fmt = n => `${CONFIG.moneda} ${n.toFixed(2)}`;
const fmtG = g => (g >= 1000 ? `${g / 1000} kg` : `${g} g`);
const waLink = msg => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;

const estado = { cat: "Todos", q: "", talla: {}, carrito: {} }; // carrito: { "curcuma|250": cantidad }

// Enlaces de WhatsApp genéricos
document.querySelectorAll("[data-wa]").forEach(a => {
  a.href = waLink(a.dataset.msg || "Hola, quiero información sobre sus productos");
  a.target = "_blank"; a.rel = "noopener";
});
document.querySelectorAll("[data-scroll]").forEach(b =>
  b.addEventListener("click", () => $(b.dataset.scroll).scrollIntoView()));
$("#year").textContent = new Date().getFullYear();

// Pills de categoría
const CAT_COLOR = { "Raíces": "#E39B0B", "Granos andinos": "#D8C29A", "Frutos": "#7A4A2E", "Semillas": "#A87443" };
const cats = ["Todos", ...new Set(PRODUCTOS.map(p => p.cat))];
$("#pills").innerHTML = cats.map(c => `
  <button class="pill ${c === "Todos" ? "pill--all" : ""}" data-cat="${c}" aria-pressed="${c === estado.cat}">
    ${c === "Todos" ? "" : `<span class="pill__dot" style="--c:${CAT_COLOR[c] || "#ddd"}"></span>`}${c}
  </button>`).join("");
$("#pills").addEventListener("click", e => {
  const b = e.target.closest(".pill"); if (!b) return;
  estado.cat = b.dataset.cat;
  document.querySelectorAll(".pill").forEach(p => p.setAttribute("aria-pressed", p === b));
  render();
});

// Buscador
$("#q").addEventListener("input", e => { estado.q = e.target.value.trim().toLowerCase(); render(); });
$("#q").addEventListener("keydown", e => { if (e.key === "Enter") $("#productos").scrollIntoView(); });

const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function render() {
  const q = norm(estado.q);
  const lista = PRODUCTOS.filter(p =>
    (estado.cat === "Todos" || p.cat === estado.cat) &&
    (!q || norm(`${p.nombre} ${p.desc} ${p.cat}`).includes(q)));

  $("#count").textContent = `${lista.length} ${lista.length === 1 ? "producto" : "productos"}`;
  $("#empty").hidden = lista.length > 0;

  $("#grid").innerHTML = lista.map(p => {
    const t = estado.talla[p.id] ?? 0;
    const tam = p.tamaños[t];
    const key = `${p.id}|${tam.g}`;
    const cant = estado.carrito[key] || 0;
    const img = p.img
      ? `<img src="${p.img}" alt="${p.nombre}" loading="lazy" />`
      : `<div class="swatch" style="--c1:${p.c1};--c2:${p.c2};height:100%;border-radius:0" role="img" aria-label="${p.nombre}"></div>`;
    return `
      <article class="card">
        <div class="card__img">${img}${p.tag ? `<span class="card__tag">${p.tag}</span>` : ""}</div>
        <div class="card__body">
          <h3 class="card__name">${p.nombre}</h3>
          <p class="card__desc">${p.desc}</p>
          <div class="size" role="group" aria-label="Presentación">
            ${p.tamaños.map((s, i) => `<button data-size="${p.id}:${i}" aria-pressed="${i === t}">${fmtG(s.g)}</button>`).join("")}
          </div>
          <div class="card__row">
            <span class="card__price">${fmt(tam.precio)}</span>
            <button class="add ${cant ? "is-in" : ""}" data-add="${key}" aria-label="Agregar ${p.nombre} ${fmtG(tam.g)} al pedido">
              ${cant ? `${cant} ✓` : `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`}
            </button>
          </div>
        </div>
      </article>`;
  }).join("");
}

$("#grid").addEventListener("click", e => {
  const s = e.target.closest("[data-size]");
  if (s) { const [id, i] = s.dataset.size.split(":"); estado.talla[id] = +i; render(); return; }
  const a = e.target.closest("[data-add]");
  if (a) { estado.carrito[a.dataset.add] = (estado.carrito[a.dataset.add] || 0) + 1; render(); actualizarCarrito(); }
});

function lineasCarrito() {
  return Object.entries(estado.carrito).map(([key, cant]) => {
    const [id, g] = key.split("|");
    const p = PRODUCTOS.find(x => x.id === id);
    const tam = p.tamaños.find(x => x.g === +g);
    return { p, tam, cant, sub: tam.precio * cant };
  });
}

function actualizarCarrito() {
  const lineas = lineasCarrito();
  const unidades = lineas.reduce((a, l) => a + l.cant, 0);
  const total = lineas.reduce((a, l) => a + l.sub, 0);
  $("#cartbar").hidden = unidades === 0;
  $("#cartCount").textContent = `${unidades} ${unidades === 1 ? "producto" : "productos"}`;
  $("#cartTotal").textContent = `${fmt(total)} + envío`;
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

render();
