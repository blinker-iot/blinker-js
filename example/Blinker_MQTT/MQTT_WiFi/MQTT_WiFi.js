const blinker = require('/usr/lib/node_modules/blinker');
const Blinker = new blinker('BLINKER_MQTT');

Blinker.begin('Your AuthKey');

Blinker.button('ButtonKey', button1);
Blinker.read(read1);

function button1(msg) {
    if (msg == 'tap') {
        Blinker.log('Button tap!');
    }
    else if (msg == 'press') {
        Blinker.log('Button pressed!');
    }
    else if (msg == 'pressup') {
        Blinker.log('Button release!');
    }
}

function read1(msg) {
    Blinker.log('Blinker read! ', msg);
    var conCMD = {};
    conCMD['millis'] = Blinker.millis();

    Blinker.beginFormat();
    Blinker.print(JSON.stringify(conCMD));
    Blinker.vibrate();
    Blinker.endFormat();
}