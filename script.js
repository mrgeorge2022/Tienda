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

    // Evitar zoom en campos de texto en móviles
    document.querySelectorAll('input, textarea, select').forEach((element) => {
        element.addEventListener('focus', () => {
            document.body.style.zoom = '100%'; // Previene el zoom en campos de entrada
        });
        element.addEventListener('blur', () => {
            document.body.style.zoom = ''; // Restaura el estilo de zoom después
        });
    });

    // Evitar zoom con gesto de desplazamiento (dos dedos)
    document.addEventListener('touchmove', (event) => {
        if (event.touches.length > 1) {
            event.preventDefault(); // Bloquea zoom de desplazamiento de dos dedos
        }
    }, { passive: false });
}

// Evitar zoom en la página a través de meta tags en dispositivos móviles
const metaTag = document.createElement('meta');
metaTag.name = 'viewport';
metaTag.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
document.head.appendChild(metaTag);








