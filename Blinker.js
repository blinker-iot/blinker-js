const BlinkerLinuxWS = require('./BlinkerLinuxWS');
const BlinkerDebug = require('./BlinkerDebug');

const LinuxWS = new BlinkerLinuxWS(null);
// const LinuxWS = new BlinkerLinuxWS({type:'DiyLinux'});

LinuxWS.init();
LinuxWS.setDebug('BLINKER_DEBUG_ALL');
// LinuxWS.addListener('wsRead', parse);
// LinuxWS.on('wsRead', function(message) {
//     BlinkerDebug.log('wsRead received: ', message);
//     parse(message);
// });
// LinuxWS.emit('wsRead', '123456789')

function parse(msg) {
    data = JSON.parse(msg);

    BlinkerDebug.log('parse data: ', data);
}