const blinker = require('/usr/lib/node_modules/blinker');
const Blinker = new blinker('BLINKER_WIFI');

Blinker.begin();

Blinker.rgb('RGBKey', rgb1);
Blinker.read(read1);

function rgb1(msg) {
    Blinker.log('RGB read! ', msg);
    Blinker.log('R read! ', msg[0].toString());
    Blinker.log('G read! ', msg[1].toString());
    Blinker.log('B read! ', msg[2].toString());
}

function read1(msg) {
    Blinker.log('Blinker read! ', msg);
    var conCMD = {};
    conCMD['millis'] = Blinker.millis();
    Blinker.print(JSON.stringify(conCMD));
    Blinker.vibrate();
}
