const BlinkerDebug = require('./BlinkerDebug');
const EventEmitter = require('events');
const WebSocket = require('/usr/lib/node_modules/ws');
const wsPort = 81;
var debug = null;

function mDNSinit(type) {
    var exec = require('child_process').exec;

    exec('sudo python3 mdns_service.py ' + type + ' ' + wsPort + ' ',function(error,stdout,stderr){
        if(stdout.length >1){
            // BlinkerDebug.log(stdout);
            BlinkerDebug.log('mDNS responder init!');
        } else {
            BlinkerDebug.log('mDNS responder init failed!');
        }
        if(error) {
            BlinkerDebug.info('stderr : ', stderr);
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

class BlinkerLinuxWS extends EventEmitter {
    constructor (options) {
        super();

        options = Object.assign({
            type : 'DiyArduino'
        }, options);

        this.options = options;

        this._wss = null;
        this._debug = null;

        this.addListener('wsRead', parse);
    }

    setDebug(level) {
        if (level == 'BLINKER_DEBUG_ALL') {
            this._debug = level;
            setLevel(level)
        }
    }
    
    init() {
        // this.on('wsRead', function() {
        //     BlinkerDebug.log('wsRead received');
        //     // parse(message);
        // });

        mDNSinit(this.options.type)
        this._wss = new WebSocket.Server({ port: wsPort });
        BlinkerDebug.log('websocket Server init');
        BlinkerDebug.log('ws://' + getIPAdress() + ':' + wsPort);

        this._wss.on('connection', function connection(ws) {
            ws.on('message', function incoming(message) {
                BlinkerDebug.log('received: ', message);

                this.emit('wsRead', message);
            });

            ws.on('close', function close() {
                if (isDebugAll()) {
                    BlinkerDebug.log('Device disconnected');
                }
            });

            var conCMD = {'state':'connected'};

            ws.send(JSON.stringify(conCMD));
            
            if (isDebugAll()) {
                BlinkerDebug.log('Device connected!');
            }
        });
    }
}

module.exports = BlinkerLinuxWS;

function setLevel(level) {
    if (level == 'BLINKER_DEBUG_ALL') {
        debug = level;
    }
}

function isDebugAll() {
    return debug
}

function parse(msg) {
    data = JSON.parse(msg);

    BlinkerDebug.log('parse data: ', data);
}