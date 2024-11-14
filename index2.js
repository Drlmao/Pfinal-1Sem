document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const errorMessage = document.getElementById('error-message');
    const appContent = document.getElementById('app-content');
    const emailForm = document.getElementById('email-form');
    const userInfo = document.getElementById('user-info');
    const userEmailDisplay = document.getElementById('user-email');
    const logoutButton = document.getElementById('logout-button');
    const notificationsToggle = document.getElementById('notifications-toggle'); // Checkbox para notificaciones
    const notificationSettings = document.getElementById('notification-settings'); // Sección de notificaciones

    // Verificar si el correo ya está guardado en localStorage
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
        userEmailDisplay.textContent = savedEmail;
        userInfo.style.display = 'block'; // Mostrar el contenedor de usuario
        appContent.style.display = 'block'; // Mostrar el contenido de la aplicación
        emailForm.style.display = 'none'; // Ocultar el formulario de email
        notificationSettings.style.display = 'block'; // Mostrar configuración de notificaciones
    }

    document.getElementById('submit-email').addEventListener('click', function() {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailPattern.test(emailInput.value)) {
            errorMessage.style.display = 'none'; // Ocultar mensaje de error
            localStorage.setItem('userEmail', emailInput.value); // Guardar correo en localStorage
            userEmailDisplay.textContent = emailInput.value; // Mostrar correo en la UI
            userInfo.style.display = 'block'; // Mostrar contenedor de usuario
            appContent.style.display = 'block'; // Mostrar contenido de la aplicación
            emailForm.style.display = 'none'; // Ocultar formulario de email
            notificationSettings.style.display = 'block'; // Mostrar configuración de notificaciones
        } else {
            errorMessage.textContent = 'Por favor, ingrese un correo electrónico válido.';
            errorMessage.style.display = 'block'; // Mostrar mensaje de error

        }
    });

    // Cerrar sesión
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('userEmail'); // Eliminar el correo de localStorage
        userInfo.style.display = 'none'; // Ocultar contenedor de usuario
        appContent.style.display = 'none'; // Ocultar contenido de la aplicación
        emailForm.style.display = 'block'; // Mostrar formulario de email
        notificationSettings.style.display = 'none'; // Ocultar configuración de notificaciones
    });

    // Pedir permiso para enviar notificaciones al usuario
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission !== 'granted') {
                console.log('Permiso de notificación denegado.');
            }
        });
    }

    // Verificar tareas periódicamente
    setInterval(checkTaskDeadlines, 30 * 1000); // Verificar cada minuto

    // Manejar el estado del checkbox de notificaciones
    const notificationsEnabled = JSON.parse(localStorage.getItem('notificationsEnabled')) || false;
    notificationsToggle.checked = notificationsEnabled;

    notificationsToggle.addEventListener('change', function () {
        const isChecked = notificationsToggle.checked;
        localStorage.setItem('notificationsEnabled', JSON.stringify(isChecked));
        console.log(`Notificaciones ${isChecked ? 'activadas' : 'desactivadas'}`);
    });
});

// Lógica de tareas
let tasks = JSON.parse(localStorage.getItem('tasks')) || []; // Cargar tareas del Local Storage
let editTaskId = null;

// Mostrar tareas existentes al cargar la página
updateTaskList();

document.getElementById('task-form').addEventListener('submit', addTask);
document.getElementById('filter').addEventListener('change', updateTaskList); // Añadir un evento para filtrar al cambiar la selección

function addTask(e) {
    e.preventDefault();

    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const dueDate = document.getElementById('task-due-date').value;
    const priority = document.getElementById('task-priority').value;

    if (!title || !dueDate) {
        alert("Completa los campos faltantes.");
        return;
    }

    if (editTaskId) {
        const taskIndex = tasks.findIndex(t => t.id === editTaskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                id: editTaskId,
                title,
                description,
                dueDate,
                priority,
                completed: tasks[taskIndex].completed // Mantener el estado de completado
            };
        }
        editTaskId = null; // Reiniciar editTaskId
    } else {
        const task = {
            id: Date.now(),
            title,
            description,
            dueDate,
            priority,
            completed: false
        };
        tasks.push(task);
    }

    updateTaskList();
    e.target.reset();
    saveTasks(); // Guardar tareas en Local Storage
}

