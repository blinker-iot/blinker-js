const blinker = require('/usr/lib/node_modules/blinker');
const Blinker = new blinker('BLINKER_WIFI');

Blinker.begin();

Blinker.button('ButtonKey', button1);
Blinker.read(read1);

function button1(msg) {
    Blinker.log('Button pressed! ', msg);
    Blinker.gps(gps1);
}

function gps1(msg) {
    Blinker.log('GPS read! ', msg);
    Blinker.log('LAT read! ', msg[0].toString());
    Blinker.log('LANG read! ', msg[1].toString());
}

function read1(msg) {
    Blinker.log('Blinker read! ', msg);
    var conCMD = {};
    conCMD['millis'] = Blinker.millis();
    Blinker.print(JSON.stringify(conCMD));
    Blinker.vibrate();
}
