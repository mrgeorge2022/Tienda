let db = [];
let cart = [];
let currentMethod = null;
let currentStep = 0;
let config = null;
let editingOrderId = null; // Almacena el ID del pedido que se está editando

async function init() {
  // Iniciar mostrando Carta (paso 1) por defecto
  goStep(1);

  try {
    const response = await fetch("config.json");
    config = await response.json();

    // 1. CARGAR PRODUCTOS DESDE LA API DE PRODUCTOS
    const pRes = await fetch(config.apiUrls.productos);
    const data = await pRes.json();
    db = data.productos || data;

    renderCats();
    renderItems(db);
  } catch (err) {
    console.error("Error inicializando:", err);
  }
}

// --- FUNCIONES DE FILTRADO Y VISTAS ---

async function showMesas() {
  goStep(2);
  const list = document.getElementById("mesas-list");
  document.getElementById("service-content").style.display = "none";
  document.getElementById("view-pedidos").classList.remove("active");
  document.getElementById("view-mesas").classList.add("active");
  list.innerHTML = "<p>Cargando mesas activas...</p>";

  const res = await fetch(config.apiUrls.reciboBaseDatos);
  const data = await res.json();
  const activas = data
    .filter((item) => item.mesasActivas === true || item.q === true)
    .sort((a, b) => Number(a.mesa || 0) - Number(b.mesa || 0));

  list.innerHTML = activas.length
    ? activas
        .map(
          (m) => `
    <div class="data-card" onclick="editExistingOrder(${JSON.stringify(
      m
    ).replace(
      /"/g,
      "&quot;"
    )})" style="cursor:pointer; border-left: 4px solid var(--accent);">
        <div style="display:flex; justify-content:space-between; align-items: flex-start;">
            <div>
                <span class="status-badge">MESA ${m.mesa}</span>
                <div style="font-size:0.65rem; color:#888; margin-top:4px;">Fact: ${
                  m.numeroFactura
                }</div>
            </div>
            <small>${m.hora || ""}</small>
        </div>
        <div style="margin:10px 0; font-size:0.9rem; color:#fff; font-weight:bold;">${
          m.nombre || ""
        }</div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.7rem; color:var(--accent)">PULSA PARA EDITAR</span>
            <div style="font-weight:bold; color:var(--accent)">$${Number(
              m.totalPagar
            ).toLocaleString()}</div>
        </div>
    </div>`
        )
        .join("")
    : "<p>No hay mesas activas.</p>";
}

async function showPedidos() {
  goStep(2);
  const list = document.getElementById("pedidos-list");
  document.getElementById("service-content").style.display = "none";
  document.getElementById("view-mesas").classList.remove("active");
  document.getElementById("view-pedidos").classList.add("active");
  list.innerHTML = "<p>Cargando todos los pedidos...</p>";

  const res = await fetch(config.apiUrls.reciboBaseDatos);
  const data = await res.json();

  list.innerHTML = data
    .map(
      (p) => `
        <div class="data-card" onclick="editExistingOrder(${JSON.stringify(
          p
        ).replace(
          /"/g,
          "&quot;"
        )})" style="border-color:#333; cursor:pointer; border-left: 4px solid #555; transition: all 0.2s;">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span style="font-size:0.75rem; color:var(--accent); font-weight:bold;">${
                  p.numeroFactura
                }</span>
                <span style="font-size:0.7rem; color:#555;">${p.fecha} - ${
        p.hora
      }</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
                <strong>${p.nombre}</strong>
                <span style="color:#fff; font-weight:bold;">$${Number(
                  p.totalPagar
                ).toLocaleString()}</span>
            </div>
            <div style="font-size:0.65rem; color:#888; margin-top:5px;">${
              p.tipoEntrega
            }</div>
        </div>`
    )
    .reverse()
    .join("");
}

function startNewOrder() {
  editingOrderId = null;
  cart = [];

  // Mostrar el contenedor de servicios y ocultar las listas de Mesas/Pedidos
  document.getElementById("service-content").style.display = "block";
  document.getElementById("view-mesas").classList.remove("active");
  document.getElementById("view-pedidos").classList.remove("active");

  // --- NUEVO: QUITAR SELECCIÓN DE BOTONES ---
  document.querySelectorAll(".btn-method").forEach((btn) => {
    btn.classList.remove("active");
  });

  // --- NUEVO: LIMPIAR EL CONTENEDOR DE INPUTS ---
  const fieldsContainer = document.getElementById("fields-container");
  if (fieldsContainer) {
    fieldsContainer.innerHTML =
      '<p style="text-align:center; color:#888; padding:20px;">Seleccione un servicio para continuar</p>';
  }

  // Resetear selector de pago
  const metodoPago = document.getElementById("val-metodo-pago");
  if (metodoPago) metodoPago.selectedIndex = 0;

  // ❌ ELIMINA ESTAS LÍNEAS QUE ESTABAN AL FINAL:
  // const btnMesa = document.querySelector('.btn-method[onclick*="Mesa"]');
  // setMethod(btnMesa, "Mesa");

  updateUI();
  updateTitle();
  updateButtonState();
  hideEditModeBanner();

  const btnCancel = document.getElementById("btn-cancel-edit");
  if (btnCancel) btnCancel.style.display = "none";

  showColumn(1);
  showToast("Nuevo pedido: seleccione un servicio");
}

// --- LÓGICA DE ENVÍO Y UI ---

