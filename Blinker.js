const BlinkerLinuxWS = require('./BlinkerLinuxWS');
const BlinkerDebug = require('./BlinkerDebug');

const EventEmitter = require('events');

// const LinuxWS = new BlinkerLinuxWS(null);
// const LinuxWS = new BlinkerLinuxWS({type:'DiyLinux'});

const BLINKER_CMD_BUTTON_TAP            = 'tap';
const BLINKER_CMD_BUTTON_PRESSED        = 'press';
const BLINKER_CMD_BUTTON_RELEASED       = 'pressup';

var Buttons = {};

var debug = null;

class BlinkerProto extends EventEmitter {
    constructor (options) {
        super();

        this._proto = null;
    }

    setProto(proto) {
        this._proto = proto;
    }

    read(message) {
        // BlinkerDebug.log('this._proto.test!');
        this._proto.emit('wsRead', message);
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
        // bProto.setProto(this);
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
        }
    }

    button(name, cb) {
        if (name in Buttons) {
            return
        }
        else {
            var data = [BLINKER_CMD_BUTTON_RELEASED, cb];
            // Buttons[name] = BLINKER_CMD_BUTTON_RELEASED;
            // Buttons[name] = cb;
            Buttons[name] = data;

            BlinkerDebug.log('Buttons[name][0]: ', Buttons[name][0]);
            bProto.on(name, Buttons[name][1]);
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

// LinuxWS.init();
// LinuxWS.setDebug('BLINKER_DEBUG_ALL');

// LinuxWS.on('wsRead', function(message) {
//     // BlinkerDebug.log('wsRead received1: ', message);
//     parse(message);
// });

function parse(msg) {
    data = JSON.parse(msg);

    BlinkerDebug.log('parse data: ', msg);

    for(var key in data){  
        if(key == 'ButtonKey') {
            var value = data[key];
            BlinkerDebug.log(value);
            if (value != BLINKER_CMD_BUTTON_RELEASED) {
                bProto.emit(key, value);
            }
        }
    }

    // if (data['ButtonKey']) {
    //     BlinkerDebug.log('have key');
    // }
    // else {
    //     BlinkerDebug.log('no key');
    // }

    // if ('ButtonKey' in data) {
    //     BlinkerDebug.log('have key');
    // }
    // else {
    //     BlinkerDebug.log('no key');
    // }
}

// function wInit(name, wType) {
//     if (wType == 'W_BUTTON') {
//         if (name in Buttons) {
//             return
//         }
//         else {
//             Buttons[name] = BLINKER_CMD_BUTTON_RELEASED;
//         }
//     }
// }

// function button(name) {
//     if (!(name in Buttons)) {
//         wInit(name, 'W_BUTTON');
//     }

//     if (Buttons[name] == BLINKER_CMD_BUTTON_RELEASED) {
//         return false;
//     }
//     else {
//         if (Buttons[name] == BLINKER_CMD_BUTTON_TAP) {
//             Buttons[name] = BLINKER_CMD_BUTTON_RELEASED;
//         }
//         return true; 
//     }
// }
