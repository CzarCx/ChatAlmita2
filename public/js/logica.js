// Establecer la conexión del socket con el servidor
var socket = io.connect('https://chat-oli.onrender.com');
//const socket = io("ws://urlserverhost.com:3000", { //cambiar url host
//  transports: ["websocket"]   //WEB
//});

// Elementos del DOM
var list = document.querySelector('#lista-users'); // Lista de usuarios
var username = window.location.pathname.replace('/chat/', ''); // Nombre de usuario obtenido de la URL
var clientes = []; // Lista de clientes conectados


// Función para conectar al chat
function conectarChat() {
  var id = socket.id; // Obtener el ID del socket actual
  console.log('id:', socket.id, 'useranme:', username);

  // Realizar una solicitud POST al servidor para iniciar sesión con el nombre de usuario y el ID del socket
  $.post('/login', { username: username, id: id }, function (data) {
    console.log(data);
    clientes = data; // Actualizar la lista de clientes con la respuesta del servidor
    list.innerHTML += 'Cargando...';
    var html = '';
    // Generar la lista de usuarios conectados para mostrar en la interfaz
    clientes.forEach(function (cliente) {
      html += '<li>' + cliente.username + '</li>';
    });
    list.innerHTML = html; // Mostrar la lista de usuarios en el DOM
    $('.loader').hide(); // Ocultar el indicador de carga
  });
  
  // Establecer como conectado y habilitar el campo de entrada y el contenedor de chat
  isConnected = true;
  document.getElementById('input').disabled = false;
  document.getElementById('chat-container').style.display = 'block';
}

// Función para enviar un mensaje
function enviarMensaje(e) {
  if (!isConnected) {
    return;
  }

  if (e.which != 13) return; // Verificar si la tecla presionada es 'Enter'
  var msg = document.querySelector('#input').value; // Obtener el mensaje del campo de entrada
  if (msg.length <= 0) return; // Verificar si el mensaje está vacío

  // Enviar el mensaje al servidor utilizando una solicitud POST
  $.post('/send', {
    text: msg,
    username: username,
    id: socket.id
  }, function (data) {
    document.querySelector('#input').value = ''; // Limpiar el campo de entrada después de enviar el mensaje

    // Desplazar hacia abajo al contenedor de mensajes para mostrar el nuevo mensaje
    var mensajesContainer = document.querySelector('.mensajes-container');
    mensajesContainer.scrollTop = mensajesContainer.scrollHeight;
  });
}

// Escuchar el evento 'mensaje' del socket
socket.on('mensaje', function (data) {
  // Procesar el mensaje recibido y mostrarlo en la interfaz de usuario
  data.username = data.username.replace('</', '');
  var sanitized = data.msg.replace('</', '');
  sanitized = sanitized.replace('>', '');
  sanitized = sanitized.replace('<', '');
  if (data.id == socket.id) {
    // Mostrar mensajes propios en un estilo específico
    var msj = `
      <div class="local-message">
        <strong>${data.username}: </strong>
        <p>${sanitized}</p>
      </div>
    `;
    document.querySelector('.mensajes-container').innerHTML += msj;
  } else {
    // Mostrar mensajes de otros usuarios en otro estilo
    var msj = `
      <div class="remote-message">
        <strong>${data.username}: </strong>
        <p>${sanitized}</p>
      </div>
    `;
    document.querySelector('.mensajes-container').innerHTML += msj;
  }
});

// Escuchar el evento 'socket_desconectado' del socket
socket.on('socket_desconectado', function (data) {
  console.log(data);
  // Eliminar al cliente desconectado de la lista de clientes
  clientes = clientes.filter(function (cliente) {
    return cliente.id != data.id;
  });
  list.innerHTML += 'Cargando...';
  var html = '';
  // Actualizar la lista de usuarios conectados en el DOM
  clientes.forEach(function (cliente) {
    html += '<li>' + cliente.username + '</li>';
  });
  list.innerHTML = html;
});

// Escuchar el evento 'socket_conectado' del socket
socket.on('socket_conectado', function (data) {
  console.log(data);
  // Agregar al cliente recién conectado a la lista de clientes
  clientes.push(data);
  list.innerHTML += 'Cargando...';
  var html = '';
  // Actualizar la lista de usuarios conectados en el DOM
  clientes.forEach(function (cliente) {
    html += '<li>' + cliente.username + '</li>';
  });
  list.innerHTML = html;
});