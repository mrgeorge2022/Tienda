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


















// Inicializar el mapa con Leaflet.js
const map = L.map('map').setView([10.3993728, -75.5620067], 12); // Cambiar el nivel de zoom a 10

// Cargar los tiles de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Agregar el control de pantalla completa con clase personalizada
const fullscreenControl = L.control.fullscreen({ position: 'bottomright' }).addTo(map).getContainer().classList.add('custom-control');

// Coordenadas del área de Cartagena
const cartagenaCoords = [
    [10.490, -75.590],//equina superior izquierda
    [10.490, -75.430],//esquina superior derecha
    [10.310, -75.430], // esquina inferior derecha
    [10.400
        , -75.590] // esquina inferior izquierda
];

// Dibujar el polígono en el mapa
const cartagenaPolygon = L.polygon(cartagenaCoords, {
    color: 'none', // color de
    fillColor: 'none', // color de relleno
    fillOpacity: 0.1
}).addTo(map);

// Restringir la vista del mapa al área de Cartagena
map.setMaxBounds(cartagenaCoords);

// Establecer el nivel mínimo de zoom
map.setMinZoom(11);

// Crear un ícono de marcador rojo
const redIcon = L.icon({
    iconUrl: 'img/iconos/iconubi.png', // Ruta a la imagen del marcador rojo
    iconSize: [25, 37], // Tamaño del ícono
    iconAnchor: [12, 41], // Punto de anclaje del ícono
    popupAnchor: [1, -34] // Punto de anclaje del popup
});

// Agregar un marcador en el centro con opción de arrastrar y clickeable
const marker = L.marker([10.3910, -75.4796], { draggable: true, icon: redIcon }).addTo(map)
    .bindPopup("Haz clic o arrastra el marcador")
    .openPopup();

// Coordenadas de la tienda
const tiendaLatLng = [10.373781, -75.473558];

// Agregar una imagen al mapa en una coordenada exacta
const imageUrl = 'img/iconos/icono_tienda.png'; // Reemplaza con la URL de tu imagen
const imageIcon = L.icon({
    iconUrl: imageUrl,
    iconSize: [35, 35], // Ajusta el tamaño de la imagen
    iconAnchor: [25, 25], // Punto de anclaje de la imagen
    popupAnchor: [0, -25] // Punto de anclaje del popup
});
L.marker(tiendaLatLng, { icon: imageIcon }).addTo(map).bindPopup("Tienda");

// Inicializar el control de ruta sin waypoints y cambiar el color de la ruta
let routingControl = L.Routing.control({
    routeWhileDragging: true,
    createMarker: function() { return null; }, // Ocultar los marcadores de ruta
    show: false, // Ocultar el panel de instrucciones
    lineOptions: {
        styles: [{ color: 'blue', opacity: 0.7, weight: 4 }] // Cambiar el color de la ruta a azul
    }
}).addTo(map);

// Ocultar el contenedor de rutas
const routingContainer = document.querySelector('.leaflet-routing-container');
if (routingContainer) {
    routingContainer.classList.add('hidden');
}



// Evento de arrastrar el marcador
marker.on('dragend', function() {
    const position = marker.getLatLng();
    if (!cartagenaPolygon.getBounds().contains(position)) {
        marker.setLatLng([10.3910, -75.4796]); // Volver a la posición inicial si está fuera de los límites
        alert("El marcador no puede salir del área de Cartagena.");
    } else {
        console.log(`Nueva posición: ${position.lat}, ${position.lng}`);
        actualizarInputConBarrioCercano(position.lat, position.lng, function(barrio) {
            marker.setPopupContent(`Barrio: ${barrio}<br>Lat: ${position.lat.toFixed(6)}, Lon: ${position.lng.toFixed(6)}`).openPopup();
            actualizarRuta(position.lat, position.lng);
        });
    }
});

// Evento de clic en el marcador para mostrar ubicación exacta
marker.on('click', function() {
    const position = marker.getLatLng();
    actualizarInputConBarrioCercano(position.lat, position.lng, function(barrio) {
        marker.bindPopup(`Barrio: ${barrio}<br>Lat: ${position.lat.toFixed(6)}<br>Lon: ${position.lng.toFixed(6)}`)
            .openPopup();
        actualizarRuta(position.lat, position.lng);
    });
});

