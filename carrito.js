// Función para ocultar la animación de bienvenida
/*function hideWelcomeLoader() {
    var welcomeLoader = document.getElementById('welcome-loader');
    welcomeLoader.style.display = 'none'; // Ocultar la animación de bienvenida
}

  // Ejecutamos la función cuando la página haya cargado completamente
window.addEventListener('load', function() {
    // Esperamos 4 segundos para que la animación de bienvenida se complete
    setTimeout(hideWelcomeLoader, 700); // El tiempo puede ser ajustado (0.7s = 0.7 segundos)
});*/


















// EVITAR CLICK DERECHO EN TODA LA PÁGINA
document.addEventListener('contextmenu', (e) => e.preventDefault());

// RESTRINGIR TODOS LOS TIPOS DE ZOOM EN MÓVILES
if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {

    // Evitar el gesto de pinza para hacer zoom
    document.addEventListener('touchstart', (event) => {
        if (event.touches.length > 1) {
            event.preventDefault(); // Bloquea zoom de pinza
        }
    }, { passive: false });

    // Evitar zoom en doble toque
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault(); // Bloquea zoom en doble toque
        }
        lastTouchEnd = now;
    }, false);
}

// EVITAR ZOOM AUTOMÁTICO EN CAMPOS DE TEXTO EN MÓVILES
document.querySelectorAll('input, textarea, select').forEach((element) => {
    element.addEventListener('focus', () => {
        document.body.style.zoom = '100%'; // Previene el zoom en campos de entrada
    });
    element.addEventListener('blur', () => {
        document.body.style.zoom = ''; // Restaura el estilo de zoom después
    });
});

// RESTRINGIR ZOOM GLOBAL A TRAVÉS DE META TAGS
const metaTag = document.createElement('meta');
metaTag.name = 'viewport';
metaTag.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
document.head.appendChild(metaTag);

// RESTRINGIR ZOOM EN NAVEGADORES DE ESCRITORIO
// Evitar zoom con teclado (Ctrl/Cmd + "+" o "-" o "0")
document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '-' || event.key === '0')) {
        event.preventDefault(); // Bloquea zoom con teclado
    }
});

// Evitar zoom con rueda del ratón (Ctrl/Cmd + Scroll)
document.addEventListener('wheel', (event) => {
    if (event.ctrlKey || event.metaKey) {
        event.preventDefault(); // Bloquea zoom con scroll
    }
}, { passive: false });











// FUNCIÓN PARA FORMATEAR LOS NÚMEROS CON PUNTOS
function formatNumber(number) {
    return number.toLocaleString('es-CO');
}







