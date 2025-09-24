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














// Asegúrate de que el botón esté oculto al cargar la página
window.addEventListener("load", function () {
  const scrollTopButton = document.getElementById("scrollTopButton");
  scrollTopButton.style.display = "none";
});

// Mostrar el botón al bajar más de 200px
window.addEventListener("scroll", function () {
  const scrollTopButton = document.getElementById("scrollTopButton");

  // Mostrar el botón cuando el usuario se desplace hacia abajo
  if (window.scrollY > 200) {
    scrollTopButton.style.display = "block"; // Muestra el botón
  } else {
    scrollTopButton.style.display = "none"; // Oculta el botón cuando no se ha desplazado
  }
});

// Función para desplazarse hacia arriba al hacer clic
document.getElementById("scrollTopButton").addEventListener("click", function () {
  window.scrollTo({
      top: 0,
      behavior: "smooth" // Desplazamiento suave
  });
});










// FUNCIÓN PARA BUSCAR PRODUCTOS POR NOMBRE 
function searchProducts() {
  const searchQuery = document.getElementById('search-input').value;
  displayProducts('', searchQuery); // Se pasa la consulta de búsqueda al filtro
}














// FUNCIÓN PARA FORMATEAR LOS NÚMEROS CON PUNTOS COMO SEPARADORES DE MILES
function formatNumber(number) {
  return number.toLocaleString('es-CO');}









// Función para manejar la selección de categoría
function selectCategory(category) {
  // Elimina la clase 'active' de todos los enlaces
  const links = document.querySelectorAll('nav ul li a');
  links.forEach(link => {
    link.classList.remove('active'); // Eliminar 'active' de todos los enlaces
  });

  // Añadir la clase 'active' al enlace de la categoría seleccionada
  const categoryLink = document.querySelector(`nav ul li a[onclick="displayProducts('${category}')"]`);
  if (categoryLink) {
    categoryLink.classList.add('active'); // Marca como activa la categoría seleccionada
  }

  // Guardar la categoría seleccionada en localStorage
  localStorage.setItem('selectedCategory', category);

  // Llamar a displayProducts() para mostrar los productos correspondientes
  displayProducts(category);
}

// Modificación para mostrar la categoría "todos" al recargar
document.addEventListener('DOMContentLoaded', () => {
  // Al cargar la página, seleccionamos "todos" por defecto
  const defaultCategory = 'todos';
  selectCategory(defaultCategory); // Llama a selectCategory con 'todos'
});

// Llama a esta función cada vez que se seleccione una categoría
document.querySelectorAll('nav ul li a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    let category = link.getAttribute('onclick').match(/'([^']+)'/);
    category = category ? category[1] : ''; // Extrae la categoría o asigna vacío si no tiene
    selectCategory(category); // Selecciona la categoría
  });
});










// SIMULA LA CARGA DE PRODUCTOS Y SU VISUALIZACIÓN EN LA PÁGINA PRINCIPAL

let cart = []; // Este arreglo almacenará los productos del carrito con su cantidad

// ===============================
// FUNCIÓN PARA MOSTRAR PRODUCTOS
// ===============================
function displayProducts(category = '', searchQuery = '') {
  const products = [
{ 
  id: 30, 
  image: 'img/productos/armatualmuerzo.jpg', 
  name: 'Arma tu Almuerzo', 
  category: ['todos', 'almuerzo'], 
  description: 'Arma tu almuerzo con proteína, acompañante, grano, ensalada y sopa.' 
},

  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = category ? p.category.includes(category) : true;
    const matchesSearchQuery = searchQuery ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    return matchesCategory && matchesSearchQuery;
  });

  const productList = document.getElementById('product-list');
  productList.innerHTML = '';

  filteredProducts.forEach(product => {
    const productElement = document.createElement('div');
    productElement.classList.add('product-item');
    productElement.id = `product-${product.id}`;

    productElement.onclick = function () {
      openModal(product.id);
    };

    productElement.innerHTML = `
      <div id="contenedorvacio">
        <div id="product-item">
          <img src="${product.image}" alt="${product.name}" class="product-image">
          <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
          </div>
        </div>
        <div id="botondeagregarcontendor">
          <button onclick="event.stopPropagation(); openModal(${product.id})">
            <img src="img/iconos/add.png" alt="add" id="add">
          </button>
        </div>
      </div>`;
    productList.appendChild(productElement);
  });
}

