const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').Server(app);
var io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
});

var clientes = []; // Lista de clientes conectados

//web tambien
//const PORT = 3000;
//server = app.listen(PORT, '0.0.0.0', () => {
//  console.log(`Servidor iniciado en ${PORT}`);
//});

// Configuración del servidor y middleware
app.use(express.static('public')); // Configuración de archivos estáticos
app.use(bodyParser.urlencoded({ extended: false })); // Configuración de body-parser para manejar solicitudes
app.use(bodyParser.json());
server.listen(8080, '0.0.0.0', () => console.log('Servidor iniciado en 8080')); // Iniciando servidor en el puerto 8080

// Rutas para servir archivos estáticos
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});
app.get('/chat/:username', function (req, res) {
  res.sendFile(__dirname + '/public/chat.html');
});

// Endpoint para iniciar sesión en el chat
app.post('/login', function (req, res) {
  let username = req.body.username;
  let id = req.body.id;
  clientes.push({ id: id, username: username });
  io.emit('socket_conectado', { id: id, username: username }); // Emitir evento de nuevo cliente conectado a todos los sockets
  return res.json(clientes); // Enviar la lista actualizada de clientes al cliente que hace la solicitud
});

// Endpoint para enviar mensajes en el chat
app.post('/send', function (req, res) {
  let username = req.body.username;
  let id = req.body.id;
  let msg = req.body.text;
  io.emit('mensaje', { id: id, msg: msg, username: username }); // Emitir el mensaje a todos los sockets conectados
  return res.json({ text: 'Mensaje enviado.' }); // Enviar respuesta al cliente que envió el mensaje
});

// Manejar conexiones de sockets
io.on('connection', socket => {
  console.log('Socket conectado', socket.id);

  // Manejar la desconexión de un socket
  socket.on('disconnect', () => {
    clientes = clientes.filter(cliente => cliente.id != socket.id); // Filtrar el cliente desconectado
    io.emit('socket_desconectado', { texto: 'Socket desconectado.', id: socket.id }); // Emitir evento de cliente desconectado a todos los sockets
  });
});