/**
 * Autor: Mario Pérez Esteso <mario@geekytheory.com>
 * Web: geekytheory.com
 */
 
const {port, ip, intervals} = require('./config'),
  {serverHandler, execHandler, errorHandler, counterAdd, counterLess} = require('./utils'),
  server = require('http').createServer(serverHandler).listen(port, ip),
  io = require('socket.io').listen(server);


//Cuando abramos el navegador estableceremos una conexión con socket.io.
//Cada X segundos mandaremos a la gráfica un nuevo valor. 
io.sockets.on('connection', function(socket) {
    const address = socket.handshake.address;
    console.log("New connection from " + address.address + ":" + address.port);
    console.log("NUMBER OF CONNECTIONS++: " + counterAdd());
    socket.on('disconnect', function() {
        console.log("NUMBER OF CONNECTIONS--: " + counterLess());
    });

    // Function for checking memory
    execHandler("egrep --color 'MemTotal' /proc/meminfo | egrep '[0-9.]{4,}' -o")
      .then(stdout => {
        socket.emit('memoryTotal', stdout);
      })
      .catch(errorHandler);
    
    execHandler("hostname")
      .then(stdout => socket.emit('hostname', stdout))
      .catch(errorHandler);

    execHandler("uptime | tail -n 1 | awk '{print $1}'")
      .then(stdout => socket.emit('uptime', stdout))
      .catch(errorHandler);
      
    execHandler("uname -r")
      .then(stdout => socket.emit('kernel', stdout))
      .catch(errorHandler);

    execHandler("top -d 0.5 -b -n2 | tail -n 10 | awk '{print $12}'")
      .then(stdout => socket.emit('toplist', stdout))
      .catch(errorHandler);


    setInterval(function() {

        Promise.all([
            execHandler("egrep --color 'MemFree' /proc/meminfo | egrep '[0-9.]{4,}' -o"),
            execHandler("egrep --color 'Buffers' /proc/meminfo | egrep '[0-9.]{4,}' -o"),
            execHandler("egrep --color 'Cached' /proc/meminfo | egrep '[0-9.]{4,}' -o"),
            execHandler("egrep --color 'MemTotal' /proc/meminfo | egrep '[0-9.]{4,}' -o")
          ])
          .then(stdouts => {
            const memFree = stdouts[0];
            const memBuffered = stdouts[1];
            const memCached = stdouts[2];
            const memTotal = stdouts[3];
            
            const memUsed = parseInt(memTotal, 10) - parseInt(memFree, 10);
            const percentUsed = Math.round(parseInt(memUsed, 10) * 100 / parseInt(memTotal, 10));
            const percentFree = 100 - percentUsed;
            const percentBuffered = Math.round(parseInt(memBuffered, 10) * 100 / parseInt(memTotal, 10));
            const percentCached = Math.round(parseInt(memCached, 10) * 100 / parseInt(memTotal, 10));
            
            socket.emit('memoryUpdate', percentFree, percentUsed, percentBuffered, percentCached);
            
          }).catch(errorHandler);
 

        // Function for measuring temperature
        execHandler("cat /sys/class/thermal/thermal_zone0/temp")
          .then(stdout => {
            const date = new Date().getTime();
            const temp = parseFloat(stdout) / 1000;
            socket.emit('temperatureUpdate', date, temp);
          })
          .catch(errorHandler);

    }, intervals.short);

    // Uptime
    setInterval(function() {
        execHandler("uptime | tail -n 1 | awk '{print $3 $4 $5}'")
          .then(stdout => socket.emit('uptime', stdout))
          .catch(errorHandler);
          
    }, intervals.medium);

    // TOP list
    setInterval(function() {
        execHandler("ps aux --width 30 --sort -rss --no-headers | head  | awk '{print $11}'")
          .then(stdout => socket.emit('toplist', stdout))
          .catch(errorHandler);

        execHandler("top -d 0.5 -b -n2 | grep 'Cpu(s)'|tail -n 1 | awk '{print $2 + $4}'")
          .then(stdout => {
            const date = new Date().getTime();
            socket.emit('cpuUsageUpdate', date, parseFloat(stdout));
          })
          .catch(errorHandler);
        
    }, intervals.long);
});


//Escuchamos en el puerto $port
server.listen(port);