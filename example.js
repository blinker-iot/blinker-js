const BlinkerDebug = require('./BlinkerDebug');
const blinker = require('./Blinker');

const Blinker = new blinker();

Blinker.setDebug('BLINKER_DEBUG_ALL');
Blinker.begin();
// Blinker.button('ButtonKey', (cb) => {BlinkerDebug.log('Button pressed!')});
Blinker.button('ButtonKey', button1);
Blinker.slider('SliderKey', slider1);
Blinker.toggle('ToggleKey', toggle1);
Blinker.rgb('RGBKey', rgb1);
Blinker.joystick(joy1);

function button1(msg) {
    BlinkerDebug.log('Button pressed! ', msg);
}

function slider1(msg) {
    BlinkerDebug.log('Slider read! ', msg);
}

function toggle1(msg) {
    BlinkerDebug.log('Toggle read! ', msg);
}

function rgb1(msg) {
    BlinkerDebug.log('RGB read! ', msg);
    BlinkerDebug.log('R read! ', msg[0].toString());
    BlinkerDebug.log('G read! ', msg[1].toString());
    BlinkerDebug.log('B read! ', msg[2].toString());
}

function joy1(msg) {
    BlinkerDebug.log('Joystick read! ', msg);
    BlinkerDebug.log('X read! ', msg[0].toString());
    BlinkerDebug.log('Y read! ', msg[1].toString());
}