// ===============================
// FUNCIÓN PARA ABRIR EL MODAL
// ===============================
function openModal(productId) {
  const products = [
{
  id: 30,
  image: 'img/productos/armatualmuerzo.jpg',
  name: 'Arma tu Almuerzo',
  category: ['todos', 'almuerzo'],
  price: 0,
  description: 'Arma tu almuerzo con proteína, acompañante, grano, ensalada y sopa.',
  proteinaOptions: [
    { name: 'Pollo', price: 8000 },
    { name: 'Carne', price: 9000 },
    { name: 'Pescado', price: 9500 }
  ],
  acompananteOptions: [
    { name: 'Papa frita', price: 3000 },
    { name: 'Yuca al vapor', price: 2500 },
    { name: 'Patacón', price: 2000 }
  ],
  granoOptions: [
    { name: 'Arroz blanco', price: 2000 },
    { name: 'Fríjoles', price: 2500 }
  ],
  ensaladaOptions: [
    { name: 'Ensalada fresca', price: 2000 },
    { name: 'Ensalada rusa', price: 2500 }
  ],
  sopaOptions: [
    { name: 'Sopa de pollo', price: 3000 },
    { name: 'Sopa de verduras', price: 2500 }
  ]
}

  ];

  const product = products.find(p => p.id === productId);
  if (!product) return;

  document.getElementById('modal-product-name').innerText = product.name;
  document.getElementById('modal-product-image').src = product.image;
  document.getElementById('modal-product-description').innerText = product.description;

  let dynamicPrice = 0;

  // ===============================
  // FUNCIÓN PARA ACTUALIZAR PRECIO
  // ===============================
  const updatePrice = () => {
    dynamicPrice = 0;

    // Proteína
    document.querySelectorAll('#modal-size-container input[type="checkbox"]').forEach(cb => {
      if (cb.checked) {
        const opt = product.proteinaOptions.find(o => o.name === cb.value);
        if (opt) dynamicPrice += opt.price;
      }
    });

    // Acompañante
    document.querySelectorAll('#modal-flavor-container input[type="checkbox"]').forEach(cb => {
      if (cb.checked) {
        const opt = product.acompananteOptions.find(o => o.name === cb.value);
        if (opt) dynamicPrice += opt.price;
      }
    });

    // Grano
    document.querySelectorAll('#modal-checkbox-container input[type="checkbox"]').forEach(cb => {
      if (cb.checked) {
        const opt = product.granoOptions.find(o => o.name === cb.value);
        if (opt) dynamicPrice += opt.price;
      }
    });

    // Ensalada
    document.querySelectorAll('#modal-additional-container input[type="checkbox"]').forEach(cb => {
      if (cb.checked) {
        const opt = product.ensaladaOptions.find(o => o.name === cb.value);
        if (opt) dynamicPrice += opt.price;
      }
    });

    // Sopa
    document.querySelectorAll('#modal-sopa-container input[type="checkbox"]').forEach(cb => {
      if (cb.checked) {
        const opt = product.sopaOptions.find(o => o.name === cb.value);
        if (opt) dynamicPrice += opt.price;
      }
    });

    const quantity = parseInt(document.getElementById('modal-quantity').value, 10) || 1;
    const totalPrice = dynamicPrice * quantity;
    document.getElementById('modal-product-price').innerText = `${formatNumber(totalPrice)}`;
  };

  // ===============================
  // CREAR OPCIONES
  // ===============================
// ===============================
// CREAR OPCIONES CON LÍMITE DINÁMICO Y REEMPLAZO
// ===============================
const buildOptions = (containerId, options, limit = 1) => {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  let selectedOrder = []; // Guardar el orden en que se seleccionan

  options.forEach(option => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" value="${option.name}"> ${option.name}: $${formatNumber(option.price)}`;
    const input = label.querySelector('input');

    input.addEventListener('change', () => {
      if (input.checked) {
        // Agregar el nuevo seleccionado
        selectedOrder.push(input);

        if (selectedOrder.length > limit) {
          // Si supera el límite, quitar el primero (FIFO)
          const first = selectedOrder.shift();
          first.checked = false;
        }
      } else {
        // Si desmarca, sacarlo del array
        selectedOrder = selectedOrder.filter(cb => cb !== input);
      }

      updatePrice();
    });

    container.appendChild(label);
  });
};


