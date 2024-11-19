// Referencias al DOM
const form = document.getElementById('task-form');
const taskTitle = document.getElementById('task-title');
const taskDescription = document.getElementById('task-description');
const taskDueDate = document.getElementById('task-due-date');
const table = document.querySelector('table');

// Almacenamiento de reservaciones
let reservaciones = [];

// Función para agregar una reservación
function agregarReservacion(nombre, asiento, fecha) {
    // Verificar si el asiento ya está reservado
    const existente = reservaciones.find(reserva => reserva.asiento === asiento);
    if (existente) {
        alert(`El asiento ${asiento} ya está reservado por ${existente.nombre}.`);
        return;
    }

    // Agregar la reservación
    reservaciones.push({ nombre, asiento, fecha });
    mostrarReservaciones();
}

// Función para mostrar reservaciones en el mapa
function mostrarReservaciones() {
    // Limpiar estilos previos
    Array.from(table.querySelectorAll('td')).forEach(td => td.classList.remove('reservado'));

    reservaciones.forEach(({ nombre, asiento }) => {
        const td = table.querySelector(`td:nth-child(${asiento})`);
        if (td) {
            td.classList.add('reservado');
            td.title = `Reservado por ${nombre}`;
        }
    });
}

// Función para editar una reservación
function editarReservacion(asiento) {
    const reserva = reservaciones.find(reserva => reserva.asiento === asiento);
    if (!reserva) {
        alert('No hay reservación para este asiento.');
        return;
    }

    // Llenar el formulario con los datos existentes
    taskTitle.value = reserva.nombre;
    taskDescription.value = reserva.asiento;
    taskDueDate.value = reserva.fecha;

    // Eliminar la reservación actual
    reservaciones = reservaciones.filter(reserva => reserva.asiento !== asiento);
    mostrarReservaciones();
}

// Función para eliminar una reservación
function eliminarReservacion(asiento) {
    reservaciones = reservaciones.filter(reserva => reserva.asiento !== asiento);
    mostrarReservaciones();
}

// Manejar envío del formulario
form.addEventListener('submit', e => {
    e.preventDefault();
    const nombre = taskTitle.value.trim();
    const asiento = taskDescription.value.trim();
    const fecha = taskDueDate.value;

    if (!nombre || !asiento || !fecha) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    agregarReservacion(nombre, asiento, fecha);

    // Limpiar el formulario
    form.reset();
});

// Manejar clics en el mapa de asientos
table.addEventListener('click', e => {
    if (e.target.tagName === 'TD') {
        const asiento = e.target.textContent.trim();

        const opciones = prompt(`Opciones para asiento ${asiento}: 
1. Editar 
2. Eliminar 
3. Cancelar`);

        switch (opciones) {
            case '1':
                editarReservacion(asiento);
                break;
            case '2':
                eliminarReservacion(asiento);
                break;
            case '3':
            default:
                break;
        }
    }
});
