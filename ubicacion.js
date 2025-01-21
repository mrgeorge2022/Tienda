// Función para ocultar la animación de bienvenida
function hideWelcomeLoader() {
    var welcomeLoader = document.getElementById('welcome-loader');
    welcomeLoader.style.display = 'none'; // Ocultar la animación de bienvenida
}

  // Ejecutamos la función cuando la página haya cargado completamente
window.addEventListener('load', function() {
    // Esperamos 4 segundos para que la animación de bienvenida se complete
    setTimeout(hideWelcomeLoader, 700); // El tiempo puede ser ajustado (0.7s = 0.7 segundos)
});








//BORRAR INPUT CON IMAGEN
function borrarTexto(id) {
    document.getElementById(id).value = ''; // Limpia el valor del input
}









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






















let map, marker, directionsService, directionsRenderer, geocoder;

const cartagenaLatLng = { lat: 10.3910, lng: -75.4796 }; // Coordenadas de Cartagena
const tiendaLatLng = { lat: 10.373757597284885, lng: -75.47360558666398 }; // Coordenadas de la tienda
const cartagenaBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(10.2900, -75.600),// Coordenadas de la esquina suroeste
    new google.maps.LatLng(10.493397, -75.407694)// Coordenadas de la esquina noreste
);

// Costo por kilómetro
const costoPorKilometro = 1653;
// Límites del costo de envío
const costoMaximo = 20000;
const costoMinimo = 3000;

function initMap() {
    // Inicializar el mapa
    map = new google.maps.Map(document.getElementById("map"), {
        center: cartagenaLatLng,
        zoom: 11,
        restriction: {
            latLngBounds: cartagenaBounds,
            strictBounds: false,
        },
    });

    geocoder = new google.maps.Geocoder();
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
    });

    // Marcador de la tienda
    const tiendaMarker = new google.maps.Marker({
        map: map,
        position: tiendaLatLng,
        title: "Nuestra Tienda",
        icon: {
            url: "img/icono_tienda.png", // Ruta de la imagen personalizada
            scaledSize: new google.maps.Size(30, 30),
            origin: new google.maps.Point(0, 0),
        },
    });

    // Marcador principal (clickeable y arrastrable)
    marker = new google.maps.Marker({
        map: map,
        draggable: true, // Permitir arrastre
        position: cartagenaLatLng, // Posición inicial
    });

    // Evento para cuando el marcador es arrastrado
    google.maps.event.addListener(marker, "dragend", function () {
        const position = marker.getPosition();

        if (!cartagenaBounds.contains(position)) {
            alert("Ubica el marcador dentro de los límites de Cartagena.");
            marker.setPosition(cartagenaLatLng); // Restaurar posición inicial
            return;
        }

        mostrarUbicacion(position);
        obtenerDireccion(position);
        calcularRuta(tiendaLatLng, position);
    });

    // Evento para cuando se hace clic en el mapa
    map.addListener("click", function (event) {
        const clickedLocation = event.latLng;

        if (!cartagenaBounds.contains(clickedLocation)) {
            alert("Por favor, selecciona un punto dentro de los límites de Cartagena.");
            return;
        }

        marker.setPosition(clickedLocation); // Mover marcador al clic
        mostrarUbicacion(clickedLocation);
        obtenerDireccion(clickedLocation);
        calcularRuta(tiendaLatLng, clickedLocation);
    });

// Configuración de autocompletar en el campo de dirección
const input = document.getElementById("direccion");
const autocomplete = new google.maps.places.Autocomplete(input);

// Establecer los límites iniciales
autocomplete.setBounds(cartagenaBounds);
autocomplete.bindTo("bounds", map);

autocomplete.addListener("place_changed", function () {
    const place = autocomplete.getPlace();

    if (!place.geometry) {
        alert("No se encontró la dirección");
        return;
    }

    const location = place.geometry.location;
    console.log("Coordenadas seleccionadas:", location.lat(), location.lng());

    // Validar si la ubicación está dentro de los límites
    if (!cartagenaBounds.contains(location)) {
        alert("Ubicación fuera de los límites de Cartagena.");
        console.log("Ubicación fuera de los límites:", location.lat(), location.lng());
        input.value = ""; // Limpiar el campo de entrada
        return;
    }

    // Si la ubicación es válida, actualizar el mapa y marcador
    map.setCenter(location);
    map.setZoom(15);
    marker.setPosition(location);

    // Mostrar información adicional
    mostrarUbicacion(location);
    obtenerDireccion(location);
    calcularRuta(tiendaLatLng, location);
});


    /*// Dibujar los límites de Cartagena para verificar visualmente (opcional)
    const cartagenaRectangle = new google.maps.Rectangle({
        bounds: cartagenaBounds,
        map: map,
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.1,
    });*/
}




