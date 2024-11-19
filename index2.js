// Referencias a elementos del DOM
const botonAgregar = document.getElementById("boton");
const inputNombre = document.getElementById("task-title");
const inputAsiento = document.querySelector("input[placeholder='Numero de asiento']");
const inputFecha = document.getElementById("task-due-date");
const tablaAsientos = document.querySelector("table:nth-of-type(2)"); // Selecciona la tabla del mapa de asientos

// Array para almacenar las reservaciones
let reservaciones = [];

// Función para agregar una reservación
function agregarReservacion() {
    const nombre = inputNombre.value.trim();
    const asiento = inputAsiento.value.trim();
    

    // Validación de campos
    if (!nombre || !asiento ) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    // Validar si el asiento ya está reservado
    if (reservaciones.find(reserva => reserva.asiento === asiento)) {
        alert(`El asiento ${asiento} ya está reservado.`);
        return;
    }

    // Agregar la reservación al array
    reservaciones.push({ nombre, asiento });

    // Actualizar el mapa de asientos
    actualizarMapa();
    limpiarFormulario();
}

// Función para actualizar el mapa de asientos
function actualizarMapa() {
    // Limpiar estilos previos
    tablaAsientos.querySelectorAll("td").forEach(td => {
        td.classList.remove("reservado");
        td.innerHTML = td.dataset.asiento; // Restaura solo el número del asiento
    });

    // Aplicar estilos a los asientos reservados
    reservaciones.forEach(reserva => {
        const asientoElement = tablaAsientos.querySelector(`td[data-asiento="${reserva.asiento}"]`);
        if (asientoElement) {
            asientoElement.classList.add("reservado");
            asientoElement.innerHTML = `
                <div>
                    <p>${reserva.nombre}</p>
                    <button class="editar" data-asiento="${reserva.asiento}">Editar</button>
                    <button class="eliminar" data-asiento="${reserva.asiento}">Eliminar</button>
                </div>
            `;
        }
    });
}

// Función para limpiar el formulario
function limpiarFormulario() {
    inputNombre.value = "";
    inputAsiento.value = "";
    inputFecha.value = "";
}

// Función para manejar clic en botones de editar/eliminar
function manejarClicBoton(event) {
    if (event.target.classList.contains("editar")) {
        const asiento = event.target.dataset.asiento;
        editarReservacion(asiento);
    } else if (event.target.classList.contains("eliminar")) {
        const asiento = event.target.dataset.asiento;
        eliminarReservacion(asiento);
    }
}

// Función para editar una reservación
function editarReservacion(asiento) {
    const reserva = reservaciones.find(r => r.asiento === asiento);
    if (!reserva) return;

    // Llenar el formulario con los datos de la reservación
    inputNombre.value = reserva.nombre;
    inputAsiento.value = reserva.asiento;
    

    // Eliminar la reservación actual del array
    reservaciones = reservaciones.filter(r => r.asiento !== asiento);
    actualizarMapa();
}

// Función para eliminar una reservación
function eliminarReservacion(asiento) {
    reservaciones = reservaciones.filter(r => r.asiento !== asiento);
    actualizarMapa();
}

// Event Listeners
botonAgregar.addEventListener("click", agregarReservacion);
tablaAsientos.addEventListener("click", manejarClicBoton);

// Asigna un atributo único a cada celda del asiento
tablaAsientos.querySelectorAll("td").forEach((td, index) => {
    td.dataset.asiento = index + 1;
});