// Evento de clic en el mapa para mover el marcador a la ubicación seleccionada
map.on('click', function(event) {
    const { lat, lng } = event.latlng;
    if (cartagenaPolygon.getBounds().contains([lat, lng])) {
        marker.setLatLng([lat, lng]);
        actualizarInputConBarrioCercano(lat, lng, function(barrio) {
            marker.bindPopup(`Barrio: ${barrio}<br>Lat: ${lat.toFixed(6)}<br>Lon: ${lng.toFixed(6)}`)
                .openPopup();
            actualizarRuta(lat, lng);
        });
    } else {
        alert("El marcador no puede salir del área de Cartagena.");
    }
});



// Función para actualizar el input con las coordenadas
function actualizarInputConCoordenadas(lat, lon) {
    document.getElementById("direccion").value = `Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}`;
    localStorage.setItem('latitud', lat);
    localStorage.setItem('longitud', lon);
}

// Función para actualizar el input con el barrio más cercano utilizando la API de Nominatim
function actualizarInputConBarrioCercano(lat, lon, callback) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`)
        .then(response => response.json())
        .then(data => {
            let barrio = '';
            if (data.address) {
                if (data.address.suburb) {
                    barrio = data.address.suburb;
                } else if (data.address.neighbourhood) {
                    barrio = data.address.neighbourhood;
                } else if (data.address.city_district) {
                    barrio = data.address.city_district;
                } else if (data.address.town) {
                    barrio = data.address.town;
                } else if (data.address.village) {
                    barrio = data.address.village;
                }
            }
            if (barrio) {
                document.getElementById("direccion").value = barrio;
            } else {
                actualizarInputConCoordenadas(lat, lon);
            }
            if (callback) callback(barrio);
        })
        .catch(error => {
            console.error('Error al obtener la información del barrio:', error);
            actualizarInputConCoordenadas(lat, lon);
            if (callback) callback('');
        });
}

// Función para actualizar la ruta
function actualizarRuta(lat, lon) {
    routingControl.setWaypoints([
        L.latLng(tiendaLatLng),
        L.latLng(lat, lon)
    ]);

    routingControl.on('routesfound', function(e) {
        const routes = e.routes;
        const distance = routes[0].summary.totalDistance; // Distancia en metros
        const costoEnvio = calcularCostoEnvio(distance);
        document.getElementById("costo-envio").textContent = `Domicilio: ${formatCurrency(costoEnvio)}`;
        localStorage.setItem('costoDomicilio', costoEnvio); // Guardar el costo del domicilio en el localStorage
        actualizarTotalPago(costoEnvio);
    });
}

// Función para calcular el costo del envío basado en la distancia
function calcularCostoEnvio(distance) {
    const costoPorKm = 1653; // Costo por kilómetro
    const distanceKm = distance / 1000; // Convertir metros a kilómetros
    let costoEnvio = Math.round(costoPorKm * distanceKm);

    // Aplicar límites de costo
    if (costoEnvio < 3000) {
        costoEnvio = 3000;
    } else if (costoEnvio > 20000) {
        costoEnvio = 20000;
    }

    // Redondear a miles
    costoEnvio = Math.round(costoEnvio / 1000) * 1000;

    return costoEnvio;
}

// Función para formatear números como moneda en pesos colombianos
function formatCurrency(value) {
    return `$${value.toLocaleString('es-CO')}`;
}

// Función para actualizar el total a pagar
function actualizarTotalPago(costoEnvio) {
    const costoProductos = obtenerCostoProductos(); // Obtener el costo real de los productos
    const totalPago = costoEnvio + costoProductos;
    document.getElementById("total-pago").textContent = `TOTAL: ${formatCurrency(totalPago)}`;
}

// Función para obtener el costo real de los productos en el carrito
function obtenerCostoProductos() {
    const totalCarrito = localStorage.getItem('totalCarrito');
    return totalCarrito ? parseFloat(totalCarrito) : 0;
}

// Evento de entrada en el input de texto para buscar barrios
document.getElementById("direccion").addEventListener("input", filtrarBarrios);

// Función para actualizar el carrito
function actualizarCarrito() {
    const costoEnvio = 0; // Ejemplo de costo de envío
    const costoProductos = obtenerCostoProductos(); // Obtener el costo real de los productos
    const totalPago = costoEnvio + costoProductos;

    document.getElementById("costo-envio").textContent = `Domicilio: ${formatCurrency(costoEnvio)}`;
    document.getElementById("costo-productos").textContent = `Productos: ${formatCurrency(costoProductos)}`;
    document.getElementById("total-pago").textContent = `TOTAL: ${formatCurrency(totalPago)}`;
}

// Llamar a la función para actualizar el carrito al cargar la página
window.addEventListener('load', actualizarCarrito);

// Llamar a la función para actualizar el carrito cuando se añada o elimine un producto
window.addEventListener('storage', actualizarCarrito);


// Lista de barrios predefinidos de Cartagena en orden alfabético con coordenadas
const barriosCartagena = [
    { "nombre": "13 DE JUNIO", "lat": 10.4037266, "lon": -75.4879953 },
    { "nombre": "20 DE JULIO", "lat": 10.3749516, "lon": -75.5006668 },
    { "nombre": "7 DE AGOSTO", "lat": 10.4007794, "lon": -75.5018699 },
    { "nombre": "ALAMEDA LA VICTORIA", "lat": 10.3791826, "lon": -75.4769453 },
    { "nombre": "ALBORNOZ", "lat": 10.358810, "lon": -75.508105 },
    { "nombre": "ALCIBIA", "lat": 10.411365, "lon": -75.516892 },
    { "nombre": "ALMIRANTE COLON", "lat": 10.387142, "lon": -75.495863 },
    { "nombre": "ALTO BOSQUE", "lat": 10.3903451, "lon": -75.5207063 },
    { "nombre": "ALTOS DE SAN ISIDRO", "lat": 10.3931686, "lon": -75.512303 },
    { "nombre": "AMBERES", "lat": 10.407023, "lon": -75.5167363 },
    { "nombre": "ANITA", "lat": 10.394817, "lon": -75.473328 },
    { "nombre": "ANTONIO JOSE DE SUCRE", "lat": 10.3722948, "lon": -75.5046559 },
    { "nombre": "ARMENIA", "lat": 10.4062931, "lon": -75.5080387 },
    { "nombre": "BELLAVISTA", "lat": 10.376461, "lon": -75.502243 },
    { "nombre": "BLAS DE LEZO", "lat": 10.387031, "lon": -75.485765 },
    { "nombre": "BOCAGRANDE", "lat": 10.405891, "lon": -75.552825 },
    { "nombre": "BOSQUECITO", "lat": 10.391857, "lon": -75.514306 },
    { "nombre": "BOSTON", "lat": 10.4108684, "lon": -75.5154435 },
    { "nombre": "BRUSELAS", "lat": 10.4047899, "lon": -75.5207842 },
    { "nombre": "CALAMARES", "lat": 10.3945605, "lon": -75.4967836 },
    { "nombre": "CAMAGUEY", "lat": 10.394539, "lon": -75.494286 },
    { "nombre": "CAMILO TORRES", "lat": 10.372893, "lon": -75.479075 },
    { "nombre": "CANAPOTE", "lat": 10.439959, "lon": -75.521436 },
    { "nombre": "CASTILLOGRANDE", "lat": 10.394448, "lon": -75.551608 },
    { "nombre": "CEBALLOS", "lat": 10.387307, "lon": -75.504192 },
    { "nombre": "CENTRO", "lat": 10.422906, "lon": -75.5521903 },
    { "nombre": "CESAR FLOREZ", "lat": 10.376401, "lon": -75.473555 },
    { "nombre": "CHAMBACU", "lat": 10.426481, "lon": -75.541073 },
    { "nombre": "CHIQUINQUIRA", "lat": 10.403887, "lon": -75.492022 },
    { "nombre": "CIUDAD BICENTENARIO", "lat": 10.424804, "lon": -75.447705 },
    { "nombre": "CIUDADELA 2000", "lat": 10.372117, "lon": -75.472351 },
    { "nombre": "CRESPO", "lat": 10.446100, "lon": -75.517723 },
    { "nombre": "EL BOSQUE", "lat": 10.399689, "lon": -75.521158 },
    { "nombre": "EL CABRERO", "lat": 10.432750, "lon": -75.541469 },
    { "nombre": "EL CAMPESTRE", "lat": 10.3799354, "lon": -75.4969239 },
    { "nombre": "EL CARMELO", "lat": 10.3799691, "lon": -75.4884188 },
    { "nombre": "EL COUNTRY", "lat": 10.390250, "lon": -75.497403 },
    { "nombre": "EL EDUCADOR", "lat": 10.3749419, "lon": -75.4831604 },
    { "nombre": "EL GALLO", "lat": 10.3957709, "lon": -75.476628 },
    { "nombre": "EL LAGUITO", "lat": 10.395596, "lon": -75.562828 },
    { "nombre": "EL POZON", "lat": 10.4058351, "lon": -75.4559939 },
    { "nombre": "EL PRADO", "lat": 10.3995144, "lon": -75.5187062 },
    { "nombre": "EL RECREO", "lat": 10.3872453, "lon": -75.4731004 },
    { "nombre": "EL REPOSO", "lat": 10.3699058, "lon": -75.4833955 },
    { "nombre": "EL RUBI", "lat": 10.3922534, "lon": -75.4866898 },
    { "nombre": "EL SOCORRO", "lat": 10.3826749, "lon": -75.4805847 },
    { "nombre": "ESCALLON VILLA", "lat": 10.4033999, "lon": -75.4975375 },
    { "nombre": "ESPAÑA", "lat": 10.4078959, "lon": -75.51271 },
    { "nombre": "ESPINAL", "lat": 10.4245276, "lon": -75.5387966 },
    { "nombre": "FREDONIA", "lat": 10.4025103, "lon": -75.4743761 },
    { "nombre": "GETSEMANI", "lat": 10.4220621, "lon": -75.5462784 },
    { "nombre": "HENEQUEN", "lat": 10.3667403, "lon": -75.4952979 },
    { "nombre": "JOSE ANTONIO GALAN", "lat": 10.4005054, "lon": -75.5111283 },
    { "nombre": "JUAN XXIII", "lat": 10.3998149, "lon": -75.5161146 },
    { "nombre": "JUNIN", "lat": 10.4053328, "lon": -75.5103871 },
    { "nombre": "LA BOQUILLA", "lat": 10.4795548, "lon": -75.4914976 },
    { "nombre": "LA CAMPIÑA", "lat": 10.393008, "lon": -75.501799 },
    { "nombre": "LA CANDELARIA", "lat": 10.409656, "lon": -75.5147479 },
    { "nombre": "LA CAROLINA", "lat": 10.3981671, "lon": -75.463544 },
    { "nombre": "LA CASTELLANA", "lat": 10.3943422, "lon": -75.4870679 },
    { "nombre": "LA CONCEPCION", "lat": 10.3923316, "lon": -75.4749581 },
    { "nombre": "LA CONSOLATA", "lat": 10.3772673, "lon": -75.4803556 },
    { "nombre": "LA FLORESTA", "lat": 10.3986099, "lon": -75.4879327 },
    { "nombre": "LA MARIA", "lat": 10.4196885, "lon": -75.5197706 },
    { "nombre": "LA MATUNA", "lat": 10.4260029, "lon": -75.5446837 },
    { "nombre": "LA PAZ", "lat": 10.4266349, "lon": -75.5200058 },
    { "nombre": "LA QUINTA", "lat": 10.4154697, "lon": -75.5263495 },
    { "nombre": "LA SIERRITA", "lat": 10.3687766, "lon": -75.4742395 },
    { "nombre": "LA VICTORIA", "lat": 10.3780343, "lon": -75.4840456 },
    { "nombre": "LAS DELICIAS", "lat": 10.3919565, "lon": -75.486281 },
    { "nombre": "LAS GAVIOTAS", "lat": 10.3979513, "lon": -75.4928545 },
    { "nombre": "LAS PALMERAS", "lat": 10.4009203, "lon": -75.4750055 },
    { "nombre": "LIBANO", "lat": 10.4075717, "lon": -75.507711 },
    { "nombre": "LO AMADOR", "lat": 10.4220915, "lon": -75.5334753 },
{ "nombre": "LOS ALPES", "lat": 10.3969992, "lon": -75.4788781 },
{ "nombre": "LOS ANGELES", "lat": 10.3950913, "lon": -75.4906405 },
{ "nombre": "LOS CARACOLES", "lat": 10.3900563, "lon": -75.4922707 },
{ "nombre": "LOS CERROS", "lat": 10.3953755, "lon": -75.5175767 },
{ "nombre": "LOS COMUNEROS", "lat": 10.4375132, "lon": -75.520237 },
{ "nombre": "LOS CORALES", "lat": 10.3887831, "lon": -75.5010197 },
{ "nombre": "LOS EJECUTIVOS", "lat": 10.3986137, "lon": -75.4935784 },
{ "nombre": "LOS JARDINES", "lat": 10.3760225, "lon": -75.4842346 },
{ "nombre": "LOS SANTANDERES", "lat": 10.3877703, "lon": -75.5056651 },
{ "nombre": "LUIS CARLOS GALAN", "lat": 10.375871, "lon": -75.4944876 },
{ "nombre": "MANGA", "lat": 10.4123522, "lon": -75.5356003 },
{ "nombre": "MARBELLA", "lat": 10.4395122, "lon": -75.5304071 },
{ "nombre": "MARIA CANO", "lat": 10.3747031, "lon": -75.4798621 },
{ "nombre": "MARTINEZ MARTELO", "lat": 10.4083077, "lon": -75.5213923 },
{ "nombre": "NARIÑO", "lat": 10.4294961, "lon": -75.5341587 },
{ "nombre": "NELSON MANDELA", "lat": 10.3677945, "lon": -75.4755481 },
{ "nombre": "NUEVA GRANADA", "lat": 10.3943748, "lon": -75.5066559 },
{ "nombre": "NUEVE DE ABRIL", "lat": 10.3978513, "lon": -75.5063111 },
{ "nombre": "NUEVO BOSQUE", "lat": 10.3884296, "lon": -75.5031932 },
{ "nombre": "NUEVO PORVENIR", "lat": 10.4017736, "lon": -75.4751901 },
{ "nombre": "OLAYA ST. CENTRAL", "lat": 10.4016596, "lon": -75.4903776 },
{ "nombre": "OLAYA ST. Estela", "lat": 10.4059385, "lon": -75.4849565 },
{ "nombre": "OLAYA ST. LA MAGDALENA", "lat": 10.4061142, "lon": -75.4810257 },
{ "nombre": "OLAYA ST. LA PUNTILLA", "lat": 10.4061351, "lon": -75.4832572 },
{ "nombre": "OLAYA ST. RAFAEL NUÑEZ", "lat": 10.4094068, "lon": -75.5060581 },
{ "nombre": "OLAYA ST. RICAURTE", "lat": 10.4048913, "lon": -75.4790955 },
{ "nombre": "OLAYA ST.11 DE NOVIEMBRE", "lat": 10.4091415, "lon": -75.4953191 },
{ "nombre": "PABLO VI - II", "lat": 10.4339086, "lon": -75.5267787 },
{ "nombre": "PALESTINA", "lat": 10.4342349, "lon": -75.5216256 },
{ "nombre": "PARAGUAY", "lat": 10.401994, "lon": -75.5193511 },
{ "nombre": "PEDRO SALAZAR", "lat": 10.4369705, "lon": -75.527192 },
{ "nombre": "PETARES", "lat": 10.4350261, "lon": -75.5287511 },
{ "nombre": "PIE DE LA POPA", "lat": 10.4197881, "lon": -75.5319991 },
{ "nombre": "PIE DEL CERRO", "lat": 10.4211255, "lon": -75.5384216 },
{ "nombre": "PIEDRA DE BOLIVAR", "lat": 10.4051009, "lon": -75.5075545 },
{ "nombre": "PROVIDENCIA", "lat": 10.3923316, "lon": -75.4749581 },
{ "nombre": "RECREO", "lat": 10.3872453, "lon": -75.4731004 },
{ "nombre": "REPUBLICA DE CHILE", "lat": 10.3968171, "lon": -75.5178692 },
{ "nombre": "REPUBLICA DE VENEZUELA", "lat": 10.4002924, "lon": -75.4936718 },
{ "nombre": "ROSSEDAL", "lat": 10.3726834, "lon": -75.4814671 },
{ "nombre": "SAN ANTONIO", "lat": 10.395484, "lon": -75.4906573 },
{ "nombre": "SAN DIEGO", "lat": 10.4268463, "lon": -75.5473659 },
{ "nombre": "SAN FERNANDO", "lat": 10.3791777, "lon": -75.476848 },
{ "nombre": "SAN FRANCISCO", "lat": 10.4369621, "lon": -75.5154309 },
{ "nombre": "SAN ISIDRO", "lat": 10.3894771, "lon": -75.5052676 },
{ "nombre": "SAN JOSE DE LOS CAMPANOS", "lat": 10.3839754, "lon": -75.4616423 },
{ "nombre": "SAN PEDRO", "lat": 10.3919612, "lon": -75.485742 },
{ "nombre": "SAN PEDRO MARTIR", "lat": 10.3797544, "lon": -75.4864726 },
{ "nombre": "SAN PEDRO Y LIBERTAD", "lat": 10.4353034, "lon": -75.5290032 },
{ "nombre": "SANTA CLARA", "lat": 10.3818484, "lon": -75.5015975 },
{ "nombre": "SANTA LUCIA", "lat": 10.3945593, "lon": -75.4798974 },
{ "nombre": "SANTA MARIA", "lat": 10.4374815, "lon": -75.5189223 },
{ "nombre": "SANTA MONICA", "lat": 10.3905247, "lon": -75.4788541 },
{ "nombre": "SECTORES UNIDOS", "lat": 10.3698626, "lon": -75.4777117 },
{ "nombre": "TACARIGUA", "lat": 10.39071, "lon": -75.4903781 },
{ "nombre": "TERNERA", "lat": 10.3835112, "lon": -75.4676809 },
{ "nombre": "TESCA", "lat": 10.4066354, "lon": -75.4911371 },
{ "nombre": "TORICES", "lat": 10.4297104, "lon": -75.5373685 },
{ "nombre": "URBANIZACION COLOMBIATON", "lat": 10.4151485, "lon": -75.4442429 },
{ "nombre": "URBANIZACION SIMON BOLIVAR", "lat": 10.378948, "lon": -75.4656564 },
{ "nombre": "VIEJO PORVENIR", "lat": 10.3986145, "lon": -75.4796529 },
{ "nombre": "VILLA BARRAZA", "lat": 10.3695829, "lon": -75.5064084 },
{ "nombre": "VILLA ESTRELLA", "lat": 10.4019641, "lon": -75.4625122 },
{ "nombre": "VILLA FANNY", "lat": 10.370144, "lon": -75.4766714 },
{ "nombre": "VILLA OLIMPICA", "lat": 10.4035276, "lon": -75.4968093 },
{ "nombre": "VILLA ROSITA", "lat": 10.3984574, "lon": -75.4706008 },
{ "nombre": "VILLA RUBIA", "lat": 10.3755573, "lon": -75.4787337 },
{ "nombre": "VILLA SANDRA", "lat": 10.3934867, "lon": -75.4892745 },
{ "nombre": "VILLAS DE LA CANDELARIA", "lat": 10.4021184, "lon": -75.4617875 },
{ "nombre": "VISTA HERMOSA", "lat": 10.3800563, "lon": -75.5023808 },
{ "nombre": "ZAPATERO", "lat": 10.388979, "lon": -75.5223224 },
{ "nombre": "ZARAGOCILLA", "lat": 10.4001171, "lon": -75.500964 },
].sort((a, b) => a.nombre.localeCompare(b.nombre));

// Filtrar y mostrar barrios en la lista de sugerencias
function filtrarBarrios() {
    const input = document.getElementById("direccion").value.toLowerCase();
    const sugerencias = document.getElementById("sugerencias");
    sugerencias.innerHTML = "";

    if (input.length === 0) {
        sugerencias.style.display = "none";
        return;
    }

    const fragment = document.createDocumentFragment();
    barriosCartagena.forEach(barrio => {
        if (barrio.nombre.toLowerCase().includes(input)) {
            const li = document.createElement("li");
            li.textContent = barrio.nombre;
            li.onclick = function () {
                document.getElementById("direccion").value = barrio.nombre;
                sugerencias.style.display = "none";
                ubicarBarrioEnMapa(barrio.lat, barrio.lon, barrio.nombre);
            };
            fragment.appendChild(li);
        }
    });

    sugerencias.appendChild(fragment);
    sugerencias.style.display = "block";
}

// Buscar barrios utilizando la API de Nominatim
function buscarBarrio(query) {
    fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${query}, Cartagena, Bolívar&addressdetails=1`)
        .then(response => response.json())
        .then(data => {
            const sugerencias = document.getElementById("sugerencias");
            sugerencias.innerHTML = "";

            if (data.length === 0) {
                sugerencias.style.display = "none";
                return;
            }

            const fragment = document.createDocumentFragment();
            data.forEach(item => {
                if (item.address.suburb || item.address.neighbourhood) {
                    const nombreBarrio = item.address.suburb || item.address.neighbourhood;
                    const { lat, lon } = item;

                    const li = document.createElement("li");
                    li.textContent = nombreBarrio;
                    li.onclick = function () {
                        document.getElementById("direccion").value = nombreBarrio;
                        sugerencias.style.display = "none";
                        ubicarBarrioEnMapa(lat, lon, nombreBarrio);
                    };
                    fragment.appendChild(li);
                }
            });

            sugerencias.appendChild(fragment);
            sugerencias.style.display = "block";
        })
        .catch(error => {
            console.error('Error al buscar barrios:', error);
        });
}