function mostrarUbicacion(location) {
    const lat = location.lat();
    const lng = location.lng();
    console.log(`Latitud: ${lat}, Longitud: ${lng}`);
}

function obtenerDireccion(location) {
    geocoder.geocode({ location: location }, function (results, status) {
        if (status === "OK" && results[0]) {
            const direccion = results[0].formatted_address;
            document.getElementById("direccion").value = direccion;
        } else {
            alert("No se pudo obtener la dirección.");
        }
    });
}

// Función para calcular la ruta y actualizar el costo de envío y el total a pagar
function calcularRuta(origen, destino) {
    const request = {
        origin: origen,
        destination: destino,
        travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, function (result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
            const distancia = result.routes[0].legs[0].distance.value;
            const distanciaKilometros = distancia / 1000;
            const costoEnvio = calcularCostoEnvio(distanciaKilometros);

            // Guardar el costo de envío en localStorage
            localStorage.setItem("costoDomicilio", costoEnvio);

            // Mostrar el costo de envío en la página
            document.getElementById("costo-envio").textContent = `Domicilio: ${formatearPesoColombiano(costoEnvio)}`;

            // Actualizar el total de pago
            actualizarTotalPago();
        } else {
            alert("No se pudo calcular la ruta" );
            location.reload();
        }
    });
}

function calcularCostoEnvio(distanciaKilometros) {
    let costoEnvio = distanciaKilometros * costoPorKilometro;

    // Aplicar los límites de costo (mínimo y máximo)
    costoEnvio = Math.max(costoMinimo, Math.min(costoEnvio, costoMaximo));

    // Redondear el costo al siguiente múltiplo de 1,000
    return Math.ceil(costoEnvio / 1000) * 1000;
}


// Función para formatear el costo en pesos colombianos
function formatearPesoColombiano(valor) {
    const formato = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0, // Sin decimales
    });
    return formato.format(valor); // Retorna el valor formateado como moneda colombiana
}

// Función para formatear el número con puntos de mil
function formatNumber(number) {
    return number.toLocaleString("es-CO"); // Formato con separadores de miles
}

// Función para actualizar el total a pagar
function actualizarTotalPago() {
    // Obtener el total de los productos desde localStorage
    const total = parseFloat(localStorage.getItem('totalCarrito')) || 0;

    // Obtener el costo de envío (lo tomamos del DOM)
    const costoEnvio = parseFloat(document.getElementById("costo-envio").textContent.replace('Domicilio: $', '').replace('.', '').trim()) || 0;

    // Sumar el costo de los productos y el costo de envío
    const totalPago = total + costoEnvio;

    // Mostrar el total en el HTML con formato
    document.getElementById("total-pago").innerText = `Total a pagar: $ ${formatNumber(totalPago)}`;
}

// Inicializar el mapa y otros elementos de la página
google.maps.event.addDomListener(window, "load", function() {
    initMap();
    
    // Obtener el total de los productos desde localStorage
    const total = parseFloat(localStorage.getItem('totalCarrito')) || 0;

    // Mostrar el total de los productos en el HTML con formato
    document.getElementById("costo-productos").innerText = `Productos: $ ${formatNumber(total)}`;

    // Actualizar el total a pagar al cargar la página
    actualizarTotalPago();
});


function usarUbicacionActual() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const currentLocation = new google.maps.LatLng(lat, lng);

            if (!cartagenaBounds.contains(currentLocation)) {
                alert("Tu ubicación no está dentro de Cartagena.");
                return;
            }

            map.setCenter(currentLocation);
            marker.setPosition(currentLocation);
            mostrarUbicacion(currentLocation);
            obtenerDireccion(currentLocation);
            calcularRuta(tiendaLatLng, currentLocation);
        }, function () {
            alert("No se pudo obtener la ubicación actual.");
        });
    } else {
        alert("Geolocalización no es soportada por este navegador.");
    }
}

