const BlinkerDebug = require('./BlinkerDebug');
const blinker = require('./Blinker');

const Blinker = new blinker();

Blinker.setDebug('BLINKER_DEBUG_ALL');
Blinker.begin();
// Blinker.button('ButtonKey', (cb) => {BlinkerDebug.log('Button pressed!')});
Blinker.button('ButtonKey', button1);

function button1(msg) {
    BlinkerDebug.log('Button pressed! ', msg);
}