// ===============================
// CREAR OPCIONES SEGÚN EL LÍMITE
// ===============================
buildOptions('modal-size-container', product.proteinaOptions, 1);   // Proteína → solo 1
buildOptions('modal-flavor-container', product.acompananteOptions, 1); // Acompañante → solo 1
buildOptions('modal-checkbox-container', product.granoOptions, 1); // Grano → solo 1
buildOptions('modal-additional-container', product.ensaladaOptions, 1); // Ensalada → solo 1
buildOptions('modal-sopa-container', product.sopaOptions, 1); // Sopa → solo 1


  document.getElementById('modal-quantity').value = 1;
  document.getElementById('product-modal').style.display = 'flex';
  updatePrice();
}



// FUNCIÓN PARA CERRAR EL MODAL
function closeModal() {
  document.getElementById('product-modal').style.display = 'none';
}

// CERRAR EL MODAL AL HACER CLIC FUERA DEL CONTENIDO
window.onclick = function (event) {
  const modal = document.getElementById('product-modal');
  if (event.target === modal) {
      closeModal();
  }
};



// ===============================
// FUNCIÓN PARA AGREGAR AL CARRITO
// ===============================
function addToCartFromModal() {



  const name = document.getElementById('modal-product-name').innerText;
  const price = parseInt(document.getElementById('modal-product-price').innerText.replace(/\./g, ''), 10) || 0;
  const instructions = document.getElementById('modal-product-instructions').value.trim();
  const newQuantity = parseInt(document.getElementById('modal-quantity').value, 10);
  const image = document.getElementById('modal-product-image').src;

  const proteina = Array.from(document.querySelectorAll('#modal-size-container input:checked')).map(cb => cb.value);
  if (proteina.length === 0) {
    const cont = document.getElementById('modal-size-container');
    cont.scrollIntoView({ behavior: 'smooth', block: 'center' });
    cont.classList.add('highlight-error');
    setTimeout(() => cont.classList.remove('highlight-error'), 2000);
    return;
  }

   // Validación obligatoria: ACOMPAÑANTE
  const acompanante = Array.from(document.querySelectorAll('#modal-flavor-container input:checked')).map(cb => cb.value);
  if (acompanante.length === 0) {
    const cont = document.getElementById('modal-flavor-container');
    cont.scrollIntoView({ behavior: 'smooth', block: 'center' });
    cont.classList.add('highlight-error');
    setTimeout(() => cont.classList.remove('highlight-error'), 2000);
    return;
  }

  console.log('Verificando horario antes de agregar al carrito...');

  // ✅ Verificar si la tienda está abierta
  if (!estaAbierta()) {
    const estadoTienda = document.getElementById('estado-tienda').textContent;

    if (estadoTienda.includes("reserva")) {
      alert("La tienda está cerrada, pero puedes hacer una reserva. ¡Agregando al carrito!");
      // → aquí sí permitimos agregar
    } else {
      alert("La tienda está cerrada, no puedes agregar productos al carrito en este momento. Te invitamos a ver nuestro horario.");
      return; // 🚫 detenemos la función, no se agrega nada
    }
  }

const selectedProteina = Array.from(document.querySelectorAll('#modal-size-container input[type="checkbox"]')).filter(cb => cb.checked).map(cb => cb.value);
const selectedAcompanante = Array.from(document.querySelectorAll('#modal-flavor-container input[type="checkbox"]')).filter(cb => cb.checked).map(cb => cb.value);
const selectedGrano = Array.from(document.querySelectorAll('#modal-checkbox-container input[type="checkbox"]')).filter(cb => cb.checked).map(cb => cb.value);
const selectedEnsalada = Array.from(document.querySelectorAll('#modal-additional-container input[type="checkbox"]')).filter(cb => cb.checked).map(cb => cb.value);
const selectedSopa = Array.from(document.querySelectorAll('#modal-sopa-container input[type="checkbox"]')).filter(cb => cb.checked).map(cb => cb.value);

const productToAdd = {
  name,
  price,
  instructions,
  quantity: newQuantity,
  image,
  selectedProteina,
  selectedAcompanante,
  selectedGrano,
  selectedEnsalada,
  selectedSopa
};


  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push(productToAdd);
  localStorage.setItem('cart', JSON.stringify(cart));

  updateCartCount();
  closeModal();



  // MOSTRAR LA ANIMACIÓN DEL CARRITO EXPANDIÉNDOSE
  const cartButton = document.getElementById('floating-cart');
  cartButton.classList.add('expanded'); // Expande el botón

  // MOSTRAR LA NOTIFICACIÓN
  showNotification(`${name} ha sido agregado al carrito.`);

  // DESPUÉS DE 3 SEGUNDOS, RESTAURAR EL TAMAÑO DEL CARRITO Y OCULTAR LA NOTIFICACIÓN
  setTimeout(() => {
    cartButton.classList.remove('expanded');
    hideNotification();
  }, 3000); // Mantener expandido por 3 segundos

  closeModal(); // Cierra el modal después de agregar al carrito

  // Obtener la categoría seleccionada antes de agregar al carrito
  const selectedCategory = localStorage.getItem('selectedCategory');

  // Después de agregar al carrito, volver a la misma categoría seleccionada
  if (selectedCategory) {
    displayProducts(selectedCategory); // Muestra los productos de la categoría guardada
  }
}


