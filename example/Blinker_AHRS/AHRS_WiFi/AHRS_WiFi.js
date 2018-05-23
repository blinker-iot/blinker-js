const blinker = require('/usr/lib/node_modules/blinker');
const Blinker = new blinker('BLINKER_WIFI');

Blinker.setDebug('BLINKER_DEBUG_ALL');
Blinker.begin();

Blinker.button('ButtonKey', button1);
Blinker.read(read1);
Blinker.ahrs(ahrs1);

function button1(msg) {
    Blinker.log('Button pressed! ', msg);

    if (msg == 'press') {
        Blinker.attachAhrs();
    }
    else {
        Blinker.detachAhrs();
    }
}

function ahrs1(msg) {
    Blinker.log('AHRS read! ', msg);
    Blinker.log('YAW read! ', msg[0].toString());
    Blinker.log('PITCH read! ', msg[1].toString());
    Blinker.log('ROLL read! ', msg[2].toString());
}

function read1(msg) {
    Blinker.log('Blinker read! ', msg);
    var conCMD = {};
    conCMD['millis'] = Blinker.millis();
    Blinker.print(JSON.stringify(conCMD));
}
