import { BlinkerDevice } from '../lib/blinker';
import { ButtonWidget, TextWidget, RangeWidget, NumberWidget, RGBWidget, JoystickWidget, ChartWidget, ImageWidget } from '../lib/widget';

let device = new BlinkerDevice('89dca2b5e3b5');

// 注册组件
let button: ButtonWidget = device.addWidget(new ButtonWidget('btn-crf'));
let chart1: ChartWidget = device.addWidget(new JoystickWidget('cha-t12'));


device.ready().then(() => {

    device.dataRead.subscribe(message => {
        console.log('otherData:', message);
    })

    button.listen().subscribe(message => {
        console.log('button1:', message.data);
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