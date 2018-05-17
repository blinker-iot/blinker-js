const WebSocket = require('/usr/lib/node_modules/ws');
var BlinkerDebug = require('./BlinkerDebug');
var type = 'DiyArduino';
var wsPort = 81;

function mDNSinit() {
    var exec = require('child_process').exec;

    exec('sudo python3 mdns_service.py ' + type + ' ' + wsPort + ' ',function(error,stdout,stderr){
        if(stdout.length >1){
            BlinkerDebug.log(stdout);
            // console.log('mDNS responder init!');
        } else {
            BlinkerDebug.log('mDNS responder init failed!');
        }
        if(error) {
            BlinkerDebug.info('stderr : '+stderr);
        }
    });
}

function getIPAdress() {
    var interfaces = require('os').networkInterfaces();
    for(var devName in interfaces) {
        var iface = interfaces[devName];
        for(var i=0;i<iface.length;i++) {
            var alias = iface[i];
            if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){  
                return alias.address;
            }
        }
    }
}

function wsInit() {
    mDNSinit()
    const wss = new WebSocket.Server({ port: wsPort });
    BlinkerDebug.log('websocket Server init');
    BlinkerDebug.log('ws://' + getIPAdress() + ':' + wsPort);

    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(message) {
            BlinkerDebug.log('received: %s', message);
        });

        var conCMD = {'state':'connected'};

        ws.send(JSON.stringify(conCMD));
    });
}

wsInit()
