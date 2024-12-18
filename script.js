// Función para ocultar la animación de bienvenida
function hideWelcomeLoader() {
  var welcomeLoader = document.getElementById('welcome-loader');
  welcomeLoader.style.display = 'none'; // Ocultar la animación de bienvenida
}

// Ejecutamos la función cuando la página haya cargado completamente
window.addEventListener('load', function() {
  // Esperamos 4 segundos para que la animación de bienvenida se complete
  setTimeout(hideWelcomeLoader, 1000); // El tiempo puede ser ajustado (1000s = 1 segundos)
});
















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















// BARRA SUPERIOR
// Asegúrate de que la barra y el botón estén ocultos al cargar la página
window.addEventListener("load", function () {
    const floatingBanner = document.querySelector(".floating-banner");
    const scrollTopButton = document.getElementById("scrollTopButton");

    // Ocultar los elementos al recargar la página
    floatingBanner.style.display = "none";
    scrollTopButton.style.display = "none";
});

  // Barra que aparece al bajar más de 200px
window.addEventListener("scroll", function () {
    const floatingBanner = document.querySelector(".floating-banner");

    // Verificar si el desplazamiento es mayor a 200px
    if (window.scrollY > 200) {
      floatingBanner.style.display = "flex"; // Muestra la barra cuando se baja más de 200px
    } else {
      floatingBanner.style.display = "none"; // Oculta la barra si no se ha bajado más de 200px
    }

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



// Array de imágenes
const images = [
  'anuncios/ILUSTRACION1.jpg',
  //'anuncios/ILUSTRACION2.jpg',
  //'anuncios/ILUSTRACION3.jpg',
  'anuncios/ILUSTRACION4.jpg',
  'anuncios/ILUSTRACION5.jpg',
];

let currentImageIndex = 0;

// Referencia al contenedor
const anuncio = document.getElementById('anuncios');

// Crear la primera imagen
let currentImg = document.createElement('img');
currentImg.src = images[currentImageIndex];
currentImg.classList.add('active'); // Mostrar la imagen inicial
anuncio.appendChild(currentImg);

// Función para cambiar la imagen
function changeImage() {
  const nextImageIndex = (currentImageIndex + 1) % images.length;

  // Crear la nueva imagen
  const nextImg = document.createElement('img');
  nextImg.src = images[nextImageIndex];
  anuncio.appendChild(nextImg);

  // Desvanecer la imagen actual y mostrar la nueva
  setTimeout(() => {
    nextImg.classList.add('active'); // Mostrar la nueva imagen
    currentImg.classList.remove('active'); // Ocultar la imagen actual

    // Eliminar la imagen anterior después de la transición
    setTimeout(() => {
      anuncio.removeChild(currentImg);
      currentImg = nextImg; // Actualizar la referencia de la imagen actual
    }, 1000); // Tiempo que coincide con la duración de la transición
  }, 50);

  // Actualizar el índice
  currentImageIndex = nextImageIndex;
}

// Cambiar la imagen cada 5 segundos
setInterval(changeImage, 5000);

// Iniciar el ciclo de cambio de imágenes
changeImage();







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

function displayProducts(category = '', searchQuery = '') {
  const products = [
    
    { 
      id: 1, 
      image: 'img/productos/LaCosteña.jpg', 
      name: 'La Costeña', 
      category: ['todos','hamburguesas'], 
      price: 21000, 
      description: '¡Un viaje directo al paraíso del sabor!' 
    },
    { 
      id: 2, 
      image: 'img/productos/LaMentirosa.jpg', 
      name: 'La Mentirosa', 
      category: ['todos','hamburguesas'], 
      price: 24000, 
      description: '¡Sabor tan increíble, que parece un mito!' 
    },
    { 
      id: 3, 
      image: 'img/productos/LaBestia.jpg', 
      name: 'La Bestia', 
      category: ['todos','hamburguesas', 'recomendados'], 
      price: 28000, 
      description: '¡Doble de carne, doble de sabor, el rey de las hamburguesas!' 
    },
    { 
      id: 4, 
      image: 'img/productos/mister.jpg', 
      name: 'Mister', 
      category: ['todos','perros','recomendados'], 
      price: 15000, 
      description: '¡El sabor artesanal, en su máxima expresión!' 
    },
    { 
      id: 5, 
      image: 'img/productos/royal.jpg', 
      name: 'Royal', 
      category: ['todos','perros','recomendados'], 
      price: 18000, 
      description: '¡Un bocado real, lleno de sabor y frescura!' 
    },
    { 
      id: 6, 
      image: 'img/productos/express.jpg', 
      name: 'Express', 
      category: ['todos','perros'], 
      price: 19000, 
      description: '¡Rapidez, sabor y calidad en cada mordisco!' 
    },
    { 
      id: 7, 
      image: 'img/productos/rancher.jpg', 
      name: 'Rancher', 
      category: ['todos','perros'], 
      price: 20000, 
      description: '¡Irresistible y lleno de pasión, el mejor perro de la casa!' 
    },
    { 
      id: 8, 
      image: 'img/productos/golosa.jpg', 
      name: 'La Golosa', 
      category: ['todos','picadas','recomendados'], 
      price: 25000, 
      description: '¡Un festín de sabores que te hará volver por más!' 
    },
    { 
      id: 9, 
      image: 'img/productos/atrevida.jpg', 
      name: 'La Atrevida', 
      category: ['todos','picadas'], 
      price: 32000, 
      description: '¡Para los que se atreven a disfrutar el sabor sin límites!' 
    },
    { 
      id: 10, 
      image: 'img/productos/limon.jpg', 
      name: 'Limonada', 
      category: ['todos','bebidas','recomendados'], 
      price: 5000, 
      description: '¡Frescura que te llena de vida en cada sorbo!' 
    },
    { 
      id: 11, 
      image: 'img/productos/mora.jpg', 
      name: 'Mora En Leche', 
      category: ['todos','bebidas','recomendados'], 
      price: 6000, 
      description: '¡El sabor que acaricia tus sentidos!' 
    },
    { 
      id: 12, 
      image: 'img/productos/maracuya.jpg', 
      name: 'Maracuyá', 
      category: ['todos','bebidas','recomendados'],
      price: 5000, 
      description: '¡Pura pasión en cada gota!' 
    },
    { 
      id: 13, 
      image: 'img/productos/lulo.jpg', 
      name: 'Lulo', 
      category: ['todos','bebidas'], 
      price: 5000, 
      description:'¡La frescura cítrica que te llena de energía!' 
    },
];




  const filteredProducts = products.filter(p => {
    // Filtrar por categoría si es proporcionada
    const matchesCategory = category ? p.category.includes(category) : true;
    const matchesSearchQuery = searchQuery ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    return matchesCategory && matchesSearchQuery;
  });

  const productList = document.getElementById('product-list');
  productList.innerHTML = '';

  // Recuperar cantidad de producto seleccionado desde el carrito desde localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Mostrar los productos filtrados
  filteredProducts.forEach(product => {
    const productElement = document.createElement('div');
    productElement.classList.add('product-item');
    productElement.id = `product-${product.id}`;

    // Buscar la cantidad del producto en el carrito
    const cartItem = cart.find(item => item.name === product.name);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    productElement.onclick = function() {
      openModal(product.id); // Llama a la función openModal con el ID del producto
    };

    productElement.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image">
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p><strong>$${formatNumber(product.price)}</strong></p>
      <div id="contenedorcontadorcarrito">
        <button onclick="event.stopPropagation(); openModal(${product.id})">Ordenar

      <!-- Contador dentro del botón -->
      ${quantityInCart > 0 ? `<span class="product-quantity">${quantityInCart}</span>` : ''}
      

        </button>
      </div>
    `;
    productList.appendChild(productElement);
  });
}




// Función para activar el enlace de la categoría seleccionada en el listado 
function activateCategoryLink(category) {
  // Primero, eliminamos la clase 'active' de todos los enlaces
  const allLinks = document.querySelectorAll('nav ul li a, .custom-dropdown-menu a');
  allLinks.forEach(link => {
    link.classList.remove('active');
  });

  // Luego, agregamos la clase 'active' al enlace seleccionado
  const selectedLink = document.querySelector(`a[href*="${category}"]`);
  if (selectedLink) {
    selectedLink.classList.add('active');
  }

  // Filtrar los productos según la categoría seleccionada
  displayProducts(category);

  // Cerrar el submenú al seleccionar una categoría
  const dropdownMenu = document.querySelector('.custom-dropdown-menu');
  dropdownMenu.classList.remove('open');
  
  // Cambiar el icono de la flecha a ▼
  const span = document.querySelector('.custom-dropdown-toggle span');
  if (span) {
    span.textContent = '▼';
  }
}
//funcion para al desplegar es spam ▼ se cambie correspondinte a su estado 
function toggleCategoryDropdown(event) {
  event.preventDefault(); // Evita comportamientos no deseados

  const dropdownToggle = event.target.closest('.custom-dropdown-toggle');
  if (!dropdownToggle) return;

  const dropdownMenu = dropdownToggle.closest('.dropdown-container').querySelector('.custom-dropdown-menu');
  dropdownMenu.classList.toggle('open');

  const span = dropdownToggle.querySelector('span');
  if (span) {
    span.textContent = dropdownMenu.classList.contains('open') ? '▲' : '▼';
  }
}

// Función para cerrar el submenú si se hace clic fuera de él
document.addEventListener('click', function(event) {
  const dropdown = document.querySelector('.dropdown-container');
  const dropdownMenu = dropdown.querySelector('.custom-dropdown-menu');
  
  // Verifica si el clic fue fuera del dropdown
  if (!dropdown.contains(event.target)) {
    dropdownMenu.classList.remove('open');
    const span = dropdown.querySelector('.custom-dropdown-toggle span');
    
    // Manejo seguro del cambio del texto de la flecha
    if (span) {
      span.textContent = '▼';  // Vuelve a mostrar la flecha hacia abajo
    }
  }
});











// FUNCIÓN PARA ABRIR EL MODAL CON LOS DETALLES DEL PRODUCTO
function openModal(productId) {
  const products = [
      {
          id: 1, 
          image: 'img/productos/LaCosteña.jpg', 
          name: 'La Costeña', 
          category: 'hamburguesas', 
          price: 21000, 
          description: 'Carne de res jugosa (150g), queso costeño, tocineta ahumada, lechuga crespa, cebolla caramelizada estilo gourmet, salsa de cilantro, salsa crema parrilla y salsa de maíz dulce. ¡Una explosión de sabor!' 
      },
      { 
          id: 2, 
          image: 'img/productos/LaMentirosa.jpg', 
          name: 'La Mentirosa', 
          category: 'hamburguesas', 
          price: 24000, 
          description: 'Carne de res (150g), lechuga fresquita, cebolla caramelizada, aguacate cremoso, salsa de cilantro, salsa crema parrilla y salsa de maíz dulce. Todo esto, presentado con queso mozzarella y maíz tierno. ¡Increíblemente deliciosa!' 
      },
      { 
          id: 3, 
          image: 'img/productos/LaBestia.jpg', 
          name: 'La Bestia', 
          category: 'hamburguesas', 
          price: 28000,  
          description: 'Doble carne de res (300g), tocineta ahumada, lechuga fresquita, cebolla caramelizada estilo gourmet, salsa de cilantro, salsa crema parrilla y salsa de maíz dulce. ¡Completada con plátano amarillo frito, aguacate y una capa de queso mozzarella con maíz tierno!' 
      },
      { 
          id: 4, 
          image: 'img/productos/mister.jpg', 
          name: 'Mister', 
          category: 'perros', 
          price: 15000, 
          description: 'El auténtico pan artesanal con una salchicha premium Cunit extra larga, acompañada de queso costeño artesanal, cebolla caramelizada gourmet, salsa fresca de cilantro y un toque especial de crema parrillera.' 
      },
      { 
          id: 5, 
          image: 'img/productos/royal.jpg', 
          name: 'Royal', 
          category: 'perros', 
          price: 18000, 
          description: 'Pan artesanal coronado con salchicha Cunit Jumbo, salsa de cilantro, trozos frescos de aguacate, salsa crema parrilla y una combinación de queso mozzarella y maíz tierno. ¡Una delicia real!' 
      },
      { 
          id: 6, 
          image: 'img/productos/express.jpg', 
          name: 'Express', 
          category: 'perros', 
          price: 19000, 
          description: 'Un pan artesanal relleno de chorizo Express Parisienne y tocineta ahumada, realzado con salsa de cilantro, salsa crema parrilla, plátano amarillo frito y salsa de maíz dulce. ¡Todo cubierto con queso mozzarella y maíz tierno!' 
      },
      { 
          id: 7, 
          image: 'img/productos/rancher.jpg', 
          name: 'Rancher', 
          category: 'perros', 
          price: 20000, 
          description: 'Pan artesanal con salchicha ranchera y crujientes tiras de tocineta ahumada, combinado con salsa de cilantro, salsa crema parrilla, plátano amarillo frito, salsa de maíz dulce y una capa de queso mozzarella con maíz tierno. ¡Irresistible!' 
      },
      { 
          id: 8, 
          image: 'img/productos/golosa.jpg', 
          name: 'La Golosa', 
          category: 'picadas', 
          price: 25000, 
          description: 'Chorizo costeño, cerdo jugoso y pechuga de pollo, acompañados de queso mozzarella, maíz tierno, salsa de cilantro, salsa crema parrilla, papas fritas Fritters, aguacate fresco y un toque especial de salsa de maíz. ¡Un festín irresistible!' 
      },
      { 
          id: 9, 
          image: 'img/productos/atrevida.jpg', 
          name: 'La Atrevida', 
          category: 'picadas', 
          price: 32000,  
          description: 'Chorizo costeño, chuleta de cerdo, salchicha ranchera y pechuga de pollo jugosa, todo cubierto con queso mozzarella, maíz tierno y tocineta ahumada. Añadido con salsa de cilantro, salsa crema parrilla, papas fritas Fritters, aguacate fresco, salsa de maíz dulce y un toque de plátano amarillo frito. ¡Una experiencia llena de sabor!' 
      },
      {
          id: 10, 
          image: 'img/productos/limon.jpg', 
          name: 'Limonada', 
          category: ['todos','bebidas','recomendados'], 
          price: 5000, 
          description: 'Nuestra limonada combina zumo de limones frescos, el toque justo de dulzura y abundante hielo para ofrecerte una bebida naturalmente refrescante y llena de sabor. ¡Perfecta para cualquier momento del día!' 
      },
      { 
          id: 11, 
          image: 'img/productos/mora.jpg', 
          name: 'Mora En Leche', 
          category: ['todos','bebidas','recomendados'], 
          price: 6000, 
          description: 'Nuestro jugo de mora en leche es una mezcla perfecta de moras jugosas y leche cremosa, creando una bebida suave, dulce y llena de sabor natural. Ideal para disfrutar en cualquier momento y dejarte conquistar por     su frescura.' 
      },
      { 
          id: 12, 
          image: 'img/productos/maracuya.jpg', 
          name: 'Maracuyá', 
          category: ['todos','bebidas','recomendados'], 
          price: 5000, 
          description:'Nuestra bebida de maracuyá combina el intenso sabor tropical de su pulpa con la frescura justa para ofrecerte una experiencia deliciosa y revitalizante. Ideal para los amantes de lo exótico. ¡Perfecta para     cualquier ocasión!' 
      },
      { 
          id: 13, 
          image: 'img/productos/lulo.jpg', 
          name: 'Lulo', 
          category: ['todos','bebidas','recomendados'], 
          price: 5000, 
          description:'Disfruta de nuestra bebida de lulo, una mezcla única de su pulpa ácida y refrescante con el toque perfecto de dulzura. Cada sorbo es un estallido de sabor natural, ideal para revitalizar tus días y refrescarte en     cualquier momento. ¡Déjate sorprender por su autenticidad!' 
      },
];





//FUNCIÓN PARA MOSTRAR LA INFORMACIÓN DEL PRODUCTO EN UN MODAL
const product = products.find(p => p.id === productId);
if (product) {
  document.getElementById('modal-product-name').innerText = product.name;
  document.getElementById('modal-product-price').innerText = formatNumber(product.price);
  document.getElementById('modal-product-image').src = product.image;
  document.getElementById('modal-product-description').innerText = product.description;

  // Buscar el producto en el carrito
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingProduct = cart.find(item => item.name === product.name);

  // Si el producto ya está en el carrito, mostrar las instrucciones y cantidad previas
  if (existingProduct) {
    document.getElementById('modal-product-instructions').value = existingProduct.instructions || '';
    document.getElementById('modal-quantity').value = existingProduct.quantity || 1;
  } else {
    // Si no está en el carrito, reiniciar los campos
    document.getElementById('modal-product-instructions').value = '';
    document.getElementById('modal-quantity').value = 1;
  }

  document.getElementById('product-modal').style.display = 'flex'; // Mostrar modal centrado
}
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







// FUNCIÓN PARA AGREGAR AL CARRITO DESDE EL MODAL
function addToCartFromModal() {


  console.log('Verificando si la tienda está abierta...');

  // VERIFICAR SI LA TIENDA ESTÁ ABIERTA
  if (!estaAbierta()) {
    alert("La tienda está cerrada, no puedes agregar productos al carrito en este momento. Te invitamos a ver nuestro horario");
    return; // DETIENE LA FUNCIÓN SI LA TIENDA ESTÁ CERRADA
  }

  const name = document.getElementById('modal-product-name').innerText;
  const priceFormatted = document.getElementById('modal-product-price').innerText;
  const instructions = document.getElementById('modal-product-instructions').value.trim(); // Instrucciones
  const newQuantity = parseInt(document.getElementById('modal-quantity').value, 10); // Nueva cantidad
  const image = document.getElementById('modal-product-image').src; // Imagen del producto

  // CONVERTIMOS EL PRECIO CON FORMATO A SU VALOR NUMÉRICO (ELIMINANDO EL PUNTO)
  const price = parseInt(priceFormatted.replace(/\./g, ''), 10);

  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // ELIMINAR EL PRODUCTO PREVIO SI YA EXISTE (SIN IMPORTAR INSTRUCCIONES)
  cart = cart.filter(item => item.name !== name);

  // AGREGAR EL PRODUCTO MODIFICADO O NUEVO AL CARRITO
  cart.push({ name, price, instructions, quantity: newQuantity, image });

  // GUARDAR EL CARRITO EN LOCALSTORAGE
  localStorage.setItem('cart', JSON.stringify(cart));

  // ACTUALIZAR EL CONTADOR DEL CARRITO
  updateCartCount();

  

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





const horariosTienda = [
  { dia: 0, horaApertura: 18, horaCierre: 24 },  // Domingo
  { dia: 1, horaApertura: 18, horaCierre: 24 },  // Lunes 
  { dia: 2, horaApertura: 18, horaCierre: 24 },  // Martes
  { dia: 3, horaApertura: null, horaCierre: null },  // Miércoles - cerrado
  { dia: 4, horaApertura: 18, horaCierre: 24 },  // Jueves
  { dia: 5, horaApertura: 18, horaCierre: 24 },  // Viernes
  { dia: 6, horaApertura: 18, horaCierre: 24 },  // Sábado
];

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

  if (horarioHoy && horarioHoy.horaApertura !== null && horarioHoy.horaCierre !== null && horaActual >= horarioHoy.horaApertura && horaActual < horarioHoy.horaCierre) {
      estadoTienda.textContent = "¡La tienda está abierta!";
      estadoTienda.classList.add("abierto");
      estadoTienda.classList.remove("cerrado");
  } else {
      estadoTienda.textContent = "La tienda está cerrada.";
      estadoTienda.classList.add("cerrado");
      estadoTienda.classList.remove("abierto");
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