// Ubicar el barrio en el mapa y colocar marcador
function ubicarBarrioEnMapa(lat, lon, nombre) {
    if (cartagenaPolygon.getBounds().contains([lat, lon])) {
        map.setView([lat, lon], 15);
        marker.setLatLng([lat, lon]).bindPopup("Barrio seleccionado").openPopup();
        document.getElementById("direccion").value = nombre;
        actualizarRuta(lat, lon);
    } else {
        alert("El marcador no puede salir del área de Cartagena.");
    }
}

// Función para mostrar la lista de sugerencias
function mostrarSugerencias() {
    const sugerencias = document.getElementById('sugerencias');
    const direccion = document.getElementById('direccion').value;

    if (direccion.length > 0) {
        // Aquí puedes agregar lógica para llenar la lista de sugerencias
        // Por ejemplo, puedes agregar elementos de lista (li) dinámicamente
        sugerencias.innerHTML = `
            <li>Sugerencia 1</li>
            <li>Sugerencia 2</li>
            <li>Sugerencia 3</li>
        `;
        sugerencias.style.display = 'block'; // Mostrar la lista de sugerencias
    } else {
        sugerencias.style.display = 'none'; // Ocultar la lista de sugerencias
    }
}

// Función para borrar el contenido de un campo de texto
function borrarTexto(campoId) {
    document.getElementById(campoId).value = '';
    const sugerencias = document.getElementById('sugerencias');
    sugerencias.style.display = 'none'; // Ocultar la lista de sugerencias
}