async function finish() {
  // 1. VALIDACIÓN DE SERVICIO
  if (!currentMethod) {
    alert("⚠️ Selecciona un servicio (Mesa, Recoger o Domicilio)");
    document.querySelector(".btn-methods-group")?.scrollIntoView({ behavior: "smooth" });
    return;
  }

  // VALIDACIÓN DE CARRITO
  if (!cart.length) return alert("La comanda está vacía");

  // OBTENER VALORES DE LOS INPUTS
  const inputNombre = document.getElementById("val-nombre")?.value.trim() || "";
  const inputTel = document.getElementById("val-tel")?.value.trim() || "";
  const inputMesa = document.getElementById("val-mesa")?.value.trim() || "";
  const inputDireccion = document.getElementById("val-direccion")?.value.trim() || "";
  const inputGmaps = document.getElementById("val-google-maps")?.value.trim() || "";
  const metodoPago = document.getElementById("val-metodo-pago")?.value;

  // 2. VALIDACIONES ESTRICTAS SEGÚN EL MÉTODO
  if (currentMethod === "Mesa") {
    if (!inputNombre || !inputTel || !inputMesa) {
      return alert("⚠️ MESA: Debe llenar: Nombre, Teléfono y Número de Mesa.");
    }
  } else if (currentMethod === "Recoger en tienda") {
    if (!inputNombre || !inputTel) {
      return alert("⚠️ RECOGER: Debe llenar: Nombre y Teléfono.");
    }
  } else if (currentMethod === "Domicilio") {
    if (!inputNombre || !inputTel || !inputDireccion || !inputGmaps) {
      return alert("⚠️ DOMICILIO: Debe llenar: Nombre, Teléfono, Dirección y Ubicación (Maps).");
    }
  }

  if (!metodoPago) return alert("Seleccione un método de pago");

  // 3. PROCESAMIENTO DE LINK DE GOOGLE MAPS (NUEVO)
  // Si son coordenadas (lat, lng), las convertimos en un link real para la hoja de cálculo
  let gmapsFinalLink = inputGmaps;
  if (inputGmaps && !inputGmaps.startsWith("http")) {
      const coords = inputGmaps.split(",");
      if (coords.length === 2) {
          gmapsFinalLink = `https://www.google.com/maps?q=${coords[0].trim()},${coords[1].trim()}`;
      }
  }

  // 4. CÁLCULO DE TOTALES
  const totalProductos = cart.reduce((s, i) => s + i.precio * i.qty, 0);
  // Si no es domicilio, el costo de domicilio es 0
  const costoEnvioParaAPI = (currentMethod === "Domicilio") ? costoDomicilioActual : 0;
  const totalPagarFinal = totalProductos + costoEnvioParaAPI;

  const fecha = new Date();
  let facturaId = editingOrderId;

  if (!facturaId) {
    const nombreCodigo = inputNombre.substring(0, 3).toUpperCase().padEnd(3, "X");
    const telefonoCodigo = inputTel.slice(-3).padStart(3, "0");
    facturaId = `#${nombreCodigo}${telefonoCodigo}${fecha.getFullYear().toString().slice(-2)}${String(fecha.getMonth() + 1).padStart(2, "0")}${String(fecha.getDate()).padStart(2, "0")}${String(fecha.getHours()).padStart(2, "0")}${String(fecha.getMinutes()).padStart(2, "0")}${String(fecha.getSeconds()).padStart(2, "0")}`;
  }

  // 5. CONSTRUCCIÓN DEL PAYLOAD PARA LA API (Alineado con tu doPost de Apps Script)
  const payload = {
    tipoEntrega: currentMethod,
    numeroFactura: facturaId,
    fecha: fecha.toLocaleDateString(),
    hora: fecha.toLocaleTimeString("it-IT"),
    nombre: inputNombre,
    telefono: inputTel,
    mesa: inputMesa || "",
    direccion: inputDireccion,
    puntoReferencia: document.getElementById("val-referencia")?.value.trim() || "",
    productos: cart.map(i => `${i.nombre} x${i.qty} - $${i.precio}${i.nota ? ` (${i.nota})` : ""}`).join("\n"),
    totalProductos: totalProductos,
    costoDomicilio: costoEnvioParaAPI, // <--- SE ENVÍA A LA CELDA L
    totalPagar: totalPagarFinal,      // <--- SE ENVÍA A LA CELDA M (Suma total)
    metodoPago: metodoPago,
    ubicacionGoogleMaps: gmapsFinalLink, // <--- ENVÍA EL LINK GENERADO A LA CELDA O
    observaciones: document.getElementById("val-observaciones")?.value.trim() || "",
    mesasActivas: currentMethod === "Mesa"
  };

  const btn = document.querySelector(".btn-action");
  btn.disabled = true;
  btn.innerText = editingOrderId ? "ACTUALIZANDO..." : "REGISTRANDO...";

  try {
    await fetch(config.apiUrls.envioBaseDatos, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload),
    });

    alert(editingOrderId ? "✅ ¡Pedido actualizado!" : "🚀 ¡Pedido enviado!");
    location.reload();
  } catch (err) {
    alert("❌ Error de conexión.");
    btn.disabled = false;
    btn.innerText = editingOrderId ? "ACTUALIZAR PEDIDO" : "ENVIAR PEDIDO";
  }
}

// --- FUNCIONES DE SOPORTE (TU LÓGICA ORIGINAL) ---

// Función para actualizar el estado del botón (ENVIAR vs ACTUALIZAR)
function updateButtonState() {
  const btn = document.querySelector(".btn-action");
  if (editingOrderId) {
    btn.innerText = "ACTUALIZAR PEDIDO";
    btn.style.background = "#ff6b35";
  } else {
    btn.innerText = "ENVIAR PEDIDO";
    btn.style.background = "var(--accent)";
  }
}

function cancelEdit() {
  if (confirm("¿Descartar cambios, limpiar campos y volver al inicio?")) {
    forceResetToNew(); // <--- Aquí ocurre toda la magia de limpieza
    showToast("Formulario limpio y listo");
  }
}

