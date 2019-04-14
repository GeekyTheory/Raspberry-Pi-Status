/**
 * Autor: Mario Pérez Esteso <mario@geekytheory.com>
 * Web: geekytheory.com
 */
 
const {port, ip, intervals} = require('./config'),
  server = require('http').createServer(handler).listen(port, ip),
  io = require('socket.io').listen(server),
  fs = require('fs'),
  exec = require('child_process').exec;

    
var connectCounter = 0;
//Si todo va bien al abrir el navegador, cargaremos el archivo index.html
function handler(req, res) {
    fs.readFile(__dirname + '/index.html', function(err, data) {
        if (err) {
          //Si hay error, mandaremos un mensaje de error 500
          console.log(err);
          res.writeHead(500);
          res.end('Error loading index.html');
        } else {
          res.writeHead(200);
          res.end(data); 
        }
    });
}

//Cuando abramos el navegador estableceremos una conexión con socket.io.
//Cada X segundos mandaremos a la gráfica un nuevo valor. 
io.sockets.on('connection', function(socket) {
    var memTotal, memUsed = 0,
        memFree = 0,
        memBuffered = 0,
        memCached = 0,
        sendData = 1,
        percentBuffered, percentCached, percentUsed, percentFree;
    var address = socket.handshake.address;

    console.log("New connection from " + address.address + ":" + address.port);
    connectCounter++;
    console.log("NUMBER OF CONNECTIONS++: " + connectCounter);
    socket.on('disconnect', function() {
        connectCounter--;
        console.log("NUMBER OF CONNECTIONS--: " + connectCounter);
    });

    // Function for checking memory
    exec("egrep --color 'MemTotal' /proc/meminfo | egrep '[0-9.]{4,}' -o", function(error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        } else {
            memTotal = stdout;
            socket.emit('memoryTotal', stdout);
        }
    });

    exec("hostname", function(error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        } else {
            socket.emit('hostname', stdout);
        }
    });

    exec("uptime | tail -n 1 | awk '{print $1}'", function(error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        } else {
            socket.emit('uptime', stdout);
        }
    });

    exec("uname -r", function(error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        } else {
            socket.emit('kernel', stdout);
        }
    });

    exec("top -d 0.5 -b -n2 | tail -n 10 | awk '{print $12}'", function(error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        } else {
            socket.emit('toplist', stdout);
        }
    });


    setInterval(function() {
        // Function for checking memory free and used
        exec("egrep --color 'MemFree' /proc/meminfo | egrep '[0-9.]{4,}' -o", function(error, stdout, stderr) {
            if (error == null) {
                memFree = stdout;
                memUsed = parseInt(memTotal) - parseInt(memFree);
                percentUsed = Math.round(parseInt(memUsed) * 100 / parseInt(memTotal));
                percentFree = 100 - percentUsed;
            } else {
                sendData = 0;
                console.log('exec error: ' + error);
            }
        });

        // Function for checking memory buffered
        exec("egrep --color 'Buffers' /proc/meminfo | egrep '[0-9.]{4,}' -o", function(error, stdout, stderr) {
            if (error == null) {
                memBuffered = stdout;
                percentBuffered = Math.round(parseInt(memBuffered) * 100 / parseInt(memTotal));
            } else {
                sendData = 0;
                console.log('exec error: ' + error);
            }
        });

        // Function for checking memory buffered
        exec("egrep --color 'Cached' /proc/meminfo | egrep '[0-9.]{4,}' -o", function(error, stdout, stderr) {
            if (error == null) {
                memCached = stdout;
                percentCached = Math.round(parseInt(memCached) * 100 / parseInt(memTotal));
            } else {
                sendData = 0;
                console.log('exec error: ' + error);
            }
        });

        if (sendData == 1) {
            socket.emit('memoryUpdate', percentFree, percentUsed, percentBuffered, percentCached);
        } else {
            sendData = 1;
        }
        
        
        
              // Function for measuring temperature
        exec("cat /sys/class/thermal/thermal_zone0/temp", function(error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error);
            } else {
                //Es necesario mandar el tiempo (eje X) y un valor de temperatura (eje Y).
                var date = new Date().getTime();
                var temp = parseFloat(stdout) / 1000;
                socket.emit('temperatureUpdate', date, temp);
            }
        });
    }, intervals.short);

    // Uptime
    setInterval(function() {
        exec("uptime | tail -n 1 | awk '{print $3 $4 $5}'", function(error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error);
            } else {
                socket.emit('uptime', stdout);
            }
        });
    }, intervals.medium);

    // TOP list
    setInterval(function() {
        exec("ps aux --width 30 --sort -rss --no-headers | head  | awk '{print $11}'", function(error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error);
            } else {
                socket.emit('toplist', stdout);
            }
        });
        
        exec("top -d 0.5 -b -n2 | grep 'Cpu(s)'|tail -n 1 | awk '{print $2 + $4}'", function(error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error);
            } else {
                //Es necesario mandar el tiempo (eje X) y un valor de temperatura (eje Y).
                var date = new Date().getTime();
                socket.emit('cpuUsageUpdate', date, parseFloat(stdout));
            }
        });
    }, intervals.long);
});


//Escuchamos en el puerto $port
server.listen(port);