document.getElementById('task-search').addEventListener('input', updateTaskList);

function updateTaskList() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';

    const filter = document.getElementById('filter').value;
    const searchQuery = document.getElementById('task-search').value.toLowerCase();

    let filteredTasks = [...tasks];

    // Aplicar filtro de búsqueda
    if (searchQuery) {
        filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(searchQuery) || 
            task.description.toLowerCase().includes(searchQuery)
        );
    }

    // Aplicar el filtro de ordenación
    if (filter === 'none') {
        const priorityOrder = { 'alta': 0, 'media': 1, 'baja': 2 };
        filteredTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (filter === 'name-asc') {
        filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filter === 'name-desc') {
        filteredTasks.sort((a, b) => b.title.localeCompare(a.title));
    } else if (filter === 'date-asc') {
        filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (filter === 'date-desc') {
        filteredTasks.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
    } else if (filter === 'status-asc') {
        filteredTasks.sort((a, b) => a.completed - b.completed);
    } else if (filter === 'status-desc') {
        filteredTasks.sort((a, b) => b.completed - a.completed);
    }

    filteredTasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');
        taskItem.setAttribute('data-priority', task.priority);
        taskItem.innerHTML = `
            <h3>${task.title} <small>(Prioridad: ${task.priority})</small></h3>
            <p class="description">${task.description}</p>
            <p>Fecha de vencimiento: ${task.dueDate}</p>
            <p>Estado: ${task.completed ? 'Completada' : 'Incompleta'}</p>
            <button onclick="toggleComplete(${task.id})">${task.completed ? 'Marcar como incompleta' : 'Marcar como completada'}</button>
            <button onclick="editTask(${task.id})">Editar</button>
            <button onclick="confirmDelete(${task.id})">Eliminar</button>
        `;
        taskList.appendChild(taskItem);
    });
}


function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        if (task.completed) {
            if (confirm("¿Estás seguro de que deseas marcar esta tarea como incompleta?")) {
                task.completed = false; // Marcar como incompleta
                updateTaskList(); // Actualizar la lista para reflejar el cambio
                saveTasks(); // Guardar tareas en Local Storage
            }
        } else {
            if (confirm("¿Estás seguro de que deseas marcar esta tarea como completada?")) {
                task.completed = true; // Marcar como completada
                updateTaskList(); // Actualizar la lista para reflejar el cambio
                saveTasks(); // Guardar tareas en Local Storage
            }
        }
    }
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description;
        document.getElementById('task-due-date').value = task.dueDate;
        document.getElementById('task-priority').value = task.priority;
        editTaskId = id; // Guardar el ID de la tarea que se está editando
    }
}

function confirmDelete(id) {
    if (confirm("¿Estás seguro de que deseas eliminar esta tarea?")) {
        deleteTask(id);
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    updateTaskList(); // Actualizar la lista de tareas
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks)); // Guardar tareas en Local Storage
}

// Función para verificar las fechas de vencimiento
// Función para verificar las fechas de vencimiento de las tareas
function checkTaskDeadlines() {
    const notificationsEnabled = JSON.parse(localStorage.getItem('notificationsEnabled'));
    console.log("Checked deadlines  ")
    if (!notificationsEnabled) {
        console.log('Notificaciones desactivadas, no se enviarán recordatorios.');
        return;
    }

    const now = new Date();
    tasks.forEach(task => {
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate - now;
        const oneDay = 24 * 60 * 60 * 1000; // Milisegundos en un día

        // Si la tarea no está completada y queda 1 día o menos
        if (!task.completed && timeDiff <= oneDay && timeDiff > 0) {
            showNotification(`La tarea "${task.title}" vence mañana`);
        }

        // Si la tarea está vencida y no está completada
        if (!task.completed && timeDiff < 0) {
            showNotification(`La tarea "${task.title}" ha vencido`);
        }
    });
}


// Función para mostrar notificaciones
function showNotification(message) {
    if (Notification.permission === 'granted') {
        new Notification('Recordatorio de EstudiaPro', {
            body: message,
            image: "noti.png"
        });
    } else {
        console.log("Permiso de notificación no concedido")
    }
}
