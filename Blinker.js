const BlinkerLinuxWS = require('./BlinkerLinuxWS');
const BlinkerDebug = require('./BlinkerDebug');

const LinuxWS = new BlinkerLinuxWS(null);
// const LinuxWS = new BlinkerLinuxWS({type:'DiyLinux'});

LinuxWS.init();
LinuxWS.setDebug('BLINKER_DEBUG_ALL');

// LinuxWS.on('wsRead', function(message) {
//     BlinkerDebug.log('wsRead received: ', message);
//     parse(message);
// });

function parse(msg) {
    data = JSON.parse(body);

    BlinkerDebug.log('parse data: ', data);
}