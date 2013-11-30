/**
 * Autor: Mario Pérez Esteso <mario@geekytheory.com>
 * Web: geekytheory.com
 */

var app = require('http').createServer(handler),
  io = require('socket.io').listen(app),
	fs = require('fs'),
  sys = require('util'),
  exec = require('child_process').exec,
  child;
//Escuchamos en el puerto 8000
app.listen(8000);
//Si todo va bien al abrir el navegador, cargaremos el archivo index.html
function handler(req, res) {
	fs.readFile(__dirname+'/../index.html', function(err, data) {
		if (err) {
      //Si hay error, mandaremos un mensaje de error 500
			console.log(err);
			res.writeHead(500);
			return res.end('Error loading index.html');
		}
		res.writeHead(200);
		res.end(data);
	});
}

//Cuando abramos el navegador estableceremos una conexión con socket.io.
//Cada 5 segundos mandaremos a la gráfica un nuevo valor. 
io.sockets.on('connection', function(socket) {
  var address = socket.handshake.address;
    console.log("New connection from " + address.address + ":" + address.port);
  setInterval(function(){
    child = exec("cat /sys/class/thermal/thermal_zone0/temp", function (error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    } else {
      //Es necesario mandar el tiempo (eje X) y un valor de temperatura (eje Y).
      var date = new Date().getTime();
      var temp = parseFloat(stdout)/1000;
      socket.emit('temperatureUpdate', date, temp); 
    }
  });}, 5000);
});