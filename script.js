const autos = [
  {
    nombre: "Porsche 911 Carrera S", origen: "Alemania",
    desc: "El deportivo de motor trasero que lleva más de seis décadas perfeccionando la misma idea. Es cómodo para el día a día y preciso en pista.",
    motor: "3.0 L biturbo, 6 cilindros planos", hp: 443, acc: 3.5, vmax: 308, trans: "Doble embrague de 8 marchas (PDK)", trac: "Trasera"
  },
  {
    nombre: "Ferrari 296 GTB", origen: "Italia",
    desc: "Híbrido enchufable con un V6 a 120° y motor eléctrico. Mantiene el carácter de Ferrari con respuesta inmediata y mucha eficiencia.",
    motor: "3.0 L V6 biturbo + eléctrico", hp: 830, acc: 2.9, vmax: 330, trans: "Doble embrague de 8 marchas", trac: "Trasera"
  },
  {
    nombre: "Lamborghini Revuelto", origen: "Italia",
    desc: "Sucesor del Aventador y primer Lamborghini híbrido enchufable de serie. Combina un V12 atmosférico con tres motores eléctricos.",
    motor: "6.5 L V12 + 3 motores eléctricos", hp: 1015, acc: 2.5, vmax: 350, trans: "Doble embrague de 8 marchas", trac: "Integral"
  },
  {
    nombre: "McLaren 720S", origen: "Reino Unido",
    desc: "Chasis de fibra de carbono, puertas que se abren hacia arriba y una aerodinámica pensada para cortar el aire con la menor resistencia posible.",
    motor: "4.0 L V8 biturbo", hp: 710, acc: 2.8, vmax: 341, trans: "Doble embrague de 7 marchas", trac: "Trasera"
  },
  {
    nombre: "Nissan GT-R Nismo", origen: "Japón",
    desc: "Apodado “Godzilla”. Su tracción integral y su electrónica le permiten sacar tiempos de pista al nivel de superdeportivos mucho más caros.",
    motor: "3.8 L V6 biturbo", hp: 600, acc: 2.5, vmax: 315, trans: "Doble embrague de 6 marchas", trac: "Integral"
  },
  {
    nombre: "Chevrolet Corvette Z06", origen: "Estados Unidos",
    desc: "Motor central por primera vez en la historia del Corvette. Su V8 atmosférico de cigüeñal plano llega a 8.600 rpm y suena como un auto de carreras.",
    motor: "5.5 L V8 atmosférico", hp: 670, acc: 2.6, vmax: 312, trans: "Doble embrague de 8 marchas", trac: "Trasera"
  }
];

const $ = (s) => document.querySelector(s);
const fmt = (n) => n.toLocaleString("es-AR");

/* Tarjetas y filtro por país */
function pintarTarjetas(filtro = "todos") {
  const lista = autos.filter(a => filtro === "todos" || a.origen === filtro);
  $("#grid").innerHTML = lista.map(a => `
    <button class="card" data-nombre="${a.nombre}">
      <span class="card-origen">${a.origen}</span>
      <h3>${a.nombre}</h3>
      <p>${a.desc}</p>
      <div class="card-hp"><strong>${fmt(a.hp)}</strong><span>hp · ver ficha</span></div>
    </button>`).join("");
}

document.querySelectorAll("[data-filter]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    pintarTarjetas(btn.dataset.filter);
  });
});

/* Ficha detallada */
const dlg = $("#detalle");
$("#grid").addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  const a = autos.find(x => x.nombre === card.dataset.nombre);
  $("#d-origen").textContent = a.origen;
  $("#d-titulo").textContent = a.nombre;
  $("#d-desc").textContent = a.desc;
  $("#d-specs").innerHTML = [
    ["Motor", a.motor],
    ["Potencia", `${fmt(a.hp)} hp`],
    ["0–100 km/h", `${a.acc.toString().replace(".", ",")} s`],
    ["Velocidad máxima", `${a.vmax} km/h`],
    ["Transmisión", a.trans],
    ["Tracción", a.trac]
  ].map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`).join("");
  dlg.showModal();
});
$("#cerrar").addEventListener("click", () => dlg.close());
dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

/* Comparativa */
const metricas = {
  hp:   { texto: "Más potencia significa más capacidad de empuje. Ordenado de mayor a menor.", orden: -1, fmt: v => `${fmt(v)} hp` },
  acc:  { texto: "Tiempo para pasar de 0 a 100 km/h. Una barra más corta es mejor: el auto acelera más rápido.", orden: 1, fmt: v => `${v.toString().replace(".", ",")} s` },
  vmax: { texto: "Velocidad máxima declarada por el fabricante. Ordenado de mayor a menor.", orden: -1, fmt: v => `${v} km/h` }
};

function pintarBarras(clave) {
  const m = metricas[clave];
  const datos = [...autos].sort((a, b) => m.orden * (a[clave] - b[clave]));
  const max = Math.max(...autos.map(a => a[clave]));
  $("#nota").textContent = m.texto;
  $("#bars").innerHTML = datos.map(a => `
    <div class="bar-row">
      <span class="bar-name">${a.nombre}</span>
      <div class="bar-track"><div class="bar-fill" data-w="${(a[clave] / max * 100).toFixed(1)}"></div></div>
      <span class="bar-val">${m.fmt(a[clave])}</span>
    </div>`).join("");
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelectorAll(".bar-fill").forEach(el => el.style.width = el.dataset.w + "%");
  }));
}

document.querySelectorAll("[data-metric]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-metric]").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    pintarBarras(btn.dataset.metric);
  });
});

/* Contador de la portada */
function contar(meta = 350, ms = 1800) {
  const el = $("#contador");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = meta; return; }
  const inicio = performance.now();
  const paso = (t) => {
    const p = Math.min((t - inicio) / ms, 1);
    el.textContent = Math.round(meta * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}

pintarTarjetas();
pintarBarras("hp");
contar();

/* Progreso de lectura y botón para volver arriba */
const barra = $("#progreso"), subir = $("#arriba");
addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  barra.style.width = (max > 0 ? scrollY / max * 100 : 0) + "%";
  subir.classList.toggle("visible", scrollY > 600);
}, { passive: true });
subir.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