// FUNCIÓN PARA CARGAR LOS PRODUCTOS DEL CARRITO
function loadCart() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsList = document.getElementById('cart-items-list');
    const cartCounter = document.getElementById('cart-counter');
    const cartTotal = document.getElementById('cart-total');
    const opcionesPago = document.getElementById('opcionesPago');
    const clearCartButton = document.getElementById('clear-cart-button');
    let total = 0;

    // LIMPIAR LA LISTA DE PRODUCTOS EN EL CARRITO
    cartItemsList.innerHTML = '';

    // Verificar si el carrito está vacío
    if (cartItems.length === 0) {
        const imageUrl = 'img/iconos/carrito.png';
        cartItemsList.innerHTML = `
            <img src="${imageUrl}" alt="Imagen sin productos" id="carritoimagen">
            <p>No hay productos en tu carrito.</p>
            <button id="volveraproductos" onclick="window.location.href='index.html'">Añadir productos</button>
        `;

        // Ocultar el contador de productos
        if (cartCounter) {
            cartCounter.textContent = '';
        }

        // Reiniciar el total del carrito
        if (cartTotal) {
            cartTotal.textContent = '';
        }

        // Deshabilitar el select de opciones de pago
        if (opcionesPago) {
            opcionesPago.disabled = true;
        }

        // Ocultar el botón de limpiar carrito
        if (clearCartButton) {
            clearCartButton.style.display = 'none';
        }
    } else {
        // MOSTRAR PRODUCTOS DEL CARRITO
        cartItems.forEach((product, index) => {
            const price = isNaN(parseFloat(product.price)) ? 0 : parseFloat(product.price);
            const quantity = isNaN(parseInt(product.quantity)) ? 0 : parseInt(product.quantity);
            const subtotal = price * quantity;
            const imageUrl = product.image || 'img/Productos/default.jpg';

            // Crear una lista de los checkboxes seleccionados
            const selectedOptions = `
                ${product.selectedSizes && product.selectedSizes.length > 0 ? `<p><strong>Tamaño:</strong> ${product.selectedSizes.join(', ')}</p>` : ''}
                ${product.selectedFlavors && product.selectedFlavors.length > 0 ? `<p><strong>Sabor/es:</strong> ${product.selectedFlavors.join(', ')}</p>` : ''}
                ${product.selectedBorders && product.selectedBorders.length > 0 ? `<p><strong>Borde:</strong> ${product.selectedBorders.join(', ')}</p>` : ''}
                ${product.selectedAdditionals && product.selectedAdditionals.length > 0 ? `<p><strong>Adicionales:</strong> ${product.selectedAdditionals.join(', ')}</p>` : ''}
                <p><strong>Indicaciones: </strong><span class="instructions-text">${product.instructions || 'Ninguna'}</span></p>
            `;

            // Crear el contenedor del producto
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <div id="contenedordeimagencarrito">
                    <img src="${imageUrl}" alt="${product.name}" class="cart-product-image">
                </div>
                <div id="nombre_precio_intrucciones">
                    <p><strong>${product.name} - $${formatNumber(price)}</strong></p>
                    <p><strong>Cantidad: </strong>${quantity}</p>
                    <p><strong>Indicaciones: </strong>${product.instructions || ''}</p>
                </div>
                <div class="action-container">
                    <img id="basura" src="img/iconos/basura.svg" alt="Eliminar" onclick="removeItem(${index}, this)">
                    <div class="subtotal-popup">
                        <p>$${formatNumber(subtotal)}</p>
                    </div>
                </div>
            `;

            // Crear el botón "Ver más detalles"
            const detailsButton = document.createElement('button');
            detailsButton.classList.add('toggle-details-btn');
            detailsButton.innerHTML = `
                <span>Detalles del Producto</span>
                <img src="img/iconos/arrow-down.png" alt="Flecha" class="arrow-icon">
            `;
            detailsButton.onclick = function () {
                toggleDetails(detailsElement, detailsButton);
            };

            // Crear el contenedor de detalles (inicialmente oculto)
            const detailsElement = document.createElement('div');
            detailsElement.classList.add('product-details');
            detailsElement.style.display = 'none';
            detailsElement.innerHTML = `${selectedOptions}`;

            // Agregar el producto al carrito
            cartItemsList.appendChild(itemElement);

            // Agregar el botón y el contenedor de detalles como hermanos del producto
            cartItemsList.appendChild(detailsButton);
            cartItemsList.appendChild(detailsElement);

            // Sumar el subtotal al total general
            total += subtotal;
        });

        // Habilitar el select de opciones de pago
        if (opcionesPago) {
            opcionesPago.disabled = false;
        }

        // Mostrar el botón de limpiar carrito
        if (clearCartButton) {
            clearCartButton.style.display = 'inline-block';
        }

        // Mostrar el contador de productos
        if (cartCounter) {
            cartCounter.textContent = `${cartItems.length} Producto${cartItems.length > 1 ? 's' : ''}`;
        }
    }

    // Mostrar el total con formato
    if (cartTotal) {
        cartTotal.innerText = `Total: $${formatNumber(total)}`;
    }

    // Guardar el total en localStorage
    localStorage.setItem('totalCarrito', total);
}




    function toggleDetails(detailsElement, button) {
        const arrowIcon = button.querySelector('.arrow-icon');
        const textSpan = button.querySelector('span:first-child');

        if (detailsElement.style.display === 'none' || detailsElement.style.display === '') {
            detailsElement.style.display = 'block'; // Mostrar detalles
            textSpan.innerText = 'Detalles del Producto'; // Cambiar texto del botón
            arrowIcon.style.transform = 'rotate(180deg)'; // Rotar la imagen hacia arriba
            button.style.border = 'none'; // Quitar el borde del botón
        } else {
            detailsElement.style.display = 'none'; // Ocultar detalles
            textSpan.innerText = 'Detalles del Producto'; // Cambiar texto del botón
            arrowIcon.style.transform = 'rotate(0deg)'; // Rotar la imagen hacia abajo
            button.style.borderBottom = 'solid 2px #ddd'; // Añadir el borde en la parte inferior del botón
        }
    }




// FUNCIÓN PARA ELIMINAR UN PRODUCTO DEL CARRITO CON ANIMACIÓN
function removeItem(index, element) {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsList = document.getElementById('cart-items-list');

    // Obtener el contenedor del producto específico (el contenedor 'cart-item' al que pertenece el botón presionado)
    const itemElement = element.closest('.cart-item'); // Seleccionar el div contenedor del producto

    // Añadir la clase de animación al producto
    itemElement.classList.add('fade-out');

    // Esperar a que termine la animación (0.5s) y luego eliminar el producto
    setTimeout(() => {
        // Eliminar el producto en la posición indicada
        cartItems.splice(index, 1);

        // Guardar de nuevo el carrito en el localStorage
        localStorage.setItem('cart', JSON.stringify(cartItems));

        // Recargar el carrito
        loadCart();
    }, 500); // Tiempo que dura la animación
}



//////////////////////////////////////////////////////////////////////////////////////////
function clearCart() {
    // Mostrar una alerta de confirmación al usuario
    const confirmClear = confirm("¿Seguro que deseas vaciar el carrito?");

    if (confirmClear) {
        // Eliminar todos los productos del carrito en localStorage
        localStorage.removeItem('cart');

        // Limpiar la lista de productos en el DOM
        const cartItemsList = document.getElementById('cart-items-list');
        const imageUrl = 'img/iconos/carrito.png';
        cartItemsList.innerHTML = `
            <img src="${imageUrl}" alt="Imagen sin productos" id="carritoimagen">
            <p>No hay productos en tu carrito.</p>
            <button id="volveraproductos" onclick="window.location.href='index.html'">Añadir productos</button>
        `;

        // Actualizar el contador de productos
        const cartCounter = document.getElementById('cart-counter');
        cartCounter.textContent = ''; // Actualizar el texto del contador

        // Reiniciar el total del carrito
        const cartTotal = document.getElementById('cart-total');
        if (cartTotal) cartTotal.textContent = 'Total: $0';

        // Deshabilitar el select de opciones de pago
        const opcionesPago = document.getElementById('opcionesPago');
        if (opcionesPago) {
            opcionesPago.disabled = true;
        }

        // Ocultar el botón de limpiar carrito
        const clearCartButton = document.getElementById('clear-cart-button');
        if (clearCartButton) {
            clearCartButton.style.display = 'none';
        }
    }
}
/////////////////////////////////////////////////////////////////////////////////////


// FUNCIÓN PARA VERIFICAR SI EL CARRITO ESTÁ LLENO Y TAMBIÉN INSERTAR EL MÉTODO DE PAGO (ABRE EL MODAL)
function openModal() {
const metodoPago = document.getElementById('opcionesPago').value; // Obtener el valor del select de pago
const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

// Verificar si el carrito está vacío
if (cartItems.length === 0) {
alert("Tu carrito está vacío. Agrega productos antes de proceder.");
return; // Evita abrir el modal si el carrito está vacío
}

    // Verificar si no se ha seleccionado un método de pago
    if (!metodoPago) {
        alert("Por favor, selecciona un método de pago antes de continuar.");
        
        // Resaltar el select de opciones de pago para llamar la atención
        const opcionesPago = document.getElementById('opcionesPago');
        opcionesPago.classList.add('highlight-error'); // Agregar clase para resaltar en rojo
        setTimeout(() => opcionesPago.classList.remove('highlight-error'), 2000); // Eliminar el resaltado después de 2 segundos

        return; // Evita abrir el modal si no se seleccionó un método de pago
    }

// Si todo está bien, abrir el modal
document.getElementById('payment-modal').style.display = 'flex'; // Mostrar el modal
}

// FUNCIÓN PARA GUARDAR EL MÉTODO DE PAGO EN LOCALSTORAGE
document.getElementById('opcionesPago').addEventListener('change', function() {
const metodoPago = this.value;
localStorage.setItem('metodoPago', metodoPago);  // Guardar el método de pago
});

// FUNCIÓN PARA CERRAR EL MODAL CON EL BOTÓN CANCELAR
function closeModal() {
document.getElementById('payment-modal').style.display = 'none'; // Ocultar el modal
}







// Función para abrir el modal de datos personales cuando se hace clic en "Recoger en Tienda"
function abrirModaldatospersonales() {
    // Recuperar los datos del localStorage
    const nombreGuardado = localStorage.getItem('nombre');
    const telefonoGuardado = localStorage.getItem('telefono');

    // Mostrar los datos guardados en los campos del formulario si existen
    if (nombreGuardado) {
        document.getElementById('nombre').value = nombreGuardado;
    }
    if (telefonoGuardado) {
        document.getElementById('telefono').value = telefonoGuardado;
    }

    document.getElementById('datospersonales').classList.add('active');
}

// Función para cerrar el modal de datos personales
function cerrarModaldatospersonales() {
    document.getElementById('datospersonales').classList.remove('active');
}

// Validación que solo sea nombre y no números
const inputNombre = document.getElementById('nombre');
inputNombre.addEventListener('input', () => {
    // Validar si solo hay letras y espacios
    // Si el texto contiene caracteres no permitidos, los eliminamos
    inputNombre.value = inputNombre.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
});

// Validación de teléfono (máximo 10 dígitos)
function validarTelefono() {
    const telefono = document.getElementById("telefono");
    telefono.value = telefono.value.replace(/[^0-9]/g, ''); // Eliminar caracteres no numéricos
    if (telefono.value.length > 10) {
        telefono.value = telefono.value.substring(0, 10); // Limitar a 10 caracteres
    }
}

// Función para manejar la validación y enviar mensaje de WhatsApp si los datos son válidos
function aceptarModaldatos() {
    const nombre = document.getElementById("nombre").value.trim();
    const telefono = document.getElementById("telefono").value.trim();

    // Validar que ambos campos estén llenos y que el teléfono tenga 10 dígitos
    if (nombre && telefono.length === 10) {
        // Guardar datos en localStorage
        localStorage.setItem('nombre', nombre);
        localStorage.setItem('telefono', telefono);

        // Guardar los datos aceptados para compararlos más tarde
        nombreAceptado = nombre;
        telefonoAceptado = telefono;

        // Cambiar el botón de "Aceptar" por "Finalizar Compra"
        const btnAceptar = document.getElementById('aceptarmodal');
        const btnFinalizar = document.getElementById('btnFinalizar');

        btnAceptar.style.display = 'none'; // Ocultar el botón de "Aceptar"
        btnFinalizar.style.display = 'inline-block'; // Mostrar el botón de "Finalizar Compra"
        
        // Habilitar el botón de "Finalizar compra" solo si los campos están completos
        habilitarBotonFinalizar();
    } else {
        // Mostrar alerta si los campos no están completos o el teléfono no tiene 10 dígitos
        alert("Por favor, ingresa tu nombre y un teléfono válido de 10 dígitos.");
    }
}

// Habilitar el botón de "Finalizar Compra"
function habilitarBotonFinalizar() {
    const btnFinalizar = document.getElementById('btnFinalizar');
    btnFinalizar.style.display = 'inline-block'; // Mostrar botón de finalizar
    
    // Asignar evento para mostrar el modal cuando se haga clic
    btnFinalizar.addEventListener('click', mostrarModalCarrito);

    // Agregar eventos para monitorear los cambios en el nombre y teléfono
    monitorearCambios();
}

// Monitorear cambios en los campos de nombre y teléfono
function monitorearCambios() {
    const nombreField = document.getElementById("nombre");
    const telefonoField = document.getElementById("telefono");
    const finalizarButton = document.getElementById("btnFinalizar");
    const aceptarButton = document.getElementById("aceptarmodal");

    // Detectar cambios en el campo de nombre
    nombreField.addEventListener("input", () => {
        if (nombreField.value.trim() !== nombreAceptado || telefonoField.value.trim() !== telefonoAceptado) {
            finalizarButton.style.display = "none"; // Ocultar el botón de finalizar si los datos cambian
            aceptarButton.style.display = "inline-block"; // Mostrar el botón de aceptar si los datos cambian
        }
    });

    // Detectar cambios en el campo de teléfono
    telefonoField.addEventListener("input", () => {
        if (nombreField.value.trim() !== nombreAceptado || telefonoField.value.trim() !== telefonoAceptado) {
            finalizarButton.style.display = "none"; // Ocultar el botón de finalizar si los datos cambian
            aceptarButton.style.display = "inline-block"; // Mostrar el botón de aceptar si los datos cambian
        }
    });
}











///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Función para generar el número único de factura
function generarNumeroFactura() {
    const nombre = localStorage.getItem('nombre') || "Usuario";
    const telefono = localStorage.getItem('telefono') || "0000000000";
    
    // Tomamos las primeras 3 letras del nombre (si tiene menos de 3, tomamos lo que haya)
    const letrasNombre = nombre.slice(0, 3).toUpperCase();
    
    // Tomamos los últimos 3 dígitos del teléfono
    const ultimos3Digitos = telefono.slice(-3);
    
    // Obtenemos la fecha actual en formato compactado (Año-Mes-Día)
    const fechaActual = new Date();
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const anio = fechaActual.getFullYear().toString().slice(-2);  // Solo los últimos 2 dígitos del año
    
    const fecha = `${anio}${mes}${dia}`;  // Combinamos la fecha como un string corto
    
    // Obtener la hora exacta (hora, minutos, segundos)
    const hora = String(fechaActual.getHours()).padStart(2, '0');
    const minutos = String(fechaActual.getMinutes()).padStart(2, '0');
    const segundos = String(fechaActual.getSeconds()).padStart(2, '0'); // Añadimos los segundos
    
    // Combinamos todo para formar un número único de factura
    const numeroFactura = `${letrasNombre}${ultimos3Digitos}${fecha}${hora}${minutos}${segundos}`;

    // Guardamos la fecha y hora exacta de la compra en localStorage para usarla más tarde en la impresión
    localStorage.setItem('horaCompra', `${hora}:${minutos}:${segundos}`);

    return numeroFactura;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Función para finalizar la compra
function finalizarCompra() {
    const nombre = localStorage.getItem('nombre') || "Nombre no proporcionado";
    let telefono = localStorage.getItem('telefono') || "Teléfono no proporcionado";
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const metodoPago = localStorage.getItem('metodoPago') || 'No seleccionado';  // Por defecto 'No seleccionado' si no hay valor
    const totalProductos = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
    
    // Formatear el número telefónico con el patrón 000 000 0000
    telefono = telefono.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');

    // Generar el número de factura único
    const numeroFactura = generarNumeroFactura();
    
    // Guardar el número de factura en localStorage
    localStorage.setItem('numeroFactura', numeroFactura);

    // Obtener la fecha y hora actuales
    const fechaActual = new Date();
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); // Los meses son base 0
    const anio = fechaActual.getFullYear();
    const fecha = `${dia}/${mes}/${anio}`;

    const hora = fechaActual.toLocaleTimeString('es-ES', { hour12: false }); // Formato 24 horas



    
    // Crear el bloque de texto con los productos seleccionados en checkboxes
    let messageProducts = cartItems.map(item => {
        const selectedOptions = `
            ${item.selectedSizes && item.selectedSizes.length > 0 ? `T: ${item.selectedSizes.join(', ')}` : ''}
            ${item.selectedFlavors && item.selectedFlavors.length > 0 ? `S: ${item.selectedFlavors.join(', ')}` : ''}
            ${item.selectedBorders && item.selectedBorders.length > 0 ? `B: ${item.selectedBorders.join(', ')}` : ''}
            ${item.selectedAdditionals && item.selectedAdditionals.length > 0 ? `A: ${item.selectedAdditionals.join(', ')}` : ''}
        `.trim();



        return `*${item.name} - $${formatNumber(parseFloat(item.price) || 0)} x ${item.quantity} = $${formatNumber(parseFloat(item.price) * item.quantity)}*` +
            `${selectedOptions ? `\n   ${selectedOptions.replace(/\n\s+/g, '\n   ')}` : ''}` +
           `${item.instructions ? `\n_Instrucciones: ${item.instructions}_` : '\n__'}`;
    }).join('\n');

    // Generar el mensaje de WhatsApp para "Recoger en Tienda"
    let mensaje = "*RECOGER EN TIENDA*\n\n";
    mensaje += `*FACTURA Nº:* #${numeroFactura}\n\n`;
    mensaje += `*FECHA:* ${fecha}\n`;
    mensaje += `*HORA:* ${hora}\n\n`;
    mensaje += "*DATOS DEL USUARIO:*\n";
    mensaje += `*NOMBRE:* ${nombre}\n`;
    mensaje += `*TELÉFONO:* ${telefono}\n\n`;
    mensaje += "*PRODUCTOS SELECCIONADOS:*\n\n";
    mensaje += `${messageProducts}\n\n`;
    mensaje += `*TOTAL A PAGAR: $${formatNumber(totalProductos)}*\n`;
    mensaje += `MÉTODO DE PAGO: *${metodoPago}*\n\n`; 
    mensaje += "*Ubicación de la tienda:*\n";
    mensaje += "https://bit.ly/4f2GU5I\n\n\n";
    mensaje += "*Envía tu pedido aqui ----->*";

    // Codificar el mensaje y abrir WhatsApp
    const encodedMessage = encodeURIComponent(mensaje);
    window.open(`https://wa.me/3022666530?text=${encodedMessage}`, '_blank');

    // Mostrar el modal tras finalizar la compra
    mostrarModalCarrito();

    // Mostrar el botón de imprimir en el modal
    const imprimirBtn = document.getElementById('imprimirFacturaBtn');
    imprimirBtn.style.display = 'inline-block';  // Mostrar el botón de imprimir factura
}



// Mostrar el modal de finalización de compra
function mostrarModalCarrito() {
    const modalCarrito = document.getElementById('compraFinalizadaModal');
    modalCarrito.style.display = 'flex'; // Mostrar el modal
}

// Cerrar el modal de finalización de compra
function cerrarModalCarrito() {
    const modalCarrito = document.getElementById('compraFinalizadaModal');
    modalCarrito.style.display = 'none'; // Ocultar el modal
}

// Función para volver al inicio y limpiar el estado
function volverAlInicio() {
    // Guardar temporalmente el nombre y el número de teléfono
    const nombre = localStorage.getItem('nombre');
    const telefono = localStorage.getItem('telefono');
    
    // Limpiar todo el localStorage
    localStorage.clear();
    
    // Restaurar el nombre y el número de teléfono
    if (nombre) localStorage.setItem('nombre', nombre);
    if (telefono) localStorage.setItem('telefono', telefono);

    // Redirigir al inicio
    window.location.href = 'index.html';
}

// Selecciona el modal y el botón de cierre ("x")
const modalCarrito = document.getElementById('compraFinalizadaModal');
const closeModalButton = document.getElementById('closeModal');

// Agregar el evento de clic para cerrar el modal cuando se haga clic en la "x"
closeModalButton.addEventListener('click', () => {
    modalCarrito.style.display = 'none'; // Ocultar el modal
});

// Cerrar el modal si se hace clic fuera de él
window.addEventListener('click', (event) => {
    if (event.target === modalCarrito) {
        modalCarrito.style.display = 'none'; // Cerrar el modal si se hace clic fuera de él
    }
});

// Cargar los productos del carrito cuando se carga la página
window.onload = loadCart;



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Función para imprimir la factura
function imprimirFactura() {
    const nombre = localStorage.getItem('nombre') || "Nombre no proporcionado";
    let telefono = localStorage.getItem('telefono') || "Teléfono no proporcionado";
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const metodoPago = localStorage.getItem('metodoPago') || 'No seleccionado';  // Por defecto 'No seleccionado' si no hay valor
    const totalProductos = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
    
    // Recuperar el número de factura desde localStorage
    const numeroFactura = localStorage.getItem('numeroFactura') || "No disponible";  // Si no hay número, usar un valor predeterminado
    const horaCompra = localStorage.getItem('horaCompra') || "Hora no disponible"; // Hora exacta de la compra

    // Formatear el número telefónico con el patrón 000 000 0000
    telefono = telefono.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');

    // Obtener la fecha y hora actuales
    const fechaActual = new Date();
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); // Los meses son base 0
    const anio = fechaActual.getFullYear();
    const fecha = `${dia}/${mes}/${anio}`;


    // Crear el bloque de texto con los productos seleccionados
    let messageProducts = cartItems.map(item => {
        const selectedOptions = `
            ${item.selectedSizes && item.selectedSizes.length > 0 ? `T: ${item.selectedSizes.join(', ')}` : ''}
            ${item.selectedFlavors && item.selectedFlavors.length > 0 ? `S: ${item.selectedFlavors.join(', ')}` : ''}
            ${item.selectedBorders && item.selectedBorders.length > 0 ? `B: ${item.selectedBorders.join(', ')}` : ''}
            ${item.selectedAdditionals && item.selectedAdditionals.length > 0 ? `A: ${item.selectedAdditionals.join(', ')}` : ''}
        `.trim();

        return `<strong>${item.name} - $${formatNumber(parseFloat(item.price) || 0)} x ${item.quantity} = $${formatNumber(parseFloat(item.price) * item.quantity)}</strong>` +
               `${selectedOptions ? `\n   ${selectedOptions.replace(/\n\s+/g, '\n   ')}` : ''}` +
               `${item.instructions ? `\nInstrucciones: ${wrapText(item.instructions, 38)}` : '\n__'}`;
    }).join('\n');
    
    // Generar el mensaje de la factura con el número de factura
    let facturaTexto = `
------------------------------------------------------
<strong>MR. GEORGE - SINCE 2022</strong>
------------------------------------------------------

<strong>RECOGER EN TIENDA</strong>

<strong>FACTURA Nº:</strong> #${numeroFactura}
<strong>FECHA:</strong> ${fecha}
<strong>HORA:</strong> ${horaCompra}

<strong>DATOS DEL USUARIO:</strong>
<strong>Nombre:</strong> ${nombre}
<strong>Teléfono:</strong> ${telefono}

<strong>PRODUCTOS SELECCIONADOS:</strong>

${messageProducts}

<strong>TOTAL A PAGAR:</strong> $${formatNumber(totalProductos)}
<strong>MÉTODO DE PAGO:</strong> ${metodoPago}
    
------------------------------------------------------
<strong>¡Gracias por tu compra!</strong>
------------------------------------------------------
`;

    // Abrir una ventana nueva para mostrar la factura
    const ventanaImpresion = window.open('', '', 'width=800,height=600');
    ventanaImpresion.document.write(`<html><head><title>FACTURA Nº: #${numeroFactura}</title></head><body>`);
    ventanaImpresion.document.write('<pre>' + facturaTexto + '</pre>');
    ventanaImpresion.document.write('</body></html>');
    ventanaImpresion.document.close();
    ventanaImpresion.print();
}


function wrapText(text, maxLength) {
    if (!text) return ''; // Maneja casos donde el texto es null, undefined o vacío

    // Dividimos el texto en palabras usando el espacio como delimitador
    const words = text.split(' ');
    let result = '';  // Cadena final con el texto envuelto
    let line = '';    // Línea actual que se está construyendo

    words.forEach(word => {
        // Si la palabra es más larga que maxLength, la dividimos en varias líneas
        while (word.length > maxLength) {
            result += word.slice(0, maxLength) + '\n'; // Añadimos una parte de la palabra al resultado
            word = word.slice(maxLength); // Cortamos la palabra para procesar el resto
        }

        // Comprobamos si añadir la palabra actual excede el límite de longitud
        if (line.length + word.length + (line.length > 0 ? 1 : 0) > maxLength) {
            result += line + '\n'; // Añadimos la línea actual al resultado con un salto de línea
            line = word;           // Comenzamos una nueva línea con la palabra actual
        } else {
            // Si no excede el límite, añadimos la palabra a la línea actual
            line += (line ? ' ' : '') + word;
        }
    });

    result += line; // Añadimos la última línea al resultado
    return result;
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////








