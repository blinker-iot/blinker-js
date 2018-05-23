const blinker = require('/usr/lib/node_modules/blinker');
const Blinker = new blinker('BLINKER_WIFI');

Blinker.setDebug('BLINKER_DEBUG_ALL');
Blinker.begin();

Blinker.joystick(joy1);
Blinker.read(read1);

function joy1(msg) {
    Blinker.log('Joystick read! ', msg);
    Blinker.log('X read! ', msg[0].toString());
    Blinker.log('Y read! ', msg[1].toString());
}

function read1(msg) {
    Blinker.log('Blinker read! ', msg);
    var conCMD = {};
    conCMD['millis'] = Blinker.millis();
    Blinker.print(JSON.stringify(conCMD));
}
