var mdns = require('/usr/lib/node_modules/mdns-js');

console.log('should advertise a http service on port 9876');
var service = mdns.createAdvertisement(mdns.tcp('_http'), 9876, {
    name:'hello',
    txt:{
        txtvers:'1'
    }
});
service.start();