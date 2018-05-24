const blinker = require('/usr/lib/node_modules/blinker');
const Blinker = new blinker('BLINKER_WIFI');

Blinker.begin();

Blinker.button('ButtonKey', button1);
Blinker.read(read1);

function button1(msg) {
    Blinker.log('Button pressed! ', msg);

    Blinker.notify("!Button pressed!");
}

function read1(msg) {
    Blinker.log('Blinker read! ', msg);
    var conCMD = {};
    conCMD['millis'] = Blinker.millis();
    Blinker.print(JSON.stringify(conCMD));
    Blinker.vibrate();
}