function forceResetToNew() {
  // 1. Limpieza de variables lógicas
  editingOrderId = null;
  cart = [];

  // 2. Limpieza de todos los inputs del formulario
  const campos = [
    "val-nombre",
    "val-tel",
    "val-mesa",
    "val-direccion",
    "val-referencia",
    "val-google-maps",
    "val-observaciones",
  ];

  campos.forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.value = "";
  });

  const payment = document.getElementById("val-metodo-pago");
  if (payment) payment.selectedIndex = 0;

  // 3. Limpiar Banner y estilos de edición
  const banner = document.getElementById("edit-mode-banner");
  if (banner) {
    banner.classList.remove("show", "active");
    banner.style.display = "none";
    banner.textContent = "";
  }
  document.querySelector(".main-grid")?.classList.remove("edit-mode");

  const btnCancel = document.getElementById("btn-cancel-edit");
  if (btnCancel) btnCancel.style.display = "none";

  // --- 4. RESETEAR SERVICIOS (Ninguno seleccionado) ---
  // Quitamos la clase 'active' de los botones de servicio (Mesa, Domicilio, etc.)
  document.querySelectorAll(".btn-method").forEach((btn) => {
    btn.classList.remove("active");
  });
  // Ocultamos el contenedor que muestra los inputs (nombre, mesa, etc.)
  const serviceContent = document.getElementById("service-content");
  if (serviceContent) serviceContent.style.display = "none";

  currentMethod = null; // Reseteamos la variable del método actual
  // ----------------------------------------------------

  // 5. Actualizar UI visual
  updateTitle();
  updateUI();
  updateButtonState();

  // 6. Volver a la Carta (Paso 1)
  showColumn(1);

  // 7. Sincronización visual del menú lateral (Nuevo)
  document
    .querySelectorAll(".nav-link")
    .forEach((btn) => btn.classList.remove("active"));
  const navNuevo =
    document.querySelector(".nav-link[onclick*='nuevo']") ||
    document.querySelector(".nav-link");
  if (navNuevo) navNuevo.classList.add("active");

  closeLists();
}

// Función para extraer coordenadas de diferentes formatos
function extractCoordinates(input) {
  if (!input) return null;

  // Formato 1: URL con @ (https://www.google.com/maps/place/...@10.3792124,-75.4804932,...)
  const atMatch = input.match(/@([\d.-]+),([\d.-]+)/);
  if (atMatch) return `${atMatch[1]},${atMatch[2]}`;

  // Formato 2: URL con ?q=lat,lng (https://www.google.com/maps?q=10.377106,-75.474624)
  const qMatch = input.match(/[?&]q=([\d.-]+),([\d.-]+)/);
  if (qMatch) return `${qMatch[1]},${qMatch[2]}`;

  // Formato 3: Coordenadas directas con paréntesis (10.379112, -75.475697) o ((10.379112, -75.475697))
  const parenMatch = input.match(/[\(]*([\d.-]+)\s*,\s*([\d.-]+)[\)]*$/);
  if (parenMatch) return `${parenMatch[1]},${parenMatch[2]}`;

  // Formato 4: Coordenadas con espacios variables (10.379112  -75.475697)
  const spaceMatch = input.match(/([\d.-]+)\s{2,}([\d.-]+)$/);
  if (spaceMatch) return `${spaceMatch[1]},${spaceMatch[2]}`;

  // Formato 5: Coordenadas simples separadas por coma (10.379112, -75.475697)
  const simpleMatch = input.match(/([\d.-]+)\s*,\s*([\d.-]+)/);
  if (simpleMatch) return `${simpleMatch[1]},${simpleMatch[2]}`;

  return null;
}

function setMethod(btn, method) {
    const container = document.getElementById("fields-container");

    if (btn.classList.contains("active")) {
        btn.classList.remove("active");
        container.innerHTML = "";
        currentMethod = null;
        costoDomicilioActual = 0;
        updateTitle();
        updateUI();
        return;
    }

    const nombreTemp = document.getElementById("val-nombre")?.value || "";
    const telTemp = document.getElementById("val-tel")?.value || "";
    const mesaTemp = document.getElementById("val-mesa")?.value || "";

    document.querySelectorAll(".btn-method").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentMethod = method;

    // --- FUNCIÓN PARA GENERAR INPUTS CON BOTÓN DINÁMICO ---
    const crearInputConAccion = (id, placeholder, type = "text", oninput = "") => {
        return `
        <div class="input-wrapper-pro">
            <input type="${type}" id="${id}" class="input-pro input-compact" 
                   placeholder="${placeholder}" 
                   oninput="checkInputStatus('${id}'); ${oninput}">
            <span class="btn-input-helper" id="helper-${id}" onclick="handleInputHelper('${id}')">📋</span>
        </div>`;
    };

    let html = crearInputConAccion("val-nombre", "Nombre cliente", "text", "updateTitle()");
    html += crearInputConAccion("val-tel", "Teléfono", "tel", "updateTitle()");
    html += crearInputConAccion("val-mesa", "Núm. mesa", "number", "updateTitle()");

    if (method === "Domicilio") {
        html += crearInputConAccion("val-direccion", "Dirección");
        html += crearInputConAccion("val-google-maps", "Pega Link de Maps o Coordenadas", "text", "analizarEntradaMapa(this.value)");
        html += crearInputConAccion("val-referencia", "Punto de referencia");
        html += `
            <div id="map-pos" style="height: 350px; width: 100%; margin-top: 10px; border-radius: 8px;"></div>
            <div id="distancia-info" style="font-size: 12px; color: var(--accent); margin-top: 5px; font-weight: bold;"></div>
        `;
        setTimeout(() => initMiniMap(), 100);
    }

    container.innerHTML = html;

    // Restaurar valores y configurar iconos iniciales
    document.getElementById("val-nombre").value = nombreTemp;
    document.getElementById("val-tel").value = telTemp;
    ["val-nombre", "val-tel", "val-mesa"].forEach(id => checkInputStatus(id));

    const inputMesa = document.getElementById("val-mesa");
    if (method === "Mesa") {
        inputMesa.parentElement.style.display = "flex"; // Mostramos el wrapper
        inputMesa.value = mesaTemp;
    } else {
        inputMesa.parentElement.style.display = "none";
    }

    updateTitle();
    updateUI();
}

