const BlinkerLinuxWS = require('./BlinkerLinuxWS');
const BlinkerDebug = require('./BlinkerDebug');

const EventEmitter = require('events');

// const LinuxWS = new BlinkerLinuxWS(null);
// const LinuxWS = new BlinkerLinuxWS({type:'DiyLinux'});
const BLINKER_CONNECTING                = 'CONNECTING';
const BLINKER_CONNECTED                 = 'CONNECTED';
const BLINKER_DISCONNECTED              = 'DISCONNECTED';
const BLINKER_VERSION                   = '0.1.0';
const BLINKER_CMD_ON                    = 'on';
const BLINKER_CMD_OFF                   = 'off';
const BLINKER_CMD_JOYSTICK              = 'joy';
const BLINKER_CMD_GYRO                  = 'gyro';
const BLINKER_CMD_AHRS                  = 'ahrs';
const BLINKER_CMD_GPS                   = 'gps';
const BLINKER_CMD_VIBRATE               = 'vibrate';
const BLINKER_CMD_BUTTON_TAP            = 'tap';
const BLINKER_CMD_BUTTON_PRESSED        = 'press';
const BLINKER_CMD_BUTTON_RELEASED       = 'pressup';
const BLINKER_CMD_NEWLINE               = '\n'
const BLINKER_CMD_INTERSPACE            = ' '
const BLINKER_CMD_GET                   = 'get'
const BLINKER_CMD_STATE                 = 'state'
const BLINKER_CMD_ONLINE                = 'online'
const BLINKER_CMD_CONNECTED             = 'connected'
const BLINKER_CMD_VERSION               = 'version'
const BLINKER_CMD_NOTICE                = 'notice'
const BLINKER_CMD_NOTFOUND              = 'device not found'
const BLINKER_JOYSTICK_VALUE_DEFAULT    = '128';


var Buttons = {};
var Sliders = {};
var Toggles = {};
var RGBs = {};
var JOY = {};
var AHRS = {};
var GPS = {};

var debug = null;

class BlinkerProto extends EventEmitter {
    constructor (options) {
        super();

        this._proto = null;
        this._state = BLINKER_CONNECTING;
    }

    setState(state) {
        this._state = state;
    }

    setProto(proto) {
        this._proto = proto;
    }

    read(message) {
        // BlinkerDebug.log('this._proto.test!');
        this._proto.emit('wsRead', message);
    }

    connected() {
        if (this._state == BLINKER_CONNECTED) {
            return true;
        }
        else {
            return false;
        }
    }
}

const bProto = new BlinkerProto();

class Blinker extends EventEmitter {
    constructor (options) {
        super();

        options = Object.assign({
            type : 'BLINKER_WIFI'
        }, options);

        this.options = options;

        this._debug = null;

        this._conn1 = null;
        this._conn2 = null;

        BlinkerDebug.log('this.options.type: ', this.options.type);

        if (this.options.type == 'BLINKER_WIFI') {
            this._conn1 = new BlinkerLinuxWS(null);
        }

        bProto.setProto(this);
    }

    setDebug(level) {
        if (level == 'BLINKER_DEBUG_ALL') {
            this._debug = level;
            setLevel(level)
        }
    }

    begin() {
        if (this.options.type == 'BLINKER_WIFI') {
            this._conn1.setDebug('BLINKER_DEBUG_ALL');
            this._conn1.init();
            this._conn1.on('wsRead', function(message) {
                BlinkerDebug.log('Blinker ws read: ', message);
                parse(message);
            });
            this._conn1.on('wsConnected', function() {
                bProto.setState(BLINKER_CONNECTED);
            });
            this._conn1.on('wsDisconnected', function() {
                bProto.setState(BLINKER_DISCONNECTED);
            });
        }
    }

    print(msg) {
        if (this.options.type == 'BLINKER_WIFI') {
            BlinkerDebug.log('Blinker ws print: ', msg);
            if (bProto.connected()) {
                this._conn1.response(msg);
                BlinkerDebug.log('Succese...');
            }
            else {
                BlinkerDebug.log('Faile... Disconnected');
            }
        }
    }

    button(name, cb) {
        if (name in Buttons) {
            return
        }
        else {
            // var data = [BLINKER_CMD_BUTTON_RELEASED, cb];
            // Buttons[name] = data;
            Buttons[name] = cb;

            // BlinkerDebug.log('Buttons[name][0]: ', Buttons[name][0]);
            // bProto.on(name, Buttons[name][1]);
            bProto.on(name, cb);
        }
    }