// Función para borrar el contenido de un campo de texto
function borrarTexto(campoId) {
    document.getElementById(campoId).value = '';
    const sugerencias = document.getElementById('sugerencias');
    sugerencias.classList.remove('show');
}


// Función para obtener la ubicación actual
function usarUbicacionActual() {
    navigator.geolocation.getCurrentPosition(position => {
        const coords = [position.coords.latitude, position.coords.longitude];
        if (cartagenaPolygon.getBounds().contains(coords)) {
            map.setView(coords, 15);
            marker.setLatLng(coords);
            console.log(`Ubicación actual: ${coords[0]}, ${coords[1]}`);
            actualizarInputConCoordenadas(coords[0], coords[1]);
            actualizarInputConBarrioCercano(coords[0], coords[1]);
            actualizarRuta(coords[0], coords[1]);
        } else {
            alert("Ubicación fuera de los límites permitidos.");
        }
    }, () => alert("No se pudo obtener la ubicación."));
}




// Función al dar clic en "¡Listo!"
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

// Función para abrir el modal de datos personales cuando se hace clic en "¡Listo!"
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

    document.getElementById('datospersonales').classList.add('active');

    // Monitorear cambios en los campos de nombre y teléfono
    monitorearCambios();
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

// Función para manejar la validación y habilitar el botón "Finalizar Compra" si los datos son válidos
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

