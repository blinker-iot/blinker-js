const blinker = require('/usr/lib/node_modules/blinker');
const Blinker = new blinker('BLINKER_WIFI');

Blinker.setDebug('BLINKER_DEBUG_ALL');
Blinker.begin();

Blinker.toggle('ToggleKey', toggle1);
Blinker.read(read1);

function toggle1(msg) {
    Blinker.log('Toggle read! ', msg);
}

function read1(msg) {
    Blinker.log('Blinker read! ', msg);
    var conCMD = {};
    conCMD['millis'] = Blinker.millis();
    Blinker.print(JSON.stringify(conCMD));
}
