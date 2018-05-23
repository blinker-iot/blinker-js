// // import the module
// var mdns = require('/usr/lib/node_modules/mdns');

// var txt_record = {
//   divceType: 'DiyArduino'
// };

// // var name = {
// //   name: 'test'
// // };

// // advertise a http server on port 4321
// var ad = mdns.createAdvertisement(mdns.tcp('DiyArduino'), 81, {
//   txtRecord: txt_record,
//   name: 'somehost'
// });
// ad.start();

// TODO, I can't modify this codes, if you can fix, please PR! Thanks!


// Use python to create MDNS advertise
// var exec = require('child_process').exec;
// var arg1 = 'DiyArduino'
// var arg2 = 'jzhou'
// exec('sudo python3 mdns_service.py ' + arg1 + ' ',function(error,stdout,stderr){
//     if(stdout.length >1){
//         console.log('you offer args:',stdout);
//     } else {
//         console.log('you don\'t offer args');
//     }
//     if(error) {
//         console.info('stderr : '+stderr);
//     }
// });

// console.log('test start!');

// var mdns = require('/usr/lib/node_modules/mdns-js');

// console.log('should advertise a http service on port 9876');
// var service = mdns.createAdvertisement(mdns.tcp('_http'), 9876, {
//     name:'hello',
//     txt:{
//         txtvers:'1'
//     }
// });
// service.start();

// require('/usr/lib/node_modules/getmac').getMac(function(err, macAddress){
//     if (err)  throw err
//     console.log(macAddress)
// })

// require('/usr/lib/node_modules/getmac').getMac({iface: 'wlan0'}, function(err, macAddress){
//     if (err)  throw err
//     console.log(macAddress)
// })