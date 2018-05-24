const BlinkerLinuxWS = require('./lib/BlinkerLinuxWS');
const BlinkerMQTT = require('./lib/BlinkerMQTT');
const BlinkerDebug = require('./lib/BlinkerDebug');
const Utility = require('./lib/BlinkerUtility');
ut = new Utility();

const EventEmitter = require('events');

// const LinuxWS = new BlinkerLinuxWS(null);
// const LinuxWS = new BlinkerLinuxWS({type:'DiyLinux'});
const BLINKER_CONNECTING                = 'connecting';
const BLINKER_CONNECTED                 = 'connected';
const BLINKER_DISCONNECTED              = 'disconnected';
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
const BLINKER_CMD_READ                  = 'read';
const BLINKER_JOYSTICK_VALUE_DEFAULT    = '128';


var Buttons = {};
var Sliders = {};
var Toggles = {};
var RGBs = {};
var JOY = {};
var AHRS = {};
var GPS = {};
var READ = {};
var sendBuf = {};

var debug = null;

class BlinkerProto extends EventEmitter {
    constructor (options) {
        super();

        this._proto = null;
        this._state = BLINKER_CONNECTING;

        this._isFormat = false;
    }

    setState(state) {
        this._state = state;
        this._proto.emit(state);
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
    constructor (type = 'BLINKER_WIFI') {
        super();

        // options = Object.assign({
        //     type : 'BLINKER_WIFI'
        // }, options);

        this._type = type;

        this._debug = null;

        this._conn1 = null;
        this._conn2 = null;
        this._dataFrom = null;

        // BlinkerDebug.log('this._type: ', this._type);

        if (this._type == 'BLINKER_WIFI') {
            this._conn1 = new BlinkerLinuxWS(null);
        }
        else if (this._type == 'BLINKER_MQTT') {
            this._conn1 = new BlinkerMQTT();
            this._dataFrom = 'BLINKER_MQTT';
            this._conn2 = new BlinkerLinuxWS({type : 'DiyArduinoMQTT'});
        }

        bProto.setProto(this);
    }

    millis() {
        return ut.millis();
    }

    setDebug(level) {
        if (level == 'BLINKER_DEBUG_ALL') {
            this._debug = level;
            setLevel(level)
        }
    }

    begin(auth) {
        if (this._type == 'BLINKER_WIFI') {
            // this._conn1.setDebug('BLINKER_DEBUG_ALL');
            this._conn1.init();
            this._conn1.on('wsRead', function(message) {
                if (isDebugAll()) {
                    BlinkerDebug.log('Blinker ws read: ', message);
                }
                parse(message);
            });
            this._conn1.on('wsConnected', function() {
                bProto.setState(BLINKER_CONNECTED);
            });
            this._conn1.on('wsDisconnected', function() {
                bProto.setState(BLINKER_DISCONNECTED);
            });
        }
        else if (this._type == 'BLINKER_MQTT') {
            this._conn1.init(auth);
            this._conn1.on('mInit', function(name) {
                bProto._proto._conn2.init(name);
                bProto._proto._conn2.on('wsRead', function(message) {
                    if (isDebugAll()) {
                        BlinkerDebug.log('Blinker ws read: ', message);
                    }
                    bProto._proto._dataFrom = 'BLINKER_WIFI';
                    parse(message);
                });
                bProto._proto._conn2.on('wsConnected', function() {
                    bProto.setState(BLINKER_CONNECTED);
                });
                bProto._proto._conn2.on('wsDisconnected', function() {
                    bProto.setState(BLINKER_DISCONNECTED);
                });
            });
            this._conn1.on('mRead', function(message) {
                if (isDebugAll()) {
                    BlinkerDebug.log('Blinker ws read: ', message);
                }
                bProto._proto._dataFrom = 'BLINKER_MQTT';
                parse(message);
            });
            this._conn1.on('mConnected', function() {
                bProto.setState(BLINKER_CONNECTED);
            });
            this._conn1.on('mDisconnected', function() {
                bProto.setState(BLINKER_DISCONNECTED);
            });
        }
    }

    beginFormat() {
        bProto._isFormat = true;
        sendBuf = {};
    }

    endFormat() {
        bProto._isFormat = false;
        this._print(JSON.stringify(sendBuf));
    }

    _print(msg) {
        if (this._type == 'BLINKER_WIFI') {
            if (isDebugAll()) {
                BlinkerDebug.log('Blinker ws print: ', msg);
            }
            if (bProto.connected()) {
                this._conn1.response(msg + BLINKER_CMD_NEWLINE);
                if (isDebugAll()) {
                    BlinkerDebug.log('Succese...');
                }
            }
            else {
                if (isDebugAll()) {
                    BlinkerDebug.log('Faile... Disconnected');
                }
            }
        }
        else if (this._type == 'BLINKER_MQTT') {
            if (isDebugAll()) {
                BlinkerDebug.log('Blinker mqtt pub: ', msg);
            }
            if (bProto.connected()) {
                this._conn1.pub(msg);
                if (isDebugAll()) {
                    BlinkerDebug.log('Succese...');
                }
            }
            else {
                if (isDebugAll()) {
                    BlinkerDebug.log('Faile... Disconnected');
                }
            }
        }
    }

    print(msg) {
        if (bProto._isFormat) {
            if (isJsonString(msg)) {
                msg = JSON.parse(msg);

                for (var key in msg) {
                    sendBuf[key] = msg[key];
                }
            }
        }
        else {
            this._print(msg);
        }
        // if (this._type == 'BLINKER_WIFI') {
        //     if (isDebugAll()) {
        //         BlinkerDebug.log('Blinker ws print: ', msg);
        //     }
        //     if (bProto.connected()) {
        //         this._conn1.response(msg + BLINKER_CMD_NEWLINE);
        //         if (isDebugAll()) {
        //             BlinkerDebug.log('Succese...');
        //         }
        //     }
        //     else {
        //         if (isDebugAll()) {
        //             BlinkerDebug.log('Faile... Disconnected');
        //         }
        //     }
        // }
        // else if (this._type == 'BLINKER_MQTT') {
        //     if (isDebugAll()) {
        //         BlinkerDebug.log('Blinker mqtt pub: ', msg);
        //     }
        //     if (bProto.connected()) {
        //         this._conn1.pub(msg);
        //         if (isDebugAll()) {
        //             BlinkerDebug.log('Succese...');
        //         }
        //     }
        //     else {
        //         if (isDebugAll()) {
        //             BlinkerDebug.log('Faile... Disconnected');
        //         }
        //     }
        // }
    }

    notify(msg) {
        var conCMD = {};
        conCMD[BLINKER_CMD_NOTICE] = msg;
        bProto._proto.print(JSON.stringify(conCMD));
    }

    read(cb) {
        READ[BLINKER_CMD_READ] = cb;

        bProto.on(BLINKER_CMD_READ, cb);
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
        var conCMD = {};
        conCMD[BLINKER_CMD_AHRS] = BLINKER_CMD_ON;

        if (this._type == 'BLINKER_WIFI') {
            if (bProto.connected()) {
                bProto._proto.print(JSON.stringify(conCMD));
            }
            else {
                this._conn1.once('wsConnected', function() {
                    bProto._proto.print(JSON.stringify(conCMD));
                });
            }
        }
    }

    detachAhrs() {
        var conCMD = {};
        conCMD[BLINKER_CMD_AHRS] = BLINKER_CMD_OFF;

        if (this._type == 'BLINKER_WIFI') {
            if (bProto.connected()) {
                bProto._proto.print(JSON.stringify(conCMD));
            }
            else {
                this._conn1.once('wsConnected', function() {
                    bProto._proto.print(JSON.stringify(conCMD));
                });
            }
        }
    }

    gps(cb) {
        GPS[BLINKER_CMD_GPS] = cb;

        bProto.on(BLINKER_CMD_GPS, cb);

        var conCMD = {};
        conCMD[BLINKER_CMD_GET] = BLINKER_CMD_GPS;

        if (this._type == 'BLINKER_WIFI') {
            if (bProto.connected()) {
                bProto._proto.print(JSON.stringify(conCMD));
            }
            else {
                this._conn1.once('wsConnected', function() {
                    bProto._proto.print(JSON.stringify(conCMD));
                });
            }
        }
    }

    vibrate(ms = 200) {
        var conCMD = {};
        conCMD[BLINKER_CMD_VIBRATE] = ms;
        bProto._proto.print(JSON.stringify(conCMD));
    }

    log(msg1, msg2, msg3, msg4, msg5, msg6) {
        BlinkerDebug.log(msg1, msg2, msg3, msg4, msg5, msg6);
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

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function parse(msg) {
    data = JSON.parse(msg);

    if (isDebugAll()) {
        BlinkerDebug.log('parse data: ', msg);
    }

    for (var key in data){  
        if (key in Buttons) {
            var value = data[key];
            // BlinkerDebug.log(value);
            bProto.emit(key, value);
            return;
        }
        else if (key in Sliders) {
            var value = data[key];
            // BlinkerDebug.log(value);
            bProto.emit(key, value);
            return;
        }
        else if (key in Toggles) {
            var value = data[key];
            // BlinkerDebug.log(value);
            bProto.emit(key, value);
            return;
        }
        else if (key in RGBs) {
            var value = data[key];
            bProto.emit(key, value);
            return;
        }
        else if (key in JOY) {
            var value = data[key];
            bProto.emit(key, value);
            return;
        }
        else if (key in AHRS) {
            var value = data[key];
            bProto.emit(key, value);
            return;
        }
        else if (key in GPS) {
            var value = data[key];
            bProto.emit(key, value);
            return;
        }
        else if (key == BLINKER_CMD_GET) {
            var value = data[key];
            // BlinkerDebug.log('have key ', key);
            // BlinkerDebug.log('have value ', value);

            if (value == BLINKER_CMD_VERSION) {
                // var conCMD = {BLINKER_CMD_VERSION:BLINKER_VERSION};
                var conCMD = {};
                conCMD[BLINKER_CMD_VERSION] = BLINKER_VERSION;
                bProto._proto.print(JSON.stringify(conCMD));
            }
            else if (value == BLINKER_CMD_STATE) {
                if (bProto._proto._type == 'BLINKER_WIFI') {
                    // var conCMD = {BLINKER_CMD_STATE:BLINKER_CMD_CONNECTED};
                    var conCMD = {};
                    conCMD[BLINKER_CMD_STATE] = BLINKER_CMD_CONNECTED;
                    bProto._proto.print(JSON.stringify(conCMD));
                }
                else if (bProto._proto._type == 'BLINKER_MQTT') {
                    // var conCMD = {BLINKER_CMD_STATE:BLINKER_CMD_CONNECTED};
                    var conCMD = {};
                    conCMD[BLINKER_CMD_STATE] = BLINKER_CMD_ONLINE;
                    bProto._proto.print(JSON.stringify(conCMD));
                }
            }
            return;
        }
        else {
            // if (bProto._proto._type == 'BLINKER_WIFI') {
            bProto.emit(BLINKER_CMD_READ, msg);
            return;
            // }
        }
    }

    if (bProto._proto._type == 'BLINKER_WIFI') {
        bProto.emit(BLINKER_CMD_READ, msg);
        return;
    }
}
