// EVITAR CLICK DERECHO EN TODA LA PÁGINA
document.addEventListener('contextmenu', (e) => e.preventDefault());

// DESACTIVAR TODOS LOS TIPOS DE ZOOM EN MÓVILES
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

    // EVITAR ZOOM EN CAMPOS DE TEXTO EN MÓVILES
    document.querySelectorAll('input, textarea, select').forEach((element) => {
        element.addEventListener('focus', () => {
            document.body.style.zoom = '100%'; // Previene el zoom en campos de entrada
        });
        element.addEventListener('blur', () => {
            document.body.style.zoom = ''; // Restaura el estilo de zoom después
        });
    });

    // EVITAR ZOOM CON GESTO DE DESPLAZAMIENTO (DOS DEDOS)
    document.addEventListener('touchmove', (event) => {
        if (event.touches.length > 1) {
            event.preventDefault(); // Bloquea zoom de desplazamiento de dos dedos
        }
    }, { passive: false });
}

// EVITAR ZOOM EN LA PÁGINA A TRAVÉS DE META TAGS EN DISPOSITIVOS MÓVILES
const metaTag = document.createElement('meta');
metaTag.name = 'viewport';
metaTag.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
document.head.appendChild(metaTag);




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
    'anuncios/ILUSTRACION2.jpg',
    'anuncios/ILUSTRACION3.jpg'
  ];
  
  let currentImageIndex = 0;
  
  // Función para cambiar la imagen sin espacios
  function changeImage() {
    const anuncio = document.getElementById('anuncios');
    const img = anuncio.querySelector('img');
  
    // Aplicamos el desplazamiento hacia la izquierda de la imagen actual
    img.style.transform = 'translateY(-100%)';
  
    // Cambiar la imagen después de un tiempo, cuando termina la animación
    setTimeout(() => {
      img.src = images[currentImageIndex]; // Cambia la imagen
      img.style.transform = 'translateY(100%)'; // Mueve la nueva imagen hacia la derecha
  
      // Actualiza el índice de la imagen
      currentImageIndex = (currentImageIndex + 1) % images.length; // Cicla a la siguiente imagen
    }, 1000); // Esto debe coincidir con el tiempo de animación (1 segundo)
  
    // Después de que la nueva imagen esté completamente cargada, la mueve a su posición original
    setTimeout(() => {
      img.style.transform = 'translateY(0)';
    }, 1500); // Espera a que la nueva imagen se haya movido completamente a su lugar
  }
  
  // Cambiar la imagen cada 5 segundos
  setInterval(changeImage, 5000);
  
  // Llamamos a la función para iniciar el ciclo de cambio de imágenes
  changeImage();
  
