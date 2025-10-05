function recolectarDatosParaGoogleSheet(
    tipoEntrega,
    numeroFactura,
    fecha,
    hora,
    nombre,
    telefono,
    totalProductos,
    metodoPago,
    observaciones // ✅ AÑADIDO COMO PARÁMETRO
) {
    let productosArray = [];
    try {
        productosArray = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        productosArray = [];
    }

    const productosFormateados = productosArray.map(item => {
        let size = "";
        let flavors = "";
        let borders = "";
        let additionals = "";

        if (item.selections) {
            size = (item.selections.size && item.selections.size !== "Ninguno") ? item.selections.size : "";
            flavors = (item.selections.flavors && item.selections.flavors !== "Ninguno") ? item.selections.flavors : "";
            borders = (item.selections.borders && item.selections.borders !== "Ninguno") ? item.selections.borders : "";
            additionals = (item.selections.additionals && item.selections.additionals !== "Ninguno") ? item.selections.additionals : "";
        } else {
            size = (item.selectedSizes && item.selectedSizes.length > 0) ? item.selectedSizes.join(', ') : "";
            flavors = (item.selectedFlavors && item.selectedFlavors.length > 0) ? item.selectedFlavors.join(', ') : "";
            borders = (item.selectedBorders && item.selectedBorders.length > 0) ? item.selectedBorders.join(', ') : "";
            additionals = (item.selectedAdditionals && item.selectedAdditionals.length > 0) ? item.selectedAdditionals.join(', ') : "";
        }

        const instrucciones = (item.instructions && item.instructions !== "Ninguno") ? item.instructions : "";

        return `${item.name} x${item.quantity} ($${item.price})  ${size}  ${flavors}  ${borders}  ${additionals}  ${instrucciones}`;
    }).join('\n');

    // ✅ Si observaciones no vino como parámetro, úsalo desde localStorage como respaldo
    const obsFinal = (observaciones || localStorage.getItem('observaciones') || "").trim();

    const datos = {
        tipoEntrega: tipoEntrega,
        numeroFactura: numeroFactura,
        fecha: fecha,
        hora: hora,
        nombre: nombre,
        telefono: telefono,
        direccion: "",
        puntoReferencia: "",
        productos: productosFormateados,
        totalProductos: totalProductos,
        costoDomicilio: "",
        totalPagar: totalProductos,
        metodoPago: metodoPago,
        ubicacionGoogleMaps: "",
        observaciones: obsFinal // ✅ ASEGURADO
    };

    // Solo agrega mesa si el tipo de entrega es literalmente "mesa"
    if (tipoEntrega === "mesa") {
        datos.mesa = localStorage.getItem('mesa') || "";
    }

    return datos;
}

function enviarDatosAGoogleSheet(datos) {
    fetch('https://script.google.com/macros/s/AKfycbwez78KX4oEXCGWV_olvy_J1C8YwURxN-1YaZiYYqQJPVLAJuaRI_5EVl4v14OMjonM/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    });
}