    slider(name, cb) {
        if (name in Sliders) {
            return
        }
        else {
            // var data = ['0', cb];
            // Sliders[name] = data;
            Sliders[name] = cb;

            // BlinkerDebug.log('Sliders[name][0]: ', Sliders[name][0]);
            // bProto.on(name, Sliders[name][1]);
            bProto.on(name, cb);
        }
    }

    toggle(name, cb) {
        if (name in Toggles) {
            return
        }
        else {
            // var data = [BLINKER_CMD_OFF, cb];
            // Toggles[name] = data;
            Toggles[name] = cb;

            // BlinkerDebug.log('Toggles[name][0]: ', Toggles[name][0]);
            // bProto.on(name, Toggles[name][1]);
            bProto.on(name, cb);
        }
    }

    rgb(name, cb) {
        if (name in RGBs) {
            return
        }
        else {
            RGBs[name] = cb;
            bProto.on(name, cb);
        }
    }

    joystick(cb) {
        JOY[BLINKER_CMD_JOYSTICK] = cb;

        bProto.on(BLINKER_CMD_JOYSTICK, cb);
    }

    ahrs(cb) {
        AHRS[BLINKER_CMD_AHRS] = cb;

        bProto.on(BLINKER_CMD_AHRS, cb);
    }

    attachAhrs() {
        if (this.options.type == 'BLINKER_WIFI') {
            this._conn1.once('wsConnected', function() {
                var conCMD = {};
                conCMD[BLINKER_CMD_AHRS] = BLINKER_CMD_ON;
                bProto._proto.print(JSON.stringify(conCMD));
            });
        }
    }

    detachAhrs() {
        if (this.options.type == 'BLINKER_WIFI') {
            this._conn1.once('wsDisconnected', function() {
                var conCMD = {};
                conCMD[BLINKER_CMD_AHRS] = BLINKER_CMD_OFF;
                bProto._proto.print(JSON.stringify(conCMD));
            });
        }
    }

    gps(cb) {
        GPS[BLINKER_CMD_GPS] = cb;

        bProto.on(BLINKER_CMD_GPS, cb);
        if (this.options.type == 'BLINKER_WIFI') {
            this._conn1.once('wsConnected', function() {
                var conCMD = {};
                conCMD[BLINKER_CMD_GET] = BLINKER_CMD_GPS;
                bProto._proto.print(JSON.stringify(conCMD));
            });
        }
    }
}

module.exports = Blinker;

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

    BlinkerDebug.log('parse data: ', msg);

    for (var key in data){  
        if (key in Buttons) {
            var value = data[key];
            BlinkerDebug.log(value);
            bProto.emit(key, value);
        }
        else if (key in Sliders) {
            var value = data[key];
            BlinkerDebug.log(value);
            bProto.emit(key, value);
        }
        else if (key in Toggles) {
            var value = data[key];
            BlinkerDebug.log(value);
            bProto.emit(key, value);
        }
        else if (key in RGBs) {
            var value = data[key];
            bProto.emit(key, value);
        }
        else if (key in JOY) {
            var value = data[key];
            bProto.emit(key, value);
        }
        else if (key in AHRS) {
            var value = data[key];
            bProto.emit(key, value);
        }
        else if (key in GPS) {
            var value = data[key];
            bProto.emit(key, value);
        }
        else if (key == BLINKER_CMD_GET) {
            var value = data[key];
            BlinkerDebug.log('have key ', key);
            BlinkerDebug.log('have value ', value);

            if (value == BLINKER_CMD_VERSION) {
                // var conCMD = {BLINKER_CMD_VERSION:BLINKER_VERSION};
                var conCMD = {};
                conCMD[BLINKER_CMD_VERSION] = BLINKER_VERSION;
                bProto._proto.print(JSON.stringify(conCMD));
            }
            else if (value == BLINKER_CMD_STATE) {
                if (bProto._proto.options.type == 'BLINKER_WIFI') {
                    // var conCMD = {BLINKER_CMD_STATE:BLINKER_CMD_CONNECTED};
                    var conCMD = {};
                    conCMD[BLINKER_CMD_STATE] = BLINKER_CMD_CONNECTED;
                    bProto._proto.print(JSON.stringify(conCMD));
                }
            }
        }
    }
}