function filterProducts() {
  const input = document.getElementById("search-input");
  const clearBtn = document.getElementById("clear-search");
  const query = input.value.toLowerCase();

  // Mostrar/Ocultar la X según si hay texto
  clearBtn.style.display = query.length > 0 ? "block" : "none";

  // Filtrar la base de datos
  const filtered = db.filter((p) => {
    return (
      p.nombre.toLowerCase().includes(query) ||
      (p.descripcion || "").toLowerCase().includes(query)
    );
  });

  renderItems(filtered);
}

// Función específica para el botón X
function clearSearch() {
  const input = document.getElementById("search-input");
  input.value = ""; // Borrar texto
  filterProducts(); // Ejecutar filtro (esto ocultará la X y restaurará la lista)
  input.focus(); // Devolver el foco al input
}

function updateTitle() {
  const title = document.getElementById("order-title");
  if (currentMethod === "Mesa")
    title.innerText = `Pedido: Mesa ${
      document.getElementById("val-mesa")?.value || "--"
    }`;
  else
    title.innerText = `Pedido: ${currentMethod} - ${
      document.getElementById("val-nombre")?.value || "..."
    }`;
}

function showEditModeBanner(mesaNumber) {
  const banner = document.getElementById("edit-mode-banner");
  banner.textContent = `✏️ EDITANDO MESA ${mesaNumber} - Haz clic aqui cancelar`;
  banner.classList.add("show");
  document.querySelector(".main-grid").classList.add("edit-mode");
}

function hideEditModeBanner() {
  const banner = document.getElementById("edit-mode-banner");
  banner.classList.remove("show");
  document.querySelector(".main-grid").classList.remove("edit-mode");
}

function renderCats() {
  const list = ["Todos", ...new Set(db.map((p) => p.categoria))];
  document.getElementById("v-cats").innerHTML = list
    .map(
      (c) =>
        `<button class="cat-btn" onclick="filterCat('${c}', this)">${c}</button>`
    )
    .join("");
}

function filterCat(cat, btn) {
  document
    .querySelectorAll(".cat-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderItems(cat === "Todos" ? db : db.filter((p) => p.categoria === cat));
}

function renderItems(list) {
  document.getElementById("v-prods").innerHTML = list
    .map((p) => {
      const estaAgotado = p.activo === false;

      return `
    <div class="card-prod ${estaAgotado ? "agotado" : ""}" id="prod-card-${
        p.id
      }">
        ${estaAgotado ? '<span class="badge-agotado">AGOTADO</span>' : ""}
        
        <div class="info-principal">
            <div class="nombre-header" onclick="toggleDesc(${p.id}, event)" 
                 style="display:flex; justify-content: space-between; align-items: center; cursor:pointer; width: 100%;">
                <h4 style="margin:0; font-size: 15px;">${p.nombre}</h4>
                <span class="expand-icon" id="arrow-${
                  p.id
                }" style="font-size: 10px; transition:0.3s; color: #fff; ">▼</span>
            </div>

            <div class="price" style="color:var(--accent); font-weight:bold; font-size:0.9rem;">
                $${Number(p.precio).toLocaleString()}
            </div>
        </div>

        <div class="prod-desc-text" id="desc-${
          p.id
        }" style="display:none; font-size:0.8rem; color:#888; margin:10px 0; border-left:2px solid var(--accent); padding-left:8px;">
            ${p.descripcion || "Sin descripción disponible."}
        </div>

        <div class="card-actions" style="display:flex; gap:8px; ">
            <button class="btn-add-fast" onclick="add(${p.id}, false)" ${
        estaAgotado ? "disabled" : ""
      } 
                style="flex:1; background:var(--accent); color:#000; border:none;  border-radius:6px; font-weight:bold; cursor:pointer;">
                ⚡ Rápido
            </button>
            <button class="btn-add-note" onclick="add(${p.id}, true)" ${
        estaAgotado ? "disabled" : ""
      } 
                style="flex:1; background:#222; color:#fff; border:1px solid #444; padding:8px; border-radius:6px; cursor:pointer;">
                📝 +Nota
            </button>
        </div>
    </div>`;
    })
    .join("");
}

// Función para mostrar/ocultar descripción
// Función para mostrar/ocultar descripción con giro de flecha
function toggleDesc(id, event) {
  event.stopPropagation();
  const desc = document.getElementById(`desc-${id}`);
  const arrow = document.getElementById(`arrow-${id}`);

  if (desc.style.display === "none") {
    desc.style.display = "block";
    arrow.style.transform = "rotate(180deg)";
  } else {
    desc.style.display = "none";
    arrow.style.transform = "rotate(0deg)";
  }
}

function add(id, conNota) {
  const p = db.find((x) => x.id == id);
  if (!p) return;

  let nota = "";
  if (conNota) {
    nota = prompt(`Instrucciones para ${p.nombre}:`, "");
    if (nota === null) return;
  }

  // --- EFECTO VISUAL ---
  const card = document.getElementById(`prod-card-${id}`);
  if (card) {
    card.classList.remove("anim-add");
    void card.offsetWidth; // Truco de JS para reiniciar la animación CSS
    card.classList.add("anim-add");
  }

  showToast(`+ ${p.nombre}`);

  // --- LÓGICA DE CARRITO ---
  const ex = cart.find((x) => x.id == id && x.nota === nota);
  if (ex) {
    ex.qty++;
  } else {
    cart.push({ ...p, qty: 1, nota: nota, cartId: Date.now() + Math.random() });
  }

  updateUI();
}

// Función para mostrar la notificación
function showToast(text) {
  let toast = document.getElementById("main-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "main-toast";
    toast.className = "toast-msg";
    document.body.appendChild(toast);
  }
  toast.innerText = text;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1500);
}

