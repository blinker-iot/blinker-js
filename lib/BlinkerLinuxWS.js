const BlinkerDebug = require('./BlinkerDebug');

const EventEmitter = require('events');
const WebSocket = require('/usr/lib/node_modules/ws');
const mdns = require('/usr/lib/node_modules/mdns-js');
const wsPort = 81;
var debug = null;
var deviceName = null;

function mDNSinit(type) {
    var exec = require('child_process').exec;

    // exec('sudo python3 mdns_service.py ' + type + ' ' + wsPort + ' ',function(error,stdout,stderr){
    //     if(stdout.length >1){
    //         // BlinkerDebug.log(stdout);
    //         BlinkerDebug.log('mDNS responder init!');
    //     } else {
    //         BlinkerDebug.log('mDNS responder init failed!');
    //     }
    //     if(error) {
    //         BlinkerDebug.info('stderr : ', stderr);
    //     }
    // });

    exec('sudo python3 /usr/lib/node_modules/blinker/lib/macAddr.py ',function(error,stdout,stderr){
        if (stdout.length > 1) {
            macAddr = stdout.slice(0, 12);
            // BlinkerDebug.log(macAddr);
            deviceName = macAddr;
            // BlinkerDebug.log('mDNS responder init!');
            var service = mdns.createAdvertisement(mdns.tcp('_' + type), wsPort, {
                name: deviceName,
                txt:{
                    'deviceType': type
                }
            });
            service.start();
            BlinkerDebug.log('mDNS responder init!');
        } else {
            BlinkerDebug.log('mDNS responder init failed!');
        }
        if(error) {
            BlinkerDebug.log('stderr : ', stderr);
        }
    });


    // console.log('should advertise a http service on port 9876');
    // var service = mdns.createAdvertisement(mdns.tcp('_' + type), wsPort, {
    //     name: deviceName,
    //     txt:{
    //         'deviceType': type
    //     }
    // });
    // service.start();
    // BlinkerDebug.log('mDNS responder init!');
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

class ProtoWS extends EventEmitter {
    constructor (options) {
        super();

        this._proto = null;
        this._conn = null;
    }

    setProto(proto) {
        this._proto = proto;
    }

    setConn(conn) {
        this._conn = conn;
    }

    read(message) {
        // BlinkerDebug.log('this._proto.test!');
        this._proto.emit('wsRead', message);
    }

    connected() {
        this._proto.emit('wsConnected');
    }

    disconnected() {
        this._proto.emit('wsDisconnected');
    }
}

const proto_ws = new ProtoWS();

class BlinkerLinuxWS extends EventEmitter {
    constructor (options) {
        super();

        options = Object.assign({
            type : 'DiyArduino'
        }, options);

        this.options = options;

        this._wss = null;
        this._ws = null;
        this._debug = null;

        proto_ws.setProto(this);
    }

    setDebug(level) {
        if (level == 'BLINKER_DEBUG_ALL') {
            this._debug = level;
            setLevel(level)
        }
    }
    
    init() {
        mDNSinit(this.options.type)
        this._wss = new WebSocket.Server({ port: wsPort });
        BlinkerDebug.log('websocket Server init');
        BlinkerDebug.log('ws://' + getIPAdress() + ':' + wsPort);

        this._wss.on('connection', function connection(ws) {
            proto_ws.setConn(ws);
            if (isDebugAll()) {
                BlinkerDebug.log('Device connected!');
            }
            proto_ws.connected();

            ws.on('message', function incoming(message) {
                if (isDebugAll()) {
                    BlinkerDebug.log('received: ', message);
                }
                proto_ws.read(message);
            });            

            ws.on('close', function close() {
                if (isDebugAll()) {
                    BlinkerDebug.log('Device disconnected');
                }
                proto_ws.disconnected();
            });

            var conCMD = {'state':'connected'};

            ws.send(JSON.stringify(conCMD));
        });
    }

    response(msg) {
        proto_ws._conn.send(msg);
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
