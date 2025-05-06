// Verificar el estado de la página desde config.json
fetch('./zinactivity/config.json') // Ruta ajustada para el archivo config.json
  .then(response => response.json())
  .then(config => {
    if (!config.active) {
      // Redirigir a la página 404iactiva.html si la web está desactivada
      window.location.href = './zinactivity/404inactiva.html'; // Ruta ajustada para 404iactiva.html
    }
  })
  .catch(error => {
    console.error('Error al cargar el archivo de configuración:', error);
  });