// Función para borrar el contenido de un campo de texto
function borrarTexto(campoId) {
    document.getElementById(campoId).value = '';
}



// Función para guardar la dirección y las coordenadas en el localStorage
function guardarDatos() {
    const direccion = document.getElementById("direccion").value;
    const coords = marker.getLatLng();
    localStorage.setItem('direccion', direccion);
    localStorage.setItem('latitud', coords.lat);
    localStorage.setItem('longitud', coords.lng);
}

// Función para guardar los datos personales en el localStorage
function guardarDatosPersonales() {
    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;
    localStorage.setItem('nombre', nombre);
    localStorage.setItem('telefono', telefono);
    cerrarModaldatospersonales();
}




// Función para habilitar el botón "Finalizar Compra"
function habilitarBotonFinalizar() {
    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();

    if (nombre && telefono) {
        // Mostrar el botón de "Finalizar Compra"
        const btnFinalizar = document.getElementById('btnFinalizar');
        btnFinalizar.style.display = 'inline-block'; // Mostrar botón de finalizar
    } else {
        // Si no se ha ingresado nombre o teléfono, ocultar el botón de "Finalizar Compra"
        const btnFinalizar = document.getElementById('btnFinalizar');
        btnFinalizar.style.display = 'none'; // Ocultar botón de finalizar
    }
}