// FUNCIÓN PARA MOSTRAR LA NOTIFICACIÓN
function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.innerText = message; // Asigna el mensaje a la notificación

  // Mostrar la notificación
  notification.classList.add('show');
}

// FUNCIÓN PARA OCULTAR LA NOTIFICACIÓN
function hideNotification() {
  const notification = document.getElementById('notification');
  notification.classList.remove('show');
}





// MOSTRAR TODOS LOS PRODUCTOS AL CARGAR LA PÁGINA
window.onload = function() {displayProducts();};






//FUNCION PARA LA CANTIDAD QUE SE INGRESA DESDE EL MODAL
let quantity = 1;

// FUNCIÓN PARA INCREMENTAR LA CANTIDAD
function increaseQuantity() {
  quantity++;
  document.getElementById('product-quantity').value = quantity;
}

// FUNCIÓN PARA DECREMENTAR LA CANTIDAD, ASEGURANDO QUE NO SEA MENOR QUE 1
function decreaseQuantity() {
  if (quantity > 1) {
      quantity--;
      document.getElementById('product-quantity').value = quantity;
  }
}

// FUNCIÓN PARA VALIDAR QUE LA ENTRADA SEA UN NÚMERO VÁLIDO Y ACTUALIZAR LA CANTIDAD
function validateQuantityInput() {
  const input = document.getElementById('product-quantity');
  const value = parseInt(input.value);

  if (!isNaN(value) && value > 0) {
      quantity = value; // Actualiza la cantidad si el valor es válido
  } else {
      quantity = 1; // Si el valor no es válido, ajusta la cantidad a 1
  }
  input.value = quantity; // Actualiza el campo con la cantidad validada
}






///////////////////////////////////////////////////////////////////////////
const horariosTienda = [
  { dia: 0, horaApertura: 18, horaCierre: 24 },  // Domingo
  { dia: 1, horaApertura: 18, horaCierre: 24},  // Lunes 
  { dia: 2, horaApertura: 18, horaCierre: 24 },  // Martes
  { dia: 3, horaApertura: null, horaCierre: null},  // Miércoles - cerrado
  { dia: 4, horaApertura: 18, horaCierre: 24 },  // Jueves 
  { dia: 5, horaApertura: 18, horaCierre: 24 },  // Viernes
  { dia: 6, horaApertura: 18, horaCierre: 24 },  // Sábado
];
/////////////////////////////////////////////////////////////////////////////



// FUNCIÓN PARA VERIFICAR SI LA TIENDA ESTÁ ABIERTA
function estaAbierta() {
  const horaActual = new Date().getHours(); // Obtiene la hora actual
  const diaActual = new Date().getDay();   // Obtiene el día de la semana (0 = domingo, 1 = lunes, ..., 6 = sábado)

  console.log(`Hora actual: ${horaActual}, Día actual: ${diaActual}`); // Para depurar

  // BUSCAR EL HORARIO CORRESPONDIENTE AL DÍA ACTUAL
  const horarioHoy = horariosTienda.find(horario => horario.dia === diaActual);

  // VERIFICAR SI EL DÍA TIENE UN HORARIO DEFINIDO
  if (horarioHoy && horarioHoy.horaApertura !== null && horarioHoy.horaCierre !== null) {
      return horaActual >= horarioHoy.horaApertura && horaActual < horarioHoy.horaCierre;
  } else {
      return false; // Si no hay horario para el día, la tienda está cerrada
  }
}

// FUNCIÓN PARA ACTUALIZAR EL ESTADO DE LA TIENDA (USADA POR EL HTML)
function actualizarEstadoTienda() {
  const estadoTienda = document.getElementById('estado-tienda');
  
  const horaActual = new Date().getHours(); // Obtiene la hora actual
  const diaActual = new Date().getDay();   // Obtiene el día de la semana (0 = domingo, 1 = lunes, ..., 6 = sábado)

  console.log(`Hora actual para estado: ${horaActual}, Día actual: ${diaActual}`); // Para depurar

  // BUSCAR EL HORARIO CORRESPONDIENTE AL DÍA ACTUAL
  const horarioHoy = horariosTienda.find(horario => horario.dia === diaActual);

  // Si la tienda está abierta
  if (horarioHoy && horarioHoy.horaApertura !== null && horarioHoy.horaCierre !== null && horaActual >= horarioHoy.horaApertura && horaActual < horarioHoy.horaCierre) {
      estadoTienda.textContent = "¡La tienda está abierta!";
      estadoTienda.classList.add("abierto");
      estadoTienda.classList.remove("cerrado", "reserva");
  }
  // Si la tienda está cerrada pero se pueden hacer reservas
  else if (horarioHoy && horarioHoy.horaApertura !== null && horaActual < horarioHoy.horaApertura) {
      // Si es 1 hora antes de abrir, mostrar mensaje de reserva
      const horaReserva = horarioHoy.horaApertura - 1; // 1 hora antes de apertura
      if (horaActual >= horaReserva) {
          estadoTienda.textContent = "Cerrado, reserva disponible.";
          estadoTienda.classList.add("reserva");
          estadoTienda.classList.remove("abierto", "cerrado");
      } else {
          estadoTienda.textContent = "La tienda está cerrada.";
          estadoTienda.classList.add("cerrado");
          estadoTienda.classList.remove("abierto", "reserva");
      }
  } else {
      estadoTienda.textContent = "La tienda está cerrada.";
      estadoTienda.classList.add("cerrado");
      estadoTienda.classList.remove("abierto", "reserva");
  }
}

// LLAMAMOS A LA FUNCIÓN PARA ACTUALIZAR EL ESTADO AL CARGAR LA PÁGINA
document.addEventListener("DOMContentLoaded", function() {
  actualizarEstadoTienda();
});


// Función para calcular los minutos restantes
function calcularMinutosRestantes(horaFin) {
  const horaActual = new Date().getHours();
  const minutosActuales = new Date().getMinutes();
  
  const minutosTotalesRestantes = ((horaFin - horaActual) * 60) - minutosActuales;
  return minutosTotalesRestantes;
}

// Función para actualizar el horario de la tienda
function actualizarHorarioTienda() {
  const horarioElemento = document.getElementById('horario-tienda');
  const horaActual = new Date().getHours(); // Obtiene la hora actual
  const diaActual = new Date().getDay();    // Obtiene el día de la semana (0 = domingo, 1 = lunes, ..., 6 = sábado)

  // Buscar el horario correspondiente al día actual
  const horarioHoy = horariosTienda.find(horario => horario.dia === diaActual);

  if (horarioHoy && horarioHoy.horaApertura !== null && horarioHoy.horaCierre !== null) {
      const minutosRestantesApertura = calcularMinutosRestantes(horarioHoy.horaApertura);
      const minutosRestantesCierre = calcularMinutosRestantes(horarioHoy.horaCierre);

      const horasAperturaRestantes = Math.floor(minutosRestantesApertura / 60);
      const minutosAperturaRestantes = minutosRestantesApertura % 60;

      const horasCierreRestantes = Math.floor(minutosRestantesCierre / 60);
      const minutosCierreRestantes = minutosRestantesCierre % 60;

      if (horaActual < horarioHoy.horaApertura) {
          // Tienda cerrada, muestra el tiempo restante para abrir
          if (horasAperturaRestantes > 0) {
              horarioElemento.textContent = `Abre en ${horasAperturaRestantes} hora(s) y ${minutosAperturaRestantes} minuto(s).`;
          } else {
              horarioElemento.textContent = `Abre en ${minutosAperturaRestantes} minuto(s).`;
          }
      } else if (horaActual >= horarioHoy.horaApertura && horaActual < horarioHoy.horaCierre) {
          // Tienda abierta, muestra el tiempo restante para cerrar
          if (horasCierreRestantes > 0) {
              horarioElemento.textContent = `Cierra en ${horasCierreRestantes} hora(s) y ${minutosCierreRestantes} minuto(s).`;
          } else {
              horarioElemento.textContent = `Cierra en ${minutosCierreRestantes} minuto(s).`;
          }
      }
  } else {
      horarioElemento.textContent = "Hoy la tienda permanece cerrada.";
  }
}

// Llamamos a la función para actualizar el horario al cargar la página
document.addEventListener("DOMContentLoaded", function() {
  actualizarHorarioTienda();
  setInterval(actualizarHorarioTienda, 60000); // Actualiza cada minuto
});





// ESCUCHAR EL EVENTO DE ENTRADA EN EL CAMPO DE CANTIDAD EN MODAL
document.getElementById('modal-quantity').addEventListener('input', function(event) {
  
  // Reemplazar cualquier carácter que no sea numérico
  event.target.value = event.target.value.replace(/[^0-9]/g, '')

  let value = parseInt(event.target.value, 10);
  
  // VERIFICAR SI EL VALOR ES MAYOR QUE 99
  if (value > 99) {
      event.target.value = 99; // Limitar el valor a 100
  } else if (value < 1) {
      event.target.value = 1; // Asegurarse de que el valor no sea menor que 1
  }
});

// Función para cambiar la cantidad con los botones + y -
function changeQuantity(amount) {
  const quantityInput = document.getElementById('modal-quantity');
  let currentQuantity = parseInt(quantityInput.value, 10);

  // Limitar la cantidad a un máximo de 99 productos
  if (currentQuantity + amount <= 99 && currentQuantity + amount >= 1) {
      quantityInput.value = currentQuantity + amount;
  } else if (currentQuantity + amount > 99) {
      quantityInput.value = 99; // Limitar a 99 si el número excede
  } else {
      quantityInput.value = 1; // Mantener al menos 1
  }
}





//FUNCION CONTAR LOS PRODUCTOS QUE SE ENCUENTRAN EN EL CARRITO
function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartCount = document.getElementById('cart-count');

  // Calcular la cantidad total de todos los productos en el carrito
  let totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQuantity > 0) {
      cartCount.innerText = totalQuantity;
      cartCount.style.display = 'inline-block'; // Muestra el contador
  } else {
      cartCount.style.display = 'none'; // Oculta el contador si está vacío
  }
}




// LLAMA A ESTA FUNCIÓN CUANDO LA PÁGINA TERMINE DE CARGAR
document.addEventListener('DOMContentLoaded', updateCartCount);