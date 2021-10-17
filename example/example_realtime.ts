import { BlinkerDevice } from '../lib/blinker';

let device = new BlinkerDevice(/*您申请到的Secret Key*/);

device.ready().then(() => {

    device.dataRead.subscribe(message => {
        console.log('otherData:', message);
    })

    device.realtimeRequest.subscribe(keys => {
        console.log('realtimeRequest', keys);
        keys.forEach(key => {
            switch (key) {
                case 'humi':
                    device.sendRtData('humi', randomNumber)
                    break;
                case 'temp':
                    device.sendRtData('temp', randomNumber)
                    break;
                default:
                    break;
            }
        });
    })
})




/*
以下为测试用函数
*/
// 随机数
function randomNumber(min = 0, max = 100) {
    let random = Math.random()
    return Math.floor((min + (max - min) * random))
}