google.maps.event.addDomListener(window, "load", initMap);



// FUNCIÓN AL DAR CLIC EN "LISTO"
function habilitarModalDatosPersonales() {
    const direccion = document.getElementById("direccion").value; // Obtener la dirección ingresada
    
    if (direccion) {
        // Si la dirección está llena, proceder a abrir el modal de datos personales
        abrirModalDatosPersonales(); // Abre el modal de nombre y teléfono
        // Guardar la dirección y las coordenadas en el localStorage
        guardarDatos();  // Llamada a la función para guardar dirección y coordenadas
    } else {
        // Si la dirección no está llena, mostrar una alerta
        alert("Por favor, busca tu dirección.");
    }
}

// FUNCIÓN PARA ABRIR EL MODAL DE DATOS PERSONALES (NOMBRE Y TELÉFONO)
function abrirModalDatosPersonales() {
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

    // Mostrar el modal de datos personales
    document.getElementById('datospersonales').classList.add('active');
}

// FUNCIÓN PARA CERRAR EL MODAL DE DATOS PERSONALES (NOMBRE Y TELÉFONO)
function cerrarModaldatospersonales() {
    document.getElementById('datospersonales').classList.remove('active');
}

//validacion que solo sea nombre y no numeros
const inputNombre = document.getElementById('nombre');
inputNombre.addEventListener('input', () => {
    // Validar si solo hay letras y espacios
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
    // Si el texto contiene caracteres no permitidos, los eliminamos
    inputNombre.value = inputNombre.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
});

// VALIDACIÓN DE TELÉFONO (MÁXIMO 10 DÍGITOS)
function validarTelefono() {
    const telefono = document.getElementById("telefono");
    telefono.value = telefono.value.replace(/[^0-9]/g, ''); // Eliminar caracteres no numéricos
    if (telefono.value.length > 10) {
        telefono.value = telefono.value.substring(0, 10); // Limitar a 10 caracteres
    }
}

// FUNCIÓN PARA ACEPTAR LOS DATOS Y CAMBIAR EL BOTÓN A "FINALIZAR COMPRA"
function aceptarModalDatos() {
    const nombre = document.getElementById("nombre").value.trim();
    const telefono = document.getElementById("telefono").value.trim();

    // Validar que ambos campos estén llenos y que el teléfono tenga 10 dígitos
    if (nombre && telefono.length === 10) {
        // Guardar los datos en localStorage
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



// HABILITAR EL BOTÓN DE "FINALIZAR COMPRA"
function habilitarBotonFinalizar() {
    const direccion = document.getElementById("direccion").value; // Obtener la dirección ingresada

    if (direccion) { // Verificar si se ha ingresado una dirección
        // Mostrar el botón de "Finalizar compra"
        const btnFinalizar = document.getElementById('btnFinalizar');
        btnFinalizar.style.display = 'inline-block'; // Mostrar botón de finalizar
        
        // Asignar evento para mostrar el modal cuando se haga clic
        btnFinalizar.addEventListener('click', mostrarModalFin);

        // Agregar eventos para monitorear los cambios en el nombre y teléfono
        monitorearCambios();
    } else {
        // Si no se ha ingresado una dirección, mostrar un mensaje de alerta
        alert("Por favor, selecciona tu ubicación.");
    }
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

// FUNCIÓN PARA GUARDAR LA DIRECCIÓN Y LAS COORDENADAS EN EL LOCALSTORAGE
function guardarDatos() {
    const direccion = document.getElementById("direccion").value;
    const puntoReferencia = document.getElementById("Punto_de_referencia").value;

    // Guardar la dirección y punto de referencia
    localStorage.setItem('ubicacion', direccion);
    localStorage.setItem('Punto_de_referencia', puntoReferencia);

    // Guardar las coordenadas en localStorage si están disponibles
    const latitud = marker.getPosition().lat();  // Obtener latitud del marcador
    const longitud = marker.getPosition().lng();  // Obtener longitud del marcador

    localStorage.setItem('latitud', latitud);  // Guardar latitud en localStorage
    localStorage.setItem('longitud', longitud);  // Guardar longitud en localStorage
}













function finalizarCompra() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    if (cartItems.length === 0) {
        alert("El carrito está vacío. No se puede finalizar la compra.");
        return;
    }

    // Obtener fecha y hora actuales
    const fechaActual = new Date();
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); // Los meses son base 0
    const anio = fechaActual.getFullYear();
    const fecha = `${dia}/${mes}/${anio}`;

    const hora = fechaActual.toLocaleTimeString('es-ES', { hour12: false }); // Formato 24 horas

// Crear el bloque de texto con los productos seleccionados
let messageProducts = cartItems.map(item => 
    `*${item.name} - $${formatNumber(parseFloat(item.price) || 0)} x ${item.quantity} = $${formatNumber(parseFloat(item.price) * item.quantity)}*` +  // Total de cada producto
    `\n   _${item.instructions || ''}_`  // Instrucciones del producto
).join('\n');

    const totalProductos = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
    const costoDomicilio = parseFloat(localStorage.getItem('costoDomicilio') || 0);
    const totalFinal = totalProductos + costoDomicilio;

    const metodoPago = localStorage.getItem('metodoPago') || 'No seleccionado';
    const ubicacion = localStorage.getItem('ubicacion') || document.getElementById('direccion').value || "Ubicación no disponible";
    const puntoDeReferencia = document.getElementById('Punto_de_referencia').value || "Ninguno";

    // Obtener las coordenadas de latitud y longitud
    const latitud = localStorage.getItem('latitud');
    const longitud = localStorage.getItem('longitud');

    // Verificar si las coordenadas están disponibles
    if (!latitud || !longitud) {
        alert("Las coordenadas no están disponibles.");
        return;
    }

    // Crear el enlace de Google Maps con las coordenadas de la ubicación
    const googleMapsLink = `https://www.google.com/maps?q=${latitud},${longitud}`;

    const nombre = localStorage.getItem('nombre') || "Nombre no proporcionado";
    let telefono = localStorage.getItem('telefono') || "Teléfono no proporcionado";

    // Formatear el número telefónico con el patrón 000 000 0000
    telefono = telefono.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');

    // Generar el mensaje para WhatsApp
    const whatsappMessage = `
*DOMICILIO*

*FECHA:* ${fecha}
*HORA:* ${hora}

*DATOS DEL USUARIO:*
*NOMBRE:* ${nombre}
*TELÉFONO:* ${telefono}

*DIRECCIÓN:*
${ubicacion}

*PUNTO DE REFERENCIA:*
${puntoDeReferencia}

*PRODUCTOS SELECCIONADOS:*

${messageProducts}

TOTAL PRODUCTOS: $${formatNumber(totalProductos)}
COSTO DE DOMICILIO: $${formatNumber(costoDomicilio)}

*TOTAL A PAGAR: $${formatNumber(totalFinal)}*
MÉTODO DE PAGO: *${metodoPago}*

*Ubicación en Google Maps:*
${googleMapsLink}`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/3022666530?text=${encodedMessage}`, '_blank');

    // Mostrar el modal tras finalizar la compra
    mostrarModalFin();
}









// MOSTRAR EL MODAL DE FINALIZACIÓN DE COMPRA
function mostrarModalFin() {
    const modalFin = document.getElementById('compraFinalizadaModal');
    modalFin.style.display = 'flex'; // Mostrar el modal
}

// CERRAR EL MODAL DE FINALIZACIÓN DE COMPRA
function cerrarModalFin() {
    const modalFin = document.getElementById('compraFinalizadaModal');
    modalFin.style.display = 'none'; // Ocultar el modal
}

// REDIRIGIR AL INICIO Y LIMPIAR EL ESTADO
function volverAlInicioFin() {
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



// ASIGNAR EVENTOS PARA EL MODAL
document.querySelector('.closefin').addEventListener('click', cerrarModalFin);
document.getElementById('volverIniciofin').addEventListener('click', volverAlInicioFin);

// Cerrar el modal al hacer clic fuera de él
window.addEventListener('click', (event) => {
    const modalFin = document.getElementById('compraFinalizadaModal');
    if (event.target === modalFin) {
        cerrarModalFin();
    }
});