// NUEVA: Cambiar cantidad (+ o -)
function changeQty(cartId, delta) {
  const item = cart.find((i) => i.cartId === cartId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeLine(cartId); // Si llega a 0 se elimina
  updateUI();
}

// NUEVA: Eliminar línea completa (Bote de basura)
function removeLine(cartId) {
  if (confirm("¿Eliminar este producto de la comanda?")) {
    cart = cart.filter((i) => i.cartId !== cartId);
    updateUI();
  }
}

// NUEVA: Editar nota rápida
function editNote(cartId) {
  const item = cart.find((i) => i.cartId === cartId);
  const nuevaNota = prompt("Editar instrucciones:", item.nota);
  if (nuevaNota !== null) {
    item.nota = nuevaNota;
    updateUI();
  }
}

// NUEVA: Vaciar comanda completa
function clearCart() {
  if (confirm("¿Estás seguro de vaciar TODA la comanda?")) {
    cart = [];
    updateUI();
  }
}

// ACTUALIZACIÓN: Interfaz de la comanda (Columna 4) con desglose de Domicilio
function updateUI() {
    const box = document.getElementById("cart-box");
    const subtotalProductos = cart.reduce((s, i) => s + i.precio * i.qty, 0);
    const esDomicilio = (currentMethod === "Domicilio");
    const valorEnvio = esDomicilio ? (costoDomicilioActual || 0) : 0;
    const totalFinal = subtotalProductos + valorEnvio;

    // 1. Renderizar items en el carrito (Parte superior)
    if (cart.length === 0) {
        box.innerHTML = '<p style="text-align:center; color:#999; margin-top:50px;">Vacío</p>';
    } else {
        let htmlItems = `<button class="btn-empty-cart" onclick="clearCart()">🗑️ Vaciar</button>`;
        htmlItems += cart.map(i => `
            <div class="cart-item-line">
                <span class="cart-item-name">${i.nombre} x${i.qty}</span>
                <span class="cart-item-price">$${(i.precio * i.qty).toLocaleString()}</span>
            </div>
        `).join("");
        box.innerHTML = htmlItems;
    }

    // 2. ACTUALIZAR EL ORDER-FOOTER (Desglose encima del TOTAL)
    const footer = document.querySelector(".order-footer");
    if (footer) {
        let desgloseContainer = document.getElementById("desglose-dinamico");
        
        // Si no existe el contenedor de Subtotal/Domicilio, lo creamos
        if (!desgloseContainer) {
            desgloseContainer = document.createElement("div");
            desgloseContainer.id = "desglose-dinamico";
            const totalRow = footer.querySelector(".order-total-row");
            footer.insertBefore(desgloseContainer, totalRow);
        }

        // Si el método es Domicilio, inyectamos las dos líneas inmediatamente
        if (esDomicilio) {
            desgloseContainer.innerHTML = `
                <div class="order-total-row" style="font-size: 0.85rem; color: #777; margin-bottom: 2px; border-top: 1px dashed #ccc; padding-top: 5px;">
                    <span>SUBTOTAL</span>
                    <span>$ ${subtotalProductos.toLocaleString()}</span>
                </div>
                <div class="order-total-row" style="font-size: 0.85rem; color: var(--accent); margin-bottom: 5px;">
                    <span>DOMICILIO</span>
                    <span id="display-costo-domicilio">$ ${valorEnvio.toLocaleString()}</span>
                </div>
            `;
        } else {
            desgloseContainer.innerHTML = ""; // Se oculta si es Mesa o Recoger
        }

        // 3. Actualizar el TOTAL (Id: order-total)
        const totalDisplay = document.getElementById("order-total");
        if (totalDisplay) {
            totalDisplay.innerText = `$ ${totalFinal.toLocaleString()}`;
        }
    }
}

// goStep remapeado: sidebar (m-col-1) permanece fija; pasos 1..3 -> cols 2..4
function goStep(n) {
  // Limpiar estados
  document
    .querySelectorAll(".col")
    .forEach((c) => c.classList.remove("active-m"));

  // Sidebar siempre visible
  const sidebar = document.getElementById("m-col-1");
  if (sidebar) sidebar.classList.add("active-m");

  // Mapear paso n (1..3) a columna m-col-(n+1)
  const idx = Number(n);
  if (!isNaN(idx) && idx >= 1 && idx <= 3) {
    const targetCol = document.getElementById(`m-col-${idx + 1}`);
    if (targetCol) targetCol.classList.add("active-m");
    currentStep = idx;
  } else {
    currentStep = 0;
  }

  updateNavigationUI();
}

// Mostrar columna sin cambiar el estado de los tabs (no altera currentStep)
function showColumn(n) {
  // Limpiar estados
  document
    .querySelectorAll(".col")
    .forEach((c) => c.classList.remove("active-m"));

  // Sidebar siempre visible
  const sidebar = document.getElementById("m-col-1");
  if (sidebar) sidebar.classList.add("active-m");

  // Mapear paso n (1..3) a columna m-col-(n+1)
  const idx = Number(n);
  if (!isNaN(idx) && idx >= 1 && idx <= 3) {
    const targetCol = document.getElementById(`m-col-${idx + 1}`);
    if (targetCol) targetCol.classList.add("active-m");
  }
}

// updateNavigationUI: actualiza la barra de tabs inferior
function updateNavigationUI() {
  const tabs = document.querySelectorAll(".tab-item");
  if (currentStep === 0) {
    tabs.forEach((t) => {
      t.classList.remove("active");
      t.classList.add("disabled");
    });
    return;
  }

  tabs.forEach((t, idx) => {
    const stepNum = idx + 1; // 1..3
    t.classList.toggle("active", stepNum === currentStep);
    if (stepNum <= currentStep) t.classList.remove("disabled");
    else t.classList.add("disabled");
  });
}

function handleNavClick(btn, action) {
  // 1. CAMBIO VISUAL: Quitamos active de todos y ponemos al seleccionado
  document
    .querySelectorAll(".nav-link")
    .forEach((link) => link.classList.remove("active"));
  btn.classList.add("active");

  const tieneNombre = document.getElementById("val-nombre")?.value.length > 0;

  // 2. LÓGICA PARA "NUEVO"
  if (action === "nuevo") {
    if (cart.length > 0 || tieneNombre) {
      if (
        !confirm("Se borrarán los datos actuales. ¿Deseas empezar de nuevo?")
      ) {
        // Opcional: Si cancela, podrías devolver el active a donde estaba,
        // pero normalmente el usuario se queda donde hizo clic.
        return;
      }
    }
    forceResetToNew();
    // Quitamos el return de aquí para que el flujo sea natural
  }

  // 3. LÓGICA PARA OTRAS PESTAÑAS
  if (action === "mesas") showMesas();
  if (action === "pedidos") showPedidos();
}

function editExistingOrder(mesaData) {
  if (
    !confirm(
      `¿Cargar el pedido ${
        mesaData.mesa ? ` de la Mesa ${mesaData.mesa}` : `de ${mesaData.nombre}`
      } para editarlo?`
    )
  )
    return;

  // --- NUEVA LÓGICA DE LIMPIEZA DE VISTAS ---
  // 1. Cerramos las listas de Mesas Activas e Historial inmediatamente
  const viewMesas = document.getElementById("view-mesas");
  const viewPedidos = document.getElementById("view-pedidos");

  if (viewMesas) viewMesas.classList.remove("active");
  if (viewPedidos) viewPedidos.classList.remove("active");

  // 2. Aseguramos que el contenedor de inputs sea visible
  const serviceContent = document.getElementById("service-content");
  if (serviceContent) serviceContent.style.display = "block";
  // ------------------------------------------

// 1. Guardamos el ID de edición
editingOrderId = mesaData.numeroFactura;

// 2. Control del Banner de Notificación
const banner = document.getElementById("edit-mode-banner");
if (banner) {
    // Forzamos visibilidad para que aparezca siempre (incluso en ediciones consecutivas)
    banner.style.display = "flex"; 
    banner.classList.add("show", "active");

    // Construcción de frase dinámica general:
    // Resultado esperado: ⚠️ Editando: #FAC123 - Mesa 5 - Juan Perez
    // O si no hay mesa:  ⚠️ Editando: #FAC123 - Juan Perez
    const mesaInfo = mesaData.mesa ? `Mesa ${mesaData.mesa} - ` : "";
    
    banner.textContent = `⚠️ Editando: ${mesaData.numeroFactura} - ${mesaInfo}${mesaData.nombre}`;
}

// 3. Activación visual del modo edición en la interfaz
document.querySelector(".main-grid")?.classList.add("edit-mode");


  // 4. Limpiar y procesar productos
  cart = [];
  const lineas = mesaData.productos.split("\n");
  lineas.forEach((linea) => {
    const match = linea.match(/(.+) x(\d+) - \$[\d.]+ ?(?:\((.*)\))?/);
    if (match) {
      const [_, nombre, qty, nota] = match;
      const productoOriginal = db.find(
        (p) => p.nombre.trim() === nombre.trim()
      );
      if (productoOriginal) {
        cart.push({
          ...productoOriginal,
          qty: parseInt(qty),
          nota: nota || "",
          cartId: Date.now() + Math.random(),
        });
      }
    }
  });

  // 5. Configurar Método y Llenar Campos
  let metodoAActivar = "Mesa";
  if (mesaData.direccion) metodoAActivar = "Domicilio";
  else if (!mesaData.mesa || mesaData.mesa === "0")
    metodoAActivar = "Recoger en tienda";

  currentMethod = metodoAActivar;
  const botones = document.querySelectorAll(".btn-method");
  botones.forEach((btn) => {
    btn.style.display = "";
    if (
      btn.textContent
        .toUpperCase()
        .includes(metodoAActivar.split(" ")[0].toUpperCase())
    ) {
      setMethod(btn, metodoAActivar);
    }
  });

  setTimeout(() => {
    // 1. Llenado de inputs básicos
    if (document.getElementById("val-nombre"))
      document.getElementById("val-nombre").value = mesaData.nombre || "";
    if (document.getElementById("val-tel"))
      document.getElementById("val-tel").value = mesaData.telefono || "";
    if (document.getElementById("val-mesa"))
      document.getElementById("val-mesa").value = mesaData.mesa || "";
    if (document.getElementById("val-observaciones"))
      document.getElementById("val-observaciones").value =
        mesaData.observaciones || "";

    // --- SOLUCIÓN PARA EL MÉTODO DE PAGO ---
    const selectorPago = document.getElementById("val-metodo-pago");
    if (selectorPago && mesaData.metodoPago) {
      // Forzamos el valor de la base de datos
      selectorPago.value = mesaData.metodoPago;

      // Si por alguna razón el valor no coincide con las opciones,
      // esto imprimirá un error en la consola para que sepas cuál es el problema
      if (selectorPago.value === "" && mesaData.metodoPago !== "") {
        console.error(
          "El método de pago '" +
            mesaData.metodoPago +
            "' no coincide con ninguna opción del HTML."
        );
      }
    }

    // 2. Llenado de campos específicos si es Domicilio
    if (metodoAActivar === "Domicilio") {
      if (document.getElementById("val-direccion"))
        document.getElementById("val-direccion").value =
          mesaData.direccion || "";
      if (document.getElementById("val-referencia"))
        document.getElementById("val-referencia").value =
          mesaData.puntoReferencia || "";
      if (document.getElementById("val-google-maps"))
        document.getElementById("val-google-maps").value =
          mesaData.ubicacionGoogleMaps || "";
    }

    updateTitle();
    updateUI();
    updateButtonState();

    if (document.getElementById("btn-cancel-edit"))
      document.getElementById("btn-cancel-edit").style.display = "block";

    showColumn(3);
  }, 150);
}

function closeLists() {
  document.getElementById("view-mesas").classList.remove("active");
  document.getElementById("view-pedidos").classList.remove("active");
  document.getElementById("service-content").style.display = "block";

  // IMPORTANTE: Si cerramos las listas de mesas/pedidos,
  // significa que volvemos a la pantalla de "Nuevo/Datos"
  document
    .querySelectorAll(".sidebar-main .nav-link")
    .forEach((link) => link.classList.remove("active"));
  const btnNuevo = document.querySelector(".sidebar-main .nav-link");
  if (btnNuevo) btnNuevo.classList.add("active");
}


let miniMap, markerUsuarioPos, routingControl;
let costoDomicilioActual = 0;

/**
 * 1. INICIALIZAR EL MAPA
 */
function initMiniMap() {
    if (miniMap) miniMap.remove();

    const tiendaCoords = config?.coordenadasSede || [10.373750, -75.473580];
    
    miniMap = L.map('map-pos').setView(tiendaCoords, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(miniMap);

    const iconoNegocio = L.icon({
        iconUrl: config?.logo || 'img/logo.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
        className: "marker-logo-sede"
    });

    L.marker(tiendaCoords, { icon: iconoNegocio })
        .addTo(miniMap)
        .bindPopup(`<b>${config?.nombreRestaurante || "Nuestra Sede"}</b>`)
        .openPopup();

    miniMap.on('click', function(e) {
        const { lat, lng } = e.latlng;
        document.getElementById("val-google-maps").value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        actualizarPuntoYCostos(lat, lng);
    });
}

/**
 * 2. ANALIZAR ENTRADA DE MAPA
 */
/**
 * 2. ANALIZAR ENTRADA DE MAPA
 * Soporta: Coordenadas directas, enlaces estándar y enlaces con formato !4d / !3d
 */
function analizarEntradaMapa(valor) {
    if (!valor || valor.trim() === "") return;

    let lat = null;
    let lng = null;

    // 1. INTENTO: Formato de coordenadas normales (10.3792072, -75.4756223)
    const regexNormal = /(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/;
    const matchNormal = valor.match(regexNormal);

    if (matchNormal) {
        lat = parseFloat(matchNormal[1]);
        lng = parseFloat(matchNormal[2]);
    } 
    // 2. INTENTO: Formato de enlace de Google Maps con !3d (lat) y !4d (lng)
    // Ejemplo: ...!3d10.3792072!4d-75.4756223
    else if (valor.includes("!3d") && valor.includes("!4d")) {
        const regexGoogleLink = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
        const matchGoogle = valor.match(regexGoogleLink);
        if (matchGoogle) {
            lat = parseFloat(matchGoogle[1]);
            lng = parseFloat(matchGoogle[2]);
        }
    }
    // 3. INTENTO: Formato de enlace corto o @lat,lng
    else {
        const regexLinkAt = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
        const matchLinkAt = valor.match(regexLinkAt);
        if (matchLinkAt) {
            lat = parseFloat(matchLinkAt[1]);
            lng = parseFloat(matchLinkAt[2]);
        }
    }

    // SI SE ENCONTRARON COORDENADAS VÁLIDAS
    if (lat !== null && lng !== null) {
        // Formatear a la versión "limpia" que necesitas (con coma)
        const coordsLimpias = `${lat.toFixed(7)}, ${lng.toFixed(7)}`;
        
        // Actualizar el input visualmente
        document.getElementById("val-google-maps").value = coordsLimpias;
        
        // Mover el mapa y calcular costos
        if (miniMap) miniMap.setView([lat, lng], 16);
        actualizarPuntoYCostos(lat, lng);
    }
}

/**
 * 3. ACTUALIZAR PUNTO, DIRECCIÓN Y COSTOS 
 * Incluye: Redondeo a centena, Tarifa mínima y Recargo Nocturno (20%)
 */
/**
 * 2. ANALIZAR ENTRADA DE MAPA (LÓGICA EN CASCADA)
 * Busca coordenadas en este orden de prioridad:
 * 1. Parámetros !3d y !4d (Links de escritorio/largos)
 * 2. Parámetro @ (Links móviles/cortos)
 * 3. Texto plano "lat, lng"
 */
/**
 * 2. ANALIZAR ENTRADA DE MAPA (LÓGICA EN CASCADA MEJORADA)
 * Soporta: Links (!3d, @), Coordenadas planas, con paréntesis, y con comas decimales.
 */
function analizarEntradaMapa(valor) {
    if (!valor || valor.trim() === "") return;

    // LIMPIEZA INICIAL: Si el usuario pega algo como (10,47, -75,49), 
    // normalizamos comas por puntos y quitamos paréntesis.
    let entradaLimpia = valor.replace(/\(/g, "").replace(/\)/g, "").trim();

    let lat = null;
    let lng = null;

    // --- CASCADA PRIORIDAD 1: PARÁMETROS !3d Y !4d (Links escritorio) ---
    if (entradaLimpia.includes("!3d") && entradaLimpia.includes("!4d")) {
        const regex3d4d = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
        const match = entradaLimpia.match(regex3d4d);
        if (match) {
            lat = parseFloat(match[1]);
            lng = parseFloat(match[2]);
        }
    } 
    
    // --- CASCADA PRIORIDAD 2: PARÁMETRO @ (Links móviles) ---
    if (lat === null && entradaLimpia.includes("@")) {
        const regexAt = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
        const matchAt = entradaLimpia.match(regexAt);
        if (matchAt) {
            lat = parseFloat(matchAt[1]);
            lng = parseFloat(matchAt[2]);
        }
    }

    // --- CASCADA PRIORIDAD 3: COORDENADAS PLANAS O CON FORMATO REGIONAL ---
    // Esta RegEx ahora es más flexible: detecta números con punto o coma decimal.
    if (lat === null) {
        // Reemplazamos la coma decimal por punto solo para el cálculo, 
        // pero mantenemos la coma que separa Latitud de Longitud.
        // Ejemplo: "10,476, -75,496" -> "10.476, -75.496"
        let normalizado = entradaLimpia.replace(/(\d+),(\d+)/g, "$1.$2");
        
        const regexPlano = /(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/;
        const matchPlano = normalizado.match(regexPlano);
        
        if (matchPlano) {
            lat = parseFloat(matchPlano[1]);
            lng = parseFloat(matchPlano[2]);
        }
    }

    // SI SE ENCONTRARON COORDENADAS TRAS PASAR POR LA CASCADA
    if (lat !== null && lng !== null) {
        // Normalizamos siempre al formato estándar: Punto decimal y separado por coma
        const coordsParaInput = `${lat.toFixed(7)}, ${lng.toFixed(7)}`;
        document.getElementById("val-google-maps").value = coordsParaInput;
        
        if (miniMap) miniMap.setView([lat, lng], 16);
        actualizarPuntoYCostos(lat, lng);
    }
}

/**
 * 3. ACTUALIZAR PUNTO, DIRECCIÓN Y COSTOS 
 * (Tu lógica de costos actual se mantiene exactamente igual)
 */
async function actualizarPuntoYCostos(lat, lng) {
    const tienda = config?.coordenadasSede || [10.373750, -75.473580];

    // Marcador de usuario
    if (markerUsuarioPos) {
        markerUsuarioPos.setLatLng([lat, lng]);
    } else {
        markerUsuarioPos = L.marker([lat, lng], { draggable: true }).addTo(miniMap);
        markerUsuarioPos.on('dragend', (e) => {
            const pos = e.target.getLatLng();
            document.getElementById("val-google-maps").value = `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;
            actualizarPuntoYCostos(pos.lat, pos.lng);
        });
    }

    // Reverse Geocoding para la dirección
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const inputDir = document.getElementById("val-direccion");
        if (data && data.display_name && inputDir) {
            const partes = data.display_name.split(",");
            inputDir.value = `${partes[0] || ""}, ${partes[1] || ""}`.trim();
        }
    } catch (error) {
        console.error("Error obteniendo dirección:", error);
    }

    // Control de Ruta
    if (routingControl) miniMap.removeControl(routingControl);
    
    routingControl = L.Routing.control({
        waypoints: [L.latLng(tienda), L.latLng(lat, lng)],
        createMarker: () => null,
        addWaypoints: false,
        show: false,
        lineOptions: { 
            styles: [{ color: config?.colores?.["--accent"] || '#ffc400', weight: 6, opacity: 0.8 }] 
        }
    }).addTo(miniMap);

    routingControl.on('routesfound', function(e) {
        const route = e.routes[0];
        const distanciaKm = route.summary.totalDistance / 1000;
        
        const valorKM = config?.costoPorKilometro || 1000;
        const baseEnvio = config?.costoEnvioBase || 2000; 
        const TARIFA_MINIMA = 3000;
        const redondearACien = (valor) => Math.ceil(valor / 100) * 100;

        // 1. Precio Base y Mínima
        let calculoInicial = (distanciaKm * valorKM) + baseEnvio;
        let costoBaseProcesado = Math.max(calculoInicial, TARIFA_MINIMA);

        // 2. Recargo Nocturno (Simulando 10 PM)
        const hora = new Date().getHours();
        let costoConRecargo = costoBaseProcesado;
        let etiquetaNocturna = "";

        if (hora >= 22 || hora < 6) {
            costoConRecargo = costoBaseProcesado * 1.20; 
            etiquetaNocturna = `<br><span style="color:#e74c3c; font-weight:bold;">🌙 Recargo Nocturno (+20%)</span>`;
        }

        // 3. Redondeo Final (Paso Crucial)
        costoDomicilioActual = redondearACien(costoConRecargo);
        updateUI();

        // Mostrar en interfaz
        const infoDiv = document.getElementById("distancia-info");
        if (infoDiv) {
            infoDiv.innerHTML = `
                <div style="display:flex; flex-direction:column; background: #fff; padding: 12px; border-radius: 8px; border-left: 5px solid var(--accent); box-shadow: 0 2px 6px rgba(0,0,0,0.1); font-size: 14px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span><b>Distancia:</b> ${distanciaKm.toFixed(2)} km</span>
                        <span style="font-size: 17px; color: #27ae60;"><b>$${costoDomicilioActual.toLocaleString()}</b></span>
                    </div>
                    <div style="text-align:right; margin-top: 4px; color: #555;">
                        <small>Base: $${costoBaseProcesado.toLocaleString()}</small>
                        ${etiquetaNocturna}
                    </div>
                </div>
            `;
        }
    });
}

// Cambia el icono entre 📋 y ❌
function checkInputStatus(id) {
    const input = document.getElementById(id);
    const helper = document.getElementById(`helper-${id}`);
    if (!input || !helper) return;

    if (input.value.trim() !== "") {
        helper.innerHTML = "❌";
        helper.classList.add("is-delete");
    } else {
        helper.innerHTML = "📋";
        helper.classList.remove("is-delete");
    }
}

// Ejecuta Pegar o Borrar
async function handleInputHelper(id) {
    const input = document.getElementById(id);
    const helper = document.getElementById(`helper-${id}`);

    if (helper.classList.contains("is-delete")) {
        // ACCIÓN: BORRAR
        input.value = "";
        if (id === "val-google-maps") {
            if (marker) map.removeLayer(marker);
            costoDomicilioActual = 0;
            updateUI();
        }
    } else {
        // ACCIÓN: PEGAR
        try {
            const text = await navigator.clipboard.readText();
            input.value = text;
            if (id === "val-google-maps") analizarEntradaMapa(text);
        } catch (err) {
            console.error("Error al acceder al portapapeles", err);
        }
    }
    
    checkInputStatus(id);
    updateTitle();
}

window.onload = init;