// Función para mostrar el modal de finalización de compra
function mostrarModalFin() {
    // Lógica para mostrar el modal de finalización de compra
    document.getElementById('modalFin').classList.add('active');
}

// Definir variables globales para almacenar los datos aceptados
let nombreAceptado = '';
let telefonoAceptado = '';

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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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





// Función para finalizar la compra
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

    // Función para formatear números con puntos de mil
    function formatNumber(value) {
        return value.toLocaleString('es-CO');
    }

    const totalProductos = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
    const costoDomicilio = parseFloat(localStorage.getItem('costoDomicilio') || 0);
    const totalFinal = totalProductos + costoDomicilio;

    const metodoPago = localStorage.getItem('metodoPago') || 'No seleccionado';
    const ubicacion = localStorage.getItem('ubicacion') || document.getElementById('direccion').value || "Ubicación no disponible";
    const puntoDeReferencia = document.getElementById('Punto_de_referencia').value || "No proporcionado";

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


        // Generar el número de factura único
        const numeroFactura = generarNumeroFactura();
    
        // Guardar el número de factura en localStorage
        localStorage.setItem('numeroFactura', numeroFactura);

    // Generar el mensaje para WhatsApp
    const whatsappMessage = `
*DOMICILIO*

*FACTURA Nº:* #${numeroFactura}

*FECHA:* ${fecha}
*HORA:* ${hora}

*DATOS DEL USUARIO:*
*NOMBRE:* ${nombre}
*TELÉFONO:* ${telefono}

*DIRECCIÓN:* ${ubicacion}

*PUNTO DE REFERENCIA:* ${puntoDeReferencia}

*PRODUCTOS SELECCIONADOS:*

${messageProducts}

TOTAL PRODUCTOS: $${formatNumber(totalProductos)}
COSTO DE DOMICILIO: $${formatNumber(costoDomicilio)}

*TOTAL A PAGAR: $${formatNumber(totalFinal)}*
MÉTODO DE PAGO: *${metodoPago}*

*Ubicación en Google Maps:*
${googleMapsLink}



*Envía tu pedido aqui ----->*`;



    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/3022666530?text=${encodedMessage}`, '_blank');

    // Mostrar el modal tras finalizar la compra
    mostrarModalFin();

    // Mostrar el botón de imprimir en el modal
    const imprimirBtn = document.getElementById('imprimirFacturaBtn');
    imprimirBtn.style.display = 'inline-block';  // Mostrar el botón de imprimir factura
}


// Función para mostrar el modal de finalización de compra
function mostrarModalFin() {
    const modalFin = document.getElementById('compraFinalizadaModal');
    modalFin.style.display = 'flex'; // Mostrar el modal
}

// Función para cerrar el modal de finalización de compra
function cerrarModalFin() {
    const modalFin = document.getElementById('compraFinalizadaModal');
    modalFin.style.display = 'none'; // Ocultar el modal
}

// Función para redirigir al inicio y limpiar el estado
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

// Asignar eventos para el modal
document.querySelector('.closefin').addEventListener('click', cerrarModalFin);
document.getElementById('volverIniciofin').addEventListener('click', volverAlInicioFin);

// Cerrar el modal al hacer clic fuera de él
window.addEventListener('click', (event) => {
    const modalFin = document.getElementById('compraFinalizadaModal');
    if (event.target === modalFin) {
        cerrarModalFin();
    }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Función para imprimir la factura

function imprimirFactura() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    if (cartItems.length === 0) {
        alert("El carrito está vacío. No se puede generar la factura.");
        return;
    }

    // Obtener los datos de la compra
    const nombre = localStorage.getItem('nombre') || "Nombre no proporcionado";
    let telefono = localStorage.getItem('telefono') || "Teléfono no proporcionado";
    const metodoPago = localStorage.getItem('metodoPago') || 'No seleccionado'; // Por defecto 'No seleccionado'
    const costoDomicilio = parseFloat(localStorage.getItem('costoDomicilio') || 0);
    const totalProductos = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
    const totalFinal = totalProductos + costoDomicilio;

    // Recuperar el número de factura y la hora de la compra desde localStorage
    const numeroFactura = localStorage.getItem('numeroFactura') || "No disponible"; // Si no hay número, usar un valor predeterminado
    const horaCompra = localStorage.getItem('horaCompra') || "Hora no disponible"; // Hora exacta de la compra

    // Formatear el número telefónico con el patrón 000 000 0000
    telefono = telefono.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');

    // Obtener la fecha actual
    const fechaActual = new Date();
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
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

    // Obtener los datos de domicilio
    const ubicacion = localStorage.getItem('ubicacion') || document.getElementById('direccion').value || "Ubicación no disponible";
    const puntoDeReferencia = document.getElementById('Punto_de_referencia').value || "No proporcionado";




    // Generar el mensaje de la factura con el número de factura y domicilio
    let facturaTexto = `
------------------------------------------------------
<strong>MR. GEORGE - SINCE 2022</strong>
------------------------------------------------------

<strong>DOMICILIO</strong>

<strong>FACTURA Nº:</strong> #${numeroFactura}
<strong>FECHA:</strong> ${fecha}
<strong>HORA:</strong> ${horaCompra}

<strong>DATOS DEL USUARIO:</strong>
<strong>Nombre:</strong> ${nombre}
<strong>Teléfono:</strong> ${telefono}

<strong>DIRECCIÓN:</strong> ${ubicacion}

<strong>PUNTO DE REFERENCIA:</strong> ${puntoDeReferencia}

<strong>PRODUCTOS SELECCIONADOS:</strong>

${messageProducts}

<strong>TOTAL PRODUCTOS:</strong> $${formatNumber(totalProductos)}
<strong>COSTO DE DOMICILIO:</strong> $${formatNumber(costoDomicilio)}

<strong>TOTAL A PAGAR:</strong> $${formatNumber(totalFinal)}
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



// Función para formatear números con puntos de mil
function formatNumber(value) {
    return value.toLocaleString('es-CO');
}

