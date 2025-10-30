const API_URL = "https://script.google.com/macros/s/AKfycbwez78KX4oEXCGWV_olvy_J1C8YwURxN-1YaZiYYqQJPVLAJuaRI_5EVl4v14OMjonM/exec";

let pedidosGlobal = [];
let ultimaVersion = "";

// ✅ Carga pedidos desde Google Apps Script
async function cargarPedidos() {
  const contenedor = document.getElementById("lista-pedidos");

  try {
    const res = await fetch(`${API_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

    const pedidos = await res.json();
    const versionActual = JSON.stringify(pedidos);

    // ⚡ Evita redibujar si no hay cambios
    if (versionActual === ultimaVersion) return;
    ultimaVersion = versionActual;

    // 🗓️ Formatea fecha
    pedidosGlobal = pedidos.map(p => {
      if (p.fecha && typeof p.fecha !== "string") {
        const d = new Date(p.fecha);
        const dia = String(d.getDate()).padStart(2, "0");
        const mes = String(d.getMonth() + 1).padStart(2, "0");
        const año = d.getFullYear();
        p.fecha = `${dia}/${mes}/${año}`;
      }
      return p;
    });

    filtrarPorFecha();
  } catch (err) {
    console.error("⚠️ Error cargando pedidos:", err);
    contenedor.innerHTML = `<p style="color:#b00;">Error al cargar los pedidos, intenta recargar la pagina</p>`;
  }
}

function filtrarPorFecha() {
  const contenedor = document.getElementById("lista-pedidos");
  contenedor.innerHTML = "";

  const valorFecha = document.getElementById("fecha").value;
  if (!valorFecha) return;

  const [año, mes, dia] = valorFecha.split("-");
  const fechaSeleccionada = `${dia}/${mes}/${año}`;
  const pedidosFiltrados = pedidosGlobal.filter(p => p.fecha === fechaSeleccionada);

  if (!pedidosFiltrados.length) {
    contenedor.innerHTML = `<p>No hay pedidos para el ${fechaSeleccionada}.</p>`;
    return;
  }

  const fragment = document.createDocumentFragment();

  pedidosFiltrados.slice().reverse().forEach(p => {
    const tipo = (p.tipoEntrega || "").toLowerCase();
    let claseTipo = "", icono = "📦 Otro";

    if (tipo.includes("domicilio")) { claseTipo = "domicilio"; icono = "🛵 Domicilio"; }
    else if (tipo.includes("mesa")) { claseTipo = "mesa"; icono = "🍴 Mesa"; }
    else if (tipo.includes("recoger")) { claseTipo = "recoger"; icono = "🏪 Recoger"; }

    const div = document.createElement("div");
    div.className = `pedido ${claseTipo}`;

// Función para extraer solo la cantidad
function extraerCantidad(producto) {
  const match = producto.match(/x\d+/i); // busca x seguido de un número
  return match ? match[0] : "";
}

// Productos separados
// Productos separados
let productosHTML = "";
if (p.productos) {
  const productos = p.productos.split("\n"); // cada producto en una línea
  productos.forEach(prod => {
    let cantidad = extraerCantidad(prod);      // ejemplo: "x1", "x2"
    cantidad = cantidad.replace(/x/i, "");     // elimina la "x" (mayúscula o minúscula)
    const resto = prod.replace(extraerCantidad(prod), "").trim(); // resto del producto
    productosHTML += `
      <div class="cantidadproducto">
        <div class="producto-cantidad">${cantidad}</div>
        <div class="producto-detalle">${resto}</div>
      </div>
    `;
  });
} else {
  productosHTML = "<div class='producto-item'>Sin productos</div>";
}




    div.innerHTML = `
    <div class="tipo-entrega ${claseTipo}">${icono}</div>
      <div class="pedido-header">
        <div class="pedido-datos">
          <div class="pedido-numero"><strong>${p.numeroFactura || "Sin número"}</strong></div>
          <div class="pedido-hora">${p.hora || "--:--:--"}</div>
        </div>
      </div>

      <div class="pedido-cliente"><strong>Cliente:</strong> <span>${p.nombre || "Sin nombre"}</span></div>
      ${p.mesa ? `<div class="pedido-mesa"><strong>Mesa:</strong> <span>${p.mesa}</span></div>` : ""}

      <div class="pedido-productos productos">
        ${productosHTML}
      </div>

      ${p.observaciones ? `
        <div class="pedido-observaciones observaciones">
          <em>OBSERVACIONES:</em> <span>${p.observaciones}</span>
        </div>` : ""}
        
    `;
    fragment.appendChild(div);
  });

  contenedor.appendChild(fragment);
}


// ✅ Fecha actual por defecto
const hoy = new Date();
const fechaInput = document.getElementById("fecha");
fechaInput.value = hoy.toISOString().split("T")[0];
fechaInput.addEventListener("change", filtrarPorFecha);

// ✅ Carga inicial + actualización periódica
cargarPedidos();
setInterval(cargarPedidos, 2000);
