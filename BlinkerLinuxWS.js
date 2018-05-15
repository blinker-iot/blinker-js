const WebSocket = require('/usr/lib/node_modules/ws');
var type = 'DiyArduino';
var wsPort = 81;

function mDNSService(){
    var exec = require('child_process').exec;

    exec('sudo python3 mdns_service.py ' + type + ' ' + wsPort + ' ',function(error,stdout,stderr){
        if(stdout.length >1){
            // console.log(stdout);
            console.log('mDNS responder init!');
        } else {
            console.log('mDNS responder init failed!');
        }
        if(error) {
            console.info('stderr : '+stderr);
        }
    });
}

function getIPAdress(){
    var interfaces = require('os').networkInterfaces();
    for(var devName in interfaces){
        var iface = interfaces[devName];
        for(var i=0;i<iface.length;i++){
            var alias = iface[i];
            if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){  
                return alias.address;
            }
        }
    }
}

mDNSService()
const wss = new WebSocket.Server({ port: wsPort });
console.log('websocket Server init');
console.log('ws://' + getIPAdress() + ':' + wsPort);

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    ws.send('something');
});
