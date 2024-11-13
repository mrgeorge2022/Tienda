//Evitar Click derecho en toda la pagina
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// Quitar zoom
if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    // Evita el doble tap para hacer zoom
    document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault(); // Prevenir zoom en gestos de pinza
    }
    }, { passive: false });

    // Evita zoom en doble toque
    var lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
    var now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault(); // Prevenir zoom en doble toque
    }
    lastTouchEnd = now;
    }, false);
}

//evita zoom en campos de texto en mmoviles
document.querySelectorAll('input, textarea, select').forEach((element) => {
    element.addEventListener('focus', () => {
        document.body.style.zoom = '100%';
    });
    element.addEventListener('blur', () => {
        document.body.style.zoom = '';
    });
});

//evita zoom cuando este primero coloca un dedo , luego el otro y hace una ampliacion
document.addEventListener('touchmove', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault(); // Bloquea el zoom cuando hay más de un toque (dos dedos)
    }
}, { passive: false });





// Al inicio del archivo products.js
document.addEventListener('DOMContentLoaded', () => {
    const orderType = localStorage.getItem('orderType');
    const orderTypeMessage = document.getElementById('order-type-message'); 
});

let cart = [];

// Función para mostrar productos
function displayProducts(category = null) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = ''; // Limpiar la lista de productos
    const filteredProducts = category ? products.filter(p => p.category === category) : products; // Filtrar productos por categoría si es necesario
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>$${formatPrice(product.price)}</p>
            <button onclick="openProductModal('${product.name}', '${product.image}', '${product.description}', ${product.price})">Ver</button>
        `;
        productList.appendChild(productCard);
    });
}


// Función para abrir el modal del producto
function openProductModal(name, image, description, price) {
    document.getElementById('modal-product-name').innerText = name;
    document.getElementById('modal-product-image').src = image;
    document.getElementById('modal-product-description').innerText = description;
    document.getElementById('modal-product-price').innerText = `Precio: $${formatPrice(price)}`;
    document.getElementById('add-to-cart-button').onclick = () => addToCart(name, price, image);
    document.getElementById('product-modal').style.display = 'block';
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

function addToCart(name, price, image) {
    const instructions = document.getElementById('instructions').value;
    cart.push({ name, price, quantity: 1, instructions, image });
    updateCart();
    document.getElementById('instructions').value = '';
    closeProductModal();
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = ''; // Limpiar los productos del carrito
    let total = 0;
    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.innerHTML = `
            <img src="${item.image}" class="cart-product-image" alt="${item.name}">
            ${item.name} - $${formatPrice(item.price)} 
            <textarea class="cart-product-instructions" readonly>${item.instructions}</textarea>
            <button onclick="removeFromCart(${index})">Eliminar</button>
        `;
        cartItems.appendChild(cartItem);
        total += item.price;
    });
    document.getElementById('total-price').innerText = `Total: $${formatPrice(total)}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function clearCart() {
    cart = [];
    updateCart();
}

function openCart() {
    document.getElementById('cart').style.display = 'block';
}

function closeCart() {
    document.getElementById('cart').style.display = 'none';
}

// Función para formatear el precio con puntos